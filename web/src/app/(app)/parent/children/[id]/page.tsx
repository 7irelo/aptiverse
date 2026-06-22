"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { CHILDREN, SUBJECTS } from "@/lib/mockData";
import { initials, minutesToHours } from "@/lib/format";
import { Dot } from "@/components/common/Dot";

export default function ChildDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const c = CHILDREN.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <>
      <PageHeader
        title={c.name}
        description={`Grade ${c.grade} · ${c.school}`}
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Children", href: "/parent/children" }, { label: c.name }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: "primary.main", fontWeight: 700, fontSize: "1.5rem", mx: "auto" }}>{initials(c.name)}</Avatar>
                {c.isStudyingNow && (
                  <Box sx={{ position: "absolute", bottom: 2, right: 2, p: 0.5, bgcolor: "background.paper", borderRadius: "50%" }}>
                    <Dot color="success" pulsing size={11} />
                  </Box>
                )}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                {c.name}
              </Typography>
              {c.isStudyingNow && c.currentActivity && (
                <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                  ● Studying: {c.currentActivity}
                </Typography>
              )}
              <Stack direction="row" spacing={3} sx={{ mt: 3, justifyContent: "center" }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Predicted
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {c.predictedAverage}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Weekly
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {minutesToHours(c.weeklyMinutes)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Mood
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {c.moodAvg.toFixed(1)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Subjects
              </Typography>
              <Stack spacing={1.5}>
                {SUBJECTS.slice(0, 5).map((s) => (
                  <Box key={s.id}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{s.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {s.currentAverage}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={s.currentAverage} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mood last 14 days
              </Typography>
              <LineChart
                height={240}
                xAxis={[{ data: Array.from({ length: 14 }, (_, i) => `D${i + 1}`), scaleType: "point" }]}
                yAxis={[{ min: 1, max: 5 }]}
                series={[{ data: Array.from({ length: 14 }, () => Math.max(1, Math.min(5, c.moodAvg + (Math.random() - 0.5)))), curve: "monotoneX", color: "#F25C2E", showMark: false }]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
