"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { CLASSES } from "@/lib/mockData";

export default function TeacherAnalytics() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Class-wide gap analysis — what to teach next, and to whom."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Analytics" }]}
      />

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
                series={CLASSES.map((c) => ({
                  data: Array.from({ length: 8 }, (_, i) => Math.round(c.averageMastery - 8 + i * 1.5)),
                  label: c.name,
                  curve: "monotoneX",
                }))}
                grid={{ horizontal: true }}
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
                grid={{ horizontal: true }}
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
                {[
                  { topic: "Chemical Equilibrium", className: "12B PhSci", pct: 70 },
                  { topic: "Calculus chain rule", className: "12A Maths", pct: 64 },
                  { topic: "Poetry analysis", className: "11A English", pct: 52 },
                  { topic: "Evolution & speciation", className: "12A LSci", pct: 48 },
                ].map((g) => (
                  <Box key={g.topic}>
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
    </>
  );
}
