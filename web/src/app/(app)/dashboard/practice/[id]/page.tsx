"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/HighlightOffOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { CardError } from "@/components/common/CardError";
import {
  usePracticeTest,
  usePracticeQuestions,
  useStartAttempt,
  useSubmitAttempt,
  type PracticeQuestion,
  type PracticeAnswerItem,
  type PracticeAttemptResult,
} from "@/lib/api/queries";

export default function PracticeAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const testQuery = usePracticeTest(id);
  const questionsQuery = usePracticeQuestions(id);

  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);

  const startAttempt = useStartAttempt();
  const submitAttempt = useSubmitAttempt();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeMs, setTimeMs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PracticeAttemptResult | null>(null);

  const startedRef = useRef(false);
  const shownAtRef = useRef<number>(0);

  // Start the attempt once the questions are available.
  useEffect(() => {
    if (startedRef.current || questions.length === 0) return;
    startedRef.current = true;
    shownAtRef.current = Date.now();
    startAttempt.mutate(id, { onSuccess: (a) => setAttemptId(a.id) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, id]);

  // Accrue elapsed time onto the question the student is leaving.
  function flush(questionId: string) {
    const now = Date.now();
    const delta = Math.max(0, now - shownAtRef.current);
    shownAtRef.current = now;
    setTimeMs((prev) => ({ ...prev, [questionId]: (prev[questionId] ?? 0) + delta }));
  }

  const title = testQuery.data?.title ?? "Practice test";
  const q = questions[current];

  const loading = testQuery.isLoading || questionsQuery.isLoading;
  const isError = testQuery.isError || questionsQuery.isError;

  function goTo(next: number) {
    if (q) flush(q.id);
    setCurrent(next);
  }

  async function handleSubmit() {
    if (!attemptId || !q) return;
    flush(q.id);
    const answerItems: PracticeAnswerItem[] = questions.map((question) => ({
      questionId: question.id,
      selectedIdx: answers[question.id] ?? -1,
      timeMs: timeMs[question.id] ?? 0,
    }));
    try {
      const res = await submitAttempt.mutateAsync({ attemptId, answerItems });
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      /* surfaced via submitAttempt.isError in the runner */
    }
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title={title}
        description="One question at a time. Your answers are scored the moment you submit."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Practice", href: "/dashboard/practice" },
          { label: result ? "Results" : "Attempt" },
        ]}
      />

      {loading ? (
        <Card>
          <CardContent sx={{ py: 6 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
              Loading your questions…
            </Typography>
          </CardContent>
        </Card>
      ) : isError ? (
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
      ) : questions.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              This test has no questions yet.
            </Typography>
          </CardContent>
        </Card>
      ) : result?.summary ? (
        <ResultsView result={result} questions={questions} answers={answers} />
      ) : (
        <RunnerView
          q={q}
          index={current}
          total={questions.length}
          answeredCount={answeredCount}
          selected={q ? answers[q.id] : undefined}
          onSelect={(idx) => q && setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
          onPrev={() => goTo(Math.max(0, current - 1))}
          onNext={() => goTo(Math.min(questions.length - 1, current + 1))}
          onSubmit={handleSubmit}
          submitting={submitAttempt.isPending}
          startFailed={startAttempt.isError}
          submitFailed={submitAttempt.isError}
          canSubmit={!!attemptId}
        />
      )}
    </AtmosphericBackdrop>
  );
}

// ── runner ────────────────────────────────────────────────────────────

function RunnerView({
  q,
  index,
  total,
  answeredCount,
  selected,
  onSelect,
  onPrev,
  onNext,
  onSubmit,
  submitting,
  startFailed,
  submitFailed,
  canSubmit,
}: {
  q: PracticeQuestion | undefined;
  index: number;
  total: number;
  answeredCount: number;
  selected: number | undefined;
  onSelect: (idx: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
  startFailed: boolean;
  submitFailed: boolean;
  canSubmit: boolean;
}) {
  if (!q) return null;
  const isLast = index === total - 1;
  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
            Question {index + 1} of {total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {answeredCount}/{total} answered
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, borderRadius: 999 }} />

        {q.topic && <Chip label={q.topic} size="small" variant="outlined" sx={{ mb: 2 }} />}

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, lineHeight: 1.4 }}>
          {q.question}
        </Typography>

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
                    label={opt}
                    sx={{ width: "100%", m: 0, py: 0.5 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </RadioGroup>

        {startFailed && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            We couldn&apos;t start this attempt, so it can&apos;t be scored. Reload the page to try
            again.
          </Alert>
        )}
        {submitFailed && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Submitting failed. Check your connection and try again.
          </Alert>
        )}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button onClick={onPrev} disabled={index === 0} startIcon={<ArrowBackIcon />} color="inherit">
            Back
          </Button>
          {isLast ? (
            <Button
              onClick={onSubmit}
              variant="contained"
              color="secondary"
              disabled={submitting || !canSubmit}
            >
              {submitting ? "Scoring…" : "Submit & score"}
            </Button>
          ) : (
            <Button onClick={onNext} variant="contained" endIcon={<ArrowForwardIcon />}>
              Next
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── results ───────────────────────────────────────────────────────────

function ResultsView({
  result,
  questions,
  answers,
}: {
  result: PracticeAttemptResult;
  questions: PracticeQuestion[];
  answers: Record<string, number>;
}) {
  const summary = result.summary!;
  const scoreColor =
    summary.scorePercent >= 80
      ? "success.main"
      : summary.scorePercent >= 50
        ? "primary.main"
        : "warning.main";

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Your score
              </Typography>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography
                  sx={{
                    fontSize: "3rem",
                    fontWeight: 700,
                    lineHeight: 1,
                    color: scoreColor,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {summary.scorePercent}
                </Typography>
                <Typography sx={{ fontSize: "1.25rem", color: scoreColor }}>%</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {summary.correctCount} correct · {summary.incorrectCount} wrong ·{" "}
                {summary.unansweredCount} skipped
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button component={Link} href="/dashboard/mastery" variant="outlined">
                See mastery
              </Button>
              <Button
                component={Link}
                href="/dashboard/practice"
                variant="contained"
                color="secondary"
              >
                Back to practice
              </Button>
            </Stack>
          </Stack>

          {summary.perTopic.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                By topic
              </Typography>
              <Stack spacing={1.75}>
                {summary.perTopic.map((t) => (
                  <Box key={t.topic}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{t.topic}</Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                      >
                        {t.correct}/{t.total} · {t.percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={t.percent}
                      color={t.percent >= 80 ? "success" : t.percent >= 50 ? "primary" : "warning"}
                    />
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Review
          </Typography>
          <Stack spacing={2.5}>
            {questions.map((q, i) => {
              const chosen = answers[q.id];
              const correct = chosen === q.answerIdx;
              return (
                <Box key={q.id}>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {correct ? (
                      <CheckCircleIcon sx={{ color: "success.main", fontSize: 20, mt: 0.25 }} />
                    ) : (
                      <CancelIcon sx={{ color: "warning.main", fontSize: 20, mt: 0.25 }} />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {i + 1}. {q.question}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Correct answer:{" "}
                        <Box component="span" sx={{ fontWeight: 600 }}>
                          {q.options[q.answerIdx]}
                        </Box>
                      </Typography>
                      {!correct && (
                        <Typography variant="body2" color="text.secondary">
                          You chose:{" "}
                          {chosen != null && chosen >= 0 ? q.options[chosen] : "— skipped —"}
                        </Typography>
                      )}
                      {q.explanation && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          {q.explanation}
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
    </Stack>
  );
}
