"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { StatCard } from "@/components/common/StatCard";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { useSubjects } from "@/lib/api/queries";
import { brand } from "@/theme/palette";
import type { Subject } from "@/lib/mockData";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";

export default function MasteryPage() {
  const query = useSubjects();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Mastery"
        description="Where you're growing, where you're stuck, and what's coming next term."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mastery" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <InsightsIcon />,
          title: "No mastery data yet",
          description: "Add your matric subjects so we can show topic-by-topic mastery and predicted next-term marks.",
        }}
      >
        {(subjects) => <MasteryView subjects={subjects} />}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function MasteryView({ subjects }: { subjects: Subject[] }) {
  const allTopics = subjects.flatMap((s) => (s.topics ?? []).map((t) => ({ ...t, subject: s.name })));
  const weakest = [...allTopics].sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  const strongest = [...allTopics].sort((a, b) => b.mastery - a.mastery).slice(0, 5);
  const overall =
    allTopics.length > 0
      ? Math.round(allTopics.reduce((s, t) => s + t.mastery, 0) / allTopics.length)
      : 0;

  return (
    <>
      {/* 3-up stat row instead of 4-up. "Subjects tracked" was filler
          (count is already visible in the sidebar nav and bar chart
          below); info-blue isn't a brand zone we use elsewhere. The
          remaining three carry meaningful signal: where you are
          overall, where you're strong, where you're stuck. */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Overall mastery" value={`${overall}%`} icon={<TrendingUpIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Strongest topic" value={`${strongest[0]?.mastery ?? 0}%`} hint={strongest[0]?.name ?? "None yet"} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Weakest topic" value={`${weakest[0]?.mastery ?? 0}%`} hint={weakest[0]?.name ?? "None yet"} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mastery trend across subjects
              </Typography>
              <LineChart
                height={360}
                xAxis={[{ data: ["T1", "T2", "T3", "T4"], scaleType: "point" }]}
                series={subjects
                  .filter((s) => s.termAverages && s.termAverages.length > 0)
                  .map((s) => ({
                    data: (s.termAverages ?? []).map((t) => t.mark),
                    label: s.name,
                    curve: "monotoneX",
                  }))}
                margin={{ top: 16, right: 24, bottom: 32, left: 40 }}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="warning.main">
                  Focus next
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Weakest topics
                </Typography>
                <Stack spacing={1.5}>
                  {weakest.map((t) => (
                    <Box key={`${t.subject}-${t.name}`}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{t.name}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {t.mastery}%
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t.subject}
                      </Typography>
                      <LinearProgress variant="determinate" value={t.mastery} color="warning" sx={{ mt: 0.5 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="success.main">
                  Strengths
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Your top topics
                </Typography>
                <Stack spacing={1.5}>
                  {strongest.map((t) => (
                    <Box key={`${t.subject}-${t.name}`}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{t.name}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {t.mastery}%
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {t.subject}
                      </Typography>
                      <LinearProgress variant="determinate" value={t.mastery} color="success" sx={{ mt: 0.5 }} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Predicted next-term marks
              </Typography>
              <BarChart
                height={320}
                xAxis={[{ data: subjects.map((s) => s.code), scaleType: "band" }]}
                series={[
                  { data: subjects.map((s) => s.currentAverage ?? null), label: "Current term", color: brand.teal[600] },
                  { data: subjects.map((s) => s.predictedNextTerm ?? null), label: "Predicted next", color: brand.terracotta[500] },
                ]}
                margin={{ top: 16, right: 24, bottom: 32, left: 40 }}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
