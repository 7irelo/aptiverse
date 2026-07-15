import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

// Sends an already-signed-in user straight from /login to their dashboard.
//
// This runs at the edge, before the page renders, which is the whole point:
// doing it in a useEffect on the client paints the sign-in form first and then
// yanks it away, so you see a flash of a form you never needed to fill in.
//
// The guard is deliberately "has a *usable* token", not "has a session". The
// NextAuth session cookie outlives the API access token (30 days vs
// Jwt:ExpireHours), and the API cannot re-mint an expired one. Redirecting a
// stale-token user to the dashboard would 401 on its first query, trip
// fetcher's signIn(), and bounce them back here — an infinite loop. When the
// token is dead we let the form render so a real sign-in can issue a fresh one.

function accessTokenStillValid(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    const claims = JSON.parse(json) as { exp?: number };
    return typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Mirrors dashboardForRole() in app/(auth)/login/page.tsx — /dashboard is the
// student root and would bounce every other role into the RoleGuard.
function dashboardForRole(role: string | undefined): string {
  switch ((role ?? "").toLowerCase()) {
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    case "tutor":
      return "/tutor";
    case "schooladmin":
    case "school_admin":
    case "school-admin":
      return "/school-admin";
    case "admin":
    case "superuser":
      return "/admin";
    default:
      return "/dashboard";
  }
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !accessTokenStillValid(token.accessToken)) return NextResponse.next();

  const role = (token.aptiverse as { role?: string } | undefined)?.role;
  const callback = req.nextUrl.searchParams.get("callbackUrl");

  // Honour where they were headed, but only for same-origin paths — an
  // attacker-supplied absolute callbackUrl must never become an open redirect.
  const dest =
    callback && callback.startsWith("/") && callback !== "/dashboard"
      ? callback
      : dashboardForRole(role);

  return NextResponse.redirect(new URL(dest, req.url));
}

export const config = { matcher: ["/login"] };
