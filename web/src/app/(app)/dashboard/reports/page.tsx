"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import GlobalStyles from "@mui/material/GlobalStyles";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import PrintIcon from "@mui/icons-material/PrintOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { CardError } from "@/components/common/CardError";
import { Logo } from "@/components/common/Logo";
import {
  useTermPredictions,
  useTopicMastery,
  useAssessments,
  useSubjects,
  useWellbeingSummary,
  useAcademicProfile,
} from "@/lib/api/queries";

// Print isolation: hide the whole app shell and show only #report-doc, so the
// browser's Save-as-PDF produces a clean document, not the dashboard chrome.
const printStyles = {
  "@media print": {
    "body *": { visibility: "hidden" as const },
    "#report-doc, #report-doc *": { visibility: "visible" as const },
    "#report-doc": {
      position: "absolute" as const,
      left: 0,
      top: 0,
      width: "100%",
      margin: 0,
      boxShadow: "none",
      border: "none",
    },
    "@page": { margin: "16mm" },
  },
};

export default function ReportsPage() {
  const predictionsQuery = useTermPredictions();
  const masteryQuery = useTopicMastery();
  const assessmentsQuery = useAssessments();
  const subjectsQuery = useSubjects();
  const wellbeingQuery = useWellbeingSummary();
  const profileQuery = useAcademicProfile();
  const { data: session } = useSession();

  const predictions = predictionsQuery.data ?? [];
  const topics = masteryQuery.data ?? [];
  const assessments = assessmentsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const wellbeing = wellbeingQuery.data;
  const profile = profileQuery.data;

  const loading =
    predictionsQuery.isLoading ||
    masteryQuery.isLoading ||
    assessmentsQuery.isLoading ||
    subjectsQuery.isLoading;
  const isError = predictionsQuery.isError || masteryQuery.isError || assessmentsQuery.isError;

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "Unlinked";

  const graded = assessments
    .filter((a) => a.actualMark != null)
    .sort((a, b) => +new Date(b.dueDate) - +new Date(a.dueDate));

  const currentAvg =
    predictions.length > 0
      ? Math.round(predictions.reduce((s, p) => s + p.currentTerm, 0) / predictions.length)
      : null;
  const predictedAvg =
    predictions.length > 0
      ? Math.round(predictions.reduce((s, p) => s + p.predictedNextTerm, 0) / predictions.length)
      : null;
  const overallMastery =
    topics.length > 0
      ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
      : null;

  const sorted = [...topics].sort((a, b) => b.mastery - a.mastery);
  const strongest = sorted.slice(0, 3);
  const weakest = [...sorted].reverse().slice(0, 3);

  const studentName = session?.user?.name || session?.user?.email || "Student";
  const generatedOn = dayjs().format("D MMMM YYYY");

  const nothingToReport =
    !loading &&
    !isError &&
    predictions.length === 0 &&
    topics.length === 0 &&
    graded.length === 0;

  return (
    <>
      <GlobalStyles styles={printStyles} />

      <PageHeader
        title="Reports"
        description="Generate a progress report to share with a parent, teacher, or tutor. It builds from your real marks and mastery."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}
      />

      {loading ? (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={520} />
        </Stack>
      ) : isError ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <CardError
              onRetry={() => {
                void predictionsQuery.refetch();
                void masteryQuery.refetch();
                void assessmentsQuery.refetch();
              }}
              what="your report data"
            />
          </CardContent>
        </Card>
      ) : nothingToReport ? (
        <EmptyReport />
      ) : (
        <>
          {/* Controls — not printed (outside #report-doc). */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Term progress report
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review the preview below, then save it as a PDF or print it to share.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{ flexShrink: 0 }}
                >
                  Save as PDF
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* The report document itself. */}
          <Card id="report-doc" sx={{ maxWidth: 880, mx: "auto" }}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              {/* Masthead */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ mb: 3 }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                    Progress report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {studentName}
                    {profile?.grade != null ? ` · Grade ${profile.grade}` : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated {generatedOn}
                  </Typography>
                </Box>
                <Logo size={40} />
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {/* Summary figures */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <SummaryFigure label="Current average" value={currentAvg != null ? `${currentAvg}%` : "—"} />
                <SummaryFigure
                  label="Predicted next term"
                  value={predictedAvg != null ? `${predictedAvg}%` : "—"}
                />
                <SummaryFigure
                  label="Overall mastery"
                  value={overallMastery != null ? `${overallMastery}%` : "—"}
                />
                <SummaryFigure label="Marks logged" value={String(graded.length)} />
              </Grid>

              {/* Subject standing */}
              {predictions.length > 0 && (
                <Section title="Subject standing">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell align="right">Current</TableCell>
                        <TableCell align="right">Predicted</TableCell>
                        <TableCell align="right">Confidence</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {predictions.map((p) => (
                        <TableRow key={p.subjectId}>
                          <TableCell>{p.subject}</TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {p.currentTerm}%
                          </TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {p.predictedNextTerm}%
                          </TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {Math.round(p.confidence * 100)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Section>
              )}

              {/* Graded assessments */}
              {graded.length > 0 && (
                <Section title="Graded assessments">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Assessment</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell align="right">Weight</TableCell>
                        <TableCell align="right">Mark</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {graded.slice(0, 20).map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.title}</TableCell>
                          <TableCell>{subjectName(a.subjectId)}</TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {a.weight}%
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}
                          >
                            {a.actualMark}%
                          </TableCell>
                          <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                            {dayjs(a.dueDate).format("DD MMM YY")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Section>
              )}

              {/* Mastery highlights */}
              {topics.length > 0 && (
                <Section title="Mastery highlights">
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="overline" color="success.main">
                        Strongest
                      </Typography>
                      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                        {strongest.map((t) => (
                          <HighlightRow key={`${t.subjectId}-${t.topic}`} label={t.topic} value={`${t.mastery}%`} />
                        ))}
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="overline" color="warning.main">
                        Needs work
                      </Typography>
                      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                        {weakest.map((t) => (
                          <HighlightRow key={`${t.subjectId}-${t.topic}`} label={t.topic} value={`${t.mastery}%`} />
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Section>
              )}

              {/* Wellbeing note */}
              {wellbeing && (wellbeing.moodAvg7d > 0 || wellbeing.checkinStreakDays > 0) && (
                <Section title="Wellbeing">
                  <Typography variant="body2" color="text.secondary">
                    Average mood over the last 7 days is{" "}
                    <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {wellbeing.moodAvg7d.toFixed(1)} out of 5
                    </Box>
                    {wellbeing.checkinStreakDays > 0
                      ? `, with a ${wellbeing.checkinStreakDays}-day check-in streak.`
                      : "."}
                  </Typography>
                </Section>
              )}

              <Divider sx={{ mt: 4, mb: 2 }} />
              <Typography variant="caption" color="text.secondary">
                Generated by Aptiverse. Figures reflect marks and practice logged as of {generatedOn}.
              </Typography>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}

// ── bits ──────────────────────────────────────────────────────────────

function SummaryFigure({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
    </Grid>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function HighlightRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="body2" sx={{ minWidth: 0 }} noWrap>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function EmptyReport() {
  return (
    <Card>
      <CardContent sx={{ py: 8, textAlign: "center" }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
            color: "primary.main",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          }}
        >
          <DescriptionIcon />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Nothing to report yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mb: 3 }}>
          A progress report needs some real marks or practice to summarise. Log a few graded marks,
          then come back to generate one.
        </Typography>
        <Button component={Link} href="/dashboard/assessments" variant="contained" color="secondary">
          Log a mark
        </Button>
      </CardContent>
    </Card>
  );
}
