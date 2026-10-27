"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function GoalsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <SegmentError
      error={error}
      retry={retry}
      heading="Goals"
      tag="goals"
      title="We couldn't load your goals"
      description="Check your connection and try again."
    />
  );
}
