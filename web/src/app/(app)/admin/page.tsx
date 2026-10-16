"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { StatCard } from "@/components/common/StatCard";
import { CardError } from "@/components/common/CardError";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { useAdminOverview, type AdminOverview } from "@/lib/api/queries";
import { formatCurrency } from "@/lib/format";
import { identityRoleLabel } from "@/lib/rbac";

// Real counts, from GET /api/admin/overview.
//
// The previous version showed two permanent empty states explaining that
// metrics would appear "once the platform analytics service is wired up". The
// numbers were always available: they are counts of rows in tables this API
// already owns.
export default function AdminDashboard() {
  const overview = useAdminOverview();

  return (
    <PermissionGuard require="system.read">
      <PageHeader
        title="Admin"
        description="The platform as it actually is. Every number here is a count of real rows."
        breadcrumbs={[{ label: "Admin" }]}
        actions={
          <>
            <Button component={Link} href="/admin/audit" variant="outlined">
              Audit log
            </Button>
            <Button component={Link} href="/admin/users" variant="contained">
              Users
            </Button>
          </>
        }
      />

      {overview.isLoading && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid key={i} size={{ xs: 6, md: 3 }}>
              <Skeleton variant="rounded" height={120} />
            </Grid>
          ))}
        </Grid>
      )}

      {overview.isError && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <CardError what="the platform numbers" onRetry={() => void overview.refetch()} />
          </CardContent>
        </Card>
      )}

      {overview.data && <Numbers data={overview.data} />}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>{overview.data && <Breakdown data={overview.data} />}</Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <LiveActivityFeed
            title="Platform live activity"
            description="Projected from the audit trail as entries are written."
            height={520}
          />
        </Grid>
      </Grid>
    </PermissionGuard>
  );
}

function Numbers({ data }: { data: AdminOverview }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard label="Accounts" value={data.users} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Live subscriptions"
          value={data.subscriptionsLive}
          hint={data.subscriptionsPastDue > 0 ? `${data.subscriptionsPastDue} past due` : undefined}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="MRR at list price"
          value={formatCurrency(Math.round(data.monthlyRecurringRevenueZar))}
          hint="annual plans over 12"
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          label="Fresh enquiries"
          value={data.schoolEnquiriesUncontacted}
          hint={`${data.schoolEnquiries} total`}
          color="warning"
        />
      </Grid>
    </Grid>
  );
}

function Breakdown({ data }: { data: AdminOverview }) {
  const roles = Object.entries(data.usersByRole).sort((a, b) => b[1] - a[1]);

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Accounts by role
          </Typography>
          {roles.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No roles assigned to any account.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {roles.map(([role, count]) => (
                <Chip key={role} label={`${identityRoleLabel(role)}: ${count}`} />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Needs attention
          </Typography>
          <Stack spacing={1.5}>
            <AttentionRow
              label="School enquiries not yet contacted"
              value={data.schoolEnquiriesUncontacted}
              href="/admin/school-enquiries"
            />
            <AttentionRow
              label="Subscriptions past due"
              value={data.subscriptionsPastDue}
              href="/admin/subscriptions"
            />
            <AttentionRow
              label="Tutor profiles awaiting verification"
              value={data.tutorsUnverified}
              href="/admin/tutors"
            />
            <AttentionRow
              label="Events waiting in the outbox"
              value={data.outboxPending}
              href="/admin/system"
            />
            <AttentionRow
              label="Audit entries in the last 24 hours"
              value={data.auditEventsLast24h}
              href="/admin/audit"
              neutral
            />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function AttentionRow({
  label,
  value,
  href,
  neutral,
}: {
  label: string;
  value: number;
  href: string;
  neutral?: boolean;
}) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
      <Typography variant="body2">{label}</Typography>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Typography
          variant="body2"
          sx={{ fontWeight: 700 }}
          color={!neutral && value > 0 ? "warning.main" : "text.primary"}
        >
          {value}
        </Typography>
        <Button component={Link} href={href} size="small" variant="text">
          Open
        </Button>
      </Stack>
    </Stack>
  );
}
