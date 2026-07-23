#!/usr/bin/env tsx
/**
 * Mint a disposable Playwright storage state for the generic-app demo auth gate.
 *
 * Usage (fixture must be reachable, default http://localhost:3001):
 *   pnpm auth:fixture
 *
 * Env:
 *   TELL_FIXTURE_URL          base URL (default http://localhost:3001)
 *   TELL_AUTH_STORAGE_STATE   output path (default fixtures/generic-app/auth-storage.json)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

async function main(): Promise<void> {
  const baseUrl = (process.env.TELL_FIXTURE_URL ?? "http://localhost:3001").replace(/\/+$/, "");
  const outPath = resolve(
    process.env.TELL_AUTH_STORAGE_STATE ?? resolve(repoRoot, "fixtures/generic-app/auth-storage.json"),
  );

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "tell_session",
        value: "authenticated",
        url: baseUrl,
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();
    await page.goto(`${baseUrl}/account`, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForSelector('[data-tell-auth="authenticated"]', { timeout: 8_000 });
    await page.evaluate(() => {
      localStorage.setItem("tell_demo_user", "priya");
    });
    mkdirSync(dirname(outPath), { recursive: true });
    const state = await context.storageState();
    writeFileSync(outPath, `${JSON.stringify(state, null, 2)}\n`);
    console.log(`Wrote authenticated storage state → ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
