import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

// Monorepo env lives at tell/.env — load it before Next reads server env.
const tellRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnvConfig(tellRoot);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tell/schema", "@tell/taste", "@tell/redesign", "@tell/core"],
  experimental: {
    // Playwright must stay external so Next does not try to bundle browser binaries.
    serverComponentsExternalPackages: ["playwright", "playwright-core"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        "playwright",
        "playwright-core",
      ];
    }
    return config;
  },
};

export default nextConfig;
