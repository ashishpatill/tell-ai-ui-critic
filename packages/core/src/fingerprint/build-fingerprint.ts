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

function isNeutral(hex: string): boolean {
  const m = hex.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if (!m) return false;
  const r = parseInt(m[1] ?? "0", 16);
  const g = parseInt(m[2] ?? "0", 16);
  const b = parseInt(m[3] ?? "0", 16);
  return Math.max(r, g, b) - Math.min(r, g, b) < 18;
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
  const neutralValues = colors.map((c) => c.normalizedHex).filter(isNeutral);
  const nearDuplicateGrays = neutralValues.length >= 5 ? [{ values: neutralValues.slice(0, 8), deltaE: 2 }] : [];
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
