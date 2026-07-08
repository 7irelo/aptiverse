// Turns an API error response into a single clean, human-readable sentence
// for display. Never surfaces the HTTP status, the raw JSON body, or the
// internal "error" detail — UI alerts show the message, not the plumbing.
//
// Handles the shapes the .NET API actually returns:
//   { message, error, type }            -> our custom errors (auth, etc.)
//   { title, errors: { field: [msg] } } -> ASP.NET validation problems
//   "plain text"                        -> occasional bare-string bodies
export function humanizeApiError(status: number, body: string): string {
  const fallback =
    status === 401 || status === 403
      ? "You are not signed in, or your session has expired. Please sign in again."
      : "Something went wrong. Please try again.";

  if (!body || !body.trim()) return fallback;

  try {
    const parsed: unknown = JSON.parse(body);

    if (typeof parsed === "string" && parsed.trim()) return parsed.trim();

    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;

      // Our API's primary user-facing field.
      if (typeof o.message === "string" && o.message.trim()) return o.message.trim();

      // ASP.NET ProblemDetails / validation.
      if (typeof o.title === "string" && o.title.trim()) return o.title.trim();
      if (o.errors && typeof o.errors === "object") {
        const first = Object.values(o.errors as Record<string, unknown>)
          .flat()
          .find((v) => typeof v === "string");
        if (typeof first === "string" && first.trim()) return first.trim();
      }

      // Last resort within JSON: a bare `error` string.
      if (typeof o.error === "string" && o.error.trim()) return o.error.trim();
    }
  } catch {
    // Not JSON. Show a short plain-text body, but never an HTML error page.
    const t = body.trim();
    if (t.length <= 200 && !t.startsWith("<")) return t;
  }

  return fallback;
}
