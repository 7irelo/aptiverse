"use client";

import * as Sentry from "@sentry/nextjs";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { PageContainer } from "@/components/shell/page-container";
import { PageState } from "@/components/shell/page-state";
import { Button } from "@/components/ui/button";

export default function HelpError({
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
    <PageContainer className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold tracking-tight">Help and FAQs</h1>
      <PageState
        icon="error"
        title="We could not load the questions"
        description="This is on our side, not yours. Check your connection and try again in a moment."
      >
        <Button size="lg" onClick={() => retry()}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
      </PageState>
    </PageContainer>
  );
}
