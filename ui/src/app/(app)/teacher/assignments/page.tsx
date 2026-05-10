"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { ASSESSMENTS, SUBJECTS } from "@/lib/mockData";
import { formatDate, formatRelative } from "@/lib/format";
import AddIcon from "@mui/icons-material/Add";
import { StatusChip } from "@/components/common/StatusChip";

export default function TeacherAssignments() {
  return (
    <>
      <PageHeader
        title="Assignments & SBAs"
        description="Create, distribute and track every assessment you set."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Assignments" }]}
        actions={<Button variant="contained" startIcon={<AddIcon />}>New SBA</Button>}
      />

      <DataList
        rows={ASSESSMENTS}
        rowKey={(r) => r.id}
        columns={[
          { key: "title", header: "Title", sortable: true },
          { key: "subjectId", header: "Subject", render: (r) => SUBJECTS.find((s) => s.id === r.subjectId)?.name },
          { key: "type", header: "Type" },
          { key: "weight", header: "Weight", align: "right", render: (r) => `${r.weight}%` },
          { key: "dueDate", header: "Due", render: (r) => `${formatDate(r.dueDate)} (${formatRelative(r.dueDate)})` },
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
    </>
  );
}
