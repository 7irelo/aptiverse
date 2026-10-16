"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import dynamic from "next/dynamic";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
// The Bar/Line wrappers already lazy-load @mui/x-charts, but this page also
// pulls PieChart directly, which would drag the whole charts bundle back into
// the first-load JS. Defer it the same way, behind a height-reserved skeleton.
const PieChart = dynamic(() => import("@mui/x-charts/PieChart").then((m) => m.PieChart), {
  ssr: false,
  loading: () => <Skeleton variant="rounded" height={260} />,
});
import { PieChartArcLabel } from "@/components/common/PieChartArcLabel";
import { PageHeader } from "@/components/common/PageHeader";
import { useChartSeriesColors } from "@/components/common/chartPalette";

export default function SchoolAnalyticsPage() {
  const seriesColor = useChartSeriesColors();
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
                  { data: [71, 68, 76, 70, 72, 64, 82], label: "School", color: seriesColor(0) },
                  { data: [62, 60, 70, 65, 68, 58, 78], label: "Province", color: seriesColor(2) },
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
                    arcLabelMinAngle: 18,
                    arcLabelRadius: "100%",
                    innerRadius: 50,
                    highlightScope: { fade: "global" },
                  },
                ]}
                slots={{ pieArcLabel: PieChartArcLabel }}
                hideLegend
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
                  { data: [3.6, 3.7, 3.5, 3.4, 3.5, 3.7, 3.8, 3.6, 3.4, 3.3, 3.5], label: "Avg mood (1-5)", curve: "monotoneX", color: seriesColor(1) },
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
