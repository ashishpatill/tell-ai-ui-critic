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

## Why this belongs beside Cursor

Cursor already has strong authoring, visual prompting, browser control, cloud execution, and code review. Tell Proof is complementary infrastructure:

- a rendered reward signal for frontend agents;
- an independent visual reviewer for agent PRs;
- replayable evidence for model and harness evaluation;
- a source-to-browser feedback loop that can reject regressions before merge.

## Current scope and next expansion

The shipped check covers one route at one captured desktop viewport in its default rendered state. It does not claim functional, responsive, full-accessibility, performance, security, or merge readiness. The architecture extends naturally to a scenario matrix:

```text
route × viewport × theme × auth role × interaction state
```

Each cell becomes a replayable artifact with a pass, review, or fail verdict. A future PR integration can compare base and head worktrees, run the matrix in CI, and publish the proof bundle directly into Cursor or GitHub.
