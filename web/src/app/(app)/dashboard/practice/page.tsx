"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import { CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { CubeSpinner } from "@/components/common/CubeSpinner";
import {
  usePracticeTests,
  useSubjects,
  useCourses,
  useAcademicProfile,
  useAssessments,
  useTopicMastery,
  type PracticeFormat,
} from "@/lib/api/queries";
import {
  usePracticeGeneration,
  type PracticeGeneration,
} from "@/lib/hooks/usePracticeGeneration";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import type { Assessment, PracticeTest } from "@/lib/mockData";

// A study unit the generator + list filter target: a CAPS subject (high
// school) or an enrolled course (tertiary), unified to { id, name } where
// id is the practice key that tests are keyed on.
type StudyUnit = { id: string; name: string };

// A test is sat on its own page, not in the workspace. The workspace is for
// producing work with help on hand; a test is timed, tutor off, one attempt.
// See the comment at the top of practice/[id]/page.tsx.
function testHref(test: Pick<PracticeTest, "id">) {
  return `/dashboard/practice/${encodeURIComponent(test.id)}`;
}

// useSearchParams() opts the whole subtree out of static rendering, and Next 16
// fails the production build rather than doing it silently. The Suspense
// boundary is what lets the rest of the page prerender while the query string
// resolves on the client.
export default function PracticePage() {
  return (
    <Suspense fallback={<PracticeFallback />}>
      <PracticeContent />
    </Suspense>
  );
}

function PracticeFallback() {
  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Practice tests"
        description="AI-generated drills aligned to your weakest topics."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Practice" }]}
      />
      <Skeleton variant="rounded" height={280} />
    </AtmosphericBackdrop>
  );
}

function PracticeContent() {
  const testsQuery = usePracticeTests();
  // Generation lives here, not inside the dialog, so closing the dialog (or
  // leaving the page entirely) does not abandon the job.
  const generation = usePracticeGeneration();
  const subjectsQuery = useSubjects();
  const coursesQuery = useCourses();
  const profileQuery = useAcademicProfile();
  const assessmentsQuery = useAssessments();
  const searchParams = useSearchParams();
  const [genOpen, setGenOpen] = useState(false);

  const vocab = useStudyVocabulary();
  const isTertiary = vocab.isTertiary;
  const unitNoun = vocab.unitSingular;

  // What the generator + list can target: courses (tertiary) or subjects
  // (high school). id is the practice key generation, mastery, and every
  // PracticeTest.subjectId are keyed on. A uni student never sees CAPS
  // subjects here; they see the courses they enrolled in.
  const units: StudyUnit[] = isTertiary
    ? (coursesQuery.data ?? []).map((c) => ({ id: c.practiceKey, name: c.name }))
    : (subjectsQuery.data ?? []).map((s) => ({ id: s.subjectId, name: s.name }));

  const nameForUnit = (subjectId: string) =>
    units.find((u) => u.id === subjectId)?.name ?? subjectId;

  const assessments = assessmentsQuery.data ?? [];

  // Nothing logged means nothing to practise for. This is the rule, not a
  // loading state: the button stays shut until there is an assessment.
  const canGenerate = assessments.length > 0;

  const defaultAssessmentId = searchParams.get("assessment") ?? undefined;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Practice tests"
        description="Built for the assessments on your profile, aimed at your weakest topics."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Practice" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setGenOpen(true)}
            disabled={!canGenerate}
          >
            Generate a test
          </Button>
        }
      />

      <GenerationBanner generation={generation} />

      {!canGenerate && !assessmentsQuery.isLoading && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button component={Link} href="/dashboard/assessments/new" size="small" color="inherit">
              Add one
            </Button>
          }
        >
          Practice is built for a specific assessment, so log one first. Anything on your profile
          works, whether it is next week or already written.
        </Alert>
      )}

      <QueryStates
        query={testsQuery}
        empty={{
          icon: <QuizIcon />,
          title: "No practice tests yet",
          description: canGenerate
            ? "Pick one of your assessments and we'll build a test for it, aimed at the topics you're weakest on."
            : `Log a ${unitNoun} assessment first. Practice is always built for one of them.`,
          action: canGenerate ? (
            <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={() => setGenOpen(true)}>
              Generate a test
            </Button>
          ) : (
            <Button component={Link} href="/dashboard/assessments/new" variant="contained">
              Add an assessment
            </Button>
          ),
        }}
      >
        {(tests) => (
          <PracticeList tests={tests} units={units} unitNoun={unitNoun} assessments={assessments} />
        )}
      </QueryStates>

      <GenerateTestDialog
        open={genOpen}
        onClose={() => setGenOpen(false)}
        assessments={assessments}
        isTertiary={isTertiary}
        unitNoun={unitNoun}
        nameForUnit={nameForUnit}
        defaultAssessmentId={defaultAssessmentId}
        generation={generation}
      />
    </AtmosphericBackdrop>
  );
}

// ── Generation banner ─────────────────────────────────────────────────

// The waiting state, and the reason the student is not trapped by it.
//
// Generation runs on the server, so this is a report on a job rather than a
// frozen button: the dialog closes the moment the job is queued, the student
// can go anywhere, and the banner is waiting for them when they come back with
// either the finished test or an honest reason it did not happen.
function GenerationBanner({ generation }: { generation: PracticeGeneration }) {
  const router = useRouter();
  const { phase, isWorking, practiceTestId, error, elapsedMs, dismiss } = generation;
  if (phase === "idle" || phase === "starting") return null;

  const seconds = Math.floor(elapsedMs / 1000);
  const elapsedLabel =
    seconds < 60 ? `${seconds}s so far` : `${Math.floor(seconds / 60)}m ${seconds % 60}s so far`;

  if (isWorking) {
    return (
      <Card variant="outlined" sx={{ mb: 2, borderColor: "secondary.main" }}>
        <CardContent sx={{ py: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <CubeSpinner color="primary" sx={{ fontSize: 28, flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {phase === "queued" ? "Your test is queued" : "Writing your test"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {generation.format === "exam"
                  ? "Setting a full paper: sections, marks, and a marking memo. Usually a minute or two."
                  : "Writing and checking your questions. Usually well under a minute."}{" "}
                You can leave this page. It will be in your list when it is done. {elapsedLabel}.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (phase === "succeeded" && practiceTestId) {
    return (
      <Alert
        severity="success"
        icon={<CheckCircle2 size={20} />}
        sx={{ mb: 2 }}
        onClose={dismiss}
        action={
          // Navigate first, dismiss second. Dismissing unmounts this alert, and
          // an unmounted <Link> never completes its navigation, which is how
          // "Open it" managed to clear the banner and go nowhere.
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              router.push(testHref({ id: practiceTestId }));
              dismiss();
            }}
          >
            Open it
          </Button>
        }
      >
        Your test is ready.
      </Alert>
    );
  }

  // failed, timed out, or succeeded without a test id (which would be a bug on
  // our side, so it reads as a failure rather than as nothing at all).
  return (
    <Alert severity={phase === "timeout" ? "warning" : "error"} sx={{ mb: 2 }} onClose={dismiss}>
      {error ?? "The generator had trouble. Please try again."}
    </Alert>
  );
}

// ── Generation dialog ─────────────────────────────────────────────────

const FORMAT_HELP: Record<PracticeFormat, string> = {
  multiple_choice: "Four options, one correct. Timed and auto-marked.",
  short_answer: "Type a brief answer, marked against the expected answer.",
  reading: "A passage with questions that test your understanding of it.",
  flashcards: "Flip cards and rate yourself. Not scored, retake anytime.",
  essay: "A prompt with marking criteria. Write it and the tutor gives feedback.",
  exam: "A full paper under exam conditions: sections, marks per question, and written answers marked by an examiner with part marks.",
};

const FORMAT_LABELS: Record<PracticeFormat, string> = {
  multiple_choice: "Multiple choice",
  short_answer: "Short answer",
  reading: "Reading",
  flashcards: "Flashcards",
  essay: "Essay",
  exam: "Exam paper",
};

const SCORED_FORMATS: PracticeFormat[] = ["multiple_choice", "short_answer", "reading", "exam"];

// What each kind of student is offered. The generator can write any of these,
// but they are not all worth offering: "reading" sets a passage with
// comprehension questions on it, which is a school language-paper exercise. A
// university student practising one would be practising the wrong thing, so it
// is not on their list.
const FORMATS_FOR_SCHOOL: PracticeFormat[] = [
  "multiple_choice",
  "short_answer",
  "reading",
  "flashcards",
  "essay",
  "exam",
];
const FORMATS_FOR_TERTIARY: PracticeFormat[] = [
  "multiple_choice",
  "short_answer",
  "flashcards",
  "essay",
  "exam",
];

// The formats that suit an assessment of each type, offered first. A student
// logging an essay is not revising for a multiple-choice paper. This orders the
// list rather than restricting it: an essay is still worth doing flashcards
// for, so nothing is taken away, the likely choice is just at the top.
const FORMATS_BY_ASSESSMENT_TYPE: Record<string, PracticeFormat[]> = {
  test: ["multiple_choice", "short_answer", "exam", "flashcards"],
  exam: ["exam", "multiple_choice", "short_answer", "flashcards"],
  essay: ["essay", "short_answer", "flashcards"],
  investigation: ["short_answer", "essay", "flashcards"],
  project: ["short_answer", "essay", "flashcards"],
};

// What a paper can be out of, and what that costs in time at roughly a minute
// a mark. The numbers are the ones a South African student recognises from a
// real timetable rather than arbitrary round figures.
const PAPER_SIZES: { marks: number; label: string }[] = [
  { marks: 30, label: "30 marks, about half an hour" },
  { marks: 50, label: "50 marks, about an hour" },
  { marks: 100, label: "100 marks, about two hours" },
  { marks: 150, label: "150 marks, a full three-hour paper" },
];

// Practice is offered against everything logged, not just what is still due:
// revising a test you already wrote is how you prepare for the exam that covers
// it again. Upcoming leads because that is usually what is being revised for.
function groupAssessments(assessments: Assessment[]) {
  const now = Date.now();
  const upcoming = assessments
    .filter((a) => +new Date(a.dueDate) >= now)
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  const past = assessments
    .filter((a) => +new Date(a.dueDate) < now)
    .sort((a, b) => +new Date(b.dueDate) - +new Date(a.dueDate));

  return [
    { label: "Coming up", items: upcoming },
    { label: "Already written", items: past },
  ].filter((g) => g.items.length > 0);
}

function dueLabel(a: Assessment) {
  const due = new Date(a.dueDate);
  const days = Math.round((+due - Date.now()) / 86_400_000);
  const date = due.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
  if (days < 0) return `written ${date}`;
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due ${date}, ${days} days away`;
}

function GenerateTestDialog({
  open,
  onClose,
  assessments,
  isTertiary,
  unitNoun,
  nameForUnit,
  defaultAssessmentId,
  generation,
}: {
  open: boolean;
  onClose: () => void;
  // Every assessment on the student's profile, past and upcoming. This is the
  // whole menu: practice exists to prepare for one of these.
  assessments: Assessment[];
  isTertiary: boolean;
  unitNoun: string;
  nameForUnit: (subjectId: string) => string;
  defaultAssessmentId?: string;
  // Owned by the page, not by this dialog: the dialog only queues the job and
  // gets out of the way. The banner behind it reports on it from there.
  generation: PracticeGeneration;
}) {
  const [assessmentId, setAssessmentId] = useState(defaultAssessmentId ?? "");
  const [format, setFormat] = useState<PracticeFormat>("multiple_choice");
  const [difficulty, setDifficulty] = useState<"foundation" | "core" | "challenge">("core");
  const [count, setCount] = useState(8);
  const [totalMarks, setTotalMarks] = useState(50);
  const [targetWeak, setTargetWeak] = useState(true);

  const assessment = assessments.find((a) => a.id === assessmentId);
  // The subject is the assessment's. It is never picked separately, because
  // that is exactly how you end up with practice for a course you don't take.
  const subjectId = assessment?.subjectId;

  const isEssay = format === "essay";
  const isFlashcards = format === "flashcards";
  const isExam = format === "exam";
  const countLabel = isFlashcards ? "Cards" : "Questions";

  // Offered formats: the student's level decides what is on the list, the
  // assessment's type decides the order.
  const formats = useMemo(() => {
    const allowed = isTertiary ? FORMATS_FOR_TERTIARY : FORMATS_FOR_SCHOOL;
    const preferred = assessment ? (FORMATS_BY_ASSESSMENT_TYPE[assessment.type] ?? []) : [];
    const ranked = [...allowed].sort((a, b) => {
      const ia = preferred.indexOf(a);
      const ib = preferred.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return ranked;
  }, [isTertiary, assessment]);

  // Keep the chosen format legal: switching to an assessment whose level or
  // type drops the current pick must not leave it selected and unlisted.
  useEffect(() => {
    if (formats.length > 0 && !formats.includes(format)) setFormat(formats[0]);
  }, [formats, format]);

  // Only fetch mastery once an assessment is chosen and we're targeting weak topics.
  const masteryQ = useTopicMastery(targetWeak && subjectId ? subjectId : undefined);

  const weakTopics = useMemo(() => {
    if (!targetWeak || !subjectId) return [];
    return [...(masteryQ.data ?? [])]
      .filter((t) => t.subjectId === subjectId)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4)
      .map((t) => t.topic);
  }, [masteryQ.data, targetWeak, subjectId]);

  // True only for the moment the POST is in flight. Queuing is fast, which is
  // the whole point: the wait that used to live here now lives on the server.
  const isQueuing = generation.phase === "starting";
  // Something of the student's is already generating. Queuing a second one
  // would only sit behind it and cost them another generation.
  const alreadyRunning = generation.isWorking && !isQueuing;

  function handleClose() {
    if (isQueuing) return;
    onClose();
  }

  function submit() {
    if (!assessmentId || alreadyRunning) return;
    generation.start({
      assessmentId,
      format,
      difficulty,
      questionCount: count,
      totalMarks: isExam ? totalMarks : undefined,
      topics: weakTopics.length > 0 ? weakTopics : undefined,
    });
  }

  // Close as soon as the job is on the queue. The banner takes over from here,
  // which is what lets the student walk away from the page.
  useEffect(() => {
    if (open && generation.job && generation.isWorking && !isQueuing) onClose();
  }, [open, generation.job, generation.isWorking, isQueuing, onClose]);

  const errMsg = generation.phase === "failed" ? generation.error : null;

  const noMasteryYet = targetWeak && !!subjectId && !masteryQ.isLoading && weakTopics.length === 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>Generate a practice test</DialogTitle>
      <DialogContent>
        {isQueuing ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
            {/* Filled tiles are a graphical object, so they need 3:1. Citron
                only reaches 1.4:1 on light paper, which made the spinner
                invisible in light mode. */}
            <CubeSpinner color="primary" sx={{ fontSize: 44 }} />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Queuing your test. This closes in a second and keeps going without you.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              select
              label="Practising for"
              value={assessmentId}
              onChange={(e) => setAssessmentId(e.target.value)}
              fullWidth
              required
              helperText={
                assessment
                  ? `${nameForUnit(assessment.subjectId)} · ${dueLabel(assessment)}`
                  : `Every test is built for one of your ${unitNoun === "course" ? "course" : "subject"} assessments.`
              }
            >
              {groupAssessments(assessments).map((group) => [
                <ListSubheader key={group.label}>{group.label}</ListSubheader>,
                ...group.items.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.title}
                  </MenuItem>
                )),
              ])}
            </TextField>

            <TextField
              select
              label="Type"
              value={format}
              onChange={(e) => setFormat(e.target.value as PracticeFormat)}
              fullWidth
              disabled={!assessment}
              helperText={FORMAT_HELP[format]}
            >
              {formats.map((f) => (
                <MenuItem key={f} value={f}>
                  {FORMAT_LABELS[f]}
                </MenuItem>
              ))}
            </TextField>

            {isExam && (
              <TextField
                select
                label="Paper length"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                fullWidth
                helperText="You get one attempt, timed at a minute a mark."
              >
                {PAPER_SIZES.map((s) => (
                  <MenuItem key={s.marks} value={s.marks}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {!isEssay && (
              <TextField
                select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                fullWidth
              >
                <MenuItem value="foundation">Foundation: recall and basics</MenuItem>
                <MenuItem value="core">Core: standard exam level</MenuItem>
                <MenuItem value="challenge">Challenge: multi-step analysis</MenuItem>
              </TextField>
            )}

            {!isEssay && !isExam && (
              <TextField
                select
                label={countLabel}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                fullWidth
              >
                {[5, 8, 10, 12, 15].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} {countLabel.toLowerCase()}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={targetWeak}
                  onChange={(e) => setTargetWeak(e.target.checked)}
                  color="secondary"
                />
              }
              label="Target my weakest topics"
            />

            {targetWeak && weakTopics.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                  Focusing on
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {weakTopics.map((t) => (
                    <Chip key={t} label={t} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}

            {noMasteryYet && (
              <Alert severity="info">
                No mastery data for this subject yet, so we&apos;ll generate a general test. Complete a
                few questions to unlock weak-topic targeting.
              </Alert>
            )}

            {alreadyRunning && (
              <Alert severity="info">
                One test is already being written. It will appear in your list when it is done,
                and you can start another after that.
              </Alert>
            )}

            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={isQueuing}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={!assessmentId || isQueuing || alreadyRunning}
          startIcon={!isQueuing && <AutoAwesomeIcon />}
        >
          {isQueuing ? "Queuing…" : "Generate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── List ──────────────────────────────────────────────────────────────

function PracticeList({
  tests,
  units,
  unitNoun,
  assessments,
}: {
  tests: PracticeTest[];
  units: StudyUnit[];
  unitNoun: string;
  assessments: Assessment[];
}) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const unitName = (id: string) => units.find((u) => u.id === id)?.name;
  const assessmentTitle = (id?: string | null) =>
    id ? assessments.find((a) => a.id === id)?.title : undefined;

  const filtered = tests.filter(
    (p) =>
      (subjectFilter === "all" || p.subjectId === subjectFilter) &&
      (difficultyFilter === "all" || p.difficulty === difficultyFilter),
  );

  const isCourse = unitNoun === "course";

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        {units.length > 1 && (
          <TextField
            select
            size="small"
            label={isCourse ? "Course" : "Subject"}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">{isCourse ? "All courses" : "All subjects"}</MenuItem>
            {units.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          select
          size="small"
          label="Difficulty"
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All levels</MenuItem>
          <MenuItem value="foundation">Foundation</MenuItem>
          <MenuItem value="core">Core</MenuItem>
          <MenuItem value="challenge">Challenge</MenuItem>
        </TextField>
      </Stack>

      {filtered.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No practice tests match those filters.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <PracticeCard
                test={p}
                unitName={unitName(p.subjectId)}
                assessmentTitle={assessmentTitle(p.assessmentId)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

function PracticeCard({
  test: p,
  unitName,
  assessmentTitle,
}: {
  test: PracticeTest;
  unitName?: string;
  assessmentTitle?: string;
}) {
  // A graded test is taken once. Once attempted, the card links to its
  // results instead of restarting it. Both paths open in the workspace,
  // which is where a test is actually taken and reviewed.
  const completed = p.attempts > 0;
  const format = (p.format ?? "multiple_choice") as PracticeFormat;
  const scored = SCORED_FORMATS.includes(format);
  const isCards = format === "flashcards";
  const isEssay = format === "essay";
  const startLabel = isEssay
    ? "Write"
    : isCards
      ? "Study"
      : completed
        ? "View result"
        : format === "exam"
          ? "Sit the paper"
          : "Start";
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Chip label={FORMAT_LABELS[format]} size="small" color="secondary" variant="outlined" />
            {scored && (
              <Chip
                label={p.difficulty}
                size="small"
                color={p.difficulty === "challenge" ? "warning" : p.difficulty === "core" ? "primary" : "default"}
                sx={{ textTransform: "capitalize" }}
              />
            )}
          </Stack>
          {p.aiGenerated && <Chip icon={<AutoAwesomeIcon />} label="AI" size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {p.title}
        </Typography>
        {/* What this test is for. A student with six tests on the page needs to
            know which assessment each one is preparing them for, not just which
            subject it came from. */}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
          {assessmentTitle ? `${unitName} · for ${assessmentTitle}` : unitName}
        </Typography>
        {isEssay ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            A prompt with marking criteria. Write it and the tutor gives feedback.
          </Typography>
        ) : (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {isCards ? "Cards" : "Questions"}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {p.questionCount}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Time
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {p.durationMinutes}m
              </Typography>
            </Box>
            {scored && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Attempts
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {p.attempts}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
        {p.bestScore != null && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Best score
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {p.bestScore}%
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={p.bestScore} color="primary" />
          </Box>
        )}
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
          {p.topics.map((t) => (
            <Chip key={t} label={t} size="small" variant="outlined" />
          ))}
        </Stack>
        <Box sx={{ mt: "auto" }}>
          <Button
            component={Link}
            href={testHref(p)}
            variant={completed && scored ? "outlined" : "contained"}
            fullWidth
          >
            {startLabel}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
