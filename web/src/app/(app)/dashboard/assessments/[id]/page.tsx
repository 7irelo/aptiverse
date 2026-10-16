"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  ClipboardList,
  ArrowRight,
  Pencil,
  Trash2,
  PanelsTopLeft,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TasksEditor } from "@/components/workspace/TasksEditor";
import { UploadsStrip } from "@/components/workspace/UploadsStrip";
import {
  useAssessment,
  useAcademicUnits,
  useTermPredictions,
  usePracticeTests,
  useDeleteAssessment,
} from "@/lib/api/queries";
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  type Assessment,
} from "@/lib/mockData";
import { formatDate, prettifyUnitId } from "@/lib/format";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import { enter } from "@/lib/motion";
import { LifecyclePanel, statusKind, isSettled, isOpen } from "../AssessmentLifecycle";

export default function AssessmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const assessmentQuery = useAssessment(id);
  const academic = useAcademicUnits();
  const vocab = useStudyVocabulary();
  const del = useDeleteAssessment();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const a = assessmentQuery.data;
  // Resolve through the unit list, not a subjects-only lookup: for a tertiary
  // student subjectId is a course practiceKey and the subjects endpoint is
  // always empty. prettifyUnitId is the fallback so an unresolved id degrades
  // to "Calculus I" rather than showing the student our internal key.
  const unit = a ? academic.units.find((u) => u.id === a.subjectId) : undefined;
  const unitName = unit?.name ?? (a ? prettifyUnitId(a.subjectId) : undefined);

  return (
    <>
      <PageHeader
        title={a?.title ?? "Assessment"}
        description={
          a
            ? `${unitName} · ${ASSESSMENT_TYPE_LABELS[a.type] ?? a.type} · worth ${a.weight}% of the ${vocab.periodSingular} mark`
            : undefined
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Assessments", href: "/dashboard/assessments" },
          { label: a?.title ?? "Assessment" },
        ]}
        actions={
          a ? (
            <>
              <Button
                component={Link}
                href={`/dashboard/assessments/${id}/edit`}
                variant="outlined"
                color="inherit"
                startIcon={<Pencil size={16} />}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<Trash2 size={16} />}
                onClick={() => setConfirmOpen(true)}
              >
                Delete
              </Button>
            </>
          ) : null
        }
        meta={
          a ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <StatusChip
                kind={statusKind(a.status)}
                label={ASSESSMENT_STATUS_LABELS[a.status] ?? a.status}
              />
              <Chip label={`Due ${formatDate(a.dueDate)}`} size="small" variant="outlined" />
            </Stack>
          ) : null
        }
      />

      <QueryStates
        query={assessmentQuery}
        isEmpty={() => false}
        empty={{
          icon: <ClipboardList />,
          title: "Assessment not found",
          description: "This assessment does not exist, or it has been removed.",
          action: (
            <Button component={Link} href="/dashboard/assessments" variant="outlined">
              All assessments
            </Button>
          ),
        }}
      >
        {(assessment) => (
          <AssessmentBody
            assessment={assessment}
            unitName={unitName}
            unitHref={unit?.href}
          />
        )}
      </QueryStates>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this assessment?"
        description={
          a
            ? `"${a.title}" and its tasks, notes and attachments will be removed. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        loading={del.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          del.mutate(id, { onSuccess: () => router.push("/dashboard/assessments") })
        }
      />
    </>
  );
}

function AssessmentBody({
  assessment: a,
  unitName,
  unitHref,
}: {
  assessment: Assessment;
  unitName?: string;
  unitHref?: string;
}) {
  const vocab = useStudyVocabulary();
  const predictionsQuery = useTermPredictions();
  const practiceQuery = usePracticeTests();

  const daysLeft = dayjs(a.dueDate).startOf("day").diff(dayjs().startOf("day"), "day");
  const settled = isSettled(a);
  const isOverdue = daysLeft < 0 && isOpen(a);

  // Server truth, read verbatim. currentTerm is the weighted average of this
  // unit's graded marks, computed by MasteryController.GetPredictions. The
  // client must never recompute it a second, differing way.
  const prediction = (predictionsQuery.data ?? []).find((p) => p.subjectId === a.subjectId);

  // Practice that genuinely exists for this unit. Not a suggestion engine:
  // a straight filter over GET /api/practice/tests.
  const practice = (practiceQuery.data ?? []).filter((t) => t.subjectId === a.subjectId);

  return (
    <Stack spacing={3}>
      <motion.div {...enter}>
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em" }}>
              Progress
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <LifecyclePanel assessment={a} />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      <Grid container spacing={2}>
        <Facet
          label={settled ? "Your mark" : "Weight"}
          value={settled ? `${a.actualMark}%` : `${a.weight}%`}
          hint={settled ? `on a ${a.weight}% weighting` : `of the ${vocab.periodSingular} mark`}
        />
        <Facet
          label={settled ? "Marked" : isOverdue ? "Overdue by" : "Due in"}
          value={
            settled
              ? formatDate(a.dueDate)
              : isOverdue
                ? `${Math.abs(daysLeft)}d`
                : daysLeft === 0
                  ? "Today"
                  : `${daysLeft}d`
          }
          hint={settled ? "due date" : dayjs(a.dueDate).format("DD MMM YYYY")}
          tone={isOverdue ? "warning" : "default"}
        />
        {a.predictedMark != null && (
          <Facet
            label="You predicted"
            value={`${a.predictedMark}%`}
            hint={
              settled && a.actualMark != null
                ? markDelta(a.actualMark, a.predictedMark)
                : "your own target"
            }
          />
        )}
        {prediction && prediction.currentTerm > 0 && (
          <Facet
            label={`${unitName ?? vocab.PeriodSingular} so far`}
            value={`${prediction.currentTerm}%`}
            // Deliberately not phrased as "N points above your average": this
            // figure already includes this assessment's own mark, so comparing
            // the two would be self-referential (and reads as "exactly your
            // average" whenever this is the only marked work in the unit).
            // The two tiles sit side by side; the student can read the gap.
            hint="weighted average of all marked work"
          />
        )}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={3}>
            <Panel eyebrow="Plan" title="Tasks">
              <TasksEditor assessmentId={a.id} tasks={a.tasks ?? []} />
            </Panel>
            {/* UploadsStrip brings its own "Attachments" header and collapse
                toggle, so it gets a bare surface rather than a Panel that
                would print the heading twice. */}
            <motion.div {...enter}>
              <Card>
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <UploadsStrip assessmentId={a.id} />
                </CardContent>
              </Card>
            </motion.div>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={3}>
            {a.notes && (
              <Panel eyebrow="Yours" title="Notes">
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {a.notes}
                </Typography>
              </Panel>
            )}

            <PracticeCard
              practice={practice}
              subjectId={a.subjectId}
              unitName={unitName}
              unitNoun={vocab.unitSingular}
              loading={practiceQuery.isLoading}
            />

            {a.status !== "graded" && (
              <Panel eyebrow="Workspace" title="Work on this">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Notes, a draft, and your attachments, side by side.
                </Typography>
                <Button
                  component={Link}
                  href={`/dashboard/workspace?assessment=${encodeURIComponent(a.id)}`}
                  variant="contained"
                  color="secondary"
                  size="small"
                  endIcon={<PanelsTopLeft size={16} />}
                >
                  Open workspace
                </Button>
              </Panel>
            )}

            {unitName && unitHref && (
              <Panel eyebrow="Context" title={unitName}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Every assessment for this {vocab.unitSingular}, in one place.
                </Typography>
                <Button
                  component={Link}
                  href={unitHref}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  endIcon={<ArrowRight size={16} />}
                >
                  Open {unitName}
                </Button>
              </Panel>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

// "8 points above your prediction" beats "72% vs 64%": the student already
// knows both numbers, what they want is the gap between them. Only used for
// predicted vs actual, where the two figures are genuinely independent.
function markDelta(mark: number, against: number) {
  const d = mark - against;
  if (d === 0) return "exactly your prediction";
  return `${Math.abs(d)} ${Math.abs(d) === 1 ? "point" : "points"} ${d > 0 ? "above" : "below"} your prediction`;
}

// --- Building blocks --------------------------------------------------

function Facet({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning";
}) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Card sx={{ height: "100%" }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography
            variant="overline"
            noWrap
            sx={{ color: "text.secondary", letterSpacing: "0.08em", display: "block" }}
          >
            {label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              lineHeight: 1.1,
              mt: 0.5,
              fontVariantNumeric: "tabular-nums",
              color: tone === "warning" ? "warning.main" : "text.primary",
            }}
          >
            {value}
          </Typography>
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {hint}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.08em" }}>
            {eyebrow}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            {title}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PracticeCard({
  practice,
  subjectId,
  unitName,
  unitNoun,
  loading,
}: {
  practice: { id: string; title: string; questionCount: number; attempts: number; bestScore?: number }[];
  subjectId: string;
  unitName?: string;
  unitNoun: string;
  loading: boolean;
}) {
  if (loading) return null;

  return (
    <Panel eyebrow="Prepare" title="Practice">
      {practice.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No practice tests exist for {unitName ?? `this ${unitNoun}`} yet. Generate one and it
          will be waiting here.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {practice.slice(0, 4).map((t) => (
            <Box
              key={t.id}
              component={Link}
              href={`/dashboard/workspace?test=${encodeURIComponent(t.id)}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                borderRadius: 1.5,
                border: 1,
                borderColor: "divider",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 150ms ease, background-color 150ms ease",
                "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {t.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.questionCount} questions
                  {t.attempts > 0 && t.bestScore != null ? ` · best ${t.bestScore}%` : ""}
                </Typography>
              </Box>
              <ArrowRight size={15} style={{ flexShrink: 0, opacity: 0.5 }} />
            </Box>
          ))}
        </Stack>
      )}
      <Button
        component={Link}
        href={`/dashboard/practice?subject=${encodeURIComponent(subjectId)}`}
        variant="outlined"
        color="inherit"
        size="small"
        startIcon={<Sparkles size={16} />}
      >
        {practice.length === 0 ? "Generate practice" : "More practice"}
      </Button>
    </Panel>
  );
}
