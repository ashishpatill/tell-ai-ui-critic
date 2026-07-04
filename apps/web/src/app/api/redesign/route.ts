import { NextResponse } from "next/server";
import { BrandDNA, TellReport } from "@tell/schema";
import { parseDirection } from "@tell/taste";
import { demoReport } from "@/lib/demo-report";
import { proposeWithCursorAgent } from "@/lib/cursor-redesign";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedReport = TellReport.safeParse(body.report);
  const report = parsedReport.success ? parsedReport.data : demoReport;
  const direction = typeof body.direction === "string" ? body.direction : "editorial";
  const findingId = typeof body.findingId === "string" ? body.findingId : undefined;
  const parsedDna = BrandDNA.safeParse(body.dna);
  const dna = parsedDna.success ? parsedDna.data : undefined;

  const proposal = await proposeWithCursorAgent(report, parseDirection(direction), findingId, dna);
  return NextResponse.json(proposal);
}
