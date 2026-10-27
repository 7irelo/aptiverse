"use client";

import { Flag, LoaderCircle, Pause, WifiOff } from "lucide-react";

import { MathText } from "@/components/common/math-text";
import { Button } from "@/components/ui/button";
import type { SyncStatus } from "@/features/practice/hooks/answer-sync";
import type { AttemptQuestion } from "@/lib/api/generated/model";
import { formatClock } from "@/lib/format/date";
import { cn } from "@/lib/utils";

/** Sticky bar: position, countdown chip, save state, pause, navigator. */
export function RunnerTopBar({
  index,
  total,
  seconds,
  timed,
  saveStatus,
  canPause,
  onPause,
  onOpenNavigator,
  announcement,
}: {
  index: number;
  total: number;
  seconds: number | null;
  timed: boolean;
  saveStatus: SyncStatus;
  canPause: boolean;
  onPause: () => void;
  onOpenNavigator: () => void;
  announcement: string | null;
}) {
  const low = timed && seconds !== null && seconds <= 300;
  return (
    <div className="sticky top-0 z-10 border-b bg-background">
      <div className="mx-auto flex min-h-14 w-full max-w-3xl items-center gap-2 px-4">
        <p className="flex-1 text-sm font-medium">
          Question {index + 1} of {total}
        </p>
        <span className="text-xs text-muted-foreground" aria-hidden="true">
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved"
              : null}
        </span>
        <span
          role="timer"
          aria-live="off"
          aria-label={
            timed && seconds !== null
              ? `${formatClock(seconds)} left`
              : "Untimed"
          }
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-semibold tabular-nums",
            low && "border-warning text-warning",
          )}
        >
          {timed && seconds !== null ? formatClock(seconds) : "Untimed"}
        </span>
        <span className="sr-only" aria-live="polite">
          {announcement ?? ""}
        </span>
        {canPause ? (
          <Button
            variant="ghost"
            className="min-h-11 px-3"
            onClick={onPause}
            aria-label="Pause test"
          >
            <Pause aria-hidden="true" />
          </Button>
        ) : null}
        <Button
          variant="outline"
          className="min-h-11 px-3"
          onClick={onOpenNavigator}
        >
          Questions
        </Button>
      </div>
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm"
    >
      <WifiOff aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      You&apos;re offline. Your answers are saved on this phone and will sync
      when you reconnect.
    </div>
  );
}

/** Grid of question numbers with answered, flagged and current markers. */
export function QuestionGrid({
  total,
  current,
  answered,
  flagged,
  onJump,
}: {
  total: number;
  current: number;
  answered: (i: number) => boolean;
  flagged: (i: number) => boolean;
  onJump: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, i) => {
          const status = [
            answered(i) ? "answered" : "not answered",
            flagged(i) ? "flagged" : null,
            i === current ? "current" : null,
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Question ${i + 1}, ${status}`}
                aria-current={i === current ? "step" : undefined}
                className={cn(
                  "relative flex min-h-11 w-full items-center justify-center rounded-lg border text-sm font-medium",
                  answered(i) && "bg-muted",
                  i === current && "border-primary ring-2 ring-primary",
                )}
              >
                {i + 1}
                {flagged(i) ? (
                  <Flag
                    aria-hidden="true"
                    className="absolute top-1 right-1 size-3 fill-current"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        Shaded: answered. Flag: marked for review.
      </p>
    </div>
  );
}

export function ReviewView({
  questions,
  answered,
  flagged,
  onGoTo,
  onSubmit,
  onKeepWorking,
  submitting,
  error,
}: {
  questions: AttemptQuestion[];
  answered: (i: number) => boolean;
  flagged: (i: number) => boolean;
  onGoTo: (i: number) => void;
  onSubmit: () => void;
  onKeepWorking: () => void;
  submitting: boolean;
  error: string | null;
}) {
  const answeredCount = questions.filter((_, i) => answered(i)).length;
  const flaggedCount = questions.filter((_, i) => flagged(i)).length;
  const unanswered = questions.length - answeredCount;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        Review your answers
      </h1>
      <p className="text-base text-muted-foreground">
        {answeredCount} answered, {unanswered} unanswered, {flaggedCount}{" "}
        flagged
      </p>
      <ul className="flex flex-col gap-2">
        {questions.map((q, i) => (
          <li
            key={q.id}
            className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
          >
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium">
                Question {i + 1}
                {flagged(i) ? ", flagged" : null}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                <MathText text={q.stem} />
              </span>
              <span
                className={cn(
                  "text-sm",
                  answered(i) ? "text-muted-foreground" : "text-warning",
                )}
              >
                {answered(i) ? "Answered" : "Not answered"}
              </span>
            </div>
            <Button
              variant="outline"
              className="min-h-11 shrink-0 px-3"
              onClick={() => onGoTo(i)}
            >
              Go to question<span className="sr-only"> {i + 1}</span>
            </Button>
          </li>
        ))}
      </ul>
      {unanswered > 0 ? (
        <p className="text-sm text-warning">
          You have {unanswered} unanswered{" "}
          {unanswered === 1 ? "question" : "questions"}.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="min-h-11 px-4"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : null}
          Submit test
        </Button>
        <Button
          variant="outline"
          className="min-h-11 px-4"
          onClick={onKeepWorking}
        >
          Keep working
        </Button>
      </div>
    </div>
  );
}

export function CenteredState({
  title,
  body,
  busy,
  children,
}: {
  title: string;
  body?: string;
  busy?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center"
    >
      {busy ? (
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none"
        />
      ) : null}
      <h1 className="text-xl font-semibold">{title}</h1>
      {body ? <p className="text-base text-muted-foreground">{body}</p> : null}
      {children}
    </div>
  );
}
