"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
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
import LinearProgress from "@mui/material/LinearProgress";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RedeemIcon from "@mui/icons-material/RedeemOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { CardRow } from "@/components/common/CardRow";
import { PriorityList } from "@/components/common/PriorityList";
import { QueryStates } from "@/components/common/QueryStates";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  useGoals,
  useAcademicUnits,
  useCreateGoal,
  useDeleteGoal,
  useReorderGoals,
  type CreateGoalInput,
  type AcademicUnit,
} from "@/lib/api/queries";
import type { Goal } from "@/lib/mockData";
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
  // Academic units, not subjects — a tertiary student has courses, and
  // useSubjects() returns nothing for them, which left the picker empty.
  const academic = useAcademicUnits();
  const [dialogOpen, setDialogOpen] = useState(false);

  const units = academic.units;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Goals"
        description="AI sets healthy goals based on your history. You make them happen. Schools verify the wins."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Goals" }]}
        actions={
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            New goal
          </Button>
        }
      />

      <QueryStates
        query={goalsQuery}
        empty={{
          icon: <FlagIcon />,
          title: "No goals yet",
          description: `Goals turn your ${academic.unitNounPlural} and assessments into a plan you can actually follow. Start with one. You can always add more.`,
          action: (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              Add your first goal
            </Button>
          ),
        }}
      >
        {(goals) => <GoalsList goals={goals} units={units} />}
      </QueryStates>

      <NewGoalDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        units={units}
        unitNoun={academic.unitNoun}
      />
    </AtmosphericBackdrop>
  );
}

function NewGoalDialog({
  open,
  onClose,
  units,
  unitNoun,
}: {
  open: boolean;
  onClose: () => void;
  units: AcademicUnit[];
  unitNoun: string;
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
              label={`${unitNoun.charAt(0).toUpperCase()}${unitNoun.slice(1)} (optional)`}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              select
              fullWidth
              disabled={category !== "academic"}
            >
              <MenuItem value="">None</MenuItem>
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
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

function GoalsList({ goals, units }: { goals: Goal[]; units: AcademicUnit[] }) {
  const [tab, setTab] = useState<TabValue>("Active");
  const [reordering, setReordering] = useState(false);

  const filtered = goals.filter((g) => {
    if (tab === "Active") return g.status === "active";
    if (tab === "At risk") return g.status === "at_risk";
    if (tab === "Completed") return g.status === "completed";
    if (tab === "Verified") return g.status === "verified";
    return true;
  });

  const activeGoals = goals.filter((g) => g.status === "active");
  const canPrioritize = tab === "Active" && activeGoals.length >= 2;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v as TabValue);
            setReordering(false);
          }}
        >
          {TABS.map((t) => (
            <Tab key={t} value={t} label={t} />
          ))}
        </Tabs>
        {canPrioritize && (
          <Button
            size="small"
            startIcon={<SwapVertIcon />}
            onClick={() => setReordering((r) => !r)}
            sx={{ flexShrink: 0 }}
          >
            {reordering ? "Done" : "Prioritize"}
          </Button>
        )}
      </Box>

      {tab === "Active" && reordering ? (
        <PrioritizeGoals goals={activeGoals} units={units} />
      ) : filtered.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Nothing in {tab.toLowerCase()}.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((g) => (
            <Grid key={g.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <GoalCard goal={g} unit={units.find((u) => u.id === g.subjectId)} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

// Drag-to-rank mode for the Active tab. Local order state gives an instant,
// optimistic reorder; every drop persists the new order to the server so the
// priority survives a refresh (goals come back ordered by SortOrder).
function PrioritizeGoals({ goals, units }: { goals: Goal[]; units: AcademicUnit[] }) {
  const [ordered, setOrdered] = useState<Goal[]>(goals);
  const reorder = useReorderGoals();
  const { enqueueSnackbar } = useSnackbar();

  const handleReorder = (next: Goal[]) => {
    setOrdered(next);
    reorder.mutate(
      next.map((g) => g.id),
      {
        onError: () =>
          enqueueSnackbar("Couldn't save the new order. It'll revert on refresh.", {
            variant: "error",
          }),
      },
    );
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Drag to rank what matters most. The order saves automatically.
      </Typography>
      <PriorityList
        items={ordered}
        getKey={(g) => g.id}
        onReorder={handleReorder}
        renderItem={(g) => (
          <GoalPriorityRow goal={g} unit={units.find((u) => u.id === g.subjectId)} />
        )}
      />
    </Stack>
  );
}

function GoalPriorityRow({ goal, unit }: { goal: Goal; unit?: AcademicUnit }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 500 }}>
          {goal.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
          {unit?.name ?? (
            <Box component="span" sx={{ textTransform: "capitalize" }}>
              {goal.category}
            </Box>
          )}
        </Typography>
      </Box>
      <Box sx={{ width: 88, flexShrink: 0, display: { xs: "none", sm: "block" } }}>
        <LinearProgress
          variant="determinate"
          value={goal.progress}
          sx={{ height: 6, borderRadius: 999 }}
          color="primary"
        />
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: 36, textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {goal.progress}%
      </Typography>
    </Box>
  );
}

function GoalCard({ goal, unit }: { goal: Goal; unit?: AcademicUnit }) {
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
      <CardRow
        href={`/dashboard/goals/${goal.id}`}
        accent={tone === "achievement" ? "achievement" : "primary"}
        chips={<Chip label={goal.category} size="small" sx={{ textTransform: "capitalize" }} />}
        headerAction={
          <IconButton
            size="small"
            onClick={handleDelete}
            disabled={del.isPending}
            aria-label="Delete goal"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        }
        title={goal.title}
        subtitle={unit?.name}
        description={goal.description}
        progress={{ value: goal.progress, label: `Progress · ${goal.target}` }}
        status={{
          kind: tone,
          dot: goal.status === "active" || goal.status === "at_risk",
          label: (
            <Box component="span" sx={{ textTransform: "capitalize" }}>
              {goal.status.replace("_", " ")}
            </Box>
          ),
        }}
        footerMeta={
          <>
            Due <RelativeTime iso={goal.dueDate} />
          </>
        }
        actions={
          goal.reward ? (
            <Box
              sx={{
                width: "100%",
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.achievement.main, 0.1),
                border: 1,
                borderColor: (t) => alpha(t.palette.achievement.main, 0.3),
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <RedeemIcon fontSize="small" sx={{ color: "achievement.dark" }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {goal.reward}
              </Typography>
            </Box>
          ) : undefined
        }
      />
      {confirmDialog}
    </>
  );
}
