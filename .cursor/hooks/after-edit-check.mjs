#!/usr/bin/env node
/** Dogfood lint + proof-verify reminder for UI / redesign edits */
import { readFileSync } from "node:fs";

let input = "";
process.stdin.setEncoding("utf8");
for await (const chunk of process.stdin) input += chunk;

let payload = {};
try {
  payload = JSON.parse(input || "{}");
} catch {
  process.exit(0);
}

const filePath = payload.file_path ?? payload.path ?? "";
const isWeb = filePath.includes("apps/web");
const isRedesign = filePath.includes("packages/redesign");
if (!isWeb && !isRedesign) process.exit(0);

let content = "";
try {
  content = readFileSync(filePath, "utf8");
} catch {
  process.exit(0);
}

const warnings = [];
if (isWeb && /className=[^>]*#([0-9A-Fa-f]{3,8})/.test(content)) {
  warnings.push("Raw hex in className — use design tokens (dogfood contract).");
}
if (isWeb && /font-inter\b|"Inter"/.test(content) && !content.includes("generic-app")) {
  warnings.push("Inter detected in Tell UI — use Instrument Serif / Source Sans 3.");
}

const isUiSurface =
  /apps\/web\/src\/(app|components)\//.test(filePath) || isRedesign;
if (isUiSurface) {
  warnings.push(
    "UI surface changed — after drafting a patch, run tell_proof_verify (or pnpm proof:compare) before merge. Never auto-apply to the main checkout.",
  );
}

if (warnings.length) {
  console.log(
    JSON.stringify({
      followup_message: `[Tell dogfood hook] ${filePath}:\n- ${warnings.join("\n- ")}`,
    }),
  );
}
