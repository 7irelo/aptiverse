import { decode, encode } from "next-auth/jwt";

import type { AuthTokens } from "@/lib/api/generated/model";

import {
  authSecrets,
  REFRESH_SKEW_MS,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieName,
} from "./config";

/**
 * What the encrypted session cookie holds. Kept small (no name, email or
 * picture) so the cookie stays well under 4 KB. Never sent to the browser in
 * readable form: the cookie is an encrypted JWE, httpOnly.
 */
export type ApiSession = {
  /** API user id. */
  sub: string;
  accessToken: string;
  /** Epoch milliseconds. */
  accessTokenExpiresAt: number;
  refreshToken: string;
  /** Epoch milliseconds. */
  refreshTokenExpiresAt: number;
  roles: string[];
  onboardingRequired: boolean;
};

export function sessionFromTokens(tokens: AuthTokens): ApiSession {
  return {
    sub: tokens.user.id,
    accessToken: tokens.accessToken,
    accessTokenExpiresAt: Date.parse(tokens.accessTokenExpiresAt),
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: Date.parse(tokens.refreshTokenExpiresAt),
    roles: [...tokens.user.roles],
    onboardingRequired: tokens.user.onboardingRequired,
  };
}

export function isApiSession(value: unknown): value is ApiSession {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sub === "string" &&
    typeof v.accessToken === "string" &&
    typeof v.refreshToken === "string" &&
    typeof v.accessTokenExpiresAt === "number" &&
    typeof v.refreshTokenExpiresAt === "number" &&
    Array.isArray(v.roles) &&
    typeof v.onboardingRequired === "boolean"
  );
}

/** True when the access token is expired or about to expire. */
export function needsRefresh(session: ApiSession, now = Date.now()): boolean {
  return session.accessTokenExpiresAt - now <= REFRESH_SKEW_MS;
}

/** True when the refresh token itself can no longer be used. */
export function isRefreshExpired(
  session: ApiSession,
  now = Date.now(),
): boolean {
  return session.refreshTokenExpiresAt <= now;
}

/** Seconds the cookie should live: the refresh token's life, capped. */
export function sessionMaxAgeSeconds(
  session: ApiSession,
  now = Date.now(),
): number {
  const untilRefreshExpiry = Math.floor(
    (session.refreshTokenExpiresAt - now) / 1000,
  );
  return Math.max(0, Math.min(untilRefreshExpiry, SESSION_MAX_AGE_SECONDS));
}

/** Encrypts the session in the same format Auth.js uses for its cookie. */
export async function encodeSession(session: ApiSession): Promise<string> {
  return encode({
    token: { ...session },
    secret: authSecrets(),
    salt: sessionCookieName(),
    maxAge: sessionMaxAgeSeconds(session),
  });
}

/** Decrypts a cookie value. Returns null for anything invalid or expired. */
export async function decodeSession(
  value: string | undefined,
): Promise<ApiSession | null> {
  if (!value) return null;
  try {
    const token = await decode({
      token: value,
      secret: authSecrets(),
      salt: sessionCookieName(),
    });
    return isApiSession(token) ? token : null;
  } catch {
    return null;
  }
}
