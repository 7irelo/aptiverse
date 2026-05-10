"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { CLASSES } from "@/lib/mockData";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";

export default function TeacherClasses() {
  return (
    <>
      <PageHeader
        title="My classes"
        description="Class lists, mastery, and gap topics — drill into any class to see student detail."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Classes" }]}
        actions={<Button variant="contained" startIcon={<AddIcon />}>New class</Button>}
      />

      <DataList
        rows={CLASSES}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Class", sortable: true, render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.name}</Typography> },
          { key: "grade", header: "Grade", sortable: true, align: "right" },
          { key: "studentCount", header: "Students", sortable: true, align: "right" },
          {
            key: "averageMastery",
            header: "Mastery",
            sortable: true,
            render: (r) => (
              <Box sx={{ minWidth: 160 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LinearProgress variant="determinate" value={r.averageMastery} sx={{ flex: 1, height: 6, borderRadius: 999 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.averageMastery}%
                  </Typography>
                </Stack>
              </Box>
            ),
          },
          { key: "trend", header: "Trend", render: (r) => <Chip label={`${r.trend > 0 ? "+" : ""}${r.trend}pp`} size="small" color={r.trend > 0 ? "success" : "warning"} /> },
          {
            key: "strugglingTopics",
            header: "Gap topics",
            render: (r) => (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {r.strugglingTopics.map((t) => (
                  <Chip key={t} label={t} size="small" variant="outlined" color="warning" />
                ))}
              </Stack>
            ),
          },
        ]}
        rowActions={(r) => (
          <Button component={Link} href={`/teacher/classes/${r.id}`} size="small" variant="outlined">
            Open
          </Button>
        )}
      />
    </>
  );
}
