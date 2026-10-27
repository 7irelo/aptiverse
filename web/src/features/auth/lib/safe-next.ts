const MAX_LENGTH = 512;

function hasControlOrSpace(value: string, allowSpace = false): boolean {
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
    if (!allowSpace && /\s/.test(char)) return true;
  }
  return false;
}

/**
 * Sanitises the `next` redirect parameter (the only post sign-in redirect
 * parameter, see frontend/auth-bff.md). Accepts only same-origin relative
 * paths: one leading slash, no `//`, no backslash, no scheme, no control
 * characters, nothing under /api/, at most 512 characters. Returns null for
 * anything else, so callers fall back to the role landing.
 */
export function safeNextPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > MAX_LENGTH) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  // Control characters and whitespace can be stripped by browsers into "//".
  if (hasControlOrSpace(value)) return null;

  // Decoding must not reveal a different shape (for example /%2F%2Fevil).
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (decoded.startsWith("//") || decoded.includes("\\")) return null;
  if (hasControlOrSpace(decoded, true)) return null;

  // Resolve against a dummy origin: the result must stay on that origin.
  let url: URL;
  try {
    url = new URL(value, "https://aptiverse.invalid");
  } catch {
    return null;
  }
  if (url.origin !== "https://aptiverse.invalid") return null;
  const path = `${url.pathname}${url.search}${url.hash}`;
  if (path === "/api" || path.startsWith("/api/")) return null;
  return path;
}
