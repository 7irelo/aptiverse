"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import HistoryIcon from "@mui/icons-material/HistoryOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { useAuditLogs, type AuditLog } from "@/lib/api/queries";
import { initials, formatDate } from "@/lib/format";

export default function AuditLogPage() {
  const query = useAuditLogs(60);

  return (
    <PermissionGuard require="audit.read">
      <PageHeader
        title="Audit log"
        description="Every admin action, immutable, exportable."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit log" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <HistoryIcon />,
          title: "No audit events yet",
          description: "Audit entries appear here as admins act on users, schools, payments and flags.",
        }}
      >
        {(rows) => <AuditTable rows={rows} />}
      </QueryStates>
    </PermissionGuard>
  );
}

function AuditTable({ rows }: { rows: AuditLog[] }) {
  return (
    <DataList
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        { key: "ts", header: "When", sortable: true, render: (r) => formatDate(r.ts, "DD MMM HH:mm:ss") },
        {
          key: "actor",
          header: "Actor",
          render: (r) => (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "primary.main" }}>{initials(r.actor)}</Avatar>
              <Typography variant="body2">{r.actor}</Typography>
            </Stack>
          ),
        },
        { key: "action", header: "Action", render: (r) => <Chip label={r.action} size="small" sx={{ fontFamily: "monospace" }} /> },
        { key: "resource", header: "Resource", render: (r) => <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{r.resource}</Typography> },
        { key: "ip", header: "IP" },
        {
          key: "severity",
          header: "Severity",
          render: (r) => <Chip label={r.severity} size="small" color={r.severity === "high" ? "warning" : "default"} />,
        },
      ]}
    />
  );
}
