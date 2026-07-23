import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveAuthStorageState } from "../capture/capture-url";
import { buildScenario, liveScenarioPlan, scenarioId } from "../capture/scenario-matrix";

const root = join(process.cwd());

describe("auth storage resolution", () => {
  it("ignores storage for anonymous captures", () => {
    expect(resolveAuthStorageState({ authRole: "anonymous" })).toBeUndefined();
  });

  it("resolves the committed fixture storage state path", () => {
    const path = join(root, "fixtures/generic-app/auth-storage.json");
    expect(existsSync(path)).toBe(true);
    expect(resolveAuthStorageState({ authRole: "authenticated", storageState: path })).toBe(path);
  });

  it("throws a clear error when authenticated without storage", () => {
    const prev = process.env.TELL_AUTH_STORAGE_STATE;
    delete process.env.TELL_AUTH_STORAGE_STATE;
    expect(() => resolveAuthStorageState({ authRole: "authenticated" })).toThrow(/storage state/i);
    if (prev !== undefined) process.env.TELL_AUTH_STORAGE_STATE = prev;
  });
});

describe("liveScenarioPlan", () => {
  it("covers viewport, theme, interaction, and authenticated account cell", () => {
    const plan = liveScenarioPlan(["/", "/pricing", "/account"]);
    const ids = plan.map((s) => s.id);
    expect(ids).toContain("root__desktop__light__default__anonymous");
    expect(ids).toContain("root__mobile__light__default__anonymous");
    expect(ids).toContain("root__desktop__dark__default__anonymous");
    expect(ids).toContain("root__desktop__light__hover__anonymous");
    expect(ids).toContain("pricing__desktop__light__default__anonymous");
    expect(ids).toContain("account__desktop__light__default__authenticated");
    expect(plan.every((s) => s.id === scenarioId(s))).toBe(true);
  });

  it("omits authenticated cell when /account is not in routes", () => {
    const plan = liveScenarioPlan(["/", "/pricing"]);
    expect(plan.some((s) => s.authRole === "authenticated")).toBe(false);
  });
});

describe("buildScenario auth dimension", () => {
  it("encodes authRole in the scenario id", () => {
    const s = buildScenario({
      route: "/account",
      viewport: "desktop",
      theme: "light",
      interaction: "default",
      authRole: "authenticated",
    });
    expect(s.id).toBe("account__desktop__light__default__authenticated");
    expect(s.authRole).toBe("authenticated");
  });
});
