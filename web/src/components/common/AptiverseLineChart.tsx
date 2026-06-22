"use client";

import { useTheme } from "@mui/material/styles";
import { LineChart, type LineChartProps } from "@mui/x-charts/LineChart";

// LineChart with stripped axis chrome and curved series by default.
// Drop-in replacement for MUI's LineChart.
export function AptiverseLineChart(props: LineChartProps) {
  const theme = useTheme();

  return (
    <LineChart
      hideLegend
      {...props}
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
      series={(props.series ?? []).map((s) => ({
        curve: "monotoneX" as const,
        ...s,
      }))}
      grid={{ horizontal: true, ...(props.grid ?? {}) }}
      sx={{
        "& .MuiChartsAxis-tickLabel": { fill: theme.palette.text.secondary },
        "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: "transparent" },
        "& .MuiLineElement-root": { strokeWidth: 2.5 },
        "& .MuiAreaElement-root": { fillOpacity: 0.15 },
        ...(props.sx ?? {}),
      }}
    />
  );
}
