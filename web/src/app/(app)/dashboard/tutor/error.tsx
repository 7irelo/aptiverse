"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function AItutorError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <SegmentError error={error} retry={retry} heading="AI tutor" tag="tutor" />
  );
}
