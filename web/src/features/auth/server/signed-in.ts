import "server-only";

import { resolveLanding } from "@/lib/auth/landing";
import { primaryRole } from "@/lib/auth/map-me";
import { readSession } from "@/lib/auth/session-store";

/**
 * Where a signed-in visitor of an auth page should go instead, or null when
 * nobody is signed in. "Signed in" means a session proxy.ts could keep
 * fresh, not merely a cookie, so a stale session sees the form rather than
 * looping between /login and the dashboard.
 */
export async function signedInLanding(
  next?: string | null,
): Promise<string | null> {
  const session = await readSession();
  if (!session || session.accessTokenExpiresAt <= Date.now()) return null;
  const role = primaryRole(session.roles);
  if (!role) return null;
  return resolveLanding({
    role,
    roles: session.roles,
    onboardingRequired: session.onboardingRequired,
    next,
  });
}
