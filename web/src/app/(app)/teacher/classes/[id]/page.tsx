"use client";

import { use } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { QueryStates } from "@/components/common/QueryStates";
import { useClasses } from "@/lib/api/queries";
import type { ClassRecord } from "@/lib/mockData";
import { useChartSeriesColors } from "@/components/common/chartPalette";

export default function ClassDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const query = useClasses();
  const record = (query.data ?? []).find((x) => x.id === id);

  return (
    <>
      <PageHeader
        title={record?.name ?? "Class"}
        description={
          record ? `Grade ${record.grade} · ${record.studentCount} learners · ${record.subject}` : undefined
        }
        breadcrumbs={[
          { label: "Teacher", href: "/teacher" },
          { label: "Classes", href: "/teacher/classes" },
          { label: record?.name ?? "Class" },
        ]}
        actions={<Button variant="contained">Assign SBA</Button>}
      />

      <QueryStates
        query={query}
        isEmpty={() => !record}
        empty={{
          icon: <GroupsIcon />,
          title: "Class not found",
          description: "This class doesn't exist or isn't assigned to you.",
          action: (
            <Button variant="outlined" href="/teacher/classes">
              Back to classes
            </Button>
          ),
        }}
      >
        {() => (record ? <ClassDetailBody record={record} /> : null)}
      </QueryStates>
    </>
  );
}

function ClassDetailBody({ record: c }: { record: ClassRecord }) {
  const seriesColor = useChartSeriesColors();
  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Average mastery" value={`${c.averageMastery}%`} delta={c.trend} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Top mark" value="92%" hint="—" color="success" />
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
            series={[{ data: [1, 3, 6, 8, 5, 3, 2], label: "Learners", color: seriesColor(0) }]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Topic gaps
          </Typography>
          {c.strugglingTopics.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nothing flagged — this class is broadly on track.
            </Typography>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </>
  );
}
