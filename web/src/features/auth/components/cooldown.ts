"use client";

import { useEffect, useState } from "react";

/**
 * A client-side courtesy countdown that starts at `startedAt` (epoch ms, for
 * example the time of the last successful send). The API's own limits are
 * the real guard, so small clock differences do not matter; the count is
 * clamped to the window either way.
 */
export function useCooldown(seconds: number, startedAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === undefined) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  const left =
    startedAt === undefined
      ? 0
      : Math.min(
          seconds,
          Math.max(0, Math.ceil((startedAt + seconds * 1000 - now) / 1000)),
        );
  return { left, active: left > 0 };
}
