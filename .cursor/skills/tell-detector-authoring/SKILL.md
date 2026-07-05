---
name: tell-detector-authoring
description: Implements or modifies Tell genericness and drift detectors in packages/core. Use when adding detectors, tuning thresholds, writing golden tests, or working on SystemFontTell, GradientCrutchTell, ShadowEverywhereTell, RadiusMonotoneTell, AcidAccentTell, EmojiChromeTell, CenteredEverythingTell, GrayMushTell, TokenBypass, NearDuplicateValues, FocusRingInconsistency, TypeScaleDrift, SpacingChaos, or StateGap.
---

# Tell detector authoring

## Scope

- `packages/schema` — add or extend `TellDetector` / `DriftDetector` enums and `Finding` fields first
- `packages/core/src/detectors/index.ts` — all 14 detectors live here unless a real split is needed
- `packages/core/src/__tests__/detectors.test.ts` — golden assertions against committed capture JSON

## Rules

1. No LLM, API, or model calls in core
2. Detectors are pure: `(fingerprint: DesignFingerprint, capture: CapturePayload) => Finding[]`
3. Emit deterministic `facts` and `evidence`; taste layer assigns final verdicts
4. Use `Finding.parse(...)` at emit time
5. Set `verdictHint` mechanically; taste may override to `intentional`

## Workflow

1. Read threshold spec in `BUILD.md` §5.3–5.4
2. If schema changes are needed, edit `@tell/schema` first and rebuild
3. Add detector logic in `detectFindings`
4. Update golden test expectations in `detectors.test.ts`
5. If fixture UI must change to plant the finding, coordinate with `tell-demo-fixture` skill
6. Run `pnpm test`

## Finding shape

```ts
Finding.parse({
  id: "tell-example",
  family: "tell", // or "drift"
  detector: "SystemFontTell",
  verdictHint: "generic",
  severity: "high",
  facts: { /* measured numbers only */ },
  evidence: [{ kind: "computed", label: "...", value: "..." }],
});
```

## DoD

- Detector is deterministic and reproducible on `fixtures/reports/capture.json`
- Golden test passes
- No invented facts that taste cannot validate

## Related

- Rules: `.cursor/rules/tell-core-engine.mdc`
- Agent: `.cursor/agents/core-engineer.md`
- Methodology: `docs/05_GENERICNESS_METHODOLOGY.md`
