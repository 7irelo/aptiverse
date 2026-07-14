"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import GlobalStyles from "@mui/material/GlobalStyles";
import { alpha, useTheme } from "@mui/material/styles";
import { RadarChart } from "@mui/x-charts/RadarChart";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Printer,
  Clock,
  ShieldAlert,
  Bot,
  ListChecks,
  Pause,
  Play,
  TrendingUp,
  Target,
} from "lucide-react";
import { CardError } from "@/components/common/CardError";
import { Logo } from "@/components/common/Logo";
import { ProgressRing } from "@/components/common/ProgressRing";
import { Markdown } from "@/components/common/Markdown";
import { MathText } from "./MathText";
import {
  usePracticeTest,
  usePracticeQuestions,
  useStartAttempt,
  useSubmitAttempt,
  useLatestAttempt,
  useAiTutor,
  type PracticeQuestion,
  type PracticeAnswerItem,
  type PracticeAttemptResult,
} from "@/lib/api/queries";
import type { PracticeTest } from "@/lib/mockData";

function fmt(sec: number): string {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// The interactive test-taking surface: shows the ground rules, runs a timed
// attempt one question at a time (tab-focus monitored, like an online exam),
// submits for scoring, then shows results with a per-topic breakdown and a
// full review.
//
// Page chrome (backdrop, page header) is the caller's job, so this renders
// unchanged both standalone (/dashboard/practice/[id]) and embedded (the
// workspace Practice tab). Pass `onExit` when embedded so the results screen
// returns to the caller's list instead of routing away.
export function PracticeRunner({
  testId,
  onExit,
}: {
  testId: string;
  onExit?: () => void;
}) {
  const testQuery = usePracticeTest(testId);
  const questionsQuery = usePracticeQuestions(testId);
  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);

  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();

  const [started, setStarted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  // Typed answers for short-answer / reading-short questions, keyed by
  // question id, alongside the MC `answers` selection map.
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [timeMs, setTimeMs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);

  const format = testQuery.data?.format ?? "multiple_choice";
  const passage = testQuery.data?.passage ?? null;

  // Timing + proctoring. The countdown is seeded from the test's own
  // durationMinutes; the server's StartedAt/SubmittedAt remain the
  // authoritative record. focusLosses counts every time the student leaves
  // the tab while unpaused — reported to the backend at submit.
  const durationMin = testQuery.data?.durationMinutes ?? 0;
  const timed = durationMin > 0;
  const [remainingSec, setRemainingSec] = useState(0);
  const [paused, setPaused] = useState(false);
  const [focusLosses, setFocusLosses] = useState(0);
  const [warnOpen, setWarnOpen] = useState(false);

  const shownAtRef = useRef(0);
  const submittedRef = useRef(false);
  const lastViolationRef = useRef(0);
  const printingRef = useRef(0);

  const q = questions[current];
  const title = testQuery.data?.title ?? "Practice test";
  const loading = testQuery.isLoading || questionsQuery.isLoading;
  const isError = testQuery.isError || questionsQuery.isError;

  // Accrue elapsed time onto the question the student is leaving.
  function flush(questionId: string) {
    const now = Date.now();
    const delta = Math.max(0, now - shownAtRef.current);
    shownAtRef.current = now;
    setTimeMs((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + delta }));
  }

  function goTo(next: number) {
    if (q) flush(q.id);
    setCurrent(next);
  }

  const begin = () => {
    if (questions.length === 0 || started) return;
    setStarted(true);
    shownAtRef.current = Date.now();
    setRemainingSec(timed ? durationMin * 60 : 0);
    startAttempt.mutate(testId, { onSuccess: (a) => setAttemptId(a.id) });
  };

  const doSubmit = useCallback(async () => {
    if (submittedRef.current || !attemptId) return;
    submittedRef.current = true;
    // Fold in the time on the question in view without waiting for a setState.
    const cur = questions[current];
    const extra: Record<string, number> = {};
    if (cur) extra[cur.id] = Math.max(0, Date.now() - shownAtRef.current);
    const answerItems: PracticeAnswerItem[] = questions.map((question) => {
      const isShort = question.kind === "short";
      return {
        questionId: question.id,
        selectedIdx: isShort ? -1 : (answers[question.id] ?? -1),
        textAnswer: isShort ? (textAnswers[question.id] ?? "") : undefined,
        timeMs: (timeMs[question.id] ?? 0) + (extra[question.id] ?? 0),
      };
    });
    try {
      const res = await submitAttempt.mutateAsync({
        attemptId,
        answerItems,
        focusLossCount: focusLosses,
      });
      setResult(res);
    } catch {
      // Let the student retry; surfaced via submitAttempt.isError.
      submittedRef.current = false;
    }
  }, [attemptId, questions, current, answers, textAnswers, timeMs, focusLosses, submitAttempt]);

  // Countdown — pauses with the student, stops once results are in.
  useEffect(() => {
    if (!started || paused || result || !timed) return;
    const id = setInterval(() => {
      setRemainingSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [started, paused, result, timed]);

  // Time's up → auto-submit (once).
  useEffect(() => {
    if (started && timed && remainingSec === 0 && attemptId && !submittedRef.current && !result) {
      void doSubmit();
    }
  }, [started, timed, remainingSec, attemptId, result, doSubmit]);

  // Focus monitoring. While the attempt is live and unpaused, leaving the tab
  // (or minimising / switching windows) is recorded. A short dedupe window
  // collapses the blur+visibilitychange pair browsers fire together, and a
  // print guard keeps window.print() from registering as a violation.
  useEffect(() => {
    if (!started || paused || result) return;
    const bump = () => {
      const now = Date.now();
      if (now - printingRef.current < 2000) return;
      if (now - lastViolationRef.current < 800) return;
      lastViolationRef.current = now;
      setFocusLosses((n) => n + 1);
      setWarnOpen(true);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") bump();
    };
    window.addEventListener("blur", bump);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", bump);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [started, paused, result]);

  const handlePrint = () => {
    printingRef.current = Date.now();
    window.print();
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ py: 6 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
            Loading your questions…
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <CardError
            onRetry={() => {
              void testQuery.refetch();
              void questionsQuery.refetch();
            }}
            what="this practice test"
          />
        </CardContent>
      </Card>
    );
  }

  // Essay is prompt-only (no questions), feedback-only via the tutor. Branch
  // before the empty-questions guard, which would otherwise reject it.
  if (format === "essay" && testQuery.data) {
    return <EssayView test={testQuery.data} onExit={onExit} />;
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            This test has no questions yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Flashcards flip + self-rate; they aren't scored and can be retaken, so
  // they skip the attempt/instructions/results machinery entirely.
  if (format === "flashcards") {
    return <FlashcardsView title={title} cards={questions} onExit={onExit} />;
  }

  if (result?.summary) {
    return (
      <ResultsView
        title={title}
        result={result}
        questions={questions}
        answers={answers}
        textAnswers={textAnswers}
        onExit={onExit}
      />
    );
  }

  // A graded test is taken once. If the student has already submitted an
  // attempt (attempts > 0 from the server), don't let them retake it — show
  // their results instead, with print + regenerate.
  const alreadyCompleted = (testQuery.data?.attempts ?? 0) > 0;
  if (alreadyCompleted && !started) {
    return (
      <CompletedView
        testId={testId}
        title={title}
        bestScore={testQuery.data?.bestScore}
        questions={questions}
        onExit={onExit}
      />
    );
  }

  if (!started) {
    return (
      <InstructionsView
        title={title}
        format={format}
        durationMin={durationMin}
        questionCount={questions.length}
        onBegin={begin}
        onExit={onExit}
      />
    );
  }

  const answeredCount = questions.filter((qq) =>
    qq.kind === "short"
      ? !!textAnswers[qq.id]?.trim()
      : answers[qq.id] != null && answers[qq.id] >= 0,
  ).length;

  return (
    <>
      <RunnerView
        title={title}
        q={q}
        passage={passage}
        index={current}
        total={questions.length}
        answeredCount={answeredCount}
        selected={q ? answers[q.id] : undefined}
        textValue={q?.kind === "short" ? (textAnswers[q.id] ?? "") : ""}
        onSelect={(idx) => q && setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
        onText={(v) => q && setTextAnswers((prev) => ({ ...prev, [q.id]: v }))}
        onPrev={() => goTo(Math.max(0, current - 1))}
        onNext={() => goTo(Math.min(questions.length - 1, current + 1))}
        onSubmit={doSubmit}
        submitting={submitAttempt.isPending}
        startFailed={startAttempt.isError}
        submitFailed={submitAttempt.isError}
        canSubmit={!!attemptId}
        onPrint={handlePrint}
        timed={timed}
        remainingSec={remainingSec}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        focusLosses={focusLosses}
        warnOpen={warnOpen}
        onDismissWarn={() => setWarnOpen(false)}
      />
      <PrintLayer title={title} questions={questions} />
    </>
  );
}

// ── already completed ─────────────────────────────────────────────────

function CompletedView({
  testId,
  title,
  bestScore,
  questions,
  onExit,
}: {
  testId: string;
  title: string;
  bestScore?: number;
  questions: PracticeQuestion[];
  onExit?: () => void;
}) {
  const latest = useLatestAttempt(testId);
  const attempt = latest.data;

  // The full result (their answers, correct answers, explanations) once the
  // past attempt loads. Reuses the same review the just-finished screen shows.
  if (attempt?.summary) {
    const answers: Record<string, number> = {};
    const textAnswers: Record<string, string> = {};
    for (const ai of attempt.answerItems ?? []) {
      answers[ai.questionId] = ai.selectedIdx;
      if (ai.textAnswer != null) textAnswers[ai.questionId] = ai.textAnswer;
    }
    return (
      <ResultsView
        title={title}
        result={attempt}
        questions={questions}
        answers={answers}
        textAnswers={textAnswers}
        onExit={onExit}
      />
    );
  }

  // Fallback: still loading, or the review endpoint isn't available yet. Show
  // the completed summary with print + regenerate so the student isn't stuck.
  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2} alignItems="flex-start">
            <Box component={CheckCircle2} sx={{ width: 34, height: 34, color: "success.main" }} />
            <Box>
              <Typography variant="overline" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480 }}>
              You&apos;ve already taken this test
              {typeof bestScore === "number" ? `, scoring ${bestScore}%` : ""}. A graded test can only be
              taken once. Print it to practise on paper, or generate a fresh test to try new questions.
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button onClick={() => window.print()} startIcon={<Printer size={16} />} variant="outlined">
                Print test
              </Button>
              <Button component={Link} href="/dashboard/practice" variant="contained" color="secondary">
                Generate a new test
              </Button>
              {onExit && (
                <Button onClick={onExit} color="inherit">
                  Back to tests
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <PrintLayer title={title} questions={questions} />
    </>
  );
}

// ── instructions / consent ────────────────────────────────────────────

function InstructionsView({
  title,
  format,
  durationMin,
  questionCount,
  onBegin,
  onExit,
}: {
  title: string;
  format: string;
  durationMin: number;
  questionCount: number;
  onBegin: () => void;
  onExit?: () => void;
}) {
  const timed = durationMin > 0;
  const formatBody =
    format === "short_answer"
      ? "Short answer. Type a brief response to each; move back and forth and edit freely before you submit."
      : format === "reading"
        ? "Read the passage, then answer its questions (some multiple choice, some short answer). Move back and forth freely before you submit."
        : "Multiple choice. Move back and forth and change answers freely before you submit.";
  const rules: { icon: typeof Clock; title: string; body: string }[] = [
    {
      icon: Clock,
      title: timed ? `Timed: ${durationMin} minutes` : "Untimed",
      body: timed
        ? "The clock starts when you begin and the test submits automatically when time runs out. Pause if you need a break."
        : "Work at your own pace. You can pause any time.",
    },
    {
      icon: ShieldAlert,
      title: "Stay on this tab",
      body: "Switching tabs or apps during the test is recorded. If you need to step away, pause first.",
    },
    {
      icon: Bot,
      title: "No AI tutor",
      body: "The AI tutor is turned off while the test is running.",
    },
    {
      icon: ListChecks,
      title: `${questionCount} ${questionCount === 1 ? "question" : "questions"}`,
      body: formatBody,
    },
  ];

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="overline" color="text.secondary">
          Before you start
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Read the ground rules, then begin when you&apos;re ready.
        </Typography>

        <Stack spacing={2}>
          {rules.map((r, i) => (
            <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1.5,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: (t) =>
                    t.palette.mode === "dark" ? "rgba(116,181,174,0.12)" : "rgba(15,105,99,0.08)",
                }}
              >
                <Box component={r.icon} sx={{ width: 18, height: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {r.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {r.body}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
          <Button onClick={onBegin} variant="contained" color="secondary" size="large">
            Start test
          </Button>
          {onExit && (
            <Button onClick={onExit} color="inherit">
              Cancel
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── runner ────────────────────────────────────────────────────────────

function RunnerView({
  title,
  q,
  passage,
  index,
  total,
  answeredCount,
  selected,
  textValue,
  onSelect,
  onText,
  onPrev,
  onNext,
  onSubmit,
  submitting,
  startFailed,
  submitFailed,
  canSubmit,
  onPrint,
  timed,
  remainingSec,
  paused,
  onTogglePause,
  focusLosses,
  warnOpen,
  onDismissWarn,
}: {
  title: string;
  q: PracticeQuestion | undefined;
  passage: string | null;
  index: number;
  total: number;
  answeredCount: number;
  selected: number | undefined;
  textValue: string;
  onSelect: (idx: number) => void;
  onText: (v: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
  startFailed: boolean;
  submitFailed: boolean;
  canSubmit: boolean;
  onPrint: () => void;
  timed: boolean;
  remainingSec: number;
  paused: boolean;
  onTogglePause: () => void;
  focusLosses: number;
  warnOpen: boolean;
  onDismissWarn: () => void;
}) {
  if (!q) return null;
  const isLast = index === total - 1;
  const progress = Math.round(((index + 1) / total) * 100);
  const low = timed && !paused && remainingSec <= 60;

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
            {timed && (
              <Chip
                icon={<Box component={Clock} sx={{ width: 15, height: 15, ml: 0.75 }} />}
                label={paused ? "Paused" : fmt(remainingSec)}
                size="small"
                color={low ? "error" : "default"}
                variant={low ? "filled" : "outlined"}
                sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}
              />
            )}
            <Tooltip title={paused ? "Resume" : "Pause"}>
              <IconButton size="small" onClick={onTogglePause} aria-label={paused ? "Resume" : "Pause"}>
                <Box component={paused ? Play : Pause} sx={{ width: 18, height: 18 }} />
              </IconButton>
            </Tooltip>
            <Button
              onClick={onPrint}
              startIcon={<Printer size={16} />}
              size="small"
              color="inherit"
              sx={{ flexShrink: 0, color: "text.secondary" }}
            >
              Print
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
            Question {index + 1} of {total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {answeredCount}/{total} answered
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: warnOpen ? 2 : 3, borderRadius: 999 }} />

        {warnOpen && (
          <Alert severity="warning" onClose={onDismissWarn} sx={{ mb: 2 }}>
            You left the test.{" "}
            {focusLosses > 1 ? `This has been recorded ${focusLosses} times. ` : "This has been recorded. "}
            Stay on this page, or pause if you need a break.
          </Alert>
        )}

        {paused ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Box component={Pause} sx={{ width: 32, height: 32, color: "text.secondary", mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Test paused
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: "auto", mb: 2 }}>
              The timer is stopped and leaving the tab won&apos;t be recorded. Resume when you&apos;re ready.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={onTogglePause}
              startIcon={<Box component={Play} sx={{ width: 16, height: 16 }} />}
            >
              Resume test
            </Button>
          </Box>
        ) : (
          <>
            {passage && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  maxHeight: 260,
                  overflowY: "auto",
                  borderRadius: 2,
                  border: 1,
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Passage
                </Typography>
                <Typography variant="body2" component="div" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  <MathText text={passage} />
                </Typography>
              </Box>
            )}

            {q.topic && <Chip label={q.topic} size="small" variant="outlined" sx={{ mb: 2 }} />}

            <Typography variant="h6" component="div" sx={{ mb: 3, fontWeight: 600, lineHeight: 1.4 }}>
              <MathText text={q.question} />
            </Typography>

            {q.kind === "short" ? (
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={6}
                placeholder="Type your answer…"
                value={textValue}
                onChange={(e) => onText(e.target.value)}
                autoComplete="off"
              />
            ) : (
              <RadioGroup value={selected ?? -1} onChange={(e) => onSelect(Number(e.target.value))}>
                <Stack spacing={1.25}>
                  {q.options.map((opt, i) => {
                    const active = selected === i;
                    return (
                      <Box
                        key={i}
                        onClick={() => onSelect(i)}
                        sx={{
                          border: 1,
                          borderColor: active ? "secondary.main" : "divider",
                          bgcolor: (t) => (active ? alpha(t.palette.secondary.main, 0.12) : "transparent"),
                          borderRadius: 2,
                          px: 2,
                          py: 0.5,
                          cursor: "pointer",
                          transition: "border-color 140ms ease, background-color 140ms ease",
                        }}
                      >
                        <FormControlLabel
                          value={i}
                          control={<Radio color="secondary" />}
                          label={<MathText text={opt} />}
                          sx={{ width: "100%", m: 0, py: 0.5 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </RadioGroup>
            )}

            {startFailed && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                We couldn&apos;t start this attempt, so it can&apos;t be scored. Reload and try again.
              </Alert>
            )}
            {submitFailed && (
              <Alert severity="error" sx={{ mt: 3 }}>
                Submitting failed. Check your connection and try again.
              </Alert>
            )}

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
              <Button onClick={onPrev} disabled={index === 0} startIcon={<ArrowLeft size={18} />} color="inherit">
                Back
              </Button>
              {isLast ? (
                <Button onClick={onSubmit} variant="contained" color="secondary" disabled={submitting || !canSubmit}>
                  {submitting ? "Scoring…" : "Submit & score"}
                </Button>
              ) : (
                <Button onClick={onNext} variant="contained" endIcon={<ArrowRight size={18} />}>
                  Next
                </Button>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── results ───────────────────────────────────────────────────────────

// One "Strongest" / "Focus on" takeaway: a tinted icon tile, an uppercase
// label, and the topic with its score. Turns the radar into a sentence so
// the student does not have to read the shape to know what to do next.
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

// Client-side mirror of the backend's normalized short-answer match, used
// only to mark the per-question review (the score totals come from the
// server). Lowercases, strips punctuation, and collapses whitespace.
function normAns(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function shortCorrect(given: string, q: PracticeQuestion): boolean {
  const g = normAns(given);
  if (!g) return false;
  const keys = [q.expectedAnswer ?? "", ...(q.acceptableAnswers ?? [])];
  return keys.some((k) => !!k && normAns(k) === g);
}

function ResultsView({
  title,
  result,
  questions,
  answers,
  textAnswers,
  onExit,
}: {
  title?: string;
  result: PracticeAttemptResult;
  questions: PracticeQuestion[];
  answers: Record<string, number>;
  textAnswers?: Record<string, string>;
  onExit?: () => void;
}) {
  const summary = result.summary!;
  const theme = useTheme();
  const pct = summary.scorePercent;
  const ringColor: "success" | "primary" | "warning" =
    pct >= 80 ? "success" : pct >= 50 ? "primary" : "warning";
  const band = pct >= 80 ? "Strong result" : pct >= 50 ? "Solid start" : "Room to grow";

  const topics = summary.perTopic;
  const ranked = [...topics].sort((a, b) => b.percent - a.percent);
  const strongest = ranked[0];
  const focus = ranked.length > 1 ? ranked[ranked.length - 1] : undefined;
  // A radar only reads as a shape with three or more axes; below that it
  // collapses to a line or a point, so fall back to per-topic rings.
  const showRadar = topics.length >= 3;

  const breakdown = [
    { key: "correct", value: summary.correctCount, color: theme.palette.success.main },
    { key: "wrong", value: summary.incorrectCount, color: theme.palette.warning.main },
    { key: "skipped", value: summary.unansweredCount, color: theme.palette.text.disabled },
  ];

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 3, md: 4 }}
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              <ProgressRing value={pct} size={132} thickness={11} color={ringColor} caption={band} />
              <Stack spacing={1.25}>
                {breakdown.map((b) => (
                  <Stack key={b.key} direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: b.color, flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", minWidth: 16 }}>
                      {b.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.key}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>

            {strongest && (
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
                  topic={strongest.topic}
                  percent={strongest.percent}
                />
                {focus && focus.topic !== strongest.topic && (
                  <InsightRow
                    icon={Target}
                    tint={theme.palette.warning.main}
                    label="Focus on"
                    topic={focus.topic}
                    percent={focus.percent}
                  />
                )}
              </Stack>
            )}
          </Stack>

          {topics.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Mastery across topics
              </Typography>
              {showRadar ? (
                <Box sx={{ width: "100%", mx: "auto", maxWidth: 560 }}>
                  <RadarChart
                    height={340}
                    hideLegend
                    radar={{
                      max: 100,
                      metrics: topics.map((t) => t.topic),
                      labelFormatter: (name) =>
                        name.length > 16 ? `${name.slice(0, 15)}…` : name,
                    }}
                    series={[
                      {
                        label: "Mastery",
                        data: topics.map((t) => t.percent),
                        fillArea: true,
                        color: theme.palette.secondary.main,
                      },
                    ]}
                  />
                </Box>
              ) : (
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {topics.map((t) => (
                    <ProgressRing
                      key={t.topic}
                      value={t.percent}
                      size={92}
                      thickness={8}
                      color={t.percent >= 80 ? "success" : t.percent >= 50 ? "primary" : "warning"}
                      caption={t.topic}
                    />
                  ))}
                </Stack>
              )}
            </>
          )}

          <Divider sx={{ my: 3 }} />
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap justifyContent="flex-end">
            <Button onClick={() => window.print()} startIcon={<Printer size={16} />} variant="text" color="inherit">
              Print
            </Button>
            <Button component={Link} href="/dashboard/mastery" variant="outlined">
              See mastery
            </Button>
            {onExit ? (
              <Button onClick={onExit} variant="contained" color="secondary">
                Back to tests
              </Button>
            ) : (
              <Button component={Link} href="/dashboard/practice" variant="contained" color="secondary">
                Back to practice
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Review
          </Typography>
          <Stack spacing={2.5}>
            {questions.map((q, i) => {
              const isShort = q.kind === "short";
              const given = textAnswers?.[q.id] ?? "";
              const chosen = answers[q.id];
              const correct = isShort ? shortCorrect(given, q) : chosen === q.answerIdx;
              return (
                <Box key={q.id}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {correct ? (
                      <Box component={CheckCircle2} sx={{ color: "success.main", width: 20, height: 20, mt: 0.25, flexShrink: 0 }} />
                    ) : (
                      <Box component={XCircle} sx={{ color: "warning.main", width: 20, height: 20, mt: 0.25, flexShrink: 0 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
                        {i + 1}. <MathText text={q.question} />
                      </Typography>
                      {isShort ? (
                        <>
                          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                            Expected:{" "}
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              <MathText text={q.expectedAnswer ?? ""} />
                            </Box>
                          </Typography>
                          <Typography variant="body2" component="div" color="text.secondary">
                            You wrote: {given.trim() ? <MathText text={given} /> : "— blank —"}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
                            Correct answer:{" "}
                            <Box component="span" sx={{ fontWeight: 600 }}>
                              <MathText text={q.options[q.answerIdx]} />
                            </Box>
                          </Typography>
                          {!correct && (
                            <Typography variant="body2" component="div" color="text.secondary">
                              You chose:{" "}
                              {chosen != null && chosen >= 0 ? <MathText text={q.options[chosen]} /> : "— skipped —"}
                            </Typography>
                          )}
                        </>
                      )}
                      {q.explanation && (
                        <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.75 }}>
                          <MathText text={q.explanation} />
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  {i < questions.length - 1 && <Divider sx={{ mt: 2.5 }} />}
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
      <PrintLayer title={title ?? "Practice test"} questions={questions} answers={answers} />
    </Stack>
  );
}

// ── essay (prompt + criteria, feedback-only) ─────────────────────────
// An essay isn't scored: the student writes against the prompt + criteria
// and the AI tutor gives feedback (never a mark, never a rewrite).
function EssayView({ test, onExit }: { test: PracticeTest; onExit?: () => void }) {
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const tutor = useAiTutor();
  const criteria = test.criteria ?? [];

  const getFeedback = () => {
    const text = draft.trim();
    if (!text || tutor.isPending) return;
    const criteriaLine =
      criteria.length > 0 ? `Marking criteria:\n${criteria.map((c) => `- ${c}`).join("\n")}\n\n` : "";
    const msg =
      "You are giving feedback on a student's essay for the task below. Comment specifically against " +
      "each criterion, name the strengths, then the two or three most important things to improve. Be " +
      "encouraging and concrete. Do not rewrite the essay for them, and do not give a numeric mark.\n\n" +
      `Task: ${test.prompt}\n\n${criteriaLine}Student's essay:\n${text}`;
    tutor.mutate({ messages: [{ role: "user", content: msg }] }, {
      onSuccess: (d) => setFeedback(d.reply),
      onError: () => setFeedback("The tutor is unavailable right now. Please try again in a moment."),
    });
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="overline" color="text.secondary">
            Essay
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {test.title}
          </Typography>
          <Typography variant="body1" component="div" sx={{ mb: 2, lineHeight: 1.6 }}>
            <MathText text={test.prompt ?? ""} />
          </Typography>
          {criteria.length > 0 && (
            <Box sx={{ p: 2, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: "action.hover" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                What you&apos;ll be marked on
              </Typography>
              <Stack component="ul" sx={{ m: 0, pl: 2.5 }} spacing={0.5}>
                {criteria.map((c, i) => (
                  <Typography key={i} component="li" variant="body2" color="text.secondary">
                    {c}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Your essay
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={10}
            placeholder="Write your essay here…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="secondary"
              onClick={getFeedback}
              disabled={!draft.trim() || tutor.isPending}
              startIcon={<Bot size={16} />}
            >
              {tutor.isPending ? "Reading your essay…" : "Get feedback"}
            </Button>
            {onExit && (
              <Button onClick={onExit} color="inherit">
                Back to tests
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {feedback && (
        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Feedback
            </Typography>
            <Markdown>{feedback}</Markdown>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

// ── flashcards (flip + self-rate, not scored) ────────────────────────
function FlashcardsView({
  title,
  cards,
  onExit,
}: {
  title: string;
  cards: PracticeQuestion[];
  onExit?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<string, "got" | "almost" | "missed">>({});

  const card = cards[idx];
  const done = idx >= cards.length;

  const rate = (r: "got" | "almost" | "missed") => {
    if (!card) return;
    setRatings((prev) => ({ ...prev, [card.id]: r }));
    setFlipped(false);
    setIdx((i) => i + 1);
  };

  const restart = () => {
    setRatings({});
    setFlipped(false);
    setIdx(0);
  };

  if (done) {
    const got = Object.values(ratings).filter((r) => r === "got").length;
    const almost = Object.values(ratings).filter((r) => r === "almost").length;
    const missed = Object.values(ratings).filter((r) => r === "missed").length;
    return (
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="overline" color="text.secondary">
            Flashcards
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Deck complete
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
            {[
              { label: "Got it", value: got, color: "success.main" },
              { label: "Almost", value: almost, color: "warning.main" },
              { label: "Missed", value: missed, color: "text.disabled" },
            ].map((s) => (
              <Stack key={s.label} direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: s.color }} />
                <Typography sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="contained" color="secondary" onClick={restart}>
              Go again
            </Button>
            {onExit && (
              <Button onClick={onExit} color="inherit">
                Back to tests
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
            Card {idx + 1} of {cards.length}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.round((idx / cards.length) * 100)}
          sx={{ mb: 3, borderRadius: 999 }}
        />

        <Box
          onClick={() => setFlipped((f) => !f)}
          sx={{
            minHeight: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: 2,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            cursor: "pointer",
            bgcolor: (t) => (flipped ? alpha(t.palette.secondary.main, 0.08) : "action.hover"),
            transition: "background-color 160ms ease",
          }}
        >
          <Typography variant="overline" color="text.secondary">
            {flipped ? "Answer" : "Front"}
          </Typography>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.5 }}>
            <MathText text={flipped ? (card?.back ?? "") : (card?.question ?? "")} />
          </Typography>
          {!flipped && (
            <Typography variant="caption" color="text.secondary">
              Tap to reveal
            </Typography>
          )}
        </Box>

        {flipped ? (
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button fullWidth variant="outlined" color="warning" onClick={() => rate("missed")}>
              Missed
            </Button>
            <Button fullWidth variant="outlined" onClick={() => rate("almost")}>
              Almost
            </Button>
            <Button fullWidth variant="contained" color="secondary" onClick={() => rate("got")}>
              Got it
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button onClick={() => setFlipped(true)} variant="contained">
              Show answer
            </Button>
            {onExit && (
              <Button onClick={onExit} color="inherit">
                Exit
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ── printable paper ───────────────────────────────────────────────────
// A blank, do-it-on-paper version of the test: Aptiverse-branded header,
// name/date/score line, then every question with its lettered options and
// no answers. Hidden on screen; PrintLayer's rules reveal only this on
// window.print(). `@page { margin: 0 }` drops the browser's own header/footer
// (the page URL and timestamp) — our own margin comes from the padding
// below. Forced black-on-white so it reads on paper under any app theme.

const PRINT_STYLES = {
  "@page": { margin: 0 },
  "@media print": {
    "body *": { visibility: "hidden" },
    "#practice-print, #practice-print *": { visibility: "visible" },
    "#practice-print": { position: "absolute", top: 0, left: 0, width: "100%" },
  },
} as const;

function PrintLayer({
  title,
  questions,
  answers,
}: {
  title: string;
  questions: PracticeQuestion[];
  // When present, prints the marked "what you did" paper (their answer, the
  // correct answer, the explanation) instead of a blank one.
  answers?: Record<string, number>;
}) {
  // The paper is portaled to <body> so its `position: absolute; left: 0`
  // anchors to the page, not to the dashboard shell (whose transformed /
  // positioned ancestor would otherwise offset it "halfway across the page").
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <GlobalStyles styles={PRINT_STYLES} />
      {mounted &&
        createPortal(
          <PrintableTest title={title} questions={questions} answers={answers} />,
          document.body,
        )}
    </>
  );
}

function PrintableTest({
  title,
  questions,
  answers,
}: {
  title: string;
  questions: PracticeQuestion[];
  answers?: Record<string, number>;
}) {
  const marked = answers != null;
  return (
    <Box
      id="practice-print"
      sx={{
        display: "none",
        "@media print": { display: "block", px: "16mm", py: "14mm" },
        color: "#111",
        bgcolor: "#fff",
      }}
    >
      {/* Brand header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pb: 1.25, mb: 2.5, borderBottom: "2px solid #111" }}
      >
        <Logo size={22} color="#111" />
        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#555",
          }}
        >
          {marked ? "Marked paper" : "Practice paper"}
        </Typography>
      </Stack>

      {/* Title + candidate line (blank paper only) */}
      <Typography sx={{ fontSize: "1.45rem", fontWeight: 700, color: "#111", lineHeight: 1.2 }}>
        {title}
      </Typography>
      {marked ? (
        <Typography sx={{ mt: 1, mb: 3.5, fontSize: "0.82rem", color: "#555" }}>
          Your answers, the correct answers, and the working.
        </Typography>
      ) : (
        <Stack
          direction="row"
          spacing={4}
          sx={{ mt: 1.5, mb: 3.5, fontSize: "0.82rem", color: "#333", flexWrap: "wrap" }}
          useFlexGap
        >
          <Box component="span">
            Name:&nbsp;<Box component="span" sx={{ borderBottom: "1px solid #999", px: 6 }} />
          </Box>
          <Box component="span">
            Date:&nbsp;<Box component="span" sx={{ borderBottom: "1px solid #999", px: 4 }} />
          </Box>
          <Box component="span">
            Mark:&nbsp;<Box component="span" sx={{ borderBottom: "1px solid #999", px: 2 }} />
            &nbsp;/ {questions.length}
          </Box>
        </Stack>
      )}

      {/* Questions */}
      <Stack spacing={2.5}>
        {questions.map((q, i) => {
          const chosen = answers ? answers[q.id] : undefined;
          return (
            <Box key={q.id} sx={{ breakInside: "avoid", pageBreakInside: "avoid" }}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Typography sx={{ fontWeight: 700, color: "#111", minWidth: 24, fontVariantNumeric: "tabular-nums" }}>
                  {i + 1}.
                </Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography component="div" sx={{ fontWeight: 600, mb: 1, color: "#111", lineHeight: 1.5 }}>
                    <MathText text={q.question} />
                  </Typography>
                  <Stack spacing={0.6} sx={{ pl: 0.5 }}>
                    {q.options.map((opt, oi) => {
                      const isCorrect = marked && oi === q.answerIdx;
                      const isChosen = marked && chosen === oi;
                      const optColor = isCorrect ? "#0a7d55" : isChosen ? "#b23a3a" : "#222";
                      return (
                        <Stack key={oi} direction="row" spacing={1} alignItems="flex-start">
                          <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: optColor }}>
                            {String.fromCharCode(65 + oi)}.
                          </Typography>
                          <Typography
                            component="div"
                            variant="body2"
                            sx={{ color: optColor, fontWeight: isCorrect ? 700 : 400 }}
                          >
                            <MathText text={opt} />
                            {isCorrect && (
                              <Box component="span" sx={{ ml: 1, fontWeight: 700, color: "#0a7d55" }}>
                                (correct{isChosen ? ", your answer" : ""})
                              </Box>
                            )}
                            {isChosen && !isCorrect && (
                              <Box component="span" sx={{ ml: 1, fontWeight: 600, color: "#b23a3a" }}>
                                (your answer)
                              </Box>
                            )}
                          </Typography>
                        </Stack>
                      );
                    })}
                  </Stack>
                  {marked && chosen != null && chosen < 0 && (
                    <Typography variant="body2" sx={{ mt: 0.5, color: "#b23a3a", fontWeight: 600 }}>
                      Not answered
                    </Typography>
                  )}
                  {marked && q.explanation && (
                    <Typography component="div" variant="body2" sx={{ mt: 0.75, color: "#555" }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>Working: </Box>
                      <MathText text={q.explanation} />
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {/* Footer */}
      <Typography
        sx={{
          mt: 3.5,
          pt: 1.25,
          borderTop: "1px solid #ccc",
          fontSize: "0.68rem",
          color: "#888",
          textAlign: "center",
        }}
      >
        Generated with Aptiverse
      </Typography>
    </Box>
  );
}
