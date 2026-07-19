import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { CapturePayload, ScenarioMatrix } from "@tell/schema";
import { buildFingerprint } from "../fingerprint/build-fingerprint";
import { detectFindings } from "../detectors";
import { compareProofMatrices } from "../proof-verify";
import { buildScenario, scenarioId } from "../capture/scenario-matrix";

type CorpusManifest = {
  version: number;
  categories: Array<{
    id: string;
    label: string;
    capturePath?: string;
    expectedDetectors?: string[];
    notes?: string;
  }>;
  scenarioMatrixPath?: string;
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

const GOLDEN_CAPTURE_IDS = [
  "ai-saas-generic",
  "editorial-calm",
  "fintech-dense",
  "marketplace-clutter",
  "docs-site-calm",
] as const;

describe("detector golden corpus manifest", () => {
  it("declares the primary AI-SaaS category with a committed capture", () => {
    const primary = manifest.categories.find((c) => c.id === "ai-saas-generic");
    expect(primary?.capturePath).toBe("fixtures/reports/capture.json");
    expect(primary?.expectedDetectors?.length).toBe(14);
  });

  it.each(GOLDEN_CAPTURE_IDS)("matches golden detectors for %s", (id) => {
    const category = manifest.categories.find((c) => c.id === id);
    expect(category?.capturePath, id).toBeTruthy();
    const capture = CapturePayload.parse(
      JSON.parse(readFileSync(join(root, category!.capturePath!), "utf8")),
    );
    const detectors = detectFindings(buildFingerprint(capture), capture)
      .map((f) => f.detector)
      .sort();
    expect(detectors, id).toEqual([...(category!.expectedDetectors ?? [])].sort());
  });

  it("documents intentional and dogfood categories for expansion", () => {
    const ids = manifest.categories.map((c) => c.id);
    expect(ids).toContain("intentional-brutalist");
    expect(ids).toContain("tell-dogfood");
  });
});

describe("open taxonomy benchmark", () => {
  it("maps every core detector used by corpus golden categories", () => {
    const taxonomyDetectors = new Set(taxonomy.tells.map((t) => t.detector));
    for (const id of GOLDEN_CAPTURE_IDS) {
      const category = manifest.categories.find((c) => c.id === id);
      for (const detector of category?.expectedDetectors ?? []) {
        expect(taxonomyDetectors.has(detector), `${id}:${detector}`).toBe(true);
      }
    }
  });

  it("declares tell and drift families including ResponsiveViewportDrift", () => {
    const families = new Set(taxonomy.tells.map((t) => t.family));
    expect(families.has("tell")).toBe(true);
    expect(families.has("drift")).toBe(true);
    expect(taxonomy.tells.some((t) => t.detector === "ResponsiveViewportDrift")).toBe(true);
    expect(taxonomy.tells.length).toBeGreaterThanOrEqual(15);
  });
});

describe("scenario matrix fixture", () => {
  it("is declared on the corpus manifest and parses as ScenarioMatrix", () => {
    expect(manifest.scenarioMatrixPath).toBe("fixtures/corpus/scenario-matrix.json");
    const matrix = ScenarioMatrix.parse(
      JSON.parse(readFileSync(join(root, manifest.scenarioMatrixPath!), "utf8")),
    );
    expect(matrix.cells.length).toBeGreaterThanOrEqual(6);
  });

  it("covers route × viewport × theme × interaction dimensions", () => {
    const matrix = ScenarioMatrix.parse(
      JSON.parse(readFileSync(join(root, "fixtures/corpus/scenario-matrix.json"), "utf8")),
    );
    const routes = new Set(matrix.cells.map((c) => c.scenario.route));
    const viewports = new Set(matrix.cells.map((c) => c.scenario.viewport));
    const themes = new Set(matrix.cells.map((c) => c.scenario.theme));
    const interactions = new Set(matrix.cells.map((c) => c.scenario.interaction));
    expect(routes.has("/") && routes.has("/pricing")).toBe(true);
    expect(viewports.has("desktop") && viewports.has("tablet") && viewports.has("mobile")).toBe(true);
    expect(themes.has("light") && themes.has("dark")).toBe(true);
    expect(interactions.has("default") && interactions.has("hover") && interactions.has("focus")).toBe(true);
  });

  it("uses stable scenario ids", () => {
    const built = buildScenario({
      route: "/pricing",
      viewport: "mobile",
      theme: "dark",
      interaction: "hover",
    });
    expect(built.id).toBe(scenarioId(built));
    expect(built.id).toBe("pricing__mobile__dark__hover__anonymous");
  });

  it("compareProofMatrices self-compare returns review with matched cells", () => {
    const matrix = ScenarioMatrix.parse(
      JSON.parse(readFileSync(join(root, "fixtures/corpus/scenario-matrix.json"), "utf8")),
    );
    const result = compareProofMatrices(matrix, matrix);
    expect(result.status).toBe("review");
    expect(result.matchedCells).toBe(matrix.cells.length);
    expect(result.skippedCells).toBe(0);
    expect(result.cells.every((c) => c.status === "review")).toBe(true);
  });
});
