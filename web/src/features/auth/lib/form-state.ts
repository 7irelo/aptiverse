import { ApiError } from "@/lib/api/fetcher";

/**
 * What every auth and onboarding server action returns to its form. Never
 * carries a token, and never says whether an account exists.
 */
export type FormBanner = {
  tone: "error" | "info";
  message: string;
  /** Optional link shown after the message. */
  link?: { href: string; label: string };
};

export type FormState = {
  status: "idle" | "error" | "success";
  banner?: FormBanner;
  /** Field name to messages, straight from the API where it gave them. */
  fieldErrors?: Record<string, string[]>;
  /** Fields the form should empty, for example the password after a mismatch. */
  resetFields?: string[];
  /** Where the client should navigate on success (a full page load). */
  redirectTo?: string;
  /** Bumped on every result, so the client can react to repeat errors. */
  at?: number;
};

export const IDLE: FormState = { status: "idle" };

export function errorState(
  banner: FormBanner | undefined,
  fieldErrors?: Record<string, string[]>,
): FormState {
  return { status: "error", banner, fieldErrors, at: Date.now() };
}

/** Whole minutes, at least one, for "Try again in {n} minutes". */
export function minutesFrom(seconds: number | undefined): number | undefined {
  if (seconds === undefined) return undefined;
  return Math.max(1, Math.ceil(seconds / 60));
}

export function waitCopy(seconds: number | undefined): string {
  const minutes = minutesFrom(seconds);
  if (minutes === undefined) return "a few minutes";
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

/** Field errors from a ProblemDetails `errors` map, with lower camel keys. */
export function problemFieldErrors(
  error: unknown,
): Record<string, string[]> | undefined {
  if (!(error instanceof ApiError)) return undefined;
  const errors = error.problem?.errors;
  if (!errors || typeof errors !== "object") return undefined;
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(
    errors as Record<string, unknown>,
  )) {
    if (!Array.isArray(value)) continue;
    const messages = value.filter((m): m is string => typeof m === "string");
    if (messages.length === 0) continue;
    const name = key.length > 0 ? key[0]!.toLowerCase() + key.slice(1) : key;
    out[name] = messages;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/** The API's `detail`, when it gave one. */
export function problemDetail(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  const detail = error.problem?.detail;
  return typeof detail === "string" && detail.trim() ? detail : undefined;
}

/** Banner for a 429: the API detail, else a fallback with the wait time. */
export function rateLimitBanner(
  error: unknown,
  fallback: (wait: string) => string,
  link?: FormBanner["link"],
): FormBanner {
  const seconds =
    error instanceof ApiError ? error.retryAfterSeconds : undefined;
  return {
    tone: "error",
    message: tooManyMessage(problemDetail(error), seconds, fallback),
    link,
  };
}

/**
 * The API detail (verbatim) plus the wait from Retry-After, or the fallback
 * copy with the wait filled in. The wait always comes from the API.
 */
export function tooManyMessage(
  detail: string | undefined,
  retryAfterSeconds: number | undefined,
  fallback: (wait: string) => string,
): string {
  const wait = waitCopy(retryAfterSeconds);
  if (!detail) return fallback(wait);
  return retryAfterSeconds === undefined
    ? detail
    : `${detail} You can try again in ${wait}.`;
}

export function isApiStatus(error: unknown, status: number): boolean {
  return error instanceof ApiError && error.status === status;
}
