import { NextResponse } from "next/server";
import { startSetup } from "@/lib/repo-runner";
import { assertRepoSetupEnabled } from "@/lib/setup-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blocked = assertRepoSetupEnabled();
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));
  const repoUrl = typeof body.repoUrl === "string" ? body.repoUrl : "";
  const result = startSetup(repoUrl);
  if (!("id" in result)) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ job: result });
}
