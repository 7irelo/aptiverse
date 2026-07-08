"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";

export type StatCardProps = {
  label: string;
  value: React.ReactNode;
  delta?: number; // percentage
  deltaLabel?: string;
  icon?: React.ReactNode;
  color?: "primary" | "secondary" | "success" | "warning" | "info" | "error";
  hint?: string;
};

export function StatCard({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  color = "primary",
  hint,
}: StatCardProps) {
  const theme = useTheme();
  const trend =
    typeof delta === "number" ? (delta > 0 ? "up" : delta < 0 ? "down" : "flat") : undefined;
  const trendColor =
    trend === "up"
      ? theme.palette.success.main
      : trend === "down"
        ? theme.palette.error.main
        : theme.palette.text.secondary;
  const TrendIcon = trend === "up" ? TrendingUpIcon : trend === "down" ? TrendingDownIcon : TrendingFlatIcon;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 0.5, fontWeight: 700 }}>
              {value}
            </Typography>
            {(typeof delta === "number" || hint) && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
                {typeof delta === "number" && (
                  <>
                    <TrendIcon sx={{ fontSize: 18, color: trendColor }} />
                    <Typography variant="body2" sx={{ color: trendColor, fontWeight: 600 }}>
                      {delta > 0 ? "+" : ""}
                      {delta}%
                    </Typography>
                  </>
                )}
                {(deltaLabel || hint) && (
                  <Typography variant="body2" color="text.secondary">
                    {deltaLabel ?? hint}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                // Use a shade that contrasts with the pale tinted badge in both
                // modes — the raw .main goes low-contrast when the colour is
                // light (e.g. citron secondary) on the light-mode tint.
                color:
                  theme.palette.mode === "dark"
                    ? theme.palette[color].light
                    : theme.palette[color].dark,
                bgcolor: alpha(theme.palette[color].main, 0.12),
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
