"use client";

import { use, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import AddIcon from "@mui/icons-material/Add";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { SortableList } from "@/components/common/SortableList";
import {
  useGoals,
  useGoalMilestones,
  reorderGoalMilestones,
  queryKeys,
  type Milestone,
} from "@/lib/api/queries";
import type { Goal } from "@/lib/mockData";
import { formatRelative } from "@/lib/format";

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const goalsQuery = useGoals();
  const milestonesQuery = useGoalMilestones(id);

  const goal = (goalsQuery.data ?? []).find((g) => g.id === id);

  return (
    <>
      <PageHeader
        title={goal?.title ?? "Goal"}
        description={goal?.description}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Goals", href: "/dashboard/goals" },
          { label: goal?.title ?? "Goal" },
        ]}
        meta={
          goal ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={goal.category} size="small" sx={{ textTransform: "capitalize" }} />
              <StatusChip
                kind={
                  goal.status === "at_risk"
                    ? "warning"
                    : goal.status === "verified"
                    ? "success"
                    : goal.status === "completed"
                    ? "info"
                    : "primary"
                }
                label={goal.status.replace("_", " ")}
                sx={{ textTransform: "capitalize" }}
              />
              <Chip label={`Due ${formatRelative(goal.dueDate)}`} size="small" variant="outlined" />
            </Stack>
          ) : null
        }
      />

      <QueryStates
        query={goalsQuery}
        isEmpty={() => !goal}
        empty={{
          icon: <FlagIcon />,
          title: "Goal not found",
          description: "This goal doesn't exist or has been removed.",
          action: (
            <Button variant="outlined" href="/dashboard/goals">
              All goals
            </Button>
          ),
        }}
      >
        {() => (goal ? <GoalBody goal={goal} milestonesQuery={milestonesQuery} /> : null)}
      </QueryStates>
    </>
  );
}

function GoalBody({
  goal,
  milestonesQuery,
}: {
  goal: Goal;
  milestonesQuery: ReturnType<typeof useGoalMilestones>;
}) {
  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Progress" value={`${goal.progress}%`} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Target" value={goal.target} hint="What 'done' looks like" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Category" value={goal.category} color="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Reward" value={goal.reward ?? "—"} color="success" />
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Overall progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {goal.progress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={goal.progress}
            color={goal.status === "at_risk" ? "warning" : "primary"}
            sx={{ height: 10, borderRadius: 999 }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Milestones</Typography>
              <Typography variant="body2" color="text.secondary">
                Drag the handle to reorder — order shapes your study plan
              </Typography>
            </Box>
          </Stack>

          <QueryStates
            query={milestonesQuery}
            empty={{
              icon: <FlagIcon />,
              title: "No milestones yet",
              description: "Break this goal into 3–5 milestones so progress feels real on the way to the finish.",
              action: (
                <Button variant="contained" color="secondary" startIcon={<AddIcon />}>
                  Add first milestone
                </Button>
              ),
              size: "compact",
            }}
          >
            {(items) => <MilestoneSortable goalId={goal.id} initial={items} />}
          </QueryStates>
        </CardContent>
      </Card>
    </>
  );
}

function MilestoneSortable({ goalId, initial }: { goalId: string; initial: Milestone[] }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState<Milestone[]>(initial);

  // Reset local state when the underlying query refreshes
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const handleReorder = async (next: Milestone[]) => {
    setItems(next);
    try {
      await reorderGoalMilestones(
        goalId,
        next.map((m) => m.id),
      );
      // Refresh server state so subsequent reads reflect the new order
      queryClient.setQueryData(queryKeys.goalMilestones(goalId), next);
    } catch (err) {
      enqueueSnackbar(`Couldn't save order — reverted${err instanceof Error ? `: ${err.message}` : ""}`, { variant: "error" });
      setItems(initial);
    }
  };

  return (
    <SortableList
      items={items}
      getId={(m) => m.id}
      onReorder={handleReorder}
      renderItem={(m) => <MilestoneRow milestone={m} />}
      endSlot={
        <Button startIcon={<AddIcon />} variant="outlined">
          Add milestone
        </Button>
      }
    />
  );
}

function MilestoneRow({ milestone: m }: { milestone: Milestone }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: "100%" }}>
      <Checkbox checked={m.isCompleted} sx={{ p: 0.5 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            textDecoration: m.isCompleted ? "line-through" : "none",
            color: m.isCompleted ? "text.disabled" : "text.primary",
          }}
        >
          {m.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {m.description}
        </Typography>
      </Box>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <EmojiEventsIcon sx={{ color: "warning.main", fontSize: 18 }} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          +{m.rewardPoints}
        </Typography>
      </Stack>
      <IconButton size="small" sx={{ color: "text.secondary" }} aria-label="Remove milestone">
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
