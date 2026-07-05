import { TellReport } from "@tell/schema";

function captureBackendUrl(): string | null {
  const raw = process.env.TELL_CAPTURE_API_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : null;
}

/** When set (e.g. on Vercel), proxy capture to the Render Docker backend. */
export function hasRemoteCaptureBackend(): boolean {
  return captureBackendUrl() !== null;
}

export async function runDiagnoseRemote(url: string): Promise<TellReport> {
  const base = captureBackendUrl();
  if (!base) {
    throw new Error("TELL_CAPTURE_API_URL is not configured");
  }

  const timeoutMs = Number(process.env.TELL_CAPTURE_TIMEOUT_MS ?? 90_000);
  const res = await fetch(`${base}/api/diagnose`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Capture backend ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const payload = (await res.json()) as { report?: unknown; meta?: { live?: boolean } };
  if (!payload.report) {
    throw new Error("Capture backend returned no report");
  }
  if (payload.meta?.live === false) {
    throw new Error("Capture backend fell back to offline demo");
  }

  return TellReport.parse(payload.report);
}
