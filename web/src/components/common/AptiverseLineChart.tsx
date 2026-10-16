"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import type { LineChartProps } from "@mui/x-charts/LineChart";

// @mui/x-charts is one of the heaviest client dependencies in the app. It is
// never needed for a route's first paint, so the real chart lives in a separate
// chunk that only downloads on the client once this component mounts. The
// wrapper is a few bytes; the chart chunk streams in behind a height-reserved
// skeleton so nothing shifts when it lands.
const LazyLineChart = dynamic(
  () => import("./AptiverseLineChart.impl").then((m) => m.AptiverseLineChart),
  {
    ssr: false,
    loading: () => <Skeleton variant="rounded" height="100%" sx={{ minHeight: 120 }} />,
  },
);

export function AptiverseLineChart(props: LineChartProps) {
  const reserved = typeof props.height === "number" ? props.height : undefined;
  return (
    <Box sx={reserved ? { height: reserved } : undefined}>
      <LazyLineChart {...props} />
    </Box>
  );
}
