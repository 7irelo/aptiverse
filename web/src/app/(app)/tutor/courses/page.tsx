"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { COURSES } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";
import AddIcon from "@mui/icons-material/Add";

export default function TutorCoursesPage() {
  return (
    <>
      <PageHeader
        title="My courses"
        description="Edit existing courses, or publish new ones."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Courses" }]}
        actions={<Button variant="contained" startIcon={<AddIcon />}>New course</Button>}
      />
      <DataList
        rows={COURSES}
        rowKey={(r) => r.id}
        columns={[
          { key: "title", header: "Title", sortable: true, render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography> },
          { key: "level", header: "Level", render: (r) => <Chip label={r.level} size="small" sx={{ textTransform: "capitalize" }} /> },
          { key: "lessons", header: "Lessons", sortable: true, align: "right" },
          { key: "enrolled", header: "Enrolled", sortable: true, align: "right" },
          { key: "rating", header: "Rating", sortable: true, render: (r) => `★ ${r.rating}` },
          { key: "price", header: "Price", sortable: true, align: "right", render: (r) => formatCurrency(r.price) },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined">
              Edit
            </Button>
            <Button size="small" variant="contained">
              Promote
            </Button>
          </Stack>
        )}
      />
    </>
  );
}
