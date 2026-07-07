#!/usr/bin/env tsx
// Learn a Brand DNA from a reference page, then reconcile a target page toward it and
// confirm the scorecard flips to scoring against the DNA (not the generic baseline).
import { captureUrl, diagnoseCapture } from "../index";
import { learnBrandDNA, reconcile } from "@tell/redesign";
import { buildFingerprint } from "../fingerprint/build-fingerprint";

const referenceUrl = process.argv[2] ?? "http://localhost:3000"; // a brand you trust
const targetUrl = process.argv[3] ?? "http://localhost:3001"; // the generic page to fix

console.log(`Learning Brand DNA from reference: ${referenceUrl} …`);
const refCapture = await captureUrl(referenceUrl);
const dna = learnBrandDNA(refCapture, buildFingerprint(refCapture), referenceUrl);
console.log("Brand DNA:", JSON.stringify(dna, null, 2));

console.log(`\nCapturing target: ${targetUrl} …`);
const capture = await captureUrl(targetUrl);
const report = diagnoseCapture(capture, dna);

console.log("\n=== BASELINE (no DNA) ===");
const baseline = reconcile(capture, report.fingerprint, report.findings, "editorial");
console.log(`scoredAgainst ${baseline.scoredAgainst}  genericness ${baseline.scoreBefore} -> ${baseline.scoreAfter}  accent ${baseline.accentAfter}`);

console.log("\n=== AGAINST BRAND DNA ===");
const against = reconcile(capture, report.fingerprint, report.findings, dna.directionId, dna);
console.log(`scoredAgainst ${against.scoredAgainst}  genericness ${against.scoreBefore} -> ${against.scoreAfter}  accent ${against.accentAfter}`);
console.log(`target fonts: ${dna.displayFont} / ${dna.bodyFont}  ·  DNA accent ${dna.accent}`);
console.log(`after typeface row: ${against.rows.find((row) => row.key === "type")?.after}`);
console.log(`after accent row: ${against.rows.find((row) => row.key === "accent")?.after}`);

process.exit(0);
