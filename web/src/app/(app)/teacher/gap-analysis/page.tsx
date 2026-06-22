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
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useGaps, type Gap } from "@/lib/api/queries";

export default function GapAnalysisPage() {
  const query = useGaps();

  return (
    <>
      <PageHeader
        title="Gap analysis"
        description="Topics where the class is falling behind, with one-click responses."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Gap analysis" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <InsightsIcon />,
          title: "No gaps flagged",
          description: "Your classes are broadly on track. Gap topics surface here as soon as a cohort dips.",
        }}
      >
        {(gaps) => <GapAnalysisView gaps={gaps} />}
      </QueryStates>
    </>
  );
}

function GapAnalysisView({ gaps }: { gaps: Gap[] }) {
  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Mastery distribution per gap topic
            </Typography>
            <BarChart
              height={300}
              xAxis={[{ data: gaps.map((g) => g.topic), scaleType: "band" }]}
              yAxis={[{ min: 0, max: 100 }]}
              series={[
                { data: gaps.map((g) => g.strugglingPct), label: "Struggling %", color: "#F25C2E" },
                { data: gaps.map((g) => 100 - g.strugglingPct), label: "On track %", color: "#0F6963" },
              ]}
            />
          </CardContent>
        </Card>
      </Grid>
      {gaps.map((g) => (
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
  );
}
