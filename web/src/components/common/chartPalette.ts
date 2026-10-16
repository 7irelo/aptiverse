"use client";

import { useTheme } from "@mui/material/styles";

// Chart colour ramps, kept out of the theme's semantic palette because a chart
// answers a different question than a control does.
//
// Mastery bands (Needs work / Developing / Strong) are ORDINAL: reorder them and
// the meaning changes. Ordered data takes a single-hue ramp with monotone
// lightness so the reader sees the order in the colour itself.
//
// This replaced a clay-vs-forest pair. That pair carried the brand's
// "warm attention vs growing well" intent, but orange-against-green is the
// classic red-green trap: under protanopia the two collapsed to ΔE 4.5, well
// under the floor of 8, so a colour-blind student could not tell a weak topic
// from a strong one. A one-hue ramp is colour-blind safe by construction —
// it encodes with lightness, which no CVD type flattens.
//
// Both ramps are validated (monotone L, adjacent ΔL >= 0.06, light-end contrast
// clear of the surface, single hue) against the real chart surfaces:
// light #FCFCFB, dark #1A1A19. Re-run the dataviz validator before changing a step.
//
// Clay/forest are still right on topic pills and status chips, where the colour
// sits beside its own label and never has to carry the meaning alone.

export type BandRamp = { needsWork: string; developing: string; strong: string };

// Light surface: low → light, high → deep (the sequential convention).
// Dark surface: the anchor flips, low → dim, high → bright.
export function masteryBandRamp(mode: "light" | "dark"): BandRamp {
  return mode === "dark"
    ? { needsWork: "#2C7C4E", developing: "#5BAD7E", strong: "#A8D9BC" }
    : { needsWork: "#5BAD7E", developing: "#2C7C4E", strong: "#14432A" };
}

// Categorical identity for per-course series. A course is a nominal identity
// (reordering courses changes nothing), so each gets a fixed hue slot assigned
// in order and never cycled — the fixed order IS the colour-blind safety
// mechanism, so don't sort these by value.
//
// Hues follow Okabe-Ito, which is built for CVD safety; the dark steps are
// re-anchored into the dark lightness band rather than reused from light.
// Validated adjacent-pair (the rule for line series) in both modes: worst
// adjacent ΔE 17.9 light / 15.5 dark, comfortably over the target of 12.
// Three light steps sit under 3:1 on the light surface, which is why every
// chart using these ships a legend and direct labels — never colour alone.
const COURSE_HUES_LIGHT = ["#0072B2", "#D55E00", "#009E73", "#CC79A7", "#E69F00", "#56B4E9"];
const COURSE_HUES_DARK = ["#3D9BD9", "#D55E00", "#00A97C", "#C06A98", "#B08000", "#1E7FC4"];

// Beyond six courses the slots repeat. That's a deliberate stop rather than a
// generated hue: a 7th invented colour would land wherever it likes in CVD
// space. If a student ever carries more than six, the honest fix is small
// multiples, not more hues.
export function courseColor(index: number, mode: "light" | "dark"): string {
  const hues = mode === "dark" ? COURSE_HUES_DARK : COURSE_HUES_LIGHT;
  return hues[index % hues.length];
}

// Convenience hook for the many chart pages that used to hardcode a hex per
// series. A fixed hex cannot follow the colour scheme, and the retired
// Chalk & Pine pine (#0F6963) sat at roughly 1.5:1 on the dark chart surface,
// so those lines were effectively invisible for dark-OS users. Slots are
// stable per index, matching the categorical rule above.
export function useChartSeriesColors(): (index: number) => string {
  const mode = useTheme().palette.mode;
  return (index: number) => courseColor(index, mode);
}
