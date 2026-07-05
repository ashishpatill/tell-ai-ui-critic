import { NextResponse } from "next/server";
import { createRequire } from "node:module";
import { hasRemoteCaptureBackend } from "@/lib/run-diagnose-remote";

export const dynamic = "force-dynamic";

/** Quick Playwright sanity check on the capture server. */
export async function GET() {
  if (hasRemoteCaptureBackend()) {
    const base = process.env.TELL_CAPTURE_API_URL?.trim().replace(/\/$/, "");
    try {
      const res = await fetch(`${base}/api/health/capture`, {
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
      });
      const payload = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          ...payload,
          backend: "remote",
          remoteStatus: res.status,
        },
        { status: res.ok ? 200 : 502 },
      );
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          backend: "remote",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 502 },
      );
    }
  }

  try {
    // Avoid webpack bundling playwright (pulls chromium-bidi and breaks next build).
    const require = createRequire(import.meta.url);
    const { chromium } = require("playwright");
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    return NextResponse.json({
      ok: true,
      playwrightBrowsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH ?? "(default)",
      tellRepoRoot: process.env.TELL_REPO_ROOT ?? "(auto)",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        playwrightBrowsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH ?? "(default)",
      },
      { status: 500 },
    );
  }
}
