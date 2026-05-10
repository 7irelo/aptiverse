"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { COURSES, TUTORS } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";

export default function AdminCoursesPage() {
  return (
    <PermissionGuard require="courses.read">
      <PageHeader
        title="Courses"
        description="Approve, feature, suspend or refund courses sold on the marketplace."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Courses" }]}
      />
      <DataList
        rows={COURSES}
        rowKey={(r) => r.id}
        columns={[
          { key: "title", header: "Course", sortable: true, render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography> },
          { key: "tutorId", header: "Tutor", render: (r) => TUTORS.find((t) => t.id === r.tutorId)?.name },
          { key: "level", header: "Level", render: (r) => <Chip label={r.level} size="small" sx={{ textTransform: "capitalize" }} /> },
          { key: "enrolled", header: "Enrolled", sortable: true, align: "right" },
          { key: "rating", header: "Rating", sortable: true, render: (r) => `★ ${r.rating}` },
          { key: "price", header: "Price", sortable: true, align: "right", render: (r) => formatCurrency(r.price) },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="contained">
              Approve
            </Button>
            <Button size="small" color="error" variant="outlined">
              Suspend
            </Button>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
