"use client";

import { useEffect, useState } from "react";

// Re-renders on an interval so we can show "live" feeling values without a backend.
export function useTicker(intervalMs = 1000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
