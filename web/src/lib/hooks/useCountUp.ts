"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const EASE_OUT_QUART = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Animated count from the current displayed value to `target`. Fires on
 * mount when target first becomes a number, and again whenever target
 * changes, animating from the previously-shown value to the new one
 * (not from zero) so a refetch returning 89 after 87 reads as 87 -> 89,
 * not 0 -> 89.
 *
 * Respects prefers-reduced-motion via framer-motion's useReducedMotion()
 * (which honours the MotionConfig wrapper at the app root). When
 * reduced, the final value lands immediately with no animation.
 *
 * Returns 0 when target is null/undefined, otherwise the animated
 * integer. Use in a data-driven display numeral:
 *
 *   const animated = useCountUp(predictedAverage);
 *   <Typography>{animated}</Typography>
 */
export function useCountUp(
  target: number | null | undefined,
  durationMs = 600,
): number {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof target !== "number") return;
    if (reduceMotion) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const startValue = value;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = EASE_OUT_QUART(t);
      setValue(Math.round(startValue + (target - startValue) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // We intentionally exclude `value` from deps: it's the starting
    // point of the animation, captured once at effect run; including
    // it would restart the animation on every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs, reduceMotion]);

  return value;
}
