import { z } from "zod";

/** The rendered role of a sampled element — lets the redesign engine target it precisely. */
export const ElementRole = z.enum([
  "display",  // hero headline / largest type
  "heading",  // section headings
  "body",     // paragraph / running text
  "button",   // buttons + CTA-ish links
  "link",     // inline / nav links
  "card",     // panels, cards, feature tiles (surfaces that may float)
  "surface",  // large section/background containers
  "nav",      // top-level navigation container
  "input",    // form controls
  "other",
]);
export type ElementRole = z.infer<typeof ElementRole>;

export const ComputedStyleSample = z.object({
  selector: z.string(),
  // Unique handle stamped on the live element during capture (survives into snapshotHtml),
  // so the redesign can restyle THIS exact element via [data-tell-id="…"] — no selector guessing.
  tellId: z.string().default(""),
  tag: z.string().default(""),
  role: ElementRole.default("other"),
  rect: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).optional(),
  fontFamily: z.string(),
  fontSize: z.string(),
  fontWeight: z.string(),
  color: z.string(),
  backgroundColor: z.string(),
  borderRadius: z.string(),
  boxShadow: z.string(),
  padding: z.string(),
  textAlign: z.string(),
  lineHeight: z.string(),
  backgroundImage: z.string().default("none"),
});
export type ComputedStyleSample = z.infer<typeof ComputedStyleSample>;

export const InteractiveProbe = z.object({
  role: z.string(),
  selector: z.string(),
  hasHoverDiff: z.boolean(),
  hasFocusVisibleDiff: z.boolean(),
  hasDisabledAttr: z.boolean(),
  ariaDisabled: z.boolean(),
});
export type InteractiveProbe = z.infer<typeof InteractiveProbe>;

/** Small element clip captured in default, hover, or focus-visible state. */
export const StateProbeShot = z.object({
  selector: z.string(),
  state: z.enum(["default", "hover", "focus"]),
  imageBase64: z.string(),
});
export type StateProbeShot = z.infer<typeof StateProbeShot>;

export const CssVariable = z.object({ name: z.string(), value: z.string() });
export type CssVariable = z.infer<typeof CssVariable>;

/** The page's *actual* rendered tokens, sampled directly from the DOM. */
export const SurfaceTokens = z.object({
  bodyBg: z.string(),
  bodyText: z.string(),
  bodyFont: z.string(),
  headingFont: z.string(),
  accent: z.string(),                       // computed color/rgb of the dominant accent
  accentSources: z.array(z.string()).default([]), // every accent-ish color found (to remap)
  radius: z.string(),
  shadow: z.string(),
});
export type SurfaceTokens = z.infer<typeof SurfaceTokens>;

/** Named breakpoints in the multi-viewport capture matrix (desktop is the primary capture). */
export const ViewportPreset = z.enum(["desktop", "tablet", "mobile"]);
export type ViewportPreset = z.infer<typeof ViewportPreset>;

export const ViewportMatrixEntry = z.object({
  preset: ViewportPreset,
  width: z.number(),
  height: z.number(),
  screenshotBase64: z.string(),
  domSummary: z.object({
    headingCount: z.number(),
    buttonCount: z.number(),
    centeredBlockRatio: z.number(),
    emojiInUiCount: z.number(),
  }),
});
export type ViewportMatrixEntry = z.infer<typeof ViewportMatrixEntry>;

/** Color scheme for scenario-matrix captures (`page.emulateMedia({ colorScheme })`). */
export const ColorTheme = z.enum(["light", "dark"]);
export type ColorTheme = z.infer<typeof ColorTheme>;

/** Page-level interaction state for a scenario cell (element clips stay on StateProbeShot). */
export const InteractionState = z.enum(["default", "hover", "focus"]);
export type InteractionState = z.infer<typeof InteractionState>;

/**
 * Auth dimension for scenario cells.
 * Authenticated captures load a Playwright storage state (cookies / localStorage)
 * from `TELL_AUTH_STORAGE_STATE` or `CaptureUrlOptions.storageState` — no product login UI.
 */
export const AuthRole = z.enum(["anonymous", "authenticated"]);
export type AuthRole = z.infer<typeof AuthRole>;

/** One cell in the proof scenario matrix: route × viewport × theme × interaction (± auth). */
export const CaptureScenario = z.object({
  id: z.string(),
  route: z.string(),
  viewport: ViewportPreset,
  theme: ColorTheme.default("light"),
  interaction: InteractionState.default("default"),
  authRole: AuthRole.default("anonymous"),
});
export type CaptureScenario = z.infer<typeof CaptureScenario>;

export const CapturePayload = z.object({
  url: z.string(),
  capturedAt: z.string(),
  viewport: z.object({ width: z.number(), height: z.number() }),
  screenshotBase64: z.string(),
  // A sanitized, re-renderable snapshot of the page (scripts stripped, same-origin
  // CSS inlined, <base> injected). Enables a *true* before/after restyle, not a filter.
  snapshotHtml: z.string().default(""),
  cssVariables: z.array(CssVariable).default([]),
  surfaceTokens: SurfaceTokens.optional(),
  styles: z.array(ComputedStyleSample),
  probes: z.array(InteractiveProbe),
  stateShots: z.array(StateProbeShot).default([]),
  /** Tablet + mobile captures for responsive drift checks; desktop lives in the primary fields above. */
  viewportMatrix: z.array(ViewportMatrixEntry).default([]),
  domSummary: z.object({
    headingCount: z.number(),
    buttonCount: z.number(),
    centeredBlockRatio: z.number(),
    emojiInUiCount: z.number(),
  }),
});
export type CapturePayload = z.infer<typeof CapturePayload>;

export const ScenarioCapture = z.object({
  scenario: CaptureScenario,
  capture: CapturePayload,
});
export type ScenarioCapture = z.infer<typeof ScenarioCapture>;

export const ScenarioMatrix = z.object({
  baseUrl: z.string(),
  capturedAt: z.string(),
  cells: z.array(ScenarioCapture),
});
export type ScenarioMatrix = z.infer<typeof ScenarioMatrix>;

export const ProofCellResult = z.object({
  scenarioId: z.string(),
  status: z.enum(["passed", "review", "failed", "skipped"]),
  beforeScore: z.number(),
  afterScore: z.number(),
  scoreDelta: z.number(),
  focusRegressed: z.boolean(),
  structureRegressed: z.boolean(),
  screenshotsDiffer: z.boolean(),
  error: z.string().optional(),
});
export type ProofCellResult = z.infer<typeof ProofCellResult>;

export const ProofMatrixResult = z.object({
  status: z.enum(["passed", "review", "failed"]),
  cells: z.array(ProofCellResult),
  url: z.string(),
  capturedAt: z.string(),
  matchedCells: z.number(),
  skippedCells: z.number(),
});
export type ProofMatrixResult = z.infer<typeof ProofMatrixResult>;

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
  focusRingCoverage: z.number(),
  stateCoverage: z.object({
    hover: z.number(),
    focus: z.number(),
    disabled: z.number(),
  }),
});
export type DesignFingerprint = z.infer<typeof DesignFingerprint>;

export const Verdict = z.enum(["generic", "drift", "intentional", "uncertain"]);
export type Verdict = z.infer<typeof Verdict>;

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
export type TellDetector = z.infer<typeof TellDetector>;

export const DriftDetector = z.enum([
  "TokenBypass",
  "NearDuplicateValues",
  "FocusRingInconsistency",
  "TypeScaleDrift",
  "SpacingChaos",
  "StateGap",
  "DesignSystemDrift",
  "ResponsiveViewportDrift",
]);
export type DriftDetector = z.infer<typeof DriftDetector>;

export const Evidence = z.object({
  kind: z.enum(["computed", "screenshot-region", "dom", "probe"]),
  label: z.string(),
  value: z.string(),
  selector: z.string().optional(),
  region: z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number() }).optional(),
});
export type Evidence = z.infer<typeof Evidence>;

export const Finding = z.object({
  id: z.string(),
  family: z.enum(["tell", "drift"]),
  detector: z.union([TellDetector, DriftDetector]),
  verdictHint: Verdict,
  facts: z.record(z.any()),
  evidence: z.array(Evidence),
  severity: z.enum(["high", "medium", "low"]).default("medium"),
});
export type Finding = z.infer<typeof Finding>;

export const TasteVerdict = z.object({
  findingId: z.string(),
  verdict: Verdict,
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
  intentionalReason: z.string().optional(),
});
export type TasteVerdict = z.infer<typeof TasteVerdict>;

export const ArtDirection = z.object({
  id: z.string(),
  label: z.string(),
  keywords: z.array(z.string()),
  tokenOverrides: z.record(z.string()),
  summary: z.string(),
});
export type ArtDirection = z.infer<typeof ArtDirection>;

/**
 * One axis of the 6-axis genericness scorecard (docs/05_GENERICNESS_METHODOLOGY.md §8).
 * `before`/`after` are 0..1 QUALITY sub-scores (1 = best). Genericness inverts them.
 */
export const ScoreAxis = z.object({
  key: z.enum(["contrast", "typescale", "spacing", "depth", "accent", "identity"]),
  label: z.string(),
  weight: z.number(),
  before: z.number(),       // 0..1 quality of the captured page
  after: z.number(),        // 0..1 quality after Tell's redesign
  beforeText: z.string(),   // human-readable measured value, e.g. "1 family · Inter"
  afterText: z.string(),
  rationale: z.string(),    // the rule that justifies the move (cites the methodology)
});
export type ScoreAxis = z.infer<typeof ScoreAxis>;

/** 0..100 genericness (LOWER = better) + the axes that produced it. */
export const Scorecard = z.object({
  score: z.number(),        // 0..100 genericness, lower is better
  band: z.enum(["distinctive", "conservative", "template", "slop"]),
  axes: z.array(ScoreAxis),
  tellScore: z.number().default(0),   // 0..1 cliché-flag modifier
  scoredAgainst: z.enum(["baseline", "brand-dna"]).default("baseline"),
});
export type Scorecard = z.infer<typeof Scorecard>;

/**
 * A project's distinctive design fingerprint — learned once (from a reference URL or explicit
 * choices) and used as the TARGET the redesign steers toward and the yardstick the scorecard
 * measures against. When absent, Tell scores against the generic baseline.
 */
export const BrandDNA = z.object({
  displayFont: z.string(),
  bodyFont: z.string(),
  monoFont: z.string().default(""),
  accent: z.string(),                 // hex
  radius: z.string().default("8px"),
  spacingBase: z.number().default(8),
  typeScaleRatio: z.number().default(1.25),
  maxElevationLevels: z.number().default(3),
  directionId: z.string().default("editorial"),
  source: z.string().default("manual"),
});
export type BrandDNA = z.infer<typeof BrandDNA>;

/** One before→after token change, grounded in the real captured values. */
export const ReconTokenRow = z.object({
  key: z.string(),
  label: z.string(),
  before: z.string(),
  after: z.string(),
  note: z.string().optional(),
  swatchBefore: z.string().optional(),
  swatchAfter: z.string().optional(),
});
export type ReconTokenRow = z.infer<typeof ReconTokenRow>;

/**
 * A deterministic, page-specific redesign derived from the real fingerprint.
 * `css` is a drop-in override sheet AND the exact CSS injected into the live
 * "after" preview — so the seam shows the real restyle, not a photo filter.
 */
export const Reconciliation = z.object({
  directionId: z.string(),
  label: z.string(),
  summary: z.string(),
  rows: z.array(ReconTokenRow),
  css: z.string(),
  fontImport: z.string().default(""),
  accentBefore: z.string(),
  accentAfter: z.string(),
  surfaceAfter: z.string(),
  textAfter: z.string(),
  // ── measured proof: the number that provably drops ──
  scoreBefore: z.number().default(0),   // 0..100 genericness of captured page
  scoreAfter: z.number().default(0),    // 0..100 genericness after redesign
  axes: z.array(ScoreAxis).default([]), // per-axis before/after
  elementsRestyled: z.number().default(0),
  scoredAgainst: z.enum(["baseline", "brand-dna"]).default("baseline"),
  // ── v2: which engine produced the sheet, and what the direction did (UI bullets) ──
  cssSource: z.enum(["recipes", "llm"]).default("recipes"),
  directionNotes: z.array(z.string()).default([]),
});
export type Reconciliation = z.infer<typeof Reconciliation>;

export const RedesignProposal = z.object({
  id: z.string().optional(),
  findingId: z.string().optional(),
  direction: ArtDirection,
  reconciliation: Reconciliation.optional(),
  files: z.array(z.object({
    file: z.string(),
    unifiedDiff: z.string(),
    summary: z.string(),
  })),
});
export type RedesignProposal = z.infer<typeof RedesignProposal>;

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
  // The captured page's genericness scorecard (before any redesign). See docs/05.
  measures: Scorecard.optional(),
  activeDirection: ArtDirection.optional(),
});
export type TellReport = z.infer<typeof TellReport>;
