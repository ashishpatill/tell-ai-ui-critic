import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { TellReport } from "@tell/schema";
import { repoRoot } from "./repo-root";

const execFileAsync = promisify(execFile);

export async function runDiagnose(url: string): Promise<TellReport> {
  const root = repoRoot();
  const diagnoseScript = path.join(root, "packages/core/src/scripts/diagnose-url.ts");

  const { stdout } = await execFileAsync("pnpm", ["exec", "tsx", diagnoseScript, url], {
    cwd: root,
    timeout: Number(process.env.TELL_CAPTURE_TIMEOUT_MS ?? 60_000),
    maxBuffer: 20 * 1024 * 1024,
    env: process.env,
  });
  return TellReport.parse(JSON.parse(stdout));
}
