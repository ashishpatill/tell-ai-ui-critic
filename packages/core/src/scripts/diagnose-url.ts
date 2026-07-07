#!/usr/bin/env tsx
import { captureUrl, diagnoseCapture, loadDesignDoc } from "../index";

const url = process.argv[2];
if (!url) {
  console.error("Usage: diagnose-url <url>");
  process.exit(1);
}

const designDoc = await loadDesignDoc();
const report = diagnoseCapture(await captureUrl(url), undefined, designDoc);
process.stdout.write(JSON.stringify(report));
