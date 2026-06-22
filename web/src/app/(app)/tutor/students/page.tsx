"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";

const STUDENTS = Array.from({ length: 16 }).map((_, i) => ({
  id: `s${i}`,
  name: ["Thabo Mokoena", "Naledi Khumalo", "Sipho Dlamini", "Aisha Mahlangu", "Lerato Pillay"][i % 5] + ` ${i + 1}`,
  subject: ["Mathematics", "Physical Sciences"][i % 2],
  sessions: i + 2,
  improvement: Math.round(Math.random() * 20),
  active: i < 12,
}));

export default function TutorStudentsPage() {
  return (
    <>
      <PageHeader
        title="My students"
        description="Track outcomes and progress of every learner you tutor."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Students" }]}
      />
      <DataList
        rows={STUDENTS}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "name",
            header: "Student",
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
                    {r.subject}
                  </Typography>
                </Stack>
              </Stack>
            ),
          },
          { key: "sessions", header: "Sessions", sortable: true, align: "right" },
          {
            key: "improvement",
            header: "Improvement",
            sortable: true,
            render: (r) => (
              <Box sx={{ minWidth: 140 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "success.main", mb: 0.25 }}>
                  +{r.improvement}pp
                </Typography>
                <LinearProgress variant="determinate" value={Math.min(100, r.improvement * 5)} color="success" sx={{ height: 6, borderRadius: 999 }} />
              </Box>
            ),
          },
          { key: "active", header: "Status", render: (r) => <Chip label={r.active ? "Active" : "Paused"} size="small" color={r.active ? "success" : "default"} variant={r.active ? "filled" : "outlined"} /> },
        ]}
        rowActions={() => (
          <Button size="small" variant="outlined">
            Open
          </Button>
        )}
      />
    </>
  );
}
