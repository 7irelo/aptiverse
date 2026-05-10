"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { BarChart } from "@mui/x-charts/BarChart";
import { PageHeader } from "@/components/common/PageHeader";

const GAPS = [
  { topic: "Calculus chain rule", className: "12A Maths", strugglingPct: 64, sample: 28 },
  { topic: "Chemical Equilibrium", className: "12B PhSci", strugglingPct: 70, sample: 26 },
  { topic: "Poetry analysis", className: "11A English", strugglingPct: 52, sample: 30 },
  { topic: "Evolution & speciation", className: "12A LSci", strugglingPct: 48, sample: 24 },
];

export default function GapAnalysisPage() {
  return (
    <>
      <PageHeader
        title="Gap analysis"
        description="Topics where the class is falling behind, with one-click responses."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Gap analysis" }]}
      />

      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mastery distribution per gap topic
              </Typography>
              <BarChart
                height={300}
                xAxis={[{ data: GAPS.map((g) => g.topic), scaleType: "band" }]}
                yAxis={[{ min: 0, max: 100 }]}
                series={[
                  { data: GAPS.map((g) => g.strugglingPct), label: "Struggling %", color: "#F25C2E" },
                  { data: GAPS.map((g) => 100 - g.strugglingPct), label: "On track %", color: "#0F6963" },
                ]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        {GAPS.map((g) => (
          <Grid key={g.topic} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {g.topic}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {g.className} · {g.sample} learners surveyed
                    </Typography>
                  </Box>
                  <Chip label={`${g.strugglingPct}%`} color="warning" size="small" />
                </Stack>
                <LinearProgress variant="determinate" value={g.strugglingPct} color="warning" sx={{ mt: 1, height: 8, borderRadius: 999 }} />
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                  <Button size="small" variant="contained">
                    Generate review SBA
                  </Button>
                  <Button size="small" variant="outlined">
                    Find resources
                  </Button>
                  <Button size="small" variant="outlined">
                    Schedule lesson
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
