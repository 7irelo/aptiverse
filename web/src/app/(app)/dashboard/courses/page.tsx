"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { AcademicStatusBand } from "@/components/dashboard/AcademicStatusBand";
import { UnitSignals } from "@/components/dashboard/UnitSignals";
import {
  useAcademicProfile,
  useUpdateAcademicProfile,
  useInstitutions,
  useCourses,
  useAddCourse,
  useDeleteCourse,
} from "@/lib/api/queries";
import type { Institution, EnrolledCourse } from "@/lib/mockData";

const INSTITUTION_TYPE_LABELS: Record<string, string> = {
  university: "Universities",
  comprehensive_university: "Universities",
  university_of_technology: "Universities of Technology",
  tvet: "TVET Colleges",
  private_college: "Private Colleges",
};

const TYPE_RANK: Record<string, number> = {
  university: 0,
  comprehensive_university: 0,
  university_of_technology: 1,
  private_college: 2,
  tvet: 3,
};

export default function CoursesPage() {
  const profileQuery = useAcademicProfile();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const profile = profileQuery.data;
  const coursesQuery = useCourses();
  const courses = coursesQuery.data ?? [];

  // High-school students belong on /dashboard/subjects. Bounce them back so
  // the two pages stay cleanly separated.
  useEffect(() => {
    if (profileQuery.isSuccess && profile?.educationLevel !== "tertiary") {
      router.replace("/dashboard/subjects");
    }
  }, [profileQuery.isSuccess, profile?.educationLevel, router]);

  if (profileQuery.isLoading || (profileQuery.isSuccess && profile?.educationLevel !== "tertiary")) {
    return (
      <AtmosphericBackdrop>
        <PageHeader title="Courses" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Courses" }]} />
        <Grid container spacing={3}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      </AtmosphericBackdrop>
    );
  }

  if (!profile?.institutionId) {
    return (
      <AtmosphericBackdrop>
        <PageHeader
          title="Courses"
          description="Choose your institution to start adding the courses you're taking."
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Courses" }]}
        />
        <InstitutionPicker />
        <LevelSwitch to="highschool" />
      </AtmosphericBackdrop>
    );
  }

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Courses"
        description="The courses you're taking. Add them so assessments, practice and mastery are tailored to your institution."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Courses" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add course
          </Button>
        }
      />

      <AcademicStatusBand />

      {coursesQuery.isLoading ? (
        <Grid container spacing={3}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : courses.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center", maxWidth: 480, mx: "auto" }}>
          <SchoolIcon sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            No courses yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, mt: 0.5 }}>
            Add the courses you&apos;re taking this term. You&apos;ll be able to log assessments and
            generate practice against them.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add your first course
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((c) => (
            <Grid key={c.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <CourseCard course={c} />
            </Grid>
          ))}
        </Grid>
      )}

      <LevelSwitch to="highschool" />
      <AddCourseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} existing={courses} />
    </AtmosphericBackdrop>
  );
}

// Switch student type when signup didn't set it (or to correct it).
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

function InstitutionPicker() {
  const institutionsQuery = useInstitutions();
  const update = useUpdateAcademicProfile();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState<Institution | null>(null);

  const options = [...(institutionsQuery.data ?? [])].sort(
    (a, b) => (TYPE_RANK[a.type] ?? 9) - (TYPE_RANK[b.type] ?? 9) || a.name.localeCompare(b.name),
  );

  const save = () => {
    if (!selected) return;
    update.mutate(
      { educationLevel: "tertiary", institutionId: selected.id },
      {
        onSuccess: () =>
          enqueueSnackbar(`Institution set to ${selected.name}.`, { variant: "success" }),
        onError: () =>
          enqueueSnackbar("Couldn't save your institution. Try again.", { variant: "error" }),
      },
    );
  };

  return (
    <Card sx={{ maxWidth: 560, mx: "auto" }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          Your institution
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Pick where you study. Your courses and practice are scoped to it, so students at your
          institution share the same course list.
        </Typography>
        <Autocomplete
          options={options}
          loading={institutionsQuery.isLoading}
          value={selected}
          onChange={(_, v) => setSelected(v)}
          getOptionLabel={(o) => o.name}
          groupBy={(o) => INSTITUTION_TYPE_LABELS[o.type] ?? "Other"}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          renderInput={(params) => (
            <TextField {...params} label="Search institutions" placeholder="Start typing…" />
          )}
        />
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={!selected || update.isPending}
          onClick={save}
        >
          {update.isPending ? "Saving…" : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}

function AddCourseDialog({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing: EnrolledCourse[];
}) {
  const add = useAddCourse();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lecturer, setLecturer] = useState("");

  // Dedup guard: warn if a course with the same name (case-insensitive) or the
  // same code is already on the student's list, so the emergent registry stays
  // clean instead of accumulating "Calc 1" / "Calculus I" duplicates.
  const trimmedName = name.trim();
  const trimmedCode = code.trim();
  const duplicate = existing.find(
    (c) =>
      c.name.toLowerCase() === trimmedName.toLowerCase() ||
      (trimmedCode.length > 0 && (c.code ?? "").toLowerCase() === trimmedCode.toLowerCase()),
  );

  const reset = () => {
    setName("");
    setCode("");
    setLecturer("");
    add.reset();
  };
  const handleClose = () => {
    if (add.isPending) return;
    reset();
    onClose();
  };
  const submit = () => {
    if (trimmedName.length < 2 || duplicate) return;
    add.mutate(
      { name: trimmedName, code: trimmedCode || undefined, lecturer: lecturer.trim() || undefined },
      {
        onSuccess: (c) => {
          enqueueSnackbar(`Added ${c.name}.`, { variant: "success" });
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>Add a course</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Course name"
            placeholder="e.g. Calculus I"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            autoFocus
            required
          />
          <TextField
            label="Course code (optional)"
            placeholder="e.g. MAM1000W"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
          />
          <TextField
            label="Lecturer (optional)"
            value={lecturer}
            onChange={(e) => setLecturer(e.target.value)}
            fullWidth
          />
          {duplicate && (
            <Typography variant="body2" color="warning.main">
              You already have &quot;{duplicate.name}&quot; on your list.
            </Typography>
          )}
          {add.isError && (
            <Typography variant="body2" color="error">
              Couldn&apos;t add that course. Please try again.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={add.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={trimmedName.length < 2 || Boolean(duplicate) || add.isPending}
        >
          {add.isPending ? "Adding…" : "Add course"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function CourseCard({ course: c }: { course: EnrolledCourse }) {
  const { enqueueSnackbar } = useSnackbar();
  const del = useDeleteCourse();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const remove = async () => {
    const ok = await confirm({
      title: `Remove ${c.name}?`,
      description:
        "This removes the course from your list. Your institution's shared copy stays for other students.",
      confirmLabel: "Remove course",
    });
    if (!ok) return;
    try {
      await del.mutateAsync(c.id);
      enqueueSnackbar(`Removed ${c.name}.`, { variant: "success" });
    } catch (err) {
      enqueueSnackbar(`Couldn't remove${err instanceof Error ? `: ${err.message}` : ""}`, {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                {c.name}
              </Typography>
              {c.code && (
                <Typography variant="caption" color="text.secondary">
                  {c.code}
                </Typography>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={remove}
              disabled={del.isPending}
              aria-label="Remove course"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
          {c.lecturer && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              {c.lecturer}
            </Typography>
          )}

          <Box sx={{ flex: 1, display: "flex", mt: c.lecturer ? 0 : 2 }}>
            <UnitSignals unitId={c.practiceKey} />
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
            <Button
              component={Link}
              href={`/dashboard/practice?subject=${encodeURIComponent(c.practiceKey)}`}
              variant="contained"
              color="secondary"
              size="small"
              fullWidth
            >
              Practice
            </Button>
            <Button
              component={Link}
              href="/dashboard/assessments/new"
              variant="outlined"
              size="small"
              fullWidth
            >
              Log work
            </Button>
          </Stack>
        </CardContent>
      </Card>
      {confirmDialog}
    </>
  );
}
