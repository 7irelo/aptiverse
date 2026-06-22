"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { BarChart, type BarChartProps } from "@mui/x-charts/BarChart";
import { useId } from "react";

// Bar chart with a vertical primary-color gradient and rounded bar tops.
// Drop-in replacement for MUI's BarChart — pass the same props.
export function AptiverseBarChart(props: BarChartProps) {
  const theme = useTheme();
  const gradientId = useId().replace(/:/g, "");

  const seriesWithGradient = (props.series ?? []).map((s, i) =>
    i === 0 ? { ...s, color: `url(#${gradientId})` } : s,
  );

  return (
    <Box sx={{ position: "relative" }}>
      <BarChart
        hideLegend
        {...props}
        series={seriesWithGradient}
        xAxis={(props.xAxis ?? []).map((a) => ({
          ...a,
          disableLine: true,
          disableTicks: true,
        }))}
        yAxis={(props.yAxis ?? [{}]).map((a) => ({
          ...a,
          disableLine: true,
          disableTicks: true,
        }))}
        sx={{
          "& .MuiBarElement-root": {
            clipPath: "inset(0 0 0 0 round 6px 6px 0 0)",
          },
          ...(props.sx ?? {}),
        }}
      />
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={theme.palette.primary.main} />
            <stop
              offset="100%"
              stopColor={
                theme.palette.mode === "dark"
                  ? theme.palette.action.selected
                  : theme.palette.grey[200]
              }
            />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
}
