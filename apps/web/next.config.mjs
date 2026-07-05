import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

// Monorepo env lives at tell/.env — load it before Next reads server env.
const tellRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnvConfig(tellRoot);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@tell/schema", "@tell/taste", "@tell/redesign"],
  experimental: {
    // Playwright + @tell/core must stay external (native binaries + dist runtime).
    serverComponentsExternalPackages: ["playwright", "playwright-core", "@tell/core"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        "playwright",
        "playwright-core",
        "@tell/core",
      ];
    }
    return config;
  },
};

export default nextConfig;
