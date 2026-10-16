"use client";

import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import { Plus, Trash2, Info } from "lucide-react";
import {
  useAcademicProfile,
  useAcademicUnits,
  useCurriculumSubjects,
} from "@/lib/api/queries";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import {
  useCreateAdmissionTarget,
  useUpdateAdmissionTarget,
  type AdmissionTarget,
  type AdmissionOverallUnit,
  type AdmissionStage,
  type AdmissionTargetKind,
  type RequirementInput,
} from "@/lib/api/targets";

// The form where the student enters what they researched.
//
// Every input here is free text or a number they supply. There is no
// institution dropdown, no programme catalog and no "suggested requirements",
// because we do not know any of those things and inventing them is how a
// student ends up planning around a figure we made up.
//
// The subject picker is the one exception, and it is real: for high school it
// is the CAPS catalog the curriculum actually publishes, and it deliberately
// offers subjects the student is NOT enrolled in. That is not an oversight. A
// plan that needs Physical Science has to be expressible by a student who is
// not taking Physical Science, otherwise the most important warning in this
// feature could never fire.

type UnitOption = { id: string; name: string; meta?: string };

export type TargetDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Present = edit. Absent = create. */
  target?: AdmissionTarget | null;
};

type Row = { key: string; unitId: string; minimum: string };

const STAGE_LABELS: { value: AdmissionStage; label: string }[] = [
  { value: "next_year", label: "Next year of my degree" },
  { value: "honours", label: "Honours" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
];

let rowSeq = 0;
const newRow = (unitId = "", minimum = ""): Row => ({ key: `r${rowSeq++}`, unitId, minimum });

export function TargetDialog({ open, onClose, target }: TargetDialogProps) {
  const profile = useAcademicProfile();
  const academic = useAcademicUnits();
  const vocab = useStudyVocabulary();
  const isTertiary = vocab.isTertiary;
  const catalog = useCurriculumSubjects(isTertiary ? null : profile.data?.curriculumId);

  const create = useCreateAdmissionTarget();
  const update = useUpdateAdmissionTarget();
  const editing = !!target;

  const [kind, setKind] = useState<AdmissionTargetKind>("admission");
  const [stage, setStage] = useState<AdmissionStage>("next_year");
  const [institution, setInstitution] = useState("");
  const [programme, setProgramme] = useState("");
  const [overallUnit, setOverallUnit] = useState<AdmissionOverallUnit | "">("");
  const [overallRequired, setOverallRequired] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [error, setError] = useState<string | null>(null);

  // Reset from the target (or to blank) every time the dialog opens, so a
  // cancelled edit never leaks into the next one.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (target) {
      setKind(target.kind);
      setStage((target.stage as AdmissionStage) ?? "next_year");
      setInstitution(target.institution);
      setProgramme(target.programme);
      setOverallUnit(target.overallUnit ?? "");
      setOverallRequired(target.overallRequired != null ? String(target.overallRequired) : "");
      setDeadline(target.deadline ? target.deadline.slice(0, 10) : "");
      setSourceNote(target.sourceNote ?? "");
      setRows(
        target.requirements.length
          ? target.requirements.map((r) => newRow(r.unitId, String(r.minimumPercent)))
          : [newRow()],
      );
    } else {
      // A tertiary student is almost always aiming at the next rung, a school
      // student at admission. Default to the likely answer, never lock it:
      // a tertiary student may well be applying to a different institution.
      setKind(isTertiary ? "progression" : "admission");
      setStage("next_year");
      setInstitution("");
      setProgramme("");
      setOverallUnit("");
      setOverallRequired("");
      setDeadline("");
      setSourceNote("");
      setRows([newRow()]);
    }
  }, [open, target, isTertiary]);

  // High school picks from the published CAPS catalog, which includes subjects
  // they are not taking. Tertiary picks from their own enrolled courses,
  // because there is no institution-wide course catalog to offer and inventing
  // one is exactly what this feature refuses to do.
  const options: UnitOption[] = useMemo(() => {
    if (isTertiary) {
      return academic.units.map((u) => ({ id: u.id, name: u.name, meta: u.meta }));
    }
    return (catalog.data ?? []).map((c) => ({ id: c.id, name: c.name, meta: c.code }));
  }, [isTertiary, academic.units, catalog.data]);

  const chosen = new Set(rows.map((r) => r.unitId).filter(Boolean));

  const setRow = (key: string, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const submit = () => {
    setError(null);

    if (!institution.trim()) return setError("Name the institution you're aiming at.");
    if (!programme.trim()) return setError("Name the programme you're aiming at.");

    const requirements: RequirementInput[] = [];
    for (const r of rows) {
      if (!r.unitId && !r.minimum) continue; // an untouched blank row is not an error.
      if (!r.unitId) return setError("Pick a subject for every minimum you've entered.");
      const n = Number(r.minimum);
      if (!Number.isInteger(n) || n < 1 || n > 100)
        return setError("Every minimum mark has to be a whole number between 1 and 100.");
      requirements.push({ unitId: r.unitId, minimumPercent: n });
    }

    if (overallUnit && !overallRequired.trim())
      return setError("Enter the number you researched, or clear the overall requirement.");

    const payload = {
      institution: institution.trim(),
      programme: programme.trim(),
      kind,
      stage: kind === "progression" ? stage : null,
      overallUnit: overallUnit || null,
      overallRequired: overallUnit && overallRequired ? Number(overallRequired) : null,
      deadline: deadline ? new Date(`${deadline}T00:00:00`).toISOString() : null,
      sourceNote: sourceNote.trim() || null,
      requirements,
    };

    const onError = (e: unknown) =>
      setError(e instanceof Error ? e.message : "That didn't save. Try again.");

    if (target) {
      update.mutate({ id: target.id, ...payload }, { onSuccess: () => onClose(), onError });
    } else {
      create.mutate(payload, { onSuccess: () => onClose(), onError });
    }
  };

  const saving = create.isPending || update.isPending;
  const unitNoun = vocab.unitSingular;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editing ? "Edit plan" : "Add a plan"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 0.5 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              display: "flex",
              gap: 1.5,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.07),
            }}
          >
            <Box sx={{ color: "primary.main", flexShrink: 0, pt: 0.25 }}>
              <Info size={16} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              These are your numbers. We don&apos;t hold a list of what institutions require, and we
              won&apos;t guess: requirements change by faculty and by intake year, so check the
              prospectus or the faculty handbook and enter what it says.
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={kind}
            exclusive
            fullWidth
            size="small"
            onChange={(_e, v: AdmissionTargetKind | null) => v && setKind(v)}
          >
            <ToggleButton value="admission">Getting in</ToggleButton>
            <ToggleButton value="progression">Moving up</ToggleButton>
          </ToggleButtonGroup>

          {kind === "progression" && (
            <TextField
              select
              fullWidth
              label="Progressing to"
              value={stage}
              onChange={(e) => setStage(e.target.value as AdmissionStage)}
            >
              {STAGE_LABELS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            fullWidth
            label="Institution"
            placeholder="University of Cape Town"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 160 } }}
          />

          <TextField
            fullWidth
            label="Programme"
            placeholder={kind === "progression" ? "MSc Applied Mathematics" : "BSc Computer Science"}
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 160 } }}
          />

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Overall requirement
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              Optional. Plenty of programmes gate on {unitNoun} minimums alone.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Measured as"
                value={overallUnit}
                onChange={(e) => setOverallUnit(e.target.value as AdmissionOverallUnit | "")}
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="aps">APS score</MenuItem>
                <MenuItem value="average">Average %</MenuItem>
              </TextField>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="They require"
                value={overallRequired}
                disabled={!overallUnit}
                onChange={(e) => setOverallRequired(e.target.value)}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
              />
            </Stack>
            {overallUnit === "aps" && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                We record your APS target but we don&apos;t calculate your APS. Every institution
                scores it on its own scale, so the tally has to come from their table, not ours.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              {vocab.UnitSingular} minimums
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              This is the part that becomes goals. Each minimum is tracked against your real marks.
            </Typography>

            <Stack spacing={1.5}>
              {rows.map((row) => {
                const selected = options.find((o) => o.id === row.unitId) ?? null;
                return (
                  <Stack key={row.key} direction="row" spacing={1} alignItems="flex-start">
                    <Autocomplete
                      sx={{ flex: 1, minWidth: 0 }}
                      size="small"
                      options={options.filter((o) => o.id === row.unitId || !chosen.has(o.id))}
                      value={selected}
                      getOptionLabel={(o) => o.name}
                      isOptionEqualToValue={(o, v) => o.id === v.id}
                      onChange={(_e, v) => setRow(row.key, { unitId: v?.id ?? "" })}
                      loading={isTertiary ? academic.isLoading : catalog.isLoading}
                      noOptionsText={
                        isTertiary ? `Add your courses first` : "No subjects for your curriculum"
                      }
                      renderInput={(params) => (
                        <TextField {...params} label={vocab.UnitSingular} />
                      )}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Min %"
                      sx={{ width: 96, flexShrink: 0 }}
                      value={row.minimum}
                      onChange={(e) => setRow(row.key, { minimum: e.target.value })}
                      slotProps={{ htmlInput: { min: 1, max: 100 } }}
                    />
                    <IconButton
                      aria-label="Remove this minimum"
                      size="small"
                      sx={{ mt: 0.5, flexShrink: 0 }}
                      disabled={rows.length === 1}
                      onClick={() => setRows((rs) => rs.filter((r) => r.key !== row.key))}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Stack>
                );
              })}
            </Stack>

            <Button
              size="small"
              startIcon={<Plus size={15} />}
              sx={{ mt: 1.5 }}
              disabled={rows.length >= 30}
              onClick={() => setRows((rs) => [...rs, newRow()])}
            >
              Add another
            </Button>
          </Box>

          <Divider />

          <TextField
            fullWidth
            size="small"
            type="date"
            label="Application deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Optional. Shown on the plan and counted down."
          />

          <TextField
            fullWidth
            size="small"
            label="Where you found this"
            placeholder="UCT prospectus 2027, p.14"
            value={sourceNote}
            onChange={(e) => setSourceNote(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 500 } }}
            helperText="Optional, and worth it. Requirements change; future you will want the source."
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" color="secondary" onClick={submit} disabled={saving}>
          {saving ? "Saving..." : editing ? "Save plan" : "Add plan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
