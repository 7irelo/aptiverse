"use client";

import { getSession } from "next-auth/react";

// One cached access token for the whole app, instead of a session fetch per
// API call.
//
// next-auth's getSession() is not a cached read. In v4 it is an HTTP request to
// /api/auth/session, which is a serverless function round trip, measured at
// roughly 380ms against production. Both fetcher() and the api client called it
// on EVERY invocation, so a screen firing five queries paid five of those
// before a single byte of real data was requested, and half the traffic went to
// the Next server rather than the API. On a mobile-first product for students
// on expensive, high-latency connections that is the single largest avoidable
// cost in the request path.
//
// The token is a JWT and carries its own expiry, so it can safely be held until
// shortly before it lapses. Nothing here changes the security model: the same
// token, from the same session, with the same lifetime. It is only fetched once
// instead of once per call.

type Cached = { token: string; expiresAtMs: number };

let cached: Cached | null = null;
// Shared promise so a burst of parallel calls on a cold cache triggers ONE
// session fetch rather than one each. Without this, a dashboard mounting five
// queries at once still makes five round trips on first paint.
let inFlight: Promise<string | null> | null = null;

// Refetch this long before the token actually expires, so a request cannot be
// issued with a token that lapses in transit.
const EXPIRY_SKEW_MS = 60_000;
// Used when a token carries no readable exp. Short enough to stay correct,
// long enough to still collapse a burst of calls into one fetch.
const FALLBACK_TTL_MS = 60_000;

function expiryOf(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
    const claims = JSON.parse(json) as { exp?: number };
    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * The current Aptiverse access token, or null when signed out.
 *
 * Served from memory while valid. Falls back to a single session fetch when the
 * cache is empty or the token is close to expiring.
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const now = Date.now();
  if (cached && cached.expiresAtMs - EXPIRY_SKEW_MS > now) return cached.token;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const session = await getSession();
    const token = (session as { accessToken?: string } | null)?.accessToken ?? null;
    cached = token ? { token, expiresAtMs: expiryOf(token) ?? Date.now() + FALLBACK_TTL_MS } : null;
    return token;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/**
 * Drop the cached token.
 *
 * Call this whenever the API rejects a token (a 401) or the session changes, so
 * the next call goes back to the session rather than replaying a token the
 * server has already refused. The auto-refresh hook re-issues the JWT before it
 * lapses, and the old token stays valid until its own expiry, so a refresh in
 * flight never invalidates a request already on the wire.
 */
export function clearAccessToken(): void {
  cached = null;
  inFlight = null;
}
