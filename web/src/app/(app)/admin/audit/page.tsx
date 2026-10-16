"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import { History, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import {
  useAuditLogs,
  useAuditActions,
  type AuditLog,
  type AuditLogFilters,
} from "@/lib/api/queries";
import { initials, formatDate } from "@/lib/format";
import { useDebounced } from "@/lib/hooks/useDebounced";

const PAGE_SIZE = 50;

// The real audit trail: audit.audit_logs, filtered server-side.
//
// Both halves of this were missing. GET /api/audit/logs returned a hardcoded
// empty array, and nothing anywhere wrote a row, so the page rendered "no audit
// events yet" whatever had happened. Admin actions are recorded now
// (Services/Audit/AuditTrail.cs) and this reads them back.
export default function AuditLogPage() {
  const [action, setAction] = useState("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AuditLog | null>(null);

  const debouncedSearch = useDebounced(search, 300);
  const filters: AuditLogFilters = {
    action: action || undefined,
    severity: severity || undefined,
    q: debouncedSearch || undefined,
    take: PAGE_SIZE,
    skip: page * PAGE_SIZE,
  };

  const query = useAuditLogs(filters);
  const actions = useAuditActions();

  const filtered = !!(action || severity || debouncedSearch);

  const reset = (fn: () => void) => {
    fn();
    setPage(0);
  };

  return (
    <PermissionGuard require="audit.read">
      <PageHeader
        title="Audit log"
        description="Who did what, when. Append-only: entries are written as admins act and never edited."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit log" }]}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          size="small"
          label="Search"
          placeholder="Actor email, entity type or id"
          value={search}
          onChange={(e) => reset(() => setSearch(e.target.value))}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <TextField
          select
          size="small"
          label="Action"
          value={action}
          onChange={(e) => reset(() => setAction(e.target.value))}
          sx={{ minWidth: { xs: "auto", sm: 220 } }}
        >
          <MenuItem value="">All actions</MenuItem>
          {(actions.data ?? []).map((a) => (
            <MenuItem key={a.name} value={a.name}>
              {a.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Severity"
          value={severity}
          onChange={(e) => reset(() => setSeverity(e.target.value))}
          sx={{ minWidth: { xs: "auto", sm: 150 } }}
        >
          <MenuItem value="">Any</MenuItem>
          {["info", "warning", "error", "critical"].map((s) => (
            <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <QueryStates
        query={query}
        isEmpty={(p) => p.items.length === 0 && !filtered}
        empty={{
          icon: <History />,
          title: "Nothing recorded yet",
          description:
            "Entries appear as admins change roles, verify tutors and work the sales pipeline. An empty trail here means no admin action has been taken, not that recording is off.",
        }}
      >
        {(p) =>
          p.items.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                No entries match those filters
              </Typography>
              <Button
                size="small"
                sx={{ mt: 1 }}
                onClick={() =>
                  reset(() => {
                    setAction("");
                    setSeverity("");
                    setSearch("");
                  })
                }
              >
                Clear filters
              </Button>
            </Box>
          ) : (
            <>
              <AuditTable rows={p.items} onSelect={setSelected} onRefresh={() => void query.refetch()} />
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ mt: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {p.skip + 1} to {p.skip + p.items.length} of {p.total}
                </Typography>
                <Button size="small" disabled={page === 0} onClick={() => setPage((n) => n - 1)}>
                  Previous
                </Button>
                <Button
                  size="small"
                  disabled={p.skip + p.items.length >= p.total}
                  onClick={() => setPage((n) => n + 1)}
                >
                  Next
                </Button>
              </Stack>
            </>
          )
        }
      </QueryStates>

      <EntryDrawer entry={selected} onClose={() => setSelected(null)} />
    </PermissionGuard>
  );
}

function AuditTable({
  rows,
  onSelect,
  onRefresh,
}: {
  rows: AuditLog[];
  onSelect: (r: AuditLog) => void;
  onRefresh: () => void;
}) {
  return (
    <DataList
      rows={rows}
      rowKey={(r) => r.id}
      searchable={false}
      pagination={false}
      onRefresh={onRefresh}
      onRowClick={onSelect}
      columns={[
        {
          key: "ts",
          header: "When",
          render: (r) => formatDate(r.ts, "DD MMM HH:mm:ss"),
        },
        {
          key: "actor",
          header: "Actor",
          render: (r) => (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "primary.main" }}>
                {initials(r.actor)}
              </Avatar>
              <Stack sx={{ minWidth: 0 }}>
                <Typography variant="body2" noWrap>
                  {r.actor}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {r.actorEmail}
                </Typography>
              </Stack>
            </Stack>
          ),
        },
        {
          key: "action",
          header: "Action",
          render: (r) => <Chip label={r.action} size="small" sx={{ fontFamily: "monospace" }} />,
        },
        {
          key: "resource",
          header: "Resource",
          hideOn: "sm",
          render: (r) => (
            <Typography variant="body2" sx={{ fontFamily: "monospace" }} noWrap>
              {r.resource || "None"}
            </Typography>
          ),
        },
        { key: "ip", header: "IP", hideOn: "md", render: (r) => r.ip || "Not recorded" },
        {
          key: "severity",
          header: "Severity",
          render: (r) => (
            <Chip
              label={r.severity}
              size="small"
              color={severityColor(r.severity)}
              sx={{ textTransform: "capitalize" }}
            />
          ),
        },
      ]}
    />
  );
}

function EntryDrawer({ entry, onClose }: { entry: AuditLog | null; onClose: () => void }) {
  return (
    <Drawer
      anchor="right"
      open={!!entry}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 }, maxWidth: "100%" } } }}
    >
      {entry && (
        <Stack sx={{ p: { xs: 2, sm: 3 } }} spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Audit entry</Typography>
            <IconButton onClick={onClose} aria-label="Close">
              <X size={18} />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={entry.action} sx={{ fontFamily: "monospace" }} />
            {entry.category && <Chip size="small" label={entry.category} />}
            <Chip
              size="small"
              label={entry.severity}
              color={severityColor(entry.severity)}
              sx={{ textTransform: "capitalize" }}
            />
          </Stack>

          <Divider />

          <Row label="When" value={formatDate(entry.ts, "DD MMM YYYY HH:mm:ss")} />
          <Row label="Actor" value={entry.actor} />
          <Row label="Actor email" value={entry.actorEmail || "Not recorded"} />
          <Row label="Actor roles" value={entry.actorRole || "Not recorded"} />
          <Row label="Actor id" value={entry.actorId || "Not recorded"} mono />
          <Row label="Entity" value={entry.resource || "Not recorded"} mono />
          <Row label="IP address" value={entry.ip || "Not recorded"} />
          <Row label="Service" value={entry.service || "Not recorded"} />
          <Row label="Correlation id" value={entry.correlationId || "Not recorded"} mono />

          {(entry.oldValues || entry.newValues) && (
            <>
              <Divider />
              {entry.oldValues && <Json label="Before" value={entry.oldValues} />}
              {entry.newValues && <Json label="After" value={entry.newValues} />}
            </>
          )}
        </Stack>
      )}
    </Drawer>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="baseline">
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontFamily: mono ? "monospace" : undefined,
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function Json({ label, value }: { label: string; value: string }) {
  let pretty = value;
  try {
    pretty = JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    // Not JSON. Show it as recorded rather than hiding it.
  }
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: "action.hover",
          fontSize: "0.75rem",
          overflowX: "auto",
        }}
      >
        {pretty}
      </Box>
    </Box>
  );
}

function severityColor(severity: string): "default" | "warning" | "error" {
  if (severity === "critical" || severity === "error") return "error";
  if (severity === "warning") return "warning";
  return "default";
}
