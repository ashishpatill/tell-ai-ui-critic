import { NextResponse } from "next/server";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  captureScenarioMatrix,
  compareProofMatrices,
  liveScenarioPlan,
} from "@tell/core";
import { CaptureScenario, ProofMatrixResult, ScenarioMatrix } from "@tell/schema";
import { hasRemoteBackend, proxyRemoteBackend } from "@/lib/remote-api";

export const maxDuration = 180;

type Body = {
  url?: string;
  routes?: string[];
  scenarios?: unknown[];
  compare?: boolean;
};

function defaultAuthStorage(): string | undefined {
  const fromEnv = process.env.TELL_AUTH_STORAGE_STATE?.trim();
  if (fromEnv) {
    const path = resolve(fromEnv);
    return existsSync(path) ? path : undefined;
  }
  const candidates = [
    resolve(process.cwd(), "fixtures/generic-app/auth-storage.json"),
    resolve(process.cwd(), "../../fixtures/generic-app/auth-storage.json"),
    resolve(process.cwd(), "../fixtures/generic-app/auth-storage.json"),
  ];
  return candidates.find((p) => existsSync(p));
}

/**
 * Live Playwright scenario-matrix capture (+ optional self-compare).
 * Local / capture-backend only — not a substitute for the offline fixture smoke.
 */
export async function POST(request: Request) {
  if (hasRemoteBackend()) {
    return proxyRemoteBackend(request, "/api/proof/matrix", { timeoutMs: 180_000 });
  }

  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Live scenario matrix needs Playwright. Set TELL_CAPTURE_API_URL on Vercel, or run locally.",
      },
      { status: 501 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const routes = Array.isArray(body.routes)
    ? body.routes.filter((r): r is string => typeof r === "string").map((r) => (r.startsWith("/") ? r : `/${r}`))
    : ["/", "/pricing", "/account"];

  let scenarios;
  try {
    scenarios = body.scenarios?.length
      ? body.scenarios.map((s) => CaptureScenario.parse(s))
      : liveScenarioPlan(routes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid scenarios" },
      { status: 400 },
    );
  }

  try {
    const matrix = await captureScenarioMatrix(url, scenarios, {
      storageState: defaultAuthStorage(),
      routes,
      livePlan: true,
    });
    const parsed = ScenarioMatrix.parse(matrix);
    const compare = body.compare !== false;
    const proof = compare
      ? ProofMatrixResult.parse(compareProofMatrices(parsed, parsed))
      : undefined;

    return NextResponse.json({
      matrix: parsed,
      proof,
      meta: {
        live: true,
        cellCount: parsed.cells.length,
        authStorage: Boolean(defaultAuthStorage()),
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("[/api/proof/matrix]", error);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
