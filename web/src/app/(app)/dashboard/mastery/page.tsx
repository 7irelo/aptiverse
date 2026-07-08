"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { AptiverseBarChart as BarChart } from "@/components/common/AptiverseBarChart";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { GroupedList } from "@/components/common/GroupedList";
import { CardError } from "@/components/common/CardError";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import {
  useSubjects,
  useTopicMastery,
  useTermPredictions,
  type TopicMastery,
  type TermPrediction,
} from "@/lib/api/queries";
import { brand } from "@/theme/palette";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import InsightsIcon from "@mui/icons-material/InsightsOutlined";

export default function MasteryPage() {
  const masteryQuery = useTopicMastery();
  const predictionsQuery = useTermPredictions();
  const subjectsQuery = useSubjects();

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
          codeFor={(subjectId) =>
            subjectsQuery.data?.find((s) => s.id === subjectId)?.code ?? subjectId
          }
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
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
      </Grid>
    </>
  );
}

// ── main view ─────────────────────────────────────────────────────────

function MasteryView({
  topics,
  predictions,
  codeFor,
}: {
  topics: TopicMastery[];
  predictions: TermPrediction[];
  codeFor: (subjectId: string) => string;
}) {
  const hasTopics = topics.length > 0;

  const overall = hasTopics
    ? Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length)
    : null;
  const sorted = [...topics].sort((a, b) => a.mastery - b.mastery);
  const weakest = sorted.slice(0, 6);
  const strongest = [...sorted].reverse().slice(0, 6);

  return (
    <>
      {hasTopics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Overall mastery"
              value={`${overall}%`}
              icon={<TrendingUpIcon />}
              color="primary"
              hint="Across all practised topics"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Strongest topic"
              value={`${strongest[0]?.mastery ?? 0}%`}
              hint={strongest[0]?.topic ?? "None yet"}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              label="Weakest topic"
              value={`${weakest[0]?.mastery ?? 0}%`}
              hint={weakest[0]?.topic ?? "None yet"}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Predicted marks — real, from graded SBAs nudged by practice. */}
        <Grid size={{ xs: 12, lg: hasTopics ? 8 : 12 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                Projection
              </Typography>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                Predicted next-term marks
              </Typography>
              {predictions.length > 0 ? (
                <>
                  <BarChart
                    height={320}
                    xAxis={[
                      { data: predictions.map((p) => codeFor(p.subjectId)), scaleType: "band" },
                    ]}
                    series={[
                      {
                        data: predictions.map((p) => p.currentTerm),
                        label: "Current term",
                        color: brand.teal[600],
                      },
                      {
                        data: predictions.map((p) => p.predictedNextTerm),
                        label: "Predicted next",
                        color: brand.citron[600],
                      },
                    ]}
                    margin={{ top: 24, right: 24, bottom: 32, left: 40 }}
                    grid={{ horizontal: true }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Predictions strengthen as you log more graded marks and take practice tests.
                  </Typography>
                </>
              ) : (
                <Box sx={{ py: 5, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Log a couple of graded marks to see a predicted next-term projection here.
                  </Typography>
                  <Button
                    component={Link}
                    href="/dashboard/assessments"
                    variant="outlined"
                    size="small"
                  >
                    Log a mark
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {hasTopics && (
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="warning.main">
                  Focus next
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Weakest topics
                </Typography>
                <Stack spacing={1.75}>
                  {weakest.map((t) => (
                    <TopicRow key={`${t.subjectId}-${t.topic}`} t={t} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Full per-subject breakdown, grouped into collapsible sections.
            `sorted` is ascending by mastery, so each subject leads with its
            weakest topic. */}
        {hasTopics && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  By subject
                </Typography>
                <GroupedList
                  items={sorted}
                  groupBy={(t) => t.subject}
                  renderItem={(t) => <TopicRow t={t} showSubject={false} />}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </>
  );
}

function masteryColor(m: number): "success" | "primary" | "warning" {
  if (m >= 80) return "success";
  if (m >= 50) return "primary";
  return "warning";
}

function TopicRow({ t, showSubject = true }: { t: TopicMastery; showSubject?: boolean }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 0 }} noWrap>
          {t.topic}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
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
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
              >
                {Math.abs(t.trend)}
              </Typography>
            </Stack>
          )}
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 34, textAlign: "right" }}
          >
            {t.mastery}%
          </Typography>
        </Stack>
      </Stack>
      {showSubject && (
        <Typography variant="caption" color="text.secondary">
          {t.subject}
        </Typography>
      )}
      <LinearProgress
        variant="determinate"
        value={t.mastery}
        color={masteryColor(t.mastery)}
        sx={{ mt: 0.5 }}
        aria-label={`${t.topic}: ${t.mastery}% mastery`}
      />
    </Box>
  );
}
