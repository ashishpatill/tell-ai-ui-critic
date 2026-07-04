#!/usr/bin/env tsx
import { captureUrl, diagnoseCapture } from "../index";

const url = process.argv[2];
if (!url) {
  console.error("Usage: diagnose-url <url>");
  process.exit(1);
}

const report = diagnoseCapture(await captureUrl(url));
process.stdout.write(JSON.stringify(report));
