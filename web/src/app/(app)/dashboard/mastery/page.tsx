"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import Link from "next/link";
import { RadarChart } from "@mui/x-charts/RadarChart";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { ChartsReferenceLine } from "@mui/x-charts/ChartsReferenceLine";
import { TrendingUp, Target } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { ProgressRing } from "@/components/common/ProgressRing";
import { GroupedList } from "@/components/common/GroupedList";
import { CardError } from "@/components/common/CardError";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import {
  useAcademicUnits,
  useTopicMastery,
  useTermPredictions,
  type TopicMastery,
  type TermPrediction,
} from "@/lib/api/queries";
import { prettifyUnitId } from "@/lib/format";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";

export default function MasteryPage() {
  const masteryQuery = useTopicMastery();
  const predictionsQuery = useTermPredictions();
  const academic = useAcademicUnits();

  const topics = masteryQuery.data ?? [];
  const predictions = predictionsQuery.data ?? [];

  const loading = masteryQuery.isLoading || predictionsQuery.isLoading;
  const isError = masteryQuery.isError || predictionsQuery.isError;
  const isEmpty = !loading && !isError && topics.length === 0 && predictions.length === 0;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Mastery"
        description="Where you're growing, where you're stuck, and what's coming next term."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mastery" }]}
      />

      {loading ? (
        <MasterySkeleton />
      ) : isError ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <CardError
              onRetry={() => {
                void masteryQuery.refetch();
                void predictionsQuery.refetch();
              }}
              what="your mastery data"
            />
          </CardContent>
        </Card>
      ) : isEmpty ? (
        <EmptyMastery />
      ) : (
        <MasteryView
          topics={topics}
          predictions={predictions}
          unitNoun={academic.unitNoun}
          labelFor={(subjectId) => academic.nameFor(subjectId) ?? prettifyUnitId(subjectId)}
        />
      )}
    </AtmosphericBackdrop>
  );
}

// ── states ────────────────────────────────────────────────────────────

function EmptyMastery() {
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
          No mastery data yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mb: 3 }}>
          Take a few practice tests and log your graded marks. Topic-by-topic mastery and
          predicted next-term marks build from your real answers, not guesses.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" useFlexGap>
          <Button component={Link} href="/dashboard/practice" variant="contained" color="secondary">
            Take a practice test
          </Button>
          <Button component={Link} href="/dashboard/assessments" variant="outlined">
            Log a mark
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function MasterySkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={260} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Skeleton variant="rounded" height={380} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Skeleton variant="rounded" height={380} />
        </Grid>
      </Grid>
    </Stack>
  );
}

// ── helpers ───────────────────────────────────────────────────────────

function band(v: number): { color: "success" | "primary" | "warning"; label: string } {
  if (v >= 80) return { color: "success", label: "Strong" };
  if (v >= 50) return { color: "primary", label: "Building" };
  return { color: "warning", label: "Keep going" };
}

function masteryHex(t: Theme, m: number): string {
  if (m >= 80) return t.palette.success.main;
  if (m >= 50) return t.palette.primary.main;
  return t.palette.warning.main;
}

// ── main view ─────────────────────────────────────────────────────────

function MasteryView({
  topics,
  predictions,
  unitNoun,
  labelFor,
}: {
  topics: TopicMastery[];
  predictions: TermPrediction[];
  unitNoun: string;
  labelFor: (subjectId: string) => string;
}) {
  const theme = useTheme();
  const hasTopics = topics.length > 0;

  const overall = hasTopics
    ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
    : 0;
  const sorted = [...topics].sort((a, b) => a.mastery - b.mastery);
  const weakest = sorted.slice(0, 6);
  const strongest = [...sorted].reverse();
  const improving = topics.filter((t) => t.trend > 0).length;
  const ring = band(overall);

  const bySubject = Object.values(
    topics.reduce<Record<string, { name: string; sum: number; n: number }>>((acc, t) => {
      (acc[t.subjectId] ??= { name: t.subject, sum: 0, n: 0 });
      acc[t.subjectId].sum += t.mastery;
      acc[t.subjectId].n += 1;
      return acc;
    }, {}),
  )
    .map((s) => ({ name: s.name, avg: Math.round(s.sum / s.n) }))
    .sort((a, b) => a.avg - b.avg);
  const showRadar = bySubject.length >= 3;
  const showMomentum = topics.length >= 4;

  return (
    <Stack spacing={3}>
      {/* Hero: overall mastery ring + strongest / focus insights */}
      {hasTopics && (
        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 3, md: 4 }}
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                <ProgressRing
                  value={overall}
                  size={132}
                  thickness={11}
                  color={ring.color}
                  caption={ring.label}
                />
                <Stack spacing={1.25}>
                  <MiniStat value={topics.length} label="topics practised" />
                  <MiniStat
                    value={bySubject.length}
                    label={bySubject.length === 1 ? unitNoun : `${unitNoun}s`}
                  />
                  <MiniStat value={improving} label="improving" tint={theme.palette.success.main} />
                </Stack>
              </Stack>

              <Stack
                spacing={1.5}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  width: { xs: "100%", md: "auto" },
                  pl: { md: 4 },
                  borderLeft: { md: `1px solid ${theme.palette.divider}` },
                }}
              >
                <InsightRow
                  icon={TrendingUp}
                  tint={theme.palette.success.main}
                  label="Strongest"
                  topic={strongest[0]?.topic ?? "None yet"}
                  percent={strongest[0]?.mastery ?? 0}
                />
                {weakest[0] && weakest[0].topic !== strongest[0]?.topic && (
                  <InsightRow
                    icon={Target}
                    tint={theme.palette.warning.main}
                    label="Focus on"
                    topic={weakest[0].topic}
                    percent={weakest[0].mastery}
                  />
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Momentum quadrant + radar side by side */}
      {hasTopics && (
        <Grid container spacing={3}>
          {showMomentum && (
            <Grid size={{ xs: 12, lg: showRadar ? 7 : 12 }}>
              <MomentumCard topics={topics} />
            </Grid>
          )}
          {showRadar && (
            <Grid size={{ xs: 12, lg: showMomentum ? 5 : 12 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" color="text.secondary">
                    Coverage
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Mastery by {unitNoun}
                  </Typography>
                  <Box sx={{ width: "100%", mx: "auto", maxWidth: 480 }}>
                    <RadarChart
                      height={320}
                      hideLegend
                      radar={{
                        max: 100,
                        metrics: bySubject.map((s) => s.name),
                        labelFormatter: (name) =>
                          name.length > 14 ? `${name.slice(0, 13)}…` : name,
                      }}
                      series={[
                        {
                          label: "Mastery",
                          data: bySubject.map((s) => s.avg),
                          fillArea: true,
                          color: theme.palette.secondary.main,
                        },
                      ]}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {/* When there are too few topics for the scatter, still show per-unit rings. */}
          {!showMomentum && !showRadar && (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Mastery by {unitNoun}
                  </Typography>
                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    {bySubject.map((s) => (
                      <ProgressRing
                        key={s.name}
                        value={s.avg}
                        size={104}
                        thickness={9}
                        color={band(s.avg).color}
                        caption={s.name}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Projection: current -> predicted trajectory per subject */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Projection
          </Typography>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Where each {unitNoun} is heading
          </Typography>
          {predictions.length > 0 ? (
            <>
              <ProjectionSlope predictions={predictions} labelFor={labelFor} />
              <Typography variant="caption" color="text.secondary">
                Each line runs from your current term mark to the predicted next-term mark. Rising
                lines mean momentum; predictions strengthen as you log marks and practise.
              </Typography>
            </>
          ) : (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Log a couple of graded marks to see a predicted next-term projection here.
              </Typography>
              <Button component={Link} href="/dashboard/assessments" variant="outlined" size="small">
                Log a mark
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {hasTopics && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="warning.main">
                  Focus next
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Weakest topics
                </Typography>
                <Stack spacing={1.25}>
                  {weakest.map((t) => (
                    <TopicRow key={`${t.subjectId}-${t.topic}`} t={t} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Every topic, by {unitNoun}
                </Typography>
                <GroupedList
                  items={sorted}
                  groupBy={(t) => t.subject}
                  renderItem={(t) => <TopicRow t={t} showSubject={false} />}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

// Mastery (x) vs recent change (y). Four quadrants: top-right is strong &
// rising, bottom-left is weak & slipping (attention). Reference lines at 50%
// and 0-change split the plane.
function MomentumCard({ topics }: { topics: TopicMastery[] }) {
  const theme = useTheme();
  const improving = topics.filter((t) => t.trend > 0);
  const steadyOrDown = topics.filter((t) => t.trend <= 0);
  const trendMax = Math.max(10, ...topics.map((t) => Math.abs(t.trend)));

  // MUI X rejects a series with an empty data array ("numItems 0"), so only
  // include the buckets that actually have topics in them.
  const series = [
    improving.length > 0 && {
      label: "Improving",
      color: theme.palette.success.main,
      markerSize: 5,
      data: improving.map((t, i) => ({ x: t.mastery, y: t.trend, id: `up-${i}` })),
      valueFormatter: (v: { x: number; y: number } | null) => (v ? `${v.x}% · +${v.y}` : ""),
    },
    steadyOrDown.length > 0 && {
      label: "Steady / slipping",
      color: theme.palette.warning.main,
      markerSize: 5,
      data: steadyOrDown.map((t, i) => ({ x: t.mastery, y: t.trend, id: `dn-${i}` })),
      valueFormatter: (v: { x: number; y: number } | null) => (v ? `${v.x}% · ${v.y}` : ""),
    },
  ].filter(Boolean) as {
    label: string;
    color: string;
    markerSize: number;
    data: { x: number; y: number; id: string }[];
    valueFormatter: (v: { x: number; y: number } | null) => string;
  }[];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          Momentum
        </Typography>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          What's rising, what needs attention
        </Typography>
        <ScatterChart
          height={340}
          grid={{ horizontal: true, vertical: true }}
          xAxis={[{ min: 0, max: 100, label: "Mastery %" }]}
          yAxis={[{ min: -trendMax, max: trendMax, label: "Recent change" }]}
          series={series}
        >
          <ChartsReferenceLine
            x={50}
            lineStyle={{ stroke: theme.palette.divider, strokeDasharray: "4 4" }}
          />
          <ChartsReferenceLine
            y={0}
            lineStyle={{ stroke: theme.palette.divider, strokeDasharray: "4 4" }}
          />
        </ScatterChart>
        <Typography variant="caption" color="text.secondary">
          Each dot is a topic: further right is stronger, higher is improving faster. Aim to move
          the lower-left dots up and to the right.
        </Typography>
      </CardContent>
    </Card>
  );
}

function ProjectionSlope({
  predictions,
  labelFor,
}: {
  predictions: TermPrediction[];
  labelFor: (subjectId: string) => string;
}) {
  const theme = useTheme();
  return (
    <LineChart
      height={320}
      xAxis={[{ data: ["Current", "Predicted"], scaleType: "point" }]}
      yAxis={[{ min: 0, max: 100 }]}
      series={predictions.map((p) => {
        const rising = p.predictedNextTerm >= p.currentTerm;
        return {
          label: labelFor(p.subjectId),
          data: [p.currentTerm, p.predictedNextTerm],
          color: rising ? theme.palette.success.main : theme.palette.warning.main,
          curve: "linear" as const,
          showMark: true,
        };
      })}
      margin={{ top: 20, right: 24, bottom: 28, left: 40 }}
      grid={{ horizontal: true }}
      hideLegend={predictions.length > 6}
    />
  );
}

function MiniStat({ value, label, tint }: { value: number; label: string; tint?: string }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography
        sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 22, color: tint }}
      >
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function InsightRow({
  icon: Icon,
  tint,
  label,
  topic,
  percent,
}: {
  icon: typeof TrendingUp;
  tint: string;
  label: string;
  topic: string;
  percent: number;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(tint, 0.14),
          color: tint,
        }}
      >
        <Icon size={18} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}
        >
          {label}
        </Typography>
        <Typography component="div" sx={{ fontWeight: 600, lineHeight: 1.25 }} noWrap>
          {topic} · {percent}%
        </Typography>
      </Box>
    </Stack>
  );
}

// A bar-free topic row: name, trend delta, and a compact colored mastery pill.
function TopicRow({ t, showSubject = true }: { t: TopicMastery; showSubject?: boolean }) {
  const theme = useTheme();
  const hex = masteryHex(theme, t.mastery);
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {t.topic}
        </Typography>
        {showSubject && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {t.subject}
          </Typography>
        )}
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        {t.trend !== 0 && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ color: t.trend > 0 ? "success.main" : "warning.main" }}
          >
            {t.trend > 0 ? (
              <ArrowDropUpIcon fontSize="small" />
            ) : (
              <ArrowDropDownIcon fontSize="small" />
            )}
            <Typography variant="caption" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {Math.abs(t.trend)}
            </Typography>
          </Stack>
        )}
        <Box
          sx={{
            px: 1,
            py: 0.25,
            minWidth: 46,
            textAlign: "center",
            borderRadius: 1,
            fontWeight: 700,
            fontSize: "0.8125rem",
            fontVariantNumeric: "tabular-nums",
            color: hex,
            bgcolor: alpha(hex, 0.14),
          }}
        >
          {t.mastery}%
        </Box>
      </Stack>
    </Stack>
  );
}
