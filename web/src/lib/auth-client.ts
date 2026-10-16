"use client";

import { signOut } from "next-auth/react";
import { clearAccessToken } from "@/lib/api/token";

/**
 * Sign out properly: revoke the refresh token on the API first, then clear the
 * next-auth cookie.
 *
 * Plain `signOut()` only forgets the session locally. The refresh token would
 * stay valid in Redis for the rest of its 30 days, so anyone holding a copy
 * could keep minting access tokens for an account whose owner believes they
 * have signed out. The revoke call runs server-side (see
 * /api/session/revoke) because the refresh token is never exposed to browser
 * JavaScript.
 *
 * Revocation is best-effort by design: if it fails, the user is still signed
 * out locally. Never leave someone stuck in a session they asked to leave.
 */
export async function signOutAptiverse(callbackUrl = "/login") {
  try {
    await fetch("/api/session/revoke", { method: "POST" });
  } catch {
    // Ignored on purpose — see above.
  }
  clearAccessToken();
  await signOut({ callbackUrl });
}
