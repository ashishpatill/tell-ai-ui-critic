import { NextResponse } from "next/server";
import { trace, SpanStatusCode, type Span } from "@opentelemetry/api";
import { BrandDNA, TellReport } from "@tell/schema";
import { parseDirection, type DirectionPlan } from "@tell/taste";
import { demoReport } from "@/lib/demo-report";
import { proposeWithCursorAgent } from "@/lib/cursor-redesign";

const tracer = trace.getTracer("tell.redesign");

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedReport = TellReport.safeParse(body.report);
  const report = parsedReport.success ? parsedReport.data : demoReport;
  const directionPlan = body.directionPlan as DirectionPlan | undefined;
  const directionText = typeof body.direction === "string" ? body.direction : directionPlan?.summary ?? "editorial";
  const findingId = typeof body.findingId === "string" ? body.findingId : undefined;
  const parsedDna = BrandDNA.safeParse(body.dna);
  const dna = parsedDna.success ? parsedDna.data : undefined;

  return tracer.startActiveSpan("tell.redesign", async (span: Span) => {
    span.setAttributes({
      "tell.direction": directionText,
      "tell.finding_id": findingId ?? "(all)",
      "tell.has_dna": dna !== undefined,
    });

    try {
      const direction = directionPlan?.artDirection ?? parseDirection(directionText);
      const proposal = await proposeWithCursorAgent(
        report,
        direction,
        findingId,
        dna,
        directionPlan?.actionItems,
        directionPlan?.summary ?? directionText,
      );
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return NextResponse.json(proposal);
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  });
}
