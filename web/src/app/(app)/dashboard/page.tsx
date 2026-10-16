"use client";

import { useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import { alpha, useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { motion } from "framer-motion";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { CardError } from "@/components/common/CardError";
import { LastSynced } from "@/components/common/LastSynced";
import { SectionHeader } from "@/components/common/SectionHeader";
import {
  useAcademicUnits,
  useAssessments,
  useGoals,
  useTermPredictions,
  useTopicMastery,
  useWellbeingSummary,
  useMoodTrend,
  useAcademicProfile,
  useCurricula,
  useInstitutions,
  useMyEntitlements,
  useLiveActivity,
  type TermPrediction,
  type TopicMastery,
  type LiveActivity,
} from "@/lib/api/queries";
import { type Goal, type MoodPoint } from "@/lib/mockData";
import { prettifyUnitId } from "@/lib/format";
import { enter } from "@/lib/motion";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Heart,
  Flag,
  NotebookPen,
} from "lucide-react";

dayjs.extend(relativeTime);

// Hidden hello for the student (or curious dev) who hits F12. Fires once
// per session, never on subsequent mounts. Aptiverse-specific, no tech
// reveal, graphite brand colour.
let easterEggFired = false;
function devtoolsHello() {
  if (easterEggFired || typeof window === "undefined") return;
  easterEggFired = true;
  // eslint-disable-next-line no-console
  console.log(
    "%cAptiverse%c · built for the study stretch · hello@aptiverse.app",
    "font: 700 16px sans-serif; color: #1B1D22; letter-spacing: -0.02em;",
    "color: #5F5E58; font-size: 12px;",
  );
}

export default function StudentDashboardPage() {
  useEffect(devtoolsHello, []);

  const academic = useAcademicUnits();
  const assessmentsQuery = useAssessments();
  const goalsQuery = useGoals();
  const predictionsQuery = useTermPredictions();
  const masteryQuery = useTopicMastery();

  const assessments = assessmentsQuery.data ?? [];
  const goals = goalsQuery.data ?? [];

  // Resolves an assessment's study unit to a name for both audiences: a
  // high-schooler's Subject and a university student's Course share the slug
  // that Assessment.subjectId stores.
  //
  // What was here compared Subject.id (the enrolment row id, "42") against
  // Assessment.subjectId (the slug, "math"), so it never matched and every
  // assessment on the home page read "Unlinked" for everyone. Tertiary
  // students had it worse: useSubjects() only returns high-school subjects, so
  // there was nothing to match against in the first place.
  //
  // "Unlinked" is still right for an assessment with no subjectId at all, which
  // is a real state. It was only ever wrong as the answer to "we have an id and
  // couldn't resolve it".
  const unitNameFor = (id: string | undefined) =>
    id ? (academic.nameFor(id) ?? prettifyUnitId(id)) : "Unlinked";

  const upcoming = assessments
    .filter((a) => a.status !== "graded")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, 4);
  const activeGoals = goals
    .filter((g) => g.status === "active" || g.status === "at_risk")
    .slice(0, 3);

  return (
    <AtmosphericBackdrop>
      <WelcomeBanner />

      <QuickActionsRail />

      <UpcomingAssessmentsCard
        upcoming={upcoming}
        nameFor={unitNameFor}
        loading={assessmentsQuery.isLoading}
        isError={assessmentsQuery.isError}
        onRetry={() => assessmentsQuery.refetch()}
        isEmpty={!assessmentsQuery.isLoading && upcoming.length === 0}
        dataUpdatedAt={assessmentsQuery.dataUpdatedAt}
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <AcademicStandingCard
            predictions={predictionsQuery.data ?? []}
            nameFor={unitNameFor}
            weakTopics={masteryQuery.data ?? []}
            loading={predictionsQuery.isLoading || masteryQuery.isLoading}
            isError={predictionsQuery.isError}
            onRetry={() => predictionsQuery.refetch()}
            dataUpdatedAt={predictionsQuery.dataUpdatedAt}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ActiveGoalsCard
            goals={activeGoals}
            loading={goalsQuery.isLoading}
            isError={goalsQuery.isError}
            onRetry={() => goalsQuery.refetch()}
            isEmpty={!goalsQuery.isLoading && activeGoals.length === 0}
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 2, md: 3 } }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <WellbeingSnapshotCard />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RecentActivityCard />
        </Grid>
      </Grid>
    </AtmosphericBackdrop>
  );
}

// ─── Context + quick actions rail ─────────────────────────────────────
// Orients (grade · curriculum · plan) and offers the three actions a
// student most often wants from a cold open: log a mood, set a goal, run
// a practice test. Chips only render when they have real data.

function QuickActionsRail() {
  const profileQuery = useAcademicProfile();
  const curriculaQuery = useCurricula();
  const institutionsQuery = useInstitutions();
  const entitlementsQuery = useMyEntitlements();

  const profile = profileQuery.data;

  // Gate: a student whose academic profile isn't set up yet (fresh email or
  // Google signup) goes to the onboarding step first. Keeps the arrival state
  // clean no matter how the account was created.
  const router = useRouter();
  useEffect(() => {
    if (!profile) return;
    const complete =
      (profile.educationLevel === "highschool" && !!profile.curriculumId) ||
      (profile.educationLevel === "tertiary" && !!profile.institutionId);
    if (!complete) router.replace("/onboarding");
  }, [profile, router]);

  const curriculumName = profile?.curriculumId
    ? curriculaQuery.data?.find((c) => c.id === profile.curriculumId)?.shortName
    : undefined;
  // Tertiary students have no grade to orient by, so name their institution
  // instead. shortName ("UCT") reads better than the full name when present.
  const institution = profile?.institutionId
    ? institutionsQuery.data?.find((i) => i.id === profile.institutionId)
    : undefined;
  const institutionName = institution?.shortName ?? institution?.name;
  const plan = entitlementsQuery.data?.primaryPlanCode;

  const chips: { label: string; href?: string }[] = [];
  if (profile?.grade != null) chips.push({ label: `Grade ${profile.grade}` });
  else if (institutionName) chips.push({ label: institutionName });
  if (curriculumName) chips.push({ label: curriculumName });
  if (plan) chips.push({ label: titleCase(plan), href: "/dashboard/billing" });

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={{ mb: 3 }}
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
        {chips.map((c) =>
          c.href ? (
            <Chip
              key={c.label}
              label={c.label}
              size="small"
              variant="outlined"
              component={Link}
              href={c.href}
              clickable
            />
          ) : (
            <Chip key={c.label} label={c.label} size="small" variant="outlined" />
          ),
        )}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button
          component={Link}
          href="/dashboard/wellbeing"
          size="small"
          variant="outlined"
          startIcon={<Heart size={18} />}
        >
          Log mood
        </Button>
        <Button
          component={Link}
          href="/dashboard/goals"
          size="small"
          variant="outlined"
          startIcon={<Flag size={18} />}
        >
          Add goal
        </Button>
        <Button
          component={Link}
          href="/dashboard/practice"
          size="small"
          variant="contained"
          startIcon={<NotebookPen size={18} />}
        >
          Practice
        </Button>
      </Stack>
    </Stack>
  );
}

// ─── Upcoming assessments (the canonical "what next") ─────────────────

type UpcomingItem = {
  id: string;
  title: string;
  subjectId?: string;
  type: string;
  weight: number;
  dueDate: string;
  predictedMark?: number | null;
};

function UpcomingAssessmentsCard({
  upcoming,
  nameFor,
  loading,
  isError,
  onRetry,
  isEmpty,
  dataUpdatedAt,
}: {
  upcoming: UpcomingItem[];
  nameFor: (id: string | undefined) => string;
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  dataUpdatedAt: number | undefined;
}) {
  const [hero, ...rest] = upcoming;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <SectionHeader
          overline="Up next"
          title="Upcoming assessments"
          mb={2.5}
          action={
            <Button
              component={Link}
              href="/dashboard/assessments"
              endIcon={<ArrowRight size={16} />}
              size="small"
            >
              All
            </Button>
          }
        />

        {loading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={120} />
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : isError ? (
          <CardError onRetry={onRetry} what="your upcoming assessments" />
        ) : isEmpty ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nothing on the horizon. Enjoy the breather, or get ahead.
            </Typography>
            <Button component={Link} href="/dashboard/practice" variant="outlined" size="small">
              Try a practice test
            </Button>
          </Box>
        ) : (
          <>
            {hero && (
              <motion.div {...enter}>
                <HeroUpcomingRow a={hero} unitName={nameFor(hero.subjectId)} />
              </motion.div>
            )}

            {rest.length > 0 && (
              <>
                <Divider sx={{ mt: 3, mb: 1.5 }} />
                <Stack spacing={0.5}>
                  {rest.map((a) => (
                    <CompactUpcomingRow key={a.id} a={a} unitName={nameFor(a.subjectId)} />
                  ))}
                </Stack>
              </>
            )}
          </>
        )}

        <LastSynced at={dataUpdatedAt} />
      </CardContent>
    </Card>
  );
}

function HeroUpcomingRow({ a, unitName }: { a: UpcomingItem; unitName: string }) {
  const daysLeft = dayjs(a.dueDate).diff(dayjs(), "day");
  const urgent = daysLeft >= 0 && daysLeft <= 3;
  const daysLabel =
    daysLeft === 0
      ? "today"
      : daysLeft === 1
        ? "tomorrow"
        : daysLeft > 0
          ? `in ${daysLeft} days`
          : dayjs(a.dueDate).format("DD MMM");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {unitName}
        </Typography>
        <Typography
          variant="h4"
          component={Link}
          href={`/dashboard/assessments/${a.id}`}
          sx={{
            fontWeight: 600,
            color: "text.primary",
            textDecoration: "none",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
            mt: 0.5,
            "&:hover": { color: "primary.main" },
            transition: "color 180ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          }}
        >
          {a.title}
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          rowGap={0.5}
          sx={{ mt: 1 }}
          divider={<Box component="span" sx={{ color: "text.disabled" }}>·</Box>}
        >
          <Typography variant="body2" color="text.secondary">
            Due{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 600,
                color: urgent ? "warning.dark" : "text.primary",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {daysLabel}
            </Box>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {a.type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {a.weight}% weight
          </Typography>
          {a.predictedMark != null && (
            <Typography variant="body2" color="text.secondary">
              Predicted{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {a.predictedMark}%
              </Box>
            </Typography>
          )}
        </Stack>
      </Box>
      <Button
        component={Link}
        href={`/dashboard/workspace?assessmentId=${a.id}`}
        variant="contained"
        color="secondary"
        size="large"
        sx={{ flexShrink: 0 }}
      >
        Start working
      </Button>
    </Box>
  );
}

function CompactUpcomingRow({ a, unitName }: { a: UpcomingItem; unitName: string }) {
  const daysLeft = dayjs(a.dueDate).diff(dayjs(), "day");
  const urgent = daysLeft >= 0 && daysLeft <= 3;
  const dayLabel =
    daysLeft === 0 ? "Today" : urgent ? `${daysLeft}d` : dayjs(a.dueDate).format("DD MMM");

  return (
    <Box
      component={Link}
      href={`/dashboard/assessments/${a.id}`}
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        textDecoration: "none",
        color: "inherit",
        transition: "background-color 180ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
          {a.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
          {unitName} · {a.type} · {a.weight}%
        </Typography>
      </Box>
      <Chip
        label={dayLabel}
        size="small"
        color={urgent ? "warning" : "default"}
        variant={urgent ? "filled" : "outlined"}
        sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
      />
    </Box>
  );
}

// ─── Academic standing (real predictions + weakest topics) ────────────
// Replaces the old mastery-trend chart (which read mock-only term
// averages). Predicted marks come from the compute-on-read Mastery
// engine; "focus topics" are the lowest-mastery topics from real
// practice attempts. Each half renders only when its data exists.

function AcademicStandingCard({
  predictions,
  nameFor,
  weakTopics,
  loading,
  isError,
  onRetry,
  dataUpdatedAt,
}: {
  predictions: TermPrediction[];
  nameFor: (id: string | undefined) => string;
  weakTopics: TopicMastery[];
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
  dataUpdatedAt: number | undefined;
}) {
  // Predicted average across subjects — computed from raw floats, then
  // rounded once, so the delta never drifts from the true value.
  const n = predictions.length;
  const rawPredicted =
    n > 0 ? predictions.reduce((s, p) => s + p.predictedNextTerm, 0) / n : null;
  const rawCurrent = n > 0 ? predictions.reduce((s, p) => s + p.currentTerm, 0) / n : null;
  const predictedAverage = rawPredicted != null ? Math.round(rawPredicted) : null;
  const delta =
    rawPredicted != null && rawCurrent != null ? Math.round(rawPredicted - rawCurrent) : null;

  const focus = weakTopics.slice(0, 3);
  const empty = !loading && n === 0 && focus.length === 0;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}>
        <SectionHeader
          overline="Academic standing"
          title="Predicted marks"
          action={
            <Button
              component={Link}
              href="/dashboard/mastery"
              endIcon={<ArrowRight size={16} />}
              size="small"
            >
              Details
            </Button>
          }
        />

        {isError ? (
          <CardError onRetry={onRetry} what="your predictions" />
        ) : loading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={72} />
            <Skeleton variant="rounded" height={48} />
            <Skeleton variant="rounded" height={48} />
          </Stack>
        ) : empty ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 360, mx: "auto", mb: 2 }}
            >
              Log a few graded marks and take practice tests. Your predicted marks and
              focus topics build from there.
            </Typography>
            <Button component={Link} href="/dashboard/assessments" variant="outlined" size="small">
              Log a mark
            </Button>
          </Box>
        ) : (
          <>
            {predictedAverage != null && (
              <Stack direction="row" alignItems="flex-end" spacing={2} sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Predicted average
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography
                      component="div"
                      sx={{
                        fontSize: { xs: "2.25rem", sm: "2.75rem" },
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                        color: "primary.main",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {predictedAverage}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "1rem", fontWeight: 500, color: "primary.main", lineHeight: 1 }}
                    >
                      %
                    </Typography>
                  </Stack>
                </Box>
                {delta != null && delta !== 0 && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ color: delta > 0 ? "success.main" : "warning.main", pb: 1 }}
                  >
                    {delta > 0 ? (
                      <TrendingUp size={18} />
                    ) : (
                      <TrendingDown size={18} />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                    >
                      {Math.abs(delta)}pt
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs current
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}

            {predictions.length > 0 && (
              <Stack spacing={1.25} sx={{ mb: focus.length > 0 ? 2.5 : 0 }}>
                {predictions.slice(0, 4).map((p) => (
                  <SubjectPredictionRow key={p.subjectId} p={p} name={nameFor(p.subjectId)} />
                ))}
              </Stack>
            )}

            {focus.length > 0 && (
              <>
                {predictions.length > 0 && <Divider sx={{ mb: 1.5 }} />}
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Focus topics
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {focus.map((t) => (
                    <Chip
                      key={`${t.subjectId}-${t.topic}`}
                      component={Link}
                      href="/dashboard/mastery"
                      clickable
                      size="small"
                      variant="outlined"
                      label={`${t.topic} · ${t.mastery}%`}
                    />
                  ))}
                </Stack>
              </>
            )}
          </>
        )}

        <LastSynced at={dataUpdatedAt} />
      </CardContent>
    </Card>
  );
}

// TermPrediction.subject is whatever the API stored as the label, which for a
// university course is the bare practice key ("uct:calculus-i"). Resolve it
// against the student's own units instead of trusting that field.
function SubjectPredictionRow({ p, name }: { p: TermPrediction; name: string }) {
  const up = p.predictedNextTerm >= p.currentTerm;
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
          {name}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {p.currentTerm}%
          </Typography>
          <Box component={ArrowRight} sx={{ width: 14, height: 14, color: "text.disabled", flexShrink: 0 }} />
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
      {/* Confidence: honest signal of how much evidence backs the number. */}
      <LinearProgress
        variant="determinate"
        value={Math.round(p.confidence * 100)}
        sx={{ mt: 0.5, height: 3, borderRadius: 999, opacity: 0.5 }}
        aria-label={`${name}: ${Math.round(p.confidence * 100)}% confidence`}
      />
    </Box>
  );
}

// ─── Active goals ─────────────────────────────────────────────────────

function ActiveGoalsCard({
  goals,
  loading,
  isError,
  onRetry,
  isEmpty,
}: {
  goals: Goal[];
  loading: boolean;
  isError: boolean;
  onRetry: () => void;
  isEmpty: boolean;
}) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}>
        <SectionHeader
          overline="Tracking"
          title="Active goals"
          action={
            <Button
              component={Link}
              href="/dashboard/goals"
              endIcon={<ArrowRight size={16} />}
              size="small"
            >
              All
            </Button>
          }
        />
        {loading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : isError ? (
          <CardError onRetry={onRetry} what="your goals" />
        ) : isEmpty ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No active goals yet. Set one to start tracking.
            </Typography>
            <Button component={Link} href="/dashboard/goals" variant="outlined" size="small">
              Set a goal
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {goals.map((g) => (
              <GoalRow key={g.id} g={g} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function GoalRow({ g }: { g: Goal }) {
  const atRisk = g.status === "at_risk";
  return (
    <Box
      component={Link}
      href={`/dashboard/goals/${g.id}`}
      sx={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        px: 1.5,
        py: 1,
        mx: -1.5,
        borderRadius: 1.5,
        transition: "background-color 180ms cubic-bezier(0.165, 0.84, 0.44, 1)",
        "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.04) },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ mb: 1, gap: 1 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
            {g.title}
          </Typography>
          {g.target && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
              noWrap
            >
              Target: {g.target}
            </Typography>
          )}
        </Box>
        <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
          >
            {g.progress}%
          </Typography>
          {atRisk && (
            <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 600 }}>
              Falling behind
            </Typography>
          )}
        </Stack>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={g.progress}
        color={atRisk ? "warning" : "primary"}
        aria-label={`${g.title}: ${g.progress}% complete${atRisk ? ", falling behind" : ""}`}
      />
    </Box>
  );
}

// ─── Wellbeing snapshot ───────────────────────────────────────────────

function WellbeingSnapshotCard() {
  const summaryQuery = useWellbeingSummary();
  const moodQuery = useMoodTrend(14);
  const summary = summaryQuery.data;
  const trend = moodQuery.data ?? [];

  const noCheckins =
    !summaryQuery.isLoading &&
    (!summary || (summary.moodAvg7d === 0 && summary.checkinStreakDays === 0));

  const stressColor: Record<string, "success" | "warning" | "error" | "default"> = {
    none: "success",
    low: "success",
    moderate: "warning",
    high: "error",
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}>
        <SectionHeader
          overline="Wellbeing"
          title="How you're doing"
          action={
            <Button
              component={Link}
              href="/dashboard/wellbeing"
              endIcon={<ArrowRight size={16} />}
              size="small"
            >
              More
            </Button>
          }
        />

        {summaryQuery.isLoading ? (
          <Skeleton variant="rounded" height={96} />
        ) : summaryQuery.isError ? (
          <CardError onRetry={() => summaryQuery.refetch()} what="your wellbeing" />
        ) : noCheckins ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No check-ins yet. A quick daily mood log builds a picture of how things are
              treating you over time.
            </Typography>
            <Button
              component={Link}
              href="/dashboard/wellbeing"
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<Heart size={18} />}
            >
              Log today&apos;s mood
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" spacing={3} alignItems="flex-end" flexWrap="wrap" useFlexGap>
              <Metric label="7-day mood" value={summary!.moodAvg7d.toFixed(1)} unit="/5" />
              <Metric label="Check-in streak" value={String(summary!.checkinStreakDays)} unit="d" />
              {summary!.sleepHours > 0 && (
                <Metric label="Sleep" value={summary!.sleepHours.toFixed(1)} unit="h" />
              )}
              <Box sx={{ alignSelf: "center" }}>
                <Chip
                  label={`${titleCase(summary!.stressSignal)} stress`}
                  size="small"
                  color={stressColor[summary!.stressSignal] ?? "default"}
                  variant="outlined"
                />
              </Box>
            </Stack>
            {trend.length >= 2 && <MoodSparkline points={trend} />}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Stack direction="row" alignItems="baseline" spacing={0.25}>
        <Typography
          sx={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </Typography>
        {unit && (
          <Typography variant="caption" color="text.secondary">
            {unit}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

// Lightweight inline SVG sparkline for the 14-day mood trend. Avoids
// pulling MUI X charts in for a decorative micro-viz. Mood scale 1-5.
function MoodSparkline({ points }: { points: MoodPoint[] }) {
  const theme = useTheme();
  const w = 100;
  const h = 28;
  const pad = 2;
  const min = 1;
  const max = 5;
  const xs = points.map((_, i) => pad + (i * (w - 2 * pad)) / (points.length - 1));
  const ys = points.map(
    (p) => h - pad - ((Math.min(max, Math.max(min, p.mood)) - min) / (max - min)) * (h - 2 * pad),
  );
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  return (
    <Box
      component="svg"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="14-day mood trend"
      sx={{ width: "100%", height: 36, display: "block" }}
    >
      <path
        d={d}
        fill="none"
        stroke={theme.palette.wellbeing.main}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </Box>
  );
}

// ─── Recent activity ──────────────────────────────────────────────────

function RecentActivityCard() {
  const activityQuery = useLiveActivity(8);
  const items = activityQuery.data ?? [];

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}>
        <SectionHeader overline="Recent" title="Activity" />
        {activityQuery.isLoading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={40} />
          </Stack>
        ) : activityQuery.isError ? (
          <CardError onRetry={() => activityQuery.refetch()} what="your activity" />
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            Your recent activity will appear here as you practise, log marks, and hit goals.
          </Typography>
        ) : (
          <Stack spacing={0.25}>
            {items.map((a) => (
              <ActivityRow key={a.id} a={a} />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityRow({ a }: { a: LiveActivity }) {
  const meta = [a.subject, a.detail].filter(Boolean).join(" · ");
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: "secondary.main",
          flexShrink: 0,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
          {a.action}
        </Typography>
        {meta && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {meta}
          </Typography>
        )}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {dayjs(a.ts).fromNow(true)}
      </Typography>
    </Stack>
  );
}

// ─── util ─────────────────────────────────────────────────────────────

function titleCase(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
