import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const sourcePath = path.join(repoRoot, "fixtures/reports/tell-report.json");
  const targetPath = path.join(repoRoot, "apps/web/src/lib/demo-report.ts");

  const raw = JSON.parse(await readFile(sourcePath, "utf8")) as Record<string, unknown>;
  if (raw.capture && typeof raw.capture === "object") {
    const capture = raw.capture as Record<string, unknown>;
    capture.screenshotBase64 = "";
    if (Array.isArray(capture.stateShots)) {
      capture.stateShots = capture.stateShots.map((shot) => {
        if (!shot || typeof shot !== "object") return shot;
        return { ...(shot as Record<string, unknown>), imageBase64: "" };
      });
    }
  }

  const body = `// Auto-generated from fixtures/reports/tell-report.json (the deliberately-generic sample app).
// Real capture so the on-load demo shows a genuine scorecard + working before/after seam.
// Screenshot and probe PNGs omitted to keep the client bundle small; live capture fills them in.
// Regenerate: pnpm sync:demo-report
import type { TellReport } from "@tell/schema";

export const demoReport: TellReport = ${JSON.stringify(raw, null, 2)} as TellReport;
`;

  await writeFile(targetPath, body, "utf8");
  const shots = (raw.capture as { stateShots?: unknown[] })?.stateShots?.length ?? 0;
  console.log(`Wrote ${targetPath} (${shots} state probe shots)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
