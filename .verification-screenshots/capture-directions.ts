/**
 * One-off visual verification — injects reconcile CSS into captured fixture snapshotHtml.
 * Run from packages/core: pnpm exec tsx ../../.verification-screenshots/capture-directions.ts
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const outDir = here;

function injectSheet(html: string, sheet: { css: string; fontImport: string }): string {
  const style = `<style data-tell-reconcile>\n${sheet.fontImport}\n${sheet.css}\n</style>`;
  if (/<\/body>/i.test(html)) return html.replace(/<\/body>/i, `${style}</body>`);
  if (/<\/html>/i.test(html)) return html.replace(/<\/html>/i, `${style}</html>`);
  return html + style;
}

async function screenshotHtml(page: import("playwright").Page, html: string, file: string) {
  await page.setContent(html, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: file, fullPage: true });
}

async function main() {
  const { TellReport } = await import(pathToFileURL(path.join(repoRoot, "packages/schema/src/index.ts")).href);
  const { RECONCILE_DIRECTIONS, reconcile } = await import(
    pathToFileURL(path.join(repoRoot, "packages/redesign/src/reconcile.ts")).href,
  );

  await mkdir(outDir, { recursive: true });
  const reportPath = path.join(repoRoot, "fixtures/reports/tell-report.json");
  const report = TellReport.parse(JSON.parse(await readFile(reportPath, "utf8")));
  const html = report.capture.snapshotHtml;
  if (!html) throw new Error("Report missing snapshotHtml");

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  await screenshotHtml(page, html, path.join(outDir, "before-baseline.png"));
  console.log("Saved before-baseline.png");

  for (const dirId of Object.keys(RECONCILE_DIRECTIONS)) {
    const recon = reconcile(report.capture, report.fingerprint, report.findings, dirId);
    const afterHtml = injectSheet(html, { css: recon.css, fontImport: recon.fontImport });
    const out = path.join(outDir, `after-${dirId}.png`);
    await screenshotHtml(page, afterHtml, out);
    console.log(`Saved after-${dirId}.png (${recon.css.length} bytes css)`);
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
