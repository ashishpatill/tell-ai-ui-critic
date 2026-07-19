#!/usr/bin/env tsx
/**
 * Smoke / CI compare for Tell Proof scenario matrices.
 *
 * Env:
 *   TELL_BEFORE_MATRIX  path to before ScenarioMatrix JSON
 *                       (default: fixtures/corpus/scenario-matrix.json)
 *   TELL_AFTER_MATRIX   path to after ScenarioMatrix JSON (default: same as before)
 *   TELL_FAIL_ON        comma list of statuses that fail the job (default: failed)
 *   TELL_PROOF_MATRIX_PATH  output JSON path (default: tell-proof-matrix.json)
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compareProofMatrices } from "@tell/core";
import { ScenarioMatrix } from "@tell/schema";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

function resolveRepoPath(p: string): string {
  if (isAbsolute(p)) return p;
  const fromCwd = resolve(process.cwd(), p);
  if (existsSync(fromCwd)) return fromCwd;
  return join(repoRoot, p);
}

function loadMatrix(path: string): ScenarioMatrix {
  return ScenarioMatrix.parse(JSON.parse(readFileSync(resolveRepoPath(path), "utf8")));
}

async function main(): Promise<void> {
  const beforePath = process.env.TELL_BEFORE_MATRIX ?? "fixtures/corpus/scenario-matrix.json";
  const afterPath = process.env.TELL_AFTER_MATRIX ?? beforePath;
  const failOn = new Set(
    (process.env.TELL_FAIL_ON ?? "failed")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const before = loadMatrix(beforePath);
  const after = loadMatrix(afterPath);
  const result = compareProofMatrices(before, after);

  const outPath = resolveRepoPath(process.env.TELL_PROOF_MATRIX_PATH ?? "tell-proof-matrix.json");
  writeFileSync(outPath, JSON.stringify(result, null, 2));

  const cellLines = result.cells
    .slice(0, 12)
    .map(
      (c) =>
        `| \`${c.scenarioId}\` | \`${c.status}\` | ${c.scoreDelta} | ${c.focusRegressed ? "yes" : "no"} | ${c.structureRegressed ? "yes" : "no"} |`,
    );

  const lines = [
    "## Tell Proof — scenario matrix",
    "",
    `**Status:** \`${result.status}\``,
    `**Matched cells:** ${result.matchedCells}`,
    `**Skipped cells:** ${result.skippedCells}`,
    "",
    "| Scenario | Status | Δ score | Focus regress | Structure regress |",
    "|---|---|---:|:---:|:---:|",
    ...cellLines,
    result.cells.length > 12 ? `| … | ${result.cells.length - 12} more | | | |` : "",
    "",
  ].filter(Boolean);

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, `${lines.join("\n")}\n`);
  }

  console.log(lines.join("\n"));
  console.log(`Wrote ${outPath}`);

  if (failOn.has(result.status)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
