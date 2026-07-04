import { CapturePayload, DesignFingerprint, Finding } from "@tell/schema";
import { hexToRgb, saturation } from "../fingerprint/build-fingerprint";

const evidence = (label: string, value: string, selector?: string) => [{ kind: "computed" as const, label, value, selector }];

function lightness(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const [r, g, b] = rgb.map((v) => v / 255) as [number, number, number];
  return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
}

function pxNumbers(paddingValues: string[]): number[] {
  return paddingValues.flatMap((p) => (p.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number));
}

export function detectFindings(fingerprint: DesignFingerprint, capture: CapturePayload): Finding[] {
  const findings: Finding[] = [];
  const totalFonts = fingerprint.fontFamilies.reduce((sum, f) => sum + f.count, 0) || 1;
  const primaryFont = fingerprint.fontFamilies[0];
  const primaryFontRatio = primaryFont ? primaryFont.count / totalFonts : 0;

  if (primaryFont && primaryFontRatio >= 0.75 && /inter|system-ui|arial/i.test(primaryFont.family)) {
    findings.push(Finding.parse({
      id: "tell-system-font",
      family: "tell",
      detector: "SystemFontTell",
      verdictHint: "generic",
      severity: "high",
      facts: { family: primaryFont.family, ratio: primaryFontRatio, roles: primaryFont.roles },
      evidence: evidence("Primary typeface", primaryFont.family),
    }));
  }

  if (fingerprint.gradientDetected) {
    findings.push(Finding.parse({
      id: "tell-gradient-crutch",
      family: "tell",
      detector: "GradientCrutchTell",
      verdictHint: "generic",
      severity: "medium",
      facts: { gradientSamples: fingerprint.gradientSamples },
      evidence: evidence("Hero gradient", fingerprint.gradientSamples[0] ?? "gradient"),
    }));
  }

  const dominantShadow = fingerprint.shadows.find((s) => s.value !== "none");
  if (dominantShadow && dominantShadow.count >= Math.max(3, capture.styles.length * 0.35)) {
    findings.push(Finding.parse({
      id: "tell-shadow-everywhere",
      family: "tell",
      detector: "ShadowEverywhereTell",
      verdictHint: "generic",
      severity: "medium",
      facts: { shadow: dominantShadow.value, count: dominantShadow.count },
      evidence: evidence("Repeated shadow", dominantShadow.value),
    }));
  }

  const dominantRadius = fingerprint.radii.find((r) => r.value !== "0px");
  if (dominantRadius && dominantRadius.count >= Math.max(5, capture.styles.length * 0.5)) {
    findings.push(Finding.parse({
      id: "tell-radius-monotone",
      family: "tell",
      detector: "RadiusMonotoneTell",
      verdictHint: "generic",
      severity: "medium",
      facts: { radius: dominantRadius.value, count: dominantRadius.count },
      evidence: evidence("Repeated radius", dominantRadius.value),
    }));
  }

  if (fingerprint.emojiInUiCount >= 3) {
    findings.push(Finding.parse({
      id: "tell-emoji-chrome",
      family: "tell",
      detector: "EmojiChromeTell",
      verdictHint: "generic",
      severity: "low",
      facts: { count: fingerprint.emojiInUiCount },
      evidence: [{ kind: "dom", label: "Emoji in UI chrome", value: String(fingerprint.emojiInUiCount) }],
    }));
  }

  if (fingerprint.centeredBlockRatio >= 0.7) {
    findings.push(Finding.parse({
      id: "tell-centered-everything",
      family: "tell",
      detector: "CenteredEverythingTell",
      verdictHint: "generic",
      severity: "medium",
      facts: { ratio: fingerprint.centeredBlockRatio },
      evidence: [{ kind: "dom", label: "Centered layout ratio", value: fingerprint.centeredBlockRatio.toFixed(2) }],
    }));
  }

  if (fingerprint.nearDuplicateGrays.length > 0) {
    findings.push(Finding.parse({
      id: "tell-gray-mush",
      family: "tell",
      detector: "GrayMushTell",
      verdictHint: "generic",
      severity: "medium",
      facts: { clusters: fingerprint.nearDuplicateGrays },
      evidence: evidence("Near-duplicate grays", fingerprint.nearDuplicateGrays[0]?.values.join(", ") ?? ""),
    }));
    findings.push(Finding.parse({
      id: "drift-near-duplicate-values",
      family: "drift",
      detector: "NearDuplicateValues",
      verdictHint: "drift",
      severity: "medium",
      facts: { clusters: fingerprint.nearDuplicateGrays },
      evidence: evidence("Duplicate neutral values", fingerprint.nearDuplicateGrays[0]?.values.join(", ") ?? ""),
    }));
  }

  if (fingerprint.focusRingCoverage < 0.5) {
    findings.push(Finding.parse({
      id: "drift-focus-ring",
      family: "drift",
      detector: "FocusRingInconsistency",
      verdictHint: "drift",
      severity: "high",
      facts: { focusRingCoverage: fingerprint.focusRingCoverage },
      evidence: [{ kind: "probe", label: "Focus ring coverage", value: fingerprint.focusRingCoverage.toFixed(2) }],
    }));
  }

  if (fingerprint.typeScale.length >= 6) {
    findings.push(Finding.parse({
      id: "drift-type-scale",
      family: "drift",
      detector: "TypeScaleDrift",
      verdictHint: "drift",
      severity: "medium",
      facts: { sizes: fingerprint.typeScale.map((s) => s.size) },
      evidence: evidence("Type sizes", fingerprint.typeScale.map((s) => s.size).join(", ")),
    }));
  }

  if (fingerprint.spacingValues.length >= 8) {
    findings.push(Finding.parse({
      id: "drift-spacing-chaos",
      family: "drift",
      detector: "SpacingChaos",
      verdictHint: "drift",
      severity: "medium",
      facts: { values: fingerprint.spacingValues.map((s) => s.value) },
      evidence: evidence("Spacing values", fingerprint.spacingValues.map((s) => s.value).join(", ")),
    }));
  }

  if (fingerprint.stateCoverage.hover < 0.6 || fingerprint.stateCoverage.disabled < 0.2) {
    findings.push(Finding.parse({
      id: "drift-state-gap",
      family: "drift",
      detector: "StateGap",
      verdictHint: "drift",
      severity: "high",
      facts: { stateCoverage: fingerprint.stateCoverage },
      evidence: [{ kind: "probe", label: "State coverage", value: JSON.stringify(fingerprint.stateCoverage) }],
    }));
  }

  // AcidAccentTell — a single high-saturation accent on a near-black surface.
  const darkSurface = fingerprint.colors.find((c) => lightness(c.normalizedHex) < 0.2);
  const acidAccent = fingerprint.colors.find((c) => {
    const rgb = hexToRgb(c.normalizedHex);
    return rgb ? saturation(rgb) > 0.7 && lightness(c.normalizedHex) > 0.2 : false;
  });
  if (darkSurface && acidAccent) {
    findings.push(Finding.parse({
      id: "tell-acid-accent",
      family: "tell",
      detector: "AcidAccentTell",
      verdictHint: "generic",
      severity: "medium",
      facts: { accent: acidAccent.normalizedHex, usageCount: acidAccent.count, surface: darkSurface.normalizedHex },
      evidence: evidence("Acid accent on near-black", `${acidAccent.normalizedHex} on ${darkSurface.normalizedHex}`),
    }));
  }

  // TokenBypass — repeated one-off spacing literals that ignore the 4px grid.
  const offGrid = Array.from(new Set(pxNumbers(fingerprint.spacingValues.map((s) => s.value)))).filter(
    (n) => n !== 0 && n % 4 !== 0,
  );
  if (offGrid.length >= 3) {
    findings.push(Finding.parse({
      id: "drift-token-bypass",
      family: "drift",
      detector: "TokenBypass",
      verdictHint: "drift",
      severity: "medium",
      facts: { offGridValues: offGrid, gridBase: 4 },
      evidence: evidence("Off-grid spacing literals", offGrid.map((n) => `${n}px`).join(", ")),
    }));
  }

  return findings;
}
