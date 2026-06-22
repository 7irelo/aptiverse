"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { PieChartArcLabel } from "@/components/common/PieChartArcLabel";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { formatCurrency, formatDate } from "@/lib/format";
import dayjs from "dayjs";

const SUBS = Array.from({ length: 30 }).map((_, i) => ({
  id: `sub-${i}`,
  customer: ["Mokoena Family", "Greenside HS", "T. Modise (tutor)", "S. Naidoo (student)"][i % 4] + ` #${i + 1}`,
  plan: ["Family", "School", "Student", "Free"][i % 4],
  amount: [199, 0, 99, 0][i % 4] || 8500,
  status: i % 9 === 0 ? "past_due" : i % 13 === 0 ? "cancelled" : "active",
  renewsAt: dayjs().add((i % 28) - 5, "day").toISOString(),
}));

export default function SubscriptionsPage() {
  return (
    <PermissionGuard require="subscriptions.read">
      <PageHeader
        title="Subscriptions"
        description="All active and historical subscriptions."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Subscriptions" }]}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active subs" value={2842} delta={5} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="MRR" value={formatCurrency(1_240_000)} delta={11} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Churn (30d)" value="2.1%" delta={-0.3} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Past due" value={42} hint="needs follow-up" color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                MRR
              </Typography>
              <LineChart
                height={260}
                xAxis={[{ data: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"], scaleType: "point" }]}
                series={[{ data: [890_000, 950_000, 1_010_000, 1_080_000, 1_180_000, 1_240_000], curve: "monotoneX", color: "#0F6963", area: true }]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Plan mix
              </Typography>
              <PieChart
                height={260}
                series={[
                  {
                    data: [
                      { id: 0, value: 1842, label: "Student" },
                      { id: 1, value: 720, label: "Family" },
                      { id: 2, value: 184, label: "School" },
                      { id: 3, value: 96, label: "Free → conv" },
                    ],
                    innerRadius: 50,
                    arcLabel: (item) => `${Math.round((item.value / 2842) * 100)}%`,
                    arcLabelMinAngle: 18,
                    arcLabelRadius: "100%",
                    highlightScope: { fade: "global" },
                  },
                ]}
                slots={{ pieArcLabel: PieChartArcLabel }}
                hideLegend
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DataList
        title="Subscriptions"
        rows={SUBS}
        rowKey={(r) => r.id}
        columns={[
          { key: "customer", header: "Customer", sortable: true },
          { key: "plan", header: "Plan", render: (r) => <Chip label={r.plan} size="small" /> },
          { key: "amount", header: "Amount", align: "right", render: (r) => formatCurrency(r.amount) },
          { key: "renewsAt", header: "Renews", render: (r) => formatDate(r.renewsAt) },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Chip
                label={r.status.replace("_", " ")}
                size="small"
                color={r.status === "active" ? "success" : r.status === "past_due" ? "warning" : "default"}
                sx={{ textTransform: "capitalize" }}
              />
            ),
          },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="outlined">
              Open
            </Button>
            <Button size="small" color="error">
              Cancel
            </Button>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
