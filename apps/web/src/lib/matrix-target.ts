/**
 * Derive a matrix base URL + relative routes from a captured page and discovered paths.
 * Preserves subpath deployments when multiple paths share a prefix
 * (e.g. https://host/app + /app/pricing → base=/app, routes=/,/pricing).
 */
export function matrixTarget(
  captureUrl: string,
  pagePaths: string[] = [],
): { baseUrl: string; routes: string[] } {
  const u = new URL(captureUrl);
  const normalize = (p: string) => {
    const pathOnly = (p.split("?")[0] || "/").trim() || "/";
    const withSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
    if (withSlash.length > 1 && withSlash.endsWith("/")) return withSlash.slice(0, -1);
    return withSlash || "/";
  };

  const capturePath = normalize(u.pathname || "/");
  const paths = [...new Set([capturePath, ...pagePaths.map(normalize)])];

  // A single path is treated as an origin-rooted route, not a deployment prefix.
  if (paths.length < 2) {
    return { baseUrl: u.origin, routes: [capturePath || "/"] };
  }

  const segments = paths.map((p) => (p === "/" ? [] : p.split("/").filter(Boolean)));
  let prefix = segments[0] ?? [];
  for (const segs of segments.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < segs.length && prefix[i] === segs[i]) i += 1;
    prefix = prefix.slice(0, i);
  }

  const basePath = prefix.length ? `/${prefix.join("/")}` : "";
  const routes = [
    ...new Set(
      paths.map((p) => {
        if (!basePath) return p || "/";
        if (p === basePath) return "/";
        if (p.startsWith(`${basePath}/`)) return p.slice(basePath.length) || "/";
        return p;
      }),
    ),
  ];

  return {
    baseUrl: `${u.origin}${basePath}`,
    routes: routes.length ? routes : ["/"],
  };
}
