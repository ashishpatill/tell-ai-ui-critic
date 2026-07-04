import { ArtDirection, DesignFingerprint, Finding, TasteVerdict } from "@tell/schema";
import { createTasteEngine, deterministicVerdict, type TasteEngine } from "./engine";

export * from "./engine";

export const DIRECTION_PRESETS = {
  editorial: {
    id: "editorial-warm",
    label: "Editorial warm",
    keywords: ["warm", "editorial", "less shadow", "serif"],
    tokenOverrides: {
      "--font-display": "Instrument Serif",
      "--accent": "#D4714A",
      "--radius-card": "16px",
      "--shadow-card": "0 2px 8px rgba(0,0,0,.25)",
    },
    summary: "Warm paper tones, serif headlines, restrained depth.",
  },
  precision: {
    id: "precision-instrument",
    label: "Precision instrument",
    keywords: ["precise", "instrument", "measured", "mono"],
    tokenOverrides: {
      "--font-display": "IBM Plex Mono",
      "--accent": "#C4A035",
      "--radius-card": "4px",
      "--shadow-card": "none",
    },
    summary: "Measured spacing, sharper radius, data-forward surfaces.",
  },
  "warm-minimal": {
    id: "warm-minimal",
    label: "Warm minimal",
    keywords: ["warm", "minimal", "quiet"],
    tokenOverrides: {
      "--font-display": "Instrument Serif",
      "--accent": "#B85A32",
      "--radius-card": "8px",
      "--shadow-card": "none",
    },
    summary: "Quieter surfaces with one human accent.",
  },
  "bold-contrast": {
    id: "bold-contrast",
    label: "Bold contrast",
    keywords: ["bold", "contrast", "memorable"],
    tokenOverrides: {
      "--font-display": "Instrument Serif",
      "--accent": "#E8926F",
      "--radius-card": "2px",
      "--shadow-card": "0 12px 40px rgba(0,0,0,.45)",
    },
    summary: "Stronger hierarchy and sharper editorial contrast.",
  },
} satisfies Record<string, ArtDirection>;

/** Deterministic single-finding verdict (offline-safe). */
export function classifyFinding(finding: Finding): TasteVerdict {
  return deterministicVerdict(finding);
}

export function classifyFindings(findings: Finding[]): TasteVerdict[] {
  return findings.map(classifyFinding);
}

/** One-line, model-friendly digest of the fingerprint used to ground taste calls. */
export function summarizeFingerprint(fp: DesignFingerprint): string {
  const fonts = fp.fontFamilies.slice(0, 3).map((f) => `${f.family}×${f.count}`).join(", ");
  return [
    `fonts: ${fonts || "n/a"}`,
    `type sizes: ${fp.typeScale.length}`,
    `radii: ${fp.radii.length}`,
    `gradient: ${fp.gradientDetected}`,
    `centered: ${fp.centeredBlockRatio.toFixed(2)}`,
    `emoji: ${fp.emojiInUiCount}`,
    `focus-ring coverage: ${fp.focusRingCoverage.toFixed(2)}`,
  ].join(" · ");
}

/**
 * Classify a whole finding set. Uses the real (Gemini) engine when an api key
 * is supplied, else the deterministic engine. Reflection + fallback are handled
 * inside the engine, so every finding always gets a valid verdict.
 */
export async function classifyWithTaste(
  findings: Finding[],
  fingerprint: DesignFingerprint,
  opts: { apiKey?: string; engine?: TasteEngine } = {},
): Promise<TasteVerdict[]> {
  const engine = opts.engine ?? createTasteEngine(opts.apiKey);
  const ctx = { fingerprintSummary: summarizeFingerprint(fingerprint) };
  return Promise.all(findings.map((f) => engine.classify(f, ctx)));
}

export function parseDirection(input: string): ArtDirection {
  const normalized = input.toLowerCase();
  if (normalized.includes("precision") || normalized.includes("instrument")) return ArtDirection.parse(DIRECTION_PRESETS.precision);
  if (normalized.includes("minimal")) return ArtDirection.parse(DIRECTION_PRESETS["warm-minimal"]);
  if (normalized.includes("bold") || normalized.includes("contrast")) return ArtDirection.parse(DIRECTION_PRESETS["bold-contrast"]);
  return ArtDirection.parse(DIRECTION_PRESETS.editorial);
}
