import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TellReport } from "@tell/schema";
import { buildSourcePatch } from "./source-patch";
import { resolveDirection } from "./scales";
import { buildRestylePlan } from "./restyle";
import { OfflineRedesignGenerator } from "./index";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");
const report = TellReport.parse(
  JSON.parse(readFileSync(path.join(repoRoot, "fixtures/reports/tell-report.json"), "utf8")),
);
const stylesPath = "app/styles.css";
const stylesCss = readFileSync(path.join(repoRoot, "fixtures/generic-app/app/styles.css"), "utf8");

const plan = buildRestylePlan(report.capture, report.fingerprint, resolveDirection("editorial"), undefined);

describe("buildSourcePatch", () => {
  const patches = buildSourcePatch(report.capture, report.fingerprint, "editorial", undefined, [
    { path: stylesPath, contents: stylesCss },
  ]);

  it("rewrites the generic app's real source (one changed file)", () => {
    expect(patches).toHaveLength(1);
    expect(patches[0]!.file).toBe(stylesPath);
  });

  it("rewrites the #8B5CF6 accent literals off violet", () => {
    const diff = patches[0]!.unifiedDiff;
    // The source literally contains the AI-default violet; the patch must retire it.
    const added = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
    const removed = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));
    expect(removed.some((l) => /#8b5cf6/i.test(l))).toBe(true);
    // No added (+) line reintroduces the violet accent as a solid fill.
    expect(added.some((l) => /background:\s*#8b5cf6/i.test(l))).toBe(false);
    // The tamed accent actually appears in the additions.
    expect(added.some((l) => l.toLowerCase().includes(plan.accentAfter.toLowerCase()))).toBe(true);
  });

  it("de-genericizes the body font (Inter → direction body)", () => {
    const diff = patches[0]!.unifiedDiff;
    expect(diff).toMatch(/-\s*font-family:\s*Inter,/);
    expect(diff).toContain(`"${plan.body}"`);
  });

  it("flattens the AI hero gradient to a flat surface", () => {
    const diff = patches[0]!.unifiedDiff;
    const removed = diff.split("\n").filter((l) => l.startsWith("-") && !l.startsWith("---"));
    expect(removed.some((l) => /linear-gradient/i.test(l))).toBe(true);
    expect(diff).toContain(plan.surface);
  });

  it("unifies the corner radius (8px → direction radius) in border-radius declarations only", () => {
    const diff = patches[0]!.unifiedDiff;
    expect(diff).toMatch(new RegExp(`\\+\\s*border-radius:\\s*${plan.radius.replace(".", "\\.")}`));
  });

  it("emits a valid unified diff: parseable @@ headers with true context lines", () => {
    const diff = patches[0]!.unifiedDiff;
    expect(diff.startsWith(`--- a/${stylesPath}\n+++ b/${stylesPath}\n`)).toBe(true);

    const origLines = stylesCss.split("\n");
    let sawHunk = false;
    for (const hunk of diff.split(/^@@ /m).slice(1)) {
      sawHunk = true;
      const header = hunk.split("\n")[0]!; // "-a,b +c,d @@"
      const m = header.match(/^-(\d+),(\d+) \+(\d+),(\d+) @@/);
      expect(m).not.toBeNull();
      const [, oStart, oCount] = m!.map(Number) as unknown as number[];
      // Walk the body; every context (' ') and removed ('-') line must match the real source.
      const body = hunk.split("\n").slice(1);
      let oi = oStart! - 1; // 0-based into origLines
      let counted = 0;
      for (const line of body) {
        if (line.startsWith("+")) continue;
        if (line.startsWith(" ") || line.startsWith("-")) {
          expect(origLines[oi]).toBe(line.slice(1));
          oi++;
          counted++;
        }
      }
      expect(counted).toBe(oCount); // header old-count matches the real removed+context lines
    }
    expect(sawHunk).toBe(true);
  });
});

describe("propose() fallback", () => {
  const gen = new OfflineRedesignGenerator();
  const direction = { id: "editorial", label: "Editorial warm", keywords: [], tokenOverrides: {}, summary: "" };

  it("uses real source diffs when sources are provided", async () => {
    const proposal = await gen.propose(report, direction, undefined, undefined, [
      { path: stylesPath, contents: stylesCss },
    ]);
    expect(proposal.files).toHaveLength(1);
    expect(proposal.files[0]!.file).toBe(stylesPath);
    expect(proposal.files[0]!.unifiedDiff).toContain(`--- a/${stylesPath}`);
  });

  it("falls back to the legacy override sheet when no sources are given", async () => {
    const proposal = await gen.propose(report, direction);
    expect(proposal.files).toHaveLength(1);
    expect(proposal.files[0]!.file).toBe("tell-overrides.css");
  });

  it("falls back when sources contain nothing to rewrite", async () => {
    const proposal = await gen.propose(report, direction, undefined, undefined, [
      { path: "readme.md", contents: "# hello\nno tokens here\n" },
    ]);
    expect(proposal.files[0]!.file).toBe("tell-overrides.css");
  });
});
