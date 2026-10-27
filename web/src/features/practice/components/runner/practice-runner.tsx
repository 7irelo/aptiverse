"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAutosave } from "@/features/practice/hooks/use-autosave";
import { useCountdown } from "@/features/practice/hooks/use-countdown";
import { useFocusMonitor } from "@/features/practice/hooks/use-focus-monitor";
import { ApiError, errorCode } from "@/lib/api/fetcher";
import {
  pausePracticeAttempt,
  reportFocusLoss,
  resumePracticeAttempt,
  startPracticeAttempt,
  submitPracticeAttempt,
} from "@/lib/api/generated/endpoints/practice/practice";
import type {
  AttemptState,
  PracticeTestInstructions,
} from "@/lib/api/generated/model";
import { formatClock } from "@/lib/format/date";

import { InstructionsView } from "./instructions-view";
import { isAnswered, QuestionView } from "./question-view";
import {
  CenteredState,
  OfflineBanner,
  QuestionGrid,
  ReviewView,
  RunnerTopBar,
} from "./runner-parts";

type Phase = "active" | "paused" | "review" | "submitting" | "time-up";

/**
 * The practice runner. A small state machine over views: instructions gate,
 * active question, paused, review, submitting and time up. The server owns
 * the clock, the single attempt and the deadline; this only displays them.
 * After submission the page re-renders on the server with the results.
 */
export function PracticeRunner({
  test,
  unitName,
}: {
  test: PracticeTestInstructions;
  unitName: string | null;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<AttemptState | null>(
    test.activeAttempt,
  );
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  async function start() {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    try {
      setAttempt(await startPracticeAttempt(test.id));
    } catch (error) {
      const code = errorCode(error);
      if (code === "practice.attempt_exists") {
        router.refresh();
        return;
      }
      setStartError(
        code === "practice.other_attempt_active"
          ? "You have another test in progress. Finish it before starting this one."
          : "We could not start the test. Your attempt has not been used. Try again.",
      );
    } finally {
      setStarting(false);
    }
  }

  if (!attempt) {
    return (
      <InstructionsView
        test={test}
        unitName={unitName}
        starting={starting}
        error={startError}
        onStart={() => void start()}
      />
    );
  }

  return (
    <ActiveAttempt
      key={attempt.attemptId}
      initial={attempt}
      pauseAllowed={test.pauseAllowed}
      onFinished={() => {
        router.replace(`/dashboard/practice/${test.id}?submitted=1`);
        router.refresh();
      }}
    />
  );
}

function ActiveAttempt({
  initial,
  pauseAllowed,
  onFinished,
}: {
  initial: AttemptState;
  pauseAllowed: boolean;
  onFinished: () => void;
}) {
  const [state, setState] = useState(initial);
  const [phase, setPhase] = useState<Phase>(
    initial.paused ? "paused" : "active",
  );
  const [index, setIndex] = useState(0);
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [navOpen, setNavOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [focusDialog, setFocusDialog] = useState(false);
  const [focusCount, setFocusCount] = useState(initial.focusLossCount);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
  const submittedRef = useRef(false);

  const timed = state.mode === "timed" && !!state.deadlineAt;
  const questions = state.questions;
  const total = questions.length;

  const countdown = useCountdown({
    deadlineAt: phase === "paused" ? null : state.deadlineAt,
    serverNow: state.serverNow,
    frozenSeconds: state.remainingSeconds,
    onExpire: () => void timeUp(),
  });

  const { answers, setAnswer, status, sync } = useAutosave({
    attemptId: state.attemptId,
    initial: state.answers,
    onSaved: countdown.resync,
  });

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const inTest = phase === "active" || phase === "review";
  useEffect(() => {
    if (!inTest) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [inTest]);

  const report = useCallback(
    (kind: "visibility_hidden" | "window_blur") => {
      reportFocusLoss(state.attemptId, { kind })
        .then((r) => setFocusCount(r.focusLossCount))
        .catch(() => setFocusCount((c) => c + 1));
    },
    [state.attemptId],
  );
  useFocusMonitor({
    enabled: inTest && !navOpen && !confirmOpen && !focusDialog,
    report,
    onReturn: () => setFocusDialog(true),
  });

  const answeredAt = (i: number) => isAnswered(answers[questions[i]!.id]);
  const flaggedAt = (i: number) => flags.has(questions[i]!.id);

  function goTo(next: number) {
    const current = questions[index];
    if (current) void sync.flush(current.id);
    setIndex(Math.max(0, Math.min(total - 1, next)));
    setPhase("active");
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }

  async function submit(source: "student" | "deadline") {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setPhase(source === "deadline" ? "time-up" : "submitting");
    setSubmitError(null);
    await sync.flush().catch(() => undefined);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await submitPracticeAttempt(state.attemptId);
        sync.close(true);
        onFinished();
        return;
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          // Already submitted, or the server's auto-submit owns it now.
          sync.close(true);
          onFinished();
          return;
        }
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    submittedRef.current = false;
    if (source === "deadline") {
      // The server auto-submits at the deadline regardless.
      sync.close(true);
      onFinished();
      return;
    }
    setPhase("review");
    setSubmitError(
      "We could not submit yet. Your answers are saved. Check your connection and try again.",
    );
  }

  async function timeUp() {
    await submit("deadline");
  }

  async function pause() {
    await sync.flush().catch(() => undefined);
    try {
      const paused = await pausePracticeAttempt(state.attemptId);
      setState(paused);
      setPhase("paused");
    } catch {
      // Stay active; nothing was lost.
    }
  }

  async function resume() {
    try {
      const resumed = await resumePracticeAttempt(state.attemptId);
      setState(resumed);
      setPhase("active");
    } catch {
      // Remain paused and let them try again.
    }
  }

  function requestSubmit() {
    const unanswered = questions.filter((_, i) => !answeredAt(i)).length;
    if (unanswered > 0) setConfirmOpen(true);
    else void submit("student");
  }

  const unansweredCount = questions.filter((_, i) => !answeredAt(i)).length;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-background">
      {phase === "submitting" ? (
        <CenteredState busy title="Submitting your answers..." />
      ) : phase === "time-up" ? (
        <CenteredState
          busy
          title="Time is up"
          body="Your answers were submitted."
        />
      ) : phase === "paused" ? (
        <CenteredState
          title="Test paused"
          body={`The clock has stopped.${
            state.remainingSeconds !== null
              ? ` Time left: ${formatClock(state.remainingSeconds)}.`
              : ""
          }`}
        >
          <Button className="min-h-11 px-4" onClick={() => void resume()}>
            Resume test
          </Button>
        </CenteredState>
      ) : (
        <>
          <RunnerTopBar
            index={index}
            total={total}
            seconds={countdown.seconds}
            timed={timed}
            saveStatus={status}
            canPause={pauseAllowed && !timed && phase === "active"}
            onPause={() => void pause()}
            onOpenNavigator={() => setNavOpen(true)}
            announcement={countdown.announcement}
          />
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 pb-28">
            {!online || status === "offline" ? <OfflineBanner /> : null}
            {status === "conflict" ? (
              <p role="alert" className="rounded-lg border p-3 text-sm">
                This answer changed somewhere else since you loaded it. Reload
                the test to see the latest answers.
              </p>
            ) : null}
            {phase === "review" ? (
              <ReviewView
                questions={questions}
                answered={answeredAt}
                flagged={flaggedAt}
                onGoTo={goTo}
                onSubmit={requestSubmit}
                onKeepWorking={() => setPhase("active")}
                submitting={false}
                error={submitError}
              />
            ) : questions[index] ? (
              <QuestionView
                key={questions[index].id}
                question={questions[index]}
                index={index}
                total={total}
                answer={answers[questions[index].id]}
                flagged={flaggedAt(index)}
                disabled={status === "closed"}
                onAnswer={(value) => setAnswer(questions[index]!.id, value)}
                onToggleFlag={() =>
                  setFlags((current) => {
                    const next = new Set(current);
                    const id = questions[index]!.id;
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
              />
            ) : null}
          </div>
          {phase === "active" ? (
            <div className="fixed inset-x-0 bottom-0 border-t bg-background">
              <div className="mx-auto flex w-full max-w-3xl gap-2 px-4 py-3">
                <Button
                  variant="outline"
                  className="min-h-11 flex-1 px-4"
                  disabled={index === 0}
                  onClick={() => goTo(index - 1)}
                >
                  <ChevronLeft aria-hidden="true" />
                  Previous
                </Button>
                {index < total - 1 ? (
                  <Button
                    className="min-h-11 flex-1 px-4"
                    onClick={() => goTo(index + 1)}
                  >
                    Next
                    <ChevronRight aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    className="min-h-11 flex-1 px-4"
                    onClick={() => {
                      void sync.flush();
                      setPhase("review");
                    }}
                  >
                    Review answers
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="bottom"
          className="z-50 max-h-[80dvh] overflow-y-auto p-4"
        >
          <SheetHeader className="p-0">
            <SheetTitle>Questions</SheetTitle>
            <SheetDescription>Jump to any question.</SheetDescription>
          </SheetHeader>
          <QuestionGrid
            total={total}
            current={index}
            answered={answeredAt}
            flagged={flaggedAt}
            onJump={goTo}
          />
          <Button
            className="min-h-11 px-4"
            onClick={() => {
              setNavOpen(false);
              void sync.flush();
              setPhase("review");
            }}
          >
            Review and submit
          </Button>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Submit with unanswered questions?</DialogTitle>
            <DialogDescription>
              You have {unansweredCount} unanswered{" "}
              {unansweredCount === 1 ? "question" : "questions"}. Submit anyway?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="min-h-11 px-4"
              onClick={() => setConfirmOpen(false)}
            >
              Keep working
            </Button>
            <Button
              className="min-h-11 px-4"
              onClick={() => {
                setConfirmOpen(false);
                void submit("student");
              }}
            >
              Submit test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={focusDialog} onOpenChange={setFocusDialog}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>You left the test</DialogTitle>
            <DialogDescription>
              Leaving the test tab is recorded. This has been recorded{" "}
              {focusCount} {focusCount === 1 ? "time" : "times"}.
              {pauseAllowed && !timed
                ? " Pause first if you need a break."
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="min-h-11 px-4"
              onClick={() => setFocusDialog(false)}
            >
              Back to the test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
