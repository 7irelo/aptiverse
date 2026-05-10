"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { COURSES, SUBJECTS, TUTORS } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";

export default function CoursesPage() {
  const [tab, setTab] = useState<"browse" | "enrolled">("browse");

  return (
    <>
      <PageHeader
        title="Courses"
        description="Specialised courses by top tutors — buy once, learn at your pace."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Courses" }]}
      />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Tab value="browse" label="Browse" />
        <Tab value="enrolled" label="My courses" />
      </Tabs>
      <Grid container spacing={3}>
        {(tab === "browse" ? COURSES : COURSES.slice(0, 2)).map((c) => {
          const subject = SUBJECTS.find((s) => s.id === c.subjectId);
          const tutor = TUTORS.find((t) => t.id === c.tutorId);

          return (
            <Grid key={c.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    height: 140,
                    background: (t) =>
                      `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                    p: 2.5,
                    color: "primary.contrastText",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Chip label={subject?.name} size="small" sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.2)", color: "white", border: 0 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                    {c.title}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="caption" color="text.secondary">
                    by {tutor?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, flex: 1 }}>
                    {c.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={`${c.lessons} lessons`} size="small" />
                    <Chip label={c.duration} size="small" />
                    <Chip label={c.level} size="small" sx={{ textTransform: "capitalize" }} />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {c.enrolled} enrolled · ★ {c.rating}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {formatCurrency(c.price)}
                      </Typography>
                    </Box>
                    <Button variant="contained">{tab === "enrolled" ? "Continue" : "Enrol"}</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
