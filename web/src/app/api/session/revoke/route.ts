// Signs the session out on the API side, then leaves next-auth's own signOut
// to the caller.
//
// This exists because the refresh token deliberately never reaches browser
// JavaScript — it lives in the encrypted, httpOnly next-auth cookie. Only the
// server can read it, so only the server can tell the API to revoke it. Without
// this route, "sign out" would clear the cookie in the browser while leaving a
// 30 day credential live in Redis.

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const API_URL =
  process.env.NEXT_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5100";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const accessToken = token?.accessToken as string | undefined;
  const refreshToken = token?.refreshToken as string | undefined;

  // Nothing to revoke (already signed out, or a session from before refresh
  // tokens existed). Still a success: the caller's next step is signOut either
  // way, and failing here would only block someone from signing out.
  if (accessToken && refreshToken) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // The API being unreachable must not trap a user in a session they are
      // trying to leave. The cookie still gets cleared by signOut, and the
      // refresh token expires on its own.
    }
  }

  return new NextResponse(null, { status: 204 });
}
