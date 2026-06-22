"use client";

import Chip, { type ChipProps } from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";

export type StatusKind =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "primary"
  | "secondary"
  | "achievement";

export type StatusChipProps = Omit<ChipProps, "color"> & {
  kind?: StatusKind;
  dot?: boolean;
};

export function StatusChip({ kind = "neutral", dot, sx, ...rest }: StatusChipProps) {
  const theme = useTheme();
  const colorMap = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
    neutral: theme.palette.text.secondary,
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    // Sacred-Amber Rule (DESIGN.md): reserved for earned milestones
    // (verified goals, real streaks, claimed rewards). Never decorative.
    achievement: theme.palette.achievement.main,
  } satisfies Record<StatusKind, string>;

  const c = colorMap[kind];

  return (
    <Chip
      size="small"
      icon={
        dot ? (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c,
              marginLeft: 8,
              marginRight: -2,
            }}
          />
        ) : undefined
      }
      sx={{
        bgcolor: alpha(c, 0.12),
        color: c,
        fontWeight: 600,
        border: `1px solid ${alpha(c, 0.24)}`,
        "& .MuiChip-icon": { color: c },
        ...sx,
      }}
      {...rest}
    />
  );
}
