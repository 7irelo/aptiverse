"use client";

import { use } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { QueryStates } from "@/components/common/QueryStates";
import { useSubject, useAssessments, usePracticeTests } from "@/lib/api/queries";
import type { Subject, Assessment, PracticeTest } from "@/lib/mockData";
import { DataList } from "@/components/data/DataList";
import { StatusChip } from "@/components/common/StatusChip";
import { formatDate } from "@/lib/format";

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const subjectQuery = useSubject(id);
  const assessmentsQuery = useAssessments();
  const practiceQuery = usePracticeTests();

  return (
    <>
      <PageHeader
        title={subjectQuery.data?.name ?? "Subject"}
        description={
          subjectQuery.data
            ? `Teacher: ${subjectQuery.data.teacher}${subjectQuery.data.paper ? " · " + subjectQuery.data.paper : ""}`
            : undefined
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subjects", href: "/dashboard/subjects" },
          { label: subjectQuery.data?.name ?? "Subject" },
        ]}
        actions={<Button variant="contained">Generate practice</Button>}
      />

      <QueryStates
        query={subjectQuery}
        isEmpty={() => false}
        empty={{
          icon: <SchoolIcon />,
          title: "Subject not found",
          description: "This subject doesn't exist or isn't on your timetable.",
          action: (
            <Button variant="outlined" href="/dashboard/subjects">
              All subjects
            </Button>
          ),
        }}
      >
        {(subject) => (
          <SubjectView
            subject={subject}
            assessments={(assessmentsQuery.data ?? []).filter((a) => a.subjectId === subject.id)}
            practiceTests={(practiceQuery.data ?? []).filter((p) => p.subjectId === subject.id)}
          />
        )}
      </QueryStates>
    </>
  );
}

function SubjectView({
  subject,
  assessments,
  practiceTests,
}: {
  subject: Subject;
  assessments: Assessment[];
  practiceTests: PracticeTest[];
}) {
  const topics = subject.topics ?? [];
  const termAverages = subject.termAverages ?? [];
  const masteryAvg =
    topics.length > 0
      ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
      : 0;

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Current average" value={subject.currentAverage != null ? `${subject.currentAverage}%` : "–"} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Predicted next term" value={subject.predictedNextTerm != null ? `${subject.predictedNextTerm}%` : "–"} hint="Weighted projection" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Upcoming SBAs" value={subject.upcomingSBA ?? 0} hint="this term" color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Mastery" value={`${masteryAvg}%`} hint="across topics" color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Term-over-term performance
              </Typography>
              {termAverages.length > 0 ? (
                <LineChart
                  height={260}
                  xAxis={[{ data: termAverages.map((t) => t.term), scaleType: "point" }]}
                  series={[{ data: termAverages.map((t) => t.mark), label: "Average", color: "#0F6963" }]}
                  margin={{ top: 16, right: 24, bottom: 24, left: 40 }}
                />
              ) : (
                <Box sx={{ py: 6, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Log marks against this subject to see your term-over-term trend.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {assessments.length === 0 ? (
            <Card>
              <CardContent sx={{ py: 6, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No assessments yet for {subject.name}.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <DataList
              title="Assessments"
              description="All scheduled and graded SBAs for this subject"
              rows={assessments}
              rowKey={(r) => r.id}
              columns={[
                { key: "title", header: "Title", sortable: true, render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography> },
                { key: "type", header: "Type", sortable: true },
                { key: "weight", header: "Weight", sortable: true, render: (r) => `${r.weight}%`, align: "right" },
                { key: "dueDate", header: "Due", sortable: true, render: (r) => formatDate(r.dueDate) },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => (
                    <StatusChip
                      kind={r.status === "graded" ? "success" : r.status === "in_progress" ? "info" : r.status === "submitted" ? "primary" : "neutral"}
                      label={r.status.replace("_", " ")}
                      sx={{ textTransform: "capitalize" }}
                    />
                  ),
                },
              ]}
              pageSize={5}
            />
          )}
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Topic mastery
              </Typography>
              <Stack spacing={2}>
                {topics.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Topic mastery fills in as you log assessments for this subject.
                  </Typography>
                ) : null}
                {topics.map((t) => (
                  <Box key={t.name}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{t.name}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t.mastery}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={t.mastery}
                      color={t.mastery >= 70 ? "success" : t.mastery >= 50 ? "primary" : "warning"}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Practice tests ({practiceTests.length})
              </Typography>
              {practiceTests.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No practice tests yet — generate one from your weakest topics.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {practiceTests.slice(0, 5).map((p) => (
                    <Stack
                      key={p.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 1.5 }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {p.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.questionCount} qs · {p.durationMinutes}m
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined">
                        Start
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
