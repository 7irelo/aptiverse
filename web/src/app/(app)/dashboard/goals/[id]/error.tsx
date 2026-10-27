"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function GoalError({
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
      heading="Goal"
      tag="goal-detail"
      title="We couldn't load this goal"
      description="Check your connection and try again."
    />
  );
}
