"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { CardError } from "@/components/common/CardError";
import { EmptyState } from "@/components/common/EmptyState";
import { Dot } from "@/components/common/Dot";
import { Inbox } from "lucide-react";
import { useAdminSystem, useOutboxMessages, type AdminSystem } from "@/lib/api/queries";
import { formatDate, formatRelative } from "@/lib/format";

// What the API can actually tell you about itself.
//
// The page this replaces listed eight named microservices, each with a p95 and
// an RPS figure, plus an "aggregate request rate" chart driven by
// Math.sin(tick) + Math.random(). None of it was measured, and the platform is
// one process, not twenty. This shows the database round trip, the outbox
// backlog, and the host's own uptime and environment.
export default function SystemHealth() {
  const system = useAdminSystem();
  const outbox = useOutboxMessages();

  return (
    <PermissionGuard require="system.read">
      <PageHeader
        title="System"
        description="Live status of the API host, its database connection and the event outbox. Refreshes every 15 seconds."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "System" }]}
        actions={
          system.data ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Dot color={system.data.databaseOk ? "success" : "error"} pulsing />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700 }}
                color={system.data.databaseOk ? "success.main" : "error.main"}
              >
                {system.data.databaseOk ? "HEALTHY" : "DEGRADED"}
              </Typography>
            </Stack>
          ) : null
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                API host
              </Typography>
              {system.isLoading && <Skeleton variant="rounded" height={180} />}
              {system.isError && (
                <CardError what="system status" onRetry={() => void system.refetch()} />
              )}
              {system.data && <HostPanel data={system.data} />}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Event outbox
              </Typography>
              {system.isLoading && <Skeleton variant="rounded" height={180} />}
              {system.isError && (
                <CardError what="outbox stats" onRetry={() => void system.refetch()} />
              )}
              {system.data && <OutboxPanel data={system.data} />}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent events
              </Typography>
              {outbox.isLoading && <Skeleton variant="rounded" height={160} />}
              {outbox.isError && (
                <CardError what="recent events" onRetry={() => void outbox.refetch()} />
              )}
              {outbox.data && outbox.data.length === 0 && (
                <EmptyState
                  size="compact"
                  icon={<Inbox />}
                  title="No events published yet"
                  description="Modules write domain events to the outbox through IEventPublisher; the dispatcher drains them. Nothing has been published on this database."
                />
              )}
              {outbox.data && outbox.data.length > 0 && (
                <Stack spacing={1}>
                  {outbox.data.slice(0, 20).map((m) => (
                    <Stack
                      key={m.id}
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="space-between"
                      sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "action.hover" }}
                    >
                      <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                        {m.type}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={m.processedAt ? "processed" : "pending"}
                          color={m.processedAt ? "success" : "warning"}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatRelative(m.occurredAt)}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PermissionGuard>
  );
}

function HostPanel({ data }: { data: AdminSystem }) {
  return (
    <Stack spacing={1.5}>
      <Metric
        label="Database"
        value={data.databaseOk ? `Reachable, ${data.databaseLatencyMs} ms` : "Unreachable"}
        tone={data.databaseOk ? "success" : "error"}
      />
      <Metric label="Environment" value={data.environment} />
      <Metric label="Runtime" value={data.dotnetVersion} />
      <Metric label="Uptime" value={formatUptime(data.uptimeSeconds)} />
      <Metric label="Server time (UTC)" value={formatDate(data.serverTimeUtc, "DD MMM HH:mm:ss")} />
    </Stack>
  );
}

function OutboxPanel({ data }: { data: AdminSystem }) {
  const backlogged = data.outboxPending > 0;
  return (
    <Stack spacing={1.5}>
      <Metric
        label="Pending"
        value={String(data.outboxPending)}
        tone={backlogged ? "warning" : "success"}
      />
      <Metric label="Processed" value={String(data.outboxProcessed)} />
      <Metric
        label="Oldest pending"
        value={
          data.oldestPendingOccurredAt
            ? `${formatDate(data.oldestPendingOccurredAt, "DD MMM HH:mm")} (${formatRelative(data.oldestPendingOccurredAt)})`
            : "Nothing waiting"
        }
        tone={data.oldestPendingOccurredAt ? "warning" : undefined}
      />
    </Stack>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "error";
}) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="baseline">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ textAlign: "right", minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, wordBreak: "break-word" }}
          color={tone ? `${tone}.main` : undefined}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}
