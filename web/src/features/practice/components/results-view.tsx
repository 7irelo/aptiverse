import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Markdown } from "@/components/common/markdown";
import { MathText } from "@/components/common/math-text";
import { ProgressRing } from "@/components/common/progress-ring";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AttemptResults, ResultQuestion } from "@/lib/api/generated/model";
import { formatDuration } from "@/lib/format/date";
import { cn } from "@/lib/utils";

/** Outcome words for one question. Never guesses a mark the server lacks. */
export function outcomeOf(q: ResultQuestion): {
  label: string;
  tone: "success" | "warning" | "muted";
} {
  const answered =
    q.yourSelectedIndex != null || !!q.yourAnswer?.trim() || !!q.yourSelfRating;
  if (!answered) return { label: "Not answered", tone: "muted" };
  if (q.markingStatus === "not_marked_yet") {
    return { label: "Not marked yet", tone: "muted" };
  }
  if (q.markingStatus === "self_rated") {
    const words: Record<string, string> = {
      knew: "You knew it",
      unsure: "You were not sure",
      did_not_know: "You did not know it",
    };
    return {
      label: words[q.yourSelfRating ?? ""] ?? "Self rated",
      tone: "muted",
    };
  }
  if (q.isCorrect === true) return { label: "Correct", tone: "success" };
  if (
    q.awardedMarks != null &&
    q.awardedMarks > 0 &&
    q.awardedMarks < q.marks
  ) {
    return { label: "Partly correct", tone: "warning" };
  }
  if (q.awardedMarks != null && q.awardedMarks >= q.marks && q.marks > 0) {
    return { label: "Correct", tone: "success" };
  }
  return { label: "Incorrect", tone: "warning" };
}

function yourAnswer(q: ResultQuestion): string | null {
  if (q.yourSelectedIndex != null)
    return q.options[q.yourSelectedIndex] ?? null;
  if (q.yourAnswer?.trim()) return q.yourAnswer;
  return null;
}

function correctAnswer(q: ResultQuestion): string | null {
  if (q.correctIndex != null) return q.options[q.correctIndex] ?? null;
  return q.correctAnswer ?? null;
}

/** The marked paper: score, topics and every question with feedback. */
export function ResultsView({
  results,
  unitName,
  revisit,
}: {
  results: AttemptResults;
  unitName: string | null;
  revisit: boolean;
}) {
  const scored = results.maxMarks > 0;
  const weakest = [...results.topics]
    .filter((t) => t.marksAvailable > 0)
    .sort(
      (a, b) =>
        a.marksAwarded / a.marksAvailable - b.marksAwarded / b.marksAvailable,
    )[0];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/dashboard/practice"
        className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Practice
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your results
        </h1>
        <p className="text-base text-muted-foreground">
          {results.title}
          {unitName ? `, ${unitName}` : null}
        </p>
      </header>
      {revisit ? (
        <p className="rounded-lg border bg-card p-3 text-sm">
          You&apos;ve already taken this test. Each test has one attempt.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section
          aria-labelledby="score-title"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:col-span-5"
        >
          <h2 id="score-title" className="text-base font-semibold">
            Score
          </h2>
          <div className="flex items-center gap-4">
            {scored && results.scorePercent != null ? (
              <ProgressRing
                value={results.scorePercent}
                label="Your score"
                tone="success"
              />
            ) : null}
            <div className="flex flex-col gap-1">
              {!scored ? (
                <p className="text-base">Flashcards are not scored.</p>
              ) : results.scoreMarks != null ? (
                <p className="text-lg font-semibold">
                  {results.scoreMarks} of {results.maxMarks} marks
                </p>
              ) : (
                <p className="text-base text-muted-foreground">
                  Not marked yet
                </p>
              )}
              {results.partiallyGraded ? (
                <p className="text-sm text-muted-foreground">
                  Some answers are not marked yet. Your score counts only the
                  marked ones
                  {results.markedMarks != null
                    ? ` (${results.markedScore ?? 0} of ${results.markedMarks} marks so far)`
                    : null}
                  .
                </p>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Time taken: {formatDuration(results.secondsOnTask)}
              </p>
              <p className="text-sm text-muted-foreground">
                {results.submitSource === "deadline"
                  ? "Submitted when time ran out"
                  : "Submitted by you"}
              </p>
            </div>
          </div>
          {results.focusLossCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              You left the test tab {results.focusLossCount}{" "}
              {results.focusLossCount === 1 ? "time" : "times"}.
            </p>
          ) : null}
        </section>

        <section
          aria-labelledby="topics-title"
          className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:col-span-7"
        >
          <h2 id="topics-title" className="text-base font-semibold">
            By topic
          </h2>
          {results.topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No marks yet</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {results.topics.map((t) => (
                <li key={t.topic} className="flex flex-col gap-1">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium">{t.topic}</span>
                    <span className="tabular-nums">
                      {t.questionsCorrect} of {t.questionsTotal}
                    </span>
                  </div>
                  {t.marksAvailable > 0 ? (
                    <Progress
                      value={(t.marksAwarded / t.marksAvailable) * 100}
                      aria-label={`${t.topic}: ${t.marksAwarded} of ${t.marksAvailable} marks`}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="review-title" className="flex flex-col gap-3">
        <h2 id="review-title" className="text-lg font-semibold">
          Question review
        </h2>
        <Accordion type="multiple" className="rounded-lg border bg-card">
          {results.questions.map((q) => {
            const outcome = outcomeOf(q);
            const yours = yourAnswer(q);
            const correct = correctAnswer(q);
            return (
              <AccordionItem key={q.id} value={q.id} className="px-4">
                <AccordionTrigger className="min-h-11 text-left">
                  <span className="flex flex-col gap-0.5">
                    <span>Question {q.position}</span>
                    <span
                      className={cn(
                        "text-sm font-normal",
                        outcome.tone === "success" && "text-success",
                        outcome.tone === "warning" && "text-warning",
                        outcome.tone === "muted" && "text-muted-foreground",
                      )}
                    >
                      {outcome.label}
                      {q.awardedMarks != null && q.marks > 0
                        ? `, ${q.awardedMarks} of ${q.marks} ${q.marks === 1 ? "mark" : "marks"}`
                        : null}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3 pb-4">
                  <p className="text-base">
                    <MathText text={q.stem} />
                  </p>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Your answer
                    </h3>
                    <p>
                      {yours ? (
                        <MathText text={yours} />
                      ) : q.yourSelfRating ? (
                        outcome.label
                      ) : (
                        "Not answered"
                      )}
                    </p>
                  </div>
                  {correct ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Correct answer
                      </h3>
                      <p>
                        <MathText text={correct} />
                      </p>
                    </div>
                  ) : null}
                  {q.feedback ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Feedback
                      </h3>
                      <Markdown asciiMath>{q.feedback}</Markdown>
                    </div>
                  ) : q.markingStatus === "not_marked_yet" ? (
                    <p className="text-sm text-muted-foreground">
                      This answer is not marked yet. Feedback appears here once
                      it is.
                    </p>
                  ) : null}
                  {q.explanation ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Explanation
                      </h3>
                      <Markdown asciiMath>{q.explanation}</Markdown>
                    </div>
                  ) : null}
                  {q.memo && q.memo !== q.explanation ? (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Memo
                      </h3>
                      <Markdown asciiMath>{q.memo}</Markdown>
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        {weakest ? (
          <Button asChild className="min-h-11 px-4">
            <Link
              href={`/dashboard/practice?topic=${encodeURIComponent(weakest.topic)}`}
            >
              Practise {weakest.topic}
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline" className="min-h-11 px-4">
          <Link href="/dashboard/practice">Back to practice</Link>
        </Button>
      </div>
    </div>
  );
}
