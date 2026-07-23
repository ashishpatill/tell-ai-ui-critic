import {
  CaptureScenario,
  ScenarioMatrix,
  type AuthRole,
  type ColorTheme,
  type InteractionState,
  type ViewportPreset,
} from "@tell/schema";
import { captureUrl, type CaptureUrlOptions } from "./capture-url";

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
 * When `/account` is among the routes, also add one authenticated desktop cell.
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
  if (uniqueRoutes.includes("/account")) {
    cells.push(
      buildScenario({
        route: "/account",
        viewport: "desktop",
        theme: "light",
        interaction: "default",
        authRole: "authenticated",
      }),
    );
  }
  return cells;
}

/**
 * Compact live plan for CI / demo smoke (keeps Playwright wall-clock reasonable).
 * Covers route × viewport × theme × interaction × authRole without the full cartesian product.
 */
export function liveScenarioPlan(routes: string[] = ["/", "/pricing", "/account"]): CaptureScenario[] {
  const uniqueRoutes = [...new Set(routes.map((r) => (r.startsWith("/") ? r : `/${r}`)))];
  const primary = uniqueRoutes[0] ?? "/";
  const secondary = uniqueRoutes.find((r) => r !== primary);
  const cells: CaptureScenario[] = [
    buildScenario({ route: primary, viewport: "desktop", theme: "light", interaction: "default" }),
    buildScenario({ route: primary, viewport: "mobile", theme: "light", interaction: "default" }),
    buildScenario({ route: primary, viewport: "desktop", theme: "dark", interaction: "default" }),
    buildScenario({ route: primary, viewport: "desktop", theme: "light", interaction: "hover" }),
  ];
  if (secondary) {
    cells.push(buildScenario({ route: secondary, viewport: "desktop", theme: "light", interaction: "default" }));
  }
  if (uniqueRoutes.includes("/account")) {
    cells.push(
      buildScenario({
        route: "/account",
        viewport: "desktop",
        theme: "light",
        interaction: "default",
        authRole: "authenticated",
      }),
    );
  }
  // Guard against accidental id collisions if callers pass overlapping routes.
  const seen = new Set<string>();
  return cells.filter((cell) => {
    if (seen.has(cell.id)) return false;
    seen.add(cell.id);
    return true;
  });
}

function joinUrl(baseUrl: string, route: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  if (!route || route === "/") return base || baseUrl;
  return `${base}${route.startsWith("/") ? route : `/${route}`}`;
}

export type CaptureScenarioMatrixOptions = {
  /** Override Playwright storage state for authenticated cells. */
  storageState?: CaptureUrlOptions["storageState"];
  /** Use the compact live plan when scenarios are omitted (default false → defaultScenarioPlan(["/"])). */
  livePlan?: boolean;
  /** Routes for the default/live plan when `scenarios` is omitted. */
  routes?: string[];
};

/** Capture each scenario cell. Deterministic once Playwright returns; no LLM. */
export async function captureScenarioMatrix(
  baseUrl: string,
  scenarios?: CaptureScenario[],
  options: CaptureScenarioMatrixOptions = {},
): Promise<ScenarioMatrix> {
  const plan = scenarios?.length
    ? scenarios.map((s) => CaptureScenario.parse(s))
    : options.livePlan
      ? liveScenarioPlan(options.routes ?? ["/", "/pricing", "/account"])
      : defaultScenarioPlan(options.routes ?? ["/"]);
  const cells = [];
  for (const scenario of plan) {
    const url = joinUrl(baseUrl, scenario.route);
    const capture = await captureUrl(url, {
      theme: scenario.theme,
      primaryViewport: scenario.viewport,
      interaction: scenario.interaction,
      authRole: scenario.authRole,
      storageState: scenario.authRole === "authenticated" ? options.storageState : undefined,
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
