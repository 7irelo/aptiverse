"use client";

import { useEffect, useState } from "react";

import { saveAttemptAnswer } from "@/lib/api/generated/endpoints/practice/practice";
import type { SavedAnswerView } from "@/lib/api/generated/model";

import {
  AnswerSync,
  type AnswerValue,
  type SaveFn,
  type SyncStatus,
} from "./answer-sync";

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Autosave for one attempt: answers held locally, saved through the BFF
 * with the revision, and flushed on pagehide.
 */
export function useAutosave({
  attemptId,
  initial,
  onSaved,
  save,
}: {
  attemptId: string;
  initial: readonly SavedAnswerView[];
  onSaved?: (savedAt: string) => void;
  save?: SaveFn;
}) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [sync] = useState(
    () =>
      new AnswerSync({
        attemptId,
        initial,
        save:
          save ??
          ((questionId, body) =>
            saveAttemptAnswer(attemptId, questionId, body)),
        onStatus: setStatus,
        storage: typeof window === "undefined" ? null : browserStorage(),
      }),
  );
  useEffect(() => {
    sync.setOnSaved(onSaved);
  }, [sync, onSaved]);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() =>
    sync.answers(),
  );

  useEffect(() => {
    sync.replay();
    const onHide = () => void sync.flush();
    window.addEventListener("pagehide", onHide);
    const onOnline = () => sync.replay();
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("online", onOnline);
    };
  }, [sync]);

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    sync.set(questionId, value);
  }

  return { answers, setAnswer, status, sync };
}
