"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// SSR-safe "X minutes ago" — renders empty during server render + first
// client paint, then fills in after hydration. Using formatRelative()
// inline produces different output on server vs client (Date.now()
// changes), which throws a hydration warning. This component sidesteps
// that by deferring the calculation to useEffect.
export function RelativeTime({ iso }: { iso: string | Date | undefined | null }) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (iso) setText(dayjs(iso).fromNow());
  }, [iso]);

  return <>{text}</>;
}
