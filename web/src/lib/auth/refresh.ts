import { ApiError } from "@/lib/api/fetcher";
import { refreshTokens } from "@/lib/api/generated/endpoints/identity/identity";
import { RefreshTokensResponse } from "@/lib/api/generated/zod/identity/identity.zod";

import { sessionFromTokens, type ApiSession } from "./api-session";

export type RefreshOutcome =
  | { ok: true; session: ApiSession }
  /** The API refused the refresh token: the session is over. */
  | { ok: false; reason: "invalid" }
  /** The API could not be reached or failed: keep the session, try later. */
  | { ok: false; reason: "unavailable" };

export type RefreshFn = (refreshToken: string) => Promise<RefreshOutcome>;

/**
 * The API treats a reused refresh token as theft and revokes the whole
 * session, so every caller in this server instance that holds the same
 * refresh token must share one refresh call. Settled outcomes are kept for a
 * short while so a request that still carries the old cookie (sent before
 * the browser stored the new one) gets the new tokens instead of reusing the
 * spent refresh token.
 */
const RECENT_TTL_MS = 30_000;
const inflight = new Map<string, Promise<RefreshOutcome>>();
const recent = new Map<string, { outcome: RefreshOutcome; at: number }>();

async function keyFor(refreshToken: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(refreshToken),
  );
  return Buffer.from(digest).toString("base64url");
}

function prune(now: number) {
  for (const [key, entry] of recent) {
    if (now - entry.at > RECENT_TTL_MS) recent.delete(key);
  }
}

/** Runs `refresh` at most once per refresh token, sharing the result. */
export async function refreshOnce(
  refreshToken: string,
  refresh: RefreshFn = refreshWithApi,
): Promise<RefreshOutcome> {
  const now = Date.now();
  prune(now);
  const key = await keyFor(refreshToken);

  const cached = recent.get(key);
  if (cached) return cached.outcome;

  const running = inflight.get(key);
  if (running) return running;

  const promise = (async () => {
    let outcome: RefreshOutcome;
    try {
      outcome = await refresh(refreshToken);
    } catch {
      outcome = { ok: false, reason: "unavailable" };
    }
    // Transient failures are not remembered, so the next request retries.
    if (outcome.ok || outcome.reason === "invalid") {
      recent.set(key, { outcome, at: Date.now() });
    }
    return outcome;
  })().finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

/** Test helper: forget every remembered refresh. */
export function resetRefreshState() {
  inflight.clear();
  recent.clear();
}

/** Calls POST /auth/refresh and validates the response. */
export const refreshWithApi: RefreshFn = async (refreshToken) => {
  try {
    const tokens = RefreshTokensResponse.parse(
      await refreshTokens({ refreshToken }, { cache: "no-store" }),
    );
    return { ok: true, session: sessionFromTokens(tokens) };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 400 || error.status === 401)
    ) {
      return { ok: false, reason: "invalid" };
    }
    return { ok: false, reason: "unavailable" };
  }
};
