"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { COURSES } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";

export default function TutorDashboard() {
  return (
    <>
      <PageHeader
        title="Tutor dashboard"
        description="Earnings, sessions, students and reviews — at a glance."
        breadcrumbs={[{ label: "Home" }]}
        actions={<Button component={Link} href="/tutor/courses" variant="contained">New course</Button>}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="This month" value={formatCurrency(28400)} delta={18} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active students" value={42} delta={6} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Upcoming sessions" value={11} hint="next 7 days" color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Avg rating" value="4.9" hint="from 124 reviews" color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Earnings — last 6 months
              </Typography>
              <LineChart
                height={300}
                xAxis={[{ data: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], scaleType: "point" }]}
                series={[{ data: [14000, 18500, 21000, 24800, 26700, 28400], label: "ZAR", curve: "monotoneX", color: "#0F6963", area: true }]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top selling courses
              </Typography>
              <Stack spacing={1.5}>
                {COURSES.slice(0, 4).map((c) => (
                  <Stack key={c.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 1.5 }}>
                    <Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {c.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.enrolled} enrolled · ★ {c.rating}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                      {formatCurrency(c.price)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
