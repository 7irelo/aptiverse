"use client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import Link from "next/link";
import dayjs from "dayjs";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentIcon from "@mui/icons-material/AssignmentOutlined";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/common/StatCard";
import { ProgressRing } from "@/components/common/ProgressRing";
import { StatusChip } from "@/components/common/StatusChip";
import { ASSESSMENTS, GOALS, SUBJECTS, NOTIFICATIONS, APS_SCORE } from "@/lib/mockData";
import { formatRelative } from "@/lib/format";

export default function StudentDashboardPage() {
  const upcoming = ASSESSMENTS.filter((a) => a.status !== "graded")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 4);
  const activeGoals = GOALS.filter((g) => g.status === "active" || g.status === "at_risk").slice(0, 3);

  return (
    <>
      <WelcomeBanner />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Predicted average" value="71%" delta={4} deltaLabel="vs last term" icon={<SchoolIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Active goals" value={activeGoals.length} hint="2 close to milestone" icon={<FlagIcon />} color="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="APS (live)" value={APS_SCORE} delta={2} deltaLabel="this term" icon={<QuizIcon />} color="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard label="Wellbeing" value="3.8 / 5" hint="Steady" icon={<FavoriteIcon />} color="success" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Mastery trend</Typography>
                    <Typography variant="body2" color="text.secondary">
                      How you're growing across your subjects this year
                    </Typography>
                  </Box>
                  <Button component={Link} href="/dashboard/mastery" endIcon={<ArrowForwardIcon />} size="small">
                    Details
                  </Button>
                </Stack>
                <LineChart
                  height={300}
                  xAxis={[{ data: ["T1", "T2", "T3", "T4"], scaleType: "point" }]}
                  series={SUBJECTS.slice(0, 5).map((s) => ({
                    data: s.termAverages.map((t) => t.mark),
                    label: s.name,
                    curve: "monotoneX",
                  }))}
                  margin={{ top: 16, right: 24, bottom: 32, left: 40 }}
                  grid={{ horizontal: true }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Upcoming assessments</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sorted by due date — predicted marks updated daily
                    </Typography>
                  </Box>
                  <Button component={Link} href="/dashboard/assessments" endIcon={<ArrowForwardIcon />} size="small">
                    All assessments
                  </Button>
                </Stack>
                <Stack spacing={1.5}>
                  {upcoming.map((a) => {
                    const subject = SUBJECTS.find((s) => s.id === a.subjectId);
                    const daysLeft = dayjs(a.dueDate).diff(dayjs(), "day");
                    const urgent = daysLeft <= 3;
                    return (
                      <Box
                        key={a.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: 1,
                          borderColor: "divider",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "action.hover",
                            color: "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          <AssignmentIcon />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {a.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {subject?.name} · {a.type} · weighting {a.weight}%
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                          <Typography variant="caption" color="text.secondary">
                            Predicted
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main" }}>
                            {a.predictedMark ?? "—"}%
                          </Typography>
                        </Box>
                        <Chip
                          label={urgent ? `${daysLeft}d left` : `Due ${dayjs(a.dueDate).format("DD MMM")}`}
                          size="small"
                          color={urgent ? "warning" : "default"}
                          variant={urgent ? "filled" : "outlined"}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Today's focus
                </Typography>
                <Stack alignItems="center" spacing={1.5}>
                  <ProgressRing value={62} size={140} thickness={10} caption="of daily target" />
                  <Typography variant="caption" color="text.secondary">
                    Aim for 60 minutes of focused study today
                  </Typography>
                  <Button fullWidth component={Link} href="/dashboard/workspace" variant="contained">
                    Start focus session
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6">Active goals</Typography>
                  <IconButton size="small" component={Link} href="/dashboard/goals">
                    <ArrowForwardIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack spacing={2}>
                  {activeGoals.map((g) => (
                    <Box key={g.id}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {g.title}
                        </Typography>
                        <StatusChip
                          kind={g.status === "at_risk" ? "warning" : "primary"}
                          label={`${g.progress}%`}
                        />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={g.progress}
                        color={g.status === "at_risk" ? "warning" : "primary"}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6">Mood this week</Typography>
                  <Button size="small" component={Link} href="/dashboard/wellbeing">
                    Check in
                  </Button>
                </Stack>
                <BarChart
                  height={140}
                  xAxis={[{ data: ["M", "T", "W", "T", "F", "S", "S"], scaleType: "band" }]}
                  yAxis={[{ min: 0, max: 5 }]}
                  series={[{ data: [4, 3, 2, 3, 4, 5, 4], color: "#F25C2E" }]}
                  margin={{ top: 0, right: 8, bottom: 24, left: 24 }}
                  grid={{ horizontal: true }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Recent
                </Typography>
                <Stack spacing={1.5}>
                  {NOTIFICATIONS.slice(0, 3).map((n) => (
                    <Stack key={n.id} direction="row" spacing={1.5} alignItems="flex-start">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor:
                            n.kind === "celebration"
                              ? "secondary.main"
                              : n.kind === "alert"
                                ? "warning.main"
                                : "primary.main",
                          color: "#fff",
                          fontSize: "0.75rem",
                        }}
                      >
                        {n.kind === "celebration" ? "🎉" : n.kind === "alert" ? "!" : "i"}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
                          {n.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelative(n.time)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
