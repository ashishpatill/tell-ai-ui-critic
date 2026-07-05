// The encoded de-genericization methodology (docs/05_GENERICNESS_METHODOLOGY.md).
// Every constant here maps to a numbered rule; nothing is a hand-wave.

import { clamp, hslHex, type Hsl } from "./color";

// ── §1 T1: default-font monoculture ────────────────────────────────
export const DEFAULT_FONT_RE = /inter|system-ui|-apple-system|blinkmacsystemfont|segoe|roboto|open sans|helvetica|arial|sans-serif|ui-sans-serif/i;
// Second-favourite AI convergence font — soft tell as a sole display voice.
export const SOFT_DEFAULT_RE = /space grotesk/i;

// ── §1 T3: the documented "AI slop" accent hues (indigo/violet/purple-500) ──
export const AI_DEFAULT_HUES = [239, 258, 271]; // H° of #6366F1 #8B5CF6 #A855F7
export function matchesAIDefaultHue(h: Hsl): boolean {
  return h.h >= 230 && h.h <= 280 && h.s >= 0.7 && h.l >= 0.5 && h.l <= 0.72;
}
export function isElectric(h: Hsl): boolean {
  return h.s >= 0.85 && h.l >= 0.5 && h.l <= 0.65;
}

// ── §2: modular type scale ─────────────────────────────────────────
export const TYPE_RATIOS: Record<string, number> = {
  minorThird: 1.2, majorThird: 1.25, perfectFourth: 1.333, augFourth: 1.414, golden: 1.618,
};
/** Snap an arbitrary size onto base·ratio^n, never below 12px. §2 */
export function snapType(size: number, base: number, ratio: number): number {
  if (size <= 0) return base;
  const n = Math.round(Math.log(size / base) / Math.log(ratio));
  return Math.max(12, Math.round(base * Math.pow(ratio, n)));
}
/** Which canonical ratio best explains a set of sizes, and how well (0..1). §2 */
export function inferTypeScale(sizes: number[], base: number): { ratio: number; name: string; fit: number } {
  let best = { ratio: 1.25, name: "majorThird", fit: 0 };
  for (const [name, ratio] of Object.entries(TYPE_RATIOS)) {
    let fits = 0;
    for (const s of sizes) {
      if (s <= 0) continue;
      const n = Math.log(s / base) / Math.log(ratio);
      if (Math.abs(n - Math.round(n)) <= 0.15) fits++;
    }
    const fit = sizes.length ? fits / sizes.length : 0;
    if (fit > best.fit) best = { ratio, name, fit };
  }
  return best;
}

// ── §3: spacing rhythm ─────────────────────────────────────────────
export const SPACE_SCALE = [0, 2, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128];
export function snapSpace(v: number): number {
  if (v <= 2) return v <= 1 ? 0 : 2;
  if (v > 128) return 32 * Math.round(v / 32);
  return SPACE_SCALE.reduce((a, b) => (Math.abs(b - v) <= Math.abs(a - v) ? b : a));
}
export function onGrid(v: number): boolean {
  return v <= 2 || v % 4 === 0;
}

// ── §4: elevation ramp (light-from-above, blur≈2·y, spread≤0) ───────
export const ELEVATION: Record<0 | 1 | 2 | 3, string> = {
  0: "none",
  1: "0 1px 3px rgba(20,16,12,.10), 0 1px 2px rgba(20,16,12,.06)",
  2: "0 4px 6px -1px rgba(20,16,12,.10), 0 2px 4px -2px rgba(20,16,12,.10)",
  3: "0 20px 25px -5px rgba(20,16,12,.14), 0 8px 10px -6px rgba(20,16,12,.12)",
};

// ── §5: taming an accent into a considered band ────────────────────
/**
 * Given the page's accent HSL and the direction's signature, return the reconciled accent.
 * - brand hue that is NOT the AI default → keep hue, move S/L into a considered band.
 * - AI-default / electric accent with no brand mandate → adopt the direction's signature hue.
 */
export function tameAccent(before: Hsl | null, sig: Hsl, band: { s: number; l: number }): { hex: string; tamed: boolean } {
  if (!before) return { hex: hslHex(sig.h, sig.s, sig.l), tamed: true };
  if (matchesAIDefaultHue(before) || isElectric(before) || (before.h >= 200 && before.h <= 300 && before.s > 0.55)) {
    return { hex: hslHex(sig.h, sig.s, sig.l), tamed: true };
  }
  // Respect the brand hue; only pull saturation + lightness into the considered band.
  return { hex: hslHex(before.h, clamp(band.s, 0.4, 0.8), clamp(band.l, 0.32, 0.52)), tamed: false };
}

// ── §7: curated directions (mood → authored type pairing + tokens) ──
// The Direction type + the DIRECTIONS table + resolveDirection now live in directions.ts
// (enriched with the v2 recipe blocks). scales.ts re-exports them so existing importers
// — measures.ts, reconcile.ts, source-patch.ts, the web app — keep working unchanged.
export {
  DIRECTIONS, DIRECTION_ALIASES, resolveDirection,
  type Direction, type DirectionSpec, type DirectionRecipe,
} from "./directions";
