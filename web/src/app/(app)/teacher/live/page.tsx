"use client";

import { useEffect, useMemo, useState } from "react";
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
import { StatCard } from "@/components/common/StatCard";
import { QueryStates } from "@/components/common/QueryStates";
import { useLiveActivity, type LiveActivity } from "@/lib/api/queries";
import { useTicker } from "@/lib/hooks/useTicker";
import { useChartSeriesColors } from "@/components/common/chartPalette";

export default function TeacherLivePage() {
  const query = useLiveActivity(30);

  return (
    <>
      <PageHeader
        title="Live class view"
        description="A real-time pulse on your classes — who's working, who's stuck, who needs you."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Live" }]}
        actions={
          <Stack direction="row" spacing={1} alignItems="center">
            <Dot color="success" pulsing />
            <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
              LIVE
            </Typography>
          </Stack>
        }
      />

      <QueryStates
        query={query}
        empty={{
          icon: <LiveTvIcon />,
          title: "No-one's online right now",
          description: "The class activity stream lights up as soon as a learner starts a session.",
        }}
      >
        {(items) => <LiveView items={items} />}
      </QueryStates>
    </>
  );
}

function LiveView({ items }: { items: LiveActivity[] }) {
  const seriesColor = useChartSeriesColors();
  const tick = useTicker(2000);
  const [series, setSeries] = useState<number[]>(Array.from({ length: 30 }, () => 50 + Math.round(Math.random() * 30)));
  const [scoreSeries, setScoreSeries] = useState<number[]>(Array.from({ length: 30 }, () => 40 + Math.round(Math.random() * 50)));

  useEffect(() => {
    setSeries((s) => [...s.slice(1), Math.max(20, Math.min(95, s[s.length - 1] + Math.round((Math.random() - 0.5) * 10)))]);
    setScoreSeries((s) => [...s.slice(1), Math.max(30, Math.min(95, s[s.length - 1] + Math.round((Math.random() - 0.5) * 8)))]);
  }, [tick]);

  // Reduce the activity stream into per-student "right now" cards
  const students = useMemo(() => {
    const byStudent = new Map<string, { id: string; name: string; activity: string; ts: string }>();
    for (const a of items) {
      const existing = byStudent.get(a.studentId);
      if (!existing || +new Date(a.ts) > +new Date(existing.ts)) {
        byStudent.set(a.studentId, {
          id: a.studentId,
          name: a.student,
          activity: a.detail ?? a.action,
          ts: a.ts,
        });
      }
    }
    return Array.from(byStudent.values()).slice(0, 12);
  }, [items]);

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active in last 30s" value={students.length} hint="learners" color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Events / min" value={Math.max(1, (tick % 7) + 3)} hint="rolling" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Avg focus" value={`${Math.round(series[series.length - 1])}%`} delta={2} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Help requests" value={Math.max(0, 3 - (tick % 4))} hint="open" color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6">Engagement &amp; quiz scores (60s window)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Live class telemetry — tap a student to ping them
                  </Typography>
                </Box>
                <Chip label="Streaming" size="small" color="success" variant="outlined" />
              </Stack>
              <LineChart
                height={260}
                xAxis={[{ data: Array.from({ length: 30 }, (_, i) => `${30 - i}s`), scaleType: "point" }]}
                yAxis={[{ min: 0, max: 100 }]}
                series={[
                  { data: series, label: "Avg focus", color: seriesColor(0), showMark: false, area: true },
                  { data: scoreSeries, label: "Avg quiz score", color: seriesColor(1), showMark: false },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Students right now
              </Typography>
              {students.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No-one active in the last few seconds.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {students.map((s) => (
                    <Stack
                      key={s.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: "divider" }}
                    >
                      <Box sx={{ position: "relative" }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.8rem", fontWeight: 700 }}>
                          {s.name.split(" ").map((p) => p[0]).join("")}
                        </Avatar>
                        <Box sx={{ position: "absolute", bottom: -2, right: -2, p: 0.4, bgcolor: "background.paper", borderRadius: "50%" }}>
                          <Dot color="success" pulsing size={8} />
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {s.name}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          {s.activity}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <LiveActivityFeed title="Class activity stream" height={680} />
        </Grid>
      </Grid>
    </>
  );
}
