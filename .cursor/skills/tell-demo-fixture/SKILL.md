---
name: tell-demo-fixture
description: Maintains Tell demo fixtures, planted genericness tells, and offline report artifacts. Use when working on fixtures/generic-app, fixtures/reports, capture.json, tell-report.json, CONTRIBUTIONS.md, demo hardening, or hackathon demo fallback paths.
---

# Tell demo fixtures

## Scope

- `fixtures/generic-app/` — deliberately bland demo input (not product code)
- `fixtures/reports/capture.json` — committed capture artifact
- `fixtures/reports/tell-report.json` — offline demo fallback
- `CONTRIBUTIONS.md` — attribution separating our work from demo input

## Planted tells (must trigger)

**Genericness:** Inter/system font, violet-pink hero gradient, identical card shadows, monotone 8px radius, acid accent on dark bg, emoji in chrome, centered sections, gray mush

**Drift:** near-duplicate grays, missing focus rings, type scale drift, spacing off 4px grid, state gaps

**Intentional:** brutalist/mono route or flagged section for `intentional` taste verdict

## Regeneration workflow

1. Change fixture UI in `fixtures/generic-app`
2. Run `pnpm dev:fixture` and `pnpm capture:fixture`
3. Run `pnpm diagnose:fixture` if full report must update
4. Update detector golden tests if expectations shift
5. Commit `capture.json` and `tell-report.json` together

## Demo reliability

- Live capture first; offline artifact always works
- If capture/API fails, web returns committed `tell-report.json` with clear non-live state
- Record backup demo video for judge presentation

## Hackathon compliance

- Generic app is labeled demo input in `CONTRIBUTIONS.md`
- Lead demo with capture → diagnose → art-direct → reconcile loop, not KPI cards
- Public repo; only in-event work presented as original contribution

## DoD

- ≥8 planted findings on fixture (4 tells + 4 drifts minimum)
- Offline report loads when live path fails
- Fixture remains intentionally bland

## Related

- Rules: `.cursor/rules/tell-fixtures.mdc`
- Agent: `.cursor/agents/fixture-smith.md`
- BUILD.md §7
