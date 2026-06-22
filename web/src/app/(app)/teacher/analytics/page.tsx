"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useClasses } from "@/lib/api/queries";
import type { ClassRecord } from "@/lib/mockData";

export default function TeacherAnalytics() {
  const query = useClasses();

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Class-wide gap analysis — what to teach next, and to whom."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Analytics" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <InsightsIcon />,
          title: "Analytics will appear once you have classes",
          description: "Class mastery trends and gap topics surface here as soon as you have learners enrolled.",
        }}
      >
        {(classes) => <AnalyticsView classes={classes} />}
      </QueryStates>
    </>
  );
}

function AnalyticsView({ classes }: { classes: ClassRecord[] }) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 7 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Class mastery over the term
            </Typography>
            <LineChart
              height={300}
              xAxis={[{ data: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"], scaleType: "point" }]}
              series={classes.map((c) => ({
                data: Array.from({ length: 8 }, (_, i) => Math.round(c.averageMastery - 8 + i * 1.5)),
                label: c.name,
              }))}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Topic difficulty across classes
            </Typography>
            <BarChart
              height={300}
              xAxis={[
                {
                  data: ["Calculus", "Equilibrium", "Genetics", "Essay structure", "Mapwork", "Trig", "Mechanics"],
                  scaleType: "band",
                },
              ]}
              series={[
                { data: [42, 38, 56, 64, 70, 58, 52], label: "Average mastery", color: "#F25C2E" },
                { data: [80, 65, 78, 84, 82, 75, 70], label: "Top quartile", color: "#0F6963" },
              ]}
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 5 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" color="warning.main">
              Class-wide gaps
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              What to teach next
            </Typography>
            <Stack spacing={2}>
              {classes.flatMap((c) =>
                c.strugglingTopics.slice(0, 1).map((topic) => ({
                  topic,
                  className: c.name,
                  pct: Math.max(40, Math.round(100 - c.averageMastery)),
                })),
              ).slice(0, 4).map((g) => (
                <Box key={`${g.className}-${g.topic}`}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {g.topic}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {g.className}
                      </Typography>
                    </Box>
                    <Chip label={`${g.pct}% struggling`} size="small" color="warning" />
                  </Stack>
                  <LinearProgress variant="determinate" value={g.pct} color="warning" sx={{ height: 6, borderRadius: 999 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Differentiation suggestions
            </Typography>
            <Stack spacing={1.5}>
              {[
                { label: "Foundation", count: 6, suggestion: "Run a 20-min algebra warmup before Friday's lesson" },
                { label: "Core", count: 18, suggestion: "Use today's lesson plan as-is" },
                { label: "Challenge", count: 4, suggestion: "Stretch problem set ready in your library" },
              ].map((d) => (
                <Box key={d.label} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {d.label}
                    </Typography>
                    <Chip label={`${d.count} learners`} size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {d.suggestion}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
