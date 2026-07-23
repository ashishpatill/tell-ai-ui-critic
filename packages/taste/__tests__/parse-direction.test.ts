import { describe, expect, it } from "vitest";
import { dissectInstructions, inferPresetId, parseDirectionPlan, parseDirectionWithGemini } from "../src/parse-direction";

describe("parseDirectionPlan", () => {
  it("dissects compound instructions into action items", () => {
    const plan = parseDirectionPlan("warmer, more editorial, and less shadow");
    expect(plan.actionItems.length).toBeGreaterThanOrEqual(2);
    expect(plan.actionItems.some((item) => /editorial/i.test(item.label))).toBe(true);
    expect(plan.actionItems.some((item) => /shadow/i.test(item.label))).toBe(true);
  });

  it("maps precision language to the precision preset", () => {
    expect(inferPresetId("precision instrument with mono headlines")).toBe("precision");
  });

  it("maps minimal language to warm-minimal", () => {
    expect(inferPresetId("quiet minimal surfaces with less shadow")).toBe("warm-minimal");
  });

  it("maps luxury and brutalist language to their presets", () => {
    expect(inferPresetId("classic luxury hospitality feel")).toBe("luxury");
    expect(inferPresetId("raw brutalist utility with ink borders")).toBe("brutalist");
  });

  it("maps educational and blog language to the explainer preset", () => {
    expect(inferPresetId("visual textbook explainer with diagrams")).toBe("explainer");
    expect(inferPresetId("educational blog essay, illustration-first")).toBe("explainer");
    expect(inferPresetId("how it works interactive essay")).toBe("explainer");
  });

  it("assigns categories to action items", () => {
    const items = dissectInstructions("serif headlines, warmer accent, flat cards");
    expect(items.find((item) => item.category === "typography")).toBeTruthy();
    expect(items.find((item) => item.category === "color")).toBeTruthy();
    expect(items.find((item) => item.category === "depth")).toBeTruthy();
  });
});

describe("parseDirectionWithGemini", () => {
  it("falls back to deterministic parsing when the API fails", async () => {
    const plan = await parseDirectionWithGemini("bold contrast with heavy headlines", "test-key", {
      fetchImpl: (async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch,
    });
    expect(plan.presetId).toBe("bold-contrast");
    expect(plan.actionItems.length).toBeGreaterThan(0);
  });

  it("uses Gemini output when available", async () => {
    const plan = await parseDirectionWithGemini("warmer editorial serif", "test-key", {
      fetchImpl: (async () => ({
        ok: true,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  presetId: "editorial",
                  summary: "Warm editorial serif direction",
                  actionItems: [
                    { label: "Use serif headlines", category: "typography" },
                    { label: "Warm the accent", category: "color" },
                  ],
                  tokenOverrides: { "--accent": "#C45A32" },
                }),
              }],
            },
          }],
        }),
      })) as unknown as typeof fetch,
    });
    expect(plan.presetId).toBe("editorial");
    expect(plan.actionItems).toHaveLength(2);
    expect(plan.artDirection.tokenOverrides["--accent"]).toBe("#C45A32");
  });
});
