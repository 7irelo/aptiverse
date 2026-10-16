"use client";

import Box from "@mui/material/Box";
import { alpha, type Theme } from "@mui/material/styles";
import type { RequirementStatus, TargetStatus } from "@/lib/targets/reach";

// One place that decides what a status looks like, so the same state is never
// coloured two different ways across the list and the detail page.
//
// Colour is doing real work here, so it is kept to four tones and each one
// means one thing. Note what is missing: nothing is red because it is urgent,
// only because it is genuinely blocked. A page a seventeen-year-old opens to
// find out whether they can still get into medicine does not need to shout at
// them; the numbers are already loud enough.

export type Tone = "success" | "warning" | "error" | "neutral";

export function targetTone(status: TargetStatus): Tone {
  switch (status) {
    case "clear":
      return "success";
    case "short":
      return "warning";
    case "blocked":
      return "error";
    default:
      return "neutral";
  }
}

export function requirementTone(status: RequirementStatus): Tone {
  switch (status) {
    case "clear":
      return "success";
    case "short":
      return "warning";
    case "not_enrolled":
    case "substituted":
      return "error";
    default:
      return "neutral";
  }
}

export function toneHex(t: Theme, tone: Tone): string {
  switch (tone) {
    case "success":
      return t.palette.success.main;
    case "warning":
      return t.palette.warning.main;
    case "error":
      return t.palette.error.main;
    default:
      return t.palette.text.disabled;
  }
}

export function ReachChip({ tone, label }: { tone: Tone; label: string }) {
  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.375,
        borderRadius: 1,
        fontSize: "0.75rem",
        fontWeight: 700,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        color: (t) => toneHex(t, tone),
        bgcolor: (t) => alpha(toneHex(t, tone), 0.14),
      }}
    >
      {label}
    </Box>
  );
}
