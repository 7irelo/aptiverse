"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { Users as UsersIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { useAdminUsers, useAdminRoles, type AdminUserRow } from "@/lib/api/queries";
import { initials, formatDate } from "@/lib/format";
import { identityRoleLabel as roleLabel } from "@/lib/rbac";
import { Dot } from "@/components/common/Dot";
import { useDebounced } from "@/lib/hooks/useDebounced";

// Every account on the platform, read from GET /api/admin/users.
//
// This page used to generate fifty people with Math.random and offer Edit,
// Impersonate and Export CSV buttons that did nothing, under a header claiming
// you could "search, filter, modify, impersonate". The list is real now, the
// search and role filter run server-side, and the only write on the page is
// the one that exists: changing a user's roles.
export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  // Server-side search, so a growing user table does not depend on having
  // fetched every row into the browser first.
  const debouncedSearch = useDebounced(search, 300);
  const query = useAdminUsers({ q: debouncedSearch || undefined, role: roleFilter || undefined });
  const roles = useAdminRoles();

  return (
    <PermissionGuard require="users.read">
      <PageHeader
        title="Users"
        description="Every account on the platform. Search, filter by role, open an account, and change what it can do."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Users" }]}
      />

      <QueryStates
        query={query}
        isEmpty={(page) => page.items.length === 0 && !debouncedSearch && !roleFilter}
        empty={{
          icon: <UsersIcon />,
          title: "No accounts yet",
          description: "Every account created through sign-up appears here.",
        }}
      >
        {(page) => (
          <UsersTable
            rows={page.items}
            total={page.total}
            search={search}
            onSearch={setSearch}
            roleFilter={roleFilter}
            onRoleFilter={setRoleFilter}
            roleOptions={roles.data?.map((r) => r.name) ?? []}
            onOpen={setOpenUserId}
            onRefresh={() => void query.refetch()}
          />
        )}
      </QueryStates>

      <UserDetailDrawer userId={openUserId} onClose={() => setOpenUserId(null)} />
    </PermissionGuard>
  );
}

function UsersTable({
  rows,
  total,
  search,
  onSearch,
  roleFilter,
  onRoleFilter,
  roleOptions,
  onOpen,
  onRefresh,
}: {
  rows: AdminUserRow[];
  total: number;
  search: string;
  onSearch: (v: string) => void;
  roleFilter: string;
  onRoleFilter: (v: string) => void;
  roleOptions: string[];
  onOpen: (id: string) => void;
  onRefresh: () => void;
}) {
  const showing = useMemo(
    () =>
      rows.length === total
        ? `${total} account${total === 1 ? "" : "s"}`
        : `${rows.length} of ${total}`,
    [rows.length, total],
  );

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          size="small"
          label="Search"
          placeholder="Name, email or id"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <TextField
          select
          size="small"
          label="Role"
          value={roleFilter}
          onChange={(e) => onRoleFilter(e.target.value)}
          sx={{ minWidth: { xs: "auto", sm: 200 } }}
        >
          <MenuItem value="">All roles</MenuItem>
          {roleOptions.map((r) => (
            <MenuItem key={r} value={r}>
              {roleLabel(r)}
            </MenuItem>
          ))}
        </TextField>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
          {showing}
        </Typography>
      </Stack>

      {rows.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            No accounts match that
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Try a different search, or clear the role filter.
          </Typography>
        </Box>
      ) : (
        <DataList
          rows={rows}
          rowKey={(r) => r.id}
          // Search is server-side above; the built-in box would filter only the
          // page already fetched and quietly disagree with the count.
          searchable={false}
          onRefresh={onRefresh}
          onRowClick={(r) => onOpen(r.id)}
          columns={[
            {
              key: "name",
              header: "User",
              sortable: true,
              render: (r) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                    {initials(r.name || r.email)}
                  </Avatar>
                  <Stack sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                      {r.name || "(no name)"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {r.email}
                    </Typography>
                  </Stack>
                </Stack>
              ),
            },
            {
              key: "roles",
              header: "Roles",
              render: (r) =>
                r.roles.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    None
                  </Typography>
                ) : (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {r.roles.map((role) => (
                      <Chip key={role} label={roleLabel(role)} size="small" />
                    ))}
                  </Stack>
                ),
            },
            {
              key: "planCodes",
              header: "Plan",
              hideOn: "sm",
              render: (r) =>
                r.planCodes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Free
                  </Typography>
                ) : (
                  <Typography variant="body2">{r.planCodes.join(", ")}</Typography>
                ),
            },
            {
              key: "emailConfirmed",
              header: "Status",
              render: (r) => (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Dot color={r.lockedOut ? "error" : r.emailConfirmed ? "success" : "warning"} />
                  <Typography variant="body2">
                    {r.lockedOut ? "Locked out" : r.emailConfirmed ? "Verified" : "Unverified"}
                  </Typography>
                </Stack>
              ),
            },
            {
              key: "createdAt",
              header: "Joined",
              sortable: true,
              hideOn: "sm",
              render: (r) => formatDate(r.createdAt),
            },
          ]}
          rowActions={(r) => (
            <Button size="small" variant="outlined" onClick={() => onOpen(r.id)}>
              Open
            </Button>
          )}
        />
      )}
    </>
  );
}
