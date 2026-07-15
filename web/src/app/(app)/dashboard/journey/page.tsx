"use client";

import { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Link from "next/link";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { alpha } from "@mui/material/styles";
import { CardError } from "@/components/common/CardError";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { useSubjects, useAssessments } from "@/lib/api/queries";
import type { Subject, Assessment } from "@/lib/mockData";
import { enter, enterStagger } from "@/lib/motion";
import RouteIcon from "@mui/icons-material/RouteOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";

const PASS_MARK = 50;

export default function JourneyPage() {
  const subjectsQuery = useSubjects();
  const assessmentsQuery = useAssessments();

  const isLoading = subjectsQuery.isLoading || assessmentsQuery.isLoading;
  const isError = subjectsQuery.isError || assessmentsQuery.isError;

  // QueryStates only takes one query; this page genuinely needs two, so
  // we combine the states manually here rather than fight the helper.
  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Your learning journey"
        description="Every assessment is a landmark. Each one logged becomes part of the picture of how you're growing."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Journey" }]}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <CardError
              what="your journey"
              onRetry={() => {
                subjectsQuery.refetch();
                assessmentsQuery.refetch();
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <JourneyView
          subjects={subjectsQuery.data ?? []}
          assessments={assessmentsQuery.data ?? []}
        />
      )}
    </AtmosphericBackdrop>
  );
}

// ─── Main view ───────────────────────────────────────────────────────

type SubjectRow = {
  subject: Subject;
  total: number;
  graded: number;
  submitted: number;
  upcoming: number;
  averageMark: number | null;     // mean of actual marks across graded
  predictedMark: number | null;   // mean of predicted marks across non-graded
  recentAssessments: Assessment[];
};

function JourneyView({ subjects, assessments }: { subjects: Subject[]; assessments: Assessment[] }) {
  if (subjects.length === 0) {
    return <NoSubjectsYet />;
  }

  const rows = useMemo<SubjectRow[]>(
    () =>
      subjects.map((s) => {
        const mine = assessments.filter((a) => a.subjectId === s.subjectId);
        const graded = mine.filter((a) => a.actualMark != null);
        const upcoming = mine.filter((a) => a.status !== "graded");
        const submitted = mine.filter((a) => a.status === "submitted");
        const predicted = mine.filter((a) => a.predictedMark != null);

        return {
          subject: s,
          total: mine.length,
          graded: graded.length,
          submitted: submitted.length,
          upcoming: upcoming.length,
          averageMark:
            graded.length > 0
              ? Math.round(graded.reduce((acc, a) => acc + (a.actualMark ?? 0), 0) / graded.length)
              : null,
          predictedMark:
            predicted.length > 0
              ? Math.round(
                  predicted.reduce((acc, a) => acc + (a.predictedMark ?? 0), 0) / predicted.length,
                )
              : null,
          recentAssessments: [...mine]
            .sort((a, b) => +new Date(b.dueDate) - +new Date(a.dueDate))
            .slice(0, 3),
        };
      }),
    [subjects, assessments],
  );

  const totalAssessments  = rows.reduce((acc, r) => acc + r.total, 0);
  const totalGraded       = rows.reduce((acc, r) => acc + r.graded, 0);
  const totalUpcoming     = rows.reduce((acc, r) => acc + r.upcoming, 0);
  const overallAverage = (() => {
    const allGraded = assessments.filter((a) => a.actualMark != null);
    if (allGraded.length === 0) return null;
    return Math.round(
      allGraded.reduce((acc, a) => acc + (a.actualMark ?? 0), 0) / allGraded.length,
    );
  })();

  // Next-up: the next not-yet-graded assessment ordered by due date.
  const nextUp = [...assessments]
    .filter((a) => a.status !== "graded")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))[0];
  const nextUpSubject = nextUp ? subjects.find((s) => s.subjectId === nextUp.subjectId) : undefined;

  if (totalAssessments === 0) {
    return <NoAssessmentsYet subjectCount={subjects.length} />;
  }

  return (
    <Stack spacing={3}>
      <Hero
        subjectCount={subjects.length}
        totalAssessments={totalAssessments}
        totalGraded={totalGraded}
        totalUpcoming={totalUpcoming}
        overallAverage={overallAverage}
        nextUp={nextUp}
        nextUpSubjectName={nextUpSubject?.name}
      />

      <SubjectTrack rows={rows} />
    </Stack>
  );
}

// ─── Hero — overall picture + what's next ────────────────────────────

function Hero({
  subjectCount,
  totalAssessments,
  totalGraded,
  totalUpcoming,
  overallAverage,
  nextUp,
  nextUpSubjectName,
}: {
  subjectCount: number;
  totalAssessments: number;
  totalGraded: number;
  totalUpcoming: number;
  overallAverage: number | null;
  nextUp?: Assessment;
  nextUpSubjectName?: string;
}) {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                Your average across graded assessments
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 0.5, mb: 1.5 }}>
                <Typography variant="h3" component="div" sx={{ fontWeight: 600, lineHeight: 1.05 }}>
                  {overallAverage != null ? overallAverage : "–"}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {overallAverage != null ? "%" : "no marks yet"}
                </Typography>
              </Stack>

              {overallAverage != null && (
                <LinearProgress
                  variant="determinate"
                  value={Math.min(overallAverage, 100)}
                  color={overallAverage >= PASS_MARK ? "primary" : "warning"}
                  sx={{ height: 8, borderRadius: 999, mb: 2.5 }}
                />
              )}

              <Grid container spacing={2.5}>
                <Grid size={4}>
                  <SmallStat label="Subjects" value={`${subjectCount}`} sub={subjectCount === 1 ? "enrolled" : "enrolled"} />
                </Grid>
                <Grid size={4}>
                  <SmallStat label="Graded" value={`${totalGraded}`} sub={`of ${totalAssessments}`} />
                </Grid>
                <Grid size={4}>
                  <SmallStat label="Upcoming" value={`${totalUpcoming}`} sub="to go" />
                </Grid>
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              {nextUp ? (
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.02)",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: "primary.main" }} />
                    <Typography variant="overline" color="primary.main" sx={{ letterSpacing: "0.08em" }}>
                      Next up
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {nextUp.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                    {nextUpSubjectName ?? "Unlinked"} · due {dayjs(nextUp.dueDate).format("DD MMM")}
                    {nextUp.predictedMark != null ? ` · prediction ${nextUp.predictedMark}%` : ""}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component={Link}
                      href={`/dashboard/assessments/${nextUp.id}`}
                      variant="contained"
                      color="secondary"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                    >
                      Open assessment
                    </Button>
                    <Button
                      component={Link}
                      href="/dashboard/workspace"
                      variant="text"
                      size="small"
                    >
                      Workspace
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming assessments. Everything caught up.
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SmallStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 0.25 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── Per-subject track ───────────────────────────────────────────────

function SubjectTrack({ rows }: { rows: SubjectRow[] }) {
  const sorted = [...rows].sort((a, b) => b.total - a.total);

  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2.5 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                Subject by subject
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Where you stand
              </Typography>
            </Box>
            <Button
              component={Link}
              href="/dashboard/assessments"
              endIcon={<ArrowForwardIcon />}
              size="small"
            >
              All assessments
            </Button>
          </Stack>

          <Stack spacing={2}>
            {sorted.map((row, i) => (
              <motion.div key={row.subject.id} {...enterStagger(i)}>
                <SubjectRowCard row={row} />
              </motion.div>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SubjectRowCard({ row }: { row: SubjectRow }) {
  const { subject: s, total, graded, upcoming, averageMark, predictedMark } = row;
  const hasMarks = averageMark != null;
  const aboveBar = hasMarks && averageMark! >= PASS_MARK;
  const headlineValue = hasMarks ? `${averageMark}%` : predictedMark != null ? `${predictedMark}%` : "–";
  const headlineHint = hasMarks
    ? `${graded} graded`
    : predictedMark != null
      ? "Your prediction"
      : "No marks yet";

  return (
    <Box
      component={Link}
      href={`/dashboard/subjects/${s.id}`}
      sx={{
        display: "block",
        p: 2.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        color: "inherit",
        textDecoration: "none",
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: "text.secondary" },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {s.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Grade {s.grade}{s.teacher ? ` · ${s.teacher}` : ""}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Stack direction="row" alignItems="baseline" spacing={0.5} justifyContent="flex-end">
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                lineHeight: 1.1,
                color: hasMarks
                  ? aboveBar ? "success.main" : "warning.main"
                  : "text.primary",
              }}
            >
              {headlineValue}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {headlineHint}
          </Typography>
        </Box>
      </Stack>

      {hasMarks && (
        <LinearProgress
          variant="determinate"
          value={Math.min(averageMark!, 100)}
          color={aboveBar ? "success" : "warning"}
          sx={{ height: 6, borderRadius: 999, mt: 1.5 }}
        />
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
        <MiniChip icon={<CheckCircleIcon fontSize="inherit" />} label={`${graded} graded`} tone="success" />
        <MiniChip label={`${upcoming} upcoming`} tone="primary" />
        <MiniChip label={`${total} total`} tone="muted" />
      </Stack>
    </Box>
  );
}

function MiniChip({
  icon,
  label,
  tone,
}: {
  icon?: React.ReactNode;
  label: string;
  tone: "success" | "primary" | "muted";
}) {
  const color = tone === "success" ? "success.main" : tone === "primary" ? "primary.main" : "text.secondary";
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        color,
        fontSize: "0.75rem",
      }}
    >
      {icon}
      <Typography variant="caption" sx={{ fontWeight: 500, color: "inherit" }}>
        {label}
      </Typography>
    </Stack>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────

function NoSubjectsYet() {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: 6, textAlign: "center" }}>
          <CenterIcon><RouteIcon /></CenterIcon>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Your journey starts with a subject
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mb: 3 }}>
            Add your subjects so we can track each assessment as a landmark on your way through the year.
          </Typography>
          <Button component={Link} href="/dashboard/subjects" variant="contained" endIcon={<ArrowForwardIcon />}>
            Add subjects
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NoAssessmentsYet({ subjectCount }: { subjectCount: number }) {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: 6, textAlign: "center" }}>
          <CenterIcon><RouteIcon /></CenterIcon>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Log your first assessment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto", mb: 3 }}>
            You're enrolled in {subjectCount} subject{subjectCount === 1 ? "" : "s"}. Each SBA you log becomes a landmark here: predicted, then graded, then the next one.
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="center">
            <Button component={Link} href="/dashboard/assessments/new" variant="contained" endIcon={<ArrowForwardIcon />}>
              Log an assessment
            </Button>
            <Button component={Link} href="/dashboard/subjects" variant="text">
              See subjects
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CenterIcon({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        mx: "auto",
        mb: 2,
        display: "grid",
        placeItems: "center",
        bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.12 : 0.08),
        color: "primary.main",
      }}
    >
      {children}
    </Box>
  );
}

function LoadingSkeleton() {
  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ height: 240, bgcolor: "action.hover", borderRadius: 1 }} />
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ height: 88, bgcolor: "action.hover", borderRadius: 1 }} />
            <Box sx={{ height: 88, bgcolor: "action.hover", borderRadius: 1 }} />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

