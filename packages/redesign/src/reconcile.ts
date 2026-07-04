import type {
  CapturePayload,
  DesignFingerprint,
  Finding,
  Reconciliation,
  ReconTokenRow,
} from "@tell/schema";

// ── Color math (dependency-free, works in browser + node) ────────────

type Rgb = { r: number; g: number; b: number };

function parseColor(input: string): Rgb | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  const rgb = s.match(/rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)/);
  if (rgb) return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]! };
  const hex6 = s.match(/^#([0-9a-f]{6})$/);
  if (hex6) {
    const n = parseInt(hex6[1]!, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const hex3 = s.match(/^#([0-9a-f]{3})$/);
  if (hex3) {
    const h = hex3[1]!;
    return { r: parseInt(h[0]! + h[0]!, 16), g: parseInt(h[1]! + h[1]!, 16), b: parseInt(h[2]! + h[2]!, 16) };
  }
  return null;
}

function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function rgbToHsl({ r, g, b }: Rgb): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn);
  const l = (mx + mn) / 2;
  if (mx === mn) return { h: 0, s: 0, l };
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = 0;
  if (mx === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0));
  else if (mx === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

function hslHex(h: number, s: number, l: number): string {
  return toHex(hslToRgb(h, s, l));
}

function luminance(rgb: Rgb): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
}

function inkFor(hex: string): string {
  const rgb = parseColor(hex);
  if (!rgb) return "#FFFFFF";
  return luminance(rgb) > 0.42 ? "#1A1712" : "#FBF7F0";
}

function sameColor(a: string, b: string, tol = 10): boolean {
  const ca = parseColor(a), cb = parseColor(b);
  if (!ca || !cb) return a.trim().toLowerCase() === b.trim().toLowerCase();
  return Math.abs(ca.r - cb.r) <= tol && Math.abs(ca.g - cb.g) <= tol && Math.abs(ca.b - cb.b) <= tol;
}

// ── Direction strategies (intent, not fixed hexes) ───────────────────

type Direction = {
  id: string;
  label: string;
  summary: string;
  display: string;
  displayGF: string;
  body: string;
  bodyGF: string;
  headingWeight: number;
  radius: string;
  shadow: string;
  sig: { h: number; s: number; l: number }; // signature accent for generic/acid inputs
  band: { s: number; l: number };           // harmonize band for decent brand colors
  paperLight: string;
  paperDark: string;
};

export const RECONCILE_DIRECTIONS: Record<string, Direction> = {
  editorial: {
    id: "editorial",
    label: "Editorial warm",
    summary: "Serif headlines on warm paper, one considered accent, depth composed not repeated.",
    display: "Instrument Serif",
    displayGF: "Instrument+Serif:ital@0;1",
    body: "Source Sans 3",
    bodyGF: "Source+Sans+3:wght@400;500;600;700",
    headingWeight: 500,
    radius: "10px",
    shadow: "0 1px 2px rgba(23,20,15,.08), 0 18px 40px -24px rgba(23,20,15,.35)",
    sig: { h: 18, s: 0.55, l: 0.5 },
    band: { s: 0.52, l: 0.5 },
    paperLight: "#F4EEE3",
    paperDark: "#17140F",
  },
  precision: {
    id: "precision",
    label: "Precision instrument",
    summary: "Grotesk display, measured neutrals, sharp radius, zero decorative depth.",
    display: "Space Grotesk",
    displayGF: "Space+Grotesk:wght@400;500;600;700",
    body: "IBM Plex Sans",
    bodyGF: "IBM+Plex+Sans:wght@400;500;600",
    headingWeight: 600,
    radius: "4px",
    shadow: "none",
    sig: { h: 45, s: 0.48, l: 0.46 },
    band: { s: 0.42, l: 0.46 },
    paperLight: "#ECEAE4",
    paperDark: "#131311",
  },
  "warm-minimal": {
    id: "warm-minimal",
    label: "Warm minimal",
    summary: "Quiet surfaces, a single human accent, flat depth, generous type.",
    display: "Fraunces",
    displayGF: "Fraunces:opsz,wght@9..144,400;9..144,600",
    body: "Source Sans 3",
    bodyGF: "Source+Sans+3:wght@400;500;600",
    headingWeight: 500,
    radius: "8px",
    shadow: "none",
    sig: { h: 24, s: 0.42, l: 0.46 },
    band: { s: 0.4, l: 0.47 },
    paperLight: "#FAF6EF",
    paperDark: "#16130F",
  },
  "bold-contrast": {
    id: "bold-contrast",
    label: "Bold contrast",
    summary: "Heavy editorial display, high-contrast accent, dramatic single-source depth.",
    display: "Fraunces",
    displayGF: "Fraunces:opsz,wght@9..144,600;9..144,900",
    body: "Space Grotesk",
    bodyGF: "Space+Grotesk:wght@400;500;700",
    headingWeight: 800,
    radius: "2px",
    shadow: "0 22px 60px -18px rgba(10,8,6,.6)",
    sig: { h: 12, s: 0.78, l: 0.55 },
    band: { s: 0.7, l: 0.54 },
    paperLight: "#F1EAE0",
    paperDark: "#120F0C",
  },
};

const DIRECTION_ALIASES: Record<string, string> = {
  "editorial-warm": "editorial",
  "precision-instrument": "precision",
  "warm-minimal": "warm-minimal",
  "bold-contrast": "bold-contrast",
};

/** Accepts reconcile ids, taste-preset ids ("editorial-warm"), or free text. */
export function resolveDirection(id: string): Direction {
  const key = (id ?? "").toLowerCase().trim();
  if (RECONCILE_DIRECTIONS[key]) return RECONCILE_DIRECTIONS[key]!;
  if (DIRECTION_ALIASES[key]) return RECONCILE_DIRECTIONS[DIRECTION_ALIASES[key]!]!;
  const hit = Object.keys(RECONCILE_DIRECTIONS).find((k) => key.includes(k) || k.includes(key));
  return hit ? RECONCILE_DIRECTIONS[hit]! : RECONCILE_DIRECTIONS.editorial!;
}

// ── Token extraction from the real capture ───────────────────────────

const GENERIC_FONTS = /inter|system-ui|-apple-system|segoe|roboto|helvetica|arial|sans-serif/i;

export type BeforeTokens = {
  headingFont: string;
  bodyFont: string;
  accent: string;      // hex
  accentSources: string[];
  surface: string;     // hex
  text: string;        // hex
  radius: string;
  shadow: string;
  surfaceIsDark: boolean;
};

export function extractTokens(capture: CapturePayload, fingerprint: DesignFingerprint): BeforeTokens {
  const st = capture.surfaceTokens;
  const primaryFont = fingerprint.fontFamilies[0]?.family ?? st?.bodyFont ?? "Inter";
  const surfaceRaw = st?.bodyBg ?? "rgb(255,255,255)";
  const surfaceRgb = parseColor(surfaceRaw) ?? { r: 255, g: 255, b: 255 };
  const accentRaw = st?.accent ?? fingerprint.colors.find((c) => {
    const rgb = parseColor(c.normalizedHex);
    return rgb ? rgbToHsl(rgb).s > 0.4 : false;
  })?.normalizedHex ?? "#8B5CF6";

  return {
    headingFont: st?.headingFont ?? primaryFont,
    bodyFont: st?.bodyFont ?? primaryFont,
    accent: toHex(parseColor(accentRaw) ?? { r: 139, g: 92, b: 246 }),
    accentSources: (st?.accentSources ?? []).concat(accentRaw),
    surface: toHex(surfaceRgb),
    text: toHex(parseColor(st?.bodyText ?? "#1a1a1a") ?? { r: 26, g: 26, b: 26 }),
    radius: st?.radius ?? fingerprint.radii.find((r) => r.value !== "0px")?.value ?? "8px",
    shadow: st?.shadow ?? fingerprint.shadows.find((s) => s.value !== "none")?.value ?? "none",
    surfaceIsDark: luminance(surfaceRgb) < 0.22,
  };
}

/** Tame an acid/generic accent; harmonize a decent brand color. */
function reconcileAccent(beforeHex: string, dir: Direction): { hex: string; tamed: boolean } {
  const rgb = parseColor(beforeHex);
  if (!rgb) return { hex: hslHex(dir.sig.h, dir.sig.s, dir.sig.l), tamed: true };
  const { h, s } = rgbToHsl(rgb);
  const isCold = h >= 200 && h <= 300;      // violet/blue "AI acid" band
  const isAcid = s > 0.72;
  if ((isCold && s > 0.5) || isAcid) {
    return { hex: hslHex(dir.sig.h, dir.sig.s, dir.sig.l), tamed: true };
  }
  // Respect the brand hue, harmonize saturation + lightness into the band.
  return { hex: hslHex(h, dir.band.s, dir.band.l), tamed: false };
}

function shadowSummary(value: string): string {
  if (!value || value === "none") return "no shadow";
  const spreads = value.split("),").length;
  return spreads > 1 ? `${spreads} stacked shadows` : "single heavy shadow";
}

// ── The reconciliation itself ────────────────────────────────────────

export function reconcile(
  capture: CapturePayload,
  fingerprint: DesignFingerprint,
  findings: Finding[],
  directionId: string,
): Reconciliation {
  const dir = resolveDirection(directionId);
  const before = extractTokens(capture, fingerprint);
  const { hex: accentAfter, tamed } = reconcileAccent(before.accent, dir);
  const accentInk = inkFor(accentAfter);

  const surfaceAfter = before.surfaceIsDark ? dir.paperDark : dir.paperLight;
  const textAfter = inkFor(surfaceAfter);

  const has = (id: string) => findings.some((f) => f.id === id || f.detector === id);
  const grayCluster = fingerprint.nearDuplicateGrays[0];

  // Remap the page's own accent custom properties to the reconciled accent.
  const remappedVars = (capture.cssVariables ?? []).filter((v) =>
    before.accentSources.some((src) => sameColor(v.value, src)),
  );

  const css = buildReconcileCss({ dir, before, accentAfter, accentInk, surfaceAfter, textAfter, remappedVars });
  const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${dir.displayGF}&family=${dir.bodyGF}&display=swap');`;

  const rows: ReconTokenRow[] = [];
  rows.push({
    key: "type",
    label: "Typeface",
    before: `${before.headingFont} / ${before.bodyFont}`,
    after: `${dir.display} / ${dir.body}`,
    note: GENERIC_FONTS.test(before.headingFont)
      ? "Replaces the default system stack with a display + text pairing."
      : "Re-pairs headline and body for a clearer hierarchy.",
  });
  rows.push({
    key: "accent",
    label: "Accent",
    before: before.accent,
    after: accentAfter,
    swatchBefore: before.accent,
    swatchAfter: accentAfter,
    note: tamed ? "Tamed an acid/default accent into a considered hue." : "Kept your brand hue, harmonized its saturation.",
  });
  rows.push({
    key: "radius",
    label: "Corner radius",
    before: before.radius,
    after: dir.radius,
    note: "One radius language across controls and cards.",
  });
  rows.push({
    key: "depth",
    label: "Depth",
    before: shadowSummary(before.shadow),
    after: dir.shadow === "none" ? "flat, no decorative shadow" : "one composed elevation",
    note: has("ShadowEverywhereTell") ? "Stops repeating the same shadow on every card." : "Depth becomes intentional.",
  });
  rows.push({
    key: "focus",
    label: "Focus ring",
    before: `${Math.round(fingerprint.focusRingCoverage * 100)}% of controls`,
    after: "2px accent ring on 100%",
    note: "Adds the keyboard-focus contract the surface was missing.",
  });
  if (grayCluster) {
    rows.push({
      key: "neutrals",
      label: "Neutrals",
      before: `${grayCluster.values.length} near-duplicate grays (ΔE ${grayCluster.deltaE})`,
      after: "one intentional neutral ground",
      note: "Collapses the gray mush into a single surface.",
    });
  }
  if (fingerprint.gradientDetected) {
    rows.push({
      key: "gradient",
      label: "Hero treatment",
      before: "violet→pink gradient crutch",
      after: `solid ${surfaceAfter} ground`,
      note: "Trades the default gradient for a composed surface.",
    });
  }

  return {
    directionId: dir.id,
    label: dir.label,
    summary: dir.summary,
    rows,
    css,
    fontImport,
    accentBefore: before.accent,
    accentAfter,
    surfaceAfter,
    textAfter,
  };
}

function buildReconcileCss(args: {
  dir: Direction;
  before: BeforeTokens;
  accentAfter: string;
  accentInk: string;
  surfaceAfter: string;
  textAfter: string;
  remappedVars: { name: string; value: string }[];
}): string {
  const { dir, accentAfter, accentInk, surfaceAfter, textAfter, remappedVars } = args;
  const remap = remappedVars.length
    ? `\n/* remap the page's own accent variables to the reconciled accent */\n:root{\n${remappedVars.map((v) => `  ${v.name}: ${accentAfter} !important;`).join("\n")}\n}\n`
    : "";

  return `/* Tell · ${dir.label} — reconciled from the captured page */
:root{
  --tell-display:"${dir.display}";
  --tell-body:"${dir.body}";
  --tell-accent:${accentAfter};
  --tell-accent-ink:${accentInk};
  --tell-radius:${dir.radius};
  --tell-shadow:${dir.shadow};
  --tell-paper:${surfaceAfter};
  --tell-ink:${textAfter};
}
${remap}
html,body{
  background:var(--tell-paper) !important;
  color:var(--tell-ink) !important;
  font-family:var(--tell-body),ui-sans-serif,system-ui,-apple-system,sans-serif !important;
}
h1,h2,h3,h4,[class*="title"],[class*="heading"],[class*="hero"] h1,[class*="hero"] h2,[class*="display"]{
  font-family:var(--tell-display),Georgia,"Times New Roman",serif !important;
  letter-spacing:-.012em !important;
  font-weight:${dir.headingWeight} !important;
  color:var(--tell-ink) !important;
}
p,li,span,label,input,textarea{ color:var(--tell-ink); }
a{ color:var(--tell-accent) !important; text-decoration-color:var(--tell-accent) !important; }
button,[class*="btn"],[class*="button"],[type="submit"],[type="button"],[class*="primary"],[class*="cta"],[role="button"]{
  background-color:var(--tell-accent) !important;
  border-color:var(--tell-accent) !important;
  color:var(--tell-accent-ink) !important;
}
/* neutralize the gradient crutch — reveal the composed ground */
[class*="hero"],[class*="gradient"],[class*="banner"],[style*="gradient"]{ background-image:none !important; }
/* compose depth instead of repeating it */
[class*="card"],[class*="panel"],[class*="tile"],[class*="box"],article,button,[class*="btn"]{ box-shadow:var(--tell-shadow) !important; }
/* one radius language */
button,input,select,textarea,[class*="btn"],[class*="button"],[class*="card"],[class*="panel"],img,video,[class*="rounded"]{
  border-radius:var(--tell-radius) !important;
}
/* the missing focus contract */
*:focus-visible{ outline:2px solid var(--tell-accent) !important; outline-offset:2px !important; }
`;
}

// ── Real, page-grounded patch (drop-in override sheet) ───────────────

export function buildOverridesPatch(recon: Reconciliation, url: string): { file: string; unifiedDiff: string; summary: string }[] {
  const file = "tell-overrides.css";
  const body = `${recon.fontImport}\n${recon.css}`;
  const lines = body.split("\n");
  const hunk = lines.map((l) => `+${l}`).join("\n");
  const unifiedDiff = `diff --git a/${file} b/${file}
new file mode 100644
index 0000000..1111111
--- /dev/null
+++ b/${file}
@@ -0,0 +1,${lines.length} @@
${hunk}`;

  return [
    {
      file,
      summary: `${recon.label} for ${hostOf(url)} — import this after your global stylesheet (or ask the Cursor agent to fold it into your tokens).`,
      unifiedDiff,
    },
  ];
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "your page";
  }
}
