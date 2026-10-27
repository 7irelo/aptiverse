"use client";

import { SegmentError } from "@/components/shell/segment-error";

export default function DashboardError({
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
      heading="Dashboard"
      tag="dashboard"
    />
  );
}
