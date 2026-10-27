const SAFE_METHODS = new Set(["GET", "HEAD"]);

export function isUnsafeMethod(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}

/**
 * CSRF defence for the BFF (FE-100). Unsafe methods must come from this
 * origin: the Origin header must equal the deployment origin, or, when a
 * browser omits Origin, Sec-Fetch-Site must say same-origin. Anything else
 * is refused. Safe methods are refused only when the browser says the
 * request is cross-site. SameSite=Lax on the session cookie is the second
 * layer.
 */
export function passesCsrfCheck(
  request: Request,
  allowedOrigins: readonly string[],
): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (!isUnsafeMethod(request.method)) {
    if (fetchSite === "cross-site") return false;
    return !origin || origin === "null"
      ? true
      : allowedOrigins.includes(origin);
  }

  if (origin && origin !== "null") return allowedOrigins.includes(origin);
  if (origin === "null") return false;
  return fetchSite === "same-origin";
}

/**
 * The origins the app is served from: APP_ORIGIN (comma separated, for
 * example the production domain) plus the origin of the request URL, which
 * Next.js derives from the Host header the browser sent.
 */
export function allowedOriginsFor(requestUrl: string): string[] {
  const configured = (process.env.APP_ORIGIN ?? process.env.AUTH_URL ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .flatMap((value) => {
      try {
        return [new URL(value).origin];
      } catch {
        return [];
      }
    });
  return [...new Set([...configured, new URL(requestUrl).origin])];
}
