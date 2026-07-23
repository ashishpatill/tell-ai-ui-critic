# Tell Proof — Independent Visual Checks for Coding Agents

## Thesis

Coding agents can now write, run, and demo a user interface. The missing trust boundary is an independent system that decides whether the rendered result is actually better and safe to merge.

Tell Proof is the beginning of that boundary:

```text
agent change
  → rendered evidence
  → source-grounded repair
  → disposable checkout
  → independent recapture
  → visual pass / review / fail
```

The important distinction is independence. A video produced by the same agent that made the change is a useful artifact, but it is not an acceptance test.

## Shipped loop

1. A GitHub repository is cloned, installed, and booted on a free local port.
2. Playwright captures rendered pixels, DOM roles, computed styles, tokens, and interaction-state coverage.
3. Tell discovers relevant TSX, JSX, CSS, Sass, Vue, Svelte, HTML, and configuration source in the disposable checkout.
4. The redesign endpoint receives both rendered evidence and bounded real source context.
5. The proposal is validated with `git apply --check`.
6. The patch is applied only inside Tell's temporary checkout.
7. Tell waits for the running dev server to hot-reload and captures the product again.
8. The visual check compares:
   - measured genericness;
   - focus-ring coverage;
   - heading and control structure;
   - sampled rendered element count;
   - finding count and changed files.
9. If the patch cannot apply or the app cannot be recaptured, Tell automatically rolls it back.
10. The user receives two separate browser captures, measured deltas, and a one-click worktree revert.

## Scenario matrix (Phase 5–6)

Beyond the single-route desktop proof, Tell ships a **scenario matrix**:

```text
route × viewport × theme × interaction × authRole
```

| Piece | Location |
|---|---|
| Schemas | `CaptureScenario`, `ScenarioMatrix`, `ProofMatrixResult` in `@tell/schema` |
| Capture | `captureScenarioMatrix()` / `liveScenarioPlan()` in `@tell/core` |
| Compare | `compareProofMatrices()` — per-cell pass/review/fail, then aggregate |
| Offline fixture | `fixtures/corpus/scenario-matrix.json` |
| Live CLI | `pnpm capture:matrix` (`TELL_MATRIX_URL`, optional `TELL_AUTH_STORAGE_STATE`) |
| Auth harness | Playwright `storageState` — `pnpm auth:fixture` → `fixtures/generic-app/auth-storage.json` |
| CI | Offline `pnpm proof:matrix` smoke + live fixture matrix in `pr-proof-compare.yml` |
| MCP / API / UI | `tell_capture_matrix`, `POST /api/proof/matrix`, Tell Report “Scenario matrix” panel |

Each cell is a replayable `CapturePayload` tagged with scenario dimensions. Authenticated cells load a disposable Playwright storage state (cookie `tell_session=authenticated` on the generic-app `/account` gate). There is no product login/OAuth flow.

`ResponsiveViewportDrift` fires when tablet/mobile `viewportMatrix` summaries lose ≥40% of desktop headings or buttons.

## Why this belongs beside Cursor

Cursor already has strong authoring, visual prompting, browser control, cloud execution, and code review. Tell Proof is complementary infrastructure:

- a rendered reward signal for frontend agents;
- an independent visual reviewer for agent PRs;
- replayable evidence for model and harness evaluation;
- a source-to-browser feedback loop that can reject regressions before merge.

## Scope notes

The default single-URL proof path remains the demo loop. The scenario matrix extends it for CI and corpus evaluation. It does not claim full accessibility, performance, security, or merge readiness on its own.
