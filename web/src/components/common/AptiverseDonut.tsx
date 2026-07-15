"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import { PieChartArcLabel } from "./PieChartArcLabel";

export type DonutDatum = { label: string; value: number; color: string };

// A donut in the Euphoria.v4 house style: pill-shaped arc-label chips on each
// slice, a value read-out in the hole, and a compact legend underneath. Renders
// its final state immediately (skipAnimation) so it reads instantly, survives
// reduced-motion / background-tab first paint, and never flashes an empty ring.
export function AptiverseDonut({
  data,
  height = 232,
  centerValue,
  centerLabel,
  arcLabel,
  innerRadius = 62,
  outerRadius = 102,
  showLegend = true,
}: {
  data: DonutDatum[];
  height?: number;
  centerValue?: React.ReactNode;
  centerLabel?: string;
  // Per-slice chip text. Defaults to the raw value; pass a formatter for units.
  arcLabel?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
}) {
  const slices = data.filter((d) => d.value > 0);
  if (slices.length === 0) return null;

  return (
    <Box>
      <Box sx={{ position: "relative" }}>
        <PieChart
          height={height}
          series={[
            {
              data: slices.map((d, i) => ({ id: i, value: d.value, label: d.label, color: d.color })),
              innerRadius,
              outerRadius,
              paddingAngle: slices.length > 1 ? 2 : 0,
              cornerRadius: 5,
              arcLabel: (item) => (arcLabel ? arcLabel(item.value) : `${item.value}`),
              arcLabelMinAngle: 22,
              arcLabelRadius: "100%",
              highlightScope: { fade: "global", highlight: "item" },
              valueFormatter: (v) => `${v.value}`,
            },
          ]}
          slots={{ pieArcLabel: PieChartArcLabel }}
          hideLegend
          skipAnimation
          margin={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
        {centerValue != null && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "1.7rem", lineHeight: 1 }}>
                {centerValue}
              </Typography>
              {centerLabel && (
                <Typography variant="caption" color="text.secondary">
                  {centerLabel}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {showLegend && (
        <Stack
          direction="row"
          spacing={2}
          rowGap={0.75}
          flexWrap="wrap"
          useFlexGap
          justifyContent="center"
          sx={{ mt: 1.5 }}
        >
          {slices.map((d) => (
            <Stack key={d.label} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: d.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">
                {d.label} · {d.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
}
