import { describe, it, expect } from "vitest";
import { Finding } from "@tell/schema";
import { GeminiTasteEngine } from "../src/engine";

const ctx = { fingerprintSummary: "fonts: Inter×40 · gradient: true" };

function systemFontFinding(ratio: number): Finding {
  return Finding.parse({
    id: "tell-system-font",
    family: "tell",
    detector: "SystemFontTell",
    verdictHint: "generic",
    severity: "high",
    facts: { family: "Inter", ratio },
    evidence: [{ kind: "computed", label: "Primary typeface", value: "Inter" }],
  });
}

/** Build a fake fetch that returns a Gemini-shaped response wrapping `modelJson`. */
function fakeFetch(modelJson: Record<string, unknown>): typeof fetch {
  return (async () => ({
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(modelJson) }] } }],
    }),
  })) as unknown as typeof fetch;
}

describe("GeminiTasteEngine reflection loop", () => {
  it("accepts a model verdict that does not contradict the facts", async () => {
    const engine = new GeminiTasteEngine({
      apiKey: "test",
      fetchImpl: fakeFetch({
        verdict: "generic",
        confidence: 0.9,
        rationale: "Inter carries every text role — a default stack, not a considered choice.",
      }),
    });
    const verdict = await engine.classify(systemFontFinding(1), ctx);
    expect(verdict.verdict).toBe("generic");
    expect(verdict.confidence).toBe(0.9);
    expect(verdict.rationale).toContain("every text role");
  });

  it("rejects a verdict that contradicts the facts and falls back to deterministic", async () => {
    // Model claims a single-font stack, but adoption ratio is only 0.4.
    const engine = new GeminiTasteEngine({
      apiKey: "test",
      fetchImpl: fakeFetch({
        verdict: "generic",
        confidence: 0.95,
        rationale: "Only one font is used across the entire product.",
      }),
    });
    const verdict = await engine.classify(systemFontFinding(0.4), ctx);
    // Deterministic fallback marker, not the model's contradictory rationale.
    expect(verdict.rationale).toContain("common AI-built UI tell");
    expect(verdict.rationale).not.toContain("Only one font");
    expect(verdict.verdict).toBe("generic"); // falls back to the mechanical hint
  });

  it("falls back when the API returns a non-ok response", async () => {
    const engine = new GeminiTasteEngine({
      apiKey: "test",
      fetchImpl: (async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch,
    });
    const verdict = await engine.classify(systemFontFinding(1), ctx);
    expect(verdict.rationale).toContain("common AI-built UI tell");
  });
});
