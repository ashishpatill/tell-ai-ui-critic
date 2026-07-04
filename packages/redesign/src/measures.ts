// The 6-axis genericness scorecard (docs/05_GENERICNESS_METHODOLOGY.md §8).
// Every sub-score is measured from the grounded per-element capture — no vibes.

import type { BrandDNA, CapturePayload, ComputedStyleSample, DesignFingerprint, Scorecard, ScoreAxis } from "@tell/schema";
import {
  clamp, contrastRatio, parseColor, px, pxList, rgbToHsl, round1, type Hsl,
} from "./color";
import { DEFAULT_FONT_RE, SOFT_DEFAULT_RE, inferTypeScale, isElectric, matchesAIDefaultHue, onGrid, snapSpace } from "./scales";

export const AXIS_WEIGHTS = { contrast: 0.2, typescale: 0.15, spacing: 0.15, depth: 0.15, accent: 0.2, identity: 0.15 };

const TEXT_ROLES = new Set(["display", "heading", "body", "link", "button"]);
const CONTAINER_ROLES = new Set(["card", "surface", "button", "nav", "input"]);

function primaryFamily(fontFamily: string): string {
  return (fontFamily.split(",")[0] ?? "").replace(/["']/g, "").trim();
}
function fontClass(family: string): "serif" | "mono" | "sans" {
  const f = family.toLowerCase();
  if (/mono|code|consol/.test(f)) return "mono";
  if (/serif|fraunces|playfair|lora|georgia|times|instrument serif|dm serif/.test(f) && !/sans/.test(f)) return "serif";
  return "sans";
}
function mode(nums: number[]): number {
  const c = new Map<number, number>();
  for (const n of nums) c.set(n, (c.get(n) ?? 0) + 1);
  let best = nums[0] ?? 0, bc = 0;
  for (const [v, n] of c) if (n > bc) { bc = n; best = v; }
  return best;
}

/** The page's effective body background (for contrast fallback when an element bg is transparent). */
function bodyBg(capture: CapturePayload): string {
  return capture.surfaceTokens?.bodyBg
    || capture.styles.find((s) => s.tag === "body")?.backgroundColor
    || "#ffffff";
}
function effectiveBg(sample: ComputedStyleSample, fallback: string): string {
  return parseColor(sample.backgroundColor) ? sample.backgroundColor : fallback;
}

export type AxisFacts = {
  contrast: number; typescale: number; spacing: number; depth: number; accent: number; identity: number;
  text: Record<keyof typeof AXIS_WEIGHTS, string>;
  tellScore: number;
  accentHex: string;
  accentHsl: Hsl | null;
};

/** Measure all six axes (0..1 quality, 1 = best) from a captured page. */
export function measureAxes(capture: CapturePayload, fingerprint: DesignFingerprint, dna?: BrandDNA): AxisFacts {
  const styles = capture.styles;
  const pageBg = bodyBg(capture);
  const textEls = styles.filter((s) => TEXT_ROLES.has(s.role) && (s.tag !== "a" || s.role === "link"));

  // ── (a) contrast & hierarchy §6 ──
  let pass = 0, total = 0;
  const textContrasts: number[] = [];
  for (const s of textEls) {
    const size = px(s.fontSize), weight = Number(s.fontWeight) || 400;
    const ratio = contrastRatio(s.color, effectiveBg(s, pageBg));
    if (ratio <= 1.01) continue; // couldn't resolve — skip rather than penalise
    textContrasts.push(ratio);
    const floor = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    total++; if (ratio >= floor) pass++;
  }
  const wcagPass = total ? pass / total : 0.8;
  const cMax = Math.max(1, ...textContrasts), cMin = Math.min(...(textContrasts.length ? textContrasts : [1]));
  const displaySizes = styles.filter((s) => s.role === "display").map((s) => px(s.fontSize));
  const bodySizes = styles.filter((s) => s.role === "body").map((s) => px(s.fontSize)).filter((v) => v >= 10);
  const dSize = displaySizes.length ? Math.max(...displaySizes) : Math.max(16, ...styles.map((s) => px(s.fontSize)));
  const bSize = bodySizes.length ? mode(bodySizes) : 16;
  const dWeight = Math.max(400, ...styles.filter((s) => s.role === "display" || s.role === "heading").map((s) => Number(s.fontWeight) || 400));
  const bWeight = mode(styles.filter((s) => s.role === "body").map((s) => Number(s.fontWeight) || 400)) || 400;
  const famChange = styles.some((s) => s.role === "display") && primaryFamily(styles.find((s) => s.role === "display")!.fontFamily) !== primaryFamily(textEls.find((s) => s.role === "body")?.fontFamily ?? "");
  const H = (dSize / Math.max(1, bSize)) * (dWeight / Math.max(1, bWeight)) * (famChange ? 1.5 : 1);
  const hierFactor = H >= 3.5 ? 1 : H >= 2.2 ? 0.7 : 0.4;
  const mushFactor = (cMax / cMin < 1.5 || fingerprint.nearDuplicateGrays.length > 0) ? 0.6 : 1;
  const contrast = clamp(wcagPass * mushFactor * 0.8 + 0.2 * hierFactor, 0, 1);

  // ── (b) type scale §2 ──
  const sizes = Array.from(new Set(textEls.map((s) => Math.round(px(s.fontSize) * 2) / 2))).filter((v) => v > 0);
  const base = mode(bodySizes.filter((v) => v >= 14 && v <= 18)) || 16;
  const { ratio: inferredRatio, fit } = inferTypeScale(sizes, base);
  const distinctSizes = sizes.length;
  const scaleCount = clamp(1 - Math.max(0, distinctSizes - 8) * 0.12, 0.3, 1);
  const typescale = clamp(fit * scaleCount, 0, 1);

  // ── (c) spacing §3 ──
  const spaces = styles.flatMap((s) => pxList(s.padding)).filter((v) => v > 0);
  const gridFraction = spaces.length ? spaces.filter(onGrid).length / spaces.length : 1;
  const distinctSpaces = new Set(spaces.map((v) => Math.round(v))).size;
  const spaceCount = clamp((16 - distinctSpaces) / 6, 0, 1);
  const spacing = clamp(0.7 * gridFraction + 0.3 * spaceCount, 0, 1);

  // ── (d) depth §4 ──
  const shadowSigs = new Set(styles.map((s) => s.boxShadow).filter((v) => v && v !== "none").map((v) => v.replace(/\s+/g, " ").trim()));
  const containers = styles.filter((s) => CONTAINER_ROLES.has(s.role) || parseColor(s.backgroundColor));
  const shadowed = containers.filter((s) => s.boxShadow && s.boxShadow !== "none").length;
  const coverage = containers.length ? shadowed / containers.length : 0;
  const k = shadowSigs.size;
  const kFactor = k >= 2 && k <= 4 ? 1 : k === 1 || k === 5 ? 0.7 : k === 0 ? 0.5 : clamp(1 - (k - 5) * 0.15, 0, 0.7);
  const coverageFactor = coverage <= 0.15 ? 1 : clamp(1 - (coverage - 0.15) / 0.35, 0, 1);
  const depth = clamp(kFactor * coverageFactor, 0, 1);

  // ── (e) accent §5 ──
  const accent = dominantAccent(styles);
  const accentHsl = accent ? rgbToHsl(parseColor(accent)!) : null;
  const satHues = saturatedHueClusters(styles);
  const hueFactor = satHues <= 1 ? 1 : satHues === 2 ? 0.7 : 0.3;
  const accentFills = styles.filter((s) => (s.role === "button") && sameHue(s.backgroundColor, accentHsl)).length;
  const interactives = styles.filter((s) => s.role === "button" || s.role === "link").length || 1;
  const accentElemPct = accentFills / interactives;
  const areaFactor = accentElemPct <= 0.25 ? 1 : clamp(1 - (accentElemPct - 0.25) / 0.35, 0, 1);
  const acidFactor = accentHsl && isElectric(accentHsl) ? 0.4 : 1;
  const defaultPenalty = accentHsl && matchesAIDefaultHue(accentHsl) ? 0.6 : 1;
  const accentQ = clamp(hueFactor * areaFactor * acidFactor * defaultPenalty, 0, 1);

  // ── (f) type identity §7 ──
  const families = Array.from(new Set(textEls.map((s) => primaryFamily(s.fontFamily)).filter(Boolean)));
  const displayFam = primaryFamily(styles.find((s) => s.role === "display")?.fontFamily ?? families[0] ?? "");
  const bodyFam = primaryFamily(textEls.find((s) => s.role === "body")?.fontFamily ?? families[0] ?? "");
  const soleDefault = families.length === 1 && DEFAULT_FONT_RE.test(families[0] ?? "");
  const familyFactor = families.length >= 2 && families.length <= 3 ? 1
    : families.length === 1 && !DEFAULT_FONT_RE.test(families[0] ?? "") ? 0.6
    : families.length >= 4 ? 0.5
    : soleDefault ? 0.15 : 0.4;
  const classContrast = fontClass(displayFam) !== fontClass(bodyFam) ? 1 : 0.7;
  const commit = dWeight >= 600 ? 1 : 0.8;
  const identity = clamp(familyFactor * classContrast * commit, 0, 1);

  // ── §1 cliché flags → tellScore ──
  let flags = 0;
  if (soleDefault) flags += 1; else if (families.length === 1 && SOFT_DEFAULT_RE.test(families[0] ?? "")) flags += 0.5;
  if (fingerprint.gradientDetected) flags += 1;
  if (accentHsl && matchesAIDefaultHue(accentHsl)) flags += 1; else if (accentHsl && accentHsl.h >= 230 && accentHsl.h <= 280) flags += 0.5;
  if (accentHsl && isElectric(accentHsl)) flags += 1;
  if (coverage > 0.6) flags += 1; else if (coverage > 0.4) flags += 0.5;
  if (fingerprint.emojiInUiCount >= 3) flags += 1;
  if (fingerprint.centeredBlockRatio >= 0.8) flags += 1;
  if (fingerprint.nearDuplicateGrays.length > 0) flags += 1;
  const tellScore = clamp(flags / 8, 0, 1);

  // DNA-aware nudges: reward matching the target brand, penalise diverging.
  let identityAdj = identity, accentAdj = accentQ;
  if (dna) {
    const matchFonts = primaryFamily(displayFam).toLowerCase() === dna.displayFont.toLowerCase()
      && primaryFamily(bodyFam).toLowerCase() === dna.bodyFont.toLowerCase();
    identityAdj = matchFonts ? 1 : clamp(identity * 0.7, 0, 1);
    const dnaHsl = parseColor(dna.accent) ? rgbToHsl(parseColor(dna.accent)!) : null;
    const hueClose = accentHsl && dnaHsl ? Math.abs(((accentHsl.h - dnaHsl.h + 540) % 360) - 180) < 15 : false;
    accentAdj = hueClose ? clamp(accentQ, 0.85, 1) : clamp(accentQ * 0.6, 0, 1);
  }

  return {
    contrast, typescale, spacing, depth, accent: accentAdj, identity: identityAdj,
    tellScore, accentHex: accent ?? "", accentHsl,
    text: {
      contrast: `${total ? Math.round(wcagPass * 100) : 80}% WCAG pass · hierarchy ${round1(H)}×${fingerprint.nearDuplicateGrays.length ? " · gray-mush" : ""}`,
      typescale: `${distinctSizes} sizes · ${fit >= 0.85 ? "coherent" : fit >= 0.6 ? "drifting" : "no clean ratio"} (best ${inferredRatio})`,
      spacing: `${distinctSpaces} spacings · ${Math.round(gridFraction * 100)}% on-grid`,
      depth: `${k} shadow level${k === 1 ? "" : "s"} · ${Math.round(coverage * 100)}% of surfaces`,
      accent: accentHsl ? `${accent} · ${satHues} hue cluster${satHues === 1 ? "" : "s"}${matchesAIDefaultHue(accentHsl) ? " · AI-default" : isElectric(accentHsl) ? " · acid" : ""}` : "no clear accent",
      identity: soleDefault ? `1 default family (${families[0]})` : `${families.length} famil${families.length === 1 ? "y" : "ies"} · ${fontClass(displayFam)}+${fontClass(bodyFam)}`,
    },
  };
}

function dominantAccent(styles: ComputedStyleSample[]): string | null {
  const counts = new Map<string, number>();
  for (const s of styles) {
    for (const c of [s.backgroundColor, s.color]) {
      const rgb = parseColor(c);
      if (!rgb) continue;
      const hsl = rgbToHsl(rgb);
      if (hsl.s < 0.35 || hsl.l < 0.12 || hsl.l > 0.9) continue; // skip neutrals + near-black/white
      const isStatus = (hsl.h <= 15 || hsl.h >= 345) || (hsl.h >= 35 && hsl.h <= 55) || (hsl.h >= 130 && hsl.h <= 160);
      const weight = (s.role === "button" ? 3 : 1) * (isStatus ? 0.5 : 1);
      const key = c;
      counts.set(key, (counts.get(key) ?? 0) + weight);
    }
  }
  let best: string | null = null, bc = 0;
  for (const [c, n] of counts) if (n > bc) { bc = n; best = c; }
  if (!best) return null;
  const rgb = parseColor(best)!;
  return `#${[rgb.r, rgb.g, rgb.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function saturatedHueClusters(styles: ComputedStyleSample[]): number {
  const hues: number[] = [];
  for (const s of styles) {
    for (const c of [s.backgroundColor, s.color]) {
      const rgb = parseColor(c);
      if (!rgb) continue;
      const hsl = rgbToHsl(rgb);
      if (hsl.s < 0.4) continue;
      const isStatus = (hsl.h <= 15 || hsl.h >= 345) || (hsl.h >= 35 && hsl.h <= 55) || (hsl.h >= 130 && hsl.h <= 160);
      if (isStatus) continue;
      hues.push(hsl.h);
    }
  }
  const clusters: number[] = [];
  for (const h of hues) {
    if (!clusters.some((c) => Math.abs(((h - c + 540) % 360) - 180) < 12)) clusters.push(h);
  }
  return clusters.length;
}

function sameHue(color: string, target: Hsl | null): boolean {
  if (!target) return false;
  const rgb = parseColor(color);
  if (!rgb) return false;
  const h = rgbToHsl(rgb);
  return h.s > 0.25 && Math.abs(((h.h - target.h + 540) % 360) - 180) < 18;
}

function band(score: number): Scorecard["band"] {
  return score <= 25 ? "distinctive" : score <= 45 ? "conservative" : score <= 65 ? "template" : "slop";
}

/** Genericness 0..100 (lower = better) from the six quality sub-scores + tell modifier. §8 */
export function genericness(axes: { contrast: number; typescale: number; spacing: number; depth: number; accent: number; identity: number }, tellScore = 0): number {
  const base = 100 * (
    AXIS_WEIGHTS.contrast * (1 - axes.contrast) +
    AXIS_WEIGHTS.typescale * (1 - axes.typescale) +
    AXIS_WEIGHTS.spacing * (1 - axes.spacing) +
    AXIS_WEIGHTS.depth * (1 - axes.depth) +
    AXIS_WEIGHTS.accent * (1 - axes.accent) +
    AXIS_WEIGHTS.identity * (1 - axes.identity)
  );
  return Math.round(Math.min(100, base + 12 * tellScore));
}

/** Public: the captured page's scorecard (before any redesign). */
export function computeMeasures(capture: CapturePayload, fingerprint: DesignFingerprint, dna?: BrandDNA): Scorecard {
  const f = measureAxes(capture, fingerprint, dna);
  const score = genericness(f, f.tellScore);
  const mk = (key: ScoreAxis["key"], label: string, val: number): ScoreAxis => ({
    key, label, weight: AXIS_WEIGHTS[key], before: round1(val), after: round1(val), beforeText: f.text[key], afterText: f.text[key], rationale: "",
  });
  return {
    score, band: band(score), tellScore: round1(f.tellScore), scoredAgainst: dna ? "brand-dna" : "baseline",
    axes: [
      mk("contrast", "Contrast & hierarchy", f.contrast),
      mk("typescale", "Type scale", f.typescale),
      mk("spacing", "Spacing rhythm", f.spacing),
      mk("depth", "Depth restraint", f.depth),
      mk("accent", "Accent discipline", f.accent),
      mk("identity", "Type identity", f.identity),
    ],
  };
}
