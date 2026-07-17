import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { CapturePayload } from "@tell/schema";
import { buildFingerprint } from "../fingerprint/build-fingerprint";
import { detectFindings } from "../detectors";

type CorpusManifest = {
  version: number;
  categories: Array<{
    id: string;
    label: string;
    capturePath?: string;
    expectedDetectors?: string[];
    notes?: string;
  }>;
};

type Taxonomy = {
  version: number;
  tells: Array<{ id: string; detector: string; family: string }>;
};

const root = join(process.cwd());
const manifest = JSON.parse(
  readFileSync(join(root, "fixtures/corpus/manifest.json"), "utf8"),
) as CorpusManifest;
const taxonomy = JSON.parse(
  readFileSync(join(root, "fixtures/corpus/taxonomy.json"), "utf8"),
) as Taxonomy;

describe("detector golden corpus manifest", () => {
  it("declares the primary AI-SaaS category with a committed capture", () => {
    const primary = manifest.categories.find((c) => c.id === "ai-saas-generic");
    expect(primary?.capturePath).toBe("fixtures/reports/capture.json");
    expect(primary?.expectedDetectors?.length).toBe(14);
  });

  it("matches the golden detector set on the committed generic fixture capture", () => {
    const primary = manifest.categories.find((c) => c.id === "ai-saas-generic");
    const capturePath = primary?.capturePath ?? "fixtures/reports/capture.json";
    const capture = CapturePayload.parse(
      JSON.parse(readFileSync(join(root, capturePath), "utf8")),
    );
    const findings = detectFindings(buildFingerprint(capture), capture);
    const detectors = findings.map((f) => f.detector).sort();
    expect(detectors).toEqual([...(primary?.expectedDetectors ?? [])].sort());
  });

  it("matches editorial-calm and fintech-dense corpus captures", () => {
    for (const id of ["editorial-calm", "fintech-dense"] as const) {
      const category = manifest.categories.find((c) => c.id === id);
      expect(category?.capturePath, id).toBeTruthy();
      const capture = CapturePayload.parse(
        JSON.parse(readFileSync(join(root, category!.capturePath!), "utf8")),
      );
      const detectors = detectFindings(buildFingerprint(capture), capture)
        .map((f) => f.detector)
        .sort();
      expect(detectors, id).toEqual([...(category!.expectedDetectors ?? [])].sort());
    }
  });

  it("documents intentional and dogfood categories for expansion", () => {
    const ids = manifest.categories.map((c) => c.id);
    expect(ids).toContain("intentional-brutalist");
    expect(ids).toContain("tell-dogfood");
  });
});

describe("open taxonomy benchmark", () => {
  it("maps every core detector used by the primary corpus category", () => {
    const primary = manifest.categories.find((c) => c.id === "ai-saas-generic");
    const taxonomyDetectors = new Set(taxonomy.tells.map((t) => t.detector));
    for (const detector of primary?.expectedDetectors ?? []) {
      expect(taxonomyDetectors.has(detector), detector).toBe(true);
    }
  });

  it("declares tell and drift families", () => {
    const families = new Set(taxonomy.tells.map((t) => t.family));
    expect(families.has("tell")).toBe(true);
    expect(families.has("drift")).toBe(true);
    expect(taxonomy.tells.length).toBeGreaterThanOrEqual(14);
  });
});
