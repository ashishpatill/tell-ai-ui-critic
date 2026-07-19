import {
  CaptureScenario,
  ScenarioMatrix,
  type AuthRole,
  type ColorTheme,
  type InteractionState,
  type ViewportPreset,
} from "@tell/schema";
import { captureUrl } from "./capture-url";

export type ScenarioPlanInput = {
  route: string;
  viewport?: ViewportPreset;
  theme?: ColorTheme;
  interaction?: InteractionState;
  authRole?: AuthRole;
};

/** Stable scenario id: `route__viewport__theme__interaction__auth`. */
export function scenarioId(input: ScenarioPlanInput | CaptureScenario): string {
  const route = (input.route || "/").replace(/\/+/g, "/");
  const viewport = input.viewport ?? "desktop";
  const theme = input.theme ?? "light";
  const interaction = input.interaction ?? "default";
  const authRole = input.authRole ?? "anonymous";
  const routeKey = route === "/" ? "root" : route.replace(/^\//, "").replace(/\//g, "_");
  return `${routeKey}__${viewport}__${theme}__${interaction}__${authRole}`;
}

export function buildScenario(input: ScenarioPlanInput): CaptureScenario {
  return CaptureScenario.parse({
    id: scenarioId(input),
    route: input.route || "/",
    viewport: input.viewport ?? "desktop",
    theme: input.theme ?? "light",
    interaction: input.interaction ?? "default",
    authRole: input.authRole ?? "anonymous",
  });
}

/**
 * Default proof matrix: each route × {desktop,tablet,mobile} × light/default,
 * plus one dark desktop and one hover desktop cell on the first route.
 */
export function defaultScenarioPlan(routes: string[]): CaptureScenario[] {
  const uniqueRoutes = [...new Set(routes.map((r) => (r.startsWith("/") ? r : `/${r}`)))];
  const viewports: ViewportPreset[] = ["desktop", "tablet", "mobile"];
  const cells: CaptureScenario[] = [];
  for (const route of uniqueRoutes) {
    for (const viewport of viewports) {
      cells.push(buildScenario({ route, viewport, theme: "light", interaction: "default" }));
    }
  }
  const primary = uniqueRoutes[0] ?? "/";
  cells.push(buildScenario({ route: primary, viewport: "desktop", theme: "dark", interaction: "default" }));
  cells.push(buildScenario({ route: primary, viewport: "desktop", theme: "light", interaction: "hover" }));
  return cells;
}

function joinUrl(baseUrl: string, route: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  if (!route || route === "/") return base || baseUrl;
  return `${base}${route.startsWith("/") ? route : `/${route}`}`;
}

/** Capture each scenario cell. Deterministic once Playwright returns; no LLM. */
export async function captureScenarioMatrix(
  baseUrl: string,
  scenarios?: CaptureScenario[],
): Promise<ScenarioMatrix> {
  const plan = scenarios?.length ? scenarios.map((s) => CaptureScenario.parse(s)) : defaultScenarioPlan(["/"]);
  const cells = [];
  for (const scenario of plan) {
    const url = joinUrl(baseUrl, scenario.route);
    const capture = await captureUrl(url, {
      theme: scenario.theme,
      primaryViewport: scenario.viewport,
      interaction: scenario.interaction,
      // Per-cell viewport already varies; avoid nested secondary matrix blow-up.
      skipViewportMatrix: scenario.viewport !== "desktop",
    });
    cells.push({ scenario, capture });
  }
  return ScenarioMatrix.parse({
    baseUrl,
    capturedAt: new Date().toISOString(),
    cells,
  });
}
