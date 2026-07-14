"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import { useSnackbar } from "notistack";
import { useAcademicUnits } from "@/lib/api/queries";
import {
  ASSESSMENT_TYPES,
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  type AssessmentType,
  type AssessmentStatus,
} from "@/lib/mockData";

export type AssessmentFormValues = {
  subjectId: string;
  title: string;
  type: AssessmentType;
  weight: number;
  dueDate: string; // yyyy-mm-dd
  status: AssessmentStatus;
  predictedMark: string; // kept as string in the form; parsed by the caller
  actualMark: string;
  notes: string;
};

// Shared create/edit form for an assessment. Owns its field state, validates,
// and hands a clean value bag to the caller — the caller decides whether that
// is a create (POST) or an edit (PATCH) and handles navigation. `initial`
// seeds the fields, so the edit page renders it only once its data has loaded.
export function AssessmentForm({
  mode,
  initial,
  submitting,
  cancelHref,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial?: Partial<AssessmentFormValues>;
  submitting: boolean;
  cancelHref: string;
  onSubmit: (values: AssessmentFormValues) => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const academic = useAcademicUnits();

  const units = academic.units;
  const noun = academic.unitNoun; // "subject" | "course"
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);
  const noUnits = academic.isReady && units.length === 0;

  const defaultDue = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const [unitId, setUnitId] = useState(initial?.subjectId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<AssessmentType>(initial?.type ?? "test");
  const [weight, setWeight] = useState<number>(initial?.weight ?? 10);
  const [dueDate, setDueDate] = useState<string>(initial?.dueDate ?? defaultDue);
  const [status, setStatus] = useState<AssessmentStatus>(initial?.status ?? "scheduled");
  const [predictedMark, setPredictedMark] = useState<string>(initial?.predictedMark ?? "");
  const [actualMark, setActualMark] = useState<string>(initial?.actualMark ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      enqueueSnackbar("Give the assessment a title.", { variant: "warning" });
      return;
    }
    if (!unitId) {
      enqueueSnackbar(`Pick a ${noun}.`, { variant: "warning" });
      return;
    }
    if (weight < 0 || weight > 100) {
      enqueueSnackbar("Weight must be between 0 and 100.", { variant: "warning" });
      return;
    }
    onSubmit({
      subjectId: unitId,
      title: trimmedTitle,
      type,
      weight,
      dueDate,
      status,
      predictedMark,
      actualMark,
      notes,
    });
  };

  // On edit the unit is already chosen, so a not-yet-loaded unit list
  // shouldn't disable the whole form. Only block a fresh create with no units.
  const blockForNoUnits = mode === "create" && noUnits;

  return (
    <>
      {blockForNoUnits ? (
        <Alert
          severity="info"
          action={
            <Button component={Link} href={academic.addHref} size="small" color="inherit">
              Add {noun}
            </Button>
          }
          sx={{ mb: 3 }}
        >
          You need at least one {noun} before you can log an assessment.
        </Alert>
      ) : null}

      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: "brandSurface.main",
                color: "brandSurface.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AssignmentOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Assessment details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mode === "edit"
                  ? "Update anything here; changes save straight to this assessment."
                  : "You can edit any of this later from the assessment page."}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={2.5}>
            <TextField
              label={Noun}
              select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              required
              fullWidth
              disabled={units.length === 0}
              helperText={units.length === 0 ? `Add a ${noun} first.` : undefined}
            >
              {/* Keep the current unit selectable even if it's momentarily
                  missing from the list while units load on the edit page. */}
              {unitId && !units.some((u) => u.id === unitId) && (
                <MenuItem value={unitId}>{initial?.subjectId ?? unitId}</MenuItem>
              )}
              {units.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              fullWidth
              placeholder='e.g. "Calculus & Trigonometry Test"'
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Type"
                select
                value={type}
                onChange={(e) => setType(e.target.value as AssessmentType)}
                fullWidth
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {ASSESSMENT_TYPE_LABELS[t]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  },
                  htmlInput: { min: 0, max: 100, step: 1 },
                }}
                helperText="Portion of the term mark this assessment contributes."
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Status"
                select
                value={status}
                onChange={(e) => setStatus(e.target.value as AssessmentStatus)}
                fullWidth
              >
                {(Object.entries(ASSESSMENT_STATUS_LABELS) as [AssessmentStatus, string][]).map(
                  ([k, v]) => (
                    <MenuItem key={k} value={k}>
                      {v}
                    </MenuItem>
                  ),
                )}
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Predicted mark (optional)"
                type="number"
                value={predictedMark}
                onChange={(e) => setPredictedMark(e.target.value)}
                fullWidth
                slotProps={{
                  input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                  htmlInput: { min: 0, max: 100, step: 1 },
                }}
              />
              <TextField
                label="Actual mark (optional)"
                type="number"
                value={actualMark}
                onChange={(e) => setActualMark(e.target.value)}
                fullWidth
                slotProps={{
                  input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                  htmlInput: { min: 0, max: 100, step: 1 },
                }}
                helperText="Fill in once your mark is returned."
              />
            </Stack>

            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              placeholder="Topics to revise, where the prep is in your workspace, etc."
            />

            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="secondary"
                disabled={submitting || blockForNoUnits}
              >
                {submitting
                  ? "Saving…"
                  : mode === "edit"
                    ? "Save changes"
                    : "Save assessment"}
              </Button>
              <Button component={Link} href={cancelHref} variant="outlined">
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

// Turn the form's string mark fields into the clamped number|null the API
// expects. Shared by both pages so create and edit coerce identically.
export function parseMark(value: string): number | null {
  if (value.trim() === "") return null;
  return Math.max(0, Math.min(100, Number(value)));
}
