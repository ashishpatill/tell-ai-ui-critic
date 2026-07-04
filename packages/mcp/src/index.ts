#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { captureUrl, diagnoseCapture } from "@tell/core";
import { CapturePayload, TellReport } from "@tell/schema";
import { OfflineRedesignGenerator } from "@tell/redesign";
import { classifyWithTaste, parseDirection } from "@tell/taste";
import type { Finding, TasteVerdict } from "@tell/schema";

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
  "Return patch instructions for Cursor. This tool never writes files automatically.",
  { proposalId: z.string().optional() },
  async () => {
    const patches = lastProposal?.files.map((file) => file.unifiedDiff) ?? [];
    return asJson({
      patches,
      instruction: "Review the unified diff in Cursor, then apply it manually or ask the Agent to patch the listed files.",
    });
  },
);

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
