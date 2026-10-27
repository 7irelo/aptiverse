import type { Stage } from "@/features/academics/lib/stage";

export const FORMAT_LABELS: Record<string, string> = {
  quiz: "Multiple choice",
  exam_paper: "Exam paper",
  reading: "Reading comprehension",
  flashcards: "Flashcards",
  essay: "Essay",
};

export const FORMAT_HELP: Record<string, string> = {
  quiz: "Multiple choice: four options, one correct, marked instantly.",
  exam_paper:
    "Exam paper: a full paper sized by marks, timed at a minute a mark.",
  reading: "Reading: a passage with questions about it.",
  flashcards:
    "Flashcards: flip and rate yourself. Not scored, retake any time.",
  essay: "Essay: plan and write a longer answer, marked with feedback.",
};

/** Formats offered by stage, ordered by the assessment's type. */
export function formatsFor(stage: Stage, assessmentType?: string): string[] {
  const base =
    stage === "university"
      ? ["quiz", "exam_paper", "flashcards", "essay"]
      : ["quiz", "exam_paper", "reading", "flashcards", "essay"];
  const order: Record<string, string[]> = {
    test: ["quiz", "exam_paper", "flashcards"],
    class_test: ["quiz", "exam_paper", "flashcards"],
    exam: ["exam_paper", "quiz", "flashcards"],
    midterm: ["exam_paper", "quiz", "flashcards"],
    essay: ["essay", "flashcards"],
    investigation: ["essay", "flashcards"],
    project: ["essay", "flashcards"],
  };
  const preferred = (assessmentType && order[assessmentType]) || [];
  return [
    ...preferred.filter((f) => base.includes(f)),
    ...base.filter((f) => !preferred.includes(f)),
  ];
}

/** Formats with a fixed mode; others let the student choose. */
export function forcedMode(format: string): "timed" | "untimed" | null {
  if (format === "exam_paper") return "timed";
  if (format === "flashcards") return "untimed";
  return null;
}

export function usesQuestionCount(format: string): boolean {
  return format === "quiz" || format === "reading" || format === "flashcards";
}

export const PAPER_MARKS = [
  { value: 30, label: "30 marks, about half an hour" },
  { value: 50, label: "50 marks, about an hour" },
  { value: 100, label: "100 marks, about two hours" },
  { value: 150, label: "150 marks, a full three-hour paper" },
] as const;

export function difficultyOptions(stage: Stage) {
  return stage === "university"
    ? [
        { value: "foundation", label: "Foundation: key concepts" },
        { value: "core", label: "Core: typical exam level" },
        { value: "stretch", label: "Challenge: beyond the exam" },
      ]
    : [
        { value: "foundation", label: "Foundation: recall and basics" },
        { value: "core", label: "Core: standard exam level" },
        { value: "stretch", label: "Challenge: multi-step, top marks" },
      ];
}

export const DIFFICULTY_SHORT: Record<string, string> = {
  foundation: "Foundation",
  core: "Core",
  stretch: "Challenge",
};

/** Default timed duration: 1.5 min per question, rounded up to 5 minutes. */
export function defaultDuration(format: string, questionCount: number): number {
  const perQuestion = format === "reading" ? 4 : format === "essay" ? 10 : 1.5;
  const minutes = Math.ceil((questionCount * perQuestion) / 5) * 5;
  return Math.min(180, Math.max(5, minutes));
}

/** Polling backoff for generation status: 1 s, 2 s, 3 s, then every 5 s. */
export function nextPollDelay(attempt: number): number {
  return [1000, 2000, 3000][attempt] ?? 5000;
}

export const GENERATION_STORAGE_KEY = "aptiverse.practice.generation";

export function testStateLabel(test: {
  status: string;
  latestAttempt: null | { status: string; scorePercent?: number | null };
}): string {
  if (test.status === "generating") return "Generating";
  if (test.status === "failed") return "Failed";
  const attempt = test.latestAttempt;
  if (!attempt) return "Not started";
  if (attempt.status === "in_progress" || attempt.status === "paused") {
    return "In progress";
  }
  if (attempt.status === "grading") return "Marking";
  if (attempt.scorePercent != null) {
    return `Completed, ${Math.round(attempt.scorePercent)}%`;
  }
  return "Completed";
}
