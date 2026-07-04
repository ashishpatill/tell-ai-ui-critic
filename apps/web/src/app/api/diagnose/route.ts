import { NextResponse } from "next/server";
import { runDiagnose } from "@/lib/run-diagnose";
import { demoReport } from "@/lib/demo-report";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" && body.url.trim() ? body.url.trim() : demoReport.capture.url;

  try {
    const report = await runDiagnose(url);
    return NextResponse.json({
      report,
      meta: { live: true, requestedUrl: url, capturedUrl: report.capture.url },
    });
  } catch (error) {
    console.error("[/api/diagnose]", error);
    return NextResponse.json({
      report: demoReport,
      meta: { live: false, requestedUrl: url, capturedUrl: demoReport.capture.url, error: "Capture failed — loaded offline demo report." },
    });
  }
}
