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

describe("ResponsiveViewportDrift baseline", () => {
  const tiny =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  function style(i: number) {
    return {
      selector: `p.${i}`,
      tellId: `t${i}`,
      tag: "p",
      role: "body" as const,
      rect: { x: 0, y: 0, w: 100, h: 20 },
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      fontWeight: "400",
      color: "rgb(40,40,40)",
      backgroundColor: "rgb(250,250,250)",
      borderRadius: "0px",
      boxShadow: "none",
      padding: "16px",
      textAlign: "left",
      lineHeight: "1.5",
      backgroundImage: "none",
    };
  }

  it("uses desktop matrix entry as baseline when primary capture is mobile", () => {
    const capture = CapturePayload.parse({
      url: "http://localhost:3001/",
      capturedAt: "2026-07-19T00:00:00.000Z",
      viewport: { width: 390, height: 844 },
      screenshotBase64: tiny,
      styles: Array.from({ length: 10 }, (_, i) => style(i)),
      probes: [],
      // Collapsed mobile primary
      domSummary: { headingCount: 1, buttonCount: 1, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
      viewportMatrix: [
        {
          preset: "desktop",
          width: 1440,
          height: 1100,
          screenshotBase64: tiny,
          domSummary: { headingCount: 8, buttonCount: 6, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
        },
        {
          preset: "tablet",
          width: 768,
          height: 1024,
          screenshotBase64: tiny,
          domSummary: { headingCount: 7, buttonCount: 5, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
        },
      ],
    });
    const detectors = detectFindings(buildFingerprint(capture), capture).map((f) => f.detector);
    expect(detectors).toContain("ResponsiveViewportDrift");
    const finding = detectFindings(buildFingerprint(capture), capture).find(
      (f) => f.detector === "ResponsiveViewportDrift",
    );
    expect(finding?.facts.desktopHeadings).toBe(8);
    expect(finding?.facts.desktopButtons).toBe(6);
  });
});
