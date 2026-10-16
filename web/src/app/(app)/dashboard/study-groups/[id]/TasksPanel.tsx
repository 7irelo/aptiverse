"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { Plus, Trash2, CalendarPlus, CalendarCheck, ListTodo, Lock } from "lucide-react";
import {
  useStudyGroupTasks,
  useAddStudyGroupTask,
  useToggleStudyGroupTask,
  useDeleteStudyGroupTask,
  useSyncStudyGroupTask,
} from "@/lib/api/queries";
import { useConfirm } from "@/components/common/ConfirmDialog";
import type { StudyGroup, StudyGroupTask } from "@/lib/mockData";

export function TasksPanel({ group }: { group: StudyGroup }) {
  const tasksQuery = useStudyGroupTasks(group.id, group.isMember);
  const [adding, setAdding] = useState(false);
  const tasks = tasksQuery.data ?? [];
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  if (!group.isMember) {
    return (
      <Empty
        icon={<Lock size={26} />}
        title="Join to see the group's tasks"
        body="This board is for members. Join from the top of the page to see what the group is working on and add your own."
      />
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Shared tasks notify everyone. Add a due date to put one on your own calendar.
        </Typography>
        {group.canAddTasks && !adding && (
          <Button size="small" variant="contained" color="secondary" startIcon={<Plus size={16} />} onClick={() => setAdding(true)}>
            Add task
          </Button>
        )}
      </Stack>

      <Collapse in={adding} unmountOnExit>
        <AddTaskForm groupId={group.id} onDone={() => setAdding(false)} />
      </Collapse>

      {tasksQuery.isLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={22} />
        </Stack>
      ) : tasks.length === 0 ? (
        <Empty
          icon={<ListTodo size={26} />}
          title="No tasks yet"
          body={
            group.canAddTasks
              ? "Add the first shared task: a reading, a past paper, a chapter to prep. Everyone gets a nudge."
              : "The group's admins add the shared tasks. Check back soon."
          }
          embedded
        />
      ) : (
        <Stack spacing={1}>
          {open.map((t) => (
            <TaskRow key={t.id} task={t} groupId={group.id} />
          ))}
          {done.length > 0 && (
            <>
              <Typography variant="overline" color="text.secondary" sx={{ mt: 1, letterSpacing: "0.08em" }}>
                Done
              </Typography>
              {done.map((t) => (
                <TaskRow key={t.id} task={t} groupId={group.id} />
              ))}
            </>
          )}
        </Stack>
      )}
    </Stack>
  );
}

function AddTaskForm({ groupId, onDone }: { groupId: string; onDone: () => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const add = useAddStudyGroupTask(groupId);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [due, setDue] = useState("");

  const submit = () => {
    if (title.trim().length < 2 || add.isPending) return;
    add.mutate(
      {
        title: title.trim(),
        notes: notes.trim() || undefined,
        dueDate: due ? dayjs(due).toISOString() : null,
      },
      {
        onSuccess: () => {
          enqueueSnackbar("Task added. The group has been notified.", { variant: "success" });
          onDone();
        },
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't add.", { variant: "error" }),
      },
    );
  };

  return (
    <Box
      sx={(t) => ({
        p: 2,
        borderRadius: 2.5,
        border: `1px solid ${t.palette.divider}`,
        background: `linear-gradient(135deg, ${alpha(t.palette.secondary.main, 0.08)}, transparent 60%)`,
      })}
    >
      <Stack spacing={1.5}>
        <TextField
          label="Task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
          autoFocus
          placeholder="e.g. Read chapter 4 before Thursday"
        />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Due (optional)"
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 210 }}
          />
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onDone} color="inherit" size="small">
            Cancel
          </Button>
          <Button
            onClick={submit}
            variant="contained"
            color="secondary"
            size="small"
            disabled={title.trim().length < 2 || add.isPending}
          >
            {add.isPending ? "Adding" : "Add task"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function TaskRow({ task: t, groupId }: { task: StudyGroupTask; groupId: string }) {
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, dialog } = useConfirm();
  const toggle = useToggleStudyGroupTask(groupId);
  const del = useDeleteStudyGroupTask(groupId);
  const sync = useSyncStudyGroupTask(groupId);

  const overdue = !t.done && t.dueDate != null && dayjs(t.dueDate).isBefore(dayjs());

  const remove = async () => {
    const ok = await confirm({
      title: `Delete "${t.title}"?`,
      description: "This removes the task for the whole group.",
      confirmLabel: "Delete task",
      tone: "danger",
    });
    if (!ok) return;
    del.mutate(t.id, {
      onError: (err) =>
        enqueueSnackbar(err instanceof Error ? err.message : "Couldn't delete.", { variant: "error" }),
    });
  };

  const toggleSync = () =>
    sync.mutate(
      { taskId: t.id, synced: t.synced },
      {
        onSuccess: () =>
          enqueueSnackbar(t.synced ? "Removed from your calendar." : "Added to your calendar.", {
            variant: "success",
          }),
        onError: (err) =>
          enqueueSnackbar(err instanceof Error ? err.message : "Couldn't update.", { variant: "error" }),
      },
    );

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="flex-start"
      sx={(th) => ({
        p: 1.25,
        borderRadius: 2,
        border: `1px solid ${th.palette.divider}`,
        opacity: t.done ? 0.66 : 1,
      })}
    >
      <Checkbox
        checked={t.done}
        onChange={(e) => toggle.mutate({ taskId: t.id, done: e.target.checked })}
        color="secondary"
        size="small"
        sx={{ p: 0.5, mt: -0.25 }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, textDecoration: t.done ? "line-through" : "none" }}
        >
          {t.title}
        </Typography>
        {t.notes && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {t.notes}
          </Typography>
        )}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }} flexWrap="wrap">
          {t.dueDate && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: overdue ? "warning.main" : "text.secondary" }}>
              Due {dayjs(t.dueDate).format("ddd D MMM")}
              {overdue ? " · overdue" : ""}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            by {t.createdBy}
          </Typography>
        </Stack>
      </Box>

      {t.dueDate && !t.done && (
        <Tooltip title={t.synced ? "On your calendar" : "Add to my calendar"}>
          <IconButton
            size="small"
            onClick={toggleSync}
            disabled={sync.isPending}
            color={t.synced ? "secondary" : "default"}
            aria-label={t.synced ? "Remove from my calendar" : "Add to my calendar"}
          >
            {t.synced ? <CalendarCheck size={16} /> : <CalendarPlus size={16} />}
          </IconButton>
        </Tooltip>
      )}
      {t.canManage && (
        <IconButton size="small" onClick={remove} disabled={del.isPending} aria-label="Delete task">
          <Trash2 size={15} />
        </IconButton>
      )}
      {dialog}
    </Stack>
  );
}

function Empty({
  icon,
  title,
  body,
  embedded = false,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  embedded?: boolean;
}) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ textAlign: "center", py: embedded ? 5 : 7, px: 3, color: "text.secondary" }}>
      <Box sx={{ color: "text.disabled" }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700, color: "text.primary" }}>{title}</Typography>
      <Typography variant="body2" sx={{ maxWidth: 360 }}>
        {body}
      </Typography>
    </Stack>
  );
}
