# Semantic commits

Rewrite the current branch's uncommitted (or single squashable) work into **as many small conventional commits as possible**, then push.

## Rules

1. Use conventional commit subjects only: `feat|fix|docs|test|chore|ci|refactor|perf|build(scope): …`
2. **Never** mention Cursor, cloud agents, Copilot, or similar tooling in commit messages or PR text.
3. One logical change per commit — prefer more commits over fewer. Good splits:
   - schema contracts alone
   - one detector or pure function
   - one capture/helper module
   - one fixture file
   - tests for one area
   - one script or CI wire-up
   - docs/tracker updates last (or per doc file)
4. Do **not** squash unrelated packages into one commit.
5. Keep commits buildable when practical; if an intermediate commit must be incomplete, keep follow-ups tight and sequential.
6. Prefer `git add` of specific paths over `git add -A`.
7. After all commits: `git push -u origin <branch>` (force-with-lease only when rewriting already-pushed commits on this feature branch).
8. Update the open PR description if history was rewritten — still no tooling brand names.

## Procedure

1. Inspect `git status` and `git diff --stat` against the merge base (`master` unless told otherwise).
2. If work is already one fat commit on the feature branch: `git reset --soft <base>` then unstage (`git reset HEAD`) so files are working-tree changes.
3. Group files into the smallest coherent commits; commit each with a precise message.
4. Run `pnpm test` (and schema build / web typecheck if schema or web changed) before the final push when feasible.
5. Push the branch.
6. Reply with the commit list (`git log --oneline <base>..HEAD`) and the remote branch tip.

## Message style examples

```
feat(schema): add ScenarioMatrix and ProofMatrixResult contracts
feat(core): detect ResponsiveViewportDrift on viewport collapse
feat(corpus): add marketplace-clutter live-site capture
test(core): golden-assert scenario matrix self-compare
ci: smoke proof matrix on UI pull requests
docs: mark Phase 5 scenario matrix as shipped
chore: ignore proof matrix CI artifact
```

## Extra context

Any text the user types after `/semantic-commits` is additional scope (e.g. paths, base branch, or “also open a PR”). Follow it.
