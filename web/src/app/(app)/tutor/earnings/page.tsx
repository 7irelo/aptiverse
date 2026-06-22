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
import { DataList } from "@/components/data/DataList";
import { formatCurrency, formatDate } from "@/lib/format";
import dayjs from "dayjs";

const PAYOUTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `pay-${i}`,
  date: dayjs().subtract(i, "week").toISOString(),
  gross: 6500 + Math.round(Math.random() * 3000),
  fee: 0,
  net: 0,
})).map((p) => ({ ...p, fee: Math.round(p.gross * 0.08), net: Math.round(p.gross * 0.92) }));

export default function TutorEarningsPage() {
  return (
    <>
      <PageHeader
        title="Earnings"
        description="Weekly payouts to your bank — net of platform fee."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Earnings" }]}
        actions={<Button variant="contained">Bank details</Button>}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="This month" value={formatCurrency(28400)} delta={18} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Pending payout" value={formatCurrency(8200)} hint="next Fri" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Lifetime" value={formatCurrency(412800)} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Platform fee" value="8%" hint="capped per session" color="secondary" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Earnings — last 12 months
          </Typography>
          <LineChart
            height={280}
            xAxis={[{ data: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"], scaleType: "point" }]}
            series={[{ data: [12000, 8000, 9500, 14200, 17800, 18900, 19400, 22600, 24100, 26500, 27200, 28400], label: "ZAR", color: "#0F6963", area: true }]}
            grid={{ horizontal: true }}
          />
        </CardContent>
      </Card>

      <DataList
        title="Payouts"
        rows={PAYOUTS}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Payout" },
          { key: "date", header: "Date", render: (r) => formatDate(r.date) },
          { key: "gross", header: "Gross", align: "right", render: (r) => formatCurrency(r.gross) },
          { key: "fee", header: "Fee", align: "right", render: (r) => formatCurrency(r.fee) },
          { key: "net", header: "Net", align: "right", render: (r) => <Typography sx={{ fontWeight: 600 }}>{formatCurrency(r.net)}</Typography> },
        ]}
        searchable={false}
        pageSize={5}
      />
    </>
  );
}
