"use client";

import Box from "@mui/material/Box";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

// Warm radial-gradient wash anchored to the top-right corner of the
// wrapped page. Used on student-facing authed pages to give the
// surface a quiet "Aptiverse, not a generic productivity tool"
// texture without changing structure or card surfaces.
//
// Uses the brand's secondary (terracotta) at 4-6% alpha so the eye
// reads warmth, not colour. Sits behind page content via a ::before
// pseudo + child positive z-index so it never interferes with
// interaction or layout.
//
// Negative gutters bleed the wash into the (app) layout's edge
// padding so it reaches the viewport edges, not just the content
// box. Don't use on small components; this is a page-level wrapper.

export type AtmosphericBackdropProps = {
  children: ReactNode;
  /** Allow callers to extend / override the wrapper sx. */
  sx?: SxProps<Theme>;
};

export function AtmosphericBackdrop({ children, sx }: AtmosphericBackdropProps) {
  return (
    <Box
      sx={[
        {
          position: "relative",
          ml: { xs: -2, sm: -3, lg: -5 },
          mr: { xs: -2, sm: -3, lg: -5 },
          mt: { xs: -3, md: -4 },
          px: { xs: 2, sm: 3, lg: 5 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 3, md: 4 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: (t) =>
              `radial-gradient(60% 50% at 100% 0%, ${alpha(
                t.palette.secondary.main,
                t.palette.mode === "dark" ? 0.06 : 0.04,
              )}, transparent 70%)`,
            zIndex: 0,
          },
          "& > *": { position: "relative", zIndex: 1 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
