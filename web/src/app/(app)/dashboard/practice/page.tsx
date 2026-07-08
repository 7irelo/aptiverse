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
import GpsFixedIcon from "@mui/icons-material/GpsFixedOutlined";
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
} from "@/lib/api/queries";
import type { PracticeTest, Subject } from "@/lib/mockData";

export default function PracticePage() {
  const testsQuery = usePracticeTests();
  const subjectsQuery = useSubjects();
  const coursesQuery = useCourses();
  const profileQuery = useAcademicProfile();
  const searchParams = useSearchParams();
  const [genOpen, setGenOpen] = useState(false);

  const subjects = subjectsQuery.data ?? [];
  const isTertiary = profileQuery.data?.educationLevel === "tertiary";

  // What the generator can target: courses (tertiary) or subjects (HS). id is
  // the practice key generation + mastery are keyed on.
  const genOptions = isTertiary
    ? (coursesQuery.data ?? []).map((c) => ({ id: c.practiceKey, name: c.name }))
    : subjects.map((s) => ({ id: s.subjectId, name: s.name }));

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
            disabled={genOptions.length === 0}
          >
            Generate a test
          </Button>
        }
      />

      <Card sx={{ mb: 3, bgcolor: "brandSurface.main", color: "brandSurface.contrastText" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <GpsFixedIcon sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.85 }}>
                  Target your weakest
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Generate a test aimed at your lowest topics
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.92 }}>
                  Claude writes questions on the topics you&apos;re scoring lowest on, with worked
                  explanations. Each attempt sharpens your mastery signal.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button component={Link} href="/dashboard/mastery" color="inherit" sx={{ opacity: 0.9 }}>
                View weak topics
              </Button>
              <Button
                color="secondary"
                variant="contained"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => setGenOpen(true)}
                disabled={genOptions.length === 0}
              >
                Generate
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <QueryStates
        query={testsQuery}
        empty={{
          icon: <QuizIcon />,
          title: "No practice tests yet",
          description:
            "Generate one targeted at your weakest topics, or add your subjects so tests can be matched to them.",
          action: (
            <Button
              variant="contained"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => setGenOpen(true)}
              disabled={genOptions.length === 0}
            >
              Generate a test
            </Button>
          ),
        }}
      >
        {(tests) => <PracticeList tests={tests} subjects={subjects} />}
      </QueryStates>

      <GenerateTestDialog open={genOpen} onClose={() => setGenOpen(false)} options={genOptions} defaultSubjectId={defaultSubjectId} />
    </AtmosphericBackdrop>
  );
}

// ── Generation dialog ─────────────────────────────────────────────────

function GenerateTestDialog({
  open,
  onClose,
  options,
  defaultSubjectId,
}: {
  open: boolean;
  onClose: () => void;
  // id is the practice key: a CAPS subject slug (HS) or a course
  // practiceKey "institution:slug" (tertiary).
  options: { id: string; name: string }[];
  defaultSubjectId?: string;
}) {
  const router = useRouter();
  const gen = useGenerateTest();
  const [subjectId, setSubjectId] = useState(defaultSubjectId ?? "");
  const [difficulty, setDifficulty] = useState<"foundation" | "core" | "challenge">("core");
  const [count, setCount] = useState(8);
  const [targetWeak, setTargetWeak] = useState(true);

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
        difficulty,
        questionCount: count,
        topics: weakTopics.length > 0 ? weakTopics : undefined,
      },
      {
        onSuccess: (test) => {
          gen.reset();
          onClose();
          router.push(`/dashboard/practice/${test.id}`);
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
              label="Subject"
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
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
              fullWidth
            >
              <MenuItem value="foundation">Foundation — recall and basics</MenuItem>
              <MenuItem value="core">Core — standard exam level</MenuItem>
              <MenuItem value="challenge">Challenge — multi-step analysis</MenuItem>
            </TextField>

            <TextField
              select
              label="Questions"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              fullWidth
            >
              {[5, 8, 10, 12, 15].map((n) => (
                <MenuItem key={n} value={n}>
                  {n} questions
                </MenuItem>
              ))}
            </TextField>

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

function PracticeList({ tests, subjects }: { tests: PracticeTest[]; subjects: Subject[] }) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filtered = tests.filter(
    (p) =>
      (subjectFilter === "all" || p.subjectId === subjectFilter) &&
      (difficultyFilter === "all" || p.difficulty === difficultyFilter),
  );

  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          select
          size="small"
          label="Subject"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">All subjects</MenuItem>
          {subjects.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
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
              <PracticeCard test={p} subject={subjects.find((s) => s.id === p.subjectId)} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

function PracticeCard({ test: p, subject }: { test: PracticeTest; subject?: Subject }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={p.difficulty}
            size="small"
            color={p.difficulty === "challenge" ? "warning" : p.difficulty === "core" ? "primary" : "default"}
            sx={{ textTransform: "capitalize" }}
          />
          {p.aiGenerated && <Chip icon={<AutoAwesomeIcon />} label="AI" size="small" variant="outlined" />}
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {p.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
          {subject?.name}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Questions
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
          <Box>
            <Typography variant="caption" color="text.secondary">
              Attempts
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {p.attempts}
            </Typography>
          </Box>
        </Stack>
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
          <Button component={Link} href={`/dashboard/practice/${p.id}`} variant="contained" fullWidth>
            Start
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
