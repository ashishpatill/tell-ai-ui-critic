import { describe, expect, it } from "vitest";
import { buildFingerprint } from "../fingerprint/build-fingerprint";
import { detectDesignSystemDrift, parseDesignDoc } from "./design-system-drift";
import { CapturePayload } from "@tell/schema";

describe("parseDesignDoc", () => {
  it("extracts fonts and colors from DESIGN.md", () => {
    const spec = parseDesignDoc(`
# Design
- font-family display: "Instrument Serif"
- accent: #D4714A
- background: #181614
`);
    expect(spec.fonts).toContain("Instrument Serif");
    expect(spec.colors).toContain("#D4714A");
    expect(spec.colors).toContain("#181614");
  });
});

describe("detectDesignSystemDrift", () => {
  const capture = CapturePayload.parse({
    url: "http://localhost:3000",
    capturedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 1100 },
    screenshotBase64: "a",
    styles: [{
      selector: "button", tellId: "t0", tag: "button", role: "button",
      fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: "400",
      color: "rgb(255,0,0)", backgroundColor: "rgb(0,0,0)", borderRadius: "8px",
      boxShadow: "none", padding: "8px", textAlign: "left", lineHeight: "1.5", backgroundImage: "none",
    }],
    probes: [],
    domSummary: { headingCount: 1, buttonCount: 1, centeredBlockRatio: 0.1, emojiInUiCount: 0 },
  });

  it("flags undeclared fonts and off-palette colors", () => {
    const fp = buildFingerprint(capture);
    const finding = detectDesignSystemDrift(fp, {
      fonts: ["Instrument Serif"],
      colors: ["#D4714A"],
      source: "DESIGN.md",
    });
    expect(finding?.detector).toBe("DesignSystemDrift");
    expect(finding?.facts.undeclaredFonts).toContain("Inter");
  });

  it("ignores fully transparent rgba colors", () => {
    const transparentCapture = CapturePayload.parse({
      ...capture,
      styles: [{
        ...capture.styles[0]!,
        fontFamily: '"Instrument Serif", serif',
        color: "rgb(243, 237, 228)",
        backgroundColor: "rgba(0, 0, 0, 0)",
      }],
    });
    const fp = buildFingerprint(transparentCapture);
    const finding = detectDesignSystemDrift(fp, {
      fonts: ["Instrument Serif"],
      colors: ["#F3EDE4", "#181614"],
      source: "DESIGN.md",
    });
    expect(finding).toBeNull();
  });
});
