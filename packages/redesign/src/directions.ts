// Full art-direction specs. Each direction is a complete "designer's system": the v1
// Direction fields (fonts, ratio, accent signature, paper) PLUS a `recipe` block that
// encodes the identity of the redesign — hero treatment, component language, section
// rhythm, texture, and the "designer was here" decorative details. No recipe field is
// shared verbatim across directions; that is the whole point of v2 (docs/06).

import type { Hsl } from "./color";

// ── identity sub-blocks ─────────────────────────────────────────────
export type EyebrowKind =
  | "small-caps"      // letterspaced small-caps overline (editorial, luxury)
  | "mono-bracket"    // [ 01 ] style technical tag (precision)
  | "chip"            // filled accent chip (bold-contrast)
  | "mono-meta"       // mono metadata row (brutalist)
  | "none";           // whitespace is the eyebrow (warm-minimal)

export type HeroDecoration =
  | "rules"           // hairline rules framing the block
  | "underline-block" // heavy accent underline behind/under the word
  | "keyline-box"     // hard ink keyline box around the hero
  | "hairline-double" // luxury double hairline above + below
  | "corner-ticks"    // precision corner tick marks via pseudo borders
  | "none";

export type ButtonKind =
  | "solid"           // accent fill
  | "outline"         // hairline outline, accent text
  | "ink-block"       // hard ink block, paper text
  | "offset-shadow"   // brutalist hard 6px offset shadow
  | "chip";           // rounded pill accent

export type LinkKind =
  | "offset"          // offset underline, thick
  | "none"            // no underline, hover reveals
  | "highlight"       // padded accent highlight box
  | "soft"            // soft thin underline
  | "underline"       // always-on 2px underline
  | "invert";         // hover inverts fg/bg

export type CardKind =
  | "shadow"          // one composed elevation
  | "hairline"        // single hairline border, flat
  | "ink-border"      // 2px ink keyline, flat
  | "tint"            // tinted surface, no border
  | "double-hairline";// luxury inner + outer hairline

export type Texture =
  | "fiber"           // editorial: faint SVG fiber noise
  | "blueprint"       // precision: 1px blueprint grid lines
  | "baseline"        // brutalist: visible 8px baseline grid
  | "double-rule"     // luxury: thin double rules
  | "tint-block"      // bold: big tinted hero wash
  | "calm";           // warm-minimal: no texture, generous whitespace

export type DirectionRecipe = {
  // page surfaces (imposed light art-direction paper — the redesign's signature look)
  paper: string;
  paperAlt: string;     // alternating section surface
  cardBg: string;
  cardBgAlt: string;
  ink: string;
  inkMuted: string;
  texture: Texture;
  contentMax: number;   // reading/content column width
  gridGap: number;      // normalized gap between grid children

  hero: {
    px: number;                 // target display size before width-fit
    transform: "none" | "uppercase";
    weight: number;
    tracking: string;           // letter-spacing
    align: "left" | "center";
    italicAccentWord: boolean;  // editorial italic accent styling
    eyebrow: { kind: EyebrowKind; text: string };
    decoration: HeroDecoration;
  };

  button: { kind: ButtonKind; transform: "none" | "uppercase"; tracking: string; weight: number };
  link: { kind: LinkKind; thickness: string; offset: string };
  card: { kind: CardKind; titleCase: "none" | "small-caps" | "uppercase"; titleTracking: string };
  section: { padY: number; divider: "none" | "hairline-top" | "rule-2px" | "double-hairline" | "tint-wash"; alternate: boolean };

  selection: "accent" | "ink";
  numerals: boolean;    // decorative section numerals via counters
};

/** v1 Direction fields + v2 recipe. `Direction` stays the exported name for back-compat. */
export type Direction = {
  id: string;
  label: string;
  mood: string;
  summary: string;
  display: string;
  displayGF: string;
  body: string;
  bodyGF: string;
  mono: string;
  monoGF: string;
  headingWeight: number;
  bodyWeight: number;
  ratio: number;
  spacingBase: number;
  radius: string;
  sig: Hsl;
  band: { s: number; l: number };
  paperLight: string;
  paperDark: string;
  keywords: string[];
  recipe: DirectionRecipe;
};

export type DirectionSpec = Direction;

export const DIRECTIONS: Record<string, Direction> = {
  editorial: {
    id: "editorial", label: "Editorial warm", mood: "editorial, warm, characterful",
    summary: "Fraunces headlines with optical size, humanist body, one terracotta mark, depth composed not repeated.",
    display: "Fraunces", displayGF: "Fraunces:opsz,wght@9..144,500;9..144,600;9..144,900",
    body: "Public Sans", bodyGF: "Public+Sans:wght@400;500;600;700",
    mono: "Fragment Mono", monoGF: "Fragment+Mono:ital@0;1",
    headingWeight: 600, bodyWeight: 400, ratio: 1.25, spacingBase: 8, radius: "10px",
    sig: { h: 18, s: 0.58, l: 0.46 }, band: { s: 0.5, l: 0.44 },
    paperLight: "#F4EEE3", paperDark: "#17140F",
    keywords: ["editorial", "warm", "magazine", "serif", "human", "print", "considered", "elegant"],
    recipe: {
      paper: "#F4EEE3", paperAlt: "#FBF7EF", cardBg: "#FFFFFF", cardBgAlt: "#FBF6EC",
      ink: "#241E17", inkMuted: "#7A6C5C", texture: "fiber", contentMax: 1100, gridGap: 32,
      hero: {
        px: 78, transform: "none", weight: 600, tracking: "-0.02em", align: "left",
        italicAccentWord: true,
        eyebrow: { kind: "small-caps", text: "The Feature" }, decoration: "rules",
      },
      button: { kind: "solid", transform: "none", tracking: "0", weight: 600 },
      link: { kind: "offset", thickness: "1.5px", offset: "3px" },
      card: { kind: "shadow", titleCase: "none", titleTracking: "-0.01em" },
      section: { padY: 96, divider: "none", alternate: true },
      selection: "accent", numerals: false,
    },
  },
  precision: {
    id: "precision", label: "Precision instrument", mood: "technical, precise, data-forward",
    summary: "Schibsted Grotesk display, IBM Plex body + mono, measured neutrals, sharp radius, zero decorative depth.",
    display: "Schibsted Grotesk", displayGF: "Schibsted+Grotesk:wght@500;700;800",
    body: "IBM Plex Sans", bodyGF: "IBM+Plex+Sans:wght@400;500;600",
    mono: "IBM Plex Mono", monoGF: "IBM+Plex+Mono:wght@400;500",
    headingWeight: 700, bodyWeight: 400, ratio: 1.2, spacingBase: 8, radius: "4px",
    sig: { h: 205, s: 0.5, l: 0.4 }, band: { s: 0.46, l: 0.4 },
    paperLight: "#F2F1EE", paperDark: "#121316",
    keywords: ["precision", "technical", "sharp", "developer", "data", "dashboard", "minimal", "clean", "grotesk"],
    recipe: {
      paper: "#F2F1EE", paperAlt: "#FAFAF8", cardBg: "#FFFFFF", cardBgAlt: "#F6F6F3",
      ink: "#1B1D21", inkMuted: "#6A6E73", texture: "blueprint", contentMax: 1200, gridGap: 24,
      hero: {
        px: 56, transform: "none", weight: 700, tracking: "-0.01em", align: "left",
        italicAccentWord: false,
        eyebrow: { kind: "mono-bracket", text: "[ 01 · SYSTEM ]" }, decoration: "corner-ticks",
      },
      button: { kind: "outline", transform: "none", tracking: "0.01em", weight: 600 },
      link: { kind: "none", thickness: "1px", offset: "2px" },
      card: { kind: "hairline", titleCase: "none", titleTracking: "0" },
      section: { padY: 64, divider: "hairline-top", alternate: false },
      selection: "accent", numerals: true,
    },
  },
  "bold-contrast": {
    id: "bold-contrast", label: "Bold contrast", mood: "bold, dramatic, high-energy",
    summary: "Bricolage Grotesque at heavy weight, Figtree body, high-contrast accent, one dramatic elevation.",
    display: "Bricolage Grotesque", displayGF: "Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800",
    body: "Figtree", bodyGF: "Figtree:wght@400;500;600;700",
    mono: "JetBrains Mono", monoGF: "JetBrains+Mono:wght@400;500",
    headingWeight: 800, bodyWeight: 400, ratio: 1.333, spacingBase: 8, radius: "2px",
    sig: { h: 12, s: 0.72, l: 0.5 }, band: { s: 0.66, l: 0.48 },
    paperLight: "#F1EAE0", paperDark: "#120F0C",
    keywords: ["bold", "dramatic", "loud", "punchy", "startup", "energy", "confident", "contrast"],
    recipe: {
      paper: "#F1EAE0", paperAlt: "#FBF4EA", cardBg: "#FFFFFF", cardBgAlt: "#F7EFE4",
      ink: "#1A130D", inkMuted: "#6E5D4E", texture: "tint-block", contentMax: 1180, gridGap: 24,
      hero: {
        px: 92, transform: "uppercase", weight: 800, tracking: "-0.03em", align: "left",
        italicAccentWord: false,
        eyebrow: { kind: "chip", text: "New" }, decoration: "underline-block",
      },
      button: { kind: "solid", transform: "uppercase", tracking: "0.02em", weight: 700 },
      link: { kind: "highlight", thickness: "2px", offset: "2px" },
      card: { kind: "shadow", titleCase: "uppercase", titleTracking: "-0.01em" },
      section: { padY: 112, divider: "tint-wash", alternate: true },
      selection: "accent", numerals: false,
    },
  },
  "warm-minimal": {
    id: "warm-minimal", label: "Warm minimal", mood: "warm, human, calm",
    summary: "Lora headings, Karla body, gentle radius, quiet single-source depth on a warm paper.",
    display: "Lora", displayGF: "Lora:ital,wght@0,500;0,600;1,500",
    body: "Karla", bodyGF: "Karla:wght@400;500;600",
    mono: "Space Mono", monoGF: "Space+Mono:wght@400;700",
    headingWeight: 600, bodyWeight: 400, ratio: 1.25, spacingBase: 8, radius: "8px",
    sig: { h: 28, s: 0.5, l: 0.46 }, band: { s: 0.44, l: 0.44 },
    paperLight: "#F6F1E9", paperDark: "#191512",
    keywords: ["warm", "minimal", "calm", "human", "health", "soft", "friendly"],
    recipe: {
      paper: "#F6F1E9", paperAlt: "#F6F1E9", cardBg: "#FCF9F3", cardBgAlt: "#FCF9F3",
      ink: "#2A2420", inkMuted: "#8A7C6E", texture: "calm", contentMax: 720, gridGap: 32,
      hero: {
        px: 56, transform: "none", weight: 600, tracking: "0", align: "center",
        italicAccentWord: true,
        eyebrow: { kind: "none", text: "" }, decoration: "none",
      },
      button: { kind: "chip", transform: "none", tracking: "0", weight: 500 },
      link: { kind: "soft", thickness: "1px", offset: "3px" },
      card: { kind: "tint", titleCase: "none", titleTracking: "0" },
      section: { padY: 96, divider: "none", alternate: false },
      selection: "accent", numerals: false,
    },
  },
  luxury: {
    id: "luxury", label: "Classic luxury", mood: "refined, premium, editorial",
    summary: "Playfair Display headlines, Source Sans body, deep authoritative accent, restrained gold-leaf depth.",
    display: "Playfair Display", displayGF: "Playfair+Display:wght@600;700",
    body: "Source Sans 3", bodyGF: "Source+Sans+3:wght@400;600",
    mono: "Fragment Mono", monoGF: "Fragment+Mono:ital@0",
    headingWeight: 700, bodyWeight: 400, ratio: 1.333, spacingBase: 8, radius: "3px",
    sig: { h: 350, s: 0.4, l: 0.34 }, band: { s: 0.4, l: 0.34 },
    paperLight: "#F5F1EB", paperDark: "#14110E",
    keywords: ["luxury", "premium", "refined", "elegant", "finance", "hospitality", "classic", "sophisticated"],
    recipe: {
      paper: "#F5F1EB", paperAlt: "#FAF7F1", cardBg: "#FBF8F2", cardBgAlt: "#F3EEE6",
      ink: "#211C17", inkMuted: "#7C6F5E", texture: "double-rule", contentMax: 1040, gridGap: 40,
      hero: {
        px: 66, transform: "none", weight: 700, tracking: "0.005em", align: "center",
        italicAccentWord: false,
        eyebrow: { kind: "small-caps", text: "Established Excellence" }, decoration: "hairline-double",
      },
      button: { kind: "outline", transform: "none", tracking: "0.08em", weight: 600 },
      link: { kind: "underline", thickness: "1px", offset: "4px" },
      card: { kind: "double-hairline", titleCase: "small-caps", titleTracking: "0.06em" },
      section: { padY: 96, divider: "double-hairline", alternate: false },
      selection: "accent", numerals: true,
    },
  },
  brutalist: {
    id: "brutalist", label: "Brutalist utility", mood: "utilitarian, raw, structural",
    summary: "Archivo Black display, Work Sans body, mono details, hard 0px radius, ink borders instead of shadow.",
    display: "Archivo", displayGF: "Archivo:wdth,wght@100,700;125,800",
    body: "Work Sans", bodyGF: "Work+Sans:wght@400;500;600",
    mono: "Space Mono", monoGF: "Space+Mono:wght@400;700",
    headingWeight: 800, bodyWeight: 400, ratio: 1.414, spacingBase: 8, radius: "0px",
    sig: { h: 8, s: 0.62, l: 0.46 }, band: { s: 0.58, l: 0.44 },
    paperLight: "#F0EFEA", paperDark: "#111110",
    keywords: ["brutalist", "raw", "utility", "structural", "archive", "mono", "industrial", "anti-design"],
    recipe: {
      paper: "#F0EFEA", paperAlt: "#F0EFEA", cardBg: "#FFFFFF", cardBgAlt: "#E9E8E2",
      ink: "#131311", inkMuted: "#5C5B54", texture: "baseline", contentMax: 1240, gridGap: 0,
      hero: {
        px: 74, transform: "uppercase", weight: 800, tracking: "-0.02em", align: "left",
        italicAccentWord: false,
        eyebrow: { kind: "mono-meta", text: "// INDEX / 2026" }, decoration: "keyline-box",
      },
      button: { kind: "offset-shadow", transform: "uppercase", tracking: "0.04em", weight: 600 },
      link: { kind: "invert", thickness: "2px", offset: "2px" },
      card: { kind: "ink-border", titleCase: "uppercase", titleTracking: "0" },
      section: { padY: 64, divider: "rule-2px", alternate: false },
      selection: "ink", numerals: true,
    },
  },
  explainer: {
    id: "explainer", label: "Visual textbook", mood: "curious, precise, illustration-first",
    summary: "Source Serif display, Source Sans body, cool steel accent used sparingly, book-width column, diagram pauses over chrome.",
    display: "Source Serif 4", displayGF: "Source+Serif+4:opsz,wght@8..60,600;8..60,700",
    body: "Source Sans 3", bodyGF: "Source+Sans+3:wght@400;500;600",
    mono: "IBM Plex Mono", monoGF: "IBM+Plex+Mono:wght@400;500",
    headingWeight: 600, bodyWeight: 400, ratio: 1.25, spacingBase: 8, radius: "2px",
    sig: { h: 204, s: 0.38, l: 0.4 }, band: { s: 0.32, l: 0.38 },
    paperLight: "#F5F5F2", paperDark: "#0E0E0C",
    keywords: [
      "explainer", "essay", "textbook", "education", "educational", "blog", "diagram",
      "illustration", "longform", "curious", "monochrome", "how-it-works", "interactive", "book",
    ],
    recipe: {
      // Cool near-white paper (not warm cream) so custom diagrams carry the color.
      paper: "#F5F5F2", paperAlt: "#FAFAF8", cardBg: "#FFFFFF", cardBgAlt: "#F0F0ED",
      ink: "#141414", inkMuted: "#6B6B66", texture: "calm", contentMax: 680, gridGap: 40,
      hero: {
        px: 52, transform: "none", weight: 600, tracking: "-0.015em", align: "left",
        italicAccentWord: false,
        eyebrow: { kind: "small-caps", text: "Chapter" }, decoration: "none",
      },
      button: { kind: "outline", transform: "none", tracking: "0.01em", weight: 500 },
      link: { kind: "soft", thickness: "1px", offset: "3px" },
      card: { kind: "hairline", titleCase: "none", titleTracking: "0" },
      section: { padY: 112, divider: "hairline-top", alternate: false },
      selection: "accent", numerals: true,
    },
  },
};

export const DIRECTION_ALIASES: Record<string, string> = {
  "editorial-warm": "editorial",
  "precision-instrument": "precision",
  "bold-contrast": "bold-contrast",
  "warm-minimal": "warm-minimal",
  "classic-luxury": "luxury",
  "brutalist-utility": "brutalist",
  "visual-textbook": "explainer",
  "interactive-essay": "explainer",
  "explainer-essay": "explainer",
};

/** Accept reconcile ids, taste-preset ids, or free-text art-direction. §7 */
export function resolveDirection(id: string): Direction {
  const key = (id ?? "").toLowerCase().trim();
  if (DIRECTIONS[key]) return DIRECTIONS[key]!;
  if (DIRECTION_ALIASES[key]) return DIRECTIONS[DIRECTION_ALIASES[key]!]!;
  let best = { dir: DIRECTIONS.editorial!, hits: 0 };
  for (const dir of Object.values(DIRECTIONS)) {
    const hits = dir.keywords.reduce((n, k) => n + (key.includes(k) ? 1 : 0), 0);
    if (hits > best.hits) best = { dir, hits };
  }
  if (best.hits > 0) return best.dir;
  const sub = Object.keys(DIRECTIONS).find((k) => key.includes(k) || k.includes(key));
  return sub ? DIRECTIONS[sub]! : DIRECTIONS.editorial!;
}
