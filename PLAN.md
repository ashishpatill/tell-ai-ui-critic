# Tell — Consolidated Plan

> **Single source of truth for remaining work.** All other plan docs either duplicate this,
> are historical specs, or are archived under `docs/archive/`.
>
> Engineering contracts: root [`BUILD.md`](./BUILD.md) (milestones M1–M10).  
> Product status snapshot: [`README.md`](./README.md) § Product Status.  
> Agent routing: [`ORCHESTRATION.md`](./ORCHESTRATION.md).

---

## Visual status

```mermaid
flowchart TB
  subgraph done["✅ Complete"]
    M1[M1–M10 Sprint MVP]
    P1[Phase 1 Proof MCP + CI]
    P2[Phase 2 Share + probes + DESIGN.md]
    P3[Phase 3 Viewport matrix + proof API + corpus]
    P4[Phase 4 Taxonomy + corpus + PR automation]
  end

  done --> Optional[Optional: live-site corpus + scenario matrix]
```

| Layer | Status | Authority |
|---|---|---|
| Sprint MVP M1–M10 | ✅ Done | `BUILD.md` §8 |
| Phase 1 (proof MCP, PR diagnose, golden fixture) | ✅ Done | README |
| Phase 2 (share links, state probes, DesignSystemDrift) | ✅ Done | README |
| Phase 3 (viewport matrix, `/api/proof/verify`, corpus manifest) | ✅ Landed on this branch | PLAN.md |
| Phase 4 (taxonomy, more corpus, PR proof automation) | 🟡 Implementing | PLAN.md |
| Stretch cut earlier | ✅ Share links + state probes shipped | was `docs/04` §10 |

---

## Plan inventory (what to keep vs archive)

| Doc | Role | Action |
|---|---|---|
| **`PLAN.md` (this file)** | Consolidated remaining-work plan | **Keep — primary** |
| **`BUILD.md`** | Engineering contracts + M1–M10 DoD | **Keep — never archive** |
| **`ORCHESTRATION.md`** | Agent/model routing | **Keep** |
| **`USER_STORY.md`** | Priya north star / copy | **Keep** |
| **`README.md` Product Status** | Public shipped/next list | Keep in sync with this file |
| `docs/02_CURSOR_BUILD_INSTRUCTIONS.md` | Exact duplicate of `BUILD.md` | **Archived** → stub |
| `docs/04_CLAUDE_PROJECT.md` §12 tracker | Stale all-⬜ milestones | **Updated** to match reality |
| `docs/06_REDESIGN_ENGINE_V2.md` | Redesign v2 build spec | **Archived as shipped** → stub |
| `docs/01`, `03`, `05`, `06_TELL_PROOF`, `DEPLOY*` | Living specs / deploy | **Keep** (not plans) |
| `DESIGN.md`, `PITCH.md` | Dogfood contract / pitch | **Keep** |

Nothing unique was lost: Phase 3/4 remaining items lived only in README “Next”; redesign v2 requirements are implemented in `packages/redesign`.

---

## Phase 4 checklist (DoD)

- [x] Machine-readable open taxonomy at `fixtures/corpus/taxonomy.json` (+ README)
- [x] Additional corpus captures: `editorial-calm` (0 tells), `fintech-dense` (dense drift profile)
- [x] Manifest + golden tests cover new categories
- [x] GitHub workflow / script for proof-compare on UI PRs
- [x] Cursor after-edit hook reminds agents to run proof-verify on UI changes
- [x] Tracker + README Product Status updated; redundant plans archived

---

## Goal prompt (paste into Composer / Cloud Agent)

```
@PLAN.md @BUILD.md @USER_STORY.md @ORCHESTRATION.md @README.md

GOAL: Complete Tell Proof through Phase 4 so the consolidated plan has zero open items.

Non-negotiables:
- Deterministic core (packages/core) has zero LLM calls
- Never auto-apply patches; proof verify may apply only in disposable checkout
- Schemas via @tell/schema at every boundary
- pnpm test + schema build + web typecheck must stay green
- Preserve offline fixture fallback (fixtures/reports/tell-report.json)

Done when PLAN.md Phase 4 checklist is all checked and README Product Status lists Phase 4 as shipped.
```

---

## Loop prompt (iterate until green)

```
@PLAN.md

LOOP:
1. Read PLAN.md Phase 4 checklist — pick the first unchecked item.
2. Implement the smallest change that satisfies its DoD.
3. Run: pnpm test && pnpm -F @tell/schema build && pnpm -F @tell/web typecheck
4. Update PLAN.md checklist + README Product Status + docs/04 §12 tracker.
5. Commit with a conventional message; push the feature branch.
6. If any checklist item remains, go to step 1.
7. Stop only when all Phase 4 items are checked and tests are green.

If blocked: document the blocker in PLAN.md Status log and continue with the next unchecked item.
```

---

## Status log

```
[2026-07-17] Phase 4 closed — taxonomy, corpus captures, proof:compare workflow, plan consolidation.
[2026-07-17] Consolidated PLAN.md created; docs/02 + redesign-v2 archived; Phase 3 cherry-picked onto branch.
```
