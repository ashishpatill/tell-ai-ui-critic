import { NextResponse } from "next/server";
import { trace, SpanStatusCode, type Span } from "@opentelemetry/api";
import { parseDirectionPlan, parseDirectionWithGemini } from "@tell/taste";

const tracer = trace.getTracer("tell.voice");

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";

  if (!transcript) {
    return NextResponse.json({ error: "transcript required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const source = apiKey ? "gemini" : "local";

  return tracer.startActiveSpan("tell.voice", async (span: Span) => {
    span.setAttributes({
      "tell.voice.source": source,
      "tell.voice.transcript_length": transcript.length,
    });

    try {
      const plan = apiKey
        ? await parseDirectionWithGemini(transcript, apiKey)
        : parseDirectionPlan(transcript);

      span.setAttributes({ "tell.voice.preset": plan.presetId ?? "(none)" });
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      return NextResponse.json({ ...plan, source });
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      span.end();
      throw error;
    }
  });
}
