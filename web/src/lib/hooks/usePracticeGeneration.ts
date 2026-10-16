"use client";

// One hook that owns the whole life of an AI practice-test generation, from
// "queue it" to "your test is ready".
//
// Generation is a background job on the API, not a request that blocks. The
// model calls run on a worker one at a time because production is a single
// 1 GiB burstable instance, so a generation can sit in a queue before it even
// starts. That means the browser must not be the thing holding the state: this
// hook keeps the job id in localStorage AND recovers it from the API's
// /generations/active endpoint, so a student can close the tab mid-generation,
// come back on their phone, and still be handed the finished test.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  generationKeys,
  queryKeys,
  useActiveGeneration,
  useGenerationJob,
  useStartGeneration,
  type GenerateTestInput,
  type GenerationJob,
  type PracticeFormat,
} from "@/lib/api/queries";
import type { ApiError } from "@/lib/api/fetcher";

// Where the in-flight job id is parked so a reload does not lose it. The API
// is still the source of truth; this only saves a round trip and keeps a
// finished-but-unopened job visible after it stops being "active".
const STORAGE_KEY = "aptiverse.practice.generation";

// How long the UI waits before it stops promising and starts being honest.
// The worker gives one attempt five minutes and will retry once, so a job can
// legitimately outlive this; the message says so rather than pretending the
// generation died.
const HARD_TIMEOUT_MS = 4 * 60_000;

export type PracticeGenerationPhase =
  | "idle"
  | "starting"
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "timeout";

export type PracticeGeneration = {
  phase: PracticeGenerationPhase;
  // True while there is something worth showing a waiting state for.
  isWorking: boolean;
  job: GenerationJob | null;
  format: PracticeFormat | null;
  practiceTestId: string | null;
  // A real sentence for the student, never a bare code. Null when nothing has
  // gone wrong.
  error: string | null;
  // Milliseconds since the job was queued, for a "this is taking a while" line.
  elapsedMs: number;
  start: (input: GenerateTestInput) => void;
  // Clears the banner and forgets the job locally. The job itself is already
  // finished by the time this is offered.
  dismiss: () => void;
};

function readStoredJobId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredJobId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private browsing with storage disabled. The API's active-job endpoint
    // still recovers the job, so this is a nicety, not a requirement.
  }
}

export function usePracticeGeneration(): PracticeGeneration {
  const qc = useQueryClient();
  const [jobId, setJobId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const handled = useRef<string | null>(null);

  // Adopt whatever this browser last knew about, after hydration so the server
  // and client render the same first frame.
  useEffect(() => {
    const stored = readStoredJobId();
    if (stored) setJobId(stored);
  }, []);

  // Nothing local? Ask the API whether this student has one in flight. Only
  // worth asking while we have no job of our own.
  const activeQuery = useActiveGeneration(jobId === null);
  useEffect(() => {
    const active = activeQuery.data;
    if (active && !jobId) {
      setJobId(active.id);
      writeStoredJobId(active.id);
    }
  }, [activeQuery.data, jobId]);

  const jobQuery = useGenerationJob(jobId);
  const job = jobQuery.data ?? null;

  const starter = useStartGeneration();

  const start = useCallback(
    (input: GenerateTestInput) => {
      setStartError(null);
      setTimedOut(false);
      starter.mutate(input, {
        onSuccess: (queued) => {
          handled.current = null;
          setJobId(queued.id);
          writeStoredJobId(queued.id);
          qc.setQueryData(generationKeys.job(queued.id), queued);
        },
        onError: (err: ApiError) => {
          setStartError(
            err.status === 402
              ? "You've used this month's practice-test generations. Upgrade your plan for more."
              : err.status === 503
                ? "AI generation isn't available on this environment right now."
                : "We couldn't start the generation. Please try again.",
          );
        },
      });
    },
    [qc, starter],
  );

  const dismiss = useCallback(() => {
    setJobId(null);
    setStartError(null);
    setTimedOut(false);
    handled.current = null;
    writeStoredJobId(null);
    void qc.invalidateQueries({ queryKey: generationKeys.active() });
  }, [qc]);

  // A finished job means the practice list is out of date. Do this once per
  // job rather than on every poll.
  useEffect(() => {
    if (!job || handled.current === job.id) return;
    if (job.status === "succeeded" || job.status === "failed") {
      handled.current = job.id;
      void qc.invalidateQueries({ queryKey: queryKeys.practiceTests() });
      void qc.invalidateQueries({ queryKey: generationKeys.active() });
    }
  }, [job, qc]);

  // A one-second tick, only while something is actually running, so the
  // elapsed line moves and the hard timeout can fire.
  const unsettled = !!job && (job.status === "queued" || job.status === "running");
  useEffect(() => {
    if (!unsettled) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [unsettled]);

  const elapsedMs = useMemo(() => {
    if (!job) return 0;
    const started = new Date(job.createdAt).getTime();
    if (Number.isNaN(started)) return 0;
    return Math.max(0, now - started);
  }, [job, now]);

  useEffect(() => {
    if (unsettled && elapsedMs > HARD_TIMEOUT_MS) setTimedOut(true);
  }, [unsettled, elapsedMs]);

  const phase: PracticeGenerationPhase = starter.isPending
    ? "starting"
    : timedOut && unsettled
      ? "timeout"
      : startError
        ? "failed"
        : job
          ? job.status
          : "idle";

  return {
    phase,
    isWorking: phase === "starting" || phase === "queued" || phase === "running",
    job,
    format: job?.format ?? null,
    practiceTestId: job?.practiceTestId ?? null,
    error:
      startError ??
      (phase === "timeout"
        ? "This is taking longer than it should. It is still running on our side, so leave this page open or check back in a few minutes and the test will be in your list."
        : (job?.error ?? null)),
    elapsedMs,
    start,
    dismiss,
  };
}
