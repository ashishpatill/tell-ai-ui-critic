import { CapturePayload, DesignFingerprint } from "@tell/schema";

type Counted = { value: string; count: number };

function countBy(values: string[]): Counted[] {
  const counts = new Map<string, number>();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts, ([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}

function firstFont(fontFamily: string): string {
  return fontFamily.split(",")[0]?.replaceAll("\"", "").trim() || "unknown";
}

function normalizeHex(value: string): string {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) return value;
  const [, r, g, b] = match;
  return `#${[r, g, b].map((v) => Number(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1] ?? "0", 16), parseInt(m[2] ?? "0", 16), parseInt(m[3] ?? "0", 16)];
}

/** HSL saturation in 0..1 — used for perceptual neutrality (BUILD §5.2). */
function saturation([r, g, b]: [number, number, number]): number {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return 0;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function isNeutralHex(hex: string): boolean {
  const rgb = hexToRgb(hex);
  return rgb ? saturation(rgb) < 0.1 : false;
}

// sRGB → CIE Lab, then CIE76 ΔE. Dependency-free, deterministic.
function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function rgbToLab([r, g, b]: [number, number, number]): [number, number, number] {
  const rl = srgbToLinear(r), gl = srgbToLinear(g), bl = srgbToLinear(b);
  // linear RGB → XYZ (D65)
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function deltaE(a: [number, number, number], b: [number, number, number]): number {
  const la = rgbToLab(a), lb = rgbToLab(b);
  return Math.sqrt((la[0] - lb[0]) ** 2 + (la[1] - lb[1]) ** 2 + (la[2] - lb[2]) ** 2);
}

/**
 * Cluster near-duplicate neutral colors within ΔE < 3 (BUILD §5.2). Only
 * clusters with ≥5 members are reported — that is the "gray mush" signal.
 */
function nearDuplicateGrayClusters(hexes: string[]): { values: string[]; deltaE: number }[] {
  const neutrals = Array.from(new Set(hexes.filter(isNeutralHex)));
  const clusters: { rgb: [number, number, number]; members: string[] }[] = [];
  for (const hex of neutrals) {
    const rgb = hexToRgb(hex);
    if (!rgb) continue;
    const hit = clusters.find((c) => deltaE(c.rgb, rgb) < 3);
    if (hit) hit.members.push(hex);
    else clusters.push({ rgb, members: [hex] });
  }
  return clusters
    .filter((c) => c.members.length >= 5)
    .map((c) => {
      let maxD = 0;
      for (const a of c.members) for (const b of c.members) {
        const ra = hexToRgb(a), rb = hexToRgb(b);
        if (ra && rb) maxD = Math.max(maxD, deltaE(ra, rb));
      }
      return { values: c.members.slice(0, 8), deltaE: Math.round(maxD * 10) / 10 };
    });
}

export function buildFingerprint(capture: CapturePayload): DesignFingerprint {
  const fontMap = new Map<string, { count: number; roles: Set<string> }>();
  for (const sample of capture.styles) {
    const family = firstFont(sample.fontFamily);
    const current = fontMap.get(family) ?? { count: 0, roles: new Set<string>() };
    current.count += 1;
    current.roles.add(sample.selector);
    fontMap.set(family, current);
  }

  const colors = countBy(capture.styles.flatMap((s) => [s.color, s.backgroundColor])).map((c) => ({
    ...c,
    normalizedHex: normalizeHex(c.value),
  }));
  const nearDuplicateGrays = nearDuplicateGrayClusters(colors.map((c) => c.normalizedHex));
  const probes = capture.probes.length || 1;

  return DesignFingerprint.parse({
    url: capture.url,
    generatedAt: new Date().toISOString(),
    fontFamilies: Array.from(fontMap, ([family, value]) => ({
      family,
      count: value.count,
      roles: Array.from(value.roles),
    })).sort((a, b) => b.count - a.count),
    colors,
    shadows: countBy(capture.styles.map((s) => s.boxShadow)),
    radii: countBy(capture.styles.map((s) => s.borderRadius)),
    spacingValues: countBy(capture.styles.map((s) => s.padding)),
    typeScale: countBy(capture.styles.map((s) => s.fontSize)).map((item) => ({ size: item.value, count: item.count, roles: [] })),
    centeredBlockRatio: capture.domSummary.centeredBlockRatio,
    emojiInUiCount: capture.domSummary.emojiInUiCount,
    gradientDetected: capture.styles.some((s) => s.backgroundImage.includes("gradient")),
    gradientSamples: capture.styles.map((s) => s.backgroundImage).filter((v) => v.includes("gradient")).slice(0, 4),
    nearDuplicateGrays,
    focusRingCoverage: capture.probes.filter((p) => p.hasFocusVisibleDiff).length / probes,
    stateCoverage: {
      hover: capture.probes.filter((p) => p.hasHoverDiff).length / probes,
      focus: capture.probes.filter((p) => p.hasFocusVisibleDiff).length / probes,
      disabled: capture.probes.filter((p) => p.hasDisabledAttr || p.ariaDisabled).length / probes,
    },
  });
}

// Exposed for detectors that need perceptual color math.
export { hexToRgb, saturation, isNeutralHex };
