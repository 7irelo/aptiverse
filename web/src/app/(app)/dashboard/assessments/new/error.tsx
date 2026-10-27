"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function AddassessmentError({
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
      heading="Add assessment"
      tag="assessment-new"
    />
  );
}
