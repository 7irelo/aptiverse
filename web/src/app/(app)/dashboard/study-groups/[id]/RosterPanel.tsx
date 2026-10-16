"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { MoreVertical, Shield, ShieldOff, Crown, UserMinus } from "lucide-react";
import {
  useStudyGroupMembers,
  useRemoveStudyGroupMember,
  useSetStudyGroupMemberRole,
} from "@/lib/api/queries";
import { useConfirm } from "@/components/common/ConfirmDialog";
import type { StudyGroupMember } from "@/lib/mockData";
import { RoleBadge } from "../shared";

export function RosterPanel({ groupId, capacity }: { groupId: string; capacity: number }) {
  const membersQuery = useStudyGroupMembers(groupId);
  const members = membersQuery.data ?? [];

  if (membersQuery.isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={22} />
      </Stack>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontWeight: 600 }}>
        {members.length} of {capacity} seats taken
      </Typography>
      <Stack divider={<Box sx={(t) => ({ borderBottom: `1px solid ${t.palette.divider}` })} />}>
        {members.map((m) => (
          <MemberRow key={m.userId} member={m} groupId={groupId} />
        ))}
      </Stack>
    </Box>
  );
}

function MemberRow({ member: m, groupId }: { member: StudyGroupMember; groupId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, dialog } = useConfirm();
  const remove = useRemoveStudyGroupMember(groupId);
  const setRole = useSetStudyGroupMemberRole(groupId);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const close = () => setAnchor(null);

  const hasActions = m.canRemove || m.canPromote;

  const doRemove = async () => {
    close();
    const ok = await confirm({
      title: `Remove ${m.name}?`,
      description: "They lose their seat right away. They can rejoin later if the group is open.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    remove.mutate(m.userId, {
      onSuccess: () => enqueueSnackbar(`${m.name} removed.`, { variant: "success" }),
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't remove.", { variant: "error" }),
    });
  };

  const changeRole = (role: "admin" | "member" | "owner", label: string) => {
    close();
    const apply = () =>
      setRole.mutate(
        { userId: m.userId, role },
        {
          onSuccess: () => enqueueSnackbar(label, { variant: "success" }),
          onError: (err) =>
            enqueueSnackbar(err instanceof Error ? err.message : "Couldn't update.", { variant: "error" }),
        },
      );
    if (role === "owner") {
      confirm({
        title: `Hand the group to ${m.name}?`,
        description: "They become the owner and you step back to admin. Only they can undo this.",
        confirmLabel: "Transfer ownership",
        tone: "danger",
      }).then((ok) => ok && apply());
    } else {
      apply();
    }
  };

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25 }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {m.name}
            {m.isYou && (
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                (you)
              </Typography>
            )}
          </Typography>
          <RoleBadge role={m.role} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Joined {dayjs(m.joinedAt).format("D MMM YYYY")}
        </Typography>
      </Box>

      {hasActions && (
        <>
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} aria-label={`Manage ${m.name}`}>
            <MoreVertical size={16} />
          </IconButton>
          <Menu anchorEl={anchor} open={!!anchor} onClose={close}>
            {m.canPromote && m.role === "member" && (
              <MenuItem onClick={() => changeRole("admin", `${m.name} is now an admin.`)}>
                <ListItemIcon>
                  <Shield size={16} />
                </ListItemIcon>
                <ListItemText>Make admin</ListItemText>
              </MenuItem>
            )}
            {m.canPromote && m.role === "admin" && (
              <MenuItem onClick={() => changeRole("member", `${m.name} is now a member.`)}>
                <ListItemIcon>
                  <ShieldOff size={16} />
                </ListItemIcon>
                <ListItemText>Remove admin</ListItemText>
              </MenuItem>
            )}
            {m.canPromote && (
              <MenuItem onClick={() => changeRole("owner", `${m.name} now owns the group.`)}>
                <ListItemIcon>
                  <Crown size={16} />
                </ListItemIcon>
                <ListItemText>Make owner</ListItemText>
              </MenuItem>
            )}
            {m.canRemove && (
              <MenuItem onClick={doRemove} sx={{ color: "error.main" }}>
                <ListItemIcon>
                  <UserMinus size={16} color="currentColor" />
                </ListItemIcon>
                <ListItemText>Remove from group</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      )}
      {dialog}
    </Stack>
  );
}
