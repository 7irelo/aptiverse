"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { LineChart } from "@mui/x-charts/LineChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { SUBJECTS, ASSESSMENTS, PRACTICE_TESTS } from "@/lib/mockData";
import { DataList } from "@/components/data/DataList";
import { StatusChip } from "@/components/common/StatusChip";
import { formatDate } from "@/lib/format";

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) notFound();

  const subjectAssessments = ASSESSMENTS.filter((a) => a.subjectId === subject.id);
  const subjectPractice = PRACTICE_TESTS.filter((p) => p.subjectId === subject.id);

  return (
    <>
      <PageHeader
        title={subject.name}
        description={`Teacher: ${subject.teacher}${subject.paper ? " · " + subject.paper : ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subjects", href: "/dashboard/subjects" },
          { label: subject.name },
        ]}
        actions={<Button variant="contained">Generate practice</Button>}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Current average" value={`${subject.currentAverage}%`} delta={3} deltaLabel="vs last term" color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Predicted next term" value={`${subject.predictedNextTerm}%`} hint="AI forecast" color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Upcoming SBAs" value={subject.upcomingSBA} hint="this term" color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Mastery" value={`${Math.round(subject.topics.reduce((s, t) => s + t.mastery, 0) / subject.topics.length)}%`} hint="across topics" color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Term-over-term performance
              </Typography>
              <LineChart
                height={260}
                xAxis={[{ data: subject.termAverages.map((t) => t.term), scaleType: "point" }]}
                series={[{ data: subject.termAverages.map((t) => t.mark), label: "Average", curve: "monotoneX", color: "#0F6963" }]}
                grid={{ horizontal: true }}
                margin={{ top: 16, right: 24, bottom: 24, left: 40 }}
              />
            </CardContent>
          </Card>

          <DataList
            title="Assessments"
            description="All scheduled and graded SBAs for this subject"
            rows={subjectAssessments}
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
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Topic mastery
              </Typography>
              <Stack spacing={2}>
                {subject.topics.map((t) => (
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
                Practice tests ({subjectPractice.length})
              </Typography>
              <Stack spacing={1.25}>
                {subjectPractice.slice(0, 5).map((p) => (
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
