"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LiveTvIcon from "@mui/icons-material/LiveTvOutlined";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { Dot } from "@/components/common/Dot";
import { QueryStates } from "@/components/common/QueryStates";
import { useChildren } from "@/lib/api/queries";
import type { Child } from "@/lib/mockData";
import { initials } from "@/lib/format";
import { useTicker } from "@/lib/hooks/useTicker";

export default function ParentLivePage() {
  const query = useChildren();

  return (
    <>
      <PageHeader
        title="Live family view"
        description="A real-time look at your children — only what's needed, never invasive."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Live" }]}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <Dot color="success" pulsing />
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
              LIVE
            </Typography>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <QueryStates
            query={query}
            empty={{
              icon: <LiveTvIcon />,
              title: "No children to follow yet",
              description: "Once a child is linked, you'll see their activity in real time here.",
            }}
          >
            {(children) => <LiveStreams children={children} />}
          </QueryStates>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <LiveActivityFeed title="Live family stream" height={680} />
        </Grid>
      </Grid>
    </>
  );
}

function LiveStreams({ children }: { children: Child[] }) {
  const tick = useTicker(2000);
  const [series, setSeries] = useState<number[][]>(() =>
    children.map(() => Array.from({ length: 30 }, () => Math.round(Math.random() * 100))),
  );

  useEffect(() => {
    setSeries((prev) =>
      prev.map((s) => {
        const next = [...s.slice(1), Math.max(20, Math.min(100, s[s.length - 1] + (Math.random() - 0.4) * 20))];
        return next.map((n) => Math.round(n));
      }),
    );
  }, [tick]);

  // Re-seed when child count changes (e.g., adding a child)
  useEffect(() => {
    setSeries((prev) =>
      prev.length === children.length
        ? prev
        : children.map(() => Array.from({ length: 30 }, () => Math.round(Math.random() * 100))),
    );
  }, [children.length]);

  return (
    <Stack spacing={3}>
      {children.map((c, i) => (
        <Card key={c.id}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main", fontWeight: 700 }}>{initials(c.name)}</Avatar>
                {c.isStudyingNow && (
                  <Box sx={{ position: "absolute", bottom: 0, right: 0, p: 0.4, bgcolor: "background.paper", borderRadius: "50%" }}>
                    <Dot color="success" pulsing size={9} />
                  </Box>
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {c.name}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <Chip
                    label={c.isStudyingNow ? "Studying" : "Idle"}
                    size="small"
                    color={c.isStudyingNow ? "success" : "default"}
                    variant={c.isStudyingNow ? "filled" : "outlined"}
                    sx={{ fontWeight: 600 }}
                  />
                  {c.isStudyingNow && c.currentActivity && (
                    <Typography variant="caption" color="text.secondary">
                      · {c.currentActivity}
                    </Typography>
                  )}
                </Stack>
              </Box>
              <Stack alignItems="flex-end">
                <Typography variant="caption" color="text.secondary">
                  Today
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {Math.floor(((tick % 10) + 24) / 60)}h {((tick % 10) + 24) % 60}m
                </Typography>
              </Stack>
            </Stack>
            <LineChart
              height={120}
              xAxis={[{ data: Array.from({ length: 30 }, (_, j) => j), scaleType: "point" }]}
              yAxis={[{ min: 0, max: 100 }]}
              series={[{ data: series[i] ?? [], color: "#1F8079", showMark: false, area: true }]}
              margin={{ top: 4, right: 0, bottom: 16, left: 24 }}
            />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
