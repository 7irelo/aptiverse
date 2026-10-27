"use client";

import { useEffect, useRef, useState } from "react";

import { getPracticeTestStatus } from "@/lib/api/generated/endpoints/practice/practice";
import type { GenerationStatusResponse } from "@/lib/api/generated/model";

import { nextPollDelay } from "../lib/practice";

const GIVE_UP_MS = 5 * 60 * 1000;
const SLOW_MS = 90 * 1000;

export type GenerationPoll = {
  status: "queued" | "running" | "ready" | "failed" | "unknown";
  errorCode: string | null;
  slow: boolean;
  gaveUp: boolean;
};

/**
 * Polls GET /practice/tests/{id}/status with backoff (1 s, 2 s, 3 s, then
 * 5 s) until the test is ready or failed. Stops after five minutes.
 */
export function useGenerationStatus(
  testId: string | null,
  fetchStatus: (id: string) => Promise<GenerationStatusResponse> = (id) =>
    getPracticeTestStatus(id),
): GenerationPoll {
  const [state, setState] = useState<GenerationPoll>({
    status: "queued",
    errorCode: null,
    slow: false,
    gaveUp: false,
  });
  const fetchRef = useRef(fetchStatus);
  useEffect(() => {
    fetchRef.current = fetchStatus;
  }, [fetchStatus]);

  useEffect(() => {
    if (!testId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const started = Date.now();
    let attempt = 0;

    const poll = async () => {
      try {
        const result = await fetchRef.current(testId);
        if (cancelled) return;
        const status =
          result.status === "ready" ||
          result.status === "failed" ||
          result.status === "running" ||
          result.status === "queued"
            ? result.status
            : "unknown";
        const elapsed = Date.now() - started;
        setState({
          status,
          errorCode: result.errorCode ?? null,
          slow: elapsed > SLOW_MS,
          gaveUp: false,
        });
        if (status === "ready" || status === "failed") return;
      } catch {
        if (cancelled) return;
      }
      if (Date.now() - started > GIVE_UP_MS) {
        setState((s) => ({ ...s, gaveUp: true }));
        return;
      }
      timer = setTimeout(poll, nextPollDelay(attempt++));
    };
    timer = setTimeout(poll, nextPollDelay(attempt++));
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [testId]);

  return state;
}
