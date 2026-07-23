#!/usr/bin/env tsx
/**
 * Live Playwright capture of a Tell Proof scenario matrix.
 *
 * Env:
 *   TELL_MATRIX_URL           base URL to capture (required, or TELL_PREVIEW_URL / TELL_FIXTURE_URL)
 *   TELL_MATRIX_ROUTES        comma-separated routes (default: /,/pricing,/account)
 *   TELL_MATRIX_PLAN          "live" (default, compact) | "full" (defaultScenarioPlan)
 *   TELL_AUTH_STORAGE_STATE   Playwright storage state for authenticated cells
 *                             (default: fixtures/generic-app/auth-storage.json when present)
 *   TELL_MATRIX_OUT           output JSON path (default: tell-scenario-matrix-live.json)
 *   TELL_MATRIX_COMPARE       if "1", also self-compare via compareProofMatrices and write summary
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  captureScenarioMatrix,
  compareProofMatrices,
  defaultScenarioPlan,
  liveScenarioPlan,
} from "@tell/core";
import { ScenarioMatrix } from "@tell/schema";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

function resolveRepoPath(p: string): string {
  if (isAbsolute(p)) return p;
  const fromCwd = resolve(process.cwd(), p);
  if (existsSync(fromCwd)) return fromCwd;
  return join(repoRoot, p);
}

function parseRoutes(raw: string | undefined): string[] {
  const list = (raw ?? "/,/pricing,/account")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((r) => (r.startsWith("/") ? r : `/${r}`));
  return [...new Set(list.length ? list : ["/"])];
}

async function main(): Promise<void> {
  const baseUrl =
    process.env.TELL_MATRIX_URL?.trim() ||
    process.env.TELL_PREVIEW_URL?.trim() ||
    process.env.TELL_FIXTURE_URL?.trim() ||
    "";
  if (!baseUrl) {
    throw new Error(
      "Set TELL_MATRIX_URL (or TELL_PREVIEW_URL / TELL_FIXTURE_URL) to the running app base URL.",
    );
  }

  const routes = parseRoutes(process.env.TELL_MATRIX_ROUTES);
  const planMode = (process.env.TELL_MATRIX_PLAN ?? "live").toLowerCase();
  const scenarios = planMode === "full" ? defaultScenarioPlan(routes) : liveScenarioPlan(routes);

  const defaultAuth = resolveRepoPath("fixtures/generic-app/auth-storage.json");
  const storageState =
    process.env.TELL_AUTH_STORAGE_STATE?.trim() ||
    (existsSync(defaultAuth) ? defaultAuth : undefined);

  console.log(
    `Capturing ${scenarios.length} scenario cell(s) against ${baseUrl}` +
      (storageState ? ` (auth state: ${storageState})` : " (no auth storage state)"),
  );

  const matrix = await captureScenarioMatrix(baseUrl, scenarios, {
    storageState,
    routes,
    livePlan: planMode !== "full",
  });

  const outPath = resolveRepoPath(process.env.TELL_MATRIX_OUT ?? "tell-scenario-matrix-live.json");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(matrix, null, 2)}\n`);
  console.log(`Wrote ScenarioMatrix → ${outPath}`);
  console.log(
    `Cells: ${matrix.cells.map((c) => c.scenario.id).join(", ")}`,
  );

  if (process.env.TELL_MATRIX_COMPARE === "1") {
    const parsed = ScenarioMatrix.parse(matrix);
    const result = compareProofMatrices(parsed, parsed);
    const comparePath = resolveRepoPath(
      process.env.TELL_PROOF_MATRIX_PATH ?? "tell-proof-matrix.json",
    );
    writeFileSync(comparePath, `${JSON.stringify(result, null, 2)}\n`);
    console.log(`Self-compare status=${result.status} matched=${result.matchedCells} → ${comparePath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
