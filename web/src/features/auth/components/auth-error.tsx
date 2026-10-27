"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { PageError } from "@/components/shell/page-error";

/**
 * Error boundary body for auth routes. Reports to Sentry with the route tag
 * only: the URL query (which can hold one-time tokens) is not attached.
 */
export function AuthRouteError({
  error,
  retry,
  route,
}: {
  error: unknown;
  retry: () => void;
  route: string;
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("route", route);
      Sentry.captureException(error);
    });
  }, [error, route]);

  return (
    <PageError
      title="This page did not load"
      description="This is on our side, not yours. Try again in a moment."
      onRetry={retry}
    />
  );
}
