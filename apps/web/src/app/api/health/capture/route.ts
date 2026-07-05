import { NextResponse } from "next/server";
import { createRequire } from "node:module";

export const dynamic = "force-dynamic";

/** Quick Playwright sanity check on the capture server. */
export async function GET() {
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
