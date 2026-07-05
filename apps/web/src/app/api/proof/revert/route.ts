import { NextResponse } from "next/server";
import { revertWorkspacePatch } from "@/lib/source-worktree";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  if (!jobId) return NextResponse.json({ error: "Missing job id." }, { status: 400 });
  try {
    return NextResponse.json(await revertWorkspacePatch(jobId));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
