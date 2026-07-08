"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import PersonIcon from "@mui/icons-material/PersonOutline";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import EventIcon from "@mui/icons-material/EventOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  useStudyGroups,
  useAcademicUnits,
  useCreateStudyGroup,
  useJoinStudyGroup,
  useLeaveStudyGroup,
  useStudyGroupSessions,
  useScheduleSession,
  useCancelSession,
  type StudyGroupSession,
} from "@/lib/api/queries";
import type { StudyGroup } from "@/lib/mockData";

// A group's subject is stored as an academic unit id (subject slug or course
// practiceKey). We resolve the friendly name from the viewer's own units;
// groups in a subject the viewer doesn't take fall back to a humanised slug.
function humanizeUnitId(id: string): string {
  const tail = id.includes(":") ? id.slice(id.indexOf(":") + 1) : id;
  return tail
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function StudyGroupsPage() {
  const groupsQuery = useStudyGroups();
  const academic = useAcademicUnits();
  const [createOpen, setCreateOpen] = useState(false);

  const nameForUnit = (id: string) => academic.nameFor(id) ?? humanizeUnitId(id);

  return (
    <>
      <PageHeader
        title="Study groups"
        description="Small virtual rooms where you study with peers: share notes, schedule sessions, explain it to each other."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Study groups" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Create group
          </Button>
        }
      />

      <QueryStates
        query={groupsQuery}
        empty={{
          icon: <GroupsIcon />,
          title: "No study groups yet",
          description: "Start your own and invite peers, or check back as more groups form.",
          action: (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Create a group
            </Button>
          ),
        }}
      >
        {(groups) => (
          <Grid container spacing={3}>
            {groups.map((g) => (
              <Grid key={g.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <StudyGroupCard group={g} subjectName={nameForUnit(g.subjectId)} />
              </Grid>
            ))}
          </Grid>
        )}
      </QueryStates>

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function StudyGroupCard({ group: g, subjectName }: { group: StudyGroup; subjectName: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const join = useJoinStudyGroup();
  const leave = useLeaveStudyGroup();
  const { confirm, dialog } = useConfirm();
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const busy = join.isPending || leave.isPending;

  const doJoin = () =>
    join.mutate(g.id, {
      onSuccess: () => enqueueSnackbar(`Joined ${g.name}.`, { variant: "success" }),
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't join.", { variant: "error" }),
    });

  const doLeave = async () => {
    const ok = await confirm({
      title: `Leave ${g.name}?`,
      description: g.isOwner
        ? "You're the owner. Leaving hands the group to the next member, or removes it if you're the last one."
        : "You'll stop being a member. You can rejoin later if it's open.",
      confirmLabel: "Leave group",
    });
    if (!ok) return;
    leave.mutate(g.id, {
      onSuccess: () => enqueueSnackbar(`Left ${g.name}.`, { variant: "success" }),
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't leave.", { variant: "error" }),
    });
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
            <Chip label={subjectName} size="small" />
            {g.privacy === "invite" ? (
              <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Invite only" size="small" variant="outlined" />
            ) : (
              <Chip icon={<PublicIcon sx={{ fontSize: 14 }} />} label="Open" size="small" variant="outlined" />
            )}
          </Stack>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {g.name}
          </Typography>
          {g.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {g.description}
            </Typography>
          )}

          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: g.description ? 0 : 1.5, mb: 2 }}>
            <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {g.members} {g.members === 1 ? "member" : "members"}
            </Typography>
            {g.isOwner && <Chip label="You own this" size="small" color="secondary" sx={{ ml: 0.5 }} />}
          </Stack>

          {g.nextSession && (
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover", mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Next session
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                <RelativeTime iso={g.nextSession} />
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: "auto", pt: 1 }}>
            {g.isMember ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<EventIcon />}
                  onClick={() => setSessionsOpen(true)}
                >
                  Sessions
                </Button>
                <Button variant="outlined" disabled={busy} onClick={doLeave}>
                  {leave.isPending ? "Leaving…" : "Leave"}
                </Button>
              </Stack>
            ) : g.privacy === "open" ? (
              <Button variant="contained" color="secondary" fullWidth disabled={busy} onClick={doJoin}>
                {join.isPending ? "Joining…" : "Join group"}
              </Button>
            ) : (
              <Button variant="outlined" fullWidth disabled>
                Invite only
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
      {dialog}
      <SessionsDialog
        groupId={g.id}
        groupName={g.name}
        open={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
      />
    </>
  );
}

function SessionsDialog({
  groupId,
  groupName,
  open,
  onClose,
}: {
  groupId: string;
  groupName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const sessionsQuery = useStudyGroupSessions(groupId, open);
  const schedule = useScheduleSession(groupId);
  const cancel = useCancelSession(groupId);
  const { confirm, dialog: confirmDialog } = useConfirm();

  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("");

  const sessions = sessionsQuery.data ?? [];
  const whenValid = when.length > 0 && dayjs(when).isValid() && dayjs(when).isAfter(dayjs());
  const canSubmit = title.trim().length >= 2 && whenValid && !schedule.isPending;

  const resetForm = () => {
    setTitle("");
    setWhen("");
    setDuration(60);
    setLocation("");
  };

  const submit = () => {
    if (!canSubmit) return;
    schedule.mutate(
      {
        title: title.trim(),
        startsAt: dayjs(when).toISOString(),
        durationMinutes: duration,
        location: location.trim() || undefined,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Session scheduled.", { variant: "success" });
          resetForm();
        },
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't schedule.", {
            variant: "error",
          }),
      },
    );
  };

  const remove = async (s: StudyGroupSession) => {
    const ok = await confirm({
      title: `Cancel "${s.title}"?`,
      description: "This removes the session for everyone in the group.",
      confirmLabel: "Cancel session",
    });
    if (!ok) return;
    try {
      await cancel.mutateAsync(s.id);
      enqueueSnackbar("Session cancelled.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Couldn't cancel${err instanceof Error ? `: ${err.message}` : ""}`, {
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>{groupName} sessions</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
              Upcoming
            </Typography>
            {sessionsQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading…
              </Typography>
            ) : sessions.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No sessions scheduled yet. Add one below.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
                {sessions.map((s) => (
                  <Stack
                    key={s.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ py: 1.25 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {s.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(s.startsAt).format("ddd D MMM, HH:mm")} · {s.durationMinutes} min
                        {s.location ? ` · ${s.location}` : ""}
                      </Typography>
                    </Box>
                    {s.canManage && (
                      <IconButton
                        size="small"
                        onClick={() => remove(s)}
                        disabled={cancel.isPending}
                        aria-label="Cancel session"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
              Schedule a session
            </Typography>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="What are you working on?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Past paper walkthrough"
              />
              <TextField
                label="When"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                fullWidth
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                error={when.length > 0 && !whenValid}
                helperText={when.length > 0 && !whenValid ? "Pick a time in the future." : undefined}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Minutes"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  size="small"
                  sx={{ width: 120 }}
                  slotProps={{ htmlInput: { min: 15, max: 600, step: 15 } }}
                />
                <TextField
                  label="Where (optional)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  size="small"
                  fullWidth
                  placeholder="Room or a link"
                />
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button onClick={submit} variant="contained" color="secondary" disabled={!canSubmit}>
          {schedule.isPending ? "Scheduling…" : "Schedule"}
        </Button>
      </DialogActions>
      {confirmDialog}
    </Dialog>
  );
}

function CreateGroupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateStudyGroup();
  const academic = useAcademicUnits();
  const { enqueueSnackbar } = useSnackbar();
  const units = academic.units;
  const noun = academic.unitNoun;

  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"open" | "invite">("open");

  const reset = () => {
    setName("");
    setSubjectId("");
    setDescription("");
    setPrivacy("open");
    create.reset();
  };
  const handleClose = () => {
    if (create.isPending) return;
    reset();
    onClose();
  };
  const submit = () => {
    if (name.trim().length < 2 || !subjectId) return;
    create.mutate(
      { name: name.trim(), subjectId, description: description.trim() || undefined, privacy },
      {
        onSuccess: (g) => {
          enqueueSnackbar(`Created ${g.name}.`, { variant: "success" });
          reset();
          onClose();
        },
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't create the group.", {
            variant: "error",
          }),
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>Create a study group</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Group name"
            placeholder="e.g. Friday Calculus Crew"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            required
          />
          <TextField
            label={noun === "course" ? "Course" : "Subject"}
            select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            fullWidth
            required
            disabled={units.length === 0}
            helperText={units.length === 0 ? `Add a ${noun} first to scope a group.` : undefined}
          >
            {units.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="What's the group for? When do you meet?"
          />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
              Who can join
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={privacy}
              onChange={(_, v) => v && setPrivacy(v)}
              fullWidth
            >
              <ToggleButton value="open">
                <PublicIcon sx={{ fontSize: 16, mr: 0.75 }} />
                Open
              </ToggleButton>
              <ToggleButton value="invite">
                <LockIcon sx={{ fontSize: 16, mr: 0.75 }} />
                Invite only
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={create.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={name.trim().length < 2 || !subjectId || create.isPending}
        >
          {create.isPending ? "Creating…" : "Create group"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
