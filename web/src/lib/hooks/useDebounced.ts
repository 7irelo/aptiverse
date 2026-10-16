"use client";

import { useEffect, useState } from "react";

/**
 * The value, held back until it has stopped changing for `delay` ms.
 *
 * For search boxes that drive a server query: typing "thandi" should be one
 * request, not six, and without this the intermediate results also arrive out
 * of order and flicker.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
