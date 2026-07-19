import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { ProofMatrixResult, type ScenarioMatrix, type TellReport } from "@tell/schema";
import { captureUrl } from "./capture/capture-url";
import { diagnoseCapture } from "./diagnose";

export type ProofVerifyResult = {
  status: "passed" | "review" | "failed";
  beforeReport: TellReport;
  afterReport: TellReport;
  proof: {
    beforeScore: number;
    afterScore: number;
    scoreDelta: number;
    findingsBefore: number;
    findingsAfter: number;
    focusBefore: number;
    focusAfter: number;
    focusRegressed: boolean;
    screenshotsDiffer: boolean;
    structureRegressed: boolean;
    headingsBefore: number;
    headingsAfter: number;
    buttonsBefore: number;
    buttonsAfter: number;
    url: string;
    capturedAt: string;
  };
  reverted: boolean;
  error?: string;
};

function scoreOf(report: TellReport): number {
  return report.measures?.score ?? Math.min(100, report.score.generic * 12 + report.score.drift * 7);
}

function gitApply(args: string[], cwd: string, patch: string): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("git", ["apply", ...args], { cwd, stdio: ["pipe", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.on("close", (code) => resolve({ ok: code === 0, stderr: stderr.trim() }));
    child.stdin.end(patch);
  });
}

export async function verifyProofPatch(input: {
  url: string;
  patch: string;
  projectRoot: string;
  waitMs?: number;
  revertOnFail?: boolean;
}): Promise<ProofVerifyResult> {
  const projectRoot = path.resolve(input.projectRoot);
  const waitMs = input.waitMs ?? 1800;
  const revertOnFail = input.revertOnFail ?? true;
  const patchMarker = path.join(projectRoot, ".git", "tell-proof-mcp.patch");

  const beforeCapture = await captureUrl(input.url);
  const beforeReport = diagnoseCapture(beforeCapture);

  const check = await gitApply(["--check", "--whitespace=nowarn"], projectRoot, input.patch);
  if (!check.ok) {
    return {
      status: "failed",
      beforeReport,
      afterReport: beforeReport,
      proof: buildProof(beforeReport, beforeReport, input.url),
      reverted: false,
      error: check.stderr || "Patch did not apply cleanly.",
    };
  }

  const applied = await gitApply(["--whitespace=nowarn"], projectRoot, input.patch);
  if (!applied.ok) {
    return {
      status: "failed",
      beforeReport,
      afterReport: beforeReport,
      proof: buildProof(beforeReport, beforeReport, input.url),
      reverted: false,
      error: applied.stderr || "Patch could not be applied.",
    };
  }

  await fs.writeFile(patchMarker, input.patch, "utf8").catch(() => {});

  try {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    const afterCapture = await captureUrl(input.url);
    const afterReport = diagnoseCapture(afterCapture);
    const proof = buildProof(beforeReport, afterReport, input.url);
    const status = verdictFromProof(proof);

    if (status === "failed" && revertOnFail) {
      await gitApply(["-R", "--whitespace=nowarn"], projectRoot, input.patch);
      await fs.rm(patchMarker, { force: true });
      return { status, beforeReport, afterReport, proof, reverted: true };
    }

    return { status, beforeReport, afterReport, proof, reverted: false };
  } catch (error) {
    await gitApply(["-R", "--whitespace=nowarn"], projectRoot, input.patch).catch(() => {});
    await fs.rm(patchMarker, { force: true });
    throw error;
  }
}

export async function revertProofPatch(projectRoot: string, patch?: string): Promise<boolean> {
  const root = path.resolve(projectRoot);
  const marker = path.join(root, ".git", "tell-proof-mcp.patch");
  const patchText = patch ?? await fs.readFile(marker, "utf8").catch(() => "");
  if (!patchText) return false;
  const reverted = await gitApply(["-R", "--whitespace=nowarn"], root, patchText);
  await fs.rm(marker, { force: true });
  return reverted.ok;
}

export function compareProofReports(before: TellReport, after: TellReport, url: string) {
  const proof = buildProof(before, after, url);
  return { status: verdictFromProof(proof), proof };
}

/**
 * Compare two scenario matrices cell-by-cell (matched by scenario.id).
 * Aggregate: any failed → failed; all passed → passed; else review.
 * Missing counterpart cells are skipped (counted, not failed).
 */
export function compareProofMatrices(before: ScenarioMatrix, after: ScenarioMatrix): ProofMatrixResult {
  const afterById = new Map(after.cells.map((cell) => [cell.scenario.id, cell]));
  const cells = [];
  let matched = 0;
  let skipped = 0;

  for (const beforeCell of before.cells) {
    const afterCell = afterById.get(beforeCell.scenario.id);
    if (!afterCell) {
      skipped += 1;
      cells.push({
        scenarioId: beforeCell.scenario.id,
        status: "skipped" as const,
        beforeScore: 0,
        afterScore: 0,
        scoreDelta: 0,
        focusRegressed: false,
        structureRegressed: false,
        screenshotsDiffer: false,
        error: "No matching after cell for scenario id",
      });
      continue;
    }
    matched += 1;
    const beforeReport = diagnoseCapture(beforeCell.capture);
    const afterReport = diagnoseCapture(afterCell.capture);
    const { status, proof } = compareProofReports(beforeReport, afterReport, afterCell.capture.url);
    cells.push({
      scenarioId: beforeCell.scenario.id,
      status,
      beforeScore: proof.beforeScore,
      afterScore: proof.afterScore,
      scoreDelta: proof.scoreDelta,
      focusRegressed: proof.focusRegressed,
      structureRegressed: proof.structureRegressed,
      screenshotsDiffer: proof.screenshotsDiffer,
    });
  }

  for (const afterCell of after.cells) {
    if (!before.cells.some((c) => c.scenario.id === afterCell.scenario.id)) {
      skipped += 1;
      cells.push({
        scenarioId: afterCell.scenario.id,
        status: "skipped" as const,
        beforeScore: 0,
        afterScore: 0,
        scoreDelta: 0,
        focusRegressed: false,
        structureRegressed: false,
        screenshotsDiffer: false,
        error: "No matching before cell for scenario id",
      });
    }
  }

  const active = cells.filter((c) => c.status !== "skipped");
  let status: ProofMatrixResult["status"] = "review";
  if (active.some((c) => c.status === "failed")) status = "failed";
  else if (active.length > 0 && active.every((c) => c.status === "passed")) status = "passed";

  return ProofMatrixResult.parse({
    status,
    cells,
    url: after.baseUrl || before.baseUrl,
    capturedAt: after.capturedAt || before.capturedAt,
    matchedCells: matched,
    skippedCells: skipped,
  });
}

function buildProof(before: TellReport, after: TellReport, url: string) {
  const beforeScore = scoreOf(before);
  const afterScore = scoreOf(after);
  const focusBefore = before.fingerprint.focusRingCoverage;
  const focusAfter = after.fingerprint.focusRingCoverage;
  const beforeStructure = before.capture.domSummary;
  const afterStructure = after.capture.domSummary;
  const headingFloor = Math.max(1, Math.floor(beforeStructure.headingCount * 0.8));
  const buttonFloor = beforeStructure.buttonCount ? Math.max(1, Math.floor(beforeStructure.buttonCount * 0.8)) : 0;
  return {
    beforeScore,
    afterScore,
    scoreDelta: afterScore - beforeScore,
    findingsBefore: before.score.total,
    findingsAfter: after.score.total,
    focusBefore,
    focusAfter,
    focusRegressed: focusAfter + 0.02 < focusBefore,
    screenshotsDiffer: before.capture.screenshotBase64 !== after.capture.screenshotBase64,
    structureRegressed:
      afterStructure.headingCount < headingFloor ||
      afterStructure.buttonCount < buttonFloor ||
      after.capture.styles.length < Math.max(8, before.capture.styles.length * 0.75),
    headingsBefore: beforeStructure.headingCount,
    headingsAfter: afterStructure.headingCount,
    buttonsBefore: beforeStructure.buttonCount,
    buttonsAfter: afterStructure.buttonCount,
    url,
    capturedAt: after.capture.capturedAt,
  };
}

function verdictFromProof(proof: ProofVerifyResult["proof"]): ProofVerifyResult["status"] {
  if (proof.scoreDelta <= -3 && proof.screenshotsDiffer && !proof.focusRegressed && !proof.structureRegressed) {
    return "passed";
  }
  if (proof.scoreDelta <= 3 && !proof.focusRegressed && !proof.structureRegressed) {
    return "review";
  }
  return "failed";
}
