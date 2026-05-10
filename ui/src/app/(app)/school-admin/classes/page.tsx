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

export default function SchoolClassesPage() {
  return (
    <>
      <PageHeader
        title="Classes"
        description="All classes across grades 11 and 12."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Classes" }]}
        actions={<Button variant="contained">New class</Button>}
      />
      <DataList
        rows={CLASSES}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Class", sortable: true },
          { key: "grade", header: "Grade", sortable: true, align: "right" },
          { key: "studentCount", header: "Learners", sortable: true, align: "right" },
          {
            key: "averageMastery",
            header: "Average mastery",
            sortable: true,
            render: (r) => (
              <Box sx={{ minWidth: 160 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {r.averageMastery}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={r.averageMastery} />
              </Box>
            ),
          },
          { key: "trend", header: "Trend", render: (r) => <Chip label={`${r.trend > 0 ? "+" : ""}${r.trend}pp`} size="small" color={r.trend > 0 ? "success" : "warning"} /> },
        ]}
      />
    </>
  );
}
