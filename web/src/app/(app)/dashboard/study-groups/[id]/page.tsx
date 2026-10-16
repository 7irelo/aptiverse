"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { ArrowLeft, LogOut, UserPlus } from "lucide-react";
import { QueryStates } from "@/components/common/QueryStates";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  useStudyGroup,
  useAcademicUnits,
  useJoinStudyGroup,
  useLeaveStudyGroup,
} from "@/lib/api/queries";
import { prettifyUnitId } from "@/lib/format";
import type { StudyGroup } from "@/lib/mockData";
import { heroGradient, CapacityMeter, RoleBadge, PrivacyBadge } from "../shared";
import { TasksPanel } from "./TasksPanel";
import { RosterPanel } from "./RosterPanel";
import { SessionsPanel } from "./SessionsPanel";
import { SettingsPanel } from "./SettingsPanel";

export default function StudyGroupWorkspacePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const groupQuery = useStudyGroup(id);
  const academic = useAcademicUnits();
  const nameForUnit = (unit: string) => academic.nameFor(unit) ?? prettifyUnitId(unit);

  return (
    <>
      <Link
        component={NextLink}
        href="/dashboard/study-groups"
        underline="none"
        color="text.secondary"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2, fontSize: "0.85rem" }}
      >
        <ArrowLeft size={16} />
        All study groups
      </Link>

      <QueryStates
        query={groupQuery}
        empty={{
          title: "Group not found",
          description: "This group may have been disbanded, or it is invite only and you are not a member.",
          action: (
            <Button component={NextLink} href="/dashboard/study-groups" variant="outlined">
              Back to study groups
            </Button>
          ),
        }}
      >
        {(group) => <Workspace group={group} subjectName={nameForUnit(group.subjectId)} />}
      </QueryStates>
    </>
  );
}

function Workspace({ group, subjectName }: { group: StudyGroup; subjectName: string }) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, dialog } = useConfirm();
  const join = useJoinStudyGroup();
  const leave = useLeaveStudyGroup();
  const [tab, setTab] = useState("tasks");

  const doJoin = () =>
    join.mutate(group.id, {
      onSuccess: () => enqueueSnackbar(`Joined ${group.name}.`, { variant: "success" }),
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't join.", { variant: "error" }),
    });

  const doLeave = async () => {
    const ok = await confirm({
      title: `Leave ${group.name}?`,
      description: group.isOwner
        ? "You are the owner. Leaving hands the group to the next admin or member, or removes it if you are the last one."
        : "You will stop being a member. You can rejoin later if it is open.",
      confirmLabel: "Leave group",
      tone: "danger",
    });
    if (!ok) return;
    leave.mutate(group.id, {
      onSuccess: () => {
        enqueueSnackbar(`Left ${group.name}.`, { variant: "success" });
        router.push("/dashboard/study-groups");
      },
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't leave.", { variant: "error" }),
    });
  };

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={(t) => ({
          ...heroGradient(t),
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          overflow: "hidden",
        })}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems={{ md: "center" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.75, mb: 1 }}>
              <Typography variant="caption" sx={{ color: alpha("#F6F7F5", 0.7), fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {subjectName}
              </Typography>
              <RoleBadge role={group.role} light />
              <PrivacyBadge privacy={group.privacy} light />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: group.description ? 0.75 : 0 }}>
              {group.name}
            </Typography>
            {group.description && (
              <Typography variant="body2" sx={{ color: alpha("#F6F7F5", 0.82), maxWidth: 560 }}>
                {group.description}
              </Typography>
            )}
          </Box>

          <Stack spacing={1.5} sx={{ width: { xs: "100%", md: 240 } }}>
            <CapacityMeter members={group.members} capacity={group.memberCapacity} light />
            {group.isMember ? (
              <Button
                variant="outlined"
                onClick={doLeave}
                disabled={leave.isPending}
                startIcon={<LogOut size={16} />}
                sx={{
                  color: "#F6F7F5",
                  borderColor: alpha("#F6F7F5", 0.4),
                  "&:hover": { borderColor: "#F6F7F5", bgcolor: alpha("#F6F7F5", 0.08) },
                }}
              >
                {leave.isPending ? "Leaving" : "Leave group"}
              </Button>
            ) : group.isFull ? (
              <Button variant="contained" disabled>
                Group is full
              </Button>
            ) : group.privacy === "open" ? (
              <Button
                variant="contained"
                color="secondary"
                onClick={doJoin}
                disabled={join.isPending}
                startIcon={<UserPlus size={16} />}
              >
                {join.isPending ? "Joining" : "Join group"}
              </Button>
            ) : (
              <Button variant="contained" disabled>
                Invite only
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Box>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2.5 }}
        >
          <Tab value="tasks" label={group.openTasks > 0 ? `Tasks (${group.openTasks})` : "Tasks"} />
          <Tab value="people" label="People" />
          {group.isMember && <Tab value="sessions" label="Sessions" />}
          {group.isOwner && <Tab value="manage" label="Manage" />}
        </Tabs>

        {tab === "tasks" && (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <TasksPanel group={group} />
          </Paper>
        )}
        {tab === "people" && (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <RosterPanel groupId={group.id} capacity={group.memberCapacity} />
          </Paper>
        )}
        {tab === "sessions" && group.isMember && (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <SessionsPanel groupId={group.id} />
          </Paper>
        )}
        {tab === "manage" && group.isOwner && (
          <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
            <SettingsPanel group={group} />
          </Paper>
        )}
      </Box>
      {dialog}
    </Stack>
  );
}
