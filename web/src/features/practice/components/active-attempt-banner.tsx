"use client";

import { Timer } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCountdown } from "@/features/practice/hooks/use-countdown";
import { formatClock } from "@/lib/format/date";

type ActiveAttemptBannerProps = {
  testId: string;
  testTitle: string;
  deadlineAt: string | null;
  serverNow: string;
  remainingSeconds: number | null;
  paused: boolean;
  headingLevel?: 2 | 3;
};

/**
 * "You have a test in progress" with the time left from the server's
 * deadline (never the phone's clock) and a way straight back to it.
 */
export function ActiveAttemptBanner({
  testId,
  testTitle,
  deadlineAt,
  serverNow,
  remainingSeconds,
  paused,
  headingLevel = 2,
}: ActiveAttemptBannerProps) {
  const { seconds, announcement } = useCountdown({
    deadlineAt: paused ? null : deadlineAt,
    serverNow,
    frozenSeconds: remainingSeconds,
  });
  const Heading = `h${headingLevel}` as const;
  const timeUp = deadlineAt !== null && !paused && seconds === 0;

  return (
    <section
      aria-labelledby="active-attempt-title"
      className="flex flex-col gap-3 rounded-lg border bg-citron-surface p-4 text-on-citron sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Timer aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <Heading
            id="active-attempt-title"
            className="text-base font-semibold"
          >
            {timeUp
              ? "Time is up. Your test was submitted."
              : "You have a test in progress"}
          </Heading>
          <p className="text-sm">
            {testTitle}
            {deadlineAt && seconds !== null && !timeUp ? (
              <>
                {", "}
                <span role="timer" aria-live="off" className="tabular-nums">
                  {formatClock(seconds)} left
                </span>
              </>
            ) : null}
            {paused ? ", paused" : null}
          </p>
          <span className="sr-only" aria-live="polite">
            {announcement ?? ""}
          </span>
        </div>
      </div>
      <Button
        asChild
        className="min-h-11 bg-primary px-4 text-primary-foreground"
      >
        <Link href={`/dashboard/practice/${testId}`}>
          {timeUp ? "See results" : "Resume test"}
        </Link>
      </Button>
    </section>
  );
}
