/**
 * Copy for the `?error=` codes Auth.js (and our Google exchange) send back
 * to /login. Codes are an allowlist: anything unknown gets the generic line,
 * never the raw value.
 */
export type OAuthErrorCopy = {
  message: string;
  link?: { href: string; label: string };
};

const COPY: Record<string, OAuthErrorCopy> = {
  OAuthNoAccount: {
    message:
      "There is no Aptiverse account for that Google email yet. Create an account first.",
    link: { href: "/register", label: "Create an account" },
  },
  GoogleEmailUnverified: {
    message:
      "Google has not confirmed that email address yet, so we could not log you in with it. Use your email and password instead.",
  },
  OAuthAccountNotLinked: {
    message:
      "That Google email already has an Aptiverse account with a password. Log in with your password instead.",
  },
  AccessDenied: {
    message:
      "We could not log you in with Google. Please try again, or use your email and password.",
  },
  SessionRequired: {
    message: "Your session ended. Log in again to pick up where you left off.",
  },
  Verification: {
    message: "That link has expired. Request a new one and try again.",
  },
  CredentialsSignin: {
    message:
      "That email and password do not match. Check them and try again, or reset your password.",
    link: { href: "/forgot-password", label: "Reset your password" },
  },
};

const GOOGLE_FAILED: OAuthErrorCopy = {
  message:
    "We could not log you in with Google. Please try again, or use your email and password.",
};

const UNKNOWN: OAuthErrorCopy = {
  message: "Your session ended. Log in again to continue.",
};

const GOOGLE_CODES = new Set([
  "GoogleFailed",
  "OAuthSignin",
  "OAuthCallback",
  "OAuthCallbackError",
  "OAuthCreateAccount",
  "Callback",
  "CallbackRouteError",
]);

export function oauthErrorCopy(code: unknown): OAuthErrorCopy | null {
  if (typeof code !== "string" || !code) return null;
  if (Object.hasOwn(COPY, code)) return COPY[code]!;
  if (GOOGLE_CODES.has(code)) return GOOGLE_FAILED;
  return UNKNOWN;
}
