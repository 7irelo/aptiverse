"use client";

import { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
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
import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { masteryBandRamp, courseColor, type BandRamp } from "@/components/common/chartPalette";
import {
  useAcademicUnits,
  useTermPredictions,
  useTopicMastery,
  useAssessments,
  useMoodTrend,
  useWellbeingSummary,
  useCourses,
  useSubjects,
  useAcademicProfile,
  type TermPrediction,
  type TopicMastery,
} from "@/lib/api/queries";
import type { Assessment, MoodPoint } from "@/lib/mockData";
import { prettifyUnitId } from "@/lib/format";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";

export default function AnalyticsPage() {
  const academic = useAcademicUnits();
  const predictionsQuery = useTermPredictions();
  const masteryQuery = useTopicMastery();
  const assessmentsQuery = useAssessments();
  const moodQuery = useMoodTrend(30);
  const wellbeingQuery = useWellbeingSummary();
  const coursesQuery = useCourses();
  const subjectsQuery = useSubjects();
  const profileQuery = useAcademicProfile();

  // Which units are finished, so the view can pull them out of the active list.
  // Tertiary courses carry their own isFinished (semesters, or a manual finish).
  // High-school subjects are year-long and finish by grade: a subject enrolled
  // at a grade below the student's current one belongs to a year they have left.
  const currentGrade = profileQuery.data?.grade ?? null;
  const finishedIds = useMemo(() => {
    const ids = new Set<string>();
    if (academic.isTertiary) {
      for (const c of coursesQuery.data ?? []) if (c.isFinished) ids.add(c.practiceKey);
    } else if (currentGrade != null) {
      for (const s of subjectsQuery.data ?? []) if (s.grade < currentGrade) ids.add(s.subjectId);
    }
    return ids;
  }, [academic.isTertiary, currentGrade, coursesQuery.data, subjectsQuery.data]);

  const predictions = predictionsQuery.data ?? [];
  const topics = masteryQuery.data ?? [];
  const assessments = assessmentsQuery.data ?? [];
  const mood = moodQuery.data ?? [];
  const wellbeing = wellbeingQuery.data;

  const loading =
    predictionsQuery.isLoading || masteryQuery.isLoading || assessmentsQuery.isLoading;
  const isError = predictionsQuery.isError || masteryQuery.isError || assessmentsQuery.isError;

  const graded = assessments
    .filter((a) => a.actualMark != null)
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
        description={`Your ${academic.unitNounPlural}, one by one: where each one stands, what is moving, and how you are holding up.`}
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
          finishedIds={finishedIds}
          nameOf={(id, fallback) => academic.nameFor(id) ?? prettifyUnitId(fallback ?? id)}
        />
      )}
    </AtmosphericBackdrop>
  );
}

// ── model ─────────────────────────────────────────────────────────────

// One course's whole story, assembled from the three sources that each hold
// only a slice of it: predictions (standing), topic mastery, and graded marks.
type CourseStory = {
  id: string;
  name: string;
  marks: { date: string; mark: number; title: string }[];
  current: number | null;
  predicted: number | null;
  confidence: number;
  topics: TopicMastery[];
  mastery: number | null;
};

// Courses are the unit of the story, so they get built from every source
// rather than whichever one happens to be populated. Weakest first: the
// course in trouble is the one worth reading first.
function buildCourses(
  predictions: TermPrediction[],
  topics: TopicMastery[],
  graded: Assessment[],
  nameOf: (id: string, fallback?: string) => string,
): CourseStory[] {
  const ids = new Set<string>([
    ...predictions.map((p) => p.subjectId),
    ...topics.map((t) => t.subjectId),
    ...graded.map((g) => g.subjectId),
  ]);

  return [...ids]
    .map((id) => {
      const p = predictions.find((x) => x.subjectId === id);
      const ts = topics.filter((t) => t.subjectId === id);
      const marks = graded
        .filter((g) => g.subjectId === id && g.actualMark != null)
        .map((g) => ({ date: g.dueDate.slice(0, 10), mark: g.actualMark as number, title: g.title }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        id,
        name: nameOf(id, p?.subject),
        marks,
        current: p?.currentTerm ?? (marks.length ? marks[marks.length - 1].mark : null),
        predicted: p?.predictedNextTerm ?? null,
        confidence: p?.confidence ?? 0,
        topics: ts,
        mastery: ts.length ? Math.round(ts.reduce((s, t) => s + t.mastery, 0) / ts.length) : null,
      };
    })
    .sort((a, b) => (a.current ?? 101) - (b.current ?? 101));
}

// ── main view ─────────────────────────────────────────────────────────

function AnalyticsView({
  predictions,
  topics,
  graded,
  mood,
  moodAvg7d,
  finishedIds,
  nameOf,
}: {
  predictions: TermPrediction[];
  topics: TopicMastery[];
  graded: Assessment[];
  mood: MoodPoint[];
  moodAvg7d: number;
  // Unit ids (practiceKey / subject slug) the student is done with.
  finishedIds: Set<string>;
  nameOf: (id: string, fallback?: string) => string;
}) {
  const theme = useTheme();
  const vocab = useStudyVocabulary();
  const mode = theme.palette.mode === "dark" ? "dark" : "light";
  const courses = buildCourses(predictions, topics, graded, nameOf);

  // A finished course still has a story worth keeping, but it does not belong up
  // top competing for attention with what the student is taking now.
  const activeCourses = courses.filter((c) => !finishedIds.has(c.id));
  const pastCourses = courses.filter((c) => finishedIds.has(c.id));

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
            hint={
              predictedAvg == null
                ? "Log marks to project"
                : `Across ${courses.length} ${courses.length === 1 ? vocab.unitSingular : vocab.unitPlural}`
            }
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
            hint={`Graded this ${vocab.periodSingular}`}
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

      {/* Each course gets its own read. Averaging them into one number, or
          pooling their topics into one pie, hides the only thing worth
          knowing: which course needs you, and why. */}
      {activeCourses.length > 0 && (
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          <Typography variant="overline" color="text.secondary">
            By {vocab.unitSingular}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Where each {vocab.unitSingular} actually stands
          </Typography>
          {/* Three-up suits the usual five-to-eight courses, but hard-coding it
              stranded a student carrying two: their cards took a third of the
              row each and left the rest of the width empty. */}
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {activeCourses.map((c, i) => (
              <Grid key={c.id} size={{ xs: 12, md: 6, lg: activeCourses.length >= 3 ? 4 : 6 }}>
                <CourseCard course={c} accent={courseColor(i, mode)} mode={mode} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {pastCourses.length > 0 && (
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            mb: { xs: 2, md: 3 },
            bgcolor: "transparent",
            "&:before": { display: "none" },
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 2.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="baseline">
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Past {vocab.unitPlural}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {pastCourses.length} finished
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pb: 2.5 }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {pastCourses.map((c, i) => (
                <Grid key={c.id} size={{ xs: 12, md: 6, lg: pastCourses.length >= 3 ? 4 : 6 }}>
                  <CourseCard course={c} accent={courseColor(i, mode)} mode={mode} isPast />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* One line per course. Plotting every course as a single series
            invented trends that never happened: a 95% calculus test followed
            by an 85% english essay is not a decline, it is two courses. */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography variant="overline" color="text.secondary">
                Trajectory
              </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Marks over time, by course
              </Typography>
              {graded.length > 0 ? (
                <MarksByCourse courses={courses} mode={mode} />
              ) : (
                <SectionEmpty
                  text="Log a graded mark and each course starts charting its own line here."
                  href="/dashboard/assessments"
                  cta="Log a mark"
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Wellbeing trend: the academics-plus-wellbeing cut nothing else shows. */}
        <Grid size={{ xs: 12, lg: 4 }}>
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
                  text={`A daily mood check-in builds a picture of how the ${vocab.periodSingular} is treating you.`}
                  href="/dashboard/wellbeing"
                  cta="Log today's mood"
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

// ── course card ───────────────────────────────────────────────────────

// Which band a mastery value falls in: Needs work below 50, Developing to 80,
// Strong above.
function bandColor(mastery: number, ramp: BandRamp): string {
  if (mastery < 50) return ramp.needsWork;
  if (mastery < 80) return ramp.developing;
  return ramp.strong;
}

// The mastery read-out, as a bar rather than a donut. A bar reads a single
// magnitude honestly and, unlike the old ring, its colour and its length agree:
// the fill is the mastery value, coloured by the band that value lands in. The
// two faint ticks are the band boundaries (50, 80), so the student can see not
// just where they are but how far the next band is.
function MasteryBar({ mastery, ramp }: { mastery: number; ramp: BandRamp }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          Mastery
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: bandColor(mastery, ramp) }}
        >
          {mastery}%
        </Typography>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: 10,
          borderRadius: 999,
          bgcolor: (t) => alpha(t.palette.text.primary, t.palette.mode === "dark" ? 0.1 : 0.07),
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            width: `${mastery}%`,
            bgcolor: bandColor(mastery, ramp),
            borderRadius: 999,
            transition: "width 240ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
        {[50, 80].map((mark) => (
          <Box
            key={mark}
            sx={{
              position: "absolute",
              top: 1.5,
              bottom: 1.5,
              left: `${mark}%`,
              width: "1.5px",
              // A tick inside the fill is punched out of the coloured bar (a
              // light gap); a tick still in the track is a faint dark notch. So
              // both band boundaries read, whichever side of the fill they fall.
              bgcolor: (t) =>
                mark <= mastery
                  ? alpha(t.palette.background.paper, 0.75)
                  : alpha(t.palette.text.primary, 0.18),
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

// One weak topic, named, with where it sits and which way it is moving. The
// trend is the latest attempt minus the first, so an arrow tells the student
// whether the topic is already recovering or still sliding.
function WeakTopicRow({ topic, ramp }: { topic: TopicMastery; ramp: BandRamp }) {
  const rising = topic.trend >= 3;
  const falling = topic.trend <= -3;
  const TrendIcon = rising ? TrendingUp : falling ? TrendingDown : Minus;
  // A lucide icon paints in currentColor, so the colour is set on a wrapper via
  // sx (which resolves theme tokens) and the icon inherits it. Trend direction
  // is a status signal (getting better / worse), kept on the semantic status
  // palette and deliberately separate from the ordinal band ramp on the dot.
  const trendColor = rising ? "success.main" : falling ? "warning.main" : "text.disabled";

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        sx={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, bgcolor: bandColor(topic.mastery, ramp) }}
      />
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap title={topic.topic}>
        {topic.topic}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: bandColor(topic.mastery, ramp) }}
      >
        {topic.mastery}%
      </Typography>
      <Box sx={{ color: trendColor, display: "flex", flexShrink: 0 }}>
        <TrendIcon size={15} aria-hidden />
      </Box>
    </Stack>
  );
}

// A course, whole: its standing, where it is heading, and the topics worth
// working on next. Per course rather than one global list, because "8 topics"
// pooled across every course is a number nobody can act on.
function CourseCard({
  course,
  accent,
  mode,
  isPast = false,
}: {
  course: CourseStory;
  accent: string;
  mode: "light" | "dark";
  // A finished course: show how it ended, but drop the forward-looking parts.
  // Revising the weak topics of a course you are no longer taking is not a next
  // step, so the "Work on next" list and the "Practise these" shortcut go.
  isPast?: boolean;
}) {
  const ramp = masteryBandRamp(mode);
  const delta =
    course.predicted != null && course.current != null ? course.predicted - course.current : null;

  // Weakest first: a topic below Strong (80) is one worth working on. The list
  // names names, which the old count-donut never did, so the student can act
  // on it instead of reading "4 need work" and wondering which 4.
  const toWorkOn = isPast
    ? []
    : [...course.topics]
        .filter((t) => t.mastery < 80)
        .sort((a, b) => a.mastery - b.mastery)
        .slice(0, 3);
  const allStrong = !isPast && course.topics.length > 0 && toWorkOn.length === 0;

  return (
    // Column layout so the middle block (donut, or the nothing-yet prompt) can
    // take the slack. A course with no practised topics sat in a card stretched
    // to its neighbour's donut height and left a hole under two lines of text.
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: accent, flexShrink: 0 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
            {course.name}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1.9rem", lineHeight: 1 }}>
            {course.current != null ? `${course.current}%` : "—"}
          </Typography>
          {/* A finished course has no "next term" to head towards, so the
              projection arrow is dropped: the final mark is the whole story. */}
          {!isPast && course.predicted != null && delta != null && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: delta >= 0 ? "success.main" : "warning.main",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {course.predicted}%
              </Typography>
              {delta !== 0 && (
                <Box
                  sx={{
                    px: 0.75,
                    py: 0.125,
                    borderRadius: 1,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: delta > 0 ? "success.main" : "warning.main",
                    bgcolor: (t) =>
                      alpha(delta > 0 ? t.palette.success.main : t.palette.warning.main, 0.14),
                  }}
                >
                  {delta > 0 ? "+" : ""}
                  {delta}
                </Box>
              )}
            </Stack>
          )}
        </Stack>

        {course.topics.length > 0 ? (
          <>
            {course.mastery != null && <MasteryBar mastery={course.mastery} ramp={ramp} />}

            <Box sx={{ mt: 2.5, flex: 1 }}>
              {isPast ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.disabled" }} />
                  <Typography variant="body2" color="text.secondary">
                    Wrapped up. This is where you finished.
                  </Typography>
                </Stack>
              ) : allStrong ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ramp.strong }} />
                  <Typography variant="body2" color="text.secondary">
                    Every practised topic is strong. Keep them warm.
                  </Typography>
                </Stack>
              ) : (
                <>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1 }}
                  >
                    Work on next
                  </Typography>
                  <Stack spacing={1.25}>
                    {toWorkOn.map((t) => (
                      <WeakTopicRow key={t.topic} topic={t} ramp={ramp} />
                    ))}
                  </Stack>
                </>
              )}
            </Box>
          </>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ flex: 1, minHeight: 108, py: 1, textAlign: "center" }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 220 }}>
              No practised topics yet, so there is no mastery to show.
            </Typography>
            <Button component={Link} href="/dashboard/practice" variant="outlined" size="small">
              Map this course
            </Button>
          </Stack>
        )}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          sx={{ mt: "auto", pt: 1.5 }}
        >
          <Typography variant="caption" color="text.secondary">
            {course.marks.length} mark{course.marks.length === 1 ? "" : "s"} logged
            {course.confidence > 0 && ` · ${Math.round(course.confidence * 100)}% confidence`}
          </Typography>
          {toWorkOn.length > 0 && (
            <Button
              component={Link}
              href="/dashboard/practice"
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              sx={{ flexShrink: 0 }}
            >
              Practise these
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── marks by course ───────────────────────────────────────────────────

// Shared date axis, one line per course, gaps connected so a course with marks
// weeks apart still reads as its own line rather than breaking in two.
function MarksByCourse({ courses, mode }: { courses: CourseStory[]; mode: "light" | "dark" }) {
  const withMarks = courses.filter((c) => c.marks.length > 0);
  const dates = [...new Set(withMarks.flatMap((c) => c.marks.map((m) => m.date)))].sort();

  const series = withMarks.map((c) => ({
    label: c.name,
    data: dates.map((d) => c.marks.find((m) => m.date === d)?.mark ?? null),
    color: courseColor(courses.indexOf(c), mode),
    showMark: true,
    connectNulls: true,
    curve: "linear" as const,
  }));

  if (series.length === 0) return null;

  return (
    <>
      <AptiverseLineChart
        height={300}
        xAxis={[{ data: dates.map((d) => dayjs(d).format("DD MMM")), scaleType: "point" }]}
        yAxis={[{ min: 0, max: 100 }]}
        series={series}
        margin={{ top: 16, right: 16, bottom: 28, left: 36 }}
      />
      <Typography variant="caption" color="text.secondary">
        Each course keeps its own line. A single mark stays a point until there is a second one to
        join it to.
      </Typography>
    </>
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
            <Skeleton variant="rounded" height={360} />
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
