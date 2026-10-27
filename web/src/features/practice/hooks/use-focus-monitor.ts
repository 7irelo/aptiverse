"use client";

import { useEffect, useRef } from "react";

export type FocusLossKind = "visibility_hidden" | "window_blur";

/**
 * Counts a blur and a hidden event close together once. Returns true when
 * the event at `now` should be reported.
 */
export function createFocusThrottle(windowMs = 1000) {
  let last = Number.NEGATIVE_INFINITY;
  return (now: number): boolean => {
    if (now - last < windowMs) return false;
    last = now;
    return true;
  };
}

/**
 * Watches for the student leaving the test tab or app. Reports each loss
 * once (a blur and a visibility change within a second count once), never
 * while disabled (before start, paused, or while a runner dialog is open),
 * and calls onReturn when they come back. Leaving is recorded, not punished.
 */
export function useFocusMonitor({
  enabled,
  report,
  onReturn,
  windowMs = 1000,
}: {
  enabled: boolean;
  report: (kind: FocusLossKind) => void;
  onReturn?: () => void;
  windowMs?: number;
}) {
  const reportRef = useRef(report);
  const returnRef = useRef(onReturn);
  useEffect(() => {
    reportRef.current = report;
    returnRef.current = onReturn;
  }, [report, onReturn]);

  useEffect(() => {
    if (!enabled) return;
    const shouldCount = createFocusThrottle(windowMs);
    let away = false;
    const lose = (kind: FocusLossKind) => {
      if (shouldCount(Date.now())) reportRef.current(kind);
      away = true;
    };
    const back = () => {
      if (!away) return;
      away = false;
      returnRef.current?.();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") lose("visibility_hidden");
      else back();
    };
    const onBlur = () => lose("window_blur");
    const onFocus = () => back();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, windowMs]);
}
