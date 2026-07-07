import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { CapturePayload } from "@tell/schema";
import { buildFingerprint } from "../fingerprint/build-fingerprint";
import { detectFindings } from "../detectors";

// Golden/regression test: the committed capture must yield a stable, known set
// of findings. Update the expectations deliberately when detectors change.
const capture = CapturePayload.parse(
  JSON.parse(readFileSync(join(process.cwd(), "fixtures/reports/capture.json"), "utf8")),
);

describe("deterministic detectors on the committed fixture", () => {
  const fingerprint = buildFingerprint(capture);
  const findings = detectFindings(fingerprint, capture);

  it("fingerprints the fixture's core visual facts", () => {
    expect(fingerprint.fontFamilies.length).toBeGreaterThan(0);
    expect(fingerprint.gradientDetected).toBe(true);
    expect(fingerprint.centeredBlockRatio).toBeGreaterThan(0.7);
    expect(fingerprint.nearDuplicateGrays.length).toBeGreaterThan(0);
  });

  it("produces the golden set of detectors", () => {
    const detectors = findings.map((f) => f.detector).sort();
    expect(detectors).toEqual([
      "AcidAccentTell",
      "CenteredEverythingTell",
      "EmojiChromeTell",
      "FocusRingInconsistency",
      "GradientCrutchTell",
      "GrayMushTell",
      "NearDuplicateValues",
      "RadiusMonotoneTell",
      "ShadowEverywhereTell",
      "SpacingChaos",
      "StateGap",
      "SystemFontTell",
      "TokenBypass",
      "TypeScaleDrift",
    ]);
  });

  it("grounds each finding with deterministic facts and evidence", () => {
    for (const f of findings) {
      expect(f.facts).toBeTypeOf("object");
      expect(f.evidence.length).toBeGreaterThan(0);
    }
  });

  it("flags the violet-on-near-black accent (AcidAccentTell)", () => {
    const acid = findings.find((f) => f.detector === "AcidAccentTell");
    expect(acid?.facts.accent).toBe("#8B5CF6");
  });
});
