# AGENTS.md — Cursor Agent instructions

You are building **Tell**: an AI taste critic for rendered UI. Read [USER_STORY.md](./USER_STORY.md) first — every feature serves Priya's journey (solo founder, shipped with Cursor, UI looks generic, demo tomorrow).

## Mission

Capture rendered UI → deterministic fingerprint → detect tells + drift → taste verdict → voice art-direction → redesign diff → apply in Cursor (human approves).

## Non-negotiables

1. **Deterministic core** — `packages/core` has zero LLM calls. Taste/redesign only.
2. **Never auto-apply** — MCP `tell_apply` returns patches; human applies.
3. **Schemas** — all boundaries use `@tell/schema` zod types.
4. **Tokens only** in `apps/web` — no raw hex in classNames (dogfood).
5. **User-first copy** — critic voice, problem-oriented, see USER_STORY copy bank.
6. **Measured reconciliation** — any after-state must preserve readable contrast and explain the measured improvement.
7. **Build order** — follow BUILD.md §8 milestones M1→M10; protect cut line.

## Where things live

| Path | Purpose |
|---|---|
| `packages/schema` | Zod contracts — edit first |
| `packages/core` | Capture, fingerprint, detectors |
| `packages/taste` | Gemini taste + deterministic/Gemini voice direction parsing |
| `packages/redesign` | Contrast-grounded reconciliation + diff generation |
| `packages/mcp` | Cursor MCP server |
| `apps/web` | Priya-facing UI + `/api/diagnose`, `/api/setup/*`, `/api/voice`, `/api/redesign` |
| `apps/web/src/lib/cursor-redesign.ts` | Cursor-SDK-backed patch drafting with deterministic fallback |
| `apps/web/src/lib/repo-runner.ts` | GitHub clone → install → reachable dev server (local only) |
| `apps/web/src/lib/discover-routes.ts` | Multi-page route discovery from snapshot HTML |
| `packages/redesign/src/reconcile.ts` | Deterministic token reconciliation for live seam |
| `fixtures/generic-app` | Demo "before" (labeled input, not our work) |
| `fixtures/reports/` | Offline demo artifacts |

## Parallel workstreams (multitask)

When using Task/subagents, split by package boundary — never split a zod schema across agents:

| Agent | Scope | DoD |
|---|---|---|
| A | `packages/schema` + `packages/core` detectors | vitest green on fixture JSON |
| B | `packages/taste` + `packages/redesign` | mock taste returns valid verdicts |
| C | `apps/web` components | matches docs/01_DESIGN_SYSTEM.md |
| D | `fixtures/generic-app` | triggers all planted tells |

Merge only after schema is frozen.

## MCP tools (use in Agent chat)

```
tell_capture({ url })
tell_diagnose({ url?, reportPath? })
tell_redesign({ direction, findingId? })
tell_apply({ proposalId })
```

## Testing before claiming done

```bash
pnpm test
pnpm -F @tell/schema build
pnpm -F @tell/web typecheck
```

## Demo narrative (do not lead with architecture)

1. Paste a live URL **or** `github.com/owner/repo` → Set up & run / Capture with clear loading and failure states
2. Named tells with evidence on the real rendered page
3. Pages strip — scan `/pricing` or other routes for drift
4. Seam drag — live reconciliation of the captured page with contrast floor called out
5. Voice: "warmer, editorial, less shadow" → action items + reconciliation table update
6. Draft fix → copy patch → Apply in Cursor
7. Dogfood: zero tells on Tell itself

## Project skills

Feature workflows live in `.cursor/skills/`:

- `tell-schema-contracts` — zod contracts first
- `tell-detector-authoring` — detectors in `packages/core`
- `tell-capture-fingerprint` — Playwright capture + fingerprint
- `tell-taste-verdicts` — taste + voice direction
- `tell-redesign-diff` — reconciliation + diffs
- `tell-mcp-tools` — MCP integration
- `tell-report-ui` — web app + API routes
- `tell-github-setup` — clone/install/run localhost
- `tell-demo-fixture` — fixtures + offline demo
- `tell-dogfood-audit` — zero-tells self audit
- `tell-deploy` — Vercel/Docker public URL
- `tell-demo-script` — demo + compliance

## Subagents

Role agents live in `.cursor/agents/`:

- `orchestrator` — milestones and parallel Tasks
- `core-engineer` — schema + capture + detectors
- `taste-engineer` — verdicts + direction parsing
- `redesign-engineer` — reconciliation + diffs
- `mcp-engineer` — MCP server + Cursor tools
- `ui-builder` — Tell Report UI
- `ux-copywriter` — Priya-facing copy
- `fixture-smith` — bland demo app
- `deploy-engineer` — public demo URL
- `demo-director` — rehearsal + compliance
- `dogfood-auditor` — M10 self audit

See `ORCHESTRATION.md` for model routing and when to invoke each.

## Docs authority

- Visuals: `docs/01_DESIGN_SYSTEM.md`
- Engineering: `BUILD.md`
- Remaining work / goal+loop prompts: `PLAN.md`
- Screens: `docs/03_CLAUDE_DESIGN_BRIEF.md`
- Vision/scope: `docs/04_CLAUDE_PROJECT.md`
- Educational / interactive visualization plan: `docs/07_VISUALIZATION_PLAN.md` (principles only — no third-party author or site names)
- AI design methods + how to add styles: `docs/08_AI_DESIGN_METHODS.md` (principle-only)

## Cursor Cloud specific instructions

Node 20+ and pnpm 9 are required (see root `package.json` `engines`/`packageManager`). Dependencies (`pnpm install`) and Playwright Chromium are refreshed by the startup update script — no manual install needed.

Services (both Next.js 14, standard commands in root `package.json`):

| Service | Command | Port | Notes |
|---|---|---|---|
| `@tell/web` (the product) | `pnpm dev` | 3000 | Tell Report UI + API routes |
| `@tell/generic-app` (fixture "before" app) | `pnpm dev:fixture` | 3001 | Local capture target for the demo loop |

Non-obvious caveats:

- **Live capture needs Playwright Chromium.** The update script runs `playwright install chromium`. Verify readiness with `GET /api/health/capture` (expects `{"ok":true}`). If capture can't run, `/api/diagnose` silently falls back to the committed offline report (`fixtures/reports/tell-report.json`) with `meta.live=false` — so a passing UI does not by itself prove live capture works; check `meta.live` or the health route.
- **End-to-end smoke test:** with both servers up, POST `http://localhost:3000/api/diagnose` with `{"url":"http://localhost:3001"}` (or paste `http://localhost:3001` into the URL field and click Capture). A live run returns `meta.live=true` and 14 findings.
- **`pnpm lint` is broken at the repo level** — `eslint` is not a declared dependency and there is no eslint config. Use `pnpm typecheck` and `pnpm test`; the `next build` step also performs its own lint/type validation.
- **No secrets required.** Every AI/remote feature (`GEMINI_API_KEY`, `CURSOR_API_KEY`, `TELL_CAPTURE_API_URL`) has a deterministic/offline fallback; the deterministic core (capture → fingerprint → detect → reconcile) makes zero LLM calls.
