import { NextResponse } from "next/server";
import { TellReport } from "@tell/schema";
import { compareProofReports, verifyProofPatch } from "@tell/core";
import { hasRemoteBackend, proxyRemoteBackend } from "@/lib/remote-api";
import { assertRepoSetupEnabled } from "@/lib/setup-guard";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  if (hasRemoteBackend()) {
    return proxyRemoteBackend(request, "/api/proof/verify", { timeoutMs: 180_000 });
  }

  const body = await request.json().catch(() => ({}));
  const mode = body.mode === "compare" ? "compare" : "patch";

  if (mode === "compare") {
    const parsedBefore = TellReport.safeParse(body.beforeReport);
    const parsedAfter = TellReport.safeParse(body.afterReport);
    const url = typeof body.url === "string" ? body.url : "";
    if (!parsedBefore.success || !parsedAfter.success || !url) {
      return NextResponse.json({ error: "Compare mode needs url, beforeReport, and afterReport." }, { status: 400 });
    }
    const { status, proof } = compareProofReports(parsedBefore.data, parsedAfter.data, url);
    return NextResponse.json({ status, beforeReport: parsedBefore.data, afterReport: parsedAfter.data, proof, reverted: false });
  }

  const blocked = assertRepoSetupEnabled(request);
  if (blocked) return blocked;

  const url = typeof body.url === "string" ? body.url : "";
  const patch = typeof body.patch === "string" ? body.patch : "";
  const projectRoot = typeof body.projectRoot === "string" ? body.projectRoot : process.cwd();
  const waitMs = typeof body.waitMs === "number" ? body.waitMs : undefined;
  const revertOnFail = typeof body.revertOnFail === "boolean" ? body.revertOnFail : undefined;

  if (!url || !patch) {
    return NextResponse.json({ error: "Patch mode needs a reachable url and a unified diff patch." }, { status: 400 });
  }

  try {
    const result = await verifyProofPatch({ url, patch, projectRoot, waitMs, revertOnFail });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error), status: "failed", reverted: false },
      { status: 400 },
    );
  }
}
