"use client";

import { use } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
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
import { useAssessment, useSubjects } from "@/lib/api/queries";
import type { Assessment } from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { enter, enterStagger } from "@/lib/motion";

export default function AssessmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const assessmentQuery = useAssessment(id);
  const subjectsQuery = useSubjects();

  const subject = (subjectsQuery.data ?? []).find(
    (s) => s.subjectId === assessmentQuery.data?.subjectId,
  );

  return (
    <>
      <PageHeader
        title={assessmentQuery.data?.title ?? "Assessment"}
        description={
          assessmentQuery.data
            ? `${subject?.name ?? ""} · ${assessmentQuery.data.type} · weighting ${assessmentQuery.data.weight}%`
            : undefined
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/dashboard/assessments" },
          { label: assessmentQuery.data?.title ?? "Assessment" },
        ]}
        actions={
          <>
            <Button component={Link} href="/dashboard/practice" variant="outlined">
              Generate practice
            </Button>
            <Button component={Link} href="/dashboard/workspace" variant="contained">
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
        {(a) => <AssessmentBody assessment={a} subjectName={subject?.name} />}
      </QueryStates>
    </>
  );
}

function AssessmentBody({
  assessment: a,
  subjectName,
}: {
  assessment: Assessment;
  subjectName?: string;
}) {
  const dueAt = dayjs(a.dueDate);
  const daysLeft = Math.ceil((+dueAt.toDate() - Date.now()) / 86400000);
  const isOverdue = daysLeft < 0 && a.status !== "graded";
  const isGraded = a.status === "graded" && a.actualMark != null;

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
            <RubricCard rubric={a.rubric} />
            {a.notes && <NotesCard notes={a.notes} />}
            <RelatedCard subjectName={subjectName} subjectId={a.subjectId} />
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

// ─── Rubric ─────────────────────────────────────────────────────────

function RubricCard({ rubric }: { rubric?: Assessment["rubric"] }) {
  const hasRubric = Array.isArray(rubric) && rubric.length > 0;

  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            Marking
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: hasRubric ? 2 : 1 }}>
            Rubric
          </Typography>

          {hasRubric ? (
            <Stack spacing={2}>
              {rubric!.map((r) => (
                <Box key={r.criterion}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.criterion}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.weight}%
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    {r.description}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={r.weight}
                    color="primary"
                    sx={{ height: 4, borderRadius: 999 }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No rubric attached. When your teacher shares one, it'll appear here with criteria and weights.
            </Typography>
          )}
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

// ─── Subject link ───────────────────────────────────────────────────

function RelatedCard({ subjectName, subjectId }: { subjectName?: string; subjectId: string }) {
  if (!subjectName) return null;
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            Context
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {subjectName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Open the subject to see every assessment grouped together.
          </Typography>
          <Button
            component={Link}
            href={`/dashboard/subjects/${subjectId}`}
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardIcon />}
          >
            Open {subjectName}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
