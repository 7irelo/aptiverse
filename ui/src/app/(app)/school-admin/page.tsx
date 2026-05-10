"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { LineChart } from "@mui/x-charts/LineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import Link from "next/link";

export default function SchoolAdminDashboard() {
  return (
    <>
      <PageHeader
        title="School dashboard"
        description="Whole-school analytics and university readiness, in one calm view."
        breadcrumbs={[{ label: "Home" }]}
        actions={<Button component={Link} href="/school-admin/readiness" variant="contained">Readiness report</Button>}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Learners" value={612} hint="Grade 11 + 12" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Teachers" value={42} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Avg pass rate" value="84%" delta={3} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="University-ready" value="62%" delta={7} hint="vs last year" color="secondary" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Whole-school mastery trend (3 years)
              </Typography>
              <LineChart
                height={320}
                xAxis={[{ data: ["2023 T1", "2023 T2", "2023 T3", "2023 T4", "2024 T1", "2024 T2", "2024 T3", "2024 T4", "2025 T1", "2025 T2", "2025 T3", "2025 T4"], scaleType: "point" }]}
                series={[
                  { data: [62, 64, 65, 66, 64, 66, 67, 68, 67, 69, 70, 71], label: "Mastery %", curve: "monotoneX", color: "#0F6963" },
                  { data: [55, 56, 58, 59, 60, 61, 62, 63, 62, 64, 65, 67], label: "Provincial avg", curve: "monotoneX", color: "#9FB1C2" },
                ]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {[
              { label: "Top subject", value: "Mathematics", caption: "+11pp this year" },
              { label: "Most-improved", value: "Life Sciences", caption: "+8pp" },
              { label: "Watch", value: "Afrikaans FAL", caption: "−2pp" },
              { label: "Wellbeing", value: "3.7 / 5", caption: "Steady" },
            ].map((c) => (
              <Grid key={c.label} size={{ xs: 12, sm: 6 }}>
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="text.secondary">
                      {c.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {c.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.caption}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <LiveActivityFeed title="Live school activity" height={680} />
        </Grid>
      </Grid>
    </>
  );
}
