"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { X, ShieldAlert } from "lucide-react";
import { useSnackbar } from "notistack";
import { CardError } from "@/components/common/CardError";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import {
  useAdminUser,
  useAdminRoles,
  useSetUserRoles,
  type AdminUserDetail,
} from "@/lib/api/queries";
import { identityRoleLabel } from "@/lib/rbac";
import { formatDate } from "@/lib/format";

// One account, properly: who they are, what roles they hold, what they are
// paying for, and the last few audit entries that touch them.
//
// Role editing is the one write. It posts to PUT /api/admin/users/{id}/roles,
// which refuses self-edits, requires a Superuser to touch Admin or Superuser,
// and will not let the last Superuser be demoted. The UI mirrors those rails
// so the admin sees why a control is unavailable rather than meeting a 403.
export function UserDetailDrawer({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const query = useAdminUser(userId);

  return (
    <Drawer
      anchor="right"
      open={!!userId}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 520 }, maxWidth: "100%" } } }}
    >
      <Stack sx={{ p: { xs: 2, sm: 3 } }} spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Account</Typography>
          <IconButton onClick={onClose} aria-label="Close">
            <X size={18} />
          </IconButton>
        </Stack>

        {query.isLoading && (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={140} />
            <Skeleton variant="rounded" height={100} />
          </Stack>
        )}

        {query.isError && <CardError what="this account" onRetry={() => void query.refetch()} />}

        {query.data && <UserDetail user={query.data} />}
      </Stack>
    </Drawer>
  );
}

function UserDetail({ user }: { user: AdminUserDetail }) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {user.name || "(no name)"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={user.emailConfirmed ? "Email verified" : "Email unverified"}
            color={user.emailConfirmed ? "success" : "warning"}
          />
          {user.lockedOut && <Chip size="small" label="Locked out" color="error" />}
          <Chip size="small" label={`Joined ${formatDate(user.createdAt)}`} />
        </Stack>
      </Box>

      <Divider />

      <Field label="User id" value={user.id} mono />
      <Field label="Phone" value={user.phoneNumber ?? "Not given"} />
      <Field label="School" value={user.school ?? "Not given"} />
      <Field
        label="Study level"
        value={
          user.educationLevel === "tertiary"
            ? `Tertiary${user.institutionId ? ` (institution ${user.institutionId})` : ""}`
            : `High school${user.grade ? ` (grade ${user.grade})` : ""}${user.curriculumId ? `, ${user.curriculumId.toUpperCase()}` : ""}`
        }
      />

      <Divider />

      <RolesEditor user={user} />

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Subscriptions owned
        </Typography>
        {user.subscriptions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            None. This account pays for nothing.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {user.subscriptions.map((s) => (
              <Stack
                key={s.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "action.hover" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {s.planName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.billing}
                    {s.cardLast4 ? ` · ${s.cardBrand ?? "card"} ····${s.cardLast4}` : " · no card"}
                  </Typography>
                </Box>
                <Chip size="small" label={s.status.replace("_", " ")} />
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      {user.memberships.filter((m) => !m.isOwner).length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Member of
          </Typography>
          <Stack spacing={0.75}>
            {user.memberships
              .filter((m) => !m.isOwner)
              .map((m) => (
                <Typography key={m.subscriptionId} variant="body2">
                  {m.planName} · {m.status} · joined {formatDate(m.joinedAt)}
                </Typography>
              ))}
          </Stack>
        </Box>
      )}

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Recent audit entries
        </Typography>
        {user.recentAudit.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nothing recorded for this account yet.
          </Typography>
        ) : (
          <Stack spacing={0.75}>
            {user.recentAudit.map((a) => (
              <Stack key={a.id} direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" sx={{ fontFamily: "monospace" }} noWrap>
                  {a.action}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(a.ts, "DD MMM HH:mm")}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function RolesEditor({ user }: { user: AdminUserDetail }) {
  const roles = useAdminRoles();
  const setRoles = useSetUserRoles();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState<string[]>(user.roles);

  // A different account opened in the same drawer instance starts from that
  // account's roles, not the last one's.
  useEffect(() => setSelected(user.roles), [user.id, user.roles]);

  const dirty =
    selected.length !== user.roles.length || selected.some((r) => !user.roles.includes(r));

  const save = () => {
    setRoles.mutate(
      { id: user.id, roles: selected },
      {
        onSuccess: () => enqueueSnackbar("Roles updated", { variant: "success" }),
        onError: (err) =>
          enqueueSnackbar(err.message || "Could not update roles", { variant: "error" }),
      },
    );
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Roles
      </Typography>

      <PermissionGuard
        require="users.manage"
        fallback={
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {user.roles.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            ) : (
              user.roles.map((r) => <Chip key={r} size="small" label={identityRoleLabel(r)} />)
            )}
          </Stack>
        }
      >
        <FormGroup>
          {(roles.data ?? []).map((r) => (
            <FormControlLabel
              key={r.name}
              control={
                <Checkbox
                  checked={selected.includes(r.name)}
                  onChange={(e) =>
                    setSelected((prev) =>
                      e.target.checked ? [...prev, r.name] : prev.filter((x) => x !== r.name),
                    )
                  }
                />
              }
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">{identityRoleLabel(r.name)}</Typography>
                  {r.privileged && (
                    <Chip
                      size="small"
                      icon={<ShieldAlert size={13} />}
                      label="Privileged"
                      sx={{ height: 20 }}
                    />
                  )}
                </Stack>
              }
            />
          ))}
        </FormGroup>

        {selected.some((r) => r === "Admin" || r === "Superuser") &&
          !user.roles.includes("Admin") &&
          !user.roles.includes("Superuser") && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              This grants access to every account, subscription and audit entry on the platform.
              Only a Superuser can make this change, and it is recorded in the audit log.
            </Alert>
          )}

        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            disabled={!dirty || setRoles.isPending}
            onClick={save}
          >
            {setRoles.isPending ? "Saving…" : "Save roles"}
          </Button>
          <Button
            size="small"
            disabled={!dirty || setRoles.isPending}
            onClick={() => setSelected(user.roles)}
          >
            Reset
          </Button>
        </Stack>
      </PermissionGuard>
    </Box>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="baseline">
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontFamily: mono ? "monospace" : undefined, textAlign: "right", wordBreak: "break-all" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
