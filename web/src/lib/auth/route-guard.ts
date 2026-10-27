import { safeNextPath } from "@/features/auth/lib/safe-next";

import { resolveLanding, roleMayOpen } from "./landing";
import { primaryRole } from "./map-me";

/** Signed-in areas from the (app) and (onboarding) route groups. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/parent",
  "/refer",
  "/admin",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type GuardSession =
  | { state: "none" }
  /** The session just ended (refresh refused): the cookie is being cleared. */
  | { state: "ended" }
  | { state: "valid"; roles: readonly string[]; onboardingRequired: boolean };

export type GuardDecision =
  { action: "next" } | { action: "redirect"; to: string };

function loginUrl(next: string | null, reason?: string): string {
  const params = new URLSearchParams();
  if (reason) params.set("reason", reason);
  if (next) params.set("next", next);
  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

/**
 * Route protection for proxy.ts (FE-27, FE-104, FE-105), as a pure function:
 * - signed out on a protected path: to /login?next=<path>
 * - session just ended: to /login?reason=session-expired&next=<path>
 * - onboarding not finished (students and parents): to /onboarding
 * - onboarding finished but on /onboarding: to the role home
 * - another role's area: to the role home
 */
export function decideRoute(
  pathname: string,
  search: string,
  session: GuardSession,
): GuardDecision {
  if (!isProtectedPath(pathname)) return { action: "next" };
  const next = safeNextPath(`${pathname}${search}`);

  if (session.state === "none") {
    return { action: "redirect", to: loginUrl(next) };
  }
  if (session.state === "ended") {
    return { action: "redirect", to: loginUrl(next, "session-expired") };
  }

  const role = primaryRole(session.roles);
  if (!role) return { action: "redirect", to: loginUrl(null) };
  const onOnboarding =
    pathname === "/onboarding" || pathname.startsWith("/onboarding/");

  if (session.onboardingRequired && role !== "admin") {
    return onOnboarding
      ? { action: "next" }
      : { action: "redirect", to: "/onboarding" };
  }

  const landing = resolveLanding({
    role,
    roles: session.roles,
    onboardingRequired: false,
  });
  if (onOnboarding) return { action: "redirect", to: landing };
  if (!roleMayOpen(session.roles, pathname)) {
    return { action: "redirect", to: landing };
  }
  return { action: "next" };
}
