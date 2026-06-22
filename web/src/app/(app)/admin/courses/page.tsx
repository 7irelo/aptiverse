"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { useCourses, useTutors } from "@/lib/api/queries";
import type { Course, Tutor } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";

export default function AdminCoursesPage() {
  const coursesQuery = useCourses();
  const tutorsQuery = useTutors();

  return (
    <PermissionGuard require="courses.read">
      <PageHeader
        title="Courses"
        description="Approve, feature, suspend or refund courses sold on the marketplace."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Courses" }]}
      />

      <QueryStates
        query={coursesQuery}
        empty={{
          icon: <StorefrontIcon />,
          title: "No courses on the marketplace yet",
          description: "Courses appear here as tutors submit them for review.",
        }}
      >
        {(courses) => <CoursesTable courses={courses} tutors={tutorsQuery.data ?? []} />}
      </QueryStates>
    </PermissionGuard>
  );
}

function CoursesTable({ courses, tutors }: { courses: Course[]; tutors: Tutor[] }) {
  return (
    <DataList
      rows={courses}
      rowKey={(r) => r.id}
      columns={[
        { key: "title", header: "Course", sortable: true, render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.title}</Typography> },
        { key: "tutorId", header: "Tutor", render: (r) => tutors.find((t) => t.id === r.tutorId)?.name ?? "—" },
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
  );
}
