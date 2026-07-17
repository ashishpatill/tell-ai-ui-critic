# Redesign Engine v2 — "Art Direction, not token nudging"

> Spec for the rebuild of `packages/redesign`. The v1 engine only snapped font sizes,
> rounded padding, swapped one accent hue, and stripped shadows. Every direction produced
> the same page with a beige background. v2 must make each direction read as a **different
> designer's work** — while never breaking the captured page's content or layout integrity.

## The bar

A viewer looking at before/after should say "that's a redesign," not "did the colors change?"
Concretely, switching between the six directions must visibly change, at minimum:

1. Page background & section rhythm (texture, alternation, vertical breathing room)
2. Hero presence (display type at real scale, eyebrow, decorative language)
3. Component language (buttons, cards, inputs, nav each have a per-direction recipe)
4. Typographic voice (family + weight + spacing + case + underline language)
5. Decorative details (rules, numbers, marks, selection color — the "designer was here" layer)

## Hard constraints (unchanged from v1)

- CSS-only transformation of the captured snapshot. No DOM restructuring in the deterministic
  path. Pseudo-elements (`::before`/`::after`), CSS counters, and multi-layer backgrounds are
  the tools for adding visual matter.
- Selectors: `[data-tell-id="…"]` for element-precise ops, plus role/tag-level rules.
- Never hide or reflow content destructively: no `display:none`, no `position:absolute` on
  content elements, no font-size below 12px, text contrast ≥ 4.5:1 on owned surfaces.
- Deterministic path must work with zero API keys. LLM path is an enhancement with fallback.

## Architecture

```
packages/redesign/src/
  scales.ts        # keep: math + tameAccent (unchanged API)
  directions.ts    # NEW: full DirectionSpec (v1 Direction + recipe tokens) — extracted from scales.ts
  recipes.ts       # NEW: per-role component recipe builders (hero, nav, button, card, input, badge, section, footer, link)
  layout.ts        # NEW: safe structural pass — container max-width, section rhythm, grid gaps, hero scale (uses captured rects)
  restyle.ts       # REWRITE: orchestrates recipes + layout + v1 token passes into a RestylePlan
  reconcile.ts     # keep API; richer rationale/rows from the new plan
  llm-restyle.ts   # NEW: Gemini full-sheet path + validators + fallback (Builder B)
  validate.ts      # NEW: shared CSS validators (parse, banned props, contrast floor) used by both paths
```

`Reconciliation` schema gains **optional** fields only (backward compatible):
`cssSource: "recipes" | "llm"`, `directionNotes: string[]` (what the direction did, for the UI),
`heroTreatment?: string`.

## Direction identities

Every direction defines the full set below. No field may be shared verbatim across directions.

| Facet | editorial | precision | bold-contrast | warm-minimal | luxury | brutalist |
|---|---|---|---|---|---|---|
| Paper | warm cream `#F4EEE3` + subtle fiber-noise | cool `#F2F1EE` + 1px blueprint grid lines | bone `#F1EAE0` + big tinted hero block | `#F6F1E9` calm, generous white space | ivory `#F5F1EB` + thin double rules | `#F0EFEA` raw, visible 8px baseline grid |
| Hero display | Fraunces 600, 64-80px, -0.02em, italic accent word via `::first-line`-safe styling | Schibsted 700, 56px, tabular, mono eyebrow `[ 01 ]` | Bricolage 800, 80-96px, uppercase eyebrow, accent underline block | Lora 600, 56px, soft, centered, breathing room | Playfair 700, 64px, centered, letterspaced small-caps eyebrow + hairline rules above/below | Archivo 800, 72px, uppercase, left-flush, black keyline box |
| Eyebrow (`::before` on hero heading) | small-caps terracotta overline | mono `[ SECTION ]` in steel blue | uppercase chip with accent bg | none — whitespace is the eyebrow | letterspaced small caps between em-dashes | mono index `001 /` |
| Buttons | pill-ish 10px, terracotta fill, cream ink, hover darkens, 1px darker border | 4px radius, steel fill, mono-ish tracking, square focus ring | 2px radius, oversized padding, accent fill, hard 4px offset shadow | 8px, soft fill, tonal hover | 3px, deep bordeaux fill, gold-tinted 1px border, letterspaced label | 0px, transparent bg, 2px ink border, hover inverts to ink/paper |
| Cards | 10px radius, cream-raised, single soft shadow, terracotta top hairline | 4px, flat, 1px cool border, corner tick marks via pseudo | 2px, hard offset shadow (6px 6px 0 ink) | 8px, tonal surface shift, no border/shadow | 3px, hairline border + inner padding luxury, small-caps card titles | 0px, 2px ink border, mono metadata row |
| Links | terracotta, 2px offset underline, thickness 1.5px | steel, no underline, hover underline 1px | ink on accent highlight (padded box-decoration) | warm brown, soft underline | bordeaux, hover gold underline | ink, 2px underline always, hover bg-ink/ink-paper invert |
| Section rhythm | 96px vertical, alternating cream/paper-white | 64px, hairline top borders per section | 112px, alternating paper/tinted-accent-wash | 96px, uninterrupted single surface | 96px, centered double hairlines between sections | 64px, 2px rules between all sections |
| Selection / details | terracotta selection, serif blockquote bar | steel selection, mono figure captions | accent selection, marquee-weight numerals | soft amber selection | bordeaux selection, gold `::marker`s | ink selection, visible focus boxes |

(Values above are direction, not law — builders refine per contrast math. Signature accents,
fonts, ratios stay as defined in v1 `DIRECTIONS`.)

## Layout pass (safe structural)

Using captured bounding rects:
- Identify the content column (modal widths of section children) → normalize `max-width`
  (editorial 1100px asymmetric, precision 1200px, warm-minimal 720px reading column, etc.)
- Hero = first large text block in top 900px → scale display size by measured available width;
  apply direction hero treatment.
- Grid children with near-equal rects → normalize gap onto the spacing scale.
- Section detection (direct children of main/body over N px tall) → apply vertical rhythm +
  surface alternation via `:nth-of-type` on stamped ids.

Everything in this pass must be width-aware: never set a font-size that would overflow the
measured container (check `rect.width / (0.55 × fontSize) ≥ ~8` chars for headlines).

## LLM path (Builder B)

Input: compact page brief (roles, rects, text excerpts, current tokens — NOT raw HTML),
fingerprint, direction spec, and the deterministic plan's CSS as a floor.
Output contract: a single CSS sheet, same selector rules as deterministic path.
Validation gate (validate.ts): parseable, only whitelisted properties, no `display:none`,
no `position` changes on content roles, contrast floor per owned surface, sheet < 80KB.
On any gate failure → deterministic sheet ships. `cssSource` records which path won.

## Build contracts (fixed — builders code against these)

### Schema additions (packages/schema, owned by Builder A, optional fields only)
```ts
// Reconciliation gains:
cssSource: z.enum(["recipes", "llm"]).default("recipes"),
directionNotes: z.array(z.string()).default([]),   // human-readable "what this direction did" bullets for the UI
```

### /api/restyle route (owned by Builder B)
```
POST /api/restyle
body:    { capture: CapturePayload, fingerprint: DesignFingerprint, directionId: string, dna?: BrandDNA }
returns: { ok: true, css: string, fontImport: string, cssSource: "llm", notes: string[] }
       | { ok: false, reason: string }        // client keeps the deterministic sheet
```
Client behavior (Builder C): render deterministic reconciliation instantly; fire /api/restyle in the
background; if ok, swap the after-pane CSS and show an "LLM-refined" badge. Never block on it.

### File ownership (no cross-edits)
- **A (core):** packages/redesign/src/{directions,recipes,layout,restyle,reconcile,measures,scales,index,validate}.ts + packages/schema/src/index.ts + redesign tests
- **B (LLM):** packages/redesign/src/llm-restyle.ts + apps/web/src/app/api/restyle/route.ts (imports validate.ts from A — a stub export is fine until A lands)
- **C (web):** apps/web/src/components/BeforeAfterSeam.tsx, apps/web/src/app/page.tsx, apps/web/src/lib/cursor-redesign.ts (truncation fix only)

### Invariants (from recon)
- `buildRestylePlan` stays exported with fields source-patch.ts/tests rely on:
  accentBefore/accentAfter/surface/ink/body/display/radius/direction/remapVars.
- source-patch.test.ts and source-append.test.ts must keep passing (git-apply-valid diffs).
- Emitted CSS: `!important` on every declaration (original page CSS is inlined in the snapshot);
  selectors = `[data-tell-id]` + tag-level; single Google Fonts `@import` for all families;
  no `:nth-*` alternation (compute alternation per-element at plan time from rect.y ordering).
- Sheet budget ≤ 80KB; no `display:none`; no `position` changes on content roles.

## Scoring honesty

`afterAxes` currently asserts near-perfect scores by construction. v2 must **measure** the
emitted plan (count distinct sizes/spaces/elevations in the final CSS, computed contrast of
final pairings) so before/after numbers stay defensible in a demo.
