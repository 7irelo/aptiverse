"use client";

import { useTheme } from "@mui/material/styles";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { ScatterChart, type ScatterChartProps } from "@mui/x-charts/ScatterChart";
import { LineChart, type LineChartProps } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";

// The mastery page renders three @mui/x-charts views. They live here, in one
// client module, so the page can dynamic-import them as a single lazy chunk and
// keep the (large) charts bundle out of its first-load JS. Rendered output is
// identical to the previous inline charts — this file is a pure extraction.

// Mastery coverage per unit, drawn as a filled radar.
export function CoverageRadar({
  metrics,
  values,
  color,
}: {
  metrics: string[];
  values: number[];
  color: string;
}) {
  return (
    <RadarChart
      height={320}
      hideLegend
      radar={{
        max: 100,
        metrics,
        labelFormatter: (name) => (name.length > 14 ? `${name.slice(0, 13)}…` : name),
      }}
      series={[
        {
          label: "Mastery",
          data: values,
          fillArea: true,
          color,
        },
      ]}
    />
  );
}

// Mastery (x) vs recent change (y). Reference lines at 50% and 0-change split
// the plane into the four momentum quadrants.
export function MomentumScatter({
  series,
  trendMax,
}: {
  series: ScatterChartProps["series"];
  trendMax: number;
}) {
  const theme = useTheme();
  return (
    <ScatterChart
      height={340}
      grid={{ horizontal: true, vertical: true }}
      xAxis={[{ min: 0, max: 100, label: "Mastery %" }]}
      yAxis={[{ min: -trendMax, max: trendMax, label: "Recent change" }]}
      series={series}
    >
      <ChartsReferenceLine
        x={50}
        lineStyle={{ stroke: theme.palette.divider, strokeDasharray: "4 4" }}
      />
      <ChartsReferenceLine
        y={0}
        lineStyle={{ stroke: theme.palette.divider, strokeDasharray: "4 4" }}
      />
    </ScatterChart>
  );
}

// Current -> predicted trajectory per subject.
export function ProjectionLine({
  series,
  hideLegend,
}: {
  series: LineChartProps["series"];
  hideLegend: boolean;
}) {
  return (
    <LineChart
      height={320}
      xAxis={[{ data: ["Current", "Predicted"], scaleType: "point" }]}
      yAxis={[{ min: 0, max: 100 }]}
      series={series}
      margin={{ top: 20, right: 24, bottom: 28, left: 40 }}
      grid={{ horizontal: true }}
      hideLegend={hideLegend}
    />
  );
}
