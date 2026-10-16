"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import "./globals.css";

/** Last-resort boundary for errors in the root layout itself. */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en-ZA">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground">
          Aptiverse could not load. Please try again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
