/**
 * First path segments the browser may reach through /api/bff. Everything
 * else (notably auth/*, whose responses carry tokens, .well-known and
 * health) is refused with 404 before the API is called. A unit test checks
 * every prefix against the pinned spec in openapi/api-spec.json and that no
 * token-carrying path is reachable.
 */
export const BFF_ALLOWED_PREFIXES = [
  "academics",
  "ai",
  "legal",
  "me",
  "practice",
  "support",
] as const;

/** Never forwarded, even if a prefix above were to grow to include them. */
export const BFF_BLOCKED_PREFIXES = ["auth", ".well-known", "health"] as const;

const SEGMENT = /^[A-Za-z0-9_~-][A-Za-z0-9._~-]*$/;

/**
 * Validates the catch-all segments and the raw request path. Returns the
 * normalised API path ("/me/sessions") or null when the request must be
 * refused. Rejects dot segments, encoded slashes, backslashes and dots,
 * percent signs left after decoding (double encoding), and any first segment
 * not on the allowlist.
 */
export function resolveBffPath(
  segments: readonly string[],
  rawPathname: string,
): string | null {
  if (segments.length === 0 || segments.length > 12) return null;
  const raw = rawPathname.toLowerCase();
  if (/%2f|%5c|%2e|%00|%25/.test(raw) || raw.includes("..")) return null;
  if (raw.includes("\\") || raw.includes("//")) return null;

  for (const segment of segments) {
    if (segment.length > 200 || !SEGMENT.test(segment)) return null;
    if (segment === "." || segment === "..") return null;
  }

  const first = segments[0]!.toLowerCase();
  if ((BFF_BLOCKED_PREFIXES as readonly string[]).includes(first)) return null;
  // Exact, lower case match: "ME" or "Auth" never slip through.
  if (!(BFF_ALLOWED_PREFIXES as readonly string[]).includes(segments[0]!)) {
    return null;
  }
  return `/${segments.join("/")}`;
}
