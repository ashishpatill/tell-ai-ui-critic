// LLM full-page restyle path (Builder B). Self-contained: does NOT import from ./validate or
// ./restyle (owned by Builder A, being rewritten concurrently). Everything this module needs —
// brief-building, prompt-building, mechanical validation, a tiny contrast checker — lives here.
//
// Contract (docs/06_REDESIGN_ENGINE_V2.md "LLM path" + "Build contracts"):
//   restyleWithGemini(capture, fingerprint, directionId, dna?, opts?)
//     -> { ok: true, css, fontImport, notes } | { ok: false, reason }
// Never throws. Deterministic recipes path always ships if this fails or is skipped.

import type { BrandDNA, CapturePayload, ComputedStyleSample, DesignFingerprint } from "@tell/schema";

// ── Direction (local, minimal shape — do not import scales.ts's richer Direction type) ──

export interface RestyleDirection {
  id: string;
  label: string;
  mood: string;
  summary: string;
}

// ── Page brief: compact grounding text handed to the model ──────────────

const BRIEF_BYTE_CAP = 12_000;

function fmtRect(rect: ComputedStyleSample["rect"]): string {
  if (!rect) return "rect=?";
  return `rect=${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.w)}x${Math.round(rect.h)}`;
}

function sampleLine(s: ComputedStyleSample): string {
  const parts = [
    `#${s.tellId}`,
    `<${s.tag}>`,
    `role=${s.role}`,
    fmtRect(s.rect),
    `font=${s.fontFamily}/${s.fontSize}/${s.fontWeight}`,
    `color=${s.color}`,
    `bg=${s.backgroundColor}`,
    `radius=${s.borderRadius}`,
    `shadow=${s.boxShadow}`,
    `pad=${s.padding}`,
    `align=${s.textAlign}`,
    `lh=${s.lineHeight}`,
  ];
  if (s.backgroundImage && s.backgroundImage !== "none") parts.push(`bgImage=${s.backgroundImage}`);
  return parts.join(" ");
}

/**
 * Compact, authoritative grounding text: one line per sampled element (with its real tellId,
 * so the model can only ever reference ids that actually exist), plus page-level tokens. Capped
 * to ~12KB so it stays cheap and fits comfortably in a single-turn prompt.
 */
export function buildPageBrief(capture: CapturePayload, fingerprint: DesignFingerprint): string {
  const lines: string[] = [];
  lines.push(`URL: ${capture.url}`);
  lines.push(`Viewport: ${capture.viewport.width}x${capture.viewport.height}`);
  lines.push(
    `DOM summary: ${capture.domSummary.headingCount} headings, ${capture.domSummary.buttonCount} buttons, ` +
      `centeredBlockRatio=${capture.domSummary.centeredBlockRatio}, emojiInUiCount=${capture.domSummary.emojiInUiCount}`,
  );

  if (capture.surfaceTokens) {
    const t = capture.surfaceTokens;
    lines.push(
      `Surface tokens: bodyBg=${t.bodyBg} bodyText=${t.bodyText} bodyFont=${t.bodyFont} headingFont=${t.headingFont} ` +
        `accent=${t.accent} radius=${t.radius} shadow=${t.shadow}` +
        (t.accentSources.length ? ` accentSources=[${t.accentSources.join(", ")}]` : ""),
    );
  }

  if (capture.cssVariables.length) {
    const vars = capture.cssVariables.slice(0, 40).map((v) => `${v.name}:${v.value}`).join("; ");
    lines.push(`CSS variables: ${vars}`);
  }

  lines.push(
    `Fingerprint: fonts=[${fingerprint.fontFamilies.map((f) => `${f.family}x${f.count}`).join(", ")}] ` +
      `typeScale=[${fingerprint.typeScale.map((t) => t.size).join(", ")}] ` +
      `gradientDetected=${fingerprint.gradientDetected} focusRingCoverage=${fingerprint.focusRingCoverage.toFixed(2)}`,
  );

  lines.push("");
  lines.push("Sampled elements (tellId, tag, role, rect, computed style):");

  // Prioritize higher-signal roles first so if we truncate for size, the most useful elements
  // (hero/display, headings, buttons, cards, nav) survive over generic "other" nodes.
  const rolePriority: Record<string, number> = {
    display: 0, heading: 1, nav: 2, button: 3, card: 4, surface: 5, input: 6, link: 7, body: 8, other: 9,
  };
  const ordered = [...capture.styles].sort(
    (a, b) => (rolePriority[a.role] ?? 9) - (rolePriority[b.role] ?? 9),
  );

  const header = lines.join("\n") + "\n";
  let budget = BRIEF_BYTE_CAP - byteLength(header) - byteLength("\n(truncated — additional elements omitted)");
  const elementLines: string[] = [];
  for (const s of ordered) {
    if (!s.tellId) continue;
    const line = sampleLine(s);
    const cost = byteLength(line) + 1;
    if (cost > budget) break;
    elementLines.push(line);
    budget -= cost;
  }
  const omitted = ordered.filter((s) => s.tellId).length - elementLines.length;

  const out = [header + elementLines.join("\n")];
  if (omitted > 0) out.push(`\n(truncated — ${omitted} additional elements omitted)`);
  return out.join("");
}

const textEncoder = new TextEncoder();
function byteLength(s: string): number {
  return textEncoder.encode(s).length;
}

// ── Prompt ────────────────────────────────────────────────────────────

const FORBIDDEN_RULES = [
  "display:none or display: none (never hide captured content)",
  "visibility:hidden or visibility: hidden",
  "position:fixed or position:absolute, or any transform on content (layout integrity must survive)",
  "font-size below 12px anywhere",
  "any external URL except https://fonts.googleapis.com or https://fonts.gstatic.com (no other remote assets, no tracking, no images from other hosts)",
  "more than 3 @keyframes blocks total",
  "a sheet larger than 60KB",
];

export function buildRestylePrompt(
  brief: string,
  direction: RestyleDirection,
  dna?: BrandDNA,
): string {
  const dnaLine = dna
    ? `Brand DNA to steer toward (respect these as the target system): displayFont=${dna.displayFont}, bodyFont=${dna.bodyFont}` +
      `${dna.monoFont ? `, monoFont=${dna.monoFont}` : ""}, accent=${dna.accent}, radius=${dna.radius}, spacingBase=${dna.spacingBase}, typeScaleRatio=${dna.typeScaleRatio}.`
    : "No brand DNA supplied — invent a coherent, distinctive system consistent with the direction below.";

  return [
    `You are Tell's senior art director. You are given the REAL captured, rendered state of a web page`,
    `(exact element ids, rects, and computed styles) and must write ONE complete CSS stylesheet that`,
    `art-directs it into the "${direction.label}" direction (mood: ${direction.mood}).`,
    `Direction brief: ${direction.summary}`,
    ``,
    dnaLine,
    ``,
    `This is a full page redesign, not a token nudge. The output must visibly change, at minimum:`,
    `1. Page background & section rhythm (texture, alternation, vertical breathing room)`,
    `2. Hero presence (display type at real scale, eyebrow, decorative language)`,
    `3. Component language — buttons, cards, nav, inputs, links each get their own per-direction recipe`,
    `4. Typographic voice (family + weight + spacing + case + underline language)`,
    `5. Decorative details (rules, numbers, marks, ::selection) — evidence a designer was here`,
    ``,
    `Hard rules for the CSS you write:`,
    `- Selectors may ONLY be: [data-tell-id="…"] using ONLY the ids that literally appear in the`,
    `  "Sampled elements" list below (never invent an id), plain tag selectors (body, h1, button, a, …),`,
    `  :root, ::selection, and pseudo-elements (::before/::after) attached to any of the above.`,
    `- Do NOT use attribute selectors like [role="button"] or class selectors — use the plain tag or`,
    `  [data-tell-id="…"] from the brief instead.`,
    `- EVERY declaration must end with !important.`,
    `- The FIRST line of the sheet must be exactly one @import for Google Fonts, e.g.`,
    `  @import url('https://fonts.googleapis.com/css2?family=...&display=swap');`,
    `- Never restructure the DOM — this is CSS-only. Layout integrity of the captured page must survive:`,
    `  content must stay reachable, readable, and in-flow.`,
    `- Forbidden, and will cause the sheet to be rejected outright:`,
    ...FORBIDDEN_RULES.map((r) => `  * ${r}`),
    `- Never use transform — use font-size, spacing, and color for emphasis instead.`,
    `- Anywhere you set both a text color and a background color on the same :root/body-level rule,`,
    `  the pair must meet at least 4.5:1 WCAG contrast.`,
    ``,
    `Real captured page (ground truth — do not contradict measured rects or invent elements):`,
    brief,
    ``,
    `Respond ONLY with JSON: {"css": "<the full stylesheet as one string>", "notes": ["short bullet", ...]}.`,
    `"notes" should be 3-6 short human-readable bullets describing what the direction did (for a UI badge),`,
    `written in a confident senior-designer voice, no apology, no emoji.`,
  ].join("\n");
}

// ── Mechanical validation ────────────────────────────────────────────

export interface ValidateResult {
  ok: boolean;
  violations: string[];
}

const MAX_SHEET_BYTES = 60_000;
const MAX_KEYFRAMES = 3;

/** Google Fonts @import lines may contain semicolons inside url(...) — don't use [^;]*. */
const IMPORT_RULE_RE = /@import\s+url\([^)]*\)\s*;/gi;

function stripImportRules(css: string): string {
  return css.replace(IMPORT_RULE_RE, "");
}

const BANNED_PROPERTY_VALUE_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /display\s*:\s*none/i, label: "display:none" },
  { re: /visibility\s*:\s*hidden/i, label: "visibility:hidden" },
  { re: /position\s*:\s*fixed/i, label: "position:fixed" },
  { re: /position\s*:\s*absolute/i, label: "position:absolute" },
];

/** Matches a `property: value` declaration pair (value up to `;` or `}`). */
const DECLARATION_RE = /([a-zA-Z-]+)\s*:\s*([^;{}]+)(;|(?=\}))/g;

function extractSelectors(css: string): string[] {
  // Strip @import / @font-face / comments before scanning for selector blocks so their bodies
  // (which are not selector { … } shapes in the normal sense) don't get misparsed.
  const withoutImports = stripImportRules(css);
  const withoutComments = withoutImports.replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors: string[] = [];
  const blockRe = /([^{}]+)\{/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(withoutComments))) {
    const raw = m[1]!.trim();
    if (!raw || raw.startsWith("@")) continue; // @media/@keyframes/@font-face headers, handled separately
    for (const sel of raw.split(",")) selectors.push(sel.trim());
  }
  return selectors;
}

const ALLOWED_TAG_RE = /^[a-zA-Z][a-zA-Z0-9]*$/;
const ALLOWED_BARE_RE = /^(:root|::selection)$/;

function isAllowedSimpleBase(base: string, knownTellIds: Set<string>): boolean {
  if (ALLOWED_BARE_RE.test(base)) return true;
  if (ALLOWED_TAG_RE.test(base)) return true;

  const tellMatch = base.match(/^\[data-tell-id=["']([^"']+)["']\]$/);
  if (tellMatch) return knownTellIds.has(tellMatch[1]!);

  const tagTellMatch = base.match(/^[a-zA-Z][a-zA-Z0-9]*\[data-tell-id=["']([^"']+)["']\]$/);
  if (tagTellMatch) return knownTellIds.has(tagTellMatch[1]!);

  return false;
}

function isAllowedSelectorShape(selector: string, knownTellIds: Set<string>): boolean {
  // Split off trailing pseudo-elements/pseudo-classes (::before, ::after, :hover, :focus, etc.)
  // and validate the base independently.
  const base = selector.replace(/(::?[a-zA-Z-]+(\([^)]*\))?)+$/, "").trim() || selector;

  // Allow simple descendant chains of plain tags / tell-id selectors (e.g. "nav a", "section h2").
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return parts.every((part) => isAllowedSimpleBase(part, knownTellIds));
  }

  return isAllowedSimpleBase(base, knownTellIds);
}

function countUnimportantDeclarations(css: string): { total: number; withImportant: number } {
  let total = 0;
  let withImportant = 0;
  // Only count declarations inside rule bodies (skip @import lines entirely).
  const withoutImports = stripImportRules(css);
  const withoutComments = withoutImports.replace(/\/\*[\s\S]*?\*\//g, "");
  let m: RegExpExecArray | null;
  DECLARATION_RE.lastIndex = 0;
  while ((m = DECLARATION_RE.exec(withoutComments))) {
    total++;
    if (/!important\s*$/i.test(m[2]!.trim())) withImportant++;
  }
  return { total, withImportant };
}

/** Strip non-tell-id attribute selectors models sometimes emit (e.g. a[role="button"] → a). */
export function sanitizeLlmSelectors(css: string): string {
  return css.replace(/([^{}]+)\{/g, (full, selectorPart: string) => {
    const trimmed = selectorPart.trim();
    if (!trimmed || trimmed.startsWith("@")) return full;
    const fixed = selectorPart.split(",").map((sel: string) => {
      let s = sel.trim();
      // Models reliably shorthand stamped ids as #t7 — expand back to the attribute form.
      s = s.replace(/#(t\d+)\b/g, '[data-tell-id="$1"]');
      const pseudoMatch = s.match(/((?:\s*::?[a-zA-Z-]+(?:\([^)]*\))?)+)$/);
      const pseudo = pseudoMatch?.[1] ?? "";
      let base = pseudo ? s.slice(0, s.length - pseudo.length).trim() : s;
      base = base.replace(/\[(?!data-tell-id\s*=)[^\]]+\]/gi, "").trim();
      // A selector that was ONLY a stripped attribute (e.g. [aria-hidden]) has no base
      // left — drop it rather than emitting a naked pseudo or an empty selector.
      if (!base) return "";
      return (base + pseudo).trim();
    }).filter(Boolean);
    // Every selector in the list vanished → mark the rule so the final pass removes it.
    if (!fixed.length) return `.__tell-drop__ {`;
    return `${fixed.join(", ")} {`;
  })
    // Remove rules whose selector list was emptied by sanitization.
    .replace(/\.__tell-drop__\s*\{[^{}]*\}/g, "");
}

/** True when every selector in the list is a ::before/::after decoration rule. */
export function isPseudoDecoration(selectorList: string): boolean {
  const parts = selectorList.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length > 0 && parts.every((s) => /::?(before|after)\b/i.test(s));
}

/**
 * Drop banned declarations the model occasionally emits so validation can pass safely.
 * Block-aware: `position:absolute` is a legitimate technique inside ::before/::after
 * decoration rules (corner ticks, eyebrows) and survives there; everywhere else it goes,
 * along with the universally banned declarations. Handles declarations terminated by `}`
 * as well as `;`, and strips every occurrence, not just the first.
 */
function stripBannedDeclarations(css: string): string {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return withoutComments.replace(/([^{}]+)(\{[^{}]*\})/g, (_full, selPart: string, body: string) => {
    if (selPart.trim().startsWith("@")) return selPart + body;
    let b = body;
    for (const { re, label } of BANNED_PROPERTY_VALUE_PATTERNS) {
      if (label === "position:absolute" && isPseudoDecoration(selPart.trim())) continue;
      b = b.replace(new RegExp(`${re.source}[^;}]*;?`, "gi"), "");
    }
    b = b.replace(/(?<![a-z-])transform\s*:[^;}]*;?/gi, "");
    return selPart + b;
  });
}

// ── Tiny local color parser + WCAG contrast ratio (self-contained, ~40 lines) ──

function parseHexOrRgb(input: string): [number, number, number] | null {
  const s = input.trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1]!;
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*[\d.]+\s*)?\)$/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function relLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** WCAG contrast ratio between two colors (hex or rgb()/rgba() strings). Returns null if unparsable. */
function wcagContrastRatio(a: string, b: string): number | null {
  const ca = parseHexOrRgb(a);
  const cb = parseHexOrRgb(b);
  if (!ca || !cb) return null;
  const la = relLuminance(ca);
  const lb = relLuminance(cb);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

/** Spot-check :root/body-level rules that set both color and background-color. */
function contrastSpotCheck(css: string): string[] {
  const violations: string[] = [];
  // Strip @import lines first so the following rule's selector isn't glued to them (the rule
  // regex's [^{}]+ selector capture would otherwise absorb a leading "@import …;" and stop a
  // first-in-sheet `body`/`:root` rule from being recognized as root-level).
  const withoutImports = stripImportRules(css);
  const withoutComments = withoutImports.replace(/\/\*[\s\S]*?\*\//g, "");
  const ruleRe = /(^|\})\s*([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(withoutComments))) {
    const selectorsRaw = m[2]!.trim();
    const body = m[3]!;
    const selectors = selectorsRaw.split(",").map((s) => s.trim());
    const isRootLevel = selectors.some((s) => /^(:root|body|html)$/i.test(s));
    if (!isRootLevel) continue;

    const colorMatch = body.match(/(?<![a-z-])color\s*:\s*([^;!]+?)\s*!important/i);
    const bgMatch = body.match(/background(?:-color)?\s*:\s*([^;!]+?)\s*!important/i);
    if (!colorMatch || !bgMatch) continue;

    const ratio = wcagContrastRatio(colorMatch[1]!.trim(), bgMatch[1]!.trim());
    if (ratio === null) continue; // can't parse (e.g. a gradient) — skip rather than false-fail
    if (ratio < 4.5) {
      violations.push(
        `contrast ${ratio.toFixed(2)}:1 on "${selectorsRaw}" (color ${colorMatch[1]!.trim()} vs background ${bgMatch[1]!.trim()}) — needs >= 4.5:1`,
      );
    }
  }
  return violations;
}

/**
 * Mechanically enforce every rule from buildRestylePrompt against the model's output. Pure
 * function, no network — safe to unit test directly.
 */
export function validateLlmSheet(css: string, capture: CapturePayload): ValidateResult {
  const violations: string[] = [];

  if (!css || !css.trim()) {
    return { ok: false, violations: ["empty stylesheet"] };
  }

  if (byteLength(css) > MAX_SHEET_BYTES) {
    violations.push(`sheet is ${byteLength(css)} bytes, exceeds ${MAX_SHEET_BYTES} byte cap`);
  }

  // Balanced braces.
  let depth = 0;
  for (const ch of css) {
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth < 0) {
        violations.push("unbalanced braces: unexpected '}'");
        break;
      }
    }
  }
  if (depth > 0) violations.push("unbalanced braces: missing closing '}'");

  // Banned properties/values. `position:absolute` gets a block-aware pass: it is a
  // legitimate technique inside ::before/::after decoration rules and banned elsewhere.
  for (const { re, label } of BANNED_PROPERTY_VALUE_PATTERNS) {
    if (label === "position:absolute") continue;
    if (re.test(css)) violations.push(`banned rule present: ${label}`);
  }
  for (const block of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)(\{[^{}]*\})/g)) {
    const sel = block[1]!.trim();
    if (sel.startsWith("@")) continue;
    if (/position\s*:\s*absolute/i.test(block[2]!) && !isPseudoDecoration(sel)) {
      violations.push(`banned rule present: position:absolute outside ::before/::after (${sel})`);
    }
  }
  // transform on content: any transform declaration at all is disallowed (hero/decorative scale
  // moves belong to font-size/spacing, not transform, per the brief).
  if (/(?<![a-z-])transform\s*:/i.test(css.replace(/\/\*[\s\S]*?\*\//g, ""))) {
    violations.push("banned rule present: transform on content");
  }

  // External URLs other than Google Fonts.
  const urlMatches = css.match(/url\(([^)]+)\)/gi) ?? [];
  for (const u of urlMatches) {
    const inner = u.slice(4, -1).trim().replace(/^["']|["']$/g, "");
    if (/^https?:\/\//i.test(inner) && !/^https?:\/\/fonts\.(googleapis|gstatic)\.com/i.test(inner)) {
      violations.push(`external url not on fonts.googleapis.com/fonts.gstatic.com: ${inner}`);
    }
  }
  const importLines = css.match(/@import\s+url\([^)]*\)\s*;/gi) ?? [];
  for (const line of importLines) {
    if (!/fonts\.googleapis\.com/i.test(line)) {
      violations.push(`@import must be a Google Fonts import: ${line.trim()}`);
    }
  }

  // font-size below 12px.
  const fontSizeMatches = css.matchAll(/font-size\s*:\s*([\d.]+)px/gi);
  for (const m of fontSizeMatches) {
    if (Number(m[1]) < 12) violations.push(`font-size below 12px: ${m[0]}`);
  }

  // @keyframes count.
  const keyframeCount = (css.match(/@keyframes\s/gi) ?? []).length;
  if (keyframeCount > MAX_KEYFRAMES) {
    violations.push(`${keyframeCount} @keyframes blocks, exceeds cap of ${MAX_KEYFRAMES}`);
  }

  // Selector whitelist + tell-id existence.
  const knownTellIds = new Set(capture.styles.map((s) => s.tellId).filter(Boolean));
  const selectors = extractSelectors(css);
  for (const sel of selectors) {
    if (!isAllowedSelectorShape(sel, knownTellIds)) {
      violations.push(`disallowed selector: "${sel}"`);
    }
  }

  // !important coverage >= 95%.
  const { total, withImportant } = countUnimportantDeclarations(css);
  if (total > 0) {
    const coverage = withImportant / total;
    if (coverage < 0.95) {
      violations.push(
        `only ${withImportant}/${total} declarations (${(coverage * 100).toFixed(1)}%) carry !important, need >= 95%`,
      );
    }
  }

  // Contrast spot-check on root/body-level color+background pairs.
  violations.push(...contrastSpotCheck(css));

  return { ok: violations.length === 0, violations };
}

// ── Gemini call ───────────────────────────────────────────────────────

export interface RestyleOpts {
  apiKey?: string;
  model?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export type RestyleSuccess = { ok: true; css: string; fontImport: string; notes: string[] };
export type RestyleFailure = { ok: false; reason: string };
export type RestyleResult = RestyleSuccess | RestyleFailure;

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 60_000;

/** Split the leading Google Fonts @import off a sheet; returns [fontImport, rest]. */
function splitFontImport(css: string): { fontImport: string; rest: string } {
  const trimmed = css.trimStart();
  const m = trimmed.match(/^(@import\s+url\([^)]+\)\s*;)/i);
  if (!m) return { fontImport: "", rest: css };
  return { fontImport: m[1]!.trim(), rest: trimmed.slice(m[0].length).trimStart() };
}

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call Gemini for one full-page LLM restyle sheet. Validates mechanically before returning
 * success. Never throws — every failure mode (missing key, network, parse, timeout, validation)
 * resolves to { ok: false, reason }, so callers can always fall back to the deterministic sheet.
 */
export async function restyleWithGemini(
  capture: CapturePayload,
  fingerprint: DesignFingerprint,
  directionId: string,
  dna?: BrandDNA,
  opts?: RestyleOpts,
): Promise<RestyleResult> {
  const apiKey = opts?.apiKey?.trim();
  if (!apiKey) return { ok: false, reason: "GEMINI_API_KEY not configured" };

  const model = opts?.model?.trim() || DEFAULT_MODEL;
  const doFetch = opts?.fetchImpl ?? fetch;
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const direction = directionFromId(directionId);
  const brief = buildPageBrief(capture, fingerprint);
  const prompt = buildRestylePrompt(brief, direction, dna);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let text: string | undefined;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
      res = await doFetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6,
            maxOutputTokens: 16384,
            // 2.5-flash reasons by default; a grounded CSS transcription task doesn't need it
            // and with it enabled a full sheet routinely blows the 60s budget.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return { ok: false, reason: `Gemini HTTP ${res.status}` };
    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return { ok: false, reason: isAbort ? "Gemini request timed out" : `Gemini request failed: ${String(err)}` };
  }

  if (!text) return { ok: false, reason: "Gemini returned no content" };

  let parsed: { css?: string; notes?: string[] };
  try {
    parsed = JSON.parse(stripFences(text));
  } catch {
    return { ok: false, reason: "Gemini response was not valid JSON" };
  }

  const rawCss = String(parsed.css ?? "").trim();
  if (!rawCss) return { ok: false, reason: "Gemini response missing css" };
  const notes = Array.isArray(parsed.notes) ? parsed.notes.map((n) => String(n)) : [];

  const css = stripBannedDeclarations(sanitizeLlmSelectors(rawCss));
  const { fontImport, rest } = splitFontImport(css);

  const validation = validateLlmSheet(css, capture);
  if (!validation.ok) {
    return { ok: false, reason: `validation failed: ${validation.violations.slice(0, 5).join("; ")}` };
  }

  return { ok: true, css: rest, fontImport, notes };
}

/**
 * Resolve a directionId to the minimal {id,label,mood,summary} shape this module needs, without
 * importing scales.ts (owned by Builder A). Falls back to a generic "editorial-ish" description
 * for unknown ids so the prompt is never empty.
 */
function directionFromId(directionId: string): RestyleDirection {
  const known = KNOWN_DIRECTIONS[directionId.toLowerCase().trim()];
  if (known) return known;
  return {
    id: directionId || "editorial",
    label: directionId || "Editorial warm",
    mood: "editorial, warm, characterful",
    summary: "A considered, distinctive art direction — confident type, one signature accent, composed depth.",
  };
}

const KNOWN_DIRECTIONS: Record<string, RestyleDirection> = {
  editorial: {
    id: "editorial", label: "Editorial warm", mood: "editorial, warm, characterful",
    summary: "Fraunces headlines with optical size, humanist body, one terracotta mark, depth composed not repeated.",
  },
  precision: {
    id: "precision", label: "Precision instrument", mood: "technical, precise, data-forward",
    summary: "Schibsted Grotesk display, IBM Plex body + mono, measured neutrals, sharp radius, zero decorative depth.",
  },
  "bold-contrast": {
    id: "bold-contrast", label: "Bold contrast", mood: "bold, dramatic, high-energy",
    summary: "Bricolage Grotesque at heavy weight, Figtree body, high-contrast accent, one dramatic elevation.",
  },
  "warm-minimal": {
    id: "warm-minimal", label: "Warm minimal", mood: "warm, human, calm",
    summary: "Lora headings, Karla body, gentle radius, quiet single-source depth on a warm paper.",
  },
  luxury: {
    id: "luxury", label: "Classic luxury", mood: "refined, premium, editorial",
    summary: "Playfair Display headlines, Source Sans body, deep authoritative accent, restrained gold-leaf depth.",
  },
  brutalist: {
    id: "brutalist", label: "Brutalist utility", mood: "utilitarian, raw, structural",
    summary: "Archivo Black display, Work Sans body, mono details, hard 0px radius, ink borders instead of shadow.",
  },
  explainer: {
    id: "explainer", label: "Visual textbook", mood: "curious, precise, illustration-first",
    summary: "Source Serif display, Source Sans body, cool steel accent used sparingly, book-width column, diagram pauses over chrome.",
  },
};
