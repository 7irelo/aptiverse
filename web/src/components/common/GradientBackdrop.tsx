"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";

export type GradientBackdropProps = {
  variant?: "hero" | "soft" | "vivid";
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
};

export function GradientBackdrop({ variant = "soft", sx, children }: GradientBackdropProps) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  // Subtle dot grid — common in pro SaaS landings (Linear, Vercel)
  const gridColor = dark
    ? "rgba(255,255,255,0.04)"
    : "rgba(15,23,42,0.05)";
  const gridPattern = `radial-gradient(${gridColor} 1px, transparent 1px)`;

  const gradients: Record<NonNullable<GradientBackdropProps["variant"]>, string> = {
    hero: `${gridPattern}, ${
      dark
        ? `radial-gradient(700px 400px at 80% 0%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 60%)`
        : `radial-gradient(700px 400px at 80% 0%, ${alpha(theme.palette.primary.main, 0.10)}, transparent 60%)`
    }, linear-gradient(180deg, ${theme.palette.background.default}, ${theme.palette.background.default})`,
    soft: `${gridPattern}, linear-gradient(180deg, ${theme.palette.background.default}, ${theme.palette.background.default})`,
    vivid: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  };

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        background: gradients[variant],
        backgroundSize:
          variant === "vivid" ? "auto" : "24px 24px, auto, auto",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
