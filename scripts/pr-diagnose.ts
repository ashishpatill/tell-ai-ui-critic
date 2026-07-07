#!/usr/bin/env tsx
/**
 * Diagnose a preview URL for PR checks. Writes markdown to GITHUB_STEP_SUMMARY when set.
 */
import { appendFileSync, writeFileSync } from "node:fs";
import { captureUrl, diagnoseCapture, loadDesignDoc } from "@tell/core";

const url = process.env.TELL_PREVIEW_URL ?? process.env.PREVIEW_URL ?? "";
const failGenericAbove = Number(process.env.TELL_FAIL_GENERIC_ABOVE ?? "6");
const outPath = process.env.TELL_PR_REPORT_PATH ?? "tell-pr-report.json";

if (!url) {
  console.error("Set TELL_PREVIEW_URL (or PREVIEW_URL) to a reachable preview deployment.");
  process.exit(1);
}

const capture = await captureUrl(url);
const designDoc = await loadDesignDoc();
const report = diagnoseCapture(capture, undefined, designDoc);
writeFileSync(outPath, JSON.stringify(report, null, 2));

const genericFindings = report.findings.filter((f) => {
  const verdict = report.verdicts.find((v) => v.findingId === f.id);
  return (verdict?.verdict ?? f.verdictHint) === "generic";
});

const lines = [
  "## Tell Proof — preview diagnosis",
  "",
  `**URL:** ${url}`,
  `**Findings:** ${report.score.total} total · ${report.score.generic} generic · ${report.score.drift} drift`,
  `**Score:** ${report.measures?.score ?? "n/a"}`,
  "",
  "### Generic tells",
  ...(genericFindings.length
    ? genericFindings.map((f) => `- **${f.detector}** (${f.severity})`)
    : ["- None — surface passes genericness checks."]),
  "",
];

const markdown = lines.join("\n");
console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (genericFindings.length > failGenericAbove) {
  console.error(`Generic tell count ${genericFindings.length} exceeds threshold ${failGenericAbove}.`);
  process.exit(1);
}
