// Source-aware patch: rewrite the user's REAL source literals, not a drop-in override sheet.
//
// The reconcile engine (buildRestylePlan) already measures every before→after value we need
// (accent hex, body font, radius, AI hero-gradient signal). Here we match those MEASURED
// `before` values as literals in the user's actual source files and replace them with the
// `after` values — emitting genuine unified diffs with true surrounding context.
//
// Matching on VALUES (not structure) covers plain-CSS, CSS-vars, and Tailwind-config projects
// with one deterministic, zero-LLM strategy — consistent with Tell's trustworthy core.

import type { BrandDNA, CapturePayload, DesignFingerprint } from "@tell/schema";
import { parseColor } from "./color";
import { resolveDirection } from "./scales";
import { buildRestylePlan } from "./restyle";

export type SourceFile = { path: string; contents: string };
export type PatchFile = { file: string; unifiedDiff: string; summary: string };

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when a hex/rgb literal resolves to the same color as `target`. */
function sameColor(literal: string, target: { r: number; g: number; b: number }): boolean {
  const c = parseColor(literal);
  return !!c && c.r === target.r && c.g === target.g && c.b === target.b;
}

// Any hex color literal (#rgb or #rrggbb).
const HEX_RE = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g;
// A CSS gradient function, tolerating one level of nested parens (e.g. rgba(...) inside).
const GRADIENT_RE = /(?:repeating-)?(?:linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)/gi;

type Counters = { accent: number; font: number; radius: number; gradient: number };

/**
 * Compute which line indices sit inside a font context — a `font-family:` CSS declaration,
 * or a Tailwind `fontFamily` object/array (tracked by brace/bracket depth). Font-token
 * rewrites are confined to these lines so we never touch a stray brand word elsewhere.
 */
function fontContextLines(lines: string[]): boolean[] {
  const flags = new Array(lines.length).fill(false);
  let depth = 0; // >0 while inside a Tailwind fontFamily {...} / [...] region
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (depth > 0) {
      flags[i] = true;
      for (const ch of line) {
        if (ch === "{" || ch === "[") depth++;
        else if (ch === "}" || ch === "]") depth = Math.max(0, depth - 1);
      }
      continue;
    }
    if (/font-family\s*:/i.test(line)) flags[i] = true;
    if (/fontFamily\b/.test(line)) {
      flags[i] = true;
      for (const ch of line.slice(line.indexOf("fontFamily"))) {
        if (ch === "{" || ch === "[") depth++;
        else if (ch === "}" || ch === "]") depth = Math.max(0, depth - 1);
      }
    }
  }
  return flags;
}

/** Rewrite one line by all applicable rules; mutate counters with what changed. */
function rewriteLine(
  line: string,
  fontContext: boolean,
  rules: {
    accentBefore: { r: number; g: number; b: number } | null;
    accentAfter: string;
    oldFont: string | null;
    newFont: string;
    oldRadius: string | null;
    newRadius: string;
    surface: string;
  },
  c: Counters,
): string {
  let out = line;

  // (§6) AI hero gradient: any gradient that contains the old accent collapses to a flat surface.
  if (rules.accentBefore) {
    out = out.replace(GRADIENT_RE, (g) => {
      if ((g.match(HEX_RE) ?? []).some((h) => sameColor(h, rules.accentBefore!))) {
        c.gradient++;
        return rules.surface;
      }
      return g;
    });
  }

  // (§5) Accent: every literal of the measured accent → the tamed accent.
  if (rules.accentBefore) {
    out = out.replace(HEX_RE, (h) => {
      if (sameColor(h, rules.accentBefore!)) { c.accent++; return rules.accentAfter; }
      return h;
    });
  }

  // (§7) Body font: the captured primary family, confined to font contexts.
  if (fontContext && rules.oldFont) {
    const fontRe = new RegExp(`(["']?)${escapeRe(rules.oldFont)}\\1`, "g");
    out = out.replace(fontRe, () => { c.font++; return `"${rules.newFont}"`; });
  }

  // (§4) Radius: only inside a `border-radius:` declaration, only the measured old value.
  if (rules.oldRadius) {
    const radiusRe = new RegExp(`(border-radius\\s*:\\s*)${escapeRe(rules.oldRadius)}(?![0-9a-z%])`, "gi");
    out = out.replace(radiusRe, (_m, pre) => { c.radius++; return `${pre}${rules.newRadius}`; });
  }

  return out;
}

/** A real unified diff between two equal-length line arrays, with `context` lines of context. */
function buildUnifiedDiff(file: string, orig: string[], mod: string[], context = 3): string {
  const changed: number[] = [];
  for (let i = 0; i < orig.length; i++) if (orig[i] !== mod[i]) changed.push(i);
  if (!changed.length) return "";

  // Group nearby changes into hunks (merge when their contexts would touch or overlap).
  const hunks: { start: number; end: number }[] = [];
  for (const idx of changed) {
    const last = hunks[hunks.length - 1];
    if (last && idx - last.end <= context * 2 + 1) last.end = idx;
    else hunks.push({ start: idx, end: idx });
  }

  const parts: string[] = [`--- a/${file}`, `+++ b/${file}`];
  for (const h of hunks) {
    const from = Math.max(0, h.start - context);
    const to = Math.min(orig.length - 1, h.end + context);
    const count = to - from + 1;
    // orig and mod are equal length with only in-place line swaps, so both sides share
    // the same start and count — a valid, self-consistent @@ header.
    parts.push(`@@ -${from + 1},${count} +${from + 1},${count} @@`);
    for (let i = from; i <= to; i++) {
      if (orig[i] !== mod[i]) { parts.push(`-${orig[i]}`); parts.push(`+${mod[i]}`); }
      else parts.push(` ${orig[i]}`);
    }
  }
  return parts.join("\n") + "\n";
}

function summarize(c: Counters, r: { accentBefore: string; accentAfter: string; newRadius: string; newFont: string }): string {
  const bits: string[] = [];
  if (c.accent) bits.push(`${c.accent} accent literal${c.accent > 1 ? "s" : ""} ${r.accentBefore}→${r.accentAfter}`);
  if (c.gradient) bits.push(`${c.gradient} AI gradient${c.gradient > 1 ? "s" : ""} flattened`);
  if (c.font) bits.push(`de-genericized body font → ${r.newFont}`);
  if (c.radius) bits.push(`${c.radius} radi${c.radius > 1 ? "i" : "us"} → ${r.newRadius}`);
  return bits.join("; ");
}

/**
 * Rewrite the user's real source files toward the chosen direction, returning genuine unified
 * diffs (only for files that actually changed). fs-free by design — the caller does all I/O.
 */
export function buildSourcePatch(
  capture: CapturePayload,
  fingerprint: DesignFingerprint,
  directionId: string,
  dna: BrandDNA | undefined,
  sources: SourceFile[],
): PatchFile[] {
  const plan = buildRestylePlan(capture, fingerprint, resolveDirection(directionId), dna);

  const accentBefore = parseColor(plan.accentBefore);
  const oldFont = capture.surfaceTokens?.bodyFont?.trim() || null;
  const oldRadiusRaw = capture.surfaceTokens?.radius?.trim();
  const oldRadius = oldRadiusRaw && /^\d/.test(oldRadiusRaw) ? oldRadiusRaw : null; // skip "mixed"

  const rules = {
    accentBefore,
    accentAfter: plan.accentAfter,
    oldFont: oldFont && oldFont.toLowerCase() !== plan.body.toLowerCase() ? oldFont : null,
    newFont: plan.body,
    oldRadius: oldRadius && oldRadius !== plan.radius ? oldRadius : null,
    newRadius: plan.radius,
    surface: plan.surface,
  };

  const out: PatchFile[] = [];
  for (const src of sources) {
    const orig = src.contents.split("\n");
    const fontFlags = fontContextLines(orig);
    const c: Counters = { accent: 0, font: 0, radius: 0, gradient: 0 };
    const mod = orig.map((line, i) => rewriteLine(line, fontFlags[i]!, rules, c));
    if (c.accent + c.font + c.radius + c.gradient === 0) continue;

    out.push({
      file: src.path,
      unifiedDiff: buildUnifiedDiff(src.path, orig, mod),
      summary: `${plan.direction.label} · ${src.path}: ${summarize(c, {
        accentBefore: plan.accentBefore, accentAfter: plan.accentAfter, newRadius: plan.radius, newFont: plan.body,
      })}.`,
    });
  }
  return out;
}
