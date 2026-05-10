"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { LineChart } from "@mui/x-charts/LineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { Dot } from "@/components/common/Dot";
import { StatCard } from "@/components/common/StatCard";
import { useTicker } from "@/lib/hooks/useTicker";

const STUDENTS = [
  { id: "s1", name: "Thabo M.", studying: true, activity: "Calculus practice", focus: 85 },
  { id: "s2", name: "Naledi K.", studying: true, activity: "Essay writing", focus: 72 },
  { id: "s3", name: "Sipho D.", studying: false, activity: "Last seen 12m ago", focus: 0 },
  { id: "s4", name: "Aisha M.", studying: true, activity: "Asking AI tutor", focus: 60 },
  { id: "s5", name: "Lerato P.", studying: true, activity: "Wellbeing check", focus: 100 },
  { id: "s6", name: "Mandla T.", studying: false, activity: "Last seen 4m ago", focus: 0 },
  { id: "s7", name: "Khanya N.", studying: true, activity: "Past paper", focus: 78 },
  { id: "s8", name: "Tumi B.", studying: true, activity: "Group session", focus: 65 },
];

export default function TeacherLivePage() {
  const tick = useTicker(2000);
  const [series, setSeries] = useState<number[]>(Array.from({ length: 30 }, () => 50 + Math.round(Math.random() * 30)));
  const [scoreSeries, setScoreSeries] = useState<number[]>(Array.from({ length: 30 }, () => 40 + Math.round(Math.random() * 50)));

  useEffect(() => {
    setSeries((s) => [...s.slice(1), Math.max(20, Math.min(95, s[s.length - 1] + Math.round((Math.random() - 0.5) * 10)))]);
    setScoreSeries((s) => [...s.slice(1), Math.max(30, Math.min(95, s[s.length - 1] + Math.round((Math.random() - 0.5) * 8)))]);
  }, [tick]);

  const onlineCount = STUDENTS.filter((s) => s.studying).length;

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
              LIVE · refresh 2s
            </Typography>
          </Stack>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Online now" value={onlineCount} hint={`/ ${STUDENTS.length} students`} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active practice attempts" value={Math.max(1, (tick % 7) + 3)} hint="across all classes" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Avg focus score" value={`${Math.round(series[series.length - 1])}%`} delta={2} color="info" />
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
                  { data: series, label: "Avg focus", curve: "natural", color: "#0F6963", showMark: false, area: true },
                  { data: scoreSeries, label: "Avg quiz score", curve: "natural", color: "#F25C2E", showMark: false },
                ]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Students right now
              </Typography>
              <Stack spacing={1.5}>
                {STUDENTS.map((s) => (
                  <Stack key={s.id} direction="row" alignItems="center" spacing={2} sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                    <Box sx={{ position: "relative" }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.8rem", fontWeight: 700 }}>
                        {s.name.split(" ").map((p) => p[0]).join("")}
                      </Avatar>
                      {s.studying && (
                        <Box sx={{ position: "absolute", bottom: -2, right: -2, p: 0.4, bgcolor: "background.paper", borderRadius: "50%" }}>
                          <Dot color="success" pulsing size={8} />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.name}
                      </Typography>
                      <Typography variant="caption" color={s.studying ? "success.main" : "text.secondary"}>
                        {s.activity}
                      </Typography>
                    </Box>
                    {s.studying && (
                      <Box sx={{ minWidth: 140 }}>
                        <Typography variant="caption" color="text.secondary">
                          Focus
                        </Typography>
                        <LinearProgress variant="determinate" value={s.focus} color={s.focus > 70 ? "success" : "warning"} sx={{ height: 6, borderRadius: 999 }} />
                      </Box>
                    )}
                  </Stack>
                ))}
              </Stack>
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
