import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@tell/schema": path.resolve(__dirname, "packages/schema/src"),
      "@tell/core": path.resolve(__dirname, "packages/core/src"),
      "@tell/redesign": path.resolve(__dirname, "packages/redesign/src"),
    },
  },
});
