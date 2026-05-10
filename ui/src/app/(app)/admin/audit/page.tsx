"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { initials, formatDate } from "@/lib/format";
import dayjs from "dayjs";

const AUDIT = Array.from({ length: 30 }).map((_, i) => ({
  id: `evt-${i}`,
  actor: ["admin@aptiverse", "naidoo@school.example", "kabelo@aptiverse", "support@aptiverse"][i % 4],
  action: ["user.update", "tutor.verify", "course.approve", "payment.refund", "flag.toggle", "school.create", "user.suspend"][i % 7],
  resource: ["user/u-1042", "tutor/t1", "course/c3", "charge/ch_4711", "flag/voice_diary", "school/sch-12", "user/u-2204"][i % 7],
  ip: ["196.211.42.18", "165.73.12.4", "41.114.93.21"][i % 3],
  ts: dayjs().subtract(i * 17, "minute").toISOString(),
  severity: i % 6 === 0 ? "high" : "info",
}));

export default function AuditLogPage() {
  return (
    <PermissionGuard require="audit.read">
      <PageHeader
        title="Audit log"
        description="Every admin action, immutable, exportable."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit log" }]}
      />
      <DataList
        rows={AUDIT}
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
    </PermissionGuard>
  );
}
