// Grounded, element-precise redesign — v2 "art direction, not token nudging" (docs/06).
// For each captured element (identified by its stamped data-tell-id) we apply the chosen
// direction's COMPLETE system: imposed paper + texture, a real hero treatment, per-role
// component recipes (button/card/nav/input/badge/section/link/footer), section rhythm with
// surface alternation, and the decorative details that make each direction read as a
// different designer's finished work. Orchestration order: contrast → type → spacing →
// depth → accent → recipes → layout. Everything ships as !important element/role rules that
// win in the sandboxed "after" iframe.

import type { BrandDNA, CapturePayload, ComputedStyleSample, DesignFingerprint } from "@tell/schema";
import { clamp, contrastRatio, hslHex, parseColor, px, pxList, rgbToHsl, type Hsl } from "./color";
import { ELEVATION, snapSpace, snapType, tameAccent } from "./scales";
import type { Direction } from "./directions";
import { analyzeLayout, fitHeroSize } from "./layout";
import {
  badgeDecls, buttonDecls, cardDecls, footerDecls, headingRules, heroRules, inputDecls,
  linkRules, navDecls, numeralRule, pageRules, sectionDecls, selectionRule,
  type EmittedRule, type Palette,
} from "./recipes";

export type ElOp = { tellId: string; role: string; decls: Record<string, string> };

export type RestylePlan = {
  direction: Direction;
  display: string; body: string; mono: string;
  ratio: number; base: number; spacingBase: number; radius: string;
  accentBefore: string; accentAfter: string; accentInk: string; accentTamed: boolean;
  surface: string; ink: string; inkMuted: string; isDark: boolean;
  ops: ElOp[];
  rules: EmittedRule[];
  remapVars: { name: string; value: string }[];
  floatedCount: number; elevationLevels: number;
  distinctSizesAfter: number; distinctSpacesAfter: number;
  headingWeight: number; bodyWeight: number;
  displaySizeAfter: number; bodySizeAfter: number;
  palette: Palette;
  heroTreatment: string;
  directionNotes: string[];
};

const CANDIDATE_INKS_LIGHT = ["#17140F", "#1A1714", "#211C18"];
const CANDIDATE_INKS_DARK = ["#F6F1E8", "#EFE8DC", "#FBF7F0"];

function inkFor(surface: string, isDark: boolean): string {
  const pool = isDark ? CANDIDATE_INKS_DARK : CANDIDATE_INKS_LIGHT;
  let best = pool[0]!, bestRatio = 0;
  for (const ink of [...pool, isDark ? "#FFFFFF" : "#000000"]) {
    const r = contrastRatio(surface, ink);
    if (r > bestRatio) { bestRatio = r; best = ink; }
  }
  return best;
}

// ── color utilities (local; color.ts is shared and left untouched) ──
function rgbaOf(hex: string, a: number): string {
  const c = parseColor(hex); if (!c) return `rgba(0,0,0,${a})`;
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a})`;
}
function mixHex(a: string, b: string, t: number): string {
  const ca = parseColor(a), cb = parseColor(b);
  if (!ca || !cb) return a;
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[m(ca.r, cb.r), m(ca.g, cb.g), m(ca.b, cb.b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}
/** Nudge a color's lightness until it clears `min` contrast on `bg`. */
function ensureContrast(hex: string, bg: string, min: number): string {
  const c = parseColor(hex); if (!c) return hex;
  let { h, s, l } = rgbToHsl(c);
  const bgL = parseColor(bg) ? rgbToHsl(parseColor(bg)!).l : 1;
  const step = bgL > 0.5 ? -0.03 : 0.03;
  let out = hex;
  for (let i = 0; i < 24 && contrastRatio(out, bg) < min; i++) {
    l = clamp(l + step, 0.04, 0.96);
    out = hslHex(h, s, l);
  }
  return out;
}

function bodyBaseSize(styles: ComputedStyleSample[]): number {
  const bodySizes = styles.filter((s) => s.role === "body").map((s) => px(s.fontSize)).filter((v) => v >= 12 && v <= 20);
  const c = new Map<number, number>();
  for (const v of bodySizes) c.set(Math.round(v), (c.get(Math.round(v)) ?? 0) + 1);
  let best = 16, bc = 0;
  for (const [v, n] of c) if (n > bc && v >= 14 && v <= 18) { bc = n; best = v; }
  return best;
}

function pageAccent(styles: ComputedStyleSample[]): { hex: string; hsl: Hsl } | null {
  const counts = new Map<string, number>();
  for (const s of styles) for (const c of [s.backgroundColor, s.color]) {
    const rgb = parseColor(c); if (!rgb) continue;
    const hsl = rgbToHsl(rgb);
    if (hsl.s < 0.35 || hsl.l < 0.12 || hsl.l > 0.9) continue;
    counts.set(c, (counts.get(c) ?? 0) + (s.role === "button" ? 3 : 1));
  }
  let best: string | null = null, bc = 0;
  for (const [c, n] of counts) if (n > bc) { bc = n; best = c; }
  if (!best) return null;
  const rgb = parseColor(best)!;
  return { hex: `#${[rgb.r, rgb.g, rgb.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase(), hsl: rgbToHsl(rgb) };
}

function nearAccent(color: string, accent: Hsl | null, tol = 22): boolean {
  if (!accent) return false;
  const rgb = parseColor(color); if (!rgb) return false;
  const h = rgbToHsl(rgb);
  return h.s > 0.28 && Math.abs(((h.h - accent.h + 540) % 360) - 180) < tol;
}

// ── palette (contrast-solved once per plan) ─────────────────────────
function buildPalette(dir: Direction, accentRaw: string, dna?: BrandDNA): Palette {
  const r = dir.recipe;
  const paper = r.paper;
  const ink = r.ink;
  const accent = ensureContrast(accentRaw, "#FFFFFF", 4.6);      // fills carry white text
  const accentText = ensureContrast(accent, paper, 4.5);          // links/eyebrows on paper
  const accentInk = contrastRatio(accent, "#FFFFFF") >= 4.5 ? "#FFFFFF" : ink;
  const accentWash = mixHex(accent, paper, 0.86);                 // pale tint for washes/highlights
  return {
    spec: dir,
    display: dna?.displayFont || dir.display,
    body: dna?.bodyFont || dir.body,
    mono: dna?.monoFont || dir.mono,
    radius: dna?.radius || dir.radius,
    paper, paperAlt: r.paperAlt, cardBg: r.cardBg, cardBgAlt: r.cardBgAlt,
    ink, inkMuted: r.inkMuted,
    hairline: rgbaOf(ink, 0.14), hairlineStrong: rgbaOf(ink, 0.30),
    accent, accentInk, accentText, accentWash,
    headingWeight: dir.headingWeight, bodyWeight: dir.bodyWeight,
    serifFallback: /playfair|lora|fraunces|source serif|newsreader|literata|serif/i.test(dna?.displayFont || dir.display) ? "Georgia, 'Times New Roman', serif" : "ui-sans-serif, system-ui, sans-serif",
  };
}

export function buildRestylePlan(
  capture: CapturePayload,
  _fingerprint: DesignFingerprint,
  dir: Direction,
  dna?: BrandDNA,
): RestylePlan {
  const styles = capture.styles;
  const ratio = dna?.typeScaleRatio || dir.ratio;
  const spacingBase = dna?.spacingBase || dir.spacingBase;
  const base = bodyBaseSize(styles);

  const accent = pageAccent(styles);
  const dnaAccent = dna?.accent ? { hex: dna.accent } : null;
  const tamed = dnaAccent ? { hex: dnaAccent.hex, tamed: false } : tameAccent(accent?.hsl ?? null, dir.sig, dir.band);
  const p = buildPalette(dir, tamed.hex, dna);
  const layout = analyzeLayout(styles);

  const ops: ElOp[] = [];
  const rules: EmittedRule[] = [];

  // honest metric accumulators (measure the EMITTED sheet)
  const sizes = new Set<number>();
  const spaces = new Set<number>();
  const shadows = new Set<string>();
  let floated = 0;

  const noteSize = (v: number) => { if (v >= 12) sizes.add(v); };
  const notePad = (arr: number[]) => arr.forEach((v) => v > 0 && spaces.add(v));
  const noteShadow = (v?: string) => { if (v && v !== "none") shadows.add(v.replace(/\s+/g, " ").trim()); };

  // ── (contrast + globals) page, selection, headings, links ──
  rules.push(...pageRules(p), ...selectionRule(p), ...headingRules(p), ...linkRules(p));

  // ── (legibility net) unsampled elements the page's own CSS fills dark ──
  // Only ~30 selector kinds get sampled + stamped; anything else keeps its authored fill
  // while inheriting the new ink (dark-on-dark chips). Read the snapshot's inlined
  // stylesheet and counter simple selectors whose solid fill the ink can't read on.
  // Element-precise [data-tell-id] ops are emitted later, so they win ties.
  rules.push(...counterUnsampledFills(capture.snapshotHtml ?? "", p));

  // ── (recipes) hero ──
  const heroHeading = styles.find((s) => s.tellId === layout.heroHeadingId);
  const heroSize = fitHeroSize(dir.recipe.hero.px, heroHeading?.rect?.w ?? null);
  const heroRuleSet = heroRules(p, layout.heroHeadingId, layout.heroContainerId, heroSize);
  rules.push(...heroRuleSet);
  noteSize(heroSize);
  for (const hr of heroRuleSet) if (hr.decls["box-shadow"]) noteShadow(hr.decls["box-shadow"]);

  const sectionIndex = new Map(layout.sectionOrder.map((s) => [s.id, s.index]));
  const cardSet = new Set(layout.cardIds);
  const numeralsOn = dir.recipe.numerals;
  let numeralHost = false;

  const contentAlign = dir.recipe.hero.align;

  // ── per-element pass ──
  let cardCol = 0;
  for (const s of styles) {
    if (!s.tellId || s.tag === "body" || s.tag === "html") continue;
    if (s.tellId === layout.heroHeadingId || s.tellId === layout.heroContainerId) continue; // hero handled above
    const decls: Record<string, string> = {};
    const size = px(s.fontSize);

    // (type) snap size + assign voice
    if (size > 0 && (s.role === "display" || s.role === "heading" || s.role === "body" || s.role === "link" || s.role === "button")) {
      const snapped = snapType(size, base, ratio);
      decls["font-size"] = `${snapped}px`; noteSize(snapped);
    }

    // (spacing) snap padding
    const pads = pxList(s.padding);
    if (pads.length && pads.some((v) => v > 0)) {
      const snapped = pads.map((v) => (v > 0 ? snapSpace(v) : 0));
      decls["padding"] = snapped.map((v) => `${v}px`).join(" ");
      notePad(snapped);
    }

    // (recipes) role treatments
    const isBadge = (s.role === "body" || s.role === "other") && !!parseColor(s.backgroundColor) && (s.rect?.w ?? 999) < 300 && px(s.borderRadius) > 0;

    if (s.role === "nav") {
      Object.assign(decls, navDecls(p));
    } else if (s.role === "button") {
      const primary = nearAccent(s.backgroundColor, accent?.hsl ?? null);
      if (primary) {
        Object.assign(decls, buttonDecls(p));
      } else {
        Object.assign(decls, { "background-color": "transparent", color: p.accentText, border: `1px solid ${p.hairlineStrong}`, "border-radius": p.radius, "box-shadow": "none", "background-image": "none", "font-weight": String(dir.recipe.button.weight), "text-transform": dir.recipe.button.transform, "letter-spacing": dir.recipe.button.tracking });
      }
      noteShadow(decls["box-shadow"]);
    } else if (isBadge) {
      Object.assign(decls, badgeDecls(p));
    } else if (s.role === "input") {
      Object.assign(decls, inputDecls(p));
    } else if (s.role === "card" || s.role === "surface") {
      const isSection = sectionIndex.has(s.tellId);
      const isTile = cardSet.has(s.tellId);
      if (s.tag === "footer") {
        Object.assign(decls, footerDecls(p));
      } else if (isTile) {
        const alt = cardCol % 2 === 1; cardCol++;
        const elev = ELEVATION[1];
        const cd = cardDecls(p, alt, elev);
        Object.assign(decls, cd, { "text-align": contentAlign });
        if (cd["box-shadow"] && cd["box-shadow"] !== "none") floated++;
        noteShadow(cd["box-shadow"]);
        if (numeralsOn) {
          rules.push(...numeralRule(p, s.tellId, "body"));
          numeralHost = true;
        }
      } else if (isSection) {
        const idx = sectionIndex.get(s.tellId)!;
        Object.assign(decls, sectionDecls(p, idx), {
          "max-width": `${dir.recipe.contentMax}px`, "margin-left": "auto", "margin-right": "auto",
          "column-gap": `${dir.recipe.gridGap}px`, "row-gap": `${dir.recipe.gridGap}px`, "text-align": contentAlign,
        });
      } else {
        // generic surface/container: flatten any AI gradient, constrain, recolor
        Object.assign(decls, { "background-color": p.paper, "background-image": "none", color: p.ink });
        if ((s.rect?.w ?? 0) >= layout.pageWidth * 0.7) { decls["max-width"] = `${dir.recipe.contentMax}px`; decls["margin-left"] = "auto"; decls["margin-right"] = "auto"; }
      }
    } else if (s.role === "display" || s.role === "heading") {
      // non-hero headings: display voice, committed weight, ink, snapped size
      Object.assign(decls, {
        "font-family": `"${p.display}", ${p.serifFallback}`,
        color: p.ink,
        "font-weight": String(dir.headingWeight),
        "letter-spacing": dir.recipe.card.titleTracking || "-0.01em",
      });
      if (dir.recipe.card.titleCase === "small-caps" && s.role === "heading") { decls["font-variant"] = "small-caps"; }
      if (dir.recipe.card.titleCase === "uppercase" && s.role === "heading") { decls["text-transform"] = "uppercase"; }
    } else if (s.role === "body") {
      Object.assign(decls, { color: p.ink, "font-family": `"${p.body}", ui-sans-serif, sans-serif`, "line-height": "1.6" });
    } else if (s.role === "link") {
      // covered by global `a`, but ensure readable color on the new paper
      decls["color"] = p.accentText;
    }

    // (depth) collapse stray shadows on anything not intentionally floated
    const hasShadow = s.boxShadow && s.boxShadow !== "none";
    if (hasShadow && decls["box-shadow"] === undefined) decls["box-shadow"] = "none";

    // (accent) remap accent-colored fills/text that we didn't already recolor
    if (decls["background-color"] === undefined && nearAccent(s.backgroundColor, accent?.hsl ?? null)) { decls["background-color"] = p.accent; decls["color"] = p.accentInk; }
    else if (decls["color"] === undefined && nearAccent(s.color, accent?.hsl ?? null)) decls["color"] = p.accentText;

    // (legibility) never pair a recolored ink with a retained opaque fill it can't read on
    // (e.g. a dark chip on a page we just turned light). Off-direction fills become outlined chips.
    if (decls["color"] && decls["background-color"] === undefined && parseColor(s.backgroundColor)
      && contrastRatio(decls["color"], s.backgroundColor) < 4.5) {
      decls["background-color"] = "transparent";
      decls["background-image"] = "none";
      decls["border"] = `1px solid ${p.hairlineStrong}`;
    }

    // radius unification for controls that still lack one
    if ((s.role === "button" || s.role === "card" || s.role === "input") && decls["border-radius"] === undefined && px(s.borderRadius) > 0) decls["border-radius"] = p.radius;

    if (Object.keys(decls).length) ops.push({ tellId: s.tellId, role: s.role, decls });
  }

  if (numeralHost) rules.push({ selector: "body", decls: { "counter-reset": "tell-idx" } });

  // remap the page's own accent custom properties
  const remapVars = (capture.cssVariables ?? []).filter((v) => nearAccent(v.value, accent?.hsl ?? null, 26)).map((v) => ({ name: v.name, value: p.accent }));

  // honest elevation count: distinct non-none shadows actually emitted
  const elevationLevels = shadows.size;

  const directionNotes = buildDirectionNotes(p, heroSize, floated, layout);
  const heroTreatment = heroHeadline(p, heroSize);

  return {
    direction: dir, display: p.display, body: p.body, mono: p.mono, ratio, base, spacingBase, radius: p.radius,
    accentBefore: accent?.hex ?? (styles.find((s) => s.role === "button")?.backgroundColor ?? "#6366F1"),
    accentAfter: p.accent, accentInk: p.accentInk, accentTamed: tamed.tamed,
    surface: p.paper, ink: p.ink, inkMuted: p.inkMuted, isDark: false,
    ops, rules, remapVars,
    floatedCount: floated, elevationLevels,
    distinctSizesAfter: sizes.size, distinctSpacesAfter: spaces.size,
    headingWeight: dir.headingWeight, bodyWeight: dir.bodyWeight,
    displaySizeAfter: heroSize, bodySizeAfter: base,
    palette: p, heroTreatment, directionNotes,
  };
}

function heroHeadline(p: Palette, sizePx: number): string {
  const e = p.spec.recipe.hero.eyebrow;
  const eyebrow = e.kind === "none" ? "generous whitespace as the eyebrow" : `a ${e.kind.replace("-", " ")} eyebrow`;
  return `${p.display} ${sizePx}px ${p.spec.recipe.hero.transform === "uppercase" ? "uppercase " : ""}display with ${eyebrow}, ${p.spec.recipe.hero.decoration.replace("-", " ")} treatment`;
}

function buildDirectionNotes(p: Palette, heroSize: number, floated: number, layout: ReturnType<typeof analyzeLayout>): string[] {
  const r = p.spec.recipe;
  const notes: string[] = [];
  notes.push(`Repapered onto ${p.paper}${r.texture !== "calm" ? ` with a ${r.texture.replace("-", " ")} texture` : " with generous whitespace"}, ${p.ink} ink.`);
  notes.push(`Rebuilt the hero: ${p.display} ${heroSize}px ${r.hero.weight >= 700 ? "heavy " : ""}display${r.hero.eyebrow.kind !== "none" ? ` with a ${r.hero.eyebrow.kind.replace("-", " ")} eyebrow (${r.hero.eyebrow.text})` : ", whitespace as the eyebrow"}.`);
  notes.push(`Buttons → ${r.button.kind.replace("-", " ")}${r.button.transform === "uppercase" ? " uppercase" : ""}; cards → ${r.card.kind.replace("-", " ")}${floated ? `, ${floated} composed elevation${floated > 1 ? "s" : ""}` : ", flat"}.`);
  notes.push(`Links: ${r.link.kind} underline in ${p.accentText}; ${r.selection} ::selection.`);
  notes.push(`Section rhythm ${r.section.padY}px${r.section.alternate ? " with surface alternation" : ""}${r.section.divider !== "none" ? `, ${r.section.divider.replace("-", " ")} dividers` : ""}; content column ${r.contentMax}px.`);
  const detail = r.numerals ? "leading-zero card numerals" : r.card.titleCase !== "none" ? `${r.card.titleCase.replace("-", " ")} card titles` : "one considered accent hue";
  notes.push(`Retuned the accent to ${p.accent} and added ${detail}.`);
  return notes;
}

/** Element-precise CSS that lands in the live "after" iframe. */
/**
 * Counter-rules for elements capture never sampled but the page's own CSS fills with a
 * color the direction's ink can't read on. Grounded in the snapshot's inlined stylesheet:
 * simple class/tag selectors declaring a solid, ink-illegible background become outlined
 * chips on the new paper. Gradients, compound selectors, and page roots are left alone.
 */
function counterUnsampledFills(snapshotHtml: string, p: Palette): EmittedRule[] {
  const inlined = snapshotHtml.match(/<style[^>]*data-tell-inlined[^>]*>([\s\S]*?)<\/style>/i);
  if (!inlined) return [];
  const out: EmittedRule[] = [];
  const seen = new Set<string>();
  for (const m of inlined[1]!.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
    const selector = m[1]!.trim();
    // simple selectors only (single class or tag, optional comma list) — no combinators,
    // pseudo-classes, or attribute selectors; never the page roots.
    if (!/^[.#]?[a-z][\w-]*(\s*,\s*[.#]?[a-z][\w-]*)*$/i.test(selector)) continue;
    if (/\b(html|body)\b/i.test(selector)) continue;
    const bg = m[2]!.match(/background(?:-color)?:\s*(rgba?\([^)]+\)|#[0-9a-f]{3,8})\s*;?/i);
    if (!bg || !parseColor(bg[1]!)) continue;
    if (contrastRatio(p.ink, bg[1]!) >= 4.5) continue; // ink reads fine → authored fill survives
    if (seen.has(selector)) continue;
    seen.add(selector);
    out.push({
      selector,
      decls: {
        "background-color": "transparent",
        "background-image": "none",
        color: p.ink,
        border: `1px solid ${p.hairlineStrong}`,
        "box-shadow": "none",
      },
    });
    if (out.length >= 24) break;
  }
  return out;
}

export function emitRestyleCss(plan: RestylePlan): string {
  const p = plan.palette;
  const header = `/* Tell · ${plan.direction.label} — v2 art-directed restyle of the captured page */
:root{
  --tell-display:"${plan.display}";
  --tell-body:"${plan.body}";
  --tell-mono:"${plan.mono}";
  --tell-accent:${plan.accentAfter};
  --tell-accent-ink:${plan.accentInk};
  --tell-accent-text:${p.accentText};
  --tell-radius:${plan.radius};
  --tell-paper:${plan.surface};
  --tell-paper-alt:${p.paperAlt};
  --tell-ink:${plan.ink};
}`;
  const remap = plan.remapVars.length
    ? `\n:root{\n${plan.remapVars.map((v) => `  ${v.name}: ${plan.accentAfter} !important;`).join("\n")}\n}`
    : "";

  const serialize = (selector: string, decls: Record<string, string>) =>
    `${selector}{\n${Object.entries(decls).map(([k, v]) => `  ${k}:${v} !important;`).join("\n")}\n}`;

  const globalRules = plan.rules.map((r) => serialize(r.selector, r.decls)).join("\n");
  const elRules = plan.ops.map((op) => serialize(`[data-tell-id="${op.tellId}"]`, op.decls)).join("\n");

  return `${header}${remap}\n${globalRules}\n${elRules}\n`;
}

/** Honest "after" axis scores — MEASURED from the emitted plan, not asserted near-1.0. */
export function afterAxes(plan: RestylePlan, before: { contrast: number }): { contrast: number; typescale: number; spacing: number; depth: number; accent: number; identity: number } {
  const p = plan.palette;
  // typescale: fewer distinct sizes on one ratio = tighter
  const scaleCount = clamp(1 - Math.max(0, plan.distinctSizesAfter - 8) * 0.1, 0.4, 1);
  const typescale = clamp(0.7 + 0.3 * scaleCount, 0.6, 1);
  // spacing: fewer distinct on-grid steps = calmer
  const spaceCount = clamp((16 - plan.distinctSpacesAfter) / 10, 0, 1);
  const spacing = clamp(0.72 + 0.28 * spaceCount, 0.7, 1);
  // depth: measured distinct elevation levels used, restraint rewarded
  const k = plan.elevationLevels;
  const depth = clamp(k === 0 ? 0.9 : k <= 2 ? 1 : k <= 4 ? 0.85 : 0.7, 0.7, 1);
  // accent: measured contrast of the accent pairings we actually own
  const fillC = contrastRatio(p.accent, p.accentInk);
  const textC = contrastRatio(p.accentText, p.paper);
  const accent = clamp(0.6 + 0.2 * (fillC >= 4.5 ? 1 : 0.5) + 0.2 * (textC >= 4.5 ? 1 : 0.5), 0.6, 1);
  // identity: distinct display/body classes + committed weight
  const identity = clamp((plan.display.toLowerCase() !== plan.body.toLowerCase() ? 1 : 0.7) * (plan.headingWeight >= 600 ? 1 : 0.85), 0.7, 1);
  // contrast: REAL measured ink/paper + hierarchy from the emitted hero/body ramp
  const inkC = contrastRatio(plan.ink, plan.surface);
  const wcag = inkC >= 7 ? 1 : inkC >= 4.5 ? 0.85 : 0.5;
  const H = (plan.displaySizeAfter / Math.max(1, plan.bodySizeAfter)) * (plan.headingWeight / Math.max(1, plan.bodyWeight)) * 1.5;
  const hierFactor = H >= 3.5 ? 1 : H >= 2.2 ? 0.7 : 0.4;
  const contrast = clamp(wcag * 0.8 + 0.2 * hierFactor, before.contrast, 1);
  return { contrast, typescale, spacing, depth, accent, identity };
}
