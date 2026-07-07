---
name: tell-proof-verify
description: Runs Tell Proof verification after UI changes — apply patch, recapture URL, return pass/review/fail. Use when verifying agent UI edits, before merge, or when tell_proof_verify MCP is available.
---

# Tell Proof verify workflow

## When to use

- After drafting a redesign patch with `tell_redesign` / `tell_apply`
- Before merging a frontend PR that changes rendered UI
- When Priya asks whether a visual fix actually improved the surface

## MCP path (Cursor Agent)

```
1. tell_diagnose on the running preview URL
2. tell_redesign with direction (e.g. "editorial")
3. tell_apply with projectRoot set to the workspace
4. tell_proof_verify { url, patch, projectRoot }
5. If status is "failed" and reverted is true → revise patch and retry
6. If status is "passed" or "review" → human approves merge
```

## Verdict meanings

| Status | Meaning |
|--------|---------|
| `passed` | Score improved ≥3, screenshot changed, no focus/structure regression |
| `review` | Neutral or small change — human should judge |
| `failed` | Regression or patch did not apply — auto-reverted when configured |

## Web path

1. Set up repo locally (`/api/setup/start`)
2. Draft fix in Tell Report UI
3. Click **Prove patch** — uses `/api/proof/apply`
4. Compare before/after screenshots and score delta

## Rules

- Never auto-merge on `passed` alone — human reviews the diff
- Always capture the **same URL** as the baseline report
- Prefer disposable checkout proof over editing the main branch directly

## Related

- Skill: `tell-mcp-tools`
- Skill: `tell-dogfood-audit`
- `packages/core/src/proof-verify.ts`
