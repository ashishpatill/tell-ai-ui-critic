import { Finding, TasteVerdict, Verdict } from "@tell/schema";

/** Compact, authoritative facts handed to the model — it must not contradict these. */
export interface TasteContext {
  fingerprintSummary: string;
}

export interface TasteEngine {
  /** Classify one finding into a taste verdict. Never throws. */
  classify(finding: Finding, ctx: TasteContext): Promise<TasteVerdict>;
}

// ── Deterministic engine (offline-safe fallback) ─────────────────────

export function deterministicRationale(finding: Finding): string {
  const detector = String(finding.detector);
  if (finding.verdictHint === "generic") {
    return `${detector} matches a common AI-built UI tell. The evidence is rendered, not guessed, so the fix can target the surface users actually see.`;
  }
  if (finding.verdictHint === "drift") {
    return `${detector} found a split in the visual system. Normalize it into one semantic treatment before future agent edits widen the fracture.`;
  }
  return `${detector} looks deliberate in context. Keep it if this is part of the product's stated direction.`;
}

export function deterministicVerdict(finding: Finding): TasteVerdict {
  return TasteVerdict.parse({
    findingId: finding.id,
    verdict: finding.verdictHint,
    confidence: finding.severity === "high" ? 0.84 : 0.72,
    rationale: deterministicRationale(finding),
    intentionalReason:
      finding.verdictHint === "intentional" ? "The pattern is documented as a deliberate art direction." : undefined,
  });
}

export class DeterministicTasteEngine implements TasteEngine {
  async classify(finding: Finding): Promise<TasteVerdict> {
    return deterministicVerdict(finding);
  }
}

// ── Reflection: reject a candidate that contradicts the facts ────────

/**
 * Deterministic validator (BUILD §6 step 2). Returns null when the candidate
 * is trustworthy, or a short reason string when it contradicts `finding.facts`.
 */
export function contradictionReason(finding: Finding, candidate: TasteVerdict): string | null {
  if (candidate.findingId !== finding.id) return "verdict targets a different finding";
  if (!candidate.rationale || candidate.rationale.length > 500) return "rationale missing or too long";

  const claimsSingleFont = /\b(one|single|only)\b.*\bfont\b|\bfont\b.*\b(one|single|only)\b/i.test(candidate.rationale);
  const ratio = typeof finding.facts.ratio === "number" ? finding.facts.ratio : undefined;
  if (finding.detector === "SystemFontTell" && claimsSingleFont && ratio !== undefined && ratio < 0.8) {
    return `rationale claims a single font stack but adoption ratio is ${ratio.toFixed(2)}`;
  }

  // "intentional" needs a defensible, documented basis in the facts.
  if (candidate.verdict === "intentional") {
    const hasBasis =
      candidate.intentionalReason ||
      "route" in finding.facts ||
      "intentional" in finding.facts ||
      JSON.stringify(finding.facts).includes("intentional");
    if (!hasBasis) return "verdict is intentional but no documented basis in facts";
  }
  return null;
}

// ── Gemini engine (real, guarded, degrades to deterministic) ─────────

const SYSTEM_PROMPT = [
  "You are Tell's taste engine. You classify rendered-UI findings.",
  "You are given deterministic facts you MUST NOT contradict.",
  "Decide one verdict: generic | drift | intentional | uncertain.",
  "generic = a default AI-built pattern; drift = the visual system fractures;",
  "intentional = a defensible, documented design choice (state the choice).",
  "Respond ONLY with minified JSON: {\"verdict\":..,\"confidence\":0..1,\"rationale\":..,\"intentionalReason\"?:..}.",
  "Rationale <= 3 sentences, senior-designer critic voice, no apology, no emoji.",
].join(" ");

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

export class GeminiTasteEngine implements TasteEngine {
  private readonly model: string;
  private readonly doFetch: typeof fetch;
  constructor(private readonly cfg: GeminiConfig) {
    this.model = cfg.model ?? "gemini-2.0-flash";
    this.doFetch = cfg.fetchImpl ?? fetch;
  }

  async classify(finding: Finding, ctx: TasteContext): Promise<TasteVerdict> {
    // Draft → validate → one refine → fallback.
    const draft = await this.ask(finding, ctx);
    if (draft) {
      const reason = contradictionReason(finding, draft);
      if (!reason) return draft;
      const refined = await this.ask(finding, ctx, reason);
      if (refined && !contradictionReason(finding, refined)) return refined;
    }
    return deterministicVerdict(finding);
  }

  private async ask(finding: Finding, ctx: TasteContext, contradiction?: string): Promise<TasteVerdict | null> {
    const userParts = [
      `Detector: ${finding.detector} (family: ${finding.family}, mechanical hint: ${finding.verdictHint}).`,
      `Authoritative facts (do not contradict): ${JSON.stringify(finding.facts)}.`,
      `Fingerprint summary: ${ctx.fingerprintSummary}.`,
      contradiction ? `Your previous answer was rejected because: ${contradiction}. Correct it.` : "",
    ].filter(Boolean).join("\n");

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.cfg.apiKey}`;
      const res = await this.doFetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: userParts }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
        }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;
      const parsed = JSON.parse(stripFences(text)) as {
        verdict?: string; confidence?: number; rationale?: string; intentionalReason?: string;
      };
      const verdict = Verdict.safeParse(parsed.verdict);
      if (!verdict.success) return null;
      return TasteVerdict.parse({
        findingId: finding.id,
        verdict: verdict.data,
        confidence: clamp01(parsed.confidence ?? 0.6),
        rationale: String(parsed.rationale ?? "").trim(),
        intentionalReason: parsed.intentionalReason,
      });
    } catch {
      return null; // network/parse/zod failure → caller falls back
    }
  }
}

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}
function clamp01(n: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0.6));
}

/**
 * Pick a real engine when an API key is supplied, else the deterministic one.
 * Callers pass `process.env.GEMINI_API_KEY` (kept out of this package so it
 * stays free of a Node type dependency and safe to run in any environment).
 */
export function createTasteEngine(apiKey?: string): TasteEngine {
  return apiKey ? new GeminiTasteEngine({ apiKey }) : new DeterministicTasteEngine();
}
