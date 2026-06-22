"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { useAssessments, useSubjects } from "@/lib/api/queries";
import {
  ASSESSMENT_TYPE_LABELS,
  ASSESSMENT_STATUS_LABELS,
  type Assessment,
  type Subject,
} from "@/lib/mockData";
import { formatDate } from "@/lib/format";
import { RelativeTime } from "@/components/common/RelativeTime";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import dayjs from "dayjs";
import Link from "next/link";

export default function AssessmentsPage() {
  const assessmentsQuery = useAssessments();
  const subjectsQuery = useSubjects();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Assessments"
        description="Every SBA, test, project and exam. Schedule, weighting, and predicted vs actual marks."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Assessments" }]}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} component={Link} href="/dashboard/assessments/new">
            Add SBA
          </Button>
        }
      />

      <QueryStates
        query={assessmentsQuery}
        empty={{
          icon: <AssignmentIcon />,
          title: "No assessments yet",
          description: "Add an SBA, test, or project so we can plan the lead-up and predict your mark.",
          action: (
            <Button variant="contained" startIcon={<AddIcon />} component={Link} href="/dashboard/assessments/new">
              Add an SBA
            </Button>
          ),
        }}
      >
        {(assessments) => <AssessmentsList assessments={assessments} subjects={subjectsQuery.data ?? []} />}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

function AssessmentsList({ assessments, subjects }: { assessments: Assessment[]; subjects: Subject[] }) {
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = assessments.filter(
    (a) =>
      (subjectFilter === "all" || a.subjectId === subjectFilter) &&
      (statusFilter === "all" || a.status === statusFilter),
  );

  return (
    <DataList
      rows={filtered}
      rowKey={(r) => r.id}
      searchPlaceholder="Search assessments…"
      filters={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField select size="small" label="Subject" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All subjects</MenuItem>
            {subjects.map((s) => (
              <MenuItem key={s.subjectId} value={s.subjectId}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="all">All statuses</MenuItem>
            {(Object.entries(ASSESSMENT_STATUS_LABELS) as [keyof typeof ASSESSMENT_STATUS_LABELS, string][]).map(([k, v]) => (
              <MenuItem key={k} value={k}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      }
      columns={[
        {
          key: "title",
          header: "Title",
          sortable: true,
          render: (r) => (
            <Stack>
              <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {subjects.find((s) => s.subjectId === r.subjectId)?.name}
              </Typography>
            </Stack>
          ),
        },
        { key: "type", header: "Type", sortable: true, render: (r) => ASSESSMENT_TYPE_LABELS[r.type] ?? r.type },
        {
          key: "weight",
          header: "Weight",
          sortable: true,
          align: "right",
          sortValue: (r) => r.weight,
          render: (r) => `${r.weight}%`,
        },
        {
          key: "dueDate",
          header: "Due",
          sortable: true,
          sortValue: (r) => +new Date(r.dueDate),
          render: (r) => (
            <Stack>
              <Typography variant="body2">{formatDate(r.dueDate)}</Typography>
              <Typography variant="caption" color={dayjs(r.dueDate).diff(dayjs(), "day") < 7 ? "warning.main" : "text.secondary"}>
                <RelativeTime iso={r.dueDate} />
              </Typography>
            </Stack>
          ),
        },
        {
          key: "predictedMark",
          header: "Prediction",
          render: (r) =>
            r.predictedMark != null ? (
              <Stack sx={{ minWidth: 120 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.predictedMark}%
                </Typography>
                <LinearProgress variant="determinate" value={r.predictedMark} sx={{ height: 6, borderRadius: 999, mt: 0.5 }} color="primary" />
              </Stack>
            ) : (
              "–"
            ),
        },
        {
          key: "actualMark",
          header: "Mark",
          render: (r) => (r.actualMark != null ? `${r.actualMark}%` : "–"),
        },
        {
          key: "status",
          header: "Status",
          render: (r) => (
            <StatusChip
              kind={r.status === "graded" ? "success" : r.status === "in_progress" ? "info" : r.status === "submitted" ? "primary" : "neutral"}
              label={ASSESSMENT_STATUS_LABELS[r.status] ?? r.status}
            />
          ),
        },
      ]}
      rowActions={(r) => (
        <Button component={Link} href={`/dashboard/assessments/${r.id}`} size="small" variant="outlined">
          Open
        </Button>
      )}
    />
  );
}
