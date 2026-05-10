"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { PageHeader } from "@/components/common/PageHeader";

export default function SchoolAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Year-over-year, subject, demographic and pathway analytics."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Analytics" }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Subject performance vs national average
              </Typography>
              <BarChart
                height={320}
                xAxis={[{ data: ["Maths", "PhSci", "Eng HL", "LSci", "Geo", "Afr FAL", "LO"], scaleType: "band" }]}
                series={[
                  { data: [71, 68, 76, 70, 72, 64, 82], label: "School", color: "#0F6963" },
                  { data: [62, 60, 70, 65, 68, 58, 78], label: "Province", color: "#9FB1C2" },
                ]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                University-readiness mix
              </Typography>
              <PieChart
                height={260}
                series={[
                  {
                    data: [
                      { id: 0, value: 62, label: "Ready" },
                      { id: 1, value: 28, label: "Borderline" },
                      { id: 2, value: 10, label: "Stretch" },
                    ],
                    arcLabel: (d) => `${d.value}%`,
                    innerRadius: 50,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Wellbeing index over the year
              </Typography>
              <LineChart
                height={300}
                xAxis={[{ data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], scaleType: "point" }]}
                yAxis={[{ min: 1, max: 5 }]}
                series={[
                  { data: [3.6, 3.7, 3.5, 3.4, 3.5, 3.7, 3.8, 3.6, 3.4, 3.3, 3.5], label: "Avg mood (1-5)", curve: "monotoneX", color: "#F25C2E" },
                ]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
