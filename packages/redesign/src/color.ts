// Dependency-free color + number math shared by measures, restyle, and reconcile.
// Runs identically in Node and the browser (the web app runs reconcile client-side).

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export function parseColor(input: string): Rgb | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (s === "transparent") return null;
  const rgb = s.match(/rgba?\(\s*(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)[,\s]+(\d+(?:\.\d+)?)(?:[,\s/]+([\d.]+))?/);
  if (rgb) {
    const a = rgb[4] !== undefined ? Number(rgb[4]) : 1;
    if (a === 0) return null; // fully transparent carries no color
    return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]! };
  }
  const hex6 = s.match(/^#([0-9a-f]{6})$/);
  if (hex6) {
    const n = parseInt(hex6[1]!, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const hex3 = s.match(/^#([0-9a-f]{3})$/);
  if (hex3) {
    const h = hex3[1]!;
    return { r: parseInt(h[0]! + h[0]!, 16), g: parseInt(h[1]! + h[1]!, 16), b: parseInt(h[2]! + h[2]!, 16) };
  }
  return null;
}

export function toHex({ r, g, b }: Rgb): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const mx = Math.max(rn, gn, bn), mn = Math.min(rn, gn, bn);
  const l = (mx + mn) / 2;
  if (mx === mn) return { h: 0, s: 0, l };
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = 0;
  if (mx === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0));
  else if (mx === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h * 60, s, l };
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function hslHex(h: number, s: number, l: number): string {
  return toHex(hslToRgb(h, s, l));
}

export function luminance(rgb: Rgb): number {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
}

export function contrastRatio(a: string, b: string): number {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return 1;
  const la = luminance(ca);
  const lb = luminance(cb);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

export function sameColor(a: string, b: string, tol = 8): boolean {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a.trim().toLowerCase() === b.trim().toLowerCase();
  return Math.abs(ca.r - cb.r) <= tol && Math.abs(ca.g - cb.g) <= tol && Math.abs(ca.b - cb.b) <= tol;
}

// sRGB → CIE Lab → CIE76 ΔE (matches the fingerprint's neutral clustering).
function srgbToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.04045 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}
function rgbToLab({ r, g, b }: Rgb): [number, number, number] {
  const rl = srgbToLinear(r), gl = srgbToLinear(g), bl = srgbToLinear(b);
  const x = (rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047;
  const y = rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  const z = (rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
export function deltaE(a: Rgb, b: Rgb): number {
  const la = rgbToLab(a), lb = rgbToLab(b);
  return Math.sqrt((la[0] - lb[0]) ** 2 + (la[1] - lb[1]) ** 2 + (la[2] - lb[2]) ** 2);
}
export function deltaEHex(a: string, b: string): number {
  const ca = parseColor(a), cb = parseColor(b);
  if (!ca || !cb) return 100;
  return deltaE(ca, cb);
}

/** First numeric px value in a string like "16px 24px" → 16. */
export function px(value: string | undefined): number {
  if (!value) return 0;
  const m = value.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

/** All numeric px values in a shorthand like "8px 16px 8px 16px". */
export function pxList(value: string | undefined): number[] {
  if (!value) return [];
  return (value.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
