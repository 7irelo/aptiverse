"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import AddIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import ChecklistIcon from "@mui/icons-material/ChecklistOutlined";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateAssessment } from "@/lib/api/queries";
import type { AssessmentTask } from "@/lib/mockData";

// Shared task editor used on both the assessment detail page and the
// workspace left rail. One source of truth: edits PATCH the assessment's
// `tasks` field and TanStack Query invalidations fan out to both surfaces.
//
// Optimistic updates: changes flip the UI immediately and the PATCH
// settles in the background. On failure the state rolls back to the
// last known-good list from the server.

type Props = {
  assessmentId: string;
  tasks: AssessmentTask[];
  /** Compact mode tightens padding for the sidebar rail. */
  compact?: boolean;
};

export function TasksEditor({ assessmentId, tasks: serverTasks, compact = false }: Props) {
  const [local, setLocal] = useState<AssessmentTask[]>(serverTasks);
  const [draft, setDraft] = useState("");
  const update = useUpdateAssessment();

  // Keep local in sync when the server data changes (e.g. another tab
  // edited the same assessment, or a refetch lands).
  useMemo(() => setLocal(serverTasks), [serverTasks]);

  const persist = (next: AssessmentTask[]) => {
    setLocal(next);
    update.mutate({ id: assessmentId, tasks: next });
  };

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    persist([...local, { label: trimmed, done: false }]);
    setDraft("");
  };

  const toggle = (i: number) => {
    const next = local.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t));
    persist(next);
  };

  const remove = (i: number) => {
    persist(local.filter((_, idx) => idx !== i));
  };

  const doneCount = local.filter((t) => t.done).length;
  const total = local.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  return (
    <Stack spacing={compact ? 1.5 : 2}>
      {total > 0 && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {doneCount} of {total} done
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {pct}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ height: 4, borderRadius: 999 }}
            color={pct === 100 ? "success" : "primary"}
          />
        </Box>
      )}

      {total === 0 ? (
        <Box sx={{ py: compact ? 1.5 : 3, textAlign: "center" }}>
          {!compact && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                mx: "auto",
                mb: 1.5,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: (t) =>
                  t.palette.mode === "dark"
                    ? "rgba(116, 181, 174, 0.12)"
                    : "rgba(15, 105, 99, 0.08)",
              }}
            >
              <ChecklistIcon fontSize="small" />
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: "auto" }}>
            {compact
              ? "No tasks yet."
              : "Break this down into your own checklist: outline, source material, practice questions, self-review."}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={compact ? 0.5 : 0.75}>
          <AnimatePresence initial={false}>
            {local.map((t, i) => (
              <motion.div
                key={`${i}-${t.label}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ overflow: "hidden" }}
              >
                <TaskRow
                  task={t}
                  compact={compact}
                  onToggle={() => toggle(i)}
                  onRemove={() => remove(i)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stack>
      )}

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Add a task…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button
          onClick={add}
          variant="contained"
          size={compact ? "small" : "medium"}
          disabled={!draft.trim()}
          startIcon={<AddIcon fontSize="small" />}
          sx={{ flexShrink: 0 }}
        >
          Add
        </Button>
      </Stack>
    </Stack>
  );
}

function TaskRow({
  task,
  compact,
  onToggle,
  onRemove,
}: {
  task: AssessmentTask;
  compact: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={compact ? 0.5 : 1}
      sx={{
        px: compact ? 0.5 : 1,
        py: compact ? 0.25 : 0.5,
        borderRadius: 1,
        transition: "background-color 150ms ease",
        "&:hover": {
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(255,255,255,0.03)"
              : "rgba(0,0,0,0.03)",
        },
      }}
    >
      <Checkbox
        size="small"
        checked={task.done}
        onChange={onToggle}
        sx={{ p: 0.75 }}
        inputProps={{ "aria-label": task.label }}
      />
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          textDecoration: task.done ? "line-through" : "none",
          color: task.done ? "text.disabled" : "text.primary",
          minWidth: 0,
          wordBreak: "break-word",
        }}
      >
        {task.label}
      </Typography>
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          opacity: 0,
          transition: "opacity 150ms ease",
          ".MuiStack-root:hover &": { opacity: 1 },
          "&:focus-visible": { opacity: 1 },
          // There is no hover on a phone, so a hover-revealed control is an
          // invisible control. Touch devices get it permanently.
          "@media (hover: none)": { opacity: 1 },
        }}
        aria-label={`Remove "${task.label}"`}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}
