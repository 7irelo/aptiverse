"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import { PieChartArcLabel } from "./PieChartArcLabel";

export type DonutDatum = { label: string; value: number; color: string };

// A donut in the Euphoria.v4 house style: a value read-out in the hole, a
// compact legend underneath, and optional pill-shaped arc-label chips. Renders
// its final state immediately (skipAnimation) so it reads instantly, survives
// reduced-motion / background-tab first paint, and never flashes an empty ring.
//
// Arc chips are opt-in. They used to be on by default at arcLabelRadius 100%,
// which parked a 52x32 pill on the rim of a 76px ring: on a two-slice donut
// they read as blobs stuck to the edge, and they repeated the counts the
// legend was already spelling out underneath. Pass `arcLabel` when the slice
// value genuinely can't be read any other way.
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
  // Per-slice chip text. Omit for no chips (the default).
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
              // An empty string renders nothing: PieChartArcLabel bails on a
              // falsy label, so no formatter means no chips at all.
              arcLabel: (item) => (arcLabel ? arcLabel(item.value) : ""),
              arcLabelMinAngle: 22,
              // Centred in the band, not on the rim, so a chip sits on its own
              // slice instead of hanging off the edge of the ring.
              arcLabelRadius: (innerRadius + outerRadius) / 2,
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
