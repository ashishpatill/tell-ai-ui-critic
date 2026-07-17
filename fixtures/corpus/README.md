# Tell Proof — Open Detector Corpus

Benchmark assets for the open genericness taxonomy.

| Asset | Purpose |
|---|---|
| [`taxonomy.json`](./taxonomy.json) | Machine-readable mapping of methodology tells → detectors |
| [`manifest.json`](./manifest.json) | Categories, expected detectors, capture paths |
| [`captures/`](./captures/) | Slim committed `CapturePayload` fixtures (no live browser required) |

## Categories

| ID | Profile | Expected |
|---|---|---|
| `ai-saas-generic` | Primary demo bland landing | All 14 core detectors |
| `editorial-calm` | Serif editorial, restrained spacing | **0** detectors |
| `fintech-dense` | Inter dashboard, off-grid spacing, weak focus | System font + drift cluster |
| `intentional-brutalist` | Fixture `/brutalist` route | Taste marks intentional |
| `tell-dogfood` | Tell product UI | 0 generic / 0 drift |

## Run

```bash
pnpm test   # includes corpus-manifest + taxonomy golden tests
```

Methodology prose: [`docs/05_GENERICNESS_METHODOLOGY.md`](../../docs/05_GENERICNESS_METHODOLOGY.md).  
Consolidated plan: [`PLAN.md`](../../PLAN.md).
