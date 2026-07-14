"use client";

import { useMemo, useState } from "react";
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
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/QuizOutlined";
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
  useGenerateTest,
  useTopicMastery,
  type PracticeFormat,
} from "@/lib/api/queries";
import type { PracticeTest } from "@/lib/mockData";

// A study unit the generator + list filter target: a CAPS subject (high
// school) or an enrolled course (tertiary), unified to { id, name } where
// id is the practice key that tests are keyed on.
type StudyUnit = { id: string; name: string };

export default function PracticePage() {
  const testsQuery = usePracticeTests();
  const subjectsQuery = useSubjects();
  const coursesQuery = useCourses();
  const profileQuery = useAcademicProfile();
  const searchParams = useSearchParams();
  const [genOpen, setGenOpen] = useState(false);

  const isTertiary = profileQuery.data?.educationLevel === "tertiary";
  const unitNoun = isTertiary ? "course" : "subject";

  // What the generator + list can target: courses (tertiary) or subjects
  // (high school). id is the practice key generation, mastery, and every
  // PracticeTest.subjectId are keyed on. A uni student never sees CAPS
  // subjects here; they see the courses they enrolled in.
  const units: StudyUnit[] = isTertiary
    ? (coursesQuery.data ?? []).map((c) => ({ id: c.practiceKey, name: c.name }))
    : (subjectsQuery.data ?? []).map((s) => ({ id: s.subjectId, name: s.name }));

  const defaultSubjectId = searchParams.get("subject") ?? undefined;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Practice tests"
        description="AI-generated drills aligned to your weakest topics, plus any set for your SBAs."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Practice" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setGenOpen(true)}
            disabled={units.length === 0}
          >
            Generate a test
          </Button>
        }
      />

      <QueryStates
        query={testsQuery}
        empty={{
          icon: <QuizIcon />,
          title: "No practice tests yet",
          description: `Generate one targeted at your weakest topics, or add your ${unitNoun}s so tests can be matched to them.`,
          action: (
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setGenOpen(true)}
              disabled={units.length === 0}
            >
              Generate a test
            </Button>
          ),
        }}
      >
        {(tests) => <PracticeList tests={tests} units={units} unitNoun={unitNoun} />}
      </QueryStates>

      <GenerateTestDialog
        open={genOpen}
        onClose={() => setGenOpen(false)}
        options={units}
        unitNoun={unitNoun}
        defaultSubjectId={defaultSubjectId}
      />
    </AtmosphericBackdrop>
  );
}

// ── Generation dialog ─────────────────────────────────────────────────

const FORMAT_HELP: Record<PracticeFormat, string> = {
  multiple_choice: "Four options, one correct. Timed and auto-marked.",
  short_answer: "Type a brief answer, marked against the expected answer.",
  reading: "A passage with questions that test your understanding of it.",
  flashcards: "Flip cards and rate yourself. Not scored, retake anytime.",
  essay: "A prompt with marking criteria. Write it and the tutor gives feedback.",
};

const FORMAT_LABELS: Record<PracticeFormat, string> = {
  multiple_choice: "Multiple choice",
  short_answer: "Short answer",
  reading: "Reading",
  flashcards: "Flashcards",
  essay: "Essay",
};

const SCORED_FORMATS: PracticeFormat[] = ["multiple_choice", "short_answer", "reading"];

function GenerateTestDialog({
  open,
  onClose,
  options,
  unitNoun,
  defaultSubjectId,
}: {
  open: boolean;
  onClose: () => void;
  // id is the practice key: a CAPS subject slug (HS) or a course
  // practiceKey "institution:slug" (tertiary).
  options: StudyUnit[];
  unitNoun: string;
  defaultSubjectId?: string;
}) {
  const router = useRouter();
  const gen = useGenerateTest();
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [format, setFormat] = useState<PracticeFormat>("multiple_choice");
  const [difficulty, setDifficulty] = useState<"foundation" | "core" | "challenge">("core");
  const [count, setCount] = useState(8);
  const [targetWeak, setTargetWeak] = useState(true);

  const isEssay = format === "essay";
  const isFlashcards = format === "flashcards";
  const countLabel = isFlashcards ? "Cards" : "Questions";

  // Only fetch mastery once a subject is chosen and we're targeting weak topics.
  const masteryQ = useTopicMastery(targetWeak && subjectId ? subjectId : undefined);

  const weakTopics = useMemo(() => {
    if (!targetWeak || !subjectId) return [];
    return [...(masteryQ.data ?? [])]
      .filter((t) => t.subjectId === subjectId)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 4)
      .map((t) => t.topic);
  }, [masteryQ.data, targetWeak, subjectId]);

  function handleClose() {
    if (gen.isPending) return;
    gen.reset();
    onClose();
  }

  function submit() {
    if (!subjectId) return;
    gen.mutate(
      {
        subjectId,
        format,
        difficulty,
        questionCount: count,
        topics: weakTopics.length > 0 ? weakTopics : undefined,
      },
      {
        onSuccess: (test) => {
          gen.reset();
          onClose();
          router.push(`/dashboard/workspace?test=${test.id}`);
        },
      },
    );
  }

  const errMsg = gen.error
    ? gen.error.status === 402
      ? "You've used this month's practice-test generations. Upgrade your plan for more."
      : gen.error.status === 503
        ? "AI generation isn't available on this environment right now."
        : "The generator had trouble. Please try again."
    : null;

  const noMasteryYet = targetWeak && !!subjectId && !masteryQ.isLoading && weakTopics.length === 0;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>Generate a practice test</DialogTitle>
      <DialogContent>
        {gen.isPending ? (
          <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
            <CubeSpinner color="secondary" sx={{ fontSize: 44 }} />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              Writing and checking your questions. This takes a few seconds.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <TextField
              select
              label={unitNoun === "course" ? "Course" : "Subject"}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              fullWidth
              required
            >
              {options.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Type"
              value={format}
              onChange={(e) => setFormat(e.target.value as PracticeFormat)}
              fullWidth
              helperText={FORMAT_HELP[format]}
            >
              <MenuItem value="multiple_choice">Multiple choice</MenuItem>
              <MenuItem value="short_answer">Short answer</MenuItem>
              <MenuItem value="reading">Reading comprehension</MenuItem>
              <MenuItem value="flashcards">Flashcards</MenuItem>
              <MenuItem value="essay">Essay + criteria</MenuItem>
            </TextField>

            {!isEssay && (
              <TextField
                select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                fullWidth
              >
                <MenuItem value="foundation">Foundation — recall and basics</MenuItem>
                <MenuItem value="core">Core — standard exam level</MenuItem>
                <MenuItem value="challenge">Challenge — multi-step analysis</MenuItem>
              </TextField>
            )}

            {!isEssay && (
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

            {errMsg && <Alert severity="error">{errMsg}</Alert>}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={gen.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={!subjectId || gen.isPending}
          startIcon={!gen.isPending && <AutoAwesomeIcon />}
        >
          {gen.isPending ? "Generating…" : "Generate"}
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
}: {
  tests: PracticeTest[];
  units: StudyUnit[];
  unitNoun: string;
}) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const unitName = (id: string) => units.find((u) => u.id === id)?.name;

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
              <PracticeCard test={p} unitName={unitName(p.subjectId)} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

function PracticeCard({ test: p, unitName }: { test: PracticeTest; unitName?: string }) {
  // A graded test is taken once. Once attempted, the card links to its
  // results instead of restarting it. Both paths open in the workspace,
  // which is where a test is actually taken and reviewed.
  const completed = p.attempts > 0;
  const format = (p.format ?? "multiple_choice") as PracticeFormat;
  const scored = SCORED_FORMATS.includes(format);
  const isCards = format === "flashcards";
  const isEssay = format === "essay";
  const startLabel = isEssay ? "Write" : isCards ? "Study" : completed ? "View result" : "Start";
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
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
          {unitName}
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
            href={`/dashboard/workspace?test=${p.id}`}
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
