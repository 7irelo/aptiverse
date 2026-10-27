"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function AssessmentError({
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
      heading="Assessment"
      tag="assessment-detail"
    />
  );
}
