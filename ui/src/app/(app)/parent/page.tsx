"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { LineChart } from "@mui/x-charts/LineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Dot } from "@/components/common/Dot";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { CHILDREN } from "@/lib/mockData";
import { initials } from "@/lib/format";
import Link from "next/link";

export default function ParentDashboard() {
  return (
    <>
      <PageHeader
        title="Family dashboard"
        description="Real, useful insights — without surveillance. See how your kids are doing, and exactly how you can help."
        breadcrumbs={[{ label: "Home" }]}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Children on plan" value={CHILDREN.length} hint="Family plan" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Studying right now" value={CHILDREN.filter((c) => c.isStudyingNow).length} hint="live" color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="This week's minutes" value={CHILDREN.reduce((s, c) => s + c.weeklyMinutes, 0)} delta={12} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Average wellbeing" value="3.5 / 5" hint="Steady" color="secondary" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {CHILDREN.map((c) => (
              <Card key={c.id}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ md: "center" }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 220 }}>
                      <Box sx={{ position: "relative" }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontWeight: 700 }}>{initials(c.name)}</Avatar>
                        {c.isStudyingNow && (
                          <Box sx={{ position: "absolute", bottom: 0, right: 0, p: 0.4, bgcolor: "background.paper", borderRadius: "50%" }}>
                            <Dot color="success" pulsing size={10} />
                          </Box>
                        )}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {c.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Grade {c.grade} · {c.school}
                        </Typography>
                        {c.isStudyingNow && c.currentActivity && (
                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }}>
                            <Dot color="success" pulsing size={6} />
                            <Typography variant="caption" sx={{ color: "success.main", fontWeight: 600 }}>
                              {c.currentActivity}
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Predicted average
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {c.predictedAverage}% ({c.trend > 0 ? "+" : ""}{c.trend}pp)
                        </Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={c.predictedAverage} color={c.trend >= 0 ? "primary" : "warning"} sx={{ mb: 2 }} />

                      <Stack direction="row" spacing={3}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Weekly study
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {Math.floor(c.weeklyMinutes / 60)}h {c.weeklyMinutes % 60}m
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Mood
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {c.moodAvg.toFixed(1)} / 5
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <Stack spacing={1}>
                      <Button component={Link} href="/parent/help" variant="contained" size="small">
                        How can I help?
                      </Button>
                      <Button component={Link} href={`/parent/children/${c.id}`} variant="outlined" size="small">
                        Open profile
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Family weekly study minutes
                </Typography>
                <LineChart
                  height={260}
                  xAxis={[{ data: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"], scaleType: "point" }]}
                  series={CHILDREN.map((c) => ({
                    data: Array.from({ length: 8 }, (_, i) => c.weeklyMinutes - 50 + i * 12 + Math.round(Math.sin(i) * 30)),
                    label: c.name,
                    curve: "monotoneX",
                  }))}
                  grid={{ horizontal: true }}
                />
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <LiveActivityFeed
              title="Live activity"
              description="Your kids' Aptiverse activity, in real time"
              height={420}
            />
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Celebrations
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { who: "Thandi", what: "5-day study streak", when: "today" },
                    { who: "Lerato", what: "completed wellbeing goal", when: "yesterday" },
                    { who: "Thandi", what: "essay marked 78%", when: "2 days ago" },
                  ].map((c, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "secondary.main", color: "white" }}>🎉</Box>
                      <Box>
                        <Typography variant="body2">
                          <Box component="span" sx={{ fontWeight: 600 }}>
                            {c.who}
                          </Box>{" "}
                          {c.what}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.when}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
