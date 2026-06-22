"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRefreshSession } from "./useRefreshSession";

// Re-issues the access token before it expires so a long-open tab
// doesn't get bounced to /login mid-session.
//
// Reads the JWT's `exp` claim from the session's access token, polls
// every 60 seconds, and calls useRefreshSession() when we're within
// REFRESH_THRESHOLD_S of expiry. The actual refresh runs once at a
// time per tab — a refIn-flight flag prevents back-to-back calls if
// the hook re-renders quickly.
//
// Mounted once at the app shell (see app/(app)/layout.tsx). Safe to
// mount on every authenticated layout — the polling stops itself when
// there's no session.

const POLL_INTERVAL_MS = 60_000;        // 1 minute
const REFRESH_THRESHOLD_S = 5 * 60;     // 5 minutes before expiry

function decodeExpEpochSeconds(jwt: string | undefined): number | null {
  if (!jwt) return null;
  const parts = jwt.split(".");
  if (parts.length !== 3) return null;
  try {
    // JWT payload is base64url; convert + decode without an external
    // lib so this works on every runtime (server during streaming, edge,
    // browser).
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob !== "undefined"
        ? atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="))
        : Buffer.from(padded, "base64").toString("utf8");
    const claims = JSON.parse(json) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp : null;
  } catch {
    return null;
  }
}

export function useAutoRefreshSession() {
  const { data: session, status } = useSession();
  const refresh = useRefreshSession();
  const inFlight = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const accessToken = (session as { accessToken?: string } | null)?.accessToken;
    const exp = decodeExpEpochSeconds(accessToken);
    if (!exp) return;

    let cancelled = false;

    const tick = async () => {
      if (cancelled || inFlight.current) return;

      const nowS = Math.floor(Date.now() / 1000);
      const secondsRemaining = exp - nowS;
      if (secondsRemaining > REFRESH_THRESHOLD_S) return;

      // <5min left — refresh once. The new token has a fresh `exp` so
      // the next tick computes against that, not this stale value.
      inFlight.current = true;
      try {
        await refresh();
      } catch {
        // Refresh failed — likely the cookie expired entirely. Let the
        // next API call hit a 401 and bounce through /login.
      } finally {
        inFlight.current = false;
      }
    };

    // Fire once immediately so a long-suspended tab catches up on resume,
    // then on an interval.
    void tick();
    const id = window.setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [session, status, refresh]);
}
