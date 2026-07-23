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

