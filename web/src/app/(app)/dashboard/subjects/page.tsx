"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import CheckIcon from "@mui/icons-material/Check";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { AcademicStatusBand } from "@/components/dashboard/AcademicStatusBand";
import { UnitSignals } from "@/components/dashboard/UnitSignals";
import {
  useSubjects,
  useCurricula,
  useCurriculumSubjects,
  useAcademicProfile,
  useUpdateAcademicProfile,
  useAddSubject,
  useDeleteSubject,
} from "@/lib/api/queries";
import type { Subject, CatalogSubject, Curriculum } from "@/lib/mockData";

const CATEGORY_ORDER = [
  "language",
  "mathematics",
  "natural_science",
  "commerce",
  "humanities",
  "technical",
  "services",
  "arts",
  "life_orientation",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  mathematics: "Mathematics",
  natural_science: "Natural Sciences",
  commerce: "Commerce",
  humanities: "Humanities",
  technical: "Technical",
  services: "Services",
  arts: "Arts",
  life_orientation: "Life Orientation",
};

// All values darkened from the original palette so the white text the
// chip uses clears WCAG AA (≥4.5:1) on every category. The previous
// values failed for yellow / light-blue / red-orange / blue-grey / pink.
const CATEGORY_COLOR: Record<string, string> = {
  language: "#C2421F",         // was #F25C2E — 5.4:1 with white
  mathematics: "#1F8079",      // unchanged — 5.3:1
  natural_science: "#1E6BB5",  // was #5BA3E5 — 5.0:1
  commerce: "#8B6210",         // was #FFB733 — 6.0:1
  humanities: "#7B1FA2",       // was #9c27b0 — 6.3:1
  technical: "#455A64",        // was #607d8b — 6.5:1
  services: "#2A6B45",         // was #3D9762 — 5.5:1
  arts: "#B0094A",             // was #e91e63 — 5.6:1
  life_orientation: "#4B4E4A", // neutral graphite — was old-brand pine #0F6963
};

export default function SubjectsPage() {
  const profileQuery = useAcademicProfile();
  const subjectsQuery = useSubjects();
  const curriculaQuery = useCurricula();

  const [dialogOpen, setDialogOpen] = useState(false);

  const profile = profileQuery.data;
  const subjects = subjectsQuery.data ?? [];
  const router = useRouter();
  const isTertiary = profile?.educationLevel === "tertiary";

  // Tertiary students study institution courses, not CAPS subjects. They live
  // on /dashboard/courses now, so bounce them there and keep this page purely
  // high-school.
  useEffect(() => {
    if (profileQuery.isSuccess && isTertiary) {
      router.replace("/dashboard/courses");
    }
  }, [profileQuery.isSuccess, isTertiary, router]);

  // Loading state — show skeleton header + grid until profile resolves, or
  // while a tertiary student is being redirected to Courses.
  if (profileQuery.isLoading || subjectsQuery.isLoading || isTertiary) {
    return (
      <AtmosphericBackdrop>
        <PageHeader title="Subjects" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]} />
        <Grid container spacing={3}>
          {[0, 1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={180} />
            </Grid>
          ))}
        </Grid>
      </AtmosphericBackdrop>
    );
  }

  // State 1 — user has no curriculum yet → curriculum picker
  if (!profile?.curriculumId) {
    return (
      <AtmosphericBackdrop>
        <PageHeader
          title="Subjects"
          description="Pick your curriculum to see the subject catalog. You can change this later in settings."
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]}
        />
        <CurriculumPicker curricula={curriculaQuery.data ?? []} loading={curriculaQuery.isLoading} />
        <LevelSwitch to="tertiary" />
      </AtmosphericBackdrop>
    );
  }

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Subjects"
        description="Your FET-phase subjects. Add the ones you're studying. Marks and topic mastery fill in as you log assessments."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]}
        actions={
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add subject
          </Button>
        }
      />

      {subjects.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", maxWidth: 480, mx: "auto" }}>
          <SchoolIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No subjects yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 0.5 }}>
            Add the subjects you're taking in Grade {profile.grade ?? 10}–12. We've already loaded the catalog for {profile.curriculumId.toUpperCase()}.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add your first subject
          </Button>
        </Box>
      ) : (
        <>
          <AcademicStatusBand />
          <SubjectsGrid subjects={subjects} />
        </>
      )}

      <AddSubjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        curriculumId={profile.curriculumId}
        userGrade={profile.grade ?? 12}
        existingSubjectIds={new Set(subjects.map((s) => s.subjectId))}
      />
    </AtmosphericBackdrop>
  );
}

function CurriculumPicker({ curricula, loading }: { curricula: Curriculum[]; loading: boolean }) {
  const { enqueueSnackbar } = useSnackbar();
  const update = useUpdateAcademicProfile();

  const pick = async (curriculumId: string) => {
    try {
      await update.mutateAsync({ curriculumId });
      enqueueSnackbar(`Curriculum set to ${curriculumId.toUpperCase()}.`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[0, 1].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6 }}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {curricula.map((c) => (
        <Grid key={c.id} size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {c.shortName}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {c.name}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flex: 1 }}>
                {c.description}
              </Typography>
              <Button
                variant="contained"
                onClick={() => pick(c.id)}
                disabled={update.isPending}
                fullWidth
              >
                {update.isPending ? "Setting…" : `Use ${c.shortName}`}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function AddSubjectDialog({
  open,
  onClose,
  curriculumId,
  userGrade,
  existingSubjectIds,
}: {
  open: boolean;
  onClose: () => void;
  curriculumId: string;
  userGrade: number;
  existingSubjectIds: Set<string>;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const catalogQuery = useCurriculumSubjects(curriculumId);
  const add = useAddSubject();

  const [grade, setGrade] = useState<number>(userGrade);
  // Per-row teacher input — keyed by curriculumSubjectId so each subject
  // can have its own teacher entered before pressing Add.
  const [teacherByRow, setTeacherByRow] = useState<Record<number, string>>({});
  const [adding, setAdding] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const items = catalogQuery.data ?? [];
    const byCat = new Map<string, CatalogSubject[]>();
    for (const s of items) {
      if (!byCat.has(s.category)) byCat.set(s.category, []);
      byCat.get(s.category)!.push(s);
    }
    return CATEGORY_ORDER.filter((c) => byCat.has(c)).map((c) => ({
      category: c,
      label: CATEGORY_LABELS[c] ?? c,
      subjects: byCat.get(c)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [catalogQuery.data]);

  const handleAdd = async (s: CatalogSubject) => {
    if (existingSubjectIds.has(s.id) || adding != null) return;
    setAdding(s.curriculumSubjectId);
    try {
      const t = (teacherByRow[s.curriculumSubjectId] ?? "").trim();
      await add.mutateAsync({
        curriculumSubjectId: s.curriculumSubjectId,
        grade,
        teacher: t || undefined,
      });
      enqueueSnackbar(`Added ${s.name}.`, { variant: "success" });
      // Clear the teacher input for the just-added row so it's tidy on re-open
      setTeacherByRow((prev) => {
        const next = { ...prev };
        delete next[s.curriculumSubjectId];
        return next;
      });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't add ${s.name}${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add a subject
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {curriculumId.toUpperCase()} catalog · pick what you're taking
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
          <TextField
            label="Grade"
            select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value={10}>Grade 10</MenuItem>
            <MenuItem value={11}>Grade 11</MenuItem>
            <MenuItem value={12}>Grade 12</MenuItem>
          </TextField>
          <Typography variant="caption" color="text.secondary">
            Enter the teacher (optional) next to each subject before clicking Add.
          </Typography>
        </Stack>

        {catalogQuery.isLoading ? (
          <Stack spacing={1}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rounded" height={48} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={3}>
            {grouped.map((g) => (
              <Box key={g.category}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1, fontWeight: 600 }}
                >
                  {g.label}
                </Typography>
                <Stack spacing={1}>
                  {g.subjects.map((s) => {
                    const already = existingSubjectIds.has(s.id);
                    const isAdding = adding === s.curriculumSubjectId;
                    return (
                      <Box
                        key={s.curriculumSubjectId}
                        data-subject-slug={s.id}
                        sx={{
                          p: 1.5,
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          opacity: already ? 0.55 : 1,
                          bgcolor: already ? "action.hover" : "transparent",
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 11,
                            bgcolor: CATEGORY_COLOR[g.category] ?? "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          {s.code.split(" ")[0]}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography sx={{ fontWeight: 600 }} noWrap>
                              {s.name}
                            </Typography>
                            {s.isCompulsory && (
                              <Chip label="Compulsory" size="small" color="primary" variant="outlined" />
                            )}
                          </Stack>
                          {s.description && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {s.description}
                            </Typography>
                          )}
                        </Box>
                        {already ? (
                          <Chip
                            icon={<CheckIcon />}
                            label="Added"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <>
                            <TextField
                              size="small"
                              placeholder="Teacher (optional)"
                              value={teacherByRow[s.curriculumSubjectId] ?? ""}
                              onChange={(e) =>
                                setTeacherByRow((prev) => ({
                                  ...prev,
                                  [s.curriculumSubjectId]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAdd(s);
                                }
                              }}
                              sx={{ width: { xs: 140, sm: 200 } }}
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleAdd(s)}
                              disabled={isAdding}
                            >
                              {isAdding ? "Adding…" : "Add"}
                            </Button>
                          </>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

function SubjectsGrid({ subjects }: { subjects: Subject[] }) {
  return (
    <Grid container spacing={3}>
      {subjects.map((s) => (
        <Grid key={s.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <SubjectCard subject={s} />
        </Grid>
      ))}
    </Grid>
  );
}

function SubjectCard({ subject: s }: { subject: Subject }) {
  const { enqueueSnackbar } = useSnackbar();
  const del = useDeleteSubject();
  const { confirm, dialog: confirmDialog } = useConfirm();
  const color = CATEGORY_COLOR[s.category] ?? "#1F8079";

  const remove = async () => {
    if (s.isCompulsory) {
      enqueueSnackbar(`${s.name} is compulsory on your curriculum. Can't remove.`, {
        variant: "info",
      });
      return;
    }
    const ok = await confirm({
      title: `Remove ${s.name}?`,
      description:
        "Any marks you logged against this subject stay in your records but stop counting towards averages and predictions. You can add it back later.",
      confirmLabel: "Remove subject",
    });
    if (!ok) return;
    try {
      await del.mutateAsync(s.id);
      enqueueSnackbar(`Removed ${s.name}.`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't remove${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <>
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              {s.code.split(" ")[0]}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                {s.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Grade {s.grade}
                {s.teacher ? ` · ${s.teacher}` : ""}
              </Typography>
            </Box>
          </Stack>
          {s.isCompulsory ? (
            <LockOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} titleAccess="Compulsory" />
          ) : (
            <IconButton size="small" onClick={remove} disabled={del.isPending} aria-label="Remove subject">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <UnitSignals unitId={s.subjectId} />

        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          <Button component={Link} href={`/dashboard/subjects/${s.id}`} variant="contained" size="small" fullWidth>
            Open
          </Button>
          <Button
            component={Link}
            href={`/dashboard/practice?subject=${s.subjectId}`}
            variant="outlined"
            color="secondary"
            size="small"
          >
            Practice
          </Button>
        </Stack>
      </CardContent>
    </Card>
    {confirmDialog}
    </>
  );
}

// Switch student type when signup didn't set it (or to correct it). For a
// high-school student this offers the jump to university/college; the tertiary
// side lives on /dashboard/courses.
function LevelSwitch({ to }: { to: "highschool" | "tertiary" }) {
  const update = useUpdateAcademicProfile();
  const prompt = to === "tertiary" ? "At university or college?" : "Actually in high school?";
  const cta = to === "tertiary" ? "Switch to university/college" : "Switch to high school";
  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="body2" color="text.secondary" component="span" sx={{ mr: 1 }}>
        {prompt}
      </Typography>
      <Button
        variant="text"
        size="small"
        disabled={update.isPending}
        onClick={() => update.mutate({ educationLevel: to })}
      >
        {cta}
      </Button>
    </Box>
  );
}
