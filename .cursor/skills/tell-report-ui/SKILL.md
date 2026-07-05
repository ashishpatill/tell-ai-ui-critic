---
name: tell-report-ui
description: Builds Tell web UI — Tell Report, before/after seam, findings inspector, voice director, GitHub setup, and multi-page scanning in apps/web. Use when working on page.tsx, BeforeAfterSeam, API routes, repo-runner, discover-routes, or docs/01_DESIGN_SYSTEM.md components.
---

# Tell report UI

## Scope

- `apps/web/src/app/page.tsx` — primary Tell Report surface
- `apps/web/src/components/BeforeAfterSeam.tsx` — signature reveal seam
- `apps/web/src/app/api/` — diagnose, redesign, voice, setup routes
- `apps/web/src/lib/repo-runner.ts` — GitHub clone/install/run (local only)
- `apps/web/src/lib/discover-routes.ts` — multi-page route discovery

## Product shape

Not a dashboard. Single-column editorial report:

1. Score line (`8 findings · 5 generic · 2 drift · 1 intentional`)
2. Before/after seam on captured page
3. Findings list grouped by verdict
4. Voice director + reconciliation table + draft fix

## Design contract

Follow `docs/01_DESIGN_SYSTEM.md`:

- Fonts: Instrument Serif + Source Sans 3 + IBM Plex Mono — never Inter-only
- Semantic tokens only in TSX (`bg-surface`, `text-secondary`, `text-accent`)
- Raw hex only in `globals.css` token definitions
- Full state matrix: hover, focus-visible, active, disabled, loading/error
- Seam supports drag, keyboard ←/→, reduced-motion jump
- Copy from `USER_STORY.md` copy bank — critic voice, no emoji chrome

## API behavior

- `/api/diagnose` → full pipeline or offline artifact with `meta.live: false`
- `/api/setup/*` → local dev only; never expose arbitrary repo execution publicly
- `/api/voice` → deterministic parse first, Gemini refine when keyed
- Hide stale captures while setup/capture is running

## DoD

- Priya journey works: capture → finding → seam → voice → draft fix
- Keyboard and a11y floor from design system §9
- Tell UI does not trigger its own generic tells

## Related

- Rules: `.cursor/rules/tell-ui-design.mdc`
- Agent: `.cursor/agents/ui-builder.md`
- Copy agent: `.cursor/agents/ux-copywriter.md`
