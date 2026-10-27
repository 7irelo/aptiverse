"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { PageError } from "@/components/shell/page-error";

export default function OnboardingError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("route", "/onboarding");
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <PageError
      title="We could not load your setup"
      description="This is on our side, not yours. Try again in a moment."
      onRetry={retry}
    />
  );
}
