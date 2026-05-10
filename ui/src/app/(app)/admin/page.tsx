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
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { formatCurrency } from "@/lib/format";
import GroupsIcon from "@mui/icons-material/Groups";
import SchoolIcon from "@mui/icons-material/School";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <PermissionGuard require="system.read">
      <PageHeader
        title="Admin"
        description="Platform health and tools. Be careful — most actions affect production data."
        breadcrumbs={[{ label: "Admin" }]}
        actions={
          <>
            <Button component={Link} href="/admin/audit" variant="outlined">
              Audit log
            </Button>
            <Button component={Link} href="/admin/system" variant="contained">
              System health
            </Button>
          </>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active learners" value="12,406" delta={4} icon={<SchoolIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Schools" value={184} delta={6} icon={<GroupsIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="MRR" value={formatCurrency(1_240_000)} delta={11} icon={<PaymentsIcon />} color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active tutors" value={642} delta={3} icon={<StorefrontIcon />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Platform MRR (last 12 months)
              </Typography>
              <LineChart
                height={300}
                xAxis={[{ data: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"], scaleType: "point" }]}
                series={[{ data: [620000, 670000, 740000, 820000, 890000, 940000, 1_010_000, 1_080_000, 1_140_000, 1_180_000, 1_210_000, 1_240_000], label: "ZAR", color: "#0F6963", area: true }]}
                grid={{ horizontal: true }}
              />
            </CardContent>
          </Card>
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pending review
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { label: "12 tutor verifications", href: "/admin/tutors" },
                  { label: "8 course approvals", href: "/admin/courses" },
                  { label: "3 bursary listings", href: "/admin/bursaries" },
                  { label: "5 moderation flags", href: "/admin/moderation" },
                  { label: "2 refund requests", href: "/admin/payments" },
                ].map((p) => (
                  <Stack key={p.label} direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                    <Typography variant="body2">{p.label}</Typography>
                    <Button component={Link} href={p.href} size="small" variant="outlined">
                      Review
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <LiveActivityFeed title="Platform live activity" height={680} />
        </Grid>
      </Grid>
    </PermissionGuard>
  );
}
