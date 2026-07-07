import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/** Best-effort read of DESIGN.md from repo root or cwd (local scans only). */
export async function loadDesignDoc(repoRoot = defaultRepoRoot): Promise<string | undefined> {
  const candidates = [
    path.join(repoRoot, "DESIGN.md"),
    path.join(process.cwd(), "DESIGN.md"),
    path.join(process.cwd(), "..", "DESIGN.md"),
    path.join(process.cwd(), "..", "..", "DESIGN.md"),
  ];
  for (const candidate of [...new Set(candidates)]) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      /* try next candidate */
    }
  }
  return undefined;
}
