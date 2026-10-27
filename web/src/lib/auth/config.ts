/**
 * Session cookie settings shared by Auth.js (src/auth.ts), the proxy, the
 * BFF and the server actions, so every place that reads or writes the
 * session agrees on the name, flags and secret.
 */

/** Refresh the access token when it has less than this left. */
export const REFRESH_SKEW_MS = 60_000;

/** Upper bound on a session, whatever the refresh token says. */
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * Secure cookies everywhere except local development over plain http.
 * APTIVERSE_INSECURE_COOKIES=1 lets a local production build (Playwright on
 * http://localhost) work; it is ignored on Vercel production.
 */
export function secureCookiesEnabled(): boolean {
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.APTIVERSE_INSECURE_COOKIES === "1") return false;
  return process.env.NODE_ENV === "production";
}

/** `__Host-` pins the cookie to this exact origin: Secure, Path=/, no Domain. */
export function sessionCookieName(): string {
  return secureCookiesEnabled()
    ? "__Host-aptiverse.session"
    : "aptiverse.session";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: secureCookiesEnabled(),
  };
}

/**
 * AUTH_SECRET, optionally a comma separated list for rotation: the first
 * secret encrypts, every listed secret can decrypt.
 */
export function authSecrets(): string[] {
  const raw = process.env.AUTH_SECRET ?? "";
  const secrets = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (secrets.length === 0) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with `npx auth secret` and add it to .env.local.",
    );
  }
  return secrets;
}
