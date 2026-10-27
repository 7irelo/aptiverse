"use client";

import { LoaderCircle, Plus, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormAlert } from "@/components/common/form-alert";
import {
  FieldShell,
  NativeInput,
  NativeSelect,
} from "@/components/common/native-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { stageWords, type Stage } from "@/features/academics/lib/stage";
import { useGenerationStatus } from "@/features/practice/hooks/use-generation-status";
import {
  defaultDuration,
  difficultyOptions,
  DIFFICULTY_SHORT,
  forcedMode,
  FORMAT_HELP,
  FORMAT_LABELS,
  formatsFor,
  GENERATION_STORAGE_KEY,
  PAPER_MARKS,
  usesQuestionCount,
} from "@/features/practice/lib/practice";
import {
  ApiError,
  errorCode,
  newIdempotencyKey,
  problemString,
} from "@/lib/api/fetcher";
import { useListUnitTopics } from "@/lib/api/generated/endpoints/academics/academics";
import { generatePracticeTest } from "@/lib/api/generated/endpoints/practice/practice";
import type { GeneratePracticeTestRequest } from "@/lib/api/generated/model";

export type AssessmentChoice = {
  id: string;
  title: string;
  type: string;
  enrolmentId: string;
  unitName: string;
  dueAt: string;
  upcoming: boolean;
};

type PracticeGeneratorProps = {
  stage: Stage;
  assessments: AssessmentChoice[];
  /** A generation already running (from ?job= or the active endpoint). */
  initialTestId: string | null;
  /** The live attempt, if any: generation is refused while it runs. */
  activeAttemptTestId: string | null;
  prefill: { assessmentId?: string; enrolmentId?: string; topic?: string };
  openOnLoad: boolean;
};

function readStoredJob(): string | null {
  try {
    return window.localStorage.getItem(GENERATION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeJob(testId: string | null) {
  try {
    if (testId) window.localStorage.setItem(GENERATION_STORAGE_KEY, testId);
    else window.localStorage.removeItem(GENERATION_STORAGE_KEY);
  } catch {
    // Storage can be blocked; the URL still carries the job.
  }
}

/** The "New practice test" sheet and the progress of a running generation. */
export function PracticeGenerator({
  stage,
  assessments,
  initialTestId,
  activeAttemptTestId,
  prefill,
  openOnLoad,
}: PracticeGeneratorProps) {
  const router = useRouter();
  const [testId, setTestId] = useState<string | null>(initialTestId);
  const [open, setOpen] = useState(openOnLoad);

  useEffect(() => {
    if (initialTestId) {
      storeJob(initialTestId);
      return;
    }
    const stored = readStoredJob();
    // Only resume a stored job when the server did not say nothing runs.
    if (stored) storeJob(null);
  }, [initialTestId]);

  function started(id: string) {
    setTestId(id);
    storeJob(id);
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("job", id);
    window.history.replaceState(null, "", url.toString());
  }

  function finished() {
    storeJob(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("job");
    window.history.replaceState(null, "", url.toString());
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="min-h-11 w-full px-4 sm:w-auto sm:self-start">
            <Plus aria-hidden="true" />
            New practice test
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>New practice test</DialogTitle>
            <DialogDescription>
              Practice is always for one of your assessments.
            </DialogDescription>
          </DialogHeader>
          {activeAttemptTestId ? (
            <FormAlert>
              <p>Finish your current test before starting a new one.</p>
              <div>
                <Button asChild className="min-h-11 px-4">
                  <Link href={`/dashboard/practice/${activeAttemptTestId}`}>
                    Resume test
                  </Link>
                </Button>
              </div>
            </FormAlert>
          ) : assessments.length === 0 ? (
            <div className="flex flex-col gap-3">
              <p className="text-base">
                Add an assessment first. Practice tests are built for the
                assessments you are preparing for.
              </p>
              <div>
                <Button asChild className="min-h-11 px-4">
                  <Link href="/dashboard/assessments/new">Add assessment</Link>
                </Button>
              </div>
            </div>
          ) : (
            <GenerateForm
              stage={stage}
              assessments={assessments}
              prefill={prefill}
              onStarted={started}
            />
          )}
        </DialogContent>
      </Dialog>
      {testId ? (
        <GenerationProgress
          key={testId}
          testId={testId}
          onFinished={finished}
          onRetry={() => {
            setTestId(null);
            finished();
            setOpen(true);
          }}
        />
      ) : null}
    </div>
  );
}

function GenerateForm({
  stage,
  assessments,
  prefill,
  onStarted,
}: {
  stage: Stage;
  assessments: AssessmentChoice[];
  prefill: PracticeGeneratorProps["prefill"];
  onStarted: (testId: string) => void;
}) {
  const words = stageWords(stage);
  const initialAssessment =
    assessments.find((a) => a.id === prefill.assessmentId) ??
    assessments.find(
      (a) => a.enrolmentId === prefill.enrolmentId && a.upcoming,
    ) ??
    assessments.find((a) => a.enrolmentId === prefill.enrolmentId) ??
    assessments.find((a) => a.upcoming) ??
    assessments[0]!;
  const [assessmentId, setAssessmentId] = useState(initialAssessment.id);
  const assessment =
    assessments.find((a) => a.id === assessmentId) ?? initialAssessment;
  const formats = formatsFor(stage, assessment.type);
  const [format, setFormat] = useState(formats[0]!);
  const effectiveFormat = formats.includes(format) ? format : formats[0]!;
  const forced = forcedMode(effectiveFormat);
  const [modeChoice, setModeChoice] = useState<"timed" | "untimed">("untimed");
  const mode = forced ?? modeChoice;
  const [questionCount, setQuestionCount] = useState(10);
  const [paperMarks, setPaperMarks] = useState(50);
  const [difficulty, setDifficulty] = useState("core");
  const [duration, setDuration] = useState<number | null>(null);
  const [topics, setTopics] = useState<string[]>(
    prefill.topic ? [prefill.topic] : [],
  );
  const [weakest, setWeakest] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{
    message: string;
    resumeTestId?: string;
  } | null>(null);
  const keyRef = useRef(newIdempotencyKey());

  const topicQuery = useListUnitTopics(assessment.enrolmentId, undefined, {
    query: { staleTime: 60_000 },
  });
  const topicOptions = useMemo(() => {
    const names = (topicQuery.data ?? []).map((t) => t.name);
    for (const t of topics) if (!names.includes(t)) names.unshift(t);
    return names;
  }, [topicQuery.data, topics]);

  const count = usesQuestionCount(effectiveFormat) ? questionCount : null;
  const minutes =
    mode === "timed" && effectiveFormat !== "exam_paper"
      ? (duration ?? defaultDuration(effectiveFormat, count ?? 5))
      : null;

  const summary = [
    effectiveFormat === "exam_paper"
      ? `${paperMarks} mark exam paper`
      : count
        ? `${count} ${FORMAT_LABELS[effectiveFormat]?.toLowerCase()} questions`
        : FORMAT_LABELS[effectiveFormat],
    weakest
      ? "on your weakest topics"
      : `on ${topics.length > 0 ? topics.join(", ") : "all topics"}`,
    DIFFICULTY_SHORT[difficulty]?.toLowerCase(),
    effectiveFormat === "exam_paper"
      ? `timed for ${paperMarks} minutes`
      : mode === "timed"
        ? `timed for ${minutes} minutes`
        : "untimed",
  ].join(", ");

  function toggleTopic(name: string) {
    setTopics((current) =>
      current.includes(name)
        ? current.filter((t) => t !== name)
        : current.length >= 8
          ? current
          : [...current, name],
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const body: GeneratePracticeTestRequest = {
      assessmentId: assessment.id,
      format: effectiveFormat,
      topics: weakest || topics.length === 0 ? null : topics,
      mode: forced ? null : mode,
      difficulty,
      focusOnWeakest: weakest,
      durationMinutes: minutes,
      questionCount: count,
      paperMarks: effectiveFormat === "exam_paper" ? paperMarks : null,
    };
    try {
      const accepted = await generatePracticeTest(body, {
        headers: { "Idempotency-Key": keyRef.current },
      });
      keyRef.current = newIdempotencyKey();
      onStarted(accepted.testId);
    } catch (e) {
      const code = errorCode(e);
      if (code === "practice.generation_in_progress") {
        setError({
          message:
            "A practice test is already being generated for you. Wait for it to finish before starting another.",
        });
      } else if (
        code === "practice.other_attempt_active" ||
        code === "practice.attempt_active"
      ) {
        setError({
          message: "Finish your current test before starting a new one.",
          resumeTestId: problemString(e, "testId"),
        });
      } else if (code === "practice.daily_limit_reached") {
        setError({
          message:
            "You have reached today's practice test limit. It resets at midnight UTC.",
        });
      } else if (e instanceof ApiError && e.status === 429) {
        setError({
          message:
            "You're generating tests quickly. Wait a minute and try again.",
        });
      } else if (e instanceof ApiError && e.status === 400) {
        setError({
          message:
            e.problem?.detail ??
            "Some settings do not fit this format. Check them and try again.",
        });
      } else {
        setError({
          message:
            "We could not start generating. Check your connection and try again.",
        });
      }
    } finally {
      setPending(false);
    }
  }

  const upcoming = assessments.filter((a) => a.upcoming);
  const written = assessments.filter((a) => !a.upcoming);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FieldShell
        id="gen-assessment"
        label="Practising for"
        hint={`${words.Noun}: ${assessment.unitName}`}
      >
        <NativeSelect
          id="gen-assessment"
          value={assessment.id}
          aria-describedby="gen-assessment-hint"
          onChange={(e) => {
            setAssessmentId(e.target.value);
            setTopics([]);
          }}
        >
          {upcoming.length > 0 ? (
            <optgroup label="Upcoming">
              {upcoming.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.unitName})
                </option>
              ))}
            </optgroup>
          ) : null}
          {written.length > 0 ? (
            <optgroup label="Already written">
              {written.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.unitName})
                </option>
              ))}
            </optgroup>
          ) : null}
        </NativeSelect>
      </FieldShell>

      <FieldShell
        id="gen-format"
        label="Format"
        hint={FORMAT_HELP[effectiveFormat]}
      >
        <NativeSelect
          id="gen-format"
          value={effectiveFormat}
          aria-describedby="gen-format-hint"
          onChange={(e) => setFormat(e.target.value)}
        >
          {formats.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </NativeSelect>
      </FieldShell>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">Topics (optional)</legend>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            className="size-5 accent-primary"
            checked={weakest}
            onChange={(e) => setWeakest(e.target.checked)}
          />
          Focus on my weakest topics
        </label>
        {topicQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Loading topics</p>
        ) : topicOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No topics yet. Leave this empty to cover all topics.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topicOptions.map((name) => {
              const on = topics.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={on}
                  disabled={weakest}
                  onClick={() => toggleTopic(name)}
                  className="min-h-11 rounded-full border px-3 text-sm disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <FieldShell id="gen-difficulty" label="Difficulty">
        <NativeSelect
          id="gen-difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          {difficultyOptions(stage).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      </FieldShell>

      {effectiveFormat === "exam_paper" ? (
        <FieldShell id="gen-marks" label="Paper size">
          <NativeSelect
            id="gen-marks"
            value={paperMarks}
            onChange={(e) => setPaperMarks(Number(e.target.value))}
          >
            {PAPER_MARKS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </NativeSelect>
        </FieldShell>
      ) : null}

      {usesQuestionCount(effectiveFormat) ? (
        <FieldShell id="gen-count" label="Number of questions" hint="5 to 40">
          <NativeInput
            id="gen-count"
            type="number"
            inputMode="numeric"
            min={5}
            max={40}
            value={questionCount}
            aria-describedby="gen-count-hint"
            onChange={(e) =>
              setQuestionCount(
                Math.min(40, Math.max(5, Number(e.target.value) || 5)),
              )
            }
          />
        </FieldShell>
      ) : null}

      {forced ? (
        <p className="text-sm text-muted-foreground">
          {forced === "timed"
            ? "An exam paper is always timed, at a minute a mark."
            : "Flashcards are always untimed."}
        </p>
      ) : (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Timing</legend>
          <div className="flex gap-2">
            {(["untimed", "timed"] as const).map((m) => (
              <label
                key={m}
                className="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 has-[:checked]:border-primary has-[:checked]:bg-muted"
              >
                <input
                  type="radio"
                  name="gen-mode"
                  value={m}
                  checked={modeChoice === m}
                  onChange={() => setModeChoice(m)}
                  className="accent-primary"
                />
                {m === "timed" ? "Timed" : "Untimed"}
              </label>
            ))}
          </div>
          {mode === "timed" ? (
            <FieldShell id="gen-duration" label="Minutes" hint="5 to 180">
              <NativeInput
                id="gen-duration"
                type="number"
                inputMode="numeric"
                min={5}
                max={180}
                value={minutes ?? ""}
                aria-describedby="gen-duration-hint"
                onChange={(e) =>
                  setDuration(
                    Math.min(180, Math.max(5, Number(e.target.value) || 5)),
                  )
                }
              />
            </FieldShell>
          ) : null}
        </fieldset>
      )}

      <p className="rounded-lg bg-muted p-3 text-sm">{summary}.</p>

      {error ? (
        <FormAlert>
          <p>{error.message}</p>
          {error.resumeTestId ? (
            <div>
              <Button asChild className="min-h-11 px-4">
                <Link href={`/dashboard/practice/${error.resumeTestId}`}>
                  Resume test
                </Link>
              </Button>
            </div>
          ) : null}
        </FormAlert>
      ) : null}

      <DialogFooter>
        <Button type="submit" className="min-h-11 px-4" disabled={pending}>
          {pending ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <Sparkles aria-hidden="true" />
          )}
          Generate test
        </Button>
      </DialogFooter>
    </form>
  );
}

function GenerationProgress({
  testId,
  onFinished,
  onRetry,
}: {
  testId: string;
  onFinished: () => void;
  onRetry: () => void;
}) {
  const router = useRouter();
  const poll = useGenerationStatus(testId);
  const notified = useRef(false);

  useEffect(() => {
    if (notified.current) return;
    if (poll.status === "ready") {
      notified.current = true;
      toast.success("Your test is ready", {
        action: {
          label: "Open test",
          onClick: () => router.push(`/dashboard/practice/${testId}`),
        },
      });
      onFinished();
    } else if (poll.status === "failed") {
      notified.current = true;
    }
  }, [poll.status, testId, onFinished, router]);

  return (
    <section
      aria-labelledby="generation-title"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <h2 id="generation-title" className="text-base font-semibold">
        {poll.status === "ready"
          ? "Your test is ready"
          : poll.status === "failed"
            ? "We could not generate this test"
            : "Generating your test"}
      </h2>
      <div aria-live="polite" className="flex flex-col gap-2">
        {poll.status === "ready" ? (
          <div>
            <Button asChild className="min-h-11 px-4">
              <Link href={`/dashboard/practice/${testId}`}>Open test</Link>
            </Button>
          </div>
        ) : poll.status === "failed" ? (
          <>
            <p className="text-base">
              We could not generate this test. Your quota was not used. Try
              again, or pick different topics.
            </p>
            <div>
              <Button
                variant="outline"
                className="min-h-11 px-4"
                onClick={onRetry}
              >
                <RotateCcw aria-hidden="true" />
                Try again
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-base">
              {poll.gaveUp
                ? "This is taking longer than usual. Come back in a few minutes; it keeps going."
                : poll.slow
                  ? "Still working on it. You can leave this page; we'll keep going."
                  : "Writing your questions... This usually takes under a minute."}
            </p>
            <Progress aria-label="Generating your test" className="h-1.5" />
            <p className="text-sm text-muted-foreground">
              We&apos;ll keep generating if you leave this page.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
