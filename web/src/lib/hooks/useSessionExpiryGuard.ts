"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOutAptiverse } from "@/lib/auth-client";

// The other half of the refresh flow: what happens when refreshing fails.
//
// The jwt callback in lib/auth.ts renews the access token from the refresh
// token whenever the session is read. If that fails — the refresh token
// expired, was revoked by a sign-out elsewhere, or was already spent — it drops
// the access token and sets `error` on the session. Without something watching
// for that, the app would keep rendering as signed in while every API call came
// back 401, which reads as the product being broken.
//
// So: end the session properly, once, and land on the sign-in page with an
// explanation. SessionRequired is a code the login page already has copy for.
export function useSessionExpiryGuard() {
  const { data: session } = useSession();
  const handled = useRef(false);

  useEffect(() => {
    const error = (session as { error?: string } | null)?.error;
    if (!error || handled.current) return;
    // Guard against a second run: signOut triggers a session change, and
    // re-entering here would fire a second navigation mid-redirect.
    handled.current = true;
    void signOutAptiverse("/login?error=SessionRequired");
  }, [session]);
}
