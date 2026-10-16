"use client";

import { useTheme } from "@mui/material/styles";
import { LineChart, type LineChartProps } from "@mui/x-charts/LineChart";

// LineChart with stripped axis chrome and curved series by default.
// Drop-in replacement for MUI's LineChart.
export function AptiverseLineChart(props: LineChartProps) {
  const theme = useTheme();

  // A legend appears as soon as there is more than one series, and not before.
  //
  // This used to be a flat `hideLegend`, which meant no caller ever got one:
  // every multi-series chart in the app shipped with two or three coloured
  // lines and nothing anywhere saying which was which. Colour was carrying
  // identity on its own, which is unreadable for anyone who cannot separate the
  // hues and merely annoying for everyone else.
  //
  // Still suppressed for a single series, where the card title already names
  // the line and a legend would just repeat it.
  const seriesCount = props.series?.length ?? 0;
  const hideLegend = props.hideLegend ?? seriesCount < 2;

  return (
    <LineChart
      {...props}
      hideLegend={hideLegend}
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
