import * as Sentry from "@sentry/nextjs";

/**
 * Server and edge Sentry setup. Sentry stays off unless
 * NEXT_PUBLIC_SENTRY_DSN is set, so local dev and CI send nothing.
 */
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
