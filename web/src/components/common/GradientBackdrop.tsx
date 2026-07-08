"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export type GradientBackdropProps = {
  variant?: "hero" | "soft" | "vivid";
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};

// Calm, on-brand background wash. No dot-grid or slate glow: a single soft
// pine bloom on the warm ground for hero sections, flat ground for soft
// sections, and a pine drench for inverted panels.
export function GradientBackdrop({ variant = "soft", sx, children }: GradientBackdropProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  const bloom = `radial-gradient(720px 420px at 82% -8%, ${alpha(
    theme.palette.primary.main,
    dark ? 0.16 : 0.1,
  )}, transparent 62%)`;

  const gradients: Record<NonNullable<GradientBackdropProps["variant"]>, string> = {
    hero: `${bloom}, ${theme.palette.background.default}`,
    soft: theme.palette.background.default,
    vivid: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background: gradients[variant],
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
