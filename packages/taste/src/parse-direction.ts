import { ArtDirection } from "@tell/schema";
import { DIRECTION_PRESETS } from "./presets";

export type DirectionPresetId = keyof typeof DIRECTION_PRESETS;

export type DirectionActionItem = {
  id: string;
  label: string;
  category: "typography" | "color" | "spacing" | "depth" | "tone" | "other";
};

export type DirectionPlan = {
  presetId: DirectionPresetId;
  summary: string;
  actionItems: DirectionActionItem[];
  artDirection: ArtDirection;
};

const CATEGORY_PATTERNS: Record<DirectionActionItem["category"], RegExp> = {
  typography: /\b(font|serif|sans|mono|type|headline|bold|weight|letter|italic|grotesk)\b/i,
  color: /\b(warm|cool|color|accent|palette|hue|saturation|brand|terra|paper|neutral)\b/i,
  depth: /\b(shadow|depth|elevation|flat|layer|card|lift)\b/i,
  spacing: /\b(spacing|padding|margin|density|airy|tight|compact|room|breath)\b/i,
  tone: /\b(editorial|minimal|precise|instrument|contrast|quiet|human|memorable|considered|explainer|essay|textbook|curious|educational)\b/i,
  other: /.*/,
};

function inferCategory(label: string): DirectionActionItem["category"] {
  for (const category of ["typography", "color", "depth", "spacing", "tone"] as const) {
    if (CATEGORY_PATTERNS[category].test(label)) return category;
  }
  return "other";
}

function capitalize(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Split compound voice instructions into discrete action items. */
export function dissectInstructions(input: string): DirectionActionItem[] {
  const cleaned = input.trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(/\s*(?:[,;]|(?:\band then\b|\bthen\b|\balso\b|\bplus\b|\band\b|\bwith\b))\s+/i)
    .map((part) => part.replace(/^(make it|make the|i want|please|more|less)\s+/i, "").trim())
    .filter((part) => part.length > 1);

  const labels = parts.length > 0 ? parts : [cleaned];
  return labels.map((label, index) => ({
    id: `action-${index}`,
    label: capitalize(label),
    category: inferCategory(label),
  }));
}

function scorePreset(input: string): Record<DirectionPresetId, number> {
  const normalized = input.toLowerCase();
  const scores: Record<DirectionPresetId, number> = {
    editorial: 0,
    precision: 0,
    "warm-minimal": 0,
    "bold-contrast": 0,
    luxury: 0,
    brutalist: 0,
    explainer: 0,
  };

  if (/\b(precision|instrument|mono|measured|data|sharp|grotesk|technical|clinical)\b/.test(normalized)) {
    scores.precision += 2;
  }
  if (/\b(minimal|quiet|flat|restrain|simple|calm|subtle)\b|less shadow|no shadow/.test(normalized)) {
    scores["warm-minimal"] += 2;
  }
  if (/\b(bold|contrast|dramatic|memorable|heavy|punchy|loud)\b|high contrast/.test(normalized)) {
    scores["bold-contrast"] += 2;
  }
  if (/\b(luxury|premium|refined|elegant|classic|sophisticated|hospitality)\b/.test(normalized)) {
    scores.luxury += 2;
  }
  if (/\b(brutalist|raw|utility|structural|industrial|mono|uppercase)\b|ink border/.test(normalized)) {
    scores.brutalist += 2;
  }
  if (
    /\b(explainer|essay|textbook|education|educational|blog|diagram|illustration|longform|book|interactive|curious)\b|how[\s-]?it[\s-]?works|visual textbook|interactive essay/.test(
      normalized,
    )
  ) {
    scores.explainer += 3;
  }
  if (/\b(editorial|serif|warm|paper|human|magazine|story)\b/.test(normalized)) {
    scores.editorial += 2;
  }

  for (const [id, preset] of Object.entries(DIRECTION_PRESETS) as [DirectionPresetId, ArtDirection][]) {
    for (const keyword of preset.keywords) {
      if (normalized.includes(keyword.toLowerCase())) scores[id] += 1;
    }
  }

  return scores;
}

export function inferPresetId(input: string): DirectionPresetId {
  const scores = scorePreset(input);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestId, bestScore] = ranked[0] ?? ["editorial", 0];
  return bestScore > 0 ? (bestId as DirectionPresetId) : "editorial";
}

export function parseDirectionPlan(input: string): DirectionPlan {
  const presetId = inferPresetId(input);
  const actionItems = dissectInstructions(input);
  const preset = DIRECTION_PRESETS[presetId];
  return {
    presetId,
    summary: actionItems.length > 0 ? actionItems.map((item) => item.label).join(" · ") : preset.summary,
    actionItems,
    artDirection: ArtDirection.parse(preset),
  };
}

const VOICE_SYSTEM_PROMPT = [
  "You parse voice art-direction instructions for Tell, a UI taste engine.",
  "Break compound instructions into separate actionable items.",
  "Pick the closest preset: editorial | precision | warm-minimal | bold-contrast | luxury | brutalist | explainer.",
  "Respond ONLY with JSON:",
  '{"presetId":"...","summary":"one line","actionItems":[{"label":"...","category":"typography|color|spacing|depth|tone|other"}],',
  '"tokenOverrides":{"--font-display":"...","--accent":"#RRGGBB","--radius-card":"...","--shadow-card":"..."}}',
].join(" ");

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

/** Gemini-backed parser; falls back to deterministic dissect when unavailable. */
export async function parseDirectionWithGemini(
  input: string,
  apiKey: string,
  opts: { fetchImpl?: typeof fetch; model?: string } = {},
): Promise<DirectionPlan> {
  const fallback = parseDirectionPlan(input);
  const transcript = input.trim();
  if (!transcript || transcript.length < 3) return fallback;

  const doFetch = opts.fetchImpl ?? fetch;
  const model = opts.model ?? "gemini-2.0-flash";

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await doFetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: VOICE_SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: `Transcript: ${transcript}` }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
      }),
    });
    if (!res.ok) return fallback;

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallback;

    const parsed = JSON.parse(stripFences(text)) as {
      presetId?: string;
      summary?: string;
      actionItems?: { label?: string; category?: string }[];
      tokenOverrides?: Record<string, string>;
    };

    const presetId = (
      ["editorial", "precision", "warm-minimal", "bold-contrast", "luxury", "brutalist", "explainer"] as const
    ).includes(parsed.presetId as DirectionPresetId)
      ? (parsed.presetId as DirectionPresetId)
      : fallback.presetId;

    const base = DIRECTION_PRESETS[presetId];
    const actionItems =
      parsed.actionItems?.length
        ? parsed.actionItems.map((item, index) => ({
            id: `action-${index}`,
            label: capitalize(String(item.label ?? "").trim()) || fallback.actionItems[index]?.label || "Refine direction",
            category: inferCategory(String(item.label ?? "")),
          }))
        : fallback.actionItems;

    const artDirection = ArtDirection.parse({
      ...base,
      summary: String(parsed.summary ?? fallback.summary).trim() || base.summary,
      tokenOverrides: { ...base.tokenOverrides, ...(parsed.tokenOverrides ?? {}) },
    });

    return {
      presetId,
      summary: artDirection.summary,
      actionItems: actionItems.length > 0 ? actionItems : fallback.actionItems,
      artDirection,
    };
  } catch {
    return fallback;
  }
}
