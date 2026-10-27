import { NextResponse, type NextRequest } from "next/server";

import {
  decodeSession,
  encodeSession,
  sessionMaxAgeSeconds,
} from "@/lib/auth/api-session";
import { sessionCookieName, sessionCookieOptions } from "@/lib/auth/config";
import { ensureFreshSession } from "@/lib/auth/fresh-session";
import { isRole } from "@/lib/auth/map-me";
import { decideRoute, type GuardSession } from "@/lib/auth/route-guard";
import { devToolsEnabled } from "@/lib/dev-tools";

/** Matches DEV_SESSION_COOKIE in src/lib/auth (kept here to stay server-only free). */
const DEV_SESSION_COOKIE = "aptiverse-dev-session";

/**
 * Request proxy (Next 16's replacement for middleware). Runs before every
 * signed-in page and the auth pages:
 *
 * 1. Rotates the API tokens shortly before they expire (one shared refresh
 *    per refresh token, see src/lib/auth/refresh.ts) and writes them to the
 *    session cookie, both on the response and on the request the page
 *    renders with. Server Components never refresh: they cannot write
 *    cookies, and an unsaved rotation would end the session.
 * 2. Clears the cookie when the API refuses the refresh token.
 * 3. Protects the app: signed out to /login?next=, unfinished onboarding to
 *    /onboarding, another role's area to the role home (route-guard.ts).
 *
 * Security headers live in next.config.ts so they also apply to static
 * pages that never reach this proxy.
 */
export async function proxy(request: NextRequest) {
  const name = sessionCookieName();
  const fresh = await ensureFreshSession(
    await decodeSession(request.cookies.get(name)?.value),
  );

  let guard: GuardSession;
  switch (fresh.state) {
    case "valid":
    case "unavailable":
      // An API outage is not a sign-out: let the page show its error state.
      guard = {
        state: "valid",
        roles: fresh.session.roles,
        onboardingRequired: fresh.session.onboardingRequired,
      };
      break;
    case "ended":
      guard = { state: "ended" };
      break;
    case "none": {
      const devRole = request.cookies.get(DEV_SESSION_COOKIE)?.value;
      guard =
        devToolsEnabled() && isRole(devRole)
          ? { state: "valid", roles: [devRole], onboardingRequired: false }
          : { state: "none" };
    }
  }

  let encoded: string | null = null;
  if (fresh.state === "valid" && fresh.rotated) {
    encoded = await encodeSession(fresh.session);
    // The page rendering this request must see the new tokens too.
    request.cookies.set(name, encoded);
  } else if (fresh.state === "ended") {
    request.cookies.delete(name);
  }

  const decision = decideRoute(
    request.nextUrl.pathname,
    request.nextUrl.search,
    guard,
  );
  const response =
    decision.action === "redirect"
      ? NextResponse.redirect(new URL(decision.to, request.url))
      : NextResponse.next({ request: { headers: request.headers } });

  if (encoded && fresh.state === "valid") {
    response.cookies.set(name, encoded, {
      ...sessionCookieOptions(),
      maxAge: sessionMaxAgeSeconds(fresh.session),
    });
  } else if (fresh.state === "ended") {
    response.cookies.set(name, "", { ...sessionCookieOptions(), maxAge: 0 });
  }
  response.headers.set("cache-control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    // Signed-in areas.
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/parent/:path*",
    "/refer/:path*",
    "/admin/:path*",
    // Auth pages: a stale session is refreshed or cleared before they decide
    // whether the visitor is signed in (no login and dashboard loop).
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ],
};
