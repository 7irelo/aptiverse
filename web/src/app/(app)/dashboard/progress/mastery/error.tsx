"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function MasteryError({
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
      heading="Mastery"
      tag="mastery"
      title="We couldn't load your mastery"
      description="Check your connection and try again."
    />
  );
}
