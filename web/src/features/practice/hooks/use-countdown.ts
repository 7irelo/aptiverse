"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  anchorFrom,
  announcementFor,
  remainingSeconds,
  type ClockAnchor,
} from "./server-clock";

type CountdownOptions = {
  /** Server deadline; null for untimed or paused attempts. */
  deadlineAt: string | null;
  /** serverNow from the response that carried the deadline. */
  serverNow: string;
  /** Frozen value to show while paused or untimed. */
  frozenSeconds?: number | null;
  onExpire?: () => void;
};

/**
 * Countdown to a server deadline. Ticks every 250 ms from a monotonic
 * anchor, resyncs whenever a newer serverNow arrives (call resync with it),
 * and reports the 5 minute and 1 minute marks for a polite announcement.
 */
export function useCountdown({
  deadlineAt,
  serverNow,
  frozenSeconds = null,
  onExpire,
}: CountdownOptions) {
  const anchorRef = useRef<ClockAnchor | null>(null);
  const [seconds, setSeconds] = useState<number | null>(() =>
    deadlineAt ? null : frozenSeconds,
  );
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const resync = useCallback((nextServerNow: string) => {
    anchorRef.current = anchorFrom(nextServerNow);
  }, []);

  useEffect(() => {
    anchorRef.current = anchorFrom(serverNow);
  }, [serverNow]);

  useEffect(() => {
    if (!deadlineAt) return;
    expiredRef.current = false;
    let previous = Number.POSITIVE_INFINITY;
    const tick = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const next = remainingSeconds(deadlineAt, anchor);
      setSeconds(next);
      const message = announcementFor(previous, next);
      if (message) setAnnouncement(message);
      previous = next;
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [deadlineAt]);

  return {
    seconds: deadlineAt ? seconds : frozenSeconds,
    announcement,
    resync,
  };
}
