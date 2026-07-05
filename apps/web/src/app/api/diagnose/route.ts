import { NextResponse } from "next/server";
import { runDiagnose } from "@/lib/run-diagnose";
import { hasRemoteCaptureBackend, runDiagnoseRemote } from "@/lib/run-diagnose-remote";
import { demoReport } from "@/lib/demo-report";

/** Proxy to Render capture backend can take ~90s (Playwright cold start). */
export const maxDuration = 90;

function captureErrorMessage(url: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  if (/ERR_CONNECTION_REFUSED|ECONNREFUSED/i.test(detail)) {
    return `Tell could not reach ${url}. The dev server is not responding yet.`;
  }
  if (/Timeout|timed out|timeout/i.test(detail)) {
    return `Capture timed out while waiting for ${url}. The page may still be compiling or stuck loading.`;
  }
  return `Capture failed for ${url}. The offline demo report is showing instead.`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" && body.url.trim() ? body.url.trim() : demoReport.capture.url;

  try {
    const report = hasRemoteCaptureBackend()
      ? await runDiagnoseRemote(url)
      : await runDiagnose(url);
    return NextResponse.json({
      report,
      meta: {
        live: true,
        requestedUrl: url,
        capturedUrl: report.capture.url,
        backend: hasRemoteCaptureBackend() ? "render" : "local",
      },
    });
  } catch (error) {
    console.error("[/api/diagnose]", error);
    const message = captureErrorMessage(url, error);
    return NextResponse.json({
      report: demoReport,
      meta: { live: false, requestedUrl: url, capturedUrl: demoReport.capture.url, error: message },
    });
  }
}
