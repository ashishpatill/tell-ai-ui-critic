# CONTRIBUTIONS.md

> Project attribution requirement: clearly distinguish work created during the event from demo inputs.

## Original work (Tell team — built for Tell)

Everything under these paths is **original Tell work**:

- `packages/schema/` — zod data contracts
- `packages/core/` — capture, fingerprint, detectors
- `packages/taste/` — taste engine, deterministic/Gemini direction parsing, direction presets
- `packages/redesign/` — contrast-grounded reconciliation and redesign diff generation
- `packages/mcp/` — Cursor MCP server
- `apps/web/` — Tell product UI (editorial/print-atelier design system) + live capture/setup/voice API routes
- `apps/web/src/lib/repo-runner.ts`, `discover-routes.ts`, `run-diagnose.ts`, `use-voice.ts`, `cursor-redesign.ts` — local repo runner, Cursor-SDK patch enhancement, and live pipeline helpers
- `packages/redesign/src/reconcile.ts` — deterministic token reconciliation for live seam, including contrast-floor reporting
- `.cursor/` — rules, hooks, MCP config
- `AGENTS.md`, `CLAUDE.md`, `USER_STORY.md`, `README.md`, `BUILD.md`
- `fixtures/reports/tell-report.json` — **generated report artifact** from our engine (not hand-authored fiction)
- Tests, scripts, and documentation in `docs/` adapted for Tell

## Demo input (NOT our contribution)

- `fixtures/generic-app/` — **deliberately bland** sample app hand-built to trigger Tell detectors for demo purposes. It simulates "Priya's AI-built landing page." Licensed MIT for demo use only. Clearly labeled in UI as demo target.
- Public GitHub repositories pasted into Tell during a demo are **external inputs only**. Tell may clone, run, and scan them locally, but they are not part of this repository and are not claimed as original work.

## Third-party

- Fonts: Instrument Serif, Source Sans 3, IBM Plex Mono (Google Fonts)
- Icons: Lucide (ISC)
- Dependencies: see package.json files (standard OSS licenses)

## How to verify at demo time

1. We show Tell scanning `fixtures/generic-app` — the bland app is **input**, not the product.
2. The product is the capture → diagnose → art-direct → contrast-grounded reconcile loop in Tell UI + MCP.
3. Git history shows Tell engine and UI commits during the event window.

## Fork / attribution

If we fork any starter template, it will be noted here with license and link. Currently: greenfield scaffold.
