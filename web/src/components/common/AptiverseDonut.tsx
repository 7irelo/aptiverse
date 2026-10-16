"use client";

import type { ComponentProps } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
// Type-only import — erased at build time, so it pulls no @mui/x-charts code
// into this wrapper's chunk. The runtime component loads lazily below.
import type { AptiverseDonut as AptiverseDonutImpl } from "./AptiverseDonut.impl";

export type { DonutDatum } from "./AptiverseDonut.impl";

type AptiverseDonutProps = ComponentProps<typeof AptiverseDonutImpl>;

// The donut wraps @mui/x-charts' PieChart, so it carries the same heavy chunk
// as the other charts. Defer it to a client-only chunk behind a height-reserved
// skeleton; the ring reads instantly once the chunk lands.
const LazyDonut = dynamic(
  () => import("./AptiverseDonut.impl").then((m) => m.AptiverseDonut),
  {
    ssr: false,
    loading: () => <Skeleton variant="rounded" height="100%" sx={{ minHeight: 120 }} />,
  },
);

export function AptiverseDonut(props: AptiverseDonutProps) {
  const reserved = typeof props.height === "number" ? props.height : 232;
  return (
    <Box sx={{ minHeight: reserved }}>
      <LazyDonut {...props} />
    </Box>
  );
}
