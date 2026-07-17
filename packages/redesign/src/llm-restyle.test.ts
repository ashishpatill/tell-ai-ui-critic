import { describe, expect, it, vi } from "vitest";
import type { CapturePayload, DesignFingerprint } from "@tell/schema";
import {
  buildPageBrief,
  restyleWithGemini,
  sanitizeLlmSelectors,
  validateLlmSheet,
} from "./llm-restyle";

function makeCapture(overrides?: Partial<CapturePayload>): CapturePayload {
  return {
    url: "https://example.com",
    capturedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 1100 },
    screenshotBase64: "",
    snapshotHtml: "",
    cssVariables: [{ name: "--accent", value: "#8b5cf6" }],
    surfaceTokens: {
      bodyBg: "rgb(15, 15, 15)",
      bodyText: "rgb(244, 244, 245)",
      bodyFont: "Inter",
      headingFont: "Inter",
      accent: "rgb(139, 92, 246)",
      accentSources: ["rgb(139, 92, 246)"],
      radius: "8px",
      shadow: "rgba(0, 0, 0, 0.35) 0px 10px 25px 0px",
    },
    styles: [
      {
        selector: "body", tellId: "t0", tag: "body", role: "body",
        rect: { x: 0, y: 0, w: 1440, h: 1477 },
        fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", fontWeight: "400",
        color: "rgb(244, 244, 245)", backgroundColor: "rgb(15, 15, 15)",
        borderRadius: "0px", boxShadow: "none", padding: "0px", textAlign: "start",
        lineHeight: "normal", backgroundImage: "none",
      },
      {
        selector: "h1", tellId: "t1", tag: "h1", role: "display",
        rect: { x: 40, y: 40, w: 800, h: 120 },
        fontFamily: "Inter, system-ui, sans-serif", fontSize: "48px", fontWeight: "700",
        color: "rgb(244, 244, 245)", backgroundColor: "rgba(0,0,0,0)",
        borderRadius: "0px", boxShadow: "none", padding: "0px", textAlign: "start",
        lineHeight: "1.1", backgroundImage: "none",
      },
      {
        selector: "button", tellId: "t2", tag: "button", role: "button",
        rect: { x: 40, y: 200, w: 140, h: 44 },
        fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", fontWeight: "600",
        color: "rgb(255,255,255)", backgroundColor: "rgb(139, 92, 246)",
        borderRadius: "8px", boxShadow: "none", padding: "12px 20px", textAlign: "center",
        lineHeight: "normal", backgroundImage: "none",
      },
    ],
    probes: [],
    stateShots: [],
    viewportMatrix: [],
    domSummary: { headingCount: 3, buttonCount: 1, centeredBlockRatio: 0.2, emojiInUiCount: 0 },
    ...overrides,
  };
}

function makeFingerprint(overrides?: Partial<DesignFingerprint>): DesignFingerprint {
  return {
    url: "https://example.com",
    generatedAt: new Date().toISOString(),
    fontFamilies: [{ family: "Inter", count: 20, roles: ["body", "display"] }],
    colors: [{ value: "rgb(139, 92, 246)", count: 5, normalizedHex: "#8b5cf6" }],
    shadows: [],
    radii: [{ value: "8px", count: 4 }],
    spacingValues: [{ value: "16px", count: 8 }],
    typeScale: [{ size: "16px", count: 10, roles: ["body"] }],
    centeredBlockRatio: 0.2,
    emojiInUiCount: 0,
    gradientDetected: false,
    gradientSamples: [],
    nearDuplicateGrays: [],
    focusRingCoverage: 0.5,
    stateCoverage: { hover: 0.5, focus: 0.5, disabled: 0.5 },
    ...overrides,
  };
}

const GOOD_SHEET = [
  `@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600&display=swap');`,
  `:root { --tell-accent: #b95a31 !important; }`,
  `body { background-color: #f4eee3 !important; color: #17140f !important; }`,
  `[data-tell-id="t1"] { font-family: Fraunces, serif !important; font-size: 64px !important; }`,
  `[data-tell-id="t2"] { border-radius: 10px !important; background-color: #b95a31 !important; color: #ffffff !important; }`,
  `button::before { content: "" !important; }`,
  `::selection { background-color: #b95a31 !important; color: #ffffff !important; }`,
].join("\n");

describe("buildPageBrief", () => {
  it("includes tellIds, tokens, and viewport, capped near 12KB", () => {
    const brief = buildPageBrief(makeCapture(), makeFingerprint());
    expect(brief).toContain("#t0");
    expect(brief).toContain("#t1");
    expect(brief).toContain("#t2");
    expect(brief).toContain("Viewport: 1440x1100");
    expect(brief).toContain("Surface tokens:");
    expect(Buffer.byteLength(brief, "utf8")).toBeLessThanOrEqual(12_000 + 200); // small slack for header overhead
  });

  it("caps brief size even with many sampled elements", () => {
    const manyStyles = Array.from({ length: 500 }, (_, i) => ({
      selector: `div.item-${i}`, tellId: `t${i + 10}`, tag: "div", role: "other" as const,
      rect: { x: 0, y: i * 10, w: 200, h: 40 },
      fontFamily: "Inter, system-ui, sans-serif", fontSize: "14px", fontWeight: "400",
      color: "rgb(0,0,0)", backgroundColor: "rgb(255,255,255)",
      borderRadius: "0px", boxShadow: "none", padding: "8px", textAlign: "start",
      lineHeight: "normal", backgroundImage: "none",
    }));
    const capture = makeCapture({ styles: manyStyles });
    const brief = buildPageBrief(capture, makeFingerprint());
    expect(Buffer.byteLength(brief, "utf8")).toBeLessThanOrEqual(12_000 + 200);
    expect(brief).toContain("truncated");
  });
});

describe("validateLlmSheet", () => {
  it("accepts a well-formed sheet", () => {
    const result = validateLlmSheet(GOOD_SHEET, makeCapture());
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("accepts @import urls with semicolons in Google Fonts family specs", () => {
    const sheet = [
      `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:ital,wght@0,400;0,700&display=swap');`,
      `body { background-color: #f4eee3 !important; color: #17140f !important; }`,
      `[data-tell-id="t1"] { font-size: 64px !important; }`,
    ].join("\n");
    const result = validateLlmSheet(sheet, makeCapture());
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("sanitizeLlmSelectors strips non-tell-id attribute selectors", () => {
    const raw = GOOD_SHEET + `\na[role="button"] { color: #17140f !important; }`;
    const sanitized = sanitizeLlmSelectors(raw);
    expect(sanitized).toContain("a { color:");
    expect(validateLlmSheet(sanitized, makeCapture()).ok).toBe(true);
  });

  it("accepts simple descendant tag chains", () => {
    const sheet = GOOD_SHEET + `\nnav a { color: #17140f !important; }\nnav a:hover { color: #b95a31 !important; }`;
    const result = validateLlmSheet(sheet, makeCapture());
    expect(result.violations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("rejects a selector referencing an unknown tell-id", () => {
    const bad = GOOD_SHEET + `\n[data-tell-id="t999"] { color: #000 !important; }`;
    const result = validateLlmSheet(bad, makeCapture());
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("t999"))).toBe(true);
  });

  it("rejects display:none", () => {
    const bad = GOOD_SHEET.replace(
      `button::before { content: "" !important; }`,
      `button::before { content: "" !important; display: none !important; }`,
    );
    const result = validateLlmSheet(bad, makeCapture());
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("display:none"))).toBe(true);
  });

  it("rejects a sheet where declarations are missing !important", () => {
    const bad = [
      `@import url('https://fonts.googleapis.com/css2?family=Fraunces&display=swap');`,
      `body { background-color: #f4eee3; color: #17140f; }`,
      `[data-tell-id="t1"] { font-size: 64px; }`,
    ].join("\n");
    const result = validateLlmSheet(bad, makeCapture());
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("!important"))).toBe(true);
  });

  it("rejects an oversized sheet", () => {
    const filler = Array.from({ length: 4000 }, () => `[data-tell-id="t1"] { color: #17140f !important; }`).join("\n");
    const bad = GOOD_SHEET + "\n" + filler;
    const result = validateLlmSheet(bad, makeCapture());
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.includes("byte cap"))).toBe(true);
  });

  it("flags a root-level contrast failure below 4.5:1", () => {
    const bad = [
      `@import url('https://fonts.googleapis.com/css2?family=Fraunces&display=swap');`,
      `body { background-color: #888888 !important; color: #999999 !important; }`,
    ].join("\n");
    const result = validateLlmSheet(bad, makeCapture());
    expect(result.ok).toBe(false);
    expect(result.violations.some((v) => v.toLowerCase().includes("contrast"))).toBe(true);
  });
});

describe("restyleWithGemini", () => {
  it("returns ok:true with a validated sheet on a successful, well-formed API response", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: JSON.stringify({ css: GOOD_SHEET, notes: ["Warmed the palette.", "Recomposed the hero."] }) }] } },
          ],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;

    const result = await restyleWithGemini(makeCapture(), makeFingerprint(), "editorial", undefined, {
      apiKey: "test-key",
      fetchImpl,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.fontImport).toContain("fonts.googleapis.com");
      expect(result.css).not.toContain("@import");
      expect(result.notes.length).toBeGreaterThan(0);
    }
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns ok:false when the API call fails, without throwing", async () => {
    const fetchImpl = vi.fn(async () => new Response("server error", { status: 500 })) as unknown as typeof fetch;

    const result = await restyleWithGemini(makeCapture(), makeFingerprint(), "editorial", undefined, {
      apiKey: "test-key",
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("500");
  });

  it("returns ok:false when no api key is provided", async () => {
    const result = await restyleWithGemini(makeCapture(), makeFingerprint(), "editorial");
    expect(result.ok).toBe(false);
  });

  it("returns ok:false when the model's sheet fails validation (e.g. unknown tell-id)", async () => {
    const invalidCss = GOOD_SHEET + `\n[data-tell-id="t999"] { color: #000 !important; }`;
    const fetchImpl = vi.fn(async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ css: invalidCss, notes: [] }) }] } }],
        }),
        { status: 200 },
      ),
    ) as unknown as typeof fetch;

    const result = await restyleWithGemini(makeCapture(), makeFingerprint(), "editorial", undefined, {
      apiKey: "test-key",
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain("validation failed");
  });
});
