"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";

const STUDENTS = Array.from({ length: 24 }).map((_, i) => ({
  id: `s${i}`,
  name: ["Thabo Mokoena", "Naledi Khumalo", "Sipho Dlamini", "Aisha Mahlangu", "Lerato Pillay", "Mandla Tshabalala", "Khanya Ndlovu", "Tumi Botha"][i % 8] + ` (${i + 1})`,
  className: ["12A Maths", "12B PhSci", "11A English", "12A LSci"][i % 4],
  predictedMark: 50 + Math.round(Math.random() * 35),
  attendance: 85 + Math.round(Math.random() * 14),
  needsAttention: Math.random() > 0.7,
}));

export default function TeacherStudents() {
  return (
    <>
      <PageHeader
        title="Students"
        description="All students across your classes."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Students" }]}
      />

      <DataList
        rows={STUDENTS}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "name",
            header: "Student",
            sortable: true,
            render: (r) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                  {r.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </Avatar>
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {r.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.className}
                  </Typography>
                </Stack>
              </Stack>
            ),
          },
          { key: "className", header: "Class", sortable: true },
          {
            key: "predictedMark",
            header: "Predicted mark",
            sortable: true,
            render: (r) => (
              <Box sx={{ minWidth: 140 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.predictedMark}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={r.predictedMark} sx={{ mt: 0.25 }} />
              </Box>
            ),
          },
          { key: "attendance", header: "Attendance", sortable: true, render: (r) => `${r.attendance}%` },
          { key: "needsAttention", header: "Status", render: (r) => (r.needsAttention ? <Chip label="Needs check-in" size="small" color="warning" /> : <Chip label="On track" size="small" color="success" variant="outlined" />) },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined">
              Profile
            </Button>
            <Button size="small">Message</Button>
          </Stack>
        )}
      />
    </>
  );
}
