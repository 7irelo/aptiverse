"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";

const STUDENTS = Array.from({ length: 80 }).map((_, i) => ({
  id: `s${i}`,
  name: ["Thabo Mokoena", "Naledi Khumalo", "Sipho Dlamini", "Aisha Mahlangu", "Lerato Pillay", "Mandla Tshabalala", "Khanya Ndlovu", "Tumi Botha"][i % 8] + ` ${i + 1}`,
  grade: 11 + (i % 2),
  class: ["12A", "12B", "11A", "11B"][i % 4],
  aps: 24 + Math.round(Math.random() * 18),
  readiness: ["Ready", "Borderline", "Stretch"][i % 3],
}));

export default function SchoolStudentsPage() {
  return (
    <>
      <PageHeader
        title="All learners"
        description="Search across the whole school."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Learners" }]}
      />

      <DataList
        rows={STUDENTS}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "name",
            header: "Name",
            sortable: true,
            render: (r) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                  {r.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {r.name}
                </Typography>
              </Stack>
            ),
          },
          { key: "grade", header: "Grade", sortable: true, align: "right" },
          { key: "class", header: "Class", sortable: true },
          { key: "aps", header: "APS", sortable: true, align: "right" },
          {
            key: "readiness",
            header: "Readiness",
            render: (r) => (
              <Chip
                label={r.readiness}
                size="small"
                color={r.readiness === "Ready" ? "success" : r.readiness === "Borderline" ? "warning" : "default"}
                variant={r.readiness === "Stretch" ? "outlined" : "filled"}
              />
            ),
          },
        ]}
      />
    </>
  );
}
