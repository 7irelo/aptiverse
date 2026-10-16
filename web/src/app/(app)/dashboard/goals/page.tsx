"use client";

import { useEffect, useMemo, useState } from "react";
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
import ListSubheader from "@mui/material/ListSubheader";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";
import Skeleton from "@mui/material/Skeleton";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { ShieldCheck, Sparkles, TrendingUp, Eye } from "lucide-react";
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
  useGoalBaseline,
  type CreateGoalInput,
  type AcademicUnit,
} from "@/lib/api/queries";
import type { Goal, GoalKind } from "@/lib/mockData";
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

/**
 * The kinds a student can pick, and what the server checks each one against.
 *
 * `rewarded` mirrors GoalKinds.Rewarded on the server, which is the only
 * authority on what pays. It is duplicated here for one reason: the picker has
 * to group the options before a kind is chosen, and there is nothing to ask
 * about yet. Once a kind is selected the dialog reads `rewarded` off the
 * baseline response instead, so what the student is told is what the server
 * will actually do.
 *
 * `whyNoPoints` is not an apology. Paying for a count buys twenty abandoned
 * tests, and paying for a streak buys an app opened at 23:58, so saying why
 * out loud is what stops the list looking arbitrary.
 */
const KINDS: {
  value: NonNullable<CreateGoalInput["kind"]>;
  label: string;
  helper: string;
  unit: string;
  max?: number;
  defaultTarget: number;
  category?: NonNullable<CreateGoalInput["category"]>;
  rewarded: boolean;
  whyNoPoints?: string;
}[] = [
  {
    value: "practice_score",
    label: "Beat your practice score",
    helper: "Your best score on any submitted practice test. Points are paid on how far you beat where you are today.",
    unit: "%",
    max: 100,
    defaultTarget: 75,
    category: "academic",
    rewarded: true,
  },
  {
    value: "topic_mastery",
    label: "Raise topic mastery",
    helper: "Mastery is how much of a topic you get right across every attempt. Points are paid on the improvement.",
    unit: "%",
    max: 100,
    defaultTarget: 75,
    category: "academic",
    rewarded: true,
  },
  {
    value: "practice_tests",
    label: "Submit practice tests",
    helper: "Counts every practice test you submit.",
    unit: "tests",
    defaultTarget: 5,
    category: "academic",
    rewarded: false,
    whyNoPoints: "A count measures how often you show up, not what you learned, so this one is tracked but pays nothing.",
  },
  {
    value: "assessment_mark",
    label: "Get a mark",
    helper: "Your best mark on a graded assessment you have logged.",
    unit: "%",
    max: 100,
    defaultTarget: 70,
    category: "academic",
    rewarded: false,
    whyNoPoints: "You type this mark in yourself, so it is tracked but pays nothing. Practice scores are the ones worth points.",
  },
  {
    value: "practice_streak",
    label: "Practise every day",
    helper: "Consecutive days with at least one submitted practice test.",
    unit: "days",
    defaultTarget: 7,
    category: "habit",
    rewarded: false,
    whyNoPoints: "Streaks are here because they motivate, not because they pay. Points would just reward opening the app at midnight.",
  },
  {
    value: "checkin_streak",
    label: "Check in every day",
    helper: "Consecutive days you log how you're doing.",
    unit: "days",
    defaultTarget: 7,
    category: "wellbeing",
    rewarded: false,
    whyNoPoints: "Streaks are here because they motivate, not because they pay.",
  },
  {
    value: "custom",
    label: "Something else",
    helper: "Nothing to check this against, so you track it yourself.",
    unit: "",
    defaultTarget: 0,
    rewarded: false,
    whyNoPoints: "Nobody can check this one, so it pays nothing and you mark it done yourself.",
  },
];

const kindMeta = (kind: string) => KINDS.find((k) => k.value === kind);

const REWARDED_KINDS = KINDS.filter((k) => k.rewarded);
const TRACKED_KINDS = KINDS.filter((k) => !k.rewarded);

/** Debounce a value so typing a target doesn't fire a request per keystroke. */
function useDebounced<T>(value: T, ms = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * "3 of 5 tests" beats "60%": the raw count is the thing a student can act on,
 * and it says what the next step is without any arithmetic. Custom goals have
 * no count to show, so they fall back to whatever the student wrote.
 */
function progressLabel(goal: Goal): string {
  if (!goal.autoVerified || !goal.targetValue) {
    return goal.target ? `Progress · ${goal.target}` : "Progress";
  }
  const meta = kindMeta(goal.kind);
  const unit = meta?.unit === "%" ? "%" : meta?.unit ? ` ${meta.unit}` : "";
  if (unit === "%") return `${goal.currentValue}% of ${goal.targetValue}%`;
  return `${goal.currentValue} of ${goal.targetValue}${unit}`;
}

export default function GoalsPage() {
  const goalsQuery = useGoals();
  // Academic units, not subjects: a tertiary student has courses, and
  // useSubjects() returns nothing for them, which left the picker empty.
  const academic = useAcademicUnits();
  const [dialogOpen, setDialogOpen] = useState(false);

  const units = academic.units;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Goals"
        description="Set a target, then let your own work prove it. Practice tests, marks, mastery and streaks are counted automatically, so a goal is done when the evidence says so."
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

/**
 * Where the student stands before they pick a target, and what that target is
 * worth.
 *
 * This panel is the difference between a target input and a guessing game. The
 * server refuses a rewarded target at or below the baseline, so without the
 * number in front of them the student meets that error blind, having already
 * filled in everything else. The projected figure is deliberately worded as a
 * floor: the payout is settled at verification against the gain actually made,
 * and quoting it as a promise would make the reward feel smaller when it lands.
 */
function BaselinePanel({
  kind,
  subjectId,
  topicFilter,
  targetValue,
}: {
  kind: GoalKind;
  subjectId?: string | null;
  topicFilter?: string | null;
  targetValue: number | null;
}) {
  const debouncedTarget = useDebounced(targetValue);
  const query = useGoalBaseline(kind, subjectId, topicFilter, debouncedTarget);

  if (query.isPending) {
    return <Skeleton variant="rounded" height={92} />;
  }
  // A failed baseline lookup must not block the form: the server re-checks on
  // create anyway, so the honest move is to say nothing rather than guess.
  if (query.isError || !query.data?.rewarded) return null;

  const { baseline, minimumTarget, projectedPoints } = query.data;
  const tooLow = baseline != null && targetValue != null && targetValue <= baseline;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: (t) =>
          tooLow ? alpha(t.palette.warning.main, 0.5) : alpha(t.palette.achievement.main, 0.3),
        bgcolor: (t) =>
          alpha(tooLow ? t.palette.warning.main : t.palette.achievement.main, 0.08),
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ color: "text.secondary", mt: 0.25 }}>
          <TrendingUp size={18} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {baseline === 0
              ? "You have nothing on record here yet, so anything you hit counts."
              : `You're at ${baseline}% right now.`}
          </Typography>

          {tooLow ? (
            <Typography variant="caption" color="warning.dark" sx={{ display: "block", mt: 0.5 }}>
              Aim above {baseline}%. Clearing a bar you already stand on proves nothing, so the
              server won't take it. Try {minimumTarget}% or more.
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Points are paid on how far past this you get, not on the number itself.
              {projectedPoints != null && projectedPoints > 0
                ? ` Hitting your target earns at least ${projectedPoints.toLocaleString()} points, more if you beat it or clear a harder paper.`
                : ""}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
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
  const [kind, setKind] = useState<NonNullable<CreateGoalInput["kind"]>>("practice_score");
  const [targetValue, setTargetValue] = useState<string>("75");
  const [topicFilter, setTopicFilter] = useState("");
  const [target, setTarget] = useState("");
  const [category, setCategory] = useState<NonNullable<CreateGoalInput["category"]>>("academic");
  const [subjectId, setSubjectId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(defaultDue);

  const meta = kindMeta(kind);
  const measurable = kind !== "custom";

  // Picking a kind moves the category with it: a practice streak is a habit and
  // a check-in streak is wellbeing, and making the student restate that in a
  // second dropdown is just a chance to contradict themselves.
  const changeKind = (next: NonNullable<CreateGoalInput["kind"]>) => {
    setKind(next);
    const m = kindMeta(next);
    if (m) {
      setTargetValue(m.defaultTarget ? String(m.defaultTarget) : "");
      if (m.category) setCategory(m.category);
    }
    if (next !== "topic_mastery") setTopicFilter("");
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setKind("practice_score");
    setTargetValue("75");
    setTopicFilter("");
    setTarget("");
    setCategory("academic");
    setSubjectId("");
    setDueDate(defaultDue);
  };

  const close = () => {
    if (createGoal.isPending) return;
    onClose();
    reset();
  };

  const parsedTarget = Number.parseInt(targetValue, 10);
  const validTarget = Number.isFinite(parsedTarget) ? parsedTarget : null;
  const targetError =
    !measurable || targetValue === ""
      ? null
      : !Number.isFinite(parsedTarget) || parsedTarget <= 0
      ? "Give it a number above zero."
      : meta?.max && parsedTarget > meta.max
      ? `Can't be more than ${meta.max}.`
      : null;

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      enqueueSnackbar("Give your goal a title.", { variant: "warning" });
      return;
    }
    if (measurable && (targetError || targetValue === "")) {
      enqueueSnackbar(targetError ?? "This goal needs a target to measure against.", {
        variant: "warning",
      });
      return;
    }
    try {
      await createGoal.mutateAsync({
        title: trimmed,
        description: description.trim() || undefined,
        kind,
        targetValue: measurable ? parsedTarget : null,
        topicFilter: kind === "topic_mastery" ? topicFilter.trim() || null : null,
        // Only custom goals carry a hand-written target: every other kind has
        // its label generated server-side from the kind and the number, so what
        // the card claims and what the evaluator checks stay the same sentence.
        target: measurable ? undefined : target.trim() || undefined,
        category,
        subjectId: subjectId || null,
        dueDate: new Date(`${dueDate}T00:00:00Z`).toISOString(),
      });
      enqueueSnackbar("Goal added.", { variant: "success" });
      onClose();
      reset();
    } catch (err) {
      // The server's baseline rejection is a real sentence, so it is shown as
      // written rather than flattened into "something went wrong".
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

          {/* Grouped so the trade is visible before the choice is made. Two
              kinds pay points; the rest are checked just as honestly and pay
              nothing, and hiding that until after creation would be a bait. */}
          <TextField
            label="What proves it"
            value={kind}
            onChange={(e) => changeKind(e.target.value as typeof kind)}
            select
            fullWidth
            helperText={meta?.helper}
          >
            <ListSubheader sx={{ fontWeight: 700, lineHeight: 2.5 }}>Earns points</ListSubheader>
            {REWARDED_KINDS.map((k) => (
              <MenuItem key={k.value} value={k.value}>
                {k.label}
              </MenuItem>
            ))}
            <ListSubheader sx={{ fontWeight: 700, lineHeight: 2.5 }}>
              Tracked, no points
            </ListSubheader>
            {TRACKED_KINDS.map((k) => (
              <MenuItem key={k.value} value={k.value}>
                {k.label}
              </MenuItem>
            ))}
          </TextField>

          {meta?.whyNoPoints && (
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ px: 0.5 }}>
              <Box sx={{ color: "text.secondary", mt: 0.25 }}>
                <Eye size={16} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {meta.whyNoPoints}
              </Typography>
            </Stack>
          )}

          {measurable ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Target"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value.replace(/[^0-9]/g, ""))}
                fullWidth
                required
                error={!!targetError}
                helperText={targetError ?? " "}
                slotProps={{
                  input: {
                    endAdornment: meta?.unit ? (
                      <InputAdornment position="end">{meta.unit}</InputAdornment>
                    ) : undefined,
                  },
                  htmlInput: { inputMode: "numeric" },
                }}
              />
              <TextField
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
                helperText=" "
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          ) : (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="What does done look like?"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                fullWidth
                placeholder="e.g. Finish the Chapter 4 notes"
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
          )}

          {kind === "topic_mastery" && (
            <TextField
              label="Topic (optional)"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              fullWidth
              placeholder="e.g. Trigonometry"
              helperText="Leave blank to measure across every topic you practise."
            />
          )}

          {/* Only rendered for kinds the server actually gates and pays. */}
          {measurable && (
            <BaselinePanel
              kind={kind}
              subjectId={subjectId || null}
              topicFilter={kind === "topic_mastery" ? topicFilter.trim() || null : null}
              targetValue={validTarget}
            />
          )}

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
              helperText={
                category === "academic" ? "Narrows what counts toward this goal." : undefined
              }
            >
              <MenuItem value="">None</MenuItem>
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
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
          variant="scrollable"
          scrollButtons={false}
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

/**
 * The footer carries what the goal is worth and who says so.
 *
 * The distinction it has to hold on to: measurable and rewarded are different
 * questions. Every kind but "custom" is checked from real work, and only two of
 * them pay. A points chip on a goal that pays nothing would be the same lie the
 * old rewards shop told, so an unrewarded goal gets no chip and says "Tracked"
 * instead.
 */
function GoalFooter({ goal }: { goal: Goal }) {
  const verified = goal.status === "verified";
  const showPoints = goal.rewarded && goal.rewardPoints > 0;

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {showPoints && (
          <Tooltip
            title={
              verified
                ? "Paid on how far you beat your own baseline, times the difficulty you cleared."
                : "The floor. Beat your target, or clear a harder paper, and it pays more."
            }
          >
            <Chip
              size="small"
              icon={<Sparkles size={13} />}
              label={
                verified
                  ? `${goal.rewardPoints.toLocaleString()} pts earned`
                  : `At least ${goal.rewardPoints.toLocaleString()} pts`
              }
              sx={{
                fontWeight: 600,
                bgcolor: (t) => alpha(t.palette.achievement.main, 0.14),
                color: (t) => t.palette.achievement.dark,
                "& .MuiChip-icon": { color: "inherit", ml: 0.75 },
              }}
            />
          </Tooltip>
        )}

        {goal.autoVerified ? (
          <Tooltip
            title={
              goal.rewarded
                ? "Measured from your work. Nobody can set this by hand."
                : "Measured from your work, but this kind pays no points."
            }
          >
            <Chip
              size="small"
              variant="outlined"
              icon={<ShieldCheck size={13} />}
              label={goal.rewarded ? "Auto-checked" : "Tracked"}
              sx={{ "& .MuiChip-icon": { ml: 0.75 } }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="Nothing to check this against, so you mark it done yourself.">
            <Chip size="small" variant="outlined" label="Self-tracked" />
          </Tooltip>
        )}

        {/* The difficulty is why the payout is the size it is, so it is shown
            next to it rather than buried. */}
        {verified && goal.achievedDifficulty && (
          <Chip
            size="small"
            variant="outlined"
            label={goal.achievedDifficulty}
            sx={{ textTransform: "capitalize" }}
          />
        )}
      </Stack>

      {/* Without the baseline, "68%" is just a number. With it, it is the
          distance travelled, which is the thing being rewarded. */}
      {goal.rewarded && goal.baselineValue != null && (
        <Typography variant="caption" color="text.secondary">
          {verified
            ? `Up from ${goal.baselineValue}% when you set this.`
            : `Started at ${goal.baselineValue}%. Now ${goal.currentValue}%.`}
        </Typography>
      )}

      {/* Legacy free-text rewards. New goals don't set this: points replaced a
          promise only the student could score. */}
      {goal.reward && (
        <Typography variant="caption" color="text.secondary">
          {goal.reward}
        </Typography>
      )}
    </Stack>
  );
}

function GoalCard({ goal, unit }: { goal: Goal; unit?: AcademicUnit }) {
  const { enqueueSnackbar } = useSnackbar();
  const del = useDeleteGoal();
  const { confirm, dialog: confirmDialog } = useConfirm();
  // verified -> achievement (Sacred-Amber; the genuine earned moment).
  // completed -> success (forest, "growing well", student self-marks
  // complete). active -> primary. at_risk -> warning.
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
        progress={{ value: goal.progress, label: progressLabel(goal) }}
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
          goal.status === "verified" && goal.achievedAt ? (
            <>
              Verified <RelativeTime iso={goal.achievedAt} />
            </>
          ) : (
            <>
              Due <RelativeTime iso={goal.dueDate} />
            </>
          )
        }
        actions={<GoalFooter goal={goal} />}
      />
      {confirmDialog}
    </>
  );
}
