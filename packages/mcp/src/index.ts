#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  captureUrl,
  captureScenarioMatrix,
  compareProofMatrices,
  diagnoseCapture,
  liveScenarioPlan,
  verifyProofPatch,
  revertProofPatch,
} from "@tell/core";
import { CapturePayload, TellReport } from "@tell/schema";
import { OfflineRedesignGenerator, type SourceFile } from "@tell/redesign";
import { classifyWithTaste, parseDirection } from "@tell/taste";
import type { Finding, TasteVerdict } from "@tell/schema";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const server = new McpServer({
  name: "tell",
  version: "0.1.0",
});

let lastReport: TellReport | undefined;
let lastProposal: Awaited<ReturnType<OfflineRedesignGenerator["propose"]>> | undefined;

server.tool(
  "tell_capture",
  "Capture a rendered URL with Playwright and return computed UI evidence.",
  { url: z.string().url() },
  async ({ url }) => {
    const capture = await captureUrl(url);
    return asJson(capture);
  },
);

server.tool(
  "tell_diagnose",
  "Diagnose genericness tells and consistency drift from a URL or committed report artifact.",
  { url: z.string().url().optional(), reportPath: z.string().optional() },
  async ({ url, reportPath }) => {
    if (reportPath) {
      const raw = await readFile(reportPath, "utf8");
      lastReport = TellReport.parse(JSON.parse(raw));
      return asJson(lastReport);
    }
    if (url) {
      const capture = await captureUrl(url);
      const base = diagnoseCapture(capture);
      // Enrich with the real taste engine when a key is present; otherwise
      // classifyWithTaste returns the same deterministic verdicts as base.
      const verdicts = await classifyWithTaste(base.findings, base.fingerprint, {
        apiKey: process.env.GEMINI_API_KEY,
      });
      lastReport = TellReport.parse({ ...base, verdicts, score: scoreOf(verdicts, base.findings) });
      return asJson(lastReport);
    }
    const artifact = process.env.TELL_REPORT_ARTIFACT ?? "fixtures/reports/tell-report.json";
    const raw = await readFile(artifact, "utf8");
    lastReport = TellReport.parse(JSON.parse(raw));
    return asJson(lastReport);
  },
);

server.tool(
  "tell_redesign",
  "Draft a redesign proposal for a finding or whole report. Returns patch text only; never applies it.",
  { direction: z.string(), findingId: z.string().optional() },
  async ({ direction, findingId }) => {
    if (!lastReport) {
      const artifact = process.env.TELL_REPORT_ARTIFACT ?? "fixtures/reports/tell-report.json";
      lastReport = TellReport.parse(JSON.parse(await readFile(artifact, "utf8")));
    }
    const generator = new OfflineRedesignGenerator();
    lastProposal = await generator.propose(lastReport, parseDirection(direction), findingId);
    return asJson(lastProposal);
  },
);

server.tool(
  "tell_apply",
  "Return patch instructions for Cursor. When projectRoot points at a workspace with source files (CSS/SCSS/Tailwind config), the patch rewrites the REAL source literals (accent, body font, radius, AI gradients) as genuine unified diffs; otherwise it returns the drop-in override sheet. This tool never writes files automatically.",
  { proposalId: z.string().optional(), projectRoot: z.string().optional() },
  async ({ proposalId, projectRoot }) => {
    if (proposalId && lastProposal?.id && proposalId !== lastProposal.id) {
      return asJson({
        error: `Unknown proposalId "${proposalId}". Last proposal is "${lastProposal.id}". Run tell_redesign again.`,
      });
    }
    // Hero path: re-derive the proposal against the user's actual source files so the diff
    // edits their code, not a new override sheet. Falls back silently when none are found.
    if (lastReport && lastProposal) {
      const sources = await collectSources(projectRoot ?? process.cwd());
      if (sources.length) {
        lastProposal = await new OfflineRedesignGenerator().propose(
          lastReport, lastProposal.direction, lastProposal.findingId, undefined, sources,
        );
      }
    }
    const files = lastProposal?.files ?? [];
    return asJson({
      proposalId: lastProposal?.id,
      patches: files.map((file) => file.unifiedDiff),
      files: files.map((file) => ({ file: file.file, summary: file.summary })),
      instruction: files.some((f) => f.file !== "tell-overrides.css")
        ? "Review the unified diffs in Cursor, then apply them to the listed source files (or ask the Agent to apply the patch)."
        : "Review the unified diff in Cursor, then apply it manually or ask the Agent to patch the listed files.",
    });
  },
);

server.tool(
  "tell_capture_matrix",
  "Live Playwright capture of a route × viewport × theme × interaction (± auth) scenario matrix. Authenticated cells require TELL_AUTH_STORAGE_STATE or the committed fixtures/generic-app/auth-storage.json.",
  {
    url: z.string().url(),
    routes: z.array(z.string()).optional(),
    compare: z.boolean().optional(),
  },
  async ({ url, routes, compare }) => {
    const planRoutes = routes?.length ? routes : ["/", "/pricing", "/account"];
    const envAuth = process.env.TELL_AUTH_STORAGE_STATE?.trim();
    const authCandidates = [
      envAuth,
      resolve(process.cwd(), "fixtures/generic-app/auth-storage.json"),
      resolve(process.cwd(), "../../fixtures/generic-app/auth-storage.json"),
    ].filter((p): p is string => Boolean(p));
    const candidate = authCandidates.find((p) => existsSync(p));
    let host = "";
    try {
      host = new URL(url).hostname;
    } catch {
      host = "";
    }
    const localHost = host === "localhost" || host === "127.0.0.1";
    const storageState = candidate && (envAuth || localHost) ? candidate : undefined;
    let scenarios = liveScenarioPlan(planRoutes);
    if (!storageState) scenarios = scenarios.filter((s) => s.authRole !== "authenticated");
    const matrix = await captureScenarioMatrix(url, scenarios, {
      storageState,
      routes: planRoutes,
      livePlan: true,
    });
    const proof = compare === false ? undefined : compareProofMatrices(matrix, matrix);
    return asJson({ matrix, proof, meta: { cellCount: matrix.cells.length, authStorage: Boolean(storageState) } });
  },
);

server.tool(
  "tell_proof_verify",
  "Apply a candidate patch in the project workspace, recapture the live URL, and return an independent pass/review/fail verdict with before/after scores. Failed attempts auto-revert when revertOnFail is true (default). Requires a reachable dev server at url.",
  {
    url: z.string().url(),
    patch: z.string().min(1),
    projectRoot: z.string().optional(),
    waitMs: z.number().int().min(0).max(30_000).optional(),
    revertOnFail: z.boolean().optional(),
  },
  async ({ url, patch, projectRoot, waitMs, revertOnFail }) => {
    const result = await verifyProofPatch({
      url,
      patch,
      projectRoot: projectRoot ?? process.cwd(),
      waitMs,
      revertOnFail,
    });
    return asJson(result);
  },
);

server.tool(
  "tell_proof_revert",
  "Revert the last tell_proof_verify patch in the project workspace using the saved marker patch.",
  { projectRoot: z.string().optional(), patch: z.string().optional() },
  async ({ projectRoot, patch }) => {
    const reverted = await revertProofPatch(projectRoot ?? process.cwd(), patch);
    return asJson({
      reverted,
      instruction: reverted
        ? "Proof patch reverted. Recapture the URL if you need a fresh baseline."
        : "No proof patch marker found to revert.",
    });
  },
);

// ── Local source reader for the tell_apply hero path (Cursor workspace) ──
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "out", ".turbo", "coverage"]);
const MAX_SOURCE_FILES = 60;
const MAX_SOURCE_BYTES = 200_000;

function isSourceCandidate(name: string): boolean {
  return /\.(css|scss|sass|less)$/i.test(name) || /^tailwind\.config\.(ts|js|cjs|mjs)$/i.test(name);
}

async function collectSources(root: string): Promise<SourceFile[]> {
  const out: SourceFile[] = [];
  async function walk(dir: string): Promise<void> {
    if (out.length >= MAX_SOURCE_FILES) return;
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (out.length >= MAX_SOURCE_FILES) return;
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name) || e.name.startsWith(".")) continue;
        await walk(path.join(dir, e.name));
      } else if (e.isFile() && isSourceCandidate(e.name)) {
        const full = path.join(dir, e.name);
        try {
          const contents = await readFile(full, "utf8");
          if (contents.length <= MAX_SOURCE_BYTES) out.push({ path: path.relative(root, full), contents });
        } catch { /* unreadable — skip */ }
      }
    }
  }
  await walk(root);
  return out;
}

await server.connect(new StdioServerTransport());

function scoreOf(verdicts: TasteVerdict[], findings: Finding[]) {
  return {
    total: findings.length,
    generic: verdicts.filter((v) => v.verdict === "generic").length,
    drift: verdicts.filter((v) => v.verdict === "drift").length,
    intentional: verdicts.filter((v) => v.verdict === "intentional").length,
    uncertain: verdicts.filter((v) => v.verdict === "uncertain").length,
  };
}

function asJson(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
  };
}
