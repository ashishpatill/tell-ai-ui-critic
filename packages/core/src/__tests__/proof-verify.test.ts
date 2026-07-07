import { describe, expect, it } from "vitest";
import { CapturePayload, DesignFingerprint } from "@tell/schema";
import { compareProofReports } from "../proof-verify";

function axis(key: "contrast" | "typescale" | "spacing" | "depth" | "accent" | "identity", before: number, after: number) {
  return {
    key,
    label: key,
    weight: 0.15,
    before,
    after,
    beforeText: String(before),
    afterText: String(after),
    rationale: "test",
  };
}

function stubReport(
  screenshot: string,
  generic: number,
  focus: number,
  headings: number,
  buttons: number,
  styles: number,
) {
  const capture = CapturePayload.parse({
    url: "http://localhost:3000",
    capturedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 1100 },
    screenshotBase64: screenshot,
    styles: Array.from({ length: styles }, (_, i) => ({
      selector: `p.${i}`,
      tellId: `t${i}`,
      tag: "p",
      role: "body",
      rect: { x: 0, y: 0, w: 100, h: 20 },
      fontFamily: "serif",
      fontSize: "16px",
      fontWeight: "400",
      color: "rgb(0,0,0)",
      backgroundColor: "rgb(255,255,255)",
      borderRadius: "0px",
      boxShadow: "none",
      padding: "8px",
      textAlign: "left",
      lineHeight: "1.5",
      backgroundImage: "none",
    })),
    probes: [],
    domSummary: { headingCount: headings, buttonCount: buttons, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
  });
  const fingerprint = DesignFingerprint.parse({
    url: capture.url,
    generatedAt: capture.capturedAt,
    fontFamilies: [{ family: "serif", count: 1, roles: ["body"] }],
    colors: [],
    shadows: [],
    radii: [],
    spacingValues: [],
    typeScale: [],
    centeredBlockRatio: 0.2,
    emojiInUiCount: 0,
    gradientDetected: false,
    nearDuplicateGrays: [],
    focusRingCoverage: focus,
    stateCoverage: { hover: 1, focus, disabled: 1 },
  });
  return {
    capture,
    fingerprint,
    findings: [],
    verdicts: [],
    score: { total: generic, generic, drift: 0, intentional: 0, uncertain: 0 },
    measures: {
      score: generic * 12,
      band: "template" as const,
      tellScore: 0,
      scoredAgainst: "baseline" as const,
      axes: [
        axis("contrast", 0.8, 0.8),
        axis("typescale", 0.8, 0.8),
        axis("spacing", 0.8, 0.8),
        axis("depth", 0.8, 0.8),
        axis("accent", 0.8, 0.8),
        axis("identity", 0.8, 0.8),
      ],
    },
  };
}

describe("compareProofReports", () => {
  it("passes when genericness drops with a visible screenshot change", () => {
    const before = stubReport("before", 8, 0.8, 5, 4, 20);
    const after = {
      ...before,
      capture: { ...before.capture, screenshotBase64: "after", capturedAt: new Date().toISOString() },
      score: { total: 4, generic: 4, drift: 0, intentional: 0, uncertain: 0 },
      measures: before.measures ? { ...before.measures, score: 48 } : undefined,
    };
    const { status, proof } = compareProofReports(before, after, "http://localhost:3000");
    expect(status).toBe("passed");
    expect(proof.scoreDelta).toBeLessThan(0);
    expect(proof.screenshotsDiffer).toBe(true);
  });

  it("fails when focus coverage regresses", () => {
    const before = stubReport("before", 8, 0.8, 5, 4, 20);
    const after = stubReport("after", 4, 0.5, 5, 4, 20);
    const { status } = compareProofReports(before, after, "http://localhost:3000");
    expect(status).toBe("failed");
  });
});
