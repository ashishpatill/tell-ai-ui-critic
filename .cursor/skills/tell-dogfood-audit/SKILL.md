---
name: tell-dogfood-audit
description: Runs Tell dogfood audit on apps/web to ensure zero generic tells and full design-system compliance. Use before demo, for M10 milestone, when fixing Tell's own UI, or when verifying Instrument Serif, tokens, state matrix, and contrast floor.
---

# Tell dogfood audit

## Goal

Tell must pass its own audit: **0 generic tells, 0 unintentional drift** on `apps/web`.

## Checklist (from docs/01_DESIGN_SYSTEM.md §12)

| Check | Pass criteria |
|---|---|
| Type system | Display + sans + mono present; no Inter-only |
| Color | No violet gradient hero; no acid accent on near-black |
| Shadow | e2 max on cards; not shadow on every element |
| Radius | ≥2 distinct radii in main view |
| Centering | Asymmetric report layout |
| Grays | ≤4 distinct gray values in token ramp |
| States | Full matrix on Button, CaptureBar, VoiceDirector, seam handle |
| Tokens | No raw hex in committed TSX classNames |

## Workflow

1. Run Tell diagnose on local web app (`http://localhost:3000`) or inspect committed self-report
2. Fix real findings in `apps/web` using semantic tokens from `globals.css` / `tailwind.config.ts`
3. Re-run until generic tells are zero
4. Verify a11y: focus-visible, reduced motion, non-color verdict encoding

## Hook support

`.cursor/hooks/after-edit-check.mjs` flags Inter-only stacks and raw hex in web edits when hooks are wired.

## DoD

- Demo line holds: "Tell runs on itself: zero tells."
- UI matches editorial print-atelier aesthetic
- No TokenBypass violations in Tell's own source

## Related

- Rules: `.cursor/rules/tell-ui-design.mdc`, `.cursor/rules/tell-mission.mdc`
- Agent: `.cursor/agents/dogfood-auditor.md`
