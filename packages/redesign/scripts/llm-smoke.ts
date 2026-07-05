// One-off smoke test for the LLM restyle path — calls the REAL Gemini API using the key in
// ../../.env (repo root). Run manually: `pnpm --filter @tell/redesign smoke:llm`.
// Not part of the automated test suite (no live API calls in vitest).

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TellReport } from "@tell/schema";
import { restyleWithGemini } from "../src/llm-restyle";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

async function loadEnvKey(name: string): Promise<string | undefined> {
  try {
    const raw = await readFile(path.join(repoRoot, ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key === name) return value;
    }
  } catch (err) {
    console.error(`Could not read .env at ${path.join(repoRoot, ".env")}:`, err);
  }
  return undefined;
}

async function main() {
  const apiKey = await loadEnvKey("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in .env — aborting smoke test.");
    process.exitCode = 1;
    return;
  }

  const reportPath = path.join(repoRoot, "fixtures/reports/tell-report.json");
  const raw = await readFile(reportPath, "utf8");
  const report = TellReport.parse(JSON.parse(raw));

  console.log(`Loaded report for ${report.capture.url} (${report.capture.styles.length} sampled elements).`);
  console.log(`Calling Gemini for direction "editorial"...`);

  const started = Date.now();
  const result = await restyleWithGemini(report.capture, report.fingerprint, "editorial", undefined, {
    apiKey,
    model: process.env.GEMINI_RESTYLE_MODEL?.trim() || "gemini-2.5-flash",
  });
  const elapsedMs = Date.now() - started;

  console.log(`\n=== restyleWithGemini result (${elapsedMs}ms) ===`);
  console.log(`ok: ${result.ok}`);

  if (!result.ok) {
    console.log(`reason: ${result.reason}`);
    process.exitCode = 1;
    return;
  }

  const sheetBytes = Buffer.byteLength(result.css, "utf8");
  console.log(`fontImport: ${result.fontImport}`);
  console.log(`css size: ${sheetBytes} bytes`);
  console.log(`notes: ${JSON.stringify(result.notes, null, 2)}`);
  console.log(`\n--- first 60 lines of css ---`);
  console.log(result.css.split("\n").slice(0, 60).join("\n"));
}

main().catch((err) => {
  console.error("Smoke test crashed unexpectedly:", err);
  process.exitCode = 1;
});
