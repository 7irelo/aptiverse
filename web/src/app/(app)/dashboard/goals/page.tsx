"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import AddIcon from "@mui/icons-material/Add";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { useGoals, useSubjects, useCreateGoal, useDeleteGoal, type CreateGoalInput } from "@/lib/api/queries";
import type { Goal, Subject } from "@/lib/mockData";
import { RelativeTime } from "@/components/common/RelativeTime";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";

const TABS = ["Active", "At risk", "Completed", "Verified"] as const;
type TabValue = (typeof TABS)[number];

const CATEGORIES: { value: NonNullable<CreateGoalInput["category"]>; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "wellbeing", label: "Wellbeing" },
  { value: "habit", label: "Habit" },
  { value: "career", label: "Career" },
];

export default function GoalsPage() {
  const goalsQuery = useGoals();
  const subjectsQuery = useSubjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  const subjects = subjectsQuery.data ?? [];

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Goals"
        description="AI sets healthy goals based on your history. You make them happen. Schools verify the wins."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Goals" }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New goal
          </Button>
        }
      />

      <QueryStates
        query={goalsQuery}
        empty={{
          icon: <FlagIcon />,
          title: "No goals yet",
          description:
            "Goals turn your subjects and SBAs into a plan you can actually follow. Start with one. You can always add more.",
          action: (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Add your first goal
            </Button>
          ),
        }}
      >
        {(goals) => <GoalsList goals={goals} subjects={subjects} />}
      </QueryStates>

      <NewGoalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        subjects={subjects}
      />
    </AtmosphericBackdrop>
  );
}

function NewGoalDialog({
  open,
  onClose,
  subjects,
}: {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
}) {
  const { enqueueSnackbar } = useSnackbar();
  const createGoal = useCreateGoal();

  const defaultDue = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [category, setCategory] = useState<NonNullable<CreateGoalInput["category"]>>("academic");
  const [subjectId, setSubjectId] = useState<string>("");
  const [reward, setReward] = useState("");
  const [dueDate, setDueDate] = useState<string>(defaultDue);

  const reset = () => {
    setTitle("");
    setDescription("");
    setTarget("");
    setCategory("academic");
    setSubjectId("");
    setReward("");
    setDueDate(defaultDue);
  };

  const close = () => {
    if (createGoal.isPending) return;
    onClose();
    reset();
  };

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      enqueueSnackbar("Give your goal a title.", { variant: "warning" });
      return;
    }
    try {
      await createGoal.mutateAsync({
        title: trimmed,
        description: description.trim() || undefined,
        target: target.trim() || undefined,
        category,
        subjectId: subjectId || null,
        reward: reward.trim() || undefined,
        dueDate: new Date(`${dueDate}T00:00:00Z`).toISOString(),
      });
      enqueueSnackbar("Goal added.", { variant: "success" });
      onClose();
      reset();
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save the goal${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>New goal</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            fullWidth
            placeholder="e.g. Lift Calculus mastery to 75%"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            placeholder="What you'll do to get there."
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              select
              fullWidth
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Subject (optional)"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              select
              fullWidth
              disabled={category !== "academic"}
            >
              <MenuItem value="">None</MenuItem>
              {subjects.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              fullWidth
              placeholder='e.g. "75% mastery" or "3 / 3"'
            />
            <TextField
              label="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <TextField
            label="Reward (optional)"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            fullWidth
            placeholder="What you'll do when you hit it."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={close} disabled={createGoal.isPending}>
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={createGoal.isPending}>
          {createGoal.isPending ? "Saving…" : "Add goal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function GoalsList({ goals, subjects }: { goals: Goal[]; subjects: Subject[] }) {
  const [tab, setTab] = useState<TabValue>("Active");

  const filtered = goals.filter((g) => {
    if (tab === "Active") return g.status === "active";
    if (tab === "At risk") return g.status === "at_risk";
    if (tab === "Completed") return g.status === "completed";
    if (tab === "Verified") return g.status === "verified";
    return true;
  });

  return (
    <>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as TabValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((t) => (
          <Tab key={t} value={t} label={t} />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Nothing in {tab.toLowerCase()}.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((g) => (
            <Grid key={g.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <GoalCard goal={g} subject={subjects.find((s) => s.id === g.subjectId)} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

function GoalCard({ goal, subject }: { goal: Goal; subject?: Subject }) {
  const { enqueueSnackbar } = useSnackbar();
  const del = useDeleteGoal();
  const { confirm, dialog: confirmDialog } = useConfirm();
  // verified -> achievement (Sacred-Amber; teacher-confirmed is the
  // genuine earned moment). completed -> success (forest, "growing
  // well", student self-marks complete). active -> primary. at_risk
  // -> warning. info-blue (the old completed value) isn't a brand
  // zone we use.
  const tone =
    goal.status === "at_risk"
      ? "warning"
      : goal.status === "verified"
      ? "achievement"
      : goal.status === "completed"
      ? "success"
      : "primary";
  // MUI's LinearProgress doesn't accept "achievement" as a color
  // (it's a custom palette key we augmented). Map achievement ->
  // success for the bar since verified === 100% always anyway.
  const barColor: "warning" | "success" | "primary" =
    tone === "achievement" ? "success" : tone;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: `Delete "${goal.title}"?`,
      description: "This goal and all its milestones will be removed. This can't be undone.",
      confirmLabel: "Delete goal",
    });
    if (!ok) return;
    try {
      await del.mutateAsync(goal.id);
      enqueueSnackbar("Goal deleted.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't delete${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <>
    <Card
      component={Link}
      href={`/dashboard/goals/${goal.id}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 180ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Chip label={goal.category} size="small" sx={{ textTransform: "capitalize" }} />
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={del.isPending}
            aria-label="Delete goal"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {goal.title}
        </Typography>
        {subject && (
          <Typography variant="caption" color="text.secondary">
            {subject.name}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {goal.description}
        </Typography>

        <Box sx={{ mt: "auto", pt: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress · {goal.target}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {goal.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={goal.progress}
            color={barColor}
            sx={{ height: 8, borderRadius: 999 }}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <StatusChip
              kind={tone}
              label={goal.status.replace("_", " ")}
              dot={goal.status === "active" || goal.status === "at_risk"}
              sx={{ textTransform: "capitalize" }}
            />
            <Typography variant="caption" color="text.secondary">
              Due <RelativeTime iso={goal.dueDate} />
            </Typography>
          </Stack>

          {goal.reward && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <EmojiEventsIcon sx={{ color: "achievement.main" }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {goal.reward}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
    {confirmDialog}
    </>
  );
}
