# Tell — Agent Orchestration

> How to use **Composer 2.5**, **Opus 4.8**, and **GPT 5.5** with role-specific subagents for a 2-day hackathon build. Priya's user story is the north star — every agent role exists to ship her journey.

---

## Model roles (when to use which)

| Model | Role | Use for | Avoid |
|---|---|---|---|
| **Composer 2.5** (`composer-2.5-fast`) | **Orchestrator + Implementer** | Scaffold wiring, React components, API routes, MCP glue, merge conflicts, milestone execution | Deep prompt engineering, novel detector algorithms |
| **Opus 4.8** (`claude-opus-4-8-thinking-high`) | **Architect + Taste** | Zod contracts, detector logic, taste prompts, reflection validation, edge-case reasoning | Bulk UI boilerplate |
| **GPT 5.5** (`gpt-5.5-medium`) | **UX + Copy + Demo** | User-facing copy, USER_STORY alignment, demo script, landing narrative, voice preset labels | Core TypeScript engine |

**Default session:** Start in **Composer 2.5** with `AGENTS.md` + `@ORCHESTRATION.md`. Escalate to Opus for hard problems; delegate copy/demo to GPT 5.5 subagent.

---

## Subagents (`.cursor/agents/`)

| Agent | Model hint | Scope | Invoke when |
|---|---|---|---|
| `orchestrator` | Composer 2.5 | Milestones, merges, parallel Task splits | Starting a work session or milestone |
| `core-engineer` | Opus 4.8 | `packages/schema`, `packages/core` | Detectors, fingerprint, capture |
| `taste-engineer` | Opus 4.8 | `packages/taste`, prompts | Taste verdicts, direction parsing |
| `redesign-engineer` | Opus 4.8 | `packages/redesign` | Reconciliation, contrast floor, diffs |
| `mcp-engineer` | Composer 2.5 | `packages/mcp`, `.cursor/mcp.json` | MCP tools, Cursor integration |
| `ui-builder` | Composer 2.5 | `apps/web`, components | Tell Report, seam, inspector |
| `ux-copywriter` | GPT 5.5 | Copy, USER_STORY, empty states | Any user-visible string |
| `fixture-smith` | Composer 2.5 | `fixtures/generic-app` | Bland demo app |
| `deploy-engineer` | Composer 2.5 | Vercel, Docker, Render configs | Public demo URL |
| `demo-director` | GPT 5.5 | Demo script, compliance, rehearsal | Pre-judging, M9 |
| `dogfood-auditor` | Opus 4.8 | Run Tell on self, a11y | Pre-demo, M10 |

Invoke: *"Use the core-engineer subagent to implement SystemFontTell detector"*

---

## Multitask parallel plan (Day 1)

Run **4 parallel Tasks** from Composer orchestrator after M1 schema is merged:

```
Task 1 [Opus · core-engineer]  → packages/core capture + fingerprint + detectors
Task 2 [Opus · taste-engineer]  → packages/taste mock engine + direction presets (parallel to core)
Task 3 [Composer · ui-builder]  → apps/web shell + CaptureBar + empty state (Priya copy)
Task 4 [Composer · fixture-smith] → fixtures/generic-app (all planted tells)
```

**Merge gate:** schema frozen → run tasks → vitest on fixture JSON → continue.

## Multitask parallel plan (Day 2)

```
Task 1 [Composer · ui-builder]  → BeforeAfterSeam + TellReport + inspector + setup/capture states
Task 2 [Opus · taste-engineer]  → Live Gemini + reflection loop + direction parser fallback
Task 3 [Composer · mcp-engineer] → packages/mcp + .cursor/mcp.json smoke test
Task 4 [Opus · redesign-engineer] → reconcile.ts contrast floor + patch parity with seam
Task 5 [GPT 5.5 · ux-copywriter] → Landing page + demo script polish
Task 6 [Composer · deploy-engineer] → Vercel/Docker deploy + public URL
Task 7 [GPT 5.5 · demo-director] → Rehearsal script + compliance checklist
Task 8 [Opus · dogfood-auditor] → M10 zero tells on apps/web
```

---

## Cursor features checklist

| Feature | Config | Purpose |
|---|---|---|
| **Rules** | `.cursor/rules/*.mdc` | Role-specific constraints auto-attach by glob |
| **Skills** | `.cursor/skills/*/SKILL.md` | Feature workflows auto-discovered by task |
| **Subagents** | `.cursor/agents/*.md` | Delegate with model-appropriate expertise |
| **MCP** | `.cursor/mcp.json` | `tell_*` tools inside Agent chat |
| **Hooks** | `.cursor/hooks.json` | Session context + token lint on web edits |
| **AGENTS.md** | repo root | Composer reads first every session |
| **CLAUDE.md** | repo root | Claude Code / Project parity |
| **BUILD.md** | repo root | Milestone DoD |
| **USER_STORY.md** | repo root | Priya journey — copy authority for GPT 5.5 |

---

## Prompt templates (paste into Composer)

### Start milestone
```
@ORCHESTRATION.md @BUILD.md @USER_STORY.md
Execute milestone M{N}. Use orchestrator to split parallel Tasks per ORCHESTRATION.md.
Schema is frozen. Do not advance until DoD met.
```

### Opus deep dive
```
Switch to Opus. @packages/core/src/detectors/
Implement {DetectorName} per BUILD.md §5.3. Facts must be deterministic.
Add vitest golden test against fixtures/reports/capture.json.
```

### GPT copy pass
```
Use ux-copywriter subagent (GPT 5.5). @USER_STORY.md copy bank.
Rewrite empty/loading/error states in apps/web for Priya's voice. No emoji. Critic tone.
```

### Pre-demo dogfood
```
Use dogfood-auditor subagent. Run diagnose on apps/web.
Fix any generic tells. Target: zero tells per docs/01_DESIGN_SYSTEM.md §12.
```

---

## Project skills (`.cursor/skills/`)

| Skill | Feature area |
|---|---|
| `tell-schema-contracts` | Zod contracts in `packages/schema` |
| `tell-detector-authoring` | 14 genericness + drift detectors in `packages/core` |
| `tell-capture-fingerprint` | Playwright capture + deterministic fingerprint |
| `tell-taste-verdicts` | Taste engine + voice art-direction |
| `tell-redesign-diff` | Reconciliation, contrast floor, patch generation |
| `tell-mcp-tools` | Cursor MCP `tell_*` tools |
| `tell-report-ui` | Tell Report, seam, voice director, setup API |
| `tell-github-setup` | GitHub clone → install → localhost capture |
| `tell-demo-fixture` | Bland fixture + offline report artifacts |
| `tell-dogfood-audit` | M10 zero-tells audit on `apps/web` |
| `tell-deploy` | Vercel, Docker, Render, Railway |
| `tell-demo-script` | 3-minute judge demo + compliance |

Invoke: *"@tell-detector-authoring add StateGap threshold tuning"* or let Cursor auto-attach from the skill description.

## External skills to attach manually (Composer session)

| Skill | When |
|---|---|
| `create-rule` | Adding new `.mdc` rules |
| `create-skill` | Adding new project skills |
| `create-subagent` | New specialized agent |
| `create-hook` | New automation hooks |
| `figma-implement-design` | If Claude Design exports arrive |
| `review-bugbot` | Before milestone merge |
| `vercel-deploy` | Demo deployment — see [docs/DEPLOY.md](./docs/DEPLOY.md) |

---

## Cut line reminder

Live URL capture, GitHub repo setup, contrast-grounded token reconciliation, voice/text direction parsing, and draft-fix diffs are shipped. If something breaks at demo time: fall back to the committed `fixtures/reports/tell-report.json` artifact and the seeded fixture — the offline path still lands Priya's journey.
