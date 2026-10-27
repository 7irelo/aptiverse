/**
 * Shape check for emailed one-time tokens (verify email, reset password)
 * before anything is sent to the API: URL-safe characters and sane length.
 * The API is the real judge; this only stops obvious junk early.
 */
export function looksLikeOneTimeToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length >= 16 &&
    value.length <= 512 &&
    /^[A-Za-z0-9_.~-]+$/.test(value)
  );
}
