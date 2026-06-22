"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { ROLE_LABEL, type RbacRole } from "@/lib/rbac";
import { initials } from "@/lib/format";
import { Dot } from "@/components/common/Dot";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: RbacRole;
  school?: string;
  active: boolean;
  lastSeen: string;
};

const USERS: AdminUser[] = Array.from({ length: 50 }).map((_, i) => {
  const roles: RbacRole[] = ["student", "parent", "teacher", "school_admin", "tutor", "admin"];
  return {
    id: `u-${i}`,
    name: ["Thabo Mokoena", "Naledi Khumalo", "Sipho Dlamini", "Aisha Mahlangu", "Lerato Pillay", "Mandla T.", "Khanya N.", "Tumi B."][i % 8] + ` ${i + 1}`,
    email: `user${i + 1}@aptiverse.example`,
    role: roles[i % roles.length],
    school: i % 3 === 0 ? "Crawford Pretoria" : "Greenside HS",
    active: i % 7 !== 0,
    lastSeen: ["just now", "2 min", "12 min", "1h", "today", "yesterday"][i % 6],
  };
});

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const filtered = roleFilter === "all" ? USERS : USERS.filter((u) => u.role === roleFilter);

  return (
    <PermissionGuard require="users.read">
      <PageHeader
        title="Users"
        description="Every account on the platform — search, filter, modify, impersonate."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined">Export CSV</Button>
            <Button variant="contained">Invite user</Button>
          </Stack>
        }
      />

      <DataList
        rows={filtered}
        rowKey={(r) => r.id}
        searchPlaceholder="Search by name, email…"
        filters={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField select size="small" label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 200 }}>
              <MenuItem value="all">All roles</MenuItem>
              {(Object.keys(ROLE_LABEL) as RbacRole[]).map((r) => (
                <MenuItem key={r} value={r}>{ROLE_LABEL[r]}</MenuItem>
              ))}
            </TextField>
          </Stack>
        }
        columns={[
          {
            key: "name",
            header: "User",
            sortable: true,
            render: (r) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>{initials(r.name)}</Avatar>
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {r.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.email}
                  </Typography>
                </Stack>
              </Stack>
            ),
          },
          {
            key: "role",
            header: "Role",
            sortable: true,
            render: (r) => <Chip label={ROLE_LABEL[r.role]} size="small" />,
          },
          { key: "school", header: "School", sortable: true },
          {
            key: "active",
            header: "Status",
            render: (r) => (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Dot color={r.active ? "success" : "warning"} />
                <Typography variant="body2">{r.active ? "Active" : "Suspended"}</Typography>
              </Stack>
            ),
          },
          { key: "lastSeen", header: "Last seen" },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="outlined">
              Edit
            </Button>
            <PermissionGuard require="users.impersonate" fallback={null}>
              <Button size="small">Impersonate</Button>
            </PermissionGuard>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
