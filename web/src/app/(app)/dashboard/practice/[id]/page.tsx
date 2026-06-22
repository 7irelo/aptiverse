"use client";

import { use, useState } from "react";
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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { usePracticeTest, useSubjects } from "@/lib/api/queries";
import type { PracticeTest, Subject } from "@/lib/mockData";

// Sample question bank — real questions will load via
// GET /api/practice/tests/{id}/questions in a future pass.
const SAMPLE_QUESTIONS = [
  {
    q: "Differentiate y = (3x² + 2)⁴ with respect to x.",
    options: ["8x(3x² + 2)³", "24x(3x² + 2)³", "12x(3x² + 2)³", "(3x² + 2)³"],
    answerIdx: 1,
  },
  {
    q: "If f(x) = sin(2x), what is f'(π/4)?",
    options: ["0", "1", "2", "-1"],
    answerIdx: 0,
  },
  {
    q: "The chain rule applies when:",
    options: [
      "Two functions are added",
      "A function is composed inside another function",
      "Differentiating a polynomial",
      "Integrating a product",
    ],
    answerIdx: 1,
  },
];

export default function PracticeAttempt({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const testQuery = usePracticeTest(id);
  const subjectsQuery = useSubjects();

  const subject = (subjectsQuery.data ?? []).find((s) => s.id === testQuery.data?.subjectId);

  return (
    <>
      <PageHeader
        title={testQuery.data?.title ?? "Practice test"}
        description={
          testQuery.data
            ? `${subject?.name ?? ""} · ${testQuery.data.questionCount} questions · ${testQuery.data.durationMinutes} min`
            : undefined
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Practice", href: "/dashboard/practice" },
          { label: testQuery.data?.title ?? "Test" },
        ]}
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Time
            </Typography>
            <Typography variant="h6" sx={{ fontVariantNumeric: "tabular-nums" }}>
              23:42
            </Typography>
          </Stack>
        }
      />

      <QueryStates
        query={testQuery}
        isEmpty={() => false}
        empty={{
          icon: <QuizIcon />,
          title: "Practice test not found",
          description: "This test doesn't exist or has been removed.",
          action: (
            <Button variant="outlined" href="/dashboard/practice">
              All practice tests
            </Button>
          ),
        }}
      >
        {(test) => <PracticeRunner test={test} />}
      </QueryStates>
    </>
  );
}

function PracticeRunner({ test: _ }: { test: PracticeTest }) {
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const total = SAMPLE_QUESTIONS.length;
  const progress = ((qIdx + 1) / total) * 100;

  const handleSelect = (i: number) => {
    const next = [...answers];
    next[qIdx] = i;
    setAnswers(next);
  };

  const onNext = () => setQIdx((i) => Math.min(total - 1, i + 1));
  const onPrev = () => setQIdx((i) => Math.max(0, i - 1));

  const q = SAMPLE_QUESTIONS[qIdx];

  return (
    <>
      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="overline" color="text.secondary">
              Question {qIdx + 1} of {total}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Flag for review">
                <IconButton size="small">
                  <FlagIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ask AI tutor">
                <IconButton size="small">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            {q.q}
          </Typography>

          <RadioGroup value={answers[qIdx] ?? -1} onChange={(_, v) => handleSelect(parseInt(v))}>
            <Stack spacing={1.5}>
              {q.options.map((opt, i) => (
                <Card
                  key={i}
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    borderColor: answers[qIdx] === i ? "primary.main" : "divider",
                    borderWidth: answers[qIdx] === i ? 2 : 1,
                    transition: "border-color 150ms",
                  }}
                  onClick={() => handleSelect(i)}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <FormControlLabel
                      value={i}
                      control={<Radio />}
                      label={opt}
                      sx={{ width: "100%", m: 0 }}
                    />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </RadioGroup>

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
            <Button onClick={onPrev} disabled={qIdx === 0} variant="outlined">
              Previous
            </Button>
            {qIdx < total - 1 ? (
              <Button onClick={onNext} variant="contained">
                Next question
              </Button>
            ) : (
              <Button variant="contained" color="secondary">
                Submit attempt
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ mt: 3 }}>
        <Typography variant="overline" color="text.secondary">
          Question palette
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {SAMPLE_QUESTIONS.map((_, i) => {
            const answered = answers[i] != null;
            return (
              <Button
                key={i}
                size="small"
                variant={i === qIdx ? "contained" : answered ? "outlined" : "text"}
                color={answered ? "primary" : "inherit"}
                onClick={() => setQIdx(i)}
                sx={{ minWidth: 36, p: 0.75 }}
              >
                {i + 1}
              </Button>
            );
          })}
        </Stack>
      </Box>
    </>
  );
}
