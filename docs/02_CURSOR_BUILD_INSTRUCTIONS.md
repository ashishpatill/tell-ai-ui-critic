# Tell — Cursor Build Instructions

> Drop the relevant parts of this file into `.cursor/rules/` (as `.mdc`) and keep the whole
> file as `BUILD.md` at the repo root. It is the single source of truth for *how* Cursor should
> build Tell. Read `01_DESIGN_SYSTEM.md` for the visual contract and `04_CLAUDE_PROJECT.md`
> for vision, scope, and tracking.

Target: win the **Cursor track** of the hackathon in a 2-day build. Solo/remote-eligible.

---

## 0. Mission (read before any file)

Tell is an AI **taste critic** for rendered UI. It captures a product's *real* visual surface
(Playwright/CDP), builds a deterministic design fingerprint, detects **genericness tells** (what
makes it read as AI-built) and **consistency drift** (where the surface fractures), reasons **with
taste** about whether each finding is generic, drift, or intentional, accepts **voice art-direction**
for a distinctive redesign, and drafts the reconciliation as a diff — all callable from inside Cursor
via MCP.

The differentiator is taste: not "these hexes differ" but "Inter on every role is a tell — and
here's the editorial direction that fixes it." The static token-diffing space is saturated. The
codebase-viz space is crowded. We own the **rendered-surface taste critic** nobody ships.

---

## 1. Golden rules for Cursor

1. **Deterministic core, LLM only for taste.** Capture normalization, fingerprinting, and detection
   are pure, testable functions with zero LLM calls. The LLM (Gemini) only classifies findings,
   parses voice direction, and explains. Redesign diffs may use Anthropic behind an interface.
2. **Capture the rendered truth.** Input is what users *see* (computed styles + screenshot), not
   just source files. Source parsing (`ts-morph`) is only for generating apply-in-Cursor diffs.
3. **Everything is a token.** No raw hex/px in `apps/web` component classNames. Go through the
   design-system tokens. Tell's own `TokenBypass` detector enforces this on scanned repos; obey it
   in Tell's repo.
4. **Never auto-apply fixes.** `tell_apply` returns a diff. A human applies it in Cursor.
5. **Schemas are contracts.** All cross-package data uses the zod schemas in `packages/schema`.
   Parse at every boundary; never pass loose objects.
6. **Ship the spine before the polish.** Order in §8 is not negotiable under time pressure.
7. **Fixtures are the demo.** The seeded generic app is a first-class deliverable; its tells are
   hand-chosen to land in the demo (§7).
8. **Commit legibly.** Conventional commits, timestamps inside the event window, and a
   `CONTRIBUTIONS.md` distinguishing our work from the seeded fixture (disqualification risk).

Do **not**: add a database, add auth, build a settings page, generalize beyond URL capture +
React+Tailwind diff output, or let fingerprint/detection jitter nondeterministically between runs.

---

## 2. Stack

- **Language:** TypeScript everywhere.
- **Runtime/build:** Node 20, `pnpm` workspaces, `tsx` for scripts, `tsup` for package builds.
- **Capture:** Playwright (Chromium) + CDP `Runtime.evaluate` for computed styles; full-page screenshot.
- **Web:** Next.js 14 (App Router) · React 18 · Tailwind CSS · raw SVG/React for seam + proof marks.
- **Taste engine:** Gemini API (`gemini-2.x`) via `@google/generative-ai`, structured JSON output.
- **Voice:** Web Speech API (browser) for demo; text presets as fallback. Direction parsing via Gemini.
- **Redesign/fix generation:** Claude Code / Anthropic API for unified-diff patches (thematic for the
  Cursor track; keep behind an interface so it's swappable).
- **Source diff (optional):** `ts-morph` to map token/CSS changes back to component files when repo
  path is provided.
- **MCP:** `@modelcontextprotocol/sdk`, stdio transport.
- **Validation:** `zod`. **Test:** `vitest`. **Lint:** `eslint` + `prettier`.

---

## 3. Monorepo layout

```
tell/
  package.json                 # pnpm workspace root
  pnpm-workspace.yaml
  BUILD.md                     # this file
  CONTRIBUTIONS.md             # what we built vs. the seeded generic fixture
  .cursor/
    rules/                     # .mdc rule files distilled from §1, §5–§7
    mcp.json                   # registers the Tell MCP server for Cursor
  packages/
    schema/                    # zod schemas + inferred TS types (the contracts)
    core/                      # capture + fingerprint + detectors (pure, no LLM, no network*)
    taste/                     # Gemini reasoning + voice direction parsing + reflection loop
    redesign/                  # diff generation (Anthropic behind an interface)
    mcp/                       # MCP server exposing capture/diagnose/redesign/apply
  apps/
    web/                       # Next.js UI: Tell Report, seam, inspector, voice director
  fixtures/
    generic-app/               # deliberately bland demo app (the "before")
    reports/                   # committed scan artifacts (JSON) for offline demo
```

*Note: `core` uses Playwright locally but exposes pure functions given a normalized capture payload;
unit tests run against committed capture JSON without launching a browser.

`core`, `taste`, `redesign` are independently unit-testable. `web` reads a report artifact (JSON) or
calls a thin local API route that invokes `core`/`taste`. The MCP server wraps the same functions so
Cursor and the web app share one engine.

---

## 4. Data contracts (`packages/schema`)

Author these first; every other package imports from here.

```ts
import { z } from "zod";

// ── Capture / fingerprint ──────────────────────────────────────────

export const ComputedStyleSample = z.object({
  selector: z.string(),           // simplified role: "body" | "h1" | "button.primary" | …
  fontFamily: z.string(),
  fontSize: z.string(),
  fontWeight: z.string(),
  color: z.string(),              // computed rgb/rgba
  backgroundColor: z.string(),
  borderRadius: z.string(),
  boxShadow: z.string(),
  padding: z.string(),
  textAlign: z.string(),
  lineHeight: z.string(),
});

export const InteractiveProbe = z.object({
  role: z.string(),               // e.g. "button", "a", "input"
  selector: z.string(),
  hasHoverDiff: z.boolean(),      // computed style changed on :hover simulation
  hasFocusVisibleDiff: z.boolean(),
  hasDisabledAttr: z.boolean(),
  ariaDisabled: z.boolean(),
});

export const CapturePayload = z.object({
  url: z.string(),
  capturedAt: z.string(),
  viewport: z.object({ width: z.number(), height: z.number() }),
  screenshotBase64: z.string(),   // full-page PNG
  styles: z.array(ComputedStyleSample),
  probes: z.array(InteractiveProbe),
  domSummary: z.object({
    headingCount: z.number(),
    buttonCount: z.number(),
    centeredBlockRatio: z.number(), // 0–1, blocks with text-align:center
    emojiInUiCount: z.number(),
  }),
});

export const DesignFingerprint = z.object({
  url: z.string(),
  generatedAt: z.string(),
  fontFamilies: z.array(z.object({ family: z.string(), count: z.number(), roles: z.array(z.string()) })),
  colors: z.array(z.object({ value: z.string(), count: z.number(), normalizedHex: z.string() })),
  shadows: z.array(z.object({ value: z.string(), count: z.number() })),
  radii: z.array(z.object({ value: z.string(), count: z.number() })),
  spacingValues: z.array(z.object({ value: z.string(), count: z.number() })),
  typeScale: z.array(z.object({ size: z.string(), count: z.number(), roles: z.array(z.string()) })),
  centeredBlockRatio: z.number(),
  emojiInUiCount: z.number(),
  gradientDetected: z.boolean(),
  gradientSamples: z.array(z.string()).default([]),
  nearDuplicateGrays: z.array(z.object({ values: z.array(z.string()), deltaE: z.number() })).default([]),
  focusRingCoverage: z.number(),  // 0–1, focusable elements with visible focus style
  stateCoverage: z.object({
    hover: z.number(),
    focus: z.number(),
    disabled: z.number(),
  }),
});

// ── Findings ───────────────────────────────────────────────────────

export const Verdict = z.enum(["generic", "drift", "intentional", "uncertain"]);

export const TellDetector = z.enum([
  "SystemFontTell",
  "GradientCrutchTell",
  "ShadowEverywhereTell",
  "RadiusMonotoneTell",
  "AcidAccentTell",
  "EmojiChromeTell",
  "CenteredEverythingTell",
  "GrayMushTell",
]);

export const DriftDetector = z.enum([
  "TokenBypass",
  "NearDuplicateValues",
  "FocusRingInconsistency",
  "TypeScaleDrift",
  "SpacingChaos",
  "StateGap",
]);

export const Evidence = z.object({
  kind: z.enum(["computed", "screenshot-region", "dom", "probe"]),
  label: z.string(),
  value: z.string(),
  selector: z.string().optional(),
  region: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).optional(),
});

export const Finding = z.object({
  id: z.string(),
  family: z.enum(["tell", "drift"]),
  detector: z.union([TellDetector, DriftDetector]),
  verdictHint: Verdict,           // mechanical guess; taste may override
  facts: z.record(z.any()),       // deterministic grounding for taste engine
  evidence: z.array(Evidence),
  severity: z.enum(["high", "medium", "low"]).default("medium"),
});

export const TasteVerdict = z.object({
  findingId: z.string(),
  verdict: Verdict,
  confidence: z.number().min(0).max(1),
  rationale: z.string(),          // ≤ 3 sentences, critic voice
  intentionalReason: z.string().optional(),
});

export const ArtDirection = z.object({
  id: z.string(),
  label: z.string(),              // e.g. "editorial-warm"
  keywords: z.array(z.string()),  // parsed from voice or preset
  tokenOverrides: z.record(z.string()), // CSS variable proposals
  summary: z.string(),
});

export const RedesignProposal = z.object({
  findingId: z.string().optional(), // null = full redesign
  direction: ArtDirection,
  files: z.array(z.object({
    file: z.string(),
    unifiedDiff: z.string(),
    summary: z.string(),
  })),
});

export const TellReport = z.object({
  capture: CapturePayload,
  fingerprint: DesignFingerprint,
  findings: z.array(Finding),
  verdicts: z.array(TasteVerdict),
  score: z.object({
    total: z.number(),
    generic: z.number(),
    drift: z.number(),
    intentional: z.number(),
    uncertain: z.number(),
  }),
  activeDirection: ArtDirection.optional(),
});
```

---

## 5. `packages/core` — capture + fingerprint + detectors

### 5.1 Capture (`captureUrl`)

Use Playwright Chromium. Steps:

1. Navigate to URL (or `file://` for fixture); wait `networkidle` with 10s timeout.
2. Full-page screenshot → base64 PNG.
3. CDP evaluate: walk a curated set of selectors (`body`, `h1–h3`, `button`, `a`, `[class*="card"]`,
   `[class*="hero"]`, `input`, `nav`) and collect `getComputedStyle` for each matched element (cap
   ~200 nodes).
4. Interactive probes: for each `button`, `a[href]`, `input`, `select`, simulate `:hover` and
   `:focus-visible` via CDP pseudo-class forcing; diff computed outline/box-shadow/background.
5. DOM summary: count headings, buttons, centered blocks (`text-align:center` on block-level),
   emoji regex in `textContent` of buttons/headings/nav.
6. Emit `CapturePayload`. Serialize to JSON for offline tests.

Pure given a browser instance; in tests, load committed `fixtures/reports/capture.json`.

### 5.2 Fingerprint (`buildFingerprint`)

Deterministic aggregation of `CapturePayload` → `DesignFingerprint`:

- **fontFamilies:** group by first family in stack; count occurrences; record roles.
- **colors:** dedupe computed `color` + `backgroundColor`; normalize to hex; count.
- **shadows / radii / spacing:** dedupe `boxShadow`, `borderRadius`, `padding` values; count.
- **typeScale:** group `fontSize` + roles.
- **centeredBlockRatio / emojiInUiCount:** pass through from domSummary.
- **gradientDetected:** any `background-image` containing `linear-gradient` on hero-sized elements.
- **nearDuplicateGrays:** cluster neutral colors (saturation < 10%) with ΔE < 3.
- **focusRingCoverage:** probes with `hasFocusVisibleDiff` / total focusable.
- **stateCoverage:** hover/disabled ratios from probes.

No network. Snapshot-tested against committed capture JSON.

### 5.3 Tell detectors `(fingerprint, capture) => Finding[]`

Each emits `family: "tell"`, deterministic `facts`, and `evidence`.

- **SystemFontTell** — if ≥80% of text roles use Inter and/or system-ui as primary family with no
  second display family. `facts`: adoption ratio, roles affected.
- **GradientCrutchTell** — `gradientDetected` on hero/large section + ≤2 other distinct background
  treatments. `facts`: gradient CSS sample.
- **ShadowEverywhereTell** — ≥60% of card-class elements share identical non-none `boxShadow`.
  `facts`: shadow value, count ratio.
- **RadiusMonotoneTell** — ≥85% of sampled elements share one `borderRadius` value (excluding 0).
  `facts`: radius value, ratio.
- **AcidAccentTell** — one high-saturation accent hue (HSL S>70%) on dark bg (L<20%) used as sole
  accent across buttons/links. `facts`: accent hex, usage count.
- **EmojiChromeTell** — `emojiInUiCount ≥ 3` in UI chrome (headings, buttons, nav). `facts`: emoji
  list.
- **CenteredEverythingTell** — `centeredBlockRatio ≥ 0.7`. `facts`: ratio.
- **GrayMushTell** — `nearDuplicateGrays` cluster with ≥5 values and ΔE < 3. `facts`: gray list.

### 5.4 Drift detectors `(fingerprint, capture) => Finding[]`

Each emits `family: "drift"`.

- **TokenBypass** — colors/shadows/radii that are literal hex/px in computed styles rather than
  repeating token-like values (heuristic: non-8px-grid spacing, odd hexes). Requires optional source
  scan when repo path provided; for rendered-only, flag repeated one-off literals. `facts`: values.
- **NearDuplicateValues** — same as GrayMush but also spacing (within 2px) and font-size (within 1px)
  duplicates. `facts`: clusters.
- **FocusRingInconsistency** — `focusRingCoverage < 0.5` on focusable probes. `facts`: coverage %.
- **TypeScaleDrift** — ≥6 distinct font sizes with no clear modular scale (ratio not ~1.125/1.25/1.333
  within tolerance). `facts`: sizes.
- **SpacingChaos** — ≥10 distinct padding values with no 4px-grid alignment (>30% off-grid).
  `facts`: off-grid ratio.
- **StateGap** — focusable elements missing hover diff OR missing disabled handling when siblings have
  it. `facts`: probe ids, missing state.

Detectors output only `verdictHint`; the **taste engine decides the final verdict** and may
downgrade to `intentional` (e.g. deliberate mono-type brutalist site).

---

## 6. `packages/taste` — reasoning (Gemini) + voice direction

For each `Finding`, build a grounded request and get a `TasteVerdict`.

**Reflection loop (2 passes max):**
1. **Draft** — Gemini receives: finding, deterministic `facts`, fingerprint summary, screenshot
   (optional, base64 thumbnail). Returns candidate verdict + rationale + confidence as JSON.
2. **Validate** — deterministic checker confirms rationale claims against `facts` (e.g. if model says
   "only one font" but fingerprint shows two families with balanced usage, reject).
3. **Refine** — on rejection, re-prompt once with the contradiction. If still failing, fall back to
   mechanical `verdictHint` with confidence 0.5 and templated rationale.

**Voice / art-direction parsing:**
- Input: transcript string or preset id (`editorial`, `precision`, `warm-minimal`, `bold-contrast`).
- Output: `ArtDirection` with `keywords` + proposed `tokenOverrides` (CSS vars for fonts, colors,
  radius, shadow).
- Re-run is cheap: direction updates `activeDirection` on the report; before/after preview uses
  tokenOverrides as CSS filter/variable overlay on the screenshot (stretch: re-render fixture).

**Prompt contract (system):** "You are Tell's taste engine. You classify rendered-UI findings.
You are given deterministic facts you must not contradict. Decide: generic / drift / intentional /
uncertain. Intentional means the pattern is a defensible design choice (state the choice). Respond
ONLY with JSON matching the schema. Rationale ≤ 3 sentences, critic voice, no apology." Pass `facts`
as authoritative. Enforce `responseMimeType: "application/json"`; re-validate with zod.

Never let the model invent findings not in the detector output.

---

## 7. `fixtures/generic-app` — the demo target

A small Next.js app deliberately built to trigger every tell and drift detector. Plant exactly:

**Tells (8):**
1. Inter/system-ui on all text → SystemFontTell.
2. Violet→pink hero gradient, flat elsewhere → GradientCrutchTell.
3. Identical shadow-lg on every card → ShadowEverywhereTell.
4. 8px radius on everything → RadiusMonotoneTell.
5. Single `#8B5CF6` accent on `#0F0F0F` bg → AcidAccentTell.
6. Emoji in nav + buttons (🚀 ✨ 📊) → EmojiChromeTell.
7. All sections `text-align: center` → CenteredEverythingTell.
8. Six near-identical grays in cards → GrayMushTell.

**Drifts (4+):**
9. Literal `#F3F4F6`, `#F4F4F5`, `#F5F5F4` backgrounds → NearDuplicateValues.
10. Half the buttons lack visible focus ring → FocusRingInconsistency.
11. 9 random font sizes → TypeScaleDrift.
12. Padding values off 4px grid → SpacingChaos.

**One intentional:**
13. A `/brutalist` route with deliberate mono-only typography → taste engine should return
    `intentional` for SystemFontTell when scoped to that route (or a flagged section with
    `data-intentional="mono"` in facts).

Commit:
- `fixtures/reports/capture.json` — raw capture payload.
- `fixtures/reports/tell-report.json` — full `TellReport` for offline demo.

**Label clearly** in `CONTRIBUTIONS.md`: the generic-app is demo input, hand-built to be bland.

---

## 8. Build order (with Definition of Done)

Follow exactly. Each milestone has a DoD; do not advance until met.

**Day 1 — the spine**
- **M1 · schema** — all zod schemas compile; types exported. *DoD: `pnpm -F schema build` clean.*
- **M2 · capture + fingerprint** — Playwright capture of `fixtures/generic-app` produces valid
  `CapturePayload`; fingerprint aggregates correctly. *DoD: committed `capture.json`; snapshot test
  on fingerprint fields.*
- **M3 · detectors** — all 14 detectors implemented. *DoD: ≥12 planted findings detected; golden
  `findings.json` snapshot passes.*
- **M4 · taste v1** — Gemini verdicts + reflection + zod validation + mechanical fallback. *DoD: all
  findings get a verdict; brutalist section returns `intentional`; run reproducible enough to demo.*
- **M5 · MCP diagnose** — `tell_capture` + `tell_diagnose` over stdio; `.cursor/mcp.json` set.
  *DoD: from Cursor, diagnose returns `TellReport` JSON.*

**Day 2 — the wow + the loop**
- **M6 · Tell Report + seam** — Next.js route renders report from `tell-report.json`; BeforeAfterSeam
  draggable; score line; findings list. *DoD: seam drag works; keyboard ←/→; reduced-motion jump.*
- **M7 · inspector + verdict cards** — TellCard/DriftCard with evidence pins, rationale, confidence.
  *DoD: all findings inspectable; verdict dual-encoded.*
- **M8 · voice + redesign** — VoiceDirector + presets; `tell_redesign` returns `RedesignProposal`;
  DiffViewer renders diff; `Apply in Cursor` copies patch. *DoD: preset "editorial" changes
  activeDirection; ≥1 diff reviewable.*
- **M9 · demo hardening** — offline artifact fallback, empty/loading/error states, capture flash
  motion, backup demo video recorded.
- **M10 · dogfood** — run Tell on `apps/web`; fix real findings; land "Tell runs on itself: 0 tells."

**Cut line (if behind):** fall back to the committed `fixtures/reports/tell-report.json` artifact and the seeded fixture. Live URL capture, GitHub setup, and token reconciliation are shipped — do not rip them out under demo pressure; use the offline artifact as backup only.

---

## 9. Frontend notes (`apps/web`)

- `/api/diagnose` runs the full pipeline via `packages/core/src/scripts/diagnose-url.ts` (Playwright
  subprocess). On failure, returns the committed `fixtures/reports/tell-report.json` artifact with
  `meta.live: false`.
- `/api/setup/start|status|stop` — local-only GitHub repo runner (`repo-runner.ts`). Clones to a temp
  dir, parses README + `package.json`, installs, spawns dev server, polls for localhost URL. **Never
  expose publicly** — executes arbitrary install/dev scripts from cloned repos.
- BeforeAfterSeam: when `capture.snapshotHtml` is present, renders the captured page in an iframe and
  applies reconciled CSS custom properties from `packages/redesign/reconcile.ts` on the "after" side.
  Fallback: screenshot + CSS overlay when no snapshot.
- `discover-routes.ts` parses anchor tags from snapshot HTML for the Pages strip; user can add routes
  manually and scan all (up to 8).
- ReconciliationTable shows token before/after rows grounded in captured CSS variables.
- Draft fix calls `buildOverridesPatch(reconciliation)` client-side — emits `tell-overrides.css` diff.
- Evidence pins: absolute-positioned proof-mark SVGs over screenshot using `evidence.region` coords.
- All colors/spacing/fonts via tokens from `01_DESIGN_SYSTEM.md`. No Inter. No violet gradient.
- Accessibility floor from design system §9 is a merge gate.

---

## 10. Testing & performance

- `core` fingerprint + detectors: golden snapshots on committed `capture.json`.
- `taste`: contract test with mocked model returning fixed JSON (assert zod + reflection).
- Capture of fixture completes < 8s; fingerprint + detect < 1s; model calls batched with concurrency
  cap ~4.
- Seam component: unit test drag math and keyboard steps.

---

## 11. `.cursor/mcp.json` (reference)

```json
{
  "mcpServers": {
    "tell": { "command": "pnpm", "args": ["-F", "@tell/mcp", "start"] }
  }
}
```

MCP tools to expose:

| Tool | Args | Returns |
|---|---|---|
| `tell_capture` | `{ url: string }` | `CapturePayload` |
| `tell_diagnose` | `{ url?: string, reportPath?: string }` | `TellReport` |
| `tell_redesign` | `{ findingId?: string, direction: string }` | `RedesignProposal` |
| `tell_apply` | `{ proposalId: string }` | `{ patches: string[], instruction: string }` |

Each returns schema-validated JSON. Keep tool descriptions crisp so the Cursor agent calls them
correctly. `tell_apply` never writes files — it returns the patch for the human/agent to apply.

---

## 12. API routes (`apps/web`)

| Route | Method | Purpose |
|---|---|---|
| `/api/diagnose` | POST `{ url? }` | Full pipeline → `{ report, meta }`; timeout/error → offline artifact |
| `/api/redesign` | POST `{ report?, direction, findingId? }` | `RedesignProposal` (uses passed report or demo fallback) |
| `/api/setup/start` | POST `{ repoUrl }` | Clone GitHub repo, begin install/run job → `{ job }` |
| `/api/setup/status` | GET `?id=` | Poll setup job state, logs, detected URL |
| `/api/setup/stop` | POST | Stop spawned dev server, clear job |
| `/api/voice` | POST `{ transcript }` | Parse → `ArtDirection` |

**Setup job states:** `cloning` → `installing` → `detecting` → `starting` → `waiting` → `ready` |
`needs-manual` (user pastes localhost URL) | `error`.

---

## 13. Redesign diff strategy (`packages/redesign`)

**`reconcile.ts`** — deterministic token reconciliation from captured CSS variables + findings. Powers
the live before/after seam and `ReconciliationTable`. No LLM. Direction presets: editorial, precision,
warm-minimal, brutalist.

**`buildOverridesPatch`** — emits a site-wide `tell-overrides.css` with CSS custom properties derived
from the reconciliation. One apply covers every page in the Pages strip.

Priority order for generating diffs:
1. If repo path known: emit token changes in `tailwind.config.ts` + CSS variables in `globals.css`.
2. If only URL (default web flow): emit standalone `tell-overrides.css` with CSS custom properties.
3. Per-finding fix: minimal diff targeting the specific tell (e.g. add display font import + apply
   to `h1–h3`).

Interface:
```ts
export interface RedesignGenerator {
  propose(report: TellReport, direction: ArtDirection, findingId?: string): Promise<RedesignProposal>;
}
```

Default impl: Anthropic API with report+fingerprint+direction as context; output unified diff only.
