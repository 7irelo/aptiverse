"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function PracticetestError({
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
      heading="Practice test"
      tag="practice-runner"
    />
  );
}
