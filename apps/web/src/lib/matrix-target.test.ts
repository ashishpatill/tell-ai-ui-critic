import { describe, expect, it } from "vitest";
import { matrixTarget } from "./matrix-target";

describe("matrixTarget", () => {
  it("uses origin root when pages are absolute site routes", () => {
    const result = matrixTarget("http://localhost:3001/", ["/", "/pricing", "/account"]);
    expect(result.baseUrl).toBe("http://localhost:3001");
    expect(result.routes.sort()).toEqual(["/", "/account", "/pricing"]);
  });

  it("preserves a shared subpath base", () => {
    const result = matrixTarget("https://example.com/app/pricing", ["/app", "/app/pricing", "/app/account"]);
    expect(result.baseUrl).toBe("https://example.com/app");
    expect(result.routes.sort()).toEqual(["/", "/account", "/pricing"]);
  });

  it("does not invent a base from a single leaf capture path", () => {
    expect(matrixTarget("http://localhost:3001/pricing", [])).toEqual({
      baseUrl: "http://localhost:3001",
      routes: ["/pricing"],
    });
  });
});
