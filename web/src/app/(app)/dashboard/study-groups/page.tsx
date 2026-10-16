"use client";

import { useMemo, useState } from "react";
import NextLink from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import {
  Plus,
  Users,
  CalendarClock,
  ChevronRight,
  Lock,
  Globe,
  ListTodo,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import {
  useStudyGroups,
  useAcademicUnits,
  useCreateStudyGroup,
  useJoinStudyGroup,
} from "@/lib/api/queries";
import type { StudyGroup } from "@/lib/mockData";
import { prettifyUnitId } from "@/lib/format";
import { heroGradient, CapacityMeter, RoleBadge, PrivacyBadge, riseSx } from "./shared";

export default function StudyGroupsPage() {
  const groupsQuery = useStudyGroups();
  const academic = useAcademicUnits();
  const [createOpen, setCreateOpen] = useState(false);

  const nameForUnit = (id: string) => academic.nameFor(id) ?? prettifyUnitId(id);

  return (
    <>
      <PageHeader
        title="Study groups"
        description="Study alongside peers: share tasks so everyone gets a nudge, sync group deadlines to your own calendar, and meet up on your own terms."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Study groups" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Plus size={18} />}
            onClick={() => setCreateOpen(true)}
          >
            Create group
          </Button>
        }
      />

      <QueryStates
        query={groupsQuery}
        empty={{
          icon: <ListTodo />,
          title: "No study groups yet",
          description: "Start your own and invite peers, or check back as more groups form.",
          action: (
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setCreateOpen(true)}>
              Create a group
            </Button>
          ),
        }}
      >
        {(groups) => {
          const mine = groups.filter((g) => g.isMember);
          const discover = groups.filter((g) => !g.isMember);
          return (
            <Stack spacing={4}>
              <HeroBand mine={mine.length} discover={discover.length} />

              {mine.length > 0 && (
                <GroupList
                  heading="Your groups"
                  groups={mine}
                  nameForUnit={nameForUnit}
                />
              )}

              <GroupList
                heading={mine.length > 0 ? "Discover more" : "Groups you can join"}
                groups={discover}
                nameForUnit={nameForUnit}
                emptyNote={
                  discover.length === 0
                    ? "You are in every open group going. Start a new one to bring more people in."
                    : undefined
                }
              />
            </Stack>
          );
        }}
      </QueryStates>

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function HeroBand({ mine, discover }: { mine: number; discover: number }) {
  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        ...heroGradient(t),
        borderRadius: 3,
        p: { xs: 2.5, sm: 3.5 },
        overflow: "hidden",
      })}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 4 }}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            Keep each other on track
          </Typography>
          <Typography variant="body2" sx={{ color: alpha("#F6F7F5", 0.82), maxWidth: 460 }}>
            Share the readings, past papers and prep as tasks so nobody falls behind, and pull the ones
            that matter onto your own calendar.
          </Typography>
        </Box>
        <Stack direction="row" spacing={3}>
          <Stat value={mine} label={mine === 1 ? "group you are in" : "groups you are in"} />
          <Stat value={discover} label={discover === 1 ? "to discover" : "to discover"} />
        </Stack>
      </Stack>
    </Paper>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
      <Typography sx={{ fontWeight: 800, fontSize: "1.9rem", lineHeight: 1 }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: alpha("#F6F7F5", 0.7) }}>
        {label}
      </Typography>
    </Box>
  );
}

function GroupList({
  heading,
  groups,
  nameForUnit,
  emptyNote,
}: {
  heading: string;
  groups: StudyGroup[];
  nameForUnit: (id: string) => string;
  emptyNote?: string;
}) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1, letterSpacing: "0.08em" }}>
        {heading}
      </Typography>
      {emptyNote ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          {emptyNote}
        </Typography>
      ) : (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          {groups.map((g, i) => (
            <GroupRow key={g.id} group={g} subjectName={nameForUnit(g.subjectId)} index={i} last={i === groups.length - 1} />
          ))}
        </Paper>
      )}
    </Box>
  );
}

function GroupRow({
  group: g,
  subjectName,
  index,
  last,
}: {
  group: StudyGroup;
  subjectName: string;
  index: number;
  last: boolean;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const join = useJoinStudyGroup();

  const doJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    join.mutate(g.id, {
      onSuccess: () => enqueueSnackbar(`Joined ${g.name}.`, { variant: "success" }),
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't join.", { variant: "error" }),
    });
  };

  return (
    <ButtonBase
      component={NextLink}
      href={`/dashboard/study-groups/${g.id}`}
      sx={(t) => ({
        display: "block",
        width: "100%",
        textAlign: "left",
        px: { xs: 2, sm: 2.5 },
        py: 2,
        borderBottom: last ? "none" : `1px solid ${t.palette.divider}`,
        transition: "background .2s ease",
        "&:hover": {
          background: `linear-gradient(90deg, ${alpha(t.palette.secondary.main, 0.08)}, transparent 70%)`,
        },
        "&:focus-visible": { outline: `2px solid ${t.palette.secondary.main}`, outlineOffset: -2 },
        ...riseSx(index),
      })}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <SubjectGlyph name={subjectName} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ rowGap: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem" }} noWrap>
              {g.name}
            </Typography>
            <RoleBadge role={g.role} />
            {g.privacy === "invite" && <PrivacyBadge privacy="invite" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} noWrap>
            {subjectName}
            {g.description ? ` · ${g.description}` : ""}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
              <Users size={14} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {g.members}/{g.memberCapacity}
              </Typography>
            </Stack>
            {g.openTasks > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
                <ListTodo size={14} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {g.openTasks} open
                </Typography>
              </Stack>
            )}
            {g.nextSession && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
                <CalendarClock size={14} />
                <Typography variant="caption">
                  <RelativeTime iso={g.nextSession} />
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box sx={{ display: { xs: "none", md: "block" }, width: 150 }}>
          <CapacityMeter members={g.members} capacity={g.memberCapacity} />
        </Box>

        {g.isMember ? (
          <ChevronRight size={20} style={{ opacity: 0.5, flexShrink: 0 }} />
        ) : g.isFull ? (
          <Button size="small" variant="outlined" disabled sx={{ flexShrink: 0 }}>
            Full
          </Button>
        ) : g.privacy === "open" ? (
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={doJoin}
            disabled={join.isPending}
            sx={{ flexShrink: 0 }}
          >
            {join.isPending ? "Joining" : "Join"}
          </Button>
        ) : (
          <Button size="small" variant="outlined" disabled startIcon={<Lock size={14} />} sx={{ flexShrink: 0 }}>
            Invite
          </Button>
        )}
      </Stack>
    </ButtonBase>
  );
}

// A subject-initial tile, its hue seeded from the name so a group is
// recognisable at a glance without needing per-subject art.
function SubjectGlyph({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const hue = useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);
  return (
    <Box
      sx={(t) => ({
        flexShrink: 0,
        width: 44,
        height: 44,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: "1.1rem",
        color: t.palette.mode === "dark" ? "#F6F7F5" : "#1B1D22",
        background: `linear-gradient(135deg, hsl(${hue} 45% ${t.palette.mode === "dark" ? 28 : 88}%), hsl(${(hue + 40) % 360} 40% ${t.palette.mode === "dark" ? 20 : 80}%))`,
      })}
    >
      {initial}
    </Box>
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
  const [capacity, setCapacity] = useState(12);

  const reset = () => {
    setName("");
    setSubjectId("");
    setDescription("");
    setPrivacy("open");
    setCapacity(12);
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
      { name: name.trim(), subjectId, description: description.trim() || undefined, privacy, memberCapacity: capacity },
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
      <DialogTitle sx={{ fontWeight: 700 }}>Create a study group</DialogTitle>
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
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Member limit
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {capacity} people
              </Typography>
            </Stack>
            <Slider
              value={capacity}
              onChange={(_, v) => setCapacity(v as number)}
              min={2}
              max={50}
              step={1}
              color="secondary"
              marks={[
                { value: 2, label: "2" },
                { value: 50, label: "50" },
              ]}
            />
            <Typography variant="caption" color="text.secondary">
              You can change this later. Smaller groups tend to talk more.
            </Typography>
          </Box>
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
                <Globe size={16} style={{ marginRight: 6 }} />
                Open
              </ToggleButton>
              <ToggleButton value="invite">
                <Lock size={16} style={{ marginRight: 6 }} />
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
          {create.isPending ? "Creating" : "Create group"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
