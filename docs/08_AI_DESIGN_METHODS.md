# Tell — AI Design Methods Plan

> **Separate plan** for how Tell helps humans design *with* AI without shipping the
> generic “AI look.” Complements art-direction presets (including Visual textbook /
> `explainer`) and `docs/07_VISUALIZATION_PLAN.md`. Does **not** replace `PLAN.md` or
> `BUILD.md`.
>
> **Attribution rule:** Describe methods, principles, and product options only.
> Do **not** name external authors, sites, brands, model vendors, skill marketplaces,
> gallery products, or third-party tools in code, copy, comments, commits, or docs.

**Status:** Planned (partially adjacent to shipped presets/voice) · **Audience:** taste, redesign, UI, UX-copy, demo agents · **Related:** `packages/taste` presets, `packages/redesign` directions, BrandDNA / reference flows, Voice director

---

## 0. Problem statement

AI executes design rules well — spacing, type scales, color theory, hierarchy. It still
fails at **taste**: originality, meaning, and intent. The failure mode is recognizable:

- Competent blandness
- Pattern assembly instead of directed composition
- Sameness across unrelated products

Most people misunderstand “designing with AI” as “ask AI to design everything.” That
produces the look Tell exists to name. The correct framing:

| Human owns | AI owns |
|---|---|
| Idea, meaning, audience, feeling | Execution of constrained instructions |
| Direction and taste judgments | Layout, tokens, component drafts under those constraints |
| What to keep / reject | Diffs, variants, mechanical cleanup |

**Prompts are not taste.** Prompts communicate decisions already made. Better results come
from better direction — and direction is built deliberately.

This plan defines three Tell-facing **design methods** (speed ↔ quality), how they map to
product options, and the **mandatory process for adding new styles / art directions** so
new presets do not become another bland default.

---

## 1. North star (Priya)

Priya ships with an agent daily. She can execute. She cannot name why her UI feels generic,
and “make it prettier” re-selects the same defaults.

Tell must:

1. **Name the sameness** (detectors + critic voice).
2. **Force a human direction** before wholesale restyle (presets, voice, references).
3. **Execute in constrained slices** (tokens, components, reviewable diffs — never auto-apply).
4. **Offer method choices** so she can trade speed vs originality for the stakes of the demo.

Success: a visitor feels *someone decided*, not *a model assembled*.

---

## 2. The three methods (product options)

Encode these as first-class **Design Method** options when steering a redesign. They are
orthogonal to **art-direction presets** (editorial, precision, explainer, …).

| ID | Label (UI) | Speed | Quality ceiling | When to offer |
|---|---|---|---|---|
| `skill` | Packaged judgment | Fast | Decent | Small surfaces, low stakes, timeboxed demos |
| `compose` | Build by piece | Slow | Highest | Investor-facing, brand-defining, “must feel considered” |
| `board` | Reference board | Medium | High if board is curated | User has screenshots / BrandDNA but not time for full compose |

### 2.1 Method A — Packaged judgment (`skill`)

**Idea:** Encode prior design judgment into reusable constraints so the model avoids the
usual traps (default stacks, violet gradients, shadow-everywhere, Inter-only, equal cards).

**Tell mapping (today → planned)**

| Today | Planned |
|---|---|
| Art-direction presets + recipes | Explicit “Packaged judgment” mode in Voice director |
| Detector facts as guardrails | Skill packs per surface type (marketing, app shell, docs, educational) |
| Dogfood rules in design system | Versioned skill manifests in-repo (no marketplace names) |

**User flow**

1. Pick a skill pack / preset (or accept Tell’s recommendation from findings).
2. Give short product context (audience, one feeling word, must-keep brand marks).
3. Generate after-state / patch in 1–3 iterations.
4. Fix obvious issues; ship.

**Honest limits (copy must say this)**

- Prevents the worst mistakes; does **not** manufacture originality.
- Results may still resemble other skill-assisted AI UIs.
- Enough for many quick jobs; not the path for “people feel real thought.”

**Anti-goals**

- Do not market skills as “instant unique brand.”
- Do not hide that taste still comes from the human’s choice of pack + context.

### 2.2 Method B — Human direction, AI execution (`compose`)

**Idea:** The human defines meaning and structure; AI builds **one component at a time**
adapted to branding. Highest quality; slowest.

**Mandatory sequence**

```
meaning → interrogation → inspiration → structure map → component build → assets → motion → refine
```

#### B1. Start with meaning (before visuals)

Write down:

1. Who is this for?
2. What problem does it solve?
3. What should it feel like?
4. What should it represent?
5. What must never look like “default AI UI”?

The interface must reflect **product meaning**, not merely look polished.

#### B2. Interrogation (AI as questioner, not designer)

Allow AI to ask, not invent:

- Product about?
- Audience?
- Feeling / brand character?
- Colour and type temperament?
- Minimal / playful / premium / technical / experimental / educational?

**Tell implementation sketch:** a “Direction interview” step that outputs a structured
`DirectionBrief` (zod) before any restyle. Deterministic fallback: short form fields.

#### B3. Collect inspiration (how to look)

Rules for reference intake:

- Ask **why** a reference works (layout, spacing, type, structure, interaction) — not only “looks good.”
- Save fragments into folders/tags: nav, hero, pricing, cards, mobile, dashboard, motion, type, diagrams.
- **Never copy an entire design.** Combine fragments into something that fits *this* product.
- Taste is deliberate pattern recognition over time — Tell should encourage libraries, not one-shot vibes.

**Tell implementation sketch:** BrandDNA + optional reference image/screenshot set; store
tagged fragments, not “clone this URL’s CSS.”

#### B4. Map the structure

Define sections before generation.

| Surface | Typical map |
|---|---|
| Marketing site | Nav, hero, features, pricing, proof, CTA, footer |
| App | Onboarding, home, search, profile, settings, core flows, empty/error/loading |
| Educational / blog | Title, lede, chapters, figures, asides, footer — see viz plan |
| Dashboard | Shell, primary view, filters, empty, density states |

Each section needs a job + content slots (e.g. hero = headline, support, CTA, visual).

#### B5. Build component by component (critical tactic)

**Do not** ask for the whole product in one shot.

Instead: “Create a hero in this direction, adapted to my branding,” then nav, cards,
buttons, type details, figure frames, etc.

Why:

- Models perform better on small, well-defined tasks.
- Human retains decision control at every seam.
- Rejects wholesale acceptance of generic assemblies.

**Tell implementation sketch**

- Redesign API accepts `scope: "hero" | "nav" | "cards" | … | "tokens-only" | "page"`.
- UI: ordered checklist of scopes; seam updates per scope.
- Patches stay reviewable and cumulative.

#### B6. Custom assets

Prefer custom imagery matched to brand tokens over generic stock.

Instructions to generators must include: palette, style, composition, use case.

**Tell:** asset prompts derived from `DirectionBrief` + accent/paper; never invent a second palette.

#### B7. Motion and finish

Add interactions last. Small depth cues (layering, restrained motion, reduced-motion
paths) often decide “finished” vs “assembled.” See viz plan for educational figures.

### 2.3 Method C — Reference board (`board`)

**Idea:** Middle ground. Human curates a board of references that *are* the taste signal;
AI synthesizes a direction for *this* product without copying any one reference.

**User flow**

1. Complete meaning + interrogation (same as Method B).
2. Attach a curated board (screenshots / URLs / BrandDNA references).
3. Instruct: combine *style and direction* of these references for my product; do not copy.
4. Generate a fuller pass than Method A, with fewer manual component loops than Method B.
5. Spot-fix weak sections with Method B slices.

**Tell implementation sketch**

- “Reference board” panel on Voice director / redesign.
- Board → inferred keywords + token biases + recipe hints (deterministic scoring first).
- Gemini (optional) refines a `DirectionPlan`; fallback stays deterministic.
- Explicit copy: board quality caps result quality.

---

## 3. Methods at a glance (UI copy bank)

Use critic voice; no emoji; no third-party names.

| Method | One-liner |
|---|---|
| Packaged judgment | “Fast guardrails. Decent. Won’t invent a unique brand for you.” |
| Build by piece | “You direct; Tell executes one piece at a time. Slowest. Sharpest.” |
| Reference board | “Your references carry the taste. Faster than piece-by-piece, clearer than a bare preset.” |

**Decision helper**

| Stakes | Default method |
|---|---|
| Internal / throwaway | Packaged judgment |
| Public marketing, demo tomorrow, brand moment | Build by piece (or board → piece fixups) |
| Has a strong reference set, limited time | Reference board |

---

## 4. Relationship to art-direction styles

**Methods** = *how* we steer execution.  
**Styles / presets** = *what visual system* we steer toward.

| Style preset (examples) | Fits which methods |
|---|---|
| Editorial warm | All three |
| Precision instrument | All three; strong with compose for data products |
| Warm minimal | skill / board |
| Bold contrast | skill / board; compose for hero craft |
| Classic luxury | compose / board |
| Brutalist utility | compose (easy to fake badly with skill alone) |
| Visual textbook (`explainer`) | compose + viz plan; board if references are figure-led |

Adding a **new style** always follows §5 — never “drop in another accent hex.”

---

## 5. How to add a new design style / option (mandatory process)

This is the operational checklist for agents and humans when extending Tell’s style system
(`packages/taste` presets + `packages/redesign` directions + UI chips).

### 5.1 Gate: meaning first

Before tokens:

1. Name the **product situations** this style serves (e.g. educational long-form, fintech dense, hospitality).
2. Write the **feeling** in ≤12 words.
3. Write what it must **not** look like (generic AI cluster avoidance — see design system anti-defaults).
4. Confirm it is not a clone of an existing preset (pairwise distinctness required).

### 5.2 Interrogation artifact

Produce a `StyleBrief`:

```text
id:
label:
situations: []
feeling:
anti_patterns: []
type_roles: { display, body, mono }
palette_rules: { paper, ink, accent_discipline }
layout_rules: { contentMax, chrome, rhythm }
component_language: { hero, button, card, link, section }
motion_rules:
accessibility_notes:
method_fit: [skill|compose|board]
```

No external product names in the brief.

### 5.3 Inspiration → principles (not clones)

1. Collect private references if needed for research.
2. Extract **principles** only into the repo (column width, stroke discipline, diagram pauses, etc.).
3. Forbidden: author names, site hostnames, brand names, “inspired by X” in code or docs.

### 5.4 Structure map for the style

Define how the style treats:

- Reading/marketing column
- Hero / chapter openers
- Cards (or refusal of cards)
- Figures / media
- Density and whitespace
- Dark/light paper stance

### 5.5 Implement component language, not a recolor

Per redesign v2 rules: every direction needs a **full recipe** (texture, hero treatment,
button/link/card/section language, numerals, etc.) — not only accent + font.

Order of implementation:

1. `@tell/schema` only if new fields are required (prefer not).
2. `packages/redesign/src/directions.ts` — full `Direction` + aliases.
3. `packages/taste/src/presets.ts` — keywords + tokenOverrides + summary.
4. `parse-direction.ts` — scoring + Gemini allow-list (no third-party keywords).
5. `llm-restyle.ts` KNOWN_DIRECTIONS entry.
6. UI `PRESET_CHIPS` label.
7. Distinctness + contrast tests green.
8. Docs: methodology table row if type pairing is curated; skills/agents preset lists.
9. Optional: educational/viz hooks if the style is illustration-first (`docs/07_*`).

### 5.6 Build-by-piece validation

Before claiming the style ships:

1. Apply tokens-only to the golden fixture — score must improve or hold honestly.
2. Spot-check hero, buttons, cards, links as separate scopes.
3. Verify pairwise CSS overlap vs other directions stays under the distinctness bar.
4. Dogfood: Tell’s own UI does **not** adopt a new style that triggers tells.

### 5.7 Copy and voice

- Critic voice summaries (USER_STORY bank).
- Method recommendation line (“Use Build by piece when …”).
- Never promise originality from the preset alone.

---

## 6. Schema / API sketch (planned)

Freeze contracts in `@tell/schema` before splitting agents.

```ts
// Conceptual — implement when M-D2 starts
DesignMethodId = "skill" | "compose" | "board"

DirectionBrief = {
  audience: string
  problem: string
  feeling: string
  representation: string
  temperament: string[]  // minimal | playful | premium | technical | experimental | educational | …
  mustKeep: string[]
  mustAvoid: string[]
}

ReferenceFragment = {
  id: string
  tag: "nav" | "hero" | "pricing" | "cards" | "mobile" | "dashboard" | "motion" | "type" | "diagram" | "other"
  noteWhy: string  // required: why it works
  // image or URL handles stay implementation detail
}

DesignSteerRequest = {
  method: DesignMethodId
  stylePresetId?: string
  brief?: DirectionBrief
  board?: ReferenceFragment[]
  scope?: "tokens" | "hero" | "nav" | "cards" | "buttons" | "type" | "figures" | "page"
}
```

**Rules**

- Deterministic path must work with brief + preset alone (no keys).
- Board without `noteWhy` on fragments is rejected or down-ranked.
- `scope: "page"` disallowed in `compose` mode unless user confirms override (protects the method).

---

## 7. UI / UX plan (Tell Report)

### 7.1 Voice director additions

```
Method:  ( ) Packaged judgment  ( ) Build by piece  ( ) Reference board
Style:   [preset chips…]
Brief:   [interview fields or “Ask me”]
Board:   [add fragments]   // visible if method = board
Scope:   [checklist]       // emphasized if method = compose
```

### 7.2 Empty / helper states

- Packaged: “Pick a style pack. Add one feeling word. Generate.”
- Compose: “Answer the brief. Map sections. Generate one scope at a time.”
- Board: “Attach references and say why each matters. We’ll synthesize — not copy.”

### 7.3 Seam behavior

- Compose mode: seam updates after each scope apply preview.
- Skill / board: full-page preview allowed; still never auto-apply to repo.

### 7.4 Accessibility

- Method control is a radiogroup with visible selected state (not color-only).
- Board uploads keyboard-reachable; fragment tags as listboxes.

---

## 8. Detector / taste interplay

| Signal | Method implication |
|---|---|
| Many generic tells + no brand marks | Recommend Packaged judgment to clear floor, then Compose for hero |
| Strong BrandDNA / serif intentional | Prefer Board or Compose; avoid overwriting intentional with skill defaults |
| Educational / long-form tells (viz plan) | Prefer Compose + Visual textbook; figures scoped separately |
| Time pressure (demo tomorrow copy) | Offer Board with honest ceiling disclaimer |

Taste engine remains fact-bound: skills/presets must not invent findings.

---

## 9. Milestones

### M-D0 — Plan freeze

- [x] This document landed
- [x] Link from `PLAN.md` inventory + docs authority
- [x] Attribution rule echoed in taste/redesign skills (no third-party style names)

### M-D1 — Copy + method selector (UI-only)

- [ ] Method radiogroup on Voice director (stateful; may still map all methods to current full-page reconcile)
- [ ] Helper copy from §3
- [ ] Persist method in client state / share payload if share links exist

### M-D2 — Schema + steer request

- [ ] `DesignMethodId`, `DirectionBrief`, `ReferenceFragment` in `@tell/schema`
- [ ] `/api/voice` and `/api/redesign` accept method + brief + optional board
- [ ] Deterministic fallbacks without keys

### M-D3 — Compose scopes

- [ ] Redesign `scope` parameter honored in reconcile / restyle / patch builders
- [ ] UI checklist drives sequential scopes
- [ ] Tests: scoped CSS touches expected families only

### M-D4 — Reference board path

- [ ] Fragment upload/tag UI
- [ ] Board → keyword/token bias (deterministic)
- [ ] Optional model refine; never required for demo

### M-D5 — Skill packs beyond single presets

- [ ] Surface-type packs (marketing / app / docs / educational) as versioned JSON
- [ ] Pack = preset + detector emphasis + scope order defaults
- [ ] Still principle-only naming

### M-D6 — Style addition playbook automation

- [ ] Checklist script or agent skill `tell-add-style` following §5
- [ ] Distinctness test gate in CI for new `DIRECTIONS` keys

---

## 10. Quality bar

A method or style change is done only when:

- [ ] Human meaning/brief is representable without model keys
- [ ] Method choice is visible and honest about quality ceiling
- [ ] Compose path can run scoped (no forced whole-page generation)
- [ ] Board path forbids silent cloning (requires synthesis instruction + fragment whys)
- [ ] New styles pass pairwise distinctness + contrast guards
- [ ] No third-party names in keywords, docs, commits, or UI
- [ ] Never auto-apply
- [ ] Offline demo path remains intact

---

## 11. Anti-patterns

1. One-shot “build my whole site” as the default CTA
2. Preset-only workflow marketed as originality
3. Reference boards without “why it works” notes
4. Copying a single reference’s layout wholesale into patches
5. Adding styles as accent recolors without recipes
6. Skill packs that reintroduce violet gradients / Inter-only / shadow grids
7. Naming external galleries, authors, or tools in-repo as stand-ins for principles
8. Letting AI invent brand meaning during interrogation
9. Skipping empty/loading/error states in compose maps
10. Auto-applying scoped patches because they “look small”

---

## 12. Testing strategy

| Layer | Assert |
|---|---|
| Unit | Method id parsing; brief zod; scope allow-lists |
| Taste | Preset inference unchanged for style keywords; no third-party keyword leaks |
| Redesign | Scoped emit; distinctness with new styles |
| UI | Method radiogroup keyboard; helper copy visible |
| Demo | Packaged path works offline; compose with tokens-only scope works offline |

---

## 13. Agent routing

| Work | Agent / skill |
|---|---|
| Schema + brief types | `@core-engineer` / schema contracts skill |
| Presets + parsing | `@taste-engineer`, `tell-taste-verdicts` |
| Recipes + scopes | `@redesign-engineer`, `tell-redesign-diff` |
| Method UI | `@ui-builder`, `tell-report-ui` |
| Copy bank | `@ux-copywriter` |
| New style additions | Follow §5; taste + redesign together after schema freeze |
| Educational styles | Also `docs/07_VISUALIZATION_PLAN.md` |

---

## 14. Open questions

1. Should method selection change detector severity weighting, or only redesign behavior?
2. Is BrandDNA already sufficient for v1 Board, or do we need explicit fragment tags now?
3. Minimum compose scopes for demo cut line: tokens + hero only, or full checklist?
4. Do skill packs live in `packages/taste` or a new `packages/skills` (name collision risk with Cursor skills — prefer `packages/taste/packs`)?

Resolve before M-D3 forks.

---

## 15. Success metrics

| Metric | Target |
|---|---|
| Users can pick a method in UI | M-D1 |
| Compose scoped patch path | M-D3 green tests |
| New style playbook followed | Zero “accent-only” direction PRs merge |
| Repo hygiene | Zero third-party author/site names in style/method docs |
| Demo | Packaged judgment path ≤ 3 prompts to a reviewable after-state |

---

## 16. One-page summary

AI executes; humans supply taste. Tell exposes three methods — **Packaged judgment**,
**Build by piece**, and **Reference board** — sitting beside art-direction styles.
Default to piece-by-piece when stakes are high. Add new styles only through meaning →
principles → full recipe → scoped validation. Never confuse a better prompt with better
taste. Never auto-apply. Never put third-party names in the repo as style shortcuts.
