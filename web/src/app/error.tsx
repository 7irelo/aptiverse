"use client";

import * as Sentry from "@sentry/nextjs";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { PageContainer } from "@/components/shell/page-container";
import { PageState } from "@/components/shell/page-state";
import { Button } from "@/components/ui/button";

export default function RootError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <PageContainer>
      <PageState
        icon="error"
        title="Something went wrong"
        description="This page did not load properly. Please try again."
      >
        <Button size="lg" onClick={() => retry()}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      </PageState>
    </PageContainer>
  );
}
