"use client";

import {
  Bot,
  ChevronLeft,
  Clock,
  LoaderCircle,
  MonitorSmartphone,
  Pause,
  Repeat1,
  Save,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { FormAlert } from "@/components/common/form-alert";
import { Button } from "@/components/ui/button";
import {
  DIFFICULTY_SHORT,
  FORMAT_LABELS,
} from "@/features/practice/lib/practice";
import type { PracticeTestInstructions } from "@/lib/api/generated/model";

type Rule = { icon: LucideIcon; title: string; body: string };

export function rulesFor(test: PracticeTestInstructions): Rule[] {
  const timed = test.mode === "timed" && test.durationMinutes;
  return [
    {
      icon: Clock,
      title: "Time",
      body: timed
        ? `You have ${test.durationMinutes} minutes. The clock starts when you press Start test and the test submits itself when time runs out.`
        : "Work at your own pace.",
    },
    {
      icon: Repeat1,
      title: "One attempt",
      body: "You can take this test once. Your results stay here afterwards.",
    },
    {
      icon: MonitorSmartphone,
      title: "Stay on this tab",
      body: test.pauseAllowed
        ? "Switching tabs or apps is recorded. If you need a break, pause first."
        : "Switching tabs or apps is recorded.",
    },
    {
      icon: Save,
      title: "Saved as you go",
      body: "Your answers save automatically, even if your connection drops.",
    },
    {
      icon: Bot,
      title: "Tutor is off",
      body: "The AI tutor is turned off until you submit.",
    },
    ...(test.pauseAllowed
      ? [
          {
            icon: Pause,
            title: "Pausing",
            body: "You can pause this test. The question hides while paused.",
          },
        ]
      : []),
  ];
}

/** The gate the student must acknowledge before the attempt starts. */
export function InstructionsView({
  test,
  unitName,
  starting,
  error,
  onStart,
}: {
  test: PracticeTestInstructions;
  unitName: string | null;
  starting: boolean;
  error: string | null;
  onStart: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const checkId = useId();
  const meta = [
    unitName,
    FORMAT_LABELS[test.format] ?? test.format,
    DIFFICULTY_SHORT[test.difficulty] ?? test.difficulty,
    `${test.questionCount} questions`,
    test.mode === "timed" && test.durationMinutes
      ? `${test.durationMinutes} minutes`
      : "Untimed",
  ].filter(Boolean);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-8">
      <Link
        href="/dashboard/practice"
        className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Practice
      </Link>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {test.title}
        </h1>
        <p className="text-base text-muted-foreground">{meta.join(", ")}</p>
      </header>
      <section aria-labelledby="rules-title" className="flex flex-col gap-3">
        <h2 id="rules-title" className="text-lg font-semibold">
          Before you start
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rulesFor(test).map((rule) => (
            <li
              key={rule.title}
              className="flex gap-3 rounded-lg border bg-card p-4"
            >
              <rule.icon
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              />
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium">{rule.title}</h3>
                <p className="text-sm text-muted-foreground">{rule.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <label
        htmlFor={checkId}
        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border bg-card p-3"
      >
        <input
          id={checkId}
          type="checkbox"
          className="size-5 accent-primary"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>I understand. I have one attempt at this test.</span>
      </label>
      {error ? <FormAlert>{error}</FormAlert> : null}
      <div className="fixed inset-x-0 bottom-0 border-t bg-background p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0">
        <Button
          className="min-h-11 w-full px-6 sm:w-auto"
          disabled={!agreed || starting}
          onClick={onStart}
        >
          {starting ? (
            <>
              <LoaderCircle aria-hidden="true" className="animate-spin" />
              Starting...
            </>
          ) : (
            "Start test"
          )}
        </Button>
      </div>
    </div>
  );
}
