"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLOW_AFTER_MS = 8_000;

/**
 * Primary submit button for auth forms. Never gated on client validity (a
 * tap before hydration still posts the form). While pending it is disabled
 * and busy, and after 8 seconds it says so.
 */
export function SubmitButton({
  pending,
  done = false,
  pendingLabel,
  slowLabel = "Still working, please keep this page open...",
  children,
  className,
}: {
  pending: boolean;
  /** Keeps the button disabled after success until the page changes. */
  done?: boolean;
  pendingLabel: string;
  slowLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [pending]);

  const busy = pending || done;
  return (
    <Button
      type="submit"
      size="lg"
      disabled={busy}
      aria-busy={busy || undefined}
      className={cn("min-h-11 w-full text-base", className)}
    >
      {busy ? (
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin motion-reduce:animate-none"
        />
      ) : null}
      {busy ? (slow ? slowLabel : pendingLabel) : children}
    </Button>
  );
}
