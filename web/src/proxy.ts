import { NextResponse, type NextRequest } from "next/server";

/**
 * Request proxy (Next 16's replacement for middleware).
 *
 * Placeholder for Phase 2. It will:
 * - check the Auth.js session cookie on authenticated (app) routes and
 *   redirect signed-out visitors to /login?next=<path>
 * - route by role (student, parent, admin) to the right home
 *
 * Security headers live in next.config.ts so they also apply to static
 * pages that never reach this proxy.
 */
export function proxy(request: NextRequest) {
  // TODO(phase-2 auth): verify the session and redirect when it is missing.
  void request;
  return NextResponse.next();
}

export const config = {
  // Authenticated areas from the (app) route group.
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/parent/:path*",
    "/refer/:path*",
    "/admin/:path*",
  ],
};
