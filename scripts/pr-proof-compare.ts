#!/usr/bin/env tsx
/**
 * Compare two TellReport JSON files (or a live preview vs a committed baseline)
 * using the same compareProofReports verdict as /api/proof/verify mode=compare.
 *
 * Env:
 *   TELL_BEFORE_REPORT  path to before TellReport JSON (default: fixtures/reports/tell-report.json)
 *   TELL_AFTER_REPORT   path to after TellReport JSON (optional if TELL_PREVIEW_URL set)
 *   TELL_PREVIEW_URL    if set and TELL_AFTER_REPORT unset, diagnose this URL as "after"
 *   TELL_PROOF_URL      URL label recorded in proof (defaults to preview or before capture url)
 *   TELL_FAIL_ON        comma list of statuses that fail the job (default: failed)
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { captureUrl, compareProofReports, diagnoseCapture, loadDesignDoc, shouldApplyDesignDoc } from "@tell/core";
import { TellReport } from "@tell/schema";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

function resolveRepoPath(p: string): string {
  if (isAbsolute(p)) return p;
  const fromCwd = resolve(process.cwd(), p);
  if (existsSync(fromCwd)) return fromCwd;
  return join(repoRoot, p);
}

async function loadReport(path: string): Promise<TellReport> {
  return TellReport.parse(JSON.parse(readFileSync(resolveRepoPath(path), "utf8")));
}

async function main(): Promise<void> {
  const beforePath = process.env.TELL_BEFORE_REPORT ?? "fixtures/reports/tell-report.json";
  const afterPath = process.env.TELL_AFTER_REPORT;
  const previewUrl = process.env.TELL_PREVIEW_URL ?? process.env.PREVIEW_URL ?? "";
  const failOn = new Set(
    (process.env.TELL_FAIL_ON ?? "failed")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const compareSelf = process.env.TELL_COMPARE_SELF === "1" || process.env.TELL_COMPARE_SELF === "true";

  let beforeReport: TellReport;
  let afterReport: TellReport;

  if (compareSelf && previewUrl) {
    // Live smoke: diagnose the preview once and compare the report to itself.
    // Avoid scoring the generic-app fixture against an unrelated Tell web preview.
    const capture = await captureUrl(previewUrl);
    const designDoc = shouldApplyDesignDoc(previewUrl) ? await loadDesignDoc() : undefined;
    const live = diagnoseCapture(capture, undefined, designDoc);
    beforeReport = live;
    afterReport = live;
  } else {
    beforeReport = await loadReport(beforePath);
    if (afterPath) {
      afterReport = await loadReport(afterPath);
    } else if (previewUrl) {
      const capture = await captureUrl(previewUrl);
      const designDoc = shouldApplyDesignDoc(previewUrl) ? await loadDesignDoc() : undefined;
      afterReport = diagnoseCapture(capture, undefined, designDoc);
    } else {
      console.error("Set TELL_AFTER_REPORT or TELL_PREVIEW_URL for the after report.");
      process.exit(1);
    }
  }

  const url = process.env.TELL_PROOF_URL || previewUrl || afterReport.capture.url || beforeReport.capture.url;
  const { status, proof } = compareProofReports(beforeReport, afterReport, url);

  const outPath = resolveRepoPath(process.env.TELL_PROOF_REPORT_PATH ?? "tell-proof-compare.json");
  writeFileSync(outPath, JSON.stringify({ status, proof, beforeScore: proof.beforeScore, afterScore: proof.afterScore }, null, 2));

  const lines = [
    "## Tell Proof — report compare",
    "",
    `**Status:** \`${status}\``,
    `**URL:** ${url}`,
    `**Score:** ${proof.beforeScore.toFixed(1)} → ${proof.afterScore.toFixed(1)} (Δ ${proof.scoreDelta.toFixed(1)})`,
    `**Findings:** ${proof.findingsBefore} → ${proof.findingsAfter}`,
    `**Focus coverage:** ${proof.focusBefore.toFixed(2)} → ${proof.focusAfter.toFixed(2)}`,
    `**Screenshot changed:** ${proof.screenshotsDiffer ? "yes" : "no"}`,
    `**Structure regressed:** ${proof.structureRegressed ? "yes" : "no"}`,
    "",
  ];
  const markdown = lines.join("\n");
  console.log(markdown);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  }

  if (failOn.has(status)) {
    console.error(`Proof compare status "${status}" is in TELL_FAIL_ON (${[...failOn].join(", ")}).`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
