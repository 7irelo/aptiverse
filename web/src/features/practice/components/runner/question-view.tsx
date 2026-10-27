"use client";

import { Flag } from "lucide-react";
import { useId, useState } from "react";

import { MathText } from "@/components/common/math-text";
import { NativeInput, Textarea } from "@/components/common/native-fields";
import { Button } from "@/components/ui/button";
import type { AnswerValue } from "@/features/practice/hooks/answer-sync";
import type { AttemptQuestion } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";

const SELF_RATINGS = [
  { value: "knew", label: "I knew it" },
  { value: "unsure", label: "Not sure" },
  { value: "did_not_know", label: "I did not know" },
] as const;

/** One question with its answer control. Maths renders through MathText. */
export function QuestionView({
  question,
  index,
  total,
  answer,
  flagged,
  disabled,
  onAnswer,
  onToggleFlag,
}: {
  question: AttemptQuestion;
  index: number;
  total: number;
  answer: AnswerValue | undefined;
  flagged: boolean;
  disabled: boolean;
  onAnswer: (value: AnswerValue) => void;
  onToggleFlag: () => void;
}) {
  const stemId = useId();
  const [revealed, setRevealed] = useState(false);

  return (
    <article aria-labelledby={stemId} className="flex flex-col gap-4">
      {question.section ? (
        <p className="text-sm font-medium text-muted-foreground">
          {question.section}
        </p>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold">
          Question {index + 1} of {total}
        </h2>
        <span className="shrink-0 text-sm text-muted-foreground">
          {question.marks} {question.marks === 1 ? "mark" : "marks"}
        </span>
      </div>
      <p id={stemId} className="text-lg leading-8">
        <MathText text={question.stem} />
      </p>

      {question.kind === "mcq" ? (
        <fieldset className="flex flex-col gap-2" disabled={disabled}>
          <legend className="sr-only">Choose one answer</legend>
          {question.options.map((option, i) => {
            const checked =
              !!answer &&
              "selectedIndex" in answer &&
              answer.selectedIndex === i;
            return (
              <label
                key={i}
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border bg-card p-3",
                  checked && "border-primary bg-muted",
                )}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  className="mt-1 size-5 shrink-0 accent-primary"
                  checked={checked}
                  onChange={() => onAnswer({ selectedIndex: i })}
                />
                <span className="flex-1">
                  <MathText text={option} />
                </span>
              </label>
            );
          })}
        </fieldset>
      ) : question.kind === "flashcard" ? (
        <div className="flex flex-col gap-3">
          {revealed || (answer && "selfRating" in answer) ? (
            <div className="rounded-lg border bg-muted p-4">
              <MathText text={question.flashcardBack ?? ""} />
            </div>
          ) : (
            <div>
              <Button
                variant="outline"
                className="min-h-11 px-4"
                onClick={() => setRevealed(true)}
              >
                Show answer
              </Button>
            </div>
          )}
          <fieldset
            className="flex flex-col gap-2 sm:flex-row"
            disabled={disabled}
          >
            <legend className="mb-1 text-sm font-medium">
              How well did you know it?
            </legend>
            {SELF_RATINGS.map((r) => {
              const checked =
                !!answer &&
                "selfRating" in answer &&
                answer.selfRating === r.value;
              return (
                <label
                  key={r.value}
                  className={cn(
                    "flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-lg border bg-card px-3",
                    checked && "border-primary bg-muted",
                  )}
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    className="size-5 accent-primary"
                    checked={checked}
                    onChange={() => onAnswer({ selfRating: r.value })}
                  />
                  {r.label}
                </label>
              );
            })}
          </fieldset>
        </div>
      ) : question.kind === "numeric" ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`a-${question.id}`} className="text-sm font-medium">
            Your answer
          </label>
          <NativeInput
            id={`a-${question.id}`}
            inputMode="decimal"
            disabled={disabled}
            value={answer && "textAnswer" in answer ? answer.textAnswer : ""}
            onChange={(e) => onAnswer({ textAnswer: e.target.value })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`a-${question.id}`} className="text-sm font-medium">
            Your answer
          </label>
          <Textarea
            id={`a-${question.id}`}
            disabled={disabled}
            className={question.kind === "short" ? "min-h-24" : "min-h-48"}
            value={answer && "textAnswer" in answer ? answer.textAnswer : ""}
            onChange={(e) => onAnswer({ textAnswer: e.target.value })}
          />
        </div>
      )}

      <div>
        <Button
          variant="ghost"
          aria-pressed={flagged}
          className="min-h-11 px-3"
          onClick={onToggleFlag}
        >
          <Flag aria-hidden="true" className={cn(flagged && "fill-current")} />
          Flag for review
        </Button>
      </div>
    </article>
  );
}

export function isAnswered(value: AnswerValue | undefined): boolean {
  if (!value) return false;
  if ("textAnswer" in value) return value.textAnswer.trim().length > 0;
  return true;
}
