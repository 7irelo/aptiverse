/**
 * Server-authoritative time. The client never trusts its own wall clock for
 * deadlines: at each server response it records the server's time and a
 * monotonic performance.now() anchor, and measures elapsed time from that
 * anchor. Changing the phone's clock does not move the countdown.
 */
export type ClockAnchor = {
  /** Server time (epoch ms) when the response was produced. */
  serverNowMs: number;
  /** performance.now() when the response arrived. */
  perfAnchor: number;
};

export function anchorFrom(
  serverNow: string,
  perfNow: number = performance.now(),
): ClockAnchor {
  return { serverNowMs: Date.parse(serverNow), perfAnchor: perfNow };
}

/** The server's current time, estimated from the anchor. */
export function estimateServerNow(
  anchor: ClockAnchor,
  perfNow: number = performance.now(),
): number {
  return anchor.serverNowMs + Math.max(0, perfNow - anchor.perfAnchor);
}

/** Whole seconds left until the deadline, never below zero. */
export function remainingSeconds(
  deadlineAt: string,
  anchor: ClockAnchor,
  perfNow: number = performance.now(),
): number {
  const ms = Date.parse(deadlineAt) - estimateServerNow(anchor, perfNow);
  return Math.max(0, Math.ceil(ms / 1000));
}

/** Seconds at which the countdown is announced to screen readers. */
export const ANNOUNCE_AT = [300, 60] as const;

export function announcementFor(previous: number, next: number): string | null {
  // The first tick has no previous value: never announce on mount.
  if (!Number.isFinite(previous)) return null;
  for (const mark of ANNOUNCE_AT) {
    if (previous > mark && next <= mark) {
      return mark === 300 ? "5 minutes left" : "1 minute left";
    }
  }
  return null;
}
