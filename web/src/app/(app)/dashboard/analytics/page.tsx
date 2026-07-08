"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha, useTheme } from "@mui/material/styles";
import Link from "next/link";
import dayjs from "dayjs";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorderOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { CardError } from "@/components/common/CardError";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { AptiverseLineChart } from "@/components/common/AptiverseLineChart";
import { AptiverseBarChart } from "@/components/common/AptiverseBarChart";
import {
  useTermPredictions,
  useTopicMastery,
  useAssessments,
  useMoodTrend,
  useWellbeingSummary,
  type TermPrediction,
  type TopicMastery,
} from "@/lib/api/queries";
import type { Assessment, MoodPoint } from "@/lib/mockData";

export default function AnalyticsPage() {
  const predictionsQuery = useTermPredictions();
  const masteryQuery = useTopicMastery();
  const assessmentsQuery = useAssessments();
  const moodQuery = useMoodTrend(30);
  const wellbeingQuery = useWellbeingSummary();

  const predictions = predictionsQuery.data ?? [];
  const topics = masteryQuery.data ?? [];
  const assessments = assessmentsQuery.data ?? [];
  const mood = moodQuery.data ?? [];
  const wellbeing = wellbeingQuery.data;

  const loading =
    predictionsQuery.isLoading || masteryQuery.isLoading || assessmentsQuery.isLoading;
  const isError = predictionsQuery.isError || masteryQuery.isError || assessmentsQuery.isError;

  // Graded marks in chronological order — the spine of the marks-over-time view.
  const graded = assessments
    .filter((a) => a.status === "graded" && a.actualMark != null)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));

  const isEmpty =
    !loading &&
    !isError &&
    predictions.length === 0 &&
    topics.length === 0 &&
    graded.length === 0 &&
    mood.length === 0;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Analytics"
        description="Your term at a glance: how your marks, mastery, and wellbeing are trending."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Analytics" }]}
        actions={
          <Button
            component={Link}
            href="/dashboard/reports"
            variant="outlined"
            startIcon={<DescriptionIcon />}
          >
            Generate report
          </Button>
        }
      />

      {loading ? (
        <AnalyticsSkeleton />
      ) : isError ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <CardError
              onRetry={() => {
                void predictionsQuery.refetch();
                void masteryQuery.refetch();
                void assessmentsQuery.refetch();
              }}
              what="your analytics"
            />
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <EmptyAnalytics />
      ) : (
        <AnalyticsView
          predictions={predictions}
          topics={topics}
          graded={graded}
          mood={mood}
          moodAvg7d={wellbeing?.moodAvg7d ?? 0}
        />
      )}
    </AtmosphericBackdrop>
  );
}

// ── main view ─────────────────────────────────────────────────────────

function AnalyticsView({
  predictions,
  topics,
  graded,
  mood,
  moodAvg7d,
}: {
  predictions: TermPrediction[];
  topics: TopicMastery[];
  graded: Assessment[];
  mood: MoodPoint[];
  moodAvg7d: number;
}) {
  const theme = useTheme();

  const predictedAvg =
    predictions.length > 0
      ? Math.round(predictions.reduce((s, p) => s + p.predictedNextTerm, 0) / predictions.length)
      : null;
  const currentAvg =
    predictions.length > 0
      ? Math.round(predictions.reduce((s, p) => s + p.currentTerm, 0) / predictions.length)
      : null;
  const predictedDelta =
    predictedAvg != null && currentAvg != null ? predictedAvg - currentAvg : undefined;

  const overallMastery =
    topics.length > 0
      ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
      : null;

  // Mastery band distribution — a genuinely different cut from the topic list.
  const bands = [
    { label: "Needs work", count: topics.filter((t) => t.mastery < 50).length },
    { label: "Developing", count: topics.filter((t) => t.mastery >= 50 && t.mastery < 80).length },
    { label: "Strong", count: topics.filter((t) => t.mastery >= 80).length },
  ];

  return (
    <>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Predicted average"
            value={predictedAvg != null ? `${predictedAvg}%` : "—"}
            delta={predictedDelta}
            deltaLabel="vs current"
            icon={<TrendingUpIcon />}
            color="primary"
            hint={predictedAvg == null ? "Log marks to project" : undefined}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Overall mastery"
            value={overallMastery != null ? `${overallMastery}%` : "—"}
            icon={<InsightsIcon />}
            color="primary"
            hint={overallMastery != null ? "Across practised topics" : "Practise to build this"}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Marks logged"
            value={graded.length}
            icon={<FactCheckIcon />}
            color="primary"
            hint="Graded this term"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="7-day mood"
            value={moodAvg7d > 0 ? `${moodAvg7d.toFixed(1)}/5` : "—"}
            icon={<FavoriteBorderIcon />}
            color="secondary"
            hint={moodAvg7d > 0 ? "Wellbeing check-ins" : "Log a mood to track"}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Marks over time — the time-series Home and Mastery don't show. */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="overline" color="text.secondary">
                Trajectory
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Marks over time
              </Typography>
              {graded.length >= 2 ? (
                <AptiverseLineChart
                  height={300}
                  xAxis={[
                    {
                      data: graded.map((g) => dayjs(g.dueDate).format("DD MMM")),
                      scaleType: "point",
                    },
                  ]}
                  yAxis={[{ min: 0, max: 100 }]}
                  series={[
                    {
                      data: graded.map((g) => g.actualMark ?? 0),
                      label: "Mark",
                      area: true,
                      color: theme.palette.primary.main,
                    },
                  ]}
                  margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
                />
              ) : (
                <SectionEmpty
                  text="Log at least two graded marks to see your term trajectory."
                  href="/dashboard/assessments"
                  cta="Log a mark"
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mastery distribution. */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="overline" color="text.secondary">
                Spread
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Topics by mastery
              </Typography>
              {topics.length > 0 ? (
                <AptiverseBarChart
                  height={300}
                  xAxis={[{ data: bands.map((b) => b.label), scaleType: "band" }]}
                  yAxis={[{ min: 0 }]}
                  series={[{ data: bands.map((b) => b.count), label: "Topics" }]}
                  margin={{ top: 16, right: 8, bottom: 28, left: 28 }}
                />
              ) : (
                <SectionEmpty
                  text="Take practice tests to map your topics by mastery."
                  href="/dashboard/practice"
                  cta="Practise"
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Wellbeing trend — the platform's distinctive academics-plus-wellbeing cut. */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="overline" color="text.secondary">
                Wellbeing
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mood, last 30 days
              </Typography>
              {mood.length >= 2 ? (
                <AptiverseLineChart
                  height={260}
                  xAxis={[
                    { data: mood.map((m) => dayjs(m.date).format("DD MMM")), scaleType: "point" },
                  ]}
                  yAxis={[{ min: 1, max: 5 }]}
                  series={[
                    {
                      data: mood.map((m) => m.mood),
                      label: "Mood",
                      area: true,
                      color: theme.palette.wellbeing.main,
                    },
                  ]}
                  margin={{ top: 16, right: 16, bottom: 28, left: 28 }}
                />
              ) : (
                <SectionEmpty
                  text="A daily mood check-in builds a picture of how the term is treating you."
                  href="/dashboard/wellbeing"
                  cta="Log today's mood"
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Per-subject standing. */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="overline" color="text.secondary">
                By subject
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Where each subject stands
              </Typography>
              {predictions.length > 0 ? (
                <Stack spacing={1.75}>
                  {[...predictions]
                    .sort((a, b) => a.currentTerm - b.currentTerm)
                    .map((p) => (
                      <SubjectStanding key={p.subjectId} p={p} />
                    ))}
                </Stack>
              ) : (
                <SectionEmpty
                  text="Log graded marks to see each subject's standing."
                  href="/dashboard/assessments"
                  cta="Log a mark"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

function SubjectStanding({ p }: { p: TermPrediction }) {
  const up = p.predictedNextTerm >= p.currentTerm;
  const band: "success" | "primary" | "warning" =
    p.currentTerm >= 70 ? "success" : p.currentTerm >= 50 ? "primary" : "warning";
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
          {p.subject}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {p.currentTerm}%
          </Typography>
          <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: up ? "success.main" : "warning.main",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {p.predictedNextTerm}%
          </Typography>
        </Stack>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={p.currentTerm}
        color={band}
        sx={{ mt: 0.5 }}
        aria-label={`${p.subject}: ${p.currentTerm}% current, ${p.predictedNextTerm}% predicted`}
      />
    </Box>
  );
}

// ── shared bits ───────────────────────────────────────────────────────

function SectionEmpty({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <Box sx={{ py: 4, textAlign: "center" }}>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: "auto", mb: 2 }}>
        {text}
      </Typography>
      <Button component={Link} href={href} variant="outlined" size="small">
        {cta}
      </Button>
    </Box>
  );
}

function EmptyAnalytics() {
  return (
    <Card>
      <CardContent sx={{ py: 8, textAlign: "center" }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2,
            color: "primary.main",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          }}
        >
          <InsightsIcon />
        </Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Nothing to chart yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mb: 3 }}>
          Log graded marks, take practice tests, and check in on your mood. Your trends build from
          real activity, not placeholders.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Button component={Link} href="/dashboard/assessments" variant="contained" color="secondary">
            Log a mark
          </Button>
          <Button component={Link} href="/dashboard/practice" variant="outlined">
            Take a practice test
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 6, md: 3 }}>
            <Skeleton variant="rounded" height={116} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={372} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={372} />
        </Grid>
      </Grid>
    </>
  );
}
