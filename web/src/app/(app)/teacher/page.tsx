"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { QueryStates } from "@/components/common/QueryStates";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { useClasses } from "@/lib/api/queries";
import type { ClassRecord } from "@/lib/mockData";
import Link from "next/link";
import { useChartSeriesColors } from "@/components/common/chartPalette";

export default function TeacherDashboard() {
  const query = useClasses();

  return (
    <>
      <PageHeader
        title="Teacher dashboard"
        description="A class-wide view of who's growing, who's stuck, and what to teach next."
        breadcrumbs={[{ label: "Home" }]}
        actions={
          <>
            <Button component={Link} href="/teacher/assignments" variant="outlined">
              Assignments
            </Button>
            <Button component={Link} href="/teacher/differentiator" variant="contained">
              Create differentiated SBA
            </Button>
          </>
        }
      />

      <QueryStates
        query={query}
        empty={{
          icon: <GroupsIcon />,
          title: "No classes assigned yet",
          description: "Once your school admin assigns you to a class, this dashboard will fill in automatically.",
        }}
      >
        {(classes) => <TeacherOverview classes={classes} />}
      </QueryStates>
    </>
  );
}

function TeacherOverview({ classes }: { classes: ClassRecord[] }) {
  const seriesColor = useChartSeriesColors();
  const totalStudents = classes.reduce((s, c) => s + c.studentCount, 0);

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Classes" value={classes.length} icon={<GroupsIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Students" value={totalStudents} icon={<SchoolIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="SBAs to mark" value={12} icon={<AssignmentIcon />} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Goal verifications" value={4} hint="awaiting" icon={<VerifiedIcon />} color="secondary" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Class average mastery</Typography>
                <Button size="small" component={Link} href="/teacher/analytics">
                  Full analytics
                </Button>
              </Stack>
              <BarChart
                height={300}
                xAxis={[{ data: classes.map((c) => c.name), scaleType: "band" }]}
                yAxis={[{ min: 0, max: 100 }]}
                series={[{ data: classes.map((c) => c.averageMastery), label: "Average mastery", color: seriesColor(0) }]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your classes
              </Typography>
              <Stack spacing={2}>
                {classes.map((c) => (
                  <ClassRow key={c.id} record={c} />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <LiveActivityFeed
            title="Live class activity"
            description="Who's working, who's stuck, in real time"
            height={680}
          />
        </Grid>
      </Grid>
    </>
  );
}

function ClassRow({ record: c }: { record: ClassRecord }) {
  return (
    <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: "divider" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {c.name}
            </Typography>
            <Chip label={`${c.studentCount} learners`} size="small" />
            <Chip
              icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
              label={`+${c.trend}pp`}
              size="small"
              color="success"
              variant="outlined"
            />
          </Stack>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {c.strugglingTopics.map((t) => (
              <Chip key={t} label={t} size="small" color="warning" variant="outlined" />
            ))}
          </Stack>
        </Box>
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Average mastery
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <LinearProgress variant="determinate" value={c.averageMastery} sx={{ flex: 1, height: 8, borderRadius: 999 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {c.averageMastery}%
            </Typography>
          </Stack>
        </Box>
        <Button component={Link} href={`/teacher/classes/${c.id}`} variant="outlined" size="small">
          Open class
        </Button>
      </Stack>
    </Box>
  );
}
