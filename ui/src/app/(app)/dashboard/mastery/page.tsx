"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { SUBJECTS } from "@/lib/mockData";
import { StatCard } from "@/components/common/StatCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function MasteryPage() {
  const allTopics = SUBJECTS.flatMap((s) => s.topics.map((t) => ({ ...t, subject: s.name })));
  const weakest = [...allTopics].sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  const strongest = [...allTopics].sort((a, b) => b.mastery - a.mastery).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Mastery"
        description="Where you're growing, where you're stuck — and what's coming next term."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mastery" }]}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Overall mastery" value="68%" delta={6} icon={<TrendingUpIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Strongest topic" value={`${strongest[0]?.mastery}%`} hint={strongest[0]?.name} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Weakest topic" value={`${weakest[0]?.mastery}%`} hint={weakest[0]?.name} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Term lift" value="+5pp" hint="vs T3" color="info" />
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
                series={SUBJECTS.map((s) => ({
                  data: s.termAverages.map((t) => t.mark),
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
                xAxis={[{ data: SUBJECTS.map((s) => s.code), scaleType: "band" }]}
                series={[
                  { data: SUBJECTS.map((s) => s.currentAverage), label: "Current term", color: "#0F6963" },
                  { data: SUBJECTS.map((s) => s.predictedNextTerm), label: "Predicted next", color: "#F25C2E" },
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
