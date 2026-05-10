"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { BarChart } from "@mui/x-charts/BarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CLASSES } from "@/lib/mockData";

export default function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const c = CLASSES.find((x) => x.id === id);
  if (!c) notFound();

  return (
    <>
      <PageHeader
        title={c.name}
        description={`Grade ${c.grade} · ${c.studentCount} learners · ${c.subject}`}
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Classes", href: "/teacher/classes" }, { label: c.name }]}
        actions={<Button variant="contained">Assign SBA</Button>}
      />
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Average mastery" value={`${c.averageMastery}%`} delta={c.trend} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Top mark" value="92%" hint="Naledi K." color="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="At risk" value={5} hint={`/ ${c.studentCount}`} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Attendance" value="93%" delta={1} color="info" />
        </Grid>
      </Grid>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Mastery distribution
          </Typography>
          <BarChart
            height={280}
            xAxis={[{ data: ["0-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90+"], scaleType: "band" }]}
            series={[{ data: [1, 3, 6, 8, 5, 3, 2], label: "Learners", color: "#0F6963" }]}
            grid={{ horizontal: true }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Topic gaps
          </Typography>
          <Stack spacing={1.5}>
            {c.strugglingTopics.map((t) => (
              <Box key={t}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2">{t}</Typography>
                  <Chip label="64% struggling" size="small" color="warning" />
                </Stack>
                <LinearProgress variant="determinate" value={64} color="warning" />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
