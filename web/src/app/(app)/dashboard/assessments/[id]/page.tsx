"use client";

import { use } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { TasksEditor } from "@/components/workspace/TasksEditor";
import { useAssessment, useAcademicUnits } from "@/lib/api/queries";
import type { Assessment } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { enter, enterStagger } from "@/lib/motion";

export default function AssessmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const assessmentQuery = useAssessment(id);
  const academic = useAcademicUnits();

  const unitName = academic.nameFor(assessmentQuery.data?.subjectId);

  return (
    <>
      <PageHeader
        title={assessmentQuery.data?.title ?? "Assessment"}
        description={
          assessmentQuery.data
            ? `${unitName ?? ""} · ${assessmentQuery.data.type} · weighting ${assessmentQuery.data.weight}%`
            : undefined
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/dashboard/assessments" },
          { label: assessmentQuery.data?.title ?? "Assessment" },
        ]}
        actions={
          <>
            <Button component={Link} href={`/dashboard/assessments/${id}/edit`} variant="outlined">
              Edit
            </Button>
            <Button component={Link} href="/dashboard/practice" variant="outlined">
              Generate practice
            </Button>
            <Button component={Link} href="/dashboard/workspace" variant="contained" color="secondary">
              Open in workspace
            </Button>
          </>
        }
        meta={
          assessmentQuery.data ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <StatusChip
                kind={
                  assessmentQuery.data.status === "graded"
                    ? "success"
                    : assessmentQuery.data.status === "in_progress"
                      ? "info"
                      : assessmentQuery.data.status === "submitted"
                        ? "primary"
                        : "neutral"
                }
                label={assessmentQuery.data.status.replace("_", " ")}
                sx={{ textTransform: "capitalize" }}
              />
              <Chip
                label={`Due ${formatDate(assessmentQuery.data.dueDate)}`}
                size="small"
                variant="outlined"
              />
            </Stack>
          ) : null
        }
      />

      <QueryStates
        query={assessmentQuery}
        isEmpty={() => false}
        empty={{
          icon: <AssignmentIcon />,
          title: "Assessment not found",
          description: "This SBA doesn't exist or has been removed.",
          action: (
            <Button component={Link} href="/dashboard/assessments" variant="outlined">
              All assessments
            </Button>
          ),
        }}
      >
        {(a) => (
          <AssessmentBody assessment={a} subjectName={unitName} isTertiary={academic.isTertiary} />
        )}
      </QueryStates>
    </>
  );
}

function AssessmentBody({
  assessment: a,
  subjectName,
  isTertiary,
}: {
  assessment: Assessment;
  subjectName?: string;
  isTertiary: boolean;
}) {
  const dueAt = dayjs(a.dueDate);
  const daysLeft = Math.ceil((+dueAt.toDate() - Date.now()) / 86400000);
  // A logged actual mark is what "graded" means to the student — don't also
  // require the status field to say "graded" (they're set independently in the
  // form, and the assessments list already treats a mark as graded).
  const isGraded = a.actualMark != null;
  const isOverdue = daysLeft < 0 && !isGraded;

  // Stat tile model — only show stats backed by real fields. No invented
  // "readiness", no AI-estimate label on a user-entered prediction.
  const stats: { label: string; value: string; hint?: string; index: number }[] = [];

  if (isGraded) {
    stats.push({ label: "Actual mark", value: `${a.actualMark}%`, hint: "Graded", index: 0 });
  }
  if (a.predictedMark != null) {
    stats.push({
      label: "Your prediction",
      value: `${a.predictedMark}%`,
      hint: isGraded ? `Set at creation` : `Target you set`,
      index: stats.length,
    });
  }
  stats.push({ label: "Weight", value: `${a.weight}%`, hint: "of term grade", index: stats.length });
  stats.push({
    label: isGraded ? "Submitted" : isOverdue ? "Overdue" : "Days left",
    value: isGraded ? formatDate(a.dueDate) : isOverdue ? `${Math.abs(daysLeft)}d` : `${daysLeft}`,
    hint: isGraded ? "Marked complete" : isOverdue ? "Past due date" : `due ${dueAt.format("DD MMM")}`,
    index: stats.length,
  });

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 6, sm: 6, md: stats.length === 3 ? 4 : 3 }}>
            <Stat {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <TasksCard assessmentId={a.id} tasks={a.tasks ?? []} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {a.notes && <NotesCard notes={a.notes} />}
            <RelatedCard unitName={subjectName} unitId={a.subjectId} isTertiary={isTertiary} />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

// ─── Stat tile (plain, no icon swatch) ──────────────────────────────

function Stat({ label, value, hint, index }: { label: string; value: string; hint?: string; index: number }) {
  return (
    <motion.div {...enterStagger(index)} style={{ height: "100%" }}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            {label}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600, lineHeight: 1.1, mt: 0.5 }}>
            {value}
          </Typography>
          {hint && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {hint}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Tasks ──────────────────────────────────────────────────────────

function TasksCard({
  assessmentId,
  tasks,
}: {
  assessmentId: string;
  tasks: Assessment["tasks"];
}) {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
                Plan
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tasks
              </Typography>
            </Box>
          </Stack>
          <TasksEditor assessmentId={assessmentId} tasks={tasks ?? []} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Notes (only rendered when present) ─────────────────────────────

function NotesCard({ notes }: { notes: string }) {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            Yours
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
            Notes
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-line", color: "text.primary" }}>
            {notes}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Subject / course link ──────────────────────────────────────────

function RelatedCard({
  unitName,
  unitId,
  isTertiary,
}: {
  unitName?: string;
  unitId: string;
  isTertiary: boolean;
}) {
  if (!unitName) return null;
  // High-school subjects have a detail page that groups their assessments.
  // Tertiary courses don't, so we point at practice scoped to the course.
  const href = isTertiary
    ? `/dashboard/practice?subject=${encodeURIComponent(unitId)}`
    : `/dashboard/subjects/${unitId}`;
  const blurb = isTertiary
    ? "Jump into practice tailored to this course."
    : "Open the subject to see every assessment grouped together.";
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            Context
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {unitName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {blurb}
          </Typography>
          <Button
            component={Link}
            href={href}
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            {isTertiary ? "Practice" : `Open ${unitName}`}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
