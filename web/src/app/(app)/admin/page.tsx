"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Platform metrics
              </Typography>
              <EmptyState
                icon={<InsightsOutlinedIcon />}
                title="No metrics yet"
                description="Active learners, schools, revenue and tutor numbers will appear here once the platform analytics service is wired up. We don't show placeholder figures."
              />
            </CardContent>
          </Card>
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pending review
              </Typography>
              <EmptyState
                size="compact"
                icon={<FactCheckOutlinedIcon />}
                title="Nothing to review here yet"
                description="Verification, approval and moderation queues surface here once their counts are reported by the backend. Open a specific queue to action items directly."
                action={
                  <Button component={Link} href="/admin/moderation" variant="outlined" size="small">
                    Open moderation queue
                  </Button>
                }
              />
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
