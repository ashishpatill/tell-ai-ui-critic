import { NextResponse } from "next/server";
import { TellReport } from "@tell/schema";
import { getJob } from "@/lib/repo-runner";
import { runDiagnose } from "@/lib/run-diagnose";
import { applyPatchToWorkspace, revertWorkspacePatch } from "@/lib/source-worktree";

export const runtime = "nodejs";
export const maxDuration = 180;

function scoreOf(report: TellReport): number {
  return report.measures?.score ?? Math.min(100, report.score.generic * 12 + report.score.drift * 7);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  const patch = typeof body.patch === "string" ? body.patch : "";
  const parsedBefore = TellReport.safeParse(body.beforeReport);
  const job = getJob(jobId);
  if (!job || !job.url) return NextResponse.json({ error: "The repo is not running. Set it up again before proving the patch." }, { status: 400 });
  if (!parsedBefore.success) return NextResponse.json({ error: "The baseline report is missing or invalid." }, { status: 400 });
  const beforeUrl = new URL(parsedBefore.data.capture.url);
  const jobUrl = new URL(job.url);
  if (beforeUrl.origin !== jobUrl.origin) {
    return NextResponse.json(
      { error: "The baseline does not belong to this checkout. Recapture the running repo before proving its patch." },
      { status: 400 },
    );
  }
  const proofUrl = new URL(`${beforeUrl.pathname}${beforeUrl.search}`, jobUrl).toString();

  let applied: Awaited<ReturnType<typeof applyPatchToWorkspace>> | null = null;
  try {
    applied = await applyPatchToWorkspace(jobId, patch);
    // Let Vite/Next HMR rebuild the changed source before capturing rendered truth.
    await new Promise((resolve) => setTimeout(resolve, 1800));
    const afterReport = await runDiagnose(proofUrl);
    const before = parsedBefore.data;
    const beforeScore = scoreOf(before);
    const afterScore = scoreOf(afterReport);
    const focusBefore = before.fingerprint.focusRingCoverage;
    const focusAfter = afterReport.fingerprint.focusRingCoverage;
    const scoreDelta = afterScore - beforeScore;
    const screenshotsDiffer = before.capture.screenshotBase64 !== afterReport.capture.screenshotBase64;
    const focusRegressed = focusAfter + 0.02 < focusBefore;
    const beforeStructure = before.capture.domSummary;
    const afterStructure = afterReport.capture.domSummary;
    const headingFloor = Math.max(1, Math.floor(beforeStructure.headingCount * 0.8));
    const buttonFloor = beforeStructure.buttonCount ? Math.max(1, Math.floor(beforeStructure.buttonCount * 0.8)) : 0;
    const structureRegressed =
      afterStructure.headingCount < headingFloor ||
      afterStructure.buttonCount < buttonFloor ||
      afterReport.capture.styles.length < Math.max(8, before.capture.styles.length * 0.75);
    const status = scoreDelta <= -3 && screenshotsDiffer && !focusRegressed && !structureRegressed
      ? "passed"
      : scoreDelta <= 3 && !focusRegressed && !structureRegressed
        ? "review"
        : "failed";

    return NextResponse.json({
      status,
      afterReport,
      proof: {
        beforeScore,
        afterScore,
        scoreDelta,
        findingsBefore: before.score.total,
        findingsAfter: afterReport.score.total,
        focusBefore,
        focusAfter,
        focusRegressed,
        screenshotsDiffer,
        structureRegressed,
        headingsBefore: beforeStructure.headingCount,
        headingsAfter: afterStructure.headingCount,
        buttonsBefore: beforeStructure.buttonCount,
        buttonsAfter: afterStructure.buttonCount,
        changedFiles: applied.files,
        capturedAt: afterReport.capture.capturedAt,
        url: proofUrl,
      },
    });
  } catch (error) {
    if (applied) await revertWorkspacePatch(jobId).catch(() => {});
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), rolledBack: Boolean(applied) },
      { status: 400 },
    );
  }
}
