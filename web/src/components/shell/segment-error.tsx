"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { PageError } from "@/components/shell/page-error";

type SegmentErrorProps = {
  error: unknown;
  retry: () => void;
  /** The page's heading, kept so the outline stays the same on error. */
  heading: string;
  title?: string;
  description?: string;
  tag: string;
};

/** Body of a route segment's error.tsx: heading plus PageError with retry. */
export function SegmentError({
  error,
  retry,
  heading,
  title,
  description,
  tag,
}: SegmentErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { page: tag } });
  }, [error, tag]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {heading}
      </h1>
      <PageError title={title} description={description} onRetry={retry} />
    </div>
  );
}
