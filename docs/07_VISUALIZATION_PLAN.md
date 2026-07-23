# Tell — Interactive Visualization Plan

> **Separate plan** for illustration-first, book-like educational and blog surfaces.
> Complements the `explainer` / Visual textbook art direction. Does **not** replace
> `PLAN.md` (product remaining work) or `BUILD.md` (engineering contracts).
>
> **Attribution rule:** This document describes principles, patterns, and implementation
> requirements only. Do not name external authors, sites, brands, tools-as-products, or
> third-party projects in code, copy, comments, commits, or docs when referring to this style.

**Status:** Partially shipped — Visual textbook art direction, voice mapping, and UI chip are live; detector/instrument milestones remain planned · **Audience:** redesign, taste, UI, fixture agents · **Related:** `packages/redesign` directions (`explainer`), `docs/01_DESIGN_SYSTEM.md`, `docs/05_GENERICNESS_METHODOLOGY.md`, `docs/08_AI_DESIGN_METHODS.md`

---

## 0. Purpose

Educational and long-form blog products fail the “generic AI UI” test differently from SaaS dashboards. Their tells are usually:

- Marketing chrome around what should be a quiet reading surface
- Decorative cards, pill clusters, and hero gradients competing with diagrams
- Illustrations treated as stock decoration rather than the primary explanation
- Interactive widgets that look like product UI, not like instruments of understanding

This plan defines how Tell should **recognize, art-direct, and (later) propose** visualization-first educational surfaces: calm prose + precise diagrams + restrained interactivity, integrated as one composition.

### In scope

1. Design principles and UX patterns for visual-textbook surfaces
2. A fidelity ladder for static → interactive diagrams
3. Craft workflow (research → static clarity → selective interaction)
4. Visual language tokens that keep diagrams consistent with surrounding prose
5. **Reusable visualization instruments** (color-space, wireframe, palette grids, voxel/convolution) and the process of building tools instead of one-off drawings
6. Illustration pipeline / tech stack for vector-first production
7. Engineering milestones to ship detector support, redesign recipes, and optional diagram primitives
8. Quality bar, accessibility, performance, and demo safety

### Out of scope (for this plan)

- Auto-applying patches to user repos
- LLM calls inside `packages/core`
- Building a full physics/WebGL authoring product in the sprint MVP
- Replacing Tell’s own print-atelier identity (Tell Report stays on `docs/01_DESIGN_SYSTEM.md`)
- Shipping a public plugin marketplace or naming external design hosts in-repo

---

## 1. Product framing (Priya lens)

When Priya’s site is an educational product, docs site, or technical blog:

1. **Capture** the rendered article/page (not just a marketing landing shell).
2. **Diagnose** chrome noise, weak reading column, illustration starvation, and “widgety” controls.
3. **Art-direct** toward Visual textbook (`explainer`) — book column, monochrome restraint, illustration-first rhythm.
4. **Propose** measurable token + layout diffs; optionally propose diagram treatment notes (labels, contrast, chrome reduction).
5. **Human applies** in Cursor. Never auto-apply.

Success for this plan: a captured educational page can be steered into a surface where **diagrams teach faster than prose alone**, and the interactive layer feels like the same voice as the writing.

---

## 2. Core design principles

These principles are normative for any Visual textbook redesign and for any future diagram components Tell ships or recommends.

### 2.1 Book-like reading experience

| Requirement | Spec |
|---|---|
| Column | Single primary reading column, ~60–75 characters (~640–720px content max) |
| Hierarchy | Chapter / section modularity; consistent heading ladder |
| Chrome | Near-zero nav clutter, sidebars, sticky marketing bars, floating CTAs |
| Scroll | Continuous prose flow; diagrams interrupt as intentional pauses, not as card galleries |
| Feel | Closer to a technical book than a landing page |

### 2.2 Illustration-first hierarchy

- Custom diagrams and figures carry most explanatory weight.
- Prose supports the visual: introduce → show → name the parts → deepen.
- A diagram appears exactly where understanding requires it — not batched in a “gallery” section.
- If a paragraph restates what a clear figure already shows, cut the paragraph first.

### 2.3 Monochrome / limited palette

| Layer | Rule |
|---|---|
| Page paper | Cool near-white or near-black; avoid warm-cream + terracotta defaults that read as generic AI editorial |
| Text | High-contrast ink; muted secondary for captions |
| Accent | One restrained signal hue for links, callouts, and diagram highlights — never a rainbow legend |
| Diagram color | Color appears inside figures when it encodes meaning; page chrome stays quiet so figures pop |
| Depth | Prefer hairlines and spacing over shadows and cards |

### 2.4 Generous whitespace + deliberate rhythm

Canonical vertical rhythm:

```
text block
  → full-width or carefully framed figure
  → text block
  → figure (optional progressive disclosure)
  → text block
```

- Section padding large enough that each figure “resets” attention (~96–128px vertical section rhythm on desktop).
- Do not pack multiple competing diagrams in one viewport without a narrative reason.
- Diagrams are pauses, not decorations between marketing modules.

### 2.5 Typography excellence

| Role | Guidance |
|---|---|
| Display | Quiet, readable serif or highly readable sans; optical size when available |
| Body | Clean humanist/grotesk sans; comfortable measure; line-height ~1.55–1.7 |
| Mono | Labels, indices, figure codes, parameter readouts |
| Hierarchy | Strong but calm; avoid display sizes that overpower figures |
| Contrast | WCAG AA minimum for body; AAA preferred for long-form |

Preset pairing already encoded in redesign `explainer`: Source Serif 4 + Source Sans 3 + IBM Plex Mono.

### 2.6 Minimal chrome

- Almost no decorative UI around diagrams.
- Controls (sliders, toggles, drag handles) are sparse, labeled, and purposeful.
- No pill clusters, stat strips, icon rows, or “feature card” frames around explainers.
- Prefer native-feeling minimal controls that inherit page tokens.

### 2.7 Responsive but desktop-optimized

| Viewport | Expectation |
|---|---|
| Desktop (≥1200) | Primary craft surface; diagram detail and hover affordances |
| Tablet | Stack figures; preserve label readability; simplify multi-panel layouts |
| Mobile | Single-column stack; larger hit targets; progressive disclosure over dense simultaneous labels; never require hover |

### 2.8 Subtle polish

Allowed: smooth scrolling, careful image/SVG loading, light hover states, simple toggles, drag-to-scrub parameters.

Forbidden as default: particle fireworks, gratuitous parallax, autoplaying spectacle, “wow” motion that does not teach.

Motion must respect `prefers-reduced-motion`: freeze to the clearest static frame; keep controls usable.

---

## 3. Key UI/UX patterns

### 3.1 Figure placement

1. **In-column figures** — width = reading column; captions below; used for small schematics.
2. **Breakout figures** — wider than text (up to content shell), still optically centered on the column; used for systems diagrams.
3. **Full-bleed figures** — rare; only when spatial scale is the lesson (maps, large assemblies). Never as hero marketing wallpaper.

### 3.2 Chapter / section structure

```
H1 article title
lede (1–3 sentences)
── figure 0: overview (optional)
H2 section
prose
figure
prose
H2 section
…
```

- Numbered chapters or small-caps eyebrows are acceptable if quiet.
- Each section has **one job**, one headline, usually one short supporting sentence before the figure.

### 3.3 Information density without clutter

Inside diagrams:

- Prefer labeled parts over separate legends when space allows.
- Use progressive disclosure: start with the skeleton, reveal layers via toggle or scroll-linked steps.
- Callouts: short, same voice as prose, same type tokens.
- Show simplifications explicitly in caption (“2-D cross-section”, “friction neglected”).

### 3.4 Interaction patterns (only when they add understanding)

| Pattern | When to use | When not to |
|---|---|---|
| Parameter scrub (slider / drag) | Continuous variables (ratio, angle, focal length metaphor, timing) | Binary facts better stated in a sentence |
| Viewpoint drag | 3-D spatial relationships | Flat schematics that are clearer static |
| Step toggle / tabs | Discrete modes or historical states | More than ~5 steps without a narrative spine |
| Hover highlight | Part identification on dense figures | Mobile-primary lessons; critical path info |
| Play / pause | Time-based processes | Loops that distract from reading |

**Cap:** 1–3 meaningful interactive parameters per figure. More usually means the static design is unclear.

### 3.5 Accessibility basics

- Semantic article structure (`article`, `section`, headings in order).
- Captions via `<figcaption>` or equivalent; alt text that states the teaching point, not “diagram”.
- Contrast ≥ 4.5:1 for text; diagram strokes thick enough for low-vision (generally ≥ 1.5px at 1x).
- Keyboard access to all interactive parameters; visible focus.
- Live regions only when value changes are essential; do not spam announcements while scrubbing.
- Do not encode essential meaning in color alone; pair with labels, pattern, or value readouts.

---

## 4. Coherence: visualization as extension of prose

Interactive or static figures must inherit the page system. Treat them as **instruments of the article**, not embedded mini-apps.

| Dimension | Rule |
|---|---|
| Color | Same paper/ink/accent tokens; diagram palette is a disciplined subset |
| Type | Same body/display/mono families and sizes for labels |
| Stroke | Shared stroke weights and corner radii across an article’s figure family |
| Spacing | Label padding and callout gaps on the same spacing scale as prose |
| Voice | Labels and captions use the same calm, precise diction as body copy |
| Chrome | Figure controls use the page’s button/link language (outline, soft underline) — not a second design system |
| Restraint | Interaction only when it accelerates understanding |

**Tone checklist (pass/fail):** If the figure were replaced by a screenshot from an unrelated dashboard widget, would a reader notice a style break? If yes, restyle until no.

---

## 5. Fidelity ladder (choose the simplest tech that stays accurate)

Escalate only when the lower rung cannot express the teaching point.

| Level | Medium | Use for | Cost / risk |
|---|---|---|---|
| L0 | Static SVG (hand-authored or exported) | Structure, anatomy, labeled systems | Lowest; preferred default |
| L1 | SVG + light DOM/React interactivity | Toggles, highlight parts, stepped disclosure | Low |
| L2 | Canvas 2D | Many particles/segments, realtime 2-D simulation | Medium; watch DPR + hit-testing |
| L3 | WebGL (raw or thin wrapper) | True 3-D, lighting, continuous spatial scrubbing | High; justify per figure |
| L4 | Hybrid | SVG labels over Canvas/WebGL scene | Medium-high; keep label DOM accessible |

**Rules of thumb**

- Prefer L0/L1 for Tell-proposed educational redesigns in the near term.
- Never introduce L3 for decoration.
- If accuracy requires math, implement the math explicitly; do not fake motion that implies false physics.
- Keep sources readable in development builds when shipping reference demos (learning value > obfuscation).
- When a concept recurs across articles (palettes, meshes, kernels, quantization), prefer a **reusable instrument** (§6A) over a one-off drawing.

---

## 6. Recommended engineering stack (Tell monorepo)

Aligned with existing Tell stack; no new framework unless a milestone explicitly requires it.

| Concern | Choice | Notes |
|---|---|---|
| App / content shell | Next.js App Router (existing `apps/web`) or MDX islands later | SSG/ISR friendly for long-form |
| Styling | Tailwind + CSS variables / redesign tokens | Explainer tokens already in `directions.ts` |
| Diagram components | React + SVG first | Colocate under e.g. `packages/viz` or `apps/web/src/viz` when implementation starts |
| Interactive 3-D instruments | Canvas 2D or WebGL (thin); orthographic by default for teaching | See §6A instruments; pause when offscreen |
| Vector authoring | Hand craft in a vector design canvas + optional editor plugins | Plugins generate repetitive/math-precise geometry; humans still compose |
| Plugin → web path | Export optimized SVG (or SVG + small React wrapper) | Keep layers separable for later motion |
| Motion | CSS + minimal JS; honor reduced motion; optional path animation on separated SVG nodes | No mandatory heavy animation library |
| Content mixing | MDX (future) for prose + diagram components | Not required for first detector/redesign milestones |
| Asset pipeline | Optimized SVG, hashed static assets; swatch matrices as data → SVG | Budget per article: see §10 |
| Deploy | Existing Vercel/Docker paths | Offline fixture fallback still mandatory for demos |

**Illustration production pipeline (vector-first)**

```
domain research
  → static sketch (clearest still)
  → decide: one-off SVG  OR  reusable instrument (§6A)
  → if instrument: implement math + controls in code; optional editor plugin for mesh/grid generation
  → export / embed as SVG or React island
  → bind viz tokens
  → place at narrative moment + caption (and optional “why this tool” aside — §6B)
```

**Explicit non-goals for v1 implementation:** adopting a large charting framework as the default visual language; shipping a plugin marketplace; depending on proprietary design-tool plugins at **runtime** in production pages (build-time authoring plugins are fine; the shipped page should not require them).

---

## 6A. Reusable visualization instruments (tool-building over one-offs)

High-end visual-textbook craft often invests in **small instruments** that encode a concept once, then reuse them across figures and articles. Building the tool is part of the pedagogy: readers see not only the result, but why a dedicated instrument beats a stack of disconnected drawings.

### 6A.1 Process stance

| Prefer | Avoid |
|---|---|
| A parameterized tool with 1–3 meaningful controls | Redrawing the same system from scratch per section |
| Orthographic, readable geometry over cinematic perspective | Decorative 3-D that obscures the teaching claim |
| Separable vector layers (structure / highlight / labels) | Flattened bitmaps that cannot be restyled to page tokens |
| Explaining *why the instrument exists* near first use | Silent widgets with no pedagogical framing |
| Deterministic math (quantization, kernels, grids) | Fake “AI palette” vibes without an algorithm |

**Build-vs-draw decision:** If you would redraw a variant more than twice, stop and build an instrument.

### 6A.2 Instrument catalog (planned reference set)

These are **internal** demo/fixture capabilities for Visual textbook surfaces—not a public product suite. Names below are descriptive only.

#### I1 — Median-cut / color-space quantizer (interactive 3-D)

| Field | Spec |
|---|---|
| Teaching claim | Readers see how an image’s colors occupy a space and how a limited palette is carved from that cloud |
| Input | A demo raster (e.g. a single photographic subject with rich hue variation) |
| View | Interactive 3-D color-space point cloud (rotate / orbit); orthographic optional toggle |
| Algorithm | Median-cut (or clearly labeled sibling) quantization into *N* palette slots |
| Controls (≤3) | Palette size *N*; projection mode (RGB / other labeled space); maybe “show cut planes” |
| Output | Quantized swatches + optional recolored preview; cuts visible in the cloud |
| Fidelity | L3 or L2+L4 hybrid (WebGL/Canvas cloud + SVG/DOM swatches and labels) |
| a11y | Non-visual summary of palette hex/roles; reduced-motion → static cloud + swatches |
| Token binding | Swatch strokes/labels use `--viz-*`; page stays monochrome so the cloud carries color |

#### I2 — Orthographic 3-D wireframe / mesh generator

| Field | Spec |
|---|---|
| Teaching claim | Spatial structure (grids, lattices, device frames, waveform cages) can be constructed precisely and reused as vectors |
| Behavior | Generate rotatable **orthographic** wireframe grids/meshes; lock angle presets (iso-ish teaching angles) |
| Authoring path | Optional **editor plugin** generates meshes and imports them as editable vectors into the design canvas |
| Web path | Export SVG paths with stable layer IDs; React wrapper may re-enable scrub of yaw/pitch within a safe range |
| Controls | Density (divisions); yaw/pitch within orthographic presets; show/hide axes |
| Why orthographic | Preserves parallel lines and measurable relationships; perspective often lies for teaching |
| Fidelity | L0/L1 for shipped articles; plugin is build-time |

#### I3 — Color palette grids (swatch matrices)

| Field | Spec |
|---|---|
| Teaching claim | Palettes are systems—arranged, compared, and constrained—not a pile of pretty chips |
| Variants | Large swatch matrices; grayscale ramps; multi-hue grids; stepped vs continuous |
| Generation | Data-driven SVG/React from token lists or algorithmically sampled hues |
| Layout | Strict grid rhythm aligned to page spacing scale; hairline gutters; mono labels for hex/roles |
| Interaction (optional) | Hover/focus to pin a swatch; toggle grayscale; highlight WCAG pairs against paper/ink |
| Anti-pattern | Rainbow marketing legends; unordered free-float chips; low-contrast labels on mid swatches |

#### I4 — Voxel / height-map and convolution visualizers

| Field | Spec |
|---|---|
| Teaching claim A | Discrete spatial samples (voxels / height fields) make structure inspectable |
| Teaching claim B | Convolution kernels transform neighborhoods; seeing the kernel and the field together teaches the operator |
| Views | Height-map or voxel-style 3-D representation; paired 2-D kernel matrix with highlighted cell |
| Controls | Kernel preset (blur / sharpen / edge — labeled); one scrubbable kernel weight; exaggeration of height |
| Fidelity | L2/L3 for the field; L1 SVG/DOM for the kernel matrix (accessible table) |
| Accuracy | State simplifications (“toy kernel”, “height exaggerated 4×”) in captions |

### 6A.3 Shared instrument requirements

Every instrument in the catalog must:

1. Ship a **home still** that teaches without interaction.
2. Expose ≤3 parameters (§3.4).
3. Inherit viz tokens (§8) and Visual textbook chrome rules.
4. Provide a one-paragraph **“why this instrument”** aside for first introduction (§6B).
5. Pass §10 performance and §12 quality bars.
6. Remain usable if WebGL fails (static SVG/Canvas fallback or swatch-only mode).

### 6A.4 Editor-plugin lane (build-time only)

Some geometry is faster to author as a **design-canvas plugin** (grids, orthographic meshes, repetitive waveform cages) and then export:

| Stage | Rule |
|---|---|
| Author | Plugin generates precise, repetitive, or math-driven vectors |
| Human | Composes labels, crops, narrative framing; never ships raw plugin defaults unedited |
| Export | Optimized SVG; preserve separability of elements for motion |
| Runtime | Page does not load the plugin; only exported assets + optional light React scrubbers |
| AI assist | Models may help *write plugin code*; they must not invent the final illustration without human craft |

---

## 6B. Narrative interleaving — explain the instrument, not only the topic

Visual-textbook articles should occasionally interleave **short “why we built this tool” segments** with the primary domain explanation.

| Pattern | Purpose |
|---|---|
| Topic figure | Teaches the subject (color quantization, filters, layout systems, …) |
| Tool aside | Teaches why a reusable instrument beat one-off drawings for this idea |
| Return to topic | Applies the instrument to the next claim |

**Copy rules (critic / educator voice)**

- Keep asides short (≈1 short section or a caption block + still).
- Focus on the decision (“median-cut needed a rotatable cloud; redrawing cuts by hand hid the algorithm”).
- Do not turn the article into a tooling diary; cap at roughly one tool-aside per major instrument introduction.
- No vendor, author, or site names—describe the capability.

**Tell product angle:** detectors may later flag “illustration starvation”; redesign notes may suggest “introduce a reusable figure instrument for recurring diagram families.” Execution remains human-applied.

---

## 7. Craft workflow (per figure)

Mandatory sequence — do not skip to interaction.

### Phase A — Domain

1. Research the real mechanism until the team can explain it without slides.
2. Write the teaching claim in one sentence (“Readers should leave knowing X”).
3. List misconceptions the figure must prevent.
4. Decide **draw once** vs **build instrument** (§6A.1).

### Phase B — Static clarity

1. Sketch on paper or in a vector tool.
2. Produce the clearest static diagram (SVG) that teaches claim X — even if the final form will be interactive.
3. Label in the article’s voice; remove any label that prose already made unnecessary — or remove the prose.
4. Validate against reference equations or authoritative domain sources; note simplifications in caption.

### Phase C — Interaction selection

1. Identify 1–3 parameters that change understanding when manipulated.
2. Reject parameters that only entertain.
3. Design control placement that does not cover labels at default values.
4. Define the “home” state (first paint) as the most instructive still.

### Phase D — Implementation

1. Implement at the lowest fidelity level (§5) that preserves accuracy — or implement the §6A instrument if reuse is justified.
2. If using an editor plugin, export vectors and re-bind tokens; do not leave plugin chrome in the article.
3. Bind colors/type/stroke to page tokens.
4. Add keyboard + reduced-motion paths.
5. Draft the tool-aside if this is the instrument’s first appearance (§6B).
6. Test with someone who does not already know the topic: can they answer claim X after using only the figure + caption?

### Phase E — Integration

1. Place the figure at the narrative moment of need.
2. Ensure preceding prose sets up what to look for; following prose deepens, does not re-describe.
3. Dogfood: run Tell diagnose on the page; Visual textbook direction should not fight the figure styles.

---

## 8. Visual language system (diagram tokens)

When implementation begins, freeze a small token set shared by all explainer figures:

```text
--viz-ink              /* primary strokes / labels */
--viz-ink-muted        /* secondary annotations */
--viz-paper            /* figure background (usually page paper) */
--viz-accent           /* sparse highlight */
--viz-accent-soft      /* washes, selection */
--viz-stroke-hair      /* 1px hairline at 1x */
--viz-stroke-body      /* 1.5–2px structure */
--viz-stroke-emphasis  /* 2.5–3px focus path */
--viz-label-size       /* 12–14px desktop */
--viz-mono             /* parameter readouts */
--viz-radius           /* 0–2px; almost never pill */
--viz-focus            /* keyboard focus ring for controls */
```

**Consistency rules**

- Same arrowhead, dimension line, and callout styles within an article family.
- Dash patterns mean the same thing everywhere (e.g. hidden edges vs motion paths).
- Z-index: structure → highlights → labels → controls.
- Never reuse marketing card shadows on figures.

---

## 9. Tell product integration map

### 9.1 Already shipped (adjacent)

| Piece | Location | Role |
|---|---|---|
| Visual textbook art direction | `packages/redesign` `explainer`, `packages/taste` presets | Page-level tokens, column, chrome restraint |
| Voice parsing keywords | `parse-direction.ts` | Maps education(al)/blog/diagram/how-it-works/book language → explainer |
| UI chip | Tell Report preset chips | Manual selection |

### 9.2 Planned workstreams

Workstreams are sequenced; later ones depend on earlier contracts freezing.

#### W0 — Policy & docs (this document)

- [x] Principles, patterns, fidelity ladder, workflow
- [x] Link from `PLAN.md` inventory + docs authority rule
- [x] Instrument catalog + vector pipeline + tool-aside narrative (§6A–6B)
- [ ] Copy bank additions in `USER_STORY.md` for educational captures (critic voice; no third-party names)

#### W1 — Detection for educational surfaces

Extend deterministic detectors (or corpus expectations) to name tells that matter on long-form educational pages:

| Candidate tell | Signal (sketch) | Severity |
|---|---|---|
| Reading column too wide | Main text measure ≫ 75ch / content max > ~800px with article-like density | medium |
| Chrome over content | Multiple sticky bars, sidebar TOC + promo, dense header CTAs | medium |
| Illustration starvation | Long article DOM with near-zero figures/SVG/canvas vs prose length | medium |
| Decoration-as-cards | Many equal shadow cards in article body | medium |
| Widget chrome | Interactive regions with heavy borders/shadows/pill controls mismatched to body type | low–medium |
| Rainbow diagram legend | ≥4 saturated categorical colors in a figure without structural labels | low |

DoD: golden fixtures for at least one educational “before” page; vitest green; zero LLM in core.

#### W2 — Redesign recipe deepening for `explainer`

- [ ] Figure-oriented layout notes in `directionNotes` (breakout width, caption style)
- [ ] Stronger “no card elevation in article body” recipe rules
- [ ] Optional caption/figcaption styling in emitted CSS
- [ ] Ensure dark paper variant remains contrast-safe if enabled later (today’s recipe is light cool paper)

DoD: reconcile distinctness tests still pass; educational fixture after-score improves without harming SaaS fixtures.

#### W3 — Diagram primitive kit (optional stretch)

Ship a minimal internal kit for demos/fixtures — not a public framework:

- `Figure` shell (frame, caption, optional chrome-free control row)
- `Callout`, `Dimension`, `PartHighlight` SVG helpers
- `ParamScrub` control bound to CSS variables or React state
- `PaletteGrid` (I3) data→SVG swatch matrices with grayscale / multi-hue modes
- One reference interactive figure in `fixtures/` used by demo narrative

DoD: kit uses viz tokens; keyboard + reduced-motion; Tell dogfood on the fixture page reports zero product tells on Tell itself (fixture may still be labeled input).

#### W4 — MDX / article pipeline (stretch)

- MDX pages mixing prose + diagram components
- Asset optimization script for SVG (preserve separable layers)
- Static export path for offline demo reliability
- Optional build-time mesh/grid generator scripts (I2) that emit SVG into `fixtures/`

#### W5 — Advanced instruments lane (future)

- I1 median-cut color-space quantizer (interactive 3-D cloud + swatches)
- I2 orthographic wireframe scrubber (runtime) atop exported vectors
- I4 voxel / height-map + convolution kernel pair
- Shared math utilities; WebGL only with accuracy + performance budgets
- Tool-aside MDX partial for §6B narrative interleaving
- Still inherits viz tokens and minimal chrome rules
- Graceful fallback when WebGL unavailable

---

## 10. Performance budgets

| Budget | Target |
|---|---|
| First interactive figure ready | ≤ 2.5s on mid-tier laptop, local fixture |
| Per-figure asset weight (static SVG) | ≤ 150KB optimized; prefer ≪ 50KB |
| Active WebGL figure | Sustain 60fps at desktop demo size; degrade gracefully |
| Simultaneous WebGL figures | Prefer 1 on-screen; pause offscreen |
| Layout shift | Figures reserved via width/height or aspect-ratio boxes |
| Prefer | System/font-display swap already handled by redesign font imports |

---

## 11. Accuracy & ethics bar

1. **Accuracy first** — diagrams are technically correct simplifications, not vibes.
2. **Name the simplification** in caption when geometry, dimensions, or physics are reduced.
3. **No false precision** — do not show readouts more precise than the model.
4. **Domain humility** — if the team cannot validate a mechanism, ship a clearer static schematic or cut the figure.
5. **No scraped branding** — do not reproduce third-party article layouts, trademarks, or distinctive character assets. Principles only.

---

## 12. Quality bar (definition of done per figure)

A figure is done only when all are true:

- [ ] Teaching claim X is answerable from figure + caption alone
- [ ] Static still (home state) is intelligible without interaction
- [ ] At most 3 interactive parameters, each justified
- [ ] Tokens match page viz/explainer system
- [ ] Keyboard operable; focus visible; reduced-motion path verified
- [ ] Contrast and label size pass desktop and mobile checks
- [ ] No marketing-card chrome; no rainbow default palette
- [ ] Simplifications stated
- [ ] Performance budget held
- [ ] Reviewed by someone outside the author set

---

## 13. Anti-patterns (reject in review)

1. Hero marketing collage instead of a teaching figure
2. Equal-weight card grids of “concepts” with icons
3. Diagrams as stock illustrations with no labels
4. Interaction that only animates without changing a variable of meaning
5. Second design system inside the widget (different fonts, pill CTAs, drop shadows)
6. Hover-only essential information
7. Autoplay motion competing with reading
8. Warm-cream + terracotta + serif default applied as a substitute for real diagram craft
9. Dense simultaneous callouts that collide at mobile widths
10. Mentions of external authors, sites, or projects as style shortcuts in code or docs
11. One-off redraws of the same system after the second variant (build an instrument instead)
12. Runtime dependency on design-canvas plugins
13. Cinematic perspective wireframes when orthographic would teach more clearly
14. Tooling diaries that drown the domain lesson (cap tool-asides)

---

## 14. Testing strategy

| Layer | What to test |
|---|---|
| Unit | Token resolution; param scrub clamping; reduced-motion branch |
| Detector golden | Educational fixture captures → expected tells |
| Redesign | `explainer` sheet distinctness + contrast guards |
| Visual | Screenshot stills of home + extreme parameter states (fixture) |
| a11y | Keyboard path; name/role/value for controls |
| Demo | Offline fallback still works if interactive figure fails to hydrate |

---

## 15. Documentation & naming rules

1. Refer to the style as **Visual textbook**, **explainer**, or **illustration-first educational** — never by external product or personal names.
2. Do not add brand names, author names, or site hostnames to keywords, aliases, fixtures, or comments.
3. Commit messages and PR bodies for this workstream follow the same rule.
4. If a reference link is required for research, keep it in private notes — not in the repo.

---

## 16. Milestone checklist (implementation order)

### M-V1 — Plan freeze

- [x] This document landed
- [x] Docs authority + `PLAN.md` inventory link
- [x] Scrub repo of third-party style-name keywords in code
- [x] Cross-link design methods plan (`docs/08_AI_DESIGN_METHODS.md`) for how Visual textbook is steered (compose-first)

### M-V2 — Educational corpus + detectors

- [ ] Fixture article page with planted educational tells
- [ ] Detector signals from §9.2 W1
- [ ] Manifest + golden tests

### M-V3 — Explainer redesign deepening

- [ ] Recipe/layout notes for figures and captions
- [ ] Reconciliation demos on educational fixture
- [ ] Copy bank lines for Priya on educational captures

### M-V4 — Reference figure kit

- [ ] `Figure` shell + tokens
- [ ] `PaletteGrid` (I3) in fixtures
- [ ] One interactive L1 diagram in fixtures
- [ ] a11y + performance budgets measured

### M-V5 — Optional MDX article demo

- [ ] Long-form page using kit
- [ ] One §6B tool-aside segment in the demo article
- [ ] Demo beat: capture → diagnose → Visual textbook → seam → draft fix

### M-V6 — Advanced instruments (stretch)

- [ ] I1 median-cut color-space fixture (with WebGL fallback)
- [ ] I2 orthographic wireframe export path (build-time script or plugin → SVG)
- [ ] I4 voxel/convolution pair fixture
- [ ] Document instrument DoD checklist satisfied for each

---

## 17. Agent routing

| Work | Agent / skill |
|---|---|
| Detectors + fixtures | `@core-engineer`, `@fixture-smith`, `tell-detector-authoring`, `tell-demo-fixture` |
| Explainer recipe / reconcile | `@redesign-engineer`, `tell-redesign-diff` |
| Voice / preset copy | `@taste-engineer`, `@ux-copywriter` |
| Figure UI primitives | `@ui-builder` |
| Color/mesh/kernel instruments | `@ui-builder` + `@core-engineer` (math purity); keep LLM out of core math |
| Demo narrative beat | `@demo-director` |

Model routing follows `ORCHESTRATION.md`. Prefer deterministic work in core/redesign; reserve models for copy and optional taste refinement.

---

## 18. Open questions

1. Should Visual textbook offer an explicit **dark paper** recipe variant for diagram-heavy articles, or stay light-cool only until contrast tooling is dark-aware end-to-end?
2. Do educational tells belong as new detector IDs or as specialized evidence under existing layout/depth detectors?
3. Is the diagram kit a package (`packages/viz`) or fixture-only until a second consumer appears?
4. How far should `/api/redesign` go in emitting **caption/figure CSS** versus only page tokens?
5. Which instrument ships first after `PaletteGrid` — I1 (color-space) or I2 (wireframe) — given demo narrative needs?
6. Should editor plugins live in a private authoring repo, or as `packages/viz/plugins` never loaded by `apps/web`?

Resolve these before M-V3 / M-V6 implementation forks.

---

## 19. Success metrics

| Metric | Target |
|---|---|
| Educational fixture tells named | ≥ 3 distinct educational tells with stable goldens |
| Explainer apply on fixture | Genericness score improves; reading column ≤ ~720px in after CSS |
| Reference interactive figure | Passes §12 checklist |
| Instrument reuse rule | Recurring diagram families use §6A instruments, not one-off redraws |
| Repo hygiene | Zero third-party author/site names in style keywords or docs for this workstream |
| Demo reliability | Offline report path unaffected; WebGL instruments degrade to stills |

---

## 20. One-page summary

**Visual textbook surfaces teach with figures.** Quiet book column, monochrome page, sparse accent, diagrams at the moment of need, interaction only when it changes understanding, same tokens as the prose.

Prefer **reusable instruments** (color-space quantization, orthographic wireframes, palette grids, voxel/convolution views) over one-off drawings when concepts recur—and occasionally explain *why the instrument exists*. Author precise vectors in a design canvas (plugins at build time); ship SVG/React islands at runtime. Detectors and redesign depth first; figure kit next; advanced instruments when fixtures need them. Never auto-apply. Never name external style referents in the repo.
