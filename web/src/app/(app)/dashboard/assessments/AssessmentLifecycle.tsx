"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Collapse from "@mui/material/Collapse";
import { alpha } from "@mui/material/styles";
import { Check, PenLine, Send, RotateCcw } from "lucide-react";
import { useUpdateAssessment } from "@/lib/api/queries";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import {
  ASSESSMENT_STATUS_LABELS,
  type Assessment,
  type AssessmentStatus,
} from "@/lib/mockData";
import type { StatusKind } from "@/components/common/StatusChip";

// The assessment status lifecycle, in the order the server's AllowedStatuses
// declares it (api/Controllers/AcademicPlanningController.cs):
//
//   scheduled -> in_progress -> submitted -> graded
//
// The API has always accepted every one of these on
// PATCH /api/academic-planning/assessments/{id}; the UI just never offered
// them anywhere except a Status dropdown buried in the edit form. That is why
// students could not find "mark as submitted". This module is the one place
// that owns the transitions so the list and the detail page cannot drift.
export const ASSESSMENT_FLOW: AssessmentStatus[] = [
  "scheduled",
  "in_progress",
  "submitted",
  "graded",
];

// One definition of how a status is coloured. Previously this ternary was
// copy-pasted into the list table, the list group row, and the detail header,
// which is three chances to disagree.
export function statusKind(status: AssessmentStatus): StatusKind {
  switch (status) {
    case "graded":
      return "success";
    case "submitted":
      return "primary";
    case "in_progress":
      return "info";
    default:
      return "neutral";
  }
}

export const statusLabel = (status: AssessmentStatus) =>
  ASSESSMENT_STATUS_LABELS[status] ?? status;

// A mark is the thing that actually settles an assessment. The server's
// prediction engine (MasteryController.GetPredictions) keys off ActualMark
// rather than Status for exactly this reason, so the UI has to agree: logging
// a mark and moving to "graded" is a single action, never two the student has
// to remember to do in order.
export const isSettled = (a: Assessment) => a.actualMark != null;

// "Open" means the ball is still in the student's court: nothing handed in,
// nothing marked. Status and marks are independent columns that are known to
// drift (a student can log a mark without ever flipping Status, which is why
// the prediction engine trusts ActualMark over Status), so both are checked.
// Without the status guard a "graded" row with no mark logged would count
// itself as overdue.
export const isOpen = (a: Assessment) =>
  a.actualMark == null && a.status !== "submitted" && a.status !== "graded";

// --- Progress track ---------------------------------------------------
// Four steps, current one filled. Deliberately not a MUI Stepper: this needs
// to stay legible at 360px, where a Stepper's labels collapse into ellipses.

export function LifecycleTrack({ status }: { status: AssessmentStatus }) {
  const activeIndex = ASSESSMENT_FLOW.indexOf(status);

  return (
    <Stack direction="row" spacing={0} sx={{ width: "100%" }}>
      {ASSESSMENT_FLOW.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <Box key={step} sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                height: 3,
                borderRadius: 999,
                mb: 1,
                bgcolor: (t) =>
                  done || current
                    ? current
                      ? t.palette.text.primary
                      : alpha(t.palette.text.primary, 0.4)
                    : t.palette.divider,
                transition: "background-color 200ms ease",
              }}
            />
            <Typography
              variant="caption"
              noWrap
              sx={{
                display: "block",
                fontWeight: current ? 700 : 500,
                color: done || current ? "text.primary" : "text.disabled",
                fontSize: { xs: "0.6875rem", sm: "0.75rem" },
              }}
            >
              {statusLabel(step)}
            </Typography>
          </Box>
        );
      })}
    </Stack>
  );
}

// --- Actions ----------------------------------------------------------

// What the student can legally do next, given where they are. Only forward
// moves plus an explicit reopen: a status picker that lets you set any value
// from any value is a form field, not a workflow.
export function nextActions(status: AssessmentStatus): {
  to: AssessmentStatus;
  label: string;
  icon: React.ReactNode;
  primary: boolean;
}[] {
  switch (status) {
    case "scheduled":
      return [
        { to: "in_progress", label: "Start working", icon: <PenLine size={16} />, primary: true },
        { to: "submitted", label: "Mark as submitted", icon: <Send size={16} />, primary: false },
      ];
    case "in_progress":
      return [
        { to: "submitted", label: "Mark as submitted", icon: <Send size={16} />, primary: true },
      ];
    case "submitted":
      return [
        { to: "in_progress", label: "Reopen", icon: <RotateCcw size={16} />, primary: false },
      ];
    default:
      return [];
  }
}

// The full lifecycle control for the detail page: where you are, what you can
// do next, and the mark entry that closes it out.
export function LifecyclePanel({ assessment: a }: { assessment: Assessment }) {
  const update = useUpdateAssessment();
  const vocab = useStudyVocabulary();
  const [loggingMark, setLoggingMark] = useState(false);
  const [markDraft, setMarkDraft] = useState<string>(
    a.actualMark != null ? String(a.actualMark) : "",
  );

  const actions = nextActions(a.status);
  const settled = isSettled(a);

  const move = (to: AssessmentStatus) => update.mutate({ id: a.id, status: to });

  const saveMark = () => {
    const raw = markDraft.trim();
    if (raw === "") return;
    const mark = Math.max(0, Math.min(100, Number(raw)));
    if (Number.isNaN(mark)) return;
    // Mark and status move together. This is what keeps the assessments list,
    // the detail page, and the server's term prediction telling one story.
    update.mutate(
      { id: a.id, actualMark: mark, status: "graded" },
      { onSuccess: () => setLoggingMark(false) },
    );
  };

  return (
    <Box>
      <LifecycleTrack status={a.status} />

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{ mt: 2.5 }}
      >
        {actions.map((action) => (
          <Button
            key={action.to}
            size="small"
            variant={action.primary ? "contained" : "outlined"}
            color={action.primary ? "secondary" : "inherit"}
            startIcon={action.icon}
            disabled={update.isPending}
            onClick={() => move(action.to)}
          >
            {action.label}
          </Button>
        ))}

        {!loggingMark && (
          <Button
            size="small"
            variant={a.status === "submitted" && !settled ? "contained" : "outlined"}
            color={a.status === "submitted" && !settled ? "secondary" : "inherit"}
            startIcon={<Check size={16} />}
            onClick={() => setLoggingMark(true)}
          >
            {settled ? "Update mark" : "Log mark"}
          </Button>
        )}
      </Stack>

      <Collapse in={loggingMark} unmountOnExit>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ mt: 2 }}
        >
          <TextField
            size="small"
            type="number"
            label="Mark"
            autoFocus
            value={markDraft}
            onChange={(e) => setMarkDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveMark();
              if (e.key === "Escape") setLoggingMark(false);
            }}
            slotProps={{
              input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
              htmlInput: { min: 0, max: 100, step: 1, "aria-label": "Mark out of 100" },
            }}
            sx={{ maxWidth: { sm: 160 } }}
          />
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              onClick={saveMark}
              disabled={update.isPending || markDraft.trim() === ""}
            >
              {update.isPending ? "Saving" : "Save mark"}
            </Button>
            <Button size="small" variant="text" color="inherit" onClick={() => setLoggingMark(false)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Saving a mark files this assessment as graded and updates your{" "}
          {vocab.periodSingular} mark.
        </Typography>
      </Collapse>
    </Box>
  );
}

// Compact one-click "Mark as submitted" for a list row. Only rendered where it
// is the obviously right move, so the list stays a list rather than turning
// into a grid of buttons.
//
// The label is a verb phrase, not the status name: a button reading
// "Submitted" next to a status column reads as a state, and a student cannot
// tell whether it is telling them something or offering to do something.
export function QuickSubmitButton({ assessment: a }: { assessment: Assessment }) {
  const update = useUpdateAssessment();
  return (
    <Button
      size="small"
      variant="outlined"
      color="inherit"
      startIcon={<Send size={14} />}
      disabled={update.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        update.mutate({ id: a.id, status: "submitted" });
      }}
      sx={{ width: { xs: "100%", sm: "auto" }, whiteSpace: "nowrap" }}
    >
      Mark as submitted
    </Button>
  );
}
