# Tell — Design System

> The tool that names every AI-generated tell must not have a tell itself.
> This system is written to pass its own audit: a distinctive editorial identity, every value is a
> token, every interactive component declares a complete state matrix, and nothing reads as a default.
> Demo beat: *Tell runs on itself and reports zero tells.*

Version 0.1 · Warm editorial · Build sprint (Cursor track)

---

## 1. Aesthetic direction

**Concept: print atelier.** Tell reads like a design critic's proof sheet — warm paper, ink neutrals,
registration marks, crop lines, a display face with character. The world it borrows from is editorial
design and pre-press craft: broadsheets, specimen sheets, proof corrections, the moment a bland comp
becomes a considered layout. The mood is confident and human until a finding lands, at which point a
single warm signal marks the spot — like a proofreader's mark on a spread.

Three defaults to consciously avoid (they read as AI-generated — and Tell detects them): Inter-only
type systems; a single violet→pink hero gradient; shadow-lg on every card. Tell is none of these. It
uses a **tri-tone type system** (display serif + humanist sans + mono), a **warm paper-ink palette**
(not cool SaaS slate), and a **single restrained accent** (terracotta-leaning, not acid green or
violet). Severity/findings use a curated three-hue legend, never a rainbow dashboard.

**Signature element — the reveal seam.** A diagonal wipe dividing "before" (what you shipped) from
"after" (what Tell proposes). The seam carries registration/crop marks at its corners — print-craft
that says "this is a proof, not a preview." It appears in the hero demo, the before/after component,
and the landing one-pager. Spend the boldness here; keep everything else editorial and quiet.

**Secondary motif — the proof mark.** A small filled circle with a crosshair (like a registration
target) marks evidence hotspots on captured screenshots. Used in TellCards, loading states, and the
wordmark glyph.

---

## 2. Color

### 2.1 Primitive ramp — Paper (warm neutrals)

Primitives are raw values. Never reference them directly in components; go through semantic tokens
(§2.4).

| Token | Hex | Use hint |
|---|---|---|
| `paper-50` | `#FAF7F2` | Max light / on-accent text |
| `paper-100` | `#F3EDE4` | High-emphasis text on dark |
| `paper-200` | `#E8DFD3` | Body text on dark panels |
| `paper-300` | `#D4C9BA` | Secondary text |
| `paper-400` | `#B8AA98` | Muted / caption |
| `paper-500` | `#968876` | Disabled foreground |
| `paper-600` | `#73665A` | Dividers |
| `paper-700` | `#574E45` | Default border |
| `paper-800` | `#3D3731` | Strong border |
| `paper-850` | `#2E2A26` | Card / popover surface |
| `paper-900` | `#221F1C` | Panel background |
| `paper-950` | `#181614` | App background |

### 2.2 Signal ramp — Terracotta (primary, "the mark")

Warm, editorial, human. Deliberately earthy — not startup violet, not acid green.

| Token | Hex |
|---|---|
| `terra-600` | `#B85A32` |
| `terra-500` | `#D4714A` | ← primary interactive |
| `terra-400` | `#E8926F` |
| `terra-300` | `#F0B49A` |
| `terra-alpha-16` | `rgba(212,113,74,0.16)` | wash / glow |

### 2.3 Structure ramp — Ink (intentional / pass)

Deep, warm black-green — not pure black, not cool slate.

| Token | Hex |
|---|---|
| `ink-600` | `#2A4A42` |
| `ink-500` | `#3A6358` | ← "intentional" / pass |
| `ink-400` | `#5A8578` |
| `ink-alpha-16` | `rgba(58,99,88,0.16)` |

### 2.4 Semantic tokens

Components consume only these.

**Surfaces**
- `--bg` = paper-950
- `--surface` = paper-900
- `--surface-raised` = paper-850
- `--surface-overlay` = paper-800
- `--surface-paper` = paper-100 (light panels, proof sheets, before/after "after" side accents)

**Borders**
- `--border` = paper-700
- `--border-strong` = paper-800
- `--border-faint` = paper-850
- `--border-proof` = paper-600 (crop/registration lines)

**Text**
- `--text` = paper-100
- `--text-secondary` = paper-300
- `--text-muted` = paper-400
- `--text-disabled` = paper-500
- `--text-on-accent` = paper-50
- `--text-display` = paper-50 (display headlines)

**Interactive (primary)**
- `--accent` = terra-500
- `--accent-hover` = terra-400
- `--accent-press` = terra-600
- `--accent-wash` = terra-alpha-16
- `--accent-fg` = paper-50

Primary control foreground/background pairs must meet at least 4.5:1. If a reconciled accent cannot
support `--accent-fg`, choose the readable foreground instead of preserving the nominal token.

**Positive / intentional**
- `--ok` = ink-500
- `--ok-wash` = ink-alpha-16

**Focus**
- `--focus-ring` = terra-400

### 2.5 Verdict system (findings legend)

Each verdict category owns one distinct hue. This is a **legend**, not a warm→cool severity ramp.
Verdict is always encoded by **icon + label + shape**, never color alone.

| Verdict | Token | Hex | Glyph | Shape |
|---|---|---|---|---|
| Generic tell (fix) | `--v-generic` | `#D4714A` terra | eye | filled circle |
| Consistency drift | `--v-drift` | `#C4A035` ochre | split | diamond |
| Intentional (keep) | `--v-intentional` | `#3A6358` ink | check | ring |
| Uncertain (fallback) | `--v-uncertain` | `#968876` paper-500 | question | dashed ring |

Washes for each: same hue at 16% alpha for row backgrounds and card headers.

---

## 3. Typography

A three-role system with **deliberate contrast** — the antidote to Inter-only AI defaults.

- **Display** — `Instrument Serif` (400/600). Headlines, wordmark, big numbers, the "after" side of
  proofs. Used with restraint; never for body.
- **Body / UI** — `Source Sans 3` (400/500/600). Everything interface. Humanist, warm, not geometric
  default.
- **Mono / data** — `IBM Plex Mono` (400/500). URLs, computed values, diffs, Tell scores, eyebrows.
  Also carries uppercase registration labels.

Fallbacks: `Georgia, "Times New Roman", serif` for display; `ui-sans-serif, system-ui` for sans;
`ui-monospace, "SF Mono", monospace` for mono.

**Explicit ban in Tell's own UI:** Do not use Inter, system-ui-only stacks, or a single sans for every
role. Tell's `SystemFontTell` detector would flag it.

### 3.1 Type scale

| Token | Size / line | Face | Weight | Tracking |
|---|---|---|---|---|
| `display-xl` | 56 / 60 | Instrument Serif | 600 | -0.02em |
| `display-l` | 40 / 46 | Instrument Serif | 600 | -0.02em |
| `h1` | 32 / 40 | Instrument Serif | 400 | -0.015em |
| `h2` | 24 / 32 | Source Sans 3 | 600 | -0.01em |
| `h3` | 20 / 28 | Source Sans 3 | 600 | -0.005em |
| `body-l` | 17 / 26 | Source Sans 3 | 400 | 0 |
| `body` | 15 / 22 | Source Sans 3 | 400 | 0 |
| `caption` | 13 / 18 | Source Sans 3 | 400 | 0 |
| `mono-data` | 13 / 20 | IBM Plex Mono | 400 | 0 |
| `eyebrow` | 11 / 14 | IBM Plex Mono | 500 | 0.1em, uppercase |

Default UI text is `body` (15px) — editorial density, not marketing 18px.

---

## 4. Space, radius, elevation, motion

### 4.1 Spacing — 4px base grid

`space-0`=0 · `1`=4 · `2`=8 · `3`=12 · `4`=16 · `5`=20 · `6`=24 · `8`=32 · `10`=40 · `12`=48 ·
`16`=64 · `20`=80 · `24`=96.

Component internal rhythm defaults to `space-2`/`space-3`; section rhythm to `space-8`/`space-12`.
Asymmetric layouts encouraged — not everything centered (Tell detects `CenteredEverythingTell`).

### 4.2 Radius — varied (anti-monotone)

`radius-none`=0 · `sm`=2 · `md`=4 (controls) · `lg`=8 (cards) · `xl`=16 (modals) · `full`=9999
(pill). **Use at least two distinct radii** in any view — monotone 8px-everywhere triggers
`RadiusMonotoneTell` on the fixture, and Tell's own UI must not trigger it.

### 4.3 Borders

Hairline = 1px `--border`. Strong = 1px `--border-strong`. Proof/crop lines = 1px `--border-proof`
at 40% opacity. Registration marks = 12px L-shaped corners at `--border-proof`.

### 4.4 Elevation (warm dark UI = surface lift + hairline + restrained shadow)

- `e0` base: `--bg`, no shadow.
- `e1` panel: `--surface`, 1px `--border-strong`.
- `e2` card: `--surface-raised`, 1px `--border`, `0 2px 8px rgba(0,0,0,.25)` — **one level only**;
  do not stack shadow-lg on every card (`ShadowEverywhereTell`).
- `e3` modal: `--surface-overlay`, `0 12px 40px rgba(0,0,0,.45)`.
- `e-signal` selected finding: `0 0 0 1px var(--accent), 0 0 20px var(--accent-wash)`.

### 4.5 Motion

Durations: `instant`=0 · `fast`=120ms · `base`=200ms · `slow`=320ms · `deliberate`=480ms.
Easing: `ease-out`=`cubic-bezier(0.16,1,0.3,1)` · `ease-standard`=`cubic-bezier(0.2,0,0.2,1)` ·
`ease-in-out`=`cubic-bezier(0.65,0,0.35,1)`.

Signature motions:
- **Seam wipe** — the reveal seam drags horizontally; before/after sides parallax slightly
  (`deliberate`, `ease-standard`). Registration marks fade in at rest.
- **Proof mark pulse** — evidence hotspot scales 1→1.08→1 on finding reveal (`slow`, `ease-out`).
- **Capture flash** — a brief paper-white overlay on screenshot load (`fast`, opacity only).

Always honor `prefers-reduced-motion`: seam jumps to position; no pulse; opacity fades ≤120ms.

---

## 5. Iconography

Line icons, 1.5px stroke, 20px grid, round caps. Source: Lucide (adjust stroke). Reserve **filled**
glyphs for verdict markers only. Custom glyph: the **proof mark** — circle with crosshair — used as
the app icon, loading indicator, and evidence pin on captures.

---

## 6. Components

Every interactive component defines the **canonical state matrix** (§7). Specs below give the visual
contract; states not listed inherit the matrix defaults.

### 6.1 Button

Sizes: `sm` (h32, px-3, caption), `md` (h36, px-4, body), `lg` (h44, px-5, body-l). Radius `md`.
Variants:
- **primary** — bg `--accent`, text `--accent-fg`. Hover `--accent-hover`. Press `--accent-press`.
- **secondary** — bg `--surface-raised`, text `--text`, 1px `--border`. Hover border `--border-strong`.
- **ghost** — transparent, text `--text-secondary`. Hover bg `--accent-wash`, text `--text`.
- **danger** — bg transparent, text `--v-generic`, 1px `--v-generic` at 40%. Hover fill wash.

Loading: label swaps for proof-mark spinner, width preserved, control disabled.

### 6.2 IconButton

Square, `sm`=32 / `md`=36. Same variants. Must declare disabled + focus-visible.

### 6.3 VerdictBadge

Pill, `radius-full`. Layout: `[glyph] [LABEL]`. bg = verdict wash, text = verdict hue, border =
verdict hue at 30%. Label in `eyebrow`. Never color-only.

### 6.4 CaptureBar

Top bar, `e1`. Left: proof-mark glyph + wordmark `Tell` (Instrument Serif). Center: URL input
(mono, truncating) + `Capture` primary button (becomes `Capturing…` with flash). Right: StatusPill
(MCP), voice toggle, export report.

### 6.5 TellReport (hero surface — the product loop)

Not a dashboard. A **single-column editorial report** with an embedded before/after seam.

Structure top→bottom:
1. **Score line** (mono, eyebrow): `8 findings · 5 generic · 2 drift · 1 intentional`.
2. **BeforeAfterSeam** (§6.6) — full width, min-height 360px.
3. **Findings list** — grouped by verdict (Generic / Drift / Intentional). Each row: VerdictBadge +
   tell/drift name (mono) + one-line rationale + proof-mark pin linking to evidence.
4. **VoiceDirector strip** (§6.9) — pinned below findings when a direction is active.

Selected finding raises to `e-signal` and scrolls evidence into view in the inspector.

### 6.6 BeforeAfterSeam (signature)

Full-bleed capture comparison. Left = "before" (captured screenshot). Right = "after" (CSS/token
overlay preview or re-rendered proposal). A draggable vertical seam with registration marks at
top/bottom. Labels: `BEFORE` / `AFTER` in eyebrow mono at corners. Seam handle = 4px `--accent`
bar with proof-mark icon.

Interaction: drag seam · keyboard ←/→ in 5% steps · double-click reset to 50/50. Reduced-motion:
jump only, no parallax.

### 6.7 TellCard (genericness finding — core surface)

`e2` card. Structure:
1. Header: tell name (`h3`, mono e.g. `SystemFontTell`), VerdictBadge (`GENERIC`), confidence meter
   (5-segment mono bar).
2. Rationale: `body`, `--text-secondary`, ≤3 sentences, critic voice.
3. Evidence: captured screenshot crop with proof-mark pin at the offending region; below, computed
   values in mono (`font-family: Inter, system-ui` highlighted).
4. Footer: primary `Draft fix` + secondary `Mark intentional`.

### 6.8 DriftCard (consistency finding)

Same structure as TellCard but for drift detectors. Evidence shows side-by-side computed values
(e.g. `#F3F4F6` vs `#F4F4F5` vs `#F5F5F4`) with near-duplicate callout.

### 6.9 VoiceDirector

Bottom dock or inline strip. Left: mic button (pulse when listening, terra wash). Center: transcript
or placeholder `Describe the direction…` (e.g. "warmer, more editorial, less shadow"). Right: preset
chips (`Editorial` · `Precision instrument` · `Warm minimal` · `Bold contrast`) as text fallback.
Active direction shows as a mono tag: `direction: editorial-warm`.

### 6.10 DiffViewer (reconciliation)

Two-column unified/side-by-side toggle, IBM Plex Mono 13px. Additions on `--ok-wash` with `+`
gutter; removals on `--v-generic` wash with `−` gutter. Header: file path (mono) + `Copy patch` /
`Apply in Cursor`. Never auto-applies.

### 6.11 Inspector Panel

Right-docked, width 440, `e1`, resizable to 560. Hosts TellCard/DriftCard + DiffViewer in tabs
(`Finding` / `Fix` / `Evidence`). Empty state when nothing selected (§7).

### 6.12 StatusPill (MCP connection)

`radius-full`, dot + label. Connected = ink dot + "MCP connected". Connecting = terra pulsing.
Error = generic-verdict hue + reason.

### 6.13 Toast, Tooltip, Tabs, EmptyState, Skeleton

- **Toast** — `e2`, bottom-right, mono timestamp, 4s auto-dismiss. "Captured"→"Captured" naming
  consistency through the flow.
- **Tooltip** — `e2`, caption, 8px offset, 120ms delay.
- **Tabs** — underline indicator in `--accent`, animated `base`.
- **EmptyState** — see §7.
- **Skeleton** — paper-850 blocks, shimmer left→right `slow`, reduced-motion → static.

---

## 7. Canonical state matrix (dogfood contract)

Every interactive component MUST implement each applicable state. Tell's own audit fails the build
if any is missing. This table is the spec Tell enforces on *itself*.

| State | Required for | Visual contract |
|---|---|---|
| **default** | all | base tokens |
| **hover** | all pointer targets | +1 surface step or `--accent-wash`; 120ms |
| **focus-visible** | all focusable | 2px `--focus-ring`, 2px offset, radius matches control. Never browser default. |
| **active / press** | all buttons | `--accent-press` or −2% brightness |
| **disabled** | all controls | `--text-disabled` fg, no shadow, `cursor: not-allowed`, aria-disabled; token-based |
| **loading** | async controls | proof-mark spinner, width preserved, `aria-busy`; disable duplicate actions |
| **selected** | list/findings | `e-signal` or left 2px `--accent` bar |
| **error** | inputs, async | `--v-generic` border + caption message; message says what happened + fix |
| **empty** | any data region | icon + one-line "what this is" + primary action |

**Empty-state copy pattern:** `[proof-mark]  No capture yet.` / `Point Tell at a URL to read its
design surface.` / `[Capture]`.

**Error copy pattern:** `Capture failed: couldn't reach localhost:3000.` / `[Retry] [Edit URL]`.
Errors never apologize and never stay vague.

Async setup/capture operations hide stale previews while running. A previous capture must never remain
visually active in a way that implies the new target has already succeeded.

---

## 8. Data visualization — findings, not charts

Tell does not hero-chart KPIs. Data appears as:

### 8.1 Score line

Mono readout, not a big number widget: `8 findings · 5 generic · 2 drift · 1 intentional`. Sits at
the top of the report like a lede.

### 8.2 Findings list

Grouped rows with VerdictBadge + mono identifier + rationale excerpt. Filtering dims non-matches to
30% opacity rather than hiding (preserves context). No pie charts, no stat-card grid.

### 8.3 Evidence pins

On the captured screenshot, proof-mark pins at detector-identified regions. Hover → tooltip with
tell name + computed value. Click → select finding, open Inspector.

### 8.4 Before/after seam

The primary visual argument. Not a side-by-side thumbnail grid — one immersive comparison with a
draggable seam.

---

## 9. Accessibility floor

- Text contrast ≥ 4.5:1 (`--text` on `--surface` verified).
- Reconciliation previews may force text color only inside surfaces they also recolor.
- Non-text/UI contrast ≥ 3:1 for borders, focus rings, verdict markers.
- Visible `focus-visible` on every focusable element (2px `--focus-ring`, offset 2px).
- Min pointer target 36×36 for dense controls, 40×40 for primary actions; seam handle 44px wide.
- Verdict never conveyed by color alone.
- Respect `prefers-reduced-motion` everywhere.
- Full keyboard path: capture → finding → seam → verdict → fix.
- Voice input is optional enhancement; every voice action has text/preset equivalent.

---

## 10. Voice

Critic voice: direct, specific, active, sentence case. Name things by what the user controls
("Capture", "Draft fix", "Mark intentional"), never by implementation ("run detector pipeline").
State findings as facts: *"Tell found 8 findings. 5 are generic tells, 2 are drift, 1 is
intentional."* No hedging, no apology, no emoji. Rationale reads like a senior designer's note,
not a chatbot.

---

## 11. Tailwind token wiring (reference)

Map semantic tokens to CSS variables in `:root`, expose to Tailwind via `theme.extend.colors` using
`rgb(var(--x) / <alpha-value>)` pattern, and expose scale, radius, and font families.

```css
:root {
  --bg: 24 22 20;           /* paper-950 */
  --surface: 34 31 28;      /* paper-900 */
  --accent: 212 113 74;     /* terra-500 */
  --text: 243 237 228;      /* paper-100 */
  /* … full set per §2.4 */
}
```

Components reference `bg-surface`, `text-secondary`, `border-strong`, `text-accent`, etc.
**No raw hex or arbitrary values in component classNames** — Tell's `TokenBypass` drift detector
flags literals in source; dogfood applies the same rule to Tell's own repo.

Font wiring:
```js
fontFamily: {
  display: ['"Instrument Serif"', 'Georgia', 'serif'],
  sans: ['"Source Sans 3"', 'ui-sans-serif', 'system-ui'],
  mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
}
```

---

## 12. Dogfood checklist (Tell must pass itself)

Before demo, run Tell on `apps/web`. Target: **0 generic tells, 0 unintentional drift.**

| Check | Pass criteria |
|---|---|
| Type system | Display + sans + mono all present; no Inter-only |
| Color | No violet gradient hero; no acid accent on near-black |
| Shadow | e2 max on cards; not shadow on every element |
| Radius | ≥2 distinct radii in main view |
| Centering | Asymmetric report layout; not everything centered |
| Grays | ≤4 distinct gray values in token ramp |
| States | Full matrix on Button, CaptureBar, VoiceDirector, seam handle |
| Tokens | No raw hex in committed component classNames |
