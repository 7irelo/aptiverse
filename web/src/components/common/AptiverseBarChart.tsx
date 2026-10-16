"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { BarChartProps } from "@mui/x-charts/BarChart";

// Charts pull @mui/x-charts, which is large and never first-paint-critical.
// Load the real chart in its own client-only chunk once mounted, behind a
// height-reserved skeleton so the layout stays put while it downloads.
const LazyBarChart = dynamic(
  () => import("./AptiverseBarChart.impl").then((m) => m.AptiverseBarChart),
  {
    ssr: false,
    loading: () => <Skeleton variant="rounded" height="100%" sx={{ minHeight: 120 }} />,
  },
);

export function AptiverseBarChart(props: BarChartProps) {
  const reserved = typeof props.height === "number" ? props.height : undefined;
  return (
    <Box sx={reserved ? { height: reserved } : undefined}>
      <LazyBarChart {...props} />
    </Box>
  );
}
