/** Info notices for /login?reason=. Unknown values show nothing. */
const REASONS: Record<string, string> = {
  "session-expired": "Your session ended, so please log in again.",
  "signed-out": "You have logged out.",
  "password-reset":
    "Your password has been changed. Log in with your new password.",
  "email-verified": "Your email is confirmed. Log in to continue.",
};

export function loginReasonCopy(reason: unknown): string | null {
  if (typeof reason !== "string") return null;
  return Object.hasOwn(REASONS, reason) ? REASONS[reason]! : null;
}
