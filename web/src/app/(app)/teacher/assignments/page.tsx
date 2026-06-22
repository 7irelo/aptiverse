"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { QueryStates } from "@/components/common/QueryStates";
import { StatusChip } from "@/components/common/StatusChip";
import { useAssessments, useSubjects } from "@/lib/api/queries";
import type { Assessment, Subject } from "@/lib/mockData";
import { formatDate } from "@/lib/format";

export default function TeacherAssignments() {
  const assessmentsQuery = useAssessments();
  const subjectsQuery = useSubjects();

  return (
    <>
      <PageHeader
        title="Assignments & SBAs"
        description="Create, distribute and track every assessment you set."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Assignments" }]}
        actions={<Button variant="contained" startIcon={<AddIcon />}>New SBA</Button>}
      />

      <QueryStates
        query={assessmentsQuery}
        empty={{
          icon: <AssignmentIcon />,
          title: "No SBAs yet",
          description: "Create your first assessment — task list, rubric and weighting all in one place.",
          action: (
            <Button variant="contained" startIcon={<AddIcon />}>
              New SBA
            </Button>
          ),
        }}
      >
        {(assessments) => <AssignmentsTable assessments={assessments} subjects={subjectsQuery.data ?? []} />}
      </QueryStates>
    </>
  );
}

function AssignmentsTable({ assessments, subjects }: { assessments: Assessment[]; subjects: Subject[] }) {
  return (
    <DataList
      rows={assessments}
      rowKey={(r) => r.id}
      columns={[
        { key: "title", header: "Title", sortable: true },
        { key: "subjectId", header: "Subject", render: (r) => subjects.find((s) => s.id === r.subjectId)?.name ?? "—" },
        { key: "type", header: "Type" },
        { key: "weight", header: "Weight", align: "right", render: (r) => `${r.weight}%` },
        { key: "dueDate", header: "Due", render: (r) => formatDate(r.dueDate) },
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
      rowActions={() => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined">
            Open
          </Button>
          <Button size="small">Mark</Button>
        </Stack>
      )}
    />
  );
}
