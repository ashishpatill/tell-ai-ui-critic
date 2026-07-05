---
name: tell-redesign-diff
description: Implements Tell deterministic redesign reconciliation and patch generation in packages/redesign. Use when working on reconcile.ts, buildOverridesPatch, contrast floor, before/after seam CSS, tell-overrides.css, OfflineRedesignGenerator, or cursor-redesign fallback.
---

# Tell redesign and reconciliation

## Scope

- `packages/redesign/src/reconcile.ts` — token reconciliation for live seam
- `packages/redesign/src/measures.ts` — contrast and readable pairing checks
- `packages/redesign/src/index.ts` — `OfflineRedesignGenerator`
- `apps/web/src/lib/cursor-redesign.ts` — Cursor SDK enhancement with deterministic fallback

## Rules

1. `packages/redesign` is deterministic: no LLM, network, browser, or Cursor SDK
2. Reconciliation must preserve or improve measured foreground/background contrast
3. Only force text colors inside surfaces Tell also controls
4. Live seam CSS and emitted patch must match (`OfflineRedesignGenerator` = seam preview)
5. Never auto-apply patches; return reviewable unified diffs only

## Direction presets

`editorial`, `precision`, `warm-minimal`, `bold-contrast`

## Output paths

1. Repo path known → token changes in tailwind config + CSS variables
2. URL-only flow → standalone `tell-overrides.css` via `buildOverridesPatch`
3. Per-finding fix → minimal diff targeting one tell

## Web enhancement

When `CURSOR_API_KEY` exists, `/api/redesign` may call Cursor SDK, then fall back to deterministic output on timeout, auth failure, or invalid JSON.

## DoD

- Reconciliation table and seam show the same token deltas
- Contrast ratios called out for text and controls
- Patch is copyable and human-reviewable

## Related

- Rules: `.cursor/rules/tell-redesign.mdc`
- Design system §2.4 contrast notes: `docs/01_DESIGN_SYSTEM.md`
