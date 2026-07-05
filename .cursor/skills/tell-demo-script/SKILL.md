---
name: tell-demo-script
description: Prepares Tell build sprint demo script, reviewer narrative, and rules compliance. Use when rehearsing the demo, writing landing copy, updating CONTRIBUTIONS.md, or ensuring the capture-diagnose-art-direct-reconcile loop lands in under 3 minutes.
---

# Tell demo script

## 5 beats (~3 minutes)

1. **Setup (20s)** — Paste GitHub repo or live URL. "Shipped in a day with AI. Looks familiar."
2. **Capture + diagnose (30s)** — Report loads with named tells and score line.
3. **Taste (50s)** — Click `SystemFontTell`; then an intentional brutalist finding.
4. **Before/after (40s)** — Drag reveal seam; call out contrast floor.
5. **Voice + reconcile (40s)** — "Warmer, more editorial." Draft fix → Apply in Cursor.

## Demo-facing success

- Loop is visual, not architectural
- Before/after seam is the aha moment
- Voice changes direction with text preset fallback
- Dogfood close: zero tells on Tell itself

## Compliance

- Repo public; original work clearly attributed in `CONTRIBUTIONS.md`
- Fixture labeled demo input, not team contribution
- Not a banned project type (no dashboard-as-product, no basic RAG)
- Demo highlights in-event work only

## Backup plan

If live capture or API fails:

1. Load committed `fixtures/reports/tell-report.json`
2. Run seeded fixture on `:3001` if needed
3. Play recorded backup video

## Copy authority

- Persona/journey: `USER_STORY.md`
- Critic voice: `docs/01_DESIGN_SYSTEM.md` §10
- Delegate string polish to `ux-copywriter` subagent
