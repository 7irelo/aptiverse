"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SLOW_MS = 2 * 60 * 1000;

/** Shown while written answers are marked. Re-checks every few seconds. */
export function GradingWaiter() {
  const router = useRouter();
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(() => {
      if (Date.now() - started > SLOW_MS) setSlow(true);
      router.refresh();
    }, 3000);
    return () => window.clearInterval(id);
  }, [router]);

  return (
    <div
      role="status"
      className="mx-auto flex min-h-[50dvh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center"
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none"
      />
      <h1 className="text-xl font-semibold">Marking your answers...</h1>
      <p className="text-base text-muted-foreground">
        {slow
          ? "Marking is taking longer than usual. Come back in a few minutes; your results will be here."
          : "Short answers take a little longer."}
      </p>
    </div>
  );
}
