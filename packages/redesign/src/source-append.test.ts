import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Reconciliation } from "@tell/schema";
import { buildAppendedOverridePatch } from "./source-patch";

const reconciliation = {
  directionId: "editorial",
  label: "Editorial",
  summary: "A source-grounded repair.",
  rows: [],
  css: "body { color: #17130f; }\nbutton { border-radius: 2px; }\n[data-tell-id=\"t7\"]{\n  padding:24px !important;\n}",
  fontImport: "@import url('https://fonts.example/test.css');",
  accentBefore: "#8b5cf6",
  accentAfter: "#b95a31",
  surfaceAfter: "#f4eee3",
  textAfter: "#17130f",
  scoreBefore: 80,
  scoreAfter: 30,
  axes: [],
  elementsRestyled: 2,
  scoredAgainst: "baseline",
} satisfies Reconciliation;

describe("buildAppendedOverridePatch", () => {
  it("appends the reconciliation to an existing global stylesheet", () => {
    const [patch] = buildAppendedOverridePatch(reconciliation, [
      { path: "src/components/Card.module.css", contents: ".card { padding: 1rem; }\n" },
      { path: "src/index.css", contents: ":root { color: #111; }\nbody { margin: 0; }\n" },
    ]);

    expect(patch?.file).toBe("src/index.css");
    expect(patch?.unifiedDiff).toContain("+++ b/src/index.css");
    expect(patch?.unifiedDiff).toContain("+/* Tell Proof · candidate repair");
    expect(patch?.unifiedDiff).toContain("+body { color: #17130f; }");
    expect(patch?.unifiedDiff).not.toContain("data-tell-id");
    expect(patch?.unifiedDiff).not.toContain("@import");
  });

  it("does not invent an unimported stylesheet when no style source exists", () => {
    expect(buildAppendedOverridePatch(reconciliation, [
      { path: "src/App.tsx", contents: "export function App() { return <main />; }" },
    ])).toEqual([]);
  });

  it("does not append global rules to a CSS module", () => {
    expect(buildAppendedOverridePatch(reconciliation, [
      { path: "src/Card.module.css", contents: ".card { color: red; }" },
    ])).toEqual([]);
  });

  it("emits a diff that git can check and apply", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tell-source-patch-"));
    try {
      await fs.mkdir(path.join(dir, "src"));
      const original = ":root { color: #111; }\nbody { margin: 0; }\n";
      await fs.writeFile(path.join(dir, "src/index.css"), original);
      spawnSync("git", ["init", "-q"], { cwd: dir });
      const [patch] = buildAppendedOverridePatch(reconciliation, [
        { path: "src/index.css", contents: original },
      ]);
      const checked = spawnSync("git", ["apply", "--check", "-"], { cwd: dir, input: patch?.unifiedDiff, encoding: "utf8" });
      expect(checked.status, checked.stderr).toBe(0);
      const applied = spawnSync("git", ["apply", "-"], { cwd: dir, input: patch?.unifiedDiff, encoding: "utf8" });
      expect(applied.status, applied.stderr).toBe(0);
      expect(await fs.readFile(path.join(dir, "src/index.css"), "utf8")).toContain("Tell Proof · candidate repair");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
