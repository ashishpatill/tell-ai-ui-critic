import type { DesignFingerprint, Finding } from "@tell/schema";
import { Finding as FindingSchema } from "@tell/schema";

export type DesignDocSpec = {
  fonts: string[];
  colors: string[];
  source: string;
};

/** Parse a simple DESIGN.md for declared fonts and hex colors. */
export function parseDesignDoc(content: string): DesignDocSpec {
  const fonts = new Set<string>();
  const colors = new Set<string>();

  for (const line of content.split("\n")) {
    const fontMatch = line.match(/font(?:-family)?\s*[:=]\s*["']?([^"';,]+)/i);
    if (fontMatch?.[1]) fonts.add(fontMatch[1].trim());
    for (const hex of line.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? []) colors.add(hex.toUpperCase());
    const familyMatch = line.match(/"(Instrument Serif|Source Sans 3|IBM Plex Mono|[A-Za-z][\w\s]+)"/);
    if (familyMatch?.[1] && /font|type|display|body/i.test(line)) fonts.add(familyMatch[1].trim());
  }

  return { fonts: [...fonts], colors: [...colors], source: "DESIGN.md" };
}

export function detectDesignSystemDrift(
  fingerprint: DesignFingerprint,
  spec: DesignDocSpec | null | undefined,
): Finding | null {
  if (!spec || (spec.fonts.length === 0 && spec.colors.length === 0)) return null;

  const usedFonts = fingerprint.fontFamilies.map((f) => f.family.replace(/["']/g, "").trim());
  const undeclaredFonts = usedFonts.filter((family) =>
    !spec.fonts.some((declared) => family.toLowerCase().includes(declared.toLowerCase()) || declared.toLowerCase().includes(family.toLowerCase())),
  );

  const usedColors = new Set(
    fingerprint.colors
      .filter((c) => !isTransparentColor(c.value))
      .map((c) => c.normalizedHex.toUpperCase()),
  );
  const declaredColors = new Set(spec.colors.map((c) => c.toUpperCase()));
  const offPalette = [...usedColors].filter((hex) => {
    if (declaredColors.size === 0) return false;
    return ![...declaredColors].some((declared) => colorNear(hex, declared));
  }).slice(0, 8);

  if (undeclaredFonts.length === 0 && offPalette.length === 0) return null;

  return FindingSchema.parse({
    id: "drift-design-system",
    family: "drift",
    detector: "DesignSystemDrift",
    verdictHint: "drift",
    severity: undeclaredFonts.length > 0 ? "medium" : "low",
    facts: {
      declaredFonts: spec.fonts,
      declaredColors: spec.colors,
      undeclaredFonts: undeclaredFonts.slice(0, 6),
      offPaletteColors: offPalette,
      source: spec.source,
    },
    evidence: [
      {
        kind: "computed",
        label: "Undeclared fonts",
        value: undeclaredFonts.join(", ") || "none",
      },
      {
        kind: "computed",
        label: "Off-palette colors",
        value: offPalette.join(", ") || "none",
      },
    ],
  });
}

function colorNear(a: string, b: string): boolean {
  if (a === b) return true;
  const ra = hexToRgb(a), rb = hexToRgb(b);
  if (!ra || !rb) return false;
  return Math.abs(ra[0] - rb[0]) + Math.abs(ra[1] - rb[1]) + Math.abs(ra[2] - rb[2]) < 24;
}

function isTransparentColor(value: string): boolean {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match?.[1]) return false;
  const parts = match[1].split(",").map((part) => part.trim());
  return parts.length === 4 && Number.parseFloat(parts[3] ?? "1") === 0;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
}
