# Tell Proof — Open Detector Corpus

Benchmark assets for the open genericness taxonomy.

| Asset | Purpose |
|---|---|
| [`taxonomy.json`](./taxonomy.json) | Machine-readable mapping of methodology tells → detectors |
| [`manifest.json`](./manifest.json) | Categories, expected detectors, capture paths, scenario matrix path |
| [`captures/`](./captures/) | Slim committed `CapturePayload` fixtures (no live browser required) |
| [`scenario-matrix.json`](./scenario-matrix.json) | route × viewport × theme × interaction cells for `pnpm proof:matrix` |

## Categories

| ID | Profile | Expected |
|---|---|---|
| `ai-saas-generic` | Primary demo bland landing | All 14 core detectors |
| `editorial-calm` | Serif editorial, restrained spacing | **0** detectors |
| `fintech-dense` | Inter dashboard, off-grid spacing, weak focus | System font + drift cluster |
| `marketplace-clutter` | Busy consumer marketplace (live-site) | Gradient/emoji/shadow + `ResponsiveViewportDrift` |
| `docs-site-calm` | IBM Plex docs (live-site negative) | **0** detectors |
| `intentional-brutalist` | Fixture `/brutalist` route | Taste marks intentional |
| `tell-dogfood` | Tell product UI | 0 generic / 0 drift |

## Scenario matrix

Committed matrix covers marketplace routes (`/`, `/pricing`) across desktop/tablet/mobile, light/dark, and default/hover/focus interaction cells. Compare with:

```bash
pnpm proof:matrix
```

## Regenerate captures

```bash
pnpm corpus:generate   # or: python3 scripts/generate-corpus-captures.py
pnpm test              # corpus-manifest + taxonomy + matrix golden tests
```

Do **not** overwrite hand-tuned `editorial-calm` / `fintech-dense` expectations without re-checking detector golden sets.

Methodology prose: [`docs/05_GENERICNESS_METHODOLOGY.md`](../../docs/05_GENERICNESS_METHODOLOGY.md).  
Proof overview: [`docs/06_TELL_PROOF.md`](../../docs/06_TELL_PROOF.md).  
Consolidated plan: [`PLAN.md`](../../PLAN.md).
