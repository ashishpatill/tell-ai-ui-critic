# The Genericness Audit — Methodology

> The rubric Tell encodes. Every threshold here maps to an `if` in `packages/redesign/src/measures.ts`
> and a transform in `packages/redesign/src/restyle.ts`. This is the "research and methodology
> behind the change" — nothing in Tell's redesign is arbitrary; each move cites a rule below.

All thresholds are CSS px and sRGB HSL unless noted. "Usage-weighted" = weighted by element count
(or rendered area where stated), not by count of distinct values.

---

## 1. What reads as "AI-generated / generic" (2024–2026)

The look has a documented origin: Tailwind's demo default `bg-indigo-500` saturated the training
corpus, and Inter is the highest-probability "safe" font. Adam Wathan (Tailwind's creator) publicly
apologized in Aug 2025 for "every AI generated UI on earth… being indigo." The catalogued slop
palette: `#6366F1` (indigo-500, H 239°), `#8B5CF6` (violet-500, H 258°), `#A855F7` (purple-500, H 271°).

| # | Tell | Signature | Flip threshold |
|---|------|-----------|----------------|
| T1 | Default-font monoculture | distinct primary `font-family` after resolving stacks | `familyCount === 1 && family ∈ DEFAULT_SET` (Inter, Roboto, Open Sans, Arial, Helvetica[ Neue], system-ui, -apple-system, Segoe UI). Space Grotesk alone = soft tell (0.5). |
| T2 | Violet→pink hero gradient | gradient with two dominant stops both `S ≥ 60%`, hues in `[230°,340°]`, span `≥ 15°` | ≥1 covering ≥20% of first viewport, or ≥2 anywhere. Gradient-clip text on h1 = auto-flag. |
| T3 | AI-default accent hue | accent `H ∈ [230°,280°] && S ≥ 70% && L ∈ [55%,70%]` | ΔE2000 `< 12` to {indigo,violet,purple}-500 → hard; hue-band alone → soft (0.5). |
| T4 | Shadow on everything | shadowedContainers / totalContainers (container = bg≠page && area≥10 000px²) | `> 0.40` tell; `> 0.60` strong. Considered UIs shadow ≤15%. |
| T5 | Radius monotone 8/12/16 | one non-zero radius covers `>90%` of rounded els, ∈ {8,12,16}, on ≥3 component types | flag. Also `9999px` pills on >50% of buttons. |
| T6 | Everything centered | fraction of `>600px` sections with centered headline block | `> 0.80`. Authored pages ≤ 50%. |
| T7 | Gray mush (5–6 near grays) | neutrals `S < 10%`; count in a 30-pt L band, min pairwise ΔL | `count ≥ 5` in band AND ≥2 pairs `ΔL < 5`. Good ramp: 6–10 steps, adjacent `ΔL ≥ 7`. |
| T8 | Acid/electric accent | accent `S ≥ 85% && L ∈ [50%,65%]` | used on fills >2% area → tell. |
| T9 | Emoji as UI chrome | emoji in h1–h4/button/nav/tabs | `≥ 3` distinct, or ≥1 in a primary CTA. |
| T10 | 3-card feature grid + icon | section of exactly 3–4 equal cards: icon/emoji + heading + ≤40-word para | ≥2 such sections. |
| T11 | Glassmorphism sprinkle | `backdrop-filter: blur()` count | `> 2` outside one overlay/nav context. |
| T12 | Border + shadow double-hedge | els with both `1px solid` border and multi-px shadow | `> 50%` of cards. |

`tellScore = clamp(Σ flag·w / 8, 0, 1)` (hard=1, soft=0.5, w=1).

---

## 2. Modular type scale

Ratios: minor-2nd 1.067, major-2nd 1.125, minor-3rd 1.200, major-3rd 1.250, perfect-4th 1.333,
aug-4th 1.414, perfect-5th 1.500, golden 1.618. Use 1.2–1.25 for app UI, 1.25–1.333 for
editorial/marketing, ≥1.414 only display-heavy. Coherent UI = **5–8 distinct sizes** (≤8 fine,
9–11 drift, ≥12 chaos), after rounding 0.5px and dropping sizes on <2 elements.

`base = mode of body-text font-size in [14,18]` (fallback 16). Body <14px is itself a flag.

Drift, per candidate ratio r and size s: `n = ln(s/base)/ln(r)`, `err = |n − round(n)|`,
`fits = err ≤ 0.15`. `r* = argmax fitFraction(r)`. **type-scale drift = 1 − fitFraction(r*)**.

Snap: `snapped = round(base · r^round(ln(s/base)/ln(r)))`, never below 12px; if two inputs collide
but differed ≥4px, promote the larger one step.

`countFactor = clamp(1 − max(0, distinct−8)·0.12, 0.3, 1)`; **`typeScaleScore = fitFraction(r*)·countFactor`.**

---

## 3. Spacing rhythm

8px base grid, 4px sub-grid. `onGrid(v) = v%4===0 || v≤2`; `gridFraction` usage-weighted over all
margins/padding/gap >0. `≥0.90` disciplined, `0.75–0.90` sloppy, `<0.75` chaos.
`distinctSpacings` (usage ≥2): ≤10 disciplined, ≥16 chaos.

Snap to token set, not just a multiple: `SCALE = [0,2,4,8,12,16,24,32,48,64,96,128]`, nearest, tie up;
`>128 → 32·round(v/32)`.

`countFactor = clamp((16 − distinctSpacings)/6, 0, 1)`; **`spacingScore = 0.7·gridFraction + 0.3·countFactor`.**

---

## 4. Elevation / depth restraint

Tasteful = **2–4 shadow levels + flat**. Ramp (light-from-above, blur≈2·y, spread≤0, alpha 0.04–0.25):

| Level | Use | box-shadow |
|-------|-----|-----------|
| 0 flat | sections, rows, most cards | none (1px neutral border if needed) |
| 1 raised | interactive cards, focused inputs | `0 1px 3px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.06)` |
| 2 overlay | dropdowns, popovers, sticky headers | `0 4px 6px -1px rgba(0,0,0,.10), 0 2px 4px -2px rgba(0,0,0,.10)` |
| 3 modal | dialogs, command palettes, toasts | `0 20px 25px -5px rgba(0,0,0,.10), 0 8px 10px -6px rgba(0,0,0,.10)` |

Float rule: elevate only overlays / opens-on-interaction / draggable; everything else flat.
`k` = distinct shadow signatures, `coverage` = shadowed/all containers.
`countFactor`: k∈[2,4]→1, k∈{1,5}→0.7, k=0→0.5, else `clamp(1−(k−5)·0.15,0,0.7)`.
`coverageFactor = coverage≤0.15 ? 1 : clamp(1−(coverage−0.15)/0.35,0,1)`. **`depthScore = countFactor·coverageFactor`.**

---

## 5. Accent discipline

One signature hue: non-semantic saturated hues (`S≥40%`, excluding status red 0–15°/amber 35–55°/green
130–160°) cluster within ±12° of one primary; >2 clusters = fail. 60-30-10 → accent ≤10% painted area
(≤0.10 disciplined, 0.10–0.20 loud, >0.25 fail); accent *fills* on ≤25% of interactive elements.

HSL bands: electric (avoid fills) S≥85 L50–65; vibrant-considered S55–80 L38–52; deep-authoritative
S45–75 L25–40; dark-UI accent S50–75 L58–72; tint/wash S20–60 L92–97. White-text CTA needs fill
≥4.5:1 vs white → forces L≤~48%, which kills most acid accents.

Harmonize vs replace: brand hue → keep `H±4°`, only move S/L into a band. AI-default match
(`H∈[230,280] && S≥70`, or ΔE<12 to slop) with no brand → rotate hue ≥25°, then band.

`hueFactor`: clusters≤1→1, 2→0.7, else 0.3. `areaFactor = accentAreaPct≤0.10 ? 1 : clamp(1−(pct−0.10)/0.15,0,1)`.
`acidFactor = electric ? 0.4 : 1`. `defaultHuePenalty = matchesAIDefault ? 0.6 : 1`.
**`accentScore = hueFactor·areaFactor·acidFactor·defaultHuePenalty`.**

---

## 6. Hierarchy & contrast

WCAG floors: body ≥4.5:1, large (≥24px, or ≥18.66px/700) ≥3:1, non-text UI ≥3:1; AAA body target 7:1.
Text bands: primary 7–17:1, secondary 4.5–7:1, placeholder 3–4.5:1.

Gray mush: `mushFail_1 = frac body text <4.5`; `mushFail_2 = Cmax/Cmin < 1.5` (no tonal hierarchy);
`mushFail_3 = ≥2 text colors with pairwise ΔL<5`.

Hierarchy `H = (displaySize/bodySize)·(displayWeight/bodyWeight)` (family change ×1.5): ≥3.5 strong,
2.2–3.5 adequate, <2.2 flat. Body line-height 1.4–1.65, headings 1.05–1.3, measure 45–75ch.

`wcagPass` = weighted frac meeting floor; `hierFactor`: ≥3.5→1, ≥2.2→0.7, else 0.4;
`mushFactor = (fail2||fail3) ? 0.6 : 1`. **`contrastScore = wcagPass·mushFactor·0.8 + 0.2·hierFactor`.**
`wcagPass < 0.90` = hard defect regardless of total.

---

## 7. Distinctiveness / type identity

Authored = 2–3 families with distinct roles (display voice + body workhorse + optional mono), display
and body from different classes (or extreme weight/width delta), display weight ≥600 or italic/opsz cut,
not a default-set sole voice.

Curated Google-Fonts pairings:

| Mood | Display | Body | Mono |
|---|---|---|---|
| Editorial / warm | Fraunces 600/900 (opsz) | Public Sans 400/500 | Fragment Mono 400 |
| Modern-editorial minimal | Instrument Serif 400 (+ital) | Instrument Sans 400/500/600 | — |
| Precision / technical | Schibsted Grotesk 700/800 | IBM Plex Sans 400/500 | IBM Plex Mono 400/500 |
| Bold / dramatic | Bricolage Grotesque 700/800 | Figtree 400/500 | JetBrains Mono 400 |
| Classic luxury | Playfair Display 600/700 | Source Sans 3 400/600 | — |
| Warm / human | Lora 500/600 (+ital) | Karla 400/500 | — |
| Brutalist / utilitarian | Archivo Black 400 | Work Sans 400/500 | Space Mono 400/700 |
| Visual textbook / explainer | Source Serif 4 600/700 | Source Sans 3 400/500 | IBM Plex Mono 400/500 |
| Elegant superfamily | DM Serif Display 400 | DM Sans 400/500 | DM Mono 400 |

`familyFactor`: 2–3→1, 1 & non-default→0.6, ≥4→0.5, single default→0.15.
`contrastBonus = classDiffer ? 1 : 0.7`; `commitBonus = displayWeight≥600||italic/opsz ? 1 : 0.8`.
**`identityScore = familyFactor·contrastBonus·commitBonus`.**

---

## 8. The 6-axis genericness score (0–100, lower = better)

| Axis | Source | Weight |
|------|--------|--------|
| Contrast & hierarchy | §6 contrastScore | 0.20 |
| Type-scale coherence | §2 typeScaleScore | 0.15 |
| Spacing discipline | §3 spacingScore | 0.15 |
| Depth restraint | §4 depthScore | 0.15 |
| Accent discipline | §5 accentScore | 0.20 |
| Type identity | §7 identityScore | 0.15 |

```
genericness = 100 · Σ weight·(1 − axisScore)
genericness = min(100, genericness + 12·tellScore)
```

Bands: ≤25 distinctive · 26–45 competent-but-conservative · 46–65 template-grade · >65 AI-slop.
Hard gates: `wcagPass < 0.90` or a T3 hard flag force the redesign path regardless of score.

**Redesign order (each step idempotent, independently testable):** (1) fix WCAG; (2) snap type to ratio;
(3) snap spacing to tokens; (4) collapse shadows to the 4-level ramp + strip from non-floating; (5)
rotate/re-band accent; (6) swap default fonts for a §7 pairing matched to the declared mood.

---

*Sources: WCAG 2.1 (1.4.3/1.4.6/1.4.11); Material Design spacing & elevation; IBM Carbon spacing;
Tim Brown "More Meaningful Typography" (A List Apart); type-scale.com; Bringhurst, Elements of
Typographic Style; Butterick, Practical Typography; Wathan & Schoger, Refactoring UI; Josh Comeau
"Designing Beautiful Shadows"; Spec.fm 8-pt grid; Tailwind default theme; AI-slop teardowns
(prg.sh, 925studios, vibecodekit, superdesign.dev, DEV Community).*
