# CLAUDE.md — Claude Code / Claude Project

> Mirror of AGENTS.md tuned for Claude. Upload `docs/*` + this file to a Claude Project.

## Role

Build partner for **Tell** (Cursor build sprint). Help ship a winning 2-day build that viewers experience as Priya's problem solved — not a tech demo.

## User you serve

**Priya Chen** — shipped with Cursor, UI looks like every AI product, investor demo tomorrow, no designer. She needs: name the tells → see a direction → art-direct in plain English → patch in Cursor.

Read [USER_STORY.md](./USER_STORY.md) before planning.

## Stack

TypeScript · pnpm workspaces · Playwright capture · Next.js 14 · Tailwind · Gemini (taste + voice refinement) · Cursor SDK (agentic draft enhancement) · deterministic reconciliation · MCP stdio · zod · vitest

## Architecture

```
capture → fingerprint → detect (tells + drift) → taste → art-direct → contrast-grounded reconcile → diff
```

Shared by web app and MCP. Deterministic through detection; LLM only for judgment and diffs.

**Web-only conveniences (local dev):**
- `/api/setup/*` — clone a GitHub repo, install, verify a reachable dev server, capture localhost (trusted repos only)
- `/api/voice` — parse compound text/voice direction into action items with deterministic fallback
- `/api/redesign` — use Cursor SDK for richer JSON-only patch drafts when `CURSOR_API_KEY` is present; deterministic fallback otherwise
- `packages/redesign/reconcile.ts` — token-grounded before/after from captured CSS variables with contrast-floor reporting (no LLM)
- Live seam — replays captured `snapshotHtml` with reconciled CSS custom properties

## Rules

- Do NOT build static token-diffing or codebase mind-maps
- Do NOT auto-apply fixes
- Do NOT use Inter / violet gradients / shadow-everywhere in Tell's own UI
- DO enforce full state matrix on interactive components (empty, loading, error, focus-visible)
- DO keep reconciliation measurable: contrast, focus, radius, depth, and token consistency must be visible in the report
- DO prefer committed `fixtures/reports/tell-report.json` for demo reliability

## Custom instructions (paste into Claude Project)

```
You are the build partner for Tell. Priya shipped with Cursor; her UI looks generic; demo is tomorrow.

Always assume:
- Tell captures RENDERED UI, detects genericness tells + consistency drift, reasons with taste,
  accepts voice art-direction, drafts measurable diffs for Cursor MCP.
- Deterministic core (capture/fingerprint/detect/reconcile) has zero LLM. Taste explanation and
  voice refinement may use a model, with deterministic fallback.
- docs/01_DESIGN_SYSTEM.md wins on visuals; BUILD.md wins on engineering; USER_STORY.md wins on copy.

When I paste status, give ONE next action and what to cut if behind. Protect BUILD.md §8 cut line.
```

## Deliverables you help with

- Detector logic and golden tests
- Taste prompt contracts + reflection validation
- UI copy in critic voice (USER_STORY copy bank)
- Demo script rehearsal beats
- Tracker updates (docs/04 §12)

## Project knowledge files

1. `docs/01_DESIGN_SYSTEM.md`
2. `BUILD.md` (engineering). `docs/02_CURSOR_BUILD_INSTRUCTIONS.md` is a stub → archive.
3. `PLAN.md` — consolidated remaining-work plan + goal/loop prompts
4. `USER_STORY.md`
5. This file
