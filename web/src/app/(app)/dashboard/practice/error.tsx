"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function PracticeError({
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
      heading="Practice"
      tag="practice"
    />
  );
}
