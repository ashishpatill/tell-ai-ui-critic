import { captureUrl, diagnoseCapture, loadDesignDoc, shouldApplyDesignDoc } from "@tell/core";
import { TellReport, type Finding, type TasteVerdict } from "@tell/schema";
import { classifyWithTaste } from "@tell/taste";

function scoreOf(verdicts: TasteVerdict[], findings: Finding[]) {
  return {
    total: findings.length,
    generic: verdicts.filter((v) => v.verdict === "generic").length,
    drift: verdicts.filter((v) => v.verdict === "drift").length,
    intentional: verdicts.filter((v) => v.verdict === "intentional").length,
    uncertain: verdicts.filter((v) => v.verdict === "uncertain").length,
  };
}

/** Run capture + diagnose in-process (reliable in Docker / Vercel). */
export async function runDiagnose(url: string): Promise<TellReport> {
  try {
    const designDoc = shouldApplyDesignDoc(url) ? await loadDesignDoc() : undefined;
    const base = diagnoseCapture(await captureUrl(url), undefined, designDoc);
    // Match MCP: enrich with Gemini taste when a key is present; deterministic otherwise.
    const verdicts = await classifyWithTaste(base.findings, base.fingerprint, {
      apiKey: process.env.GEMINI_API_KEY,
    });
    return TellReport.parse({ ...base, verdicts, score: scoreOf(verdicts, base.findings) });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Capture pipeline failed: ${detail}`, { cause: error });
  }
}
