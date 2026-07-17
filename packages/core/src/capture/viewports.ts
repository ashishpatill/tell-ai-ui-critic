import type { ViewportMatrixEntry, ViewportPreset } from "@tell/schema";

export const CAPTURE_VIEWPORT_PRESETS: ReadonlyArray<{
  preset: ViewportPreset;
  width: number;
  height: number;
}> = [
  { preset: "desktop", width: 1440, height: 1100 },
  { preset: "tablet", width: 768, height: 1024 },
  { preset: "mobile", width: 390, height: 844 },
];

export const SECONDARY_VIEWPORT_PRESETS = CAPTURE_VIEWPORT_PRESETS.filter((v) => v.preset !== "desktop");

export type ViewportDomSummary = ViewportMatrixEntry["domSummary"];
