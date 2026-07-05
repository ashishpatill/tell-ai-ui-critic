---
name: tell-schema-contracts
description: Authors and updates Tell zod contracts in packages/schema. Use when adding Finding fields, TellReport shape, detector enums, API/MCP payloads, or freezing schema before parallel agent work.
---

# Tell schema contracts

## Scope

- `packages/schema/src/index.ts` — all shared contracts

## Workflow

1. Identify which packages consume the shape (core, taste, redesign, mcp, web)
2. Add or extend zod schema with `.default()` only when backward-compatible
3. Export inferred type: `export type Finding = z.infer<typeof Finding>`
4. Run `pnpm -F @tell/schema build`
5. Update consumers to parse at boundaries
6. Only then split parallel Tasks across subagents

## Key contracts

| Schema | Used by |
|---|---|
| `CapturePayload` | core capture, web diagnose, MCP |
| `DesignFingerprint` | core fingerprint, taste context |
| `Finding` | detectors, taste, report UI |
| `TasteVerdict` | taste engine, report UI |
| `ArtDirection` | taste, redesign, voice API |
| `RedesignProposal` | redesign, MCP, web API |
| `TellReport` | web UI, MCP, fixtures |

## Rules

- Never pass loose objects across package boundaries
- Model JSON must re-validate with zod before use
- Enum changes (`TellDetector`, `DriftDetector`, `Verdict`) require detector + test updates

## DoD

- Schema builds cleanly
- All downstream packages typecheck
- No duplicate type definitions outside `@tell/schema`
