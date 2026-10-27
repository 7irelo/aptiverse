import { resolveBffPath } from "./allowlist";
import { isUnsafeMethod, passesCsrfCheck } from "./csrf";

/** JSON bodies larger than this are refused (FE-99). */
export const BFF_MAX_BODY_BYTES = 1024 * 1024;

const ALLOWED_METHODS = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

/**
 * Request headers copied from the browser to the API. An allowlist rather
 * than a blocklist: cookies, Authorization, hop-by-hop headers, Host and
 * any X-Forwarded-* the browser sends are all dropped by construction.
 */
const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "if-match",
  "if-none-match",
  "idempotency-key",
  "last-event-id",
  "traceparent",
  "tracestate",
  "x-request-id",
];

/** Response headers copied from the API to the browser. */
const FORWARDED_RESPONSE_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-language",
  "content-type",
  "etag",
  "last-modified",
  "retry-after",
  "x-request-id",
];

export type BffToken =
  | { state: "none" }
  | { state: "ended" }
  | { state: "unavailable" }
  | { state: "valid"; accessToken: string };

export type BffDeps = {
  apiBase: string | undefined;
  allowedOrigins: readonly string[];
  /** A fresh access token for this request (rotating it if needed). */
  getToken: () => Promise<BffToken>;
  /** Called after the API answered 401: refresh regardless of expiry. */
  forceRefresh: () => Promise<BffToken>;
  /** Client IP and trace headers from upstreamContextHeaders(). */
  contextHeaders: Record<string, string>;
  fetch?: typeof fetch;
};

function problem(
  status: number,
  title: string,
  extra: Record<string, unknown> = {},
): Response {
  return Response.json(
    { title, status, ...extra },
    {
      status,
      headers: {
        "content-type": "application/problem+json",
        "cache-control": "no-store",
      },
    },
  );
}

class BodyTooLargeError extends Error {}

/** Reads the body, stopping as soon as it passes the limit. */
async function readLimitedBody(
  request: Request,
  limit: number,
): Promise<Uint8Array | undefined> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > limit) {
    throw new BodyTooLargeError();
  }
  if (!request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }
  if (total === 0) return undefined;
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

function isJson(contentType: string | null): boolean {
  if (!contentType) return false;
  const type = contentType.split(";")[0]!.trim().toLowerCase();
  return type === "application/json" || type.endsWith("+json");
}

/**
 * Backend for frontend: forwards a browser request to the API with the
 * access token attached on the server. The browser never sees the token,
 * the session cookie never reaches the API, and token-carrying paths are
 * unreachable. Pure apart from `deps`, so it is unit tested directly.
 */
export async function handleBff(
  request: Request,
  segments: readonly string[],
  deps: BffDeps,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (!ALLOWED_METHODS.has(method)) {
    return problem(405, "Method not allowed");
  }

  if (!passesCsrfCheck(request, deps.allowedOrigins)) {
    return problem(403, "Cross-site request refused");
  }

  const rawPath = new URL(request.url).pathname;
  const apiPath = resolveBffPath(segments, rawPath);
  if (!apiPath) return problem(404, "Not found");

  if (!deps.apiBase) return problem(503, "API is not configured");

  let body: Uint8Array | undefined;
  if (isUnsafeMethod(method)) {
    try {
      body = await readLimitedBody(request, BFF_MAX_BODY_BYTES);
    } catch (error) {
      if (error instanceof BodyTooLargeError) {
        return problem(413, "Request body is too large");
      }
      return problem(400, "Could not read the request body");
    }
    if (body && !isJson(request.headers.get("content-type"))) {
      return problem(415, "Only JSON request bodies are accepted");
    }
  }

  const target = new URL(`${deps.apiBase.replace(/\/+$/, "")}${apiPath}`);
  target.search = new URL(request.url).search;

  const baseHeaders = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) baseHeaders.set(name, value);
  }
  for (const [name, value] of Object.entries(deps.contextHeaders)) {
    baseHeaders.set(name, value);
  }

  const doFetch = deps.fetch ?? fetch;
  const send = (accessToken: string | null) => {
    const headers = new Headers(baseHeaders);
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
    return doFetch(target, {
      method,
      headers,
      body: body as BodyInit | undefined,
      cache: "no-store",
      redirect: "manual",
      signal: request.signal,
    });
  };

  const token = await deps.getToken();
  if (token.state === "ended") {
    return problem(401, "Your session has ended", { code: "session.ended" });
  }
  if (token.state === "unavailable") {
    return problem(503, "The API could not be reached");
  }
  const accessToken = token.state === "valid" ? token.accessToken : null;

  let upstream: Response;
  try {
    upstream = await send(accessToken);
    if (upstream.status === 401 && accessToken) {
      const retry = await deps.forceRefresh();
      if (retry.state !== "valid") {
        await upstream.body?.cancel();
        return problem(401, "Your session has ended", {
          code: "session.ended",
        });
      }
      await upstream.body?.cancel();
      upstream = await send(retry.accessToken);
    }
  } catch {
    if (request.signal.aborted) return problem(499, "Client closed request");
    return problem(502, "The API could not be reached");
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value !== null) responseHeaders.set(name, value);
  }
  // Authenticated responses are private: never cached by a shared cache.
  if (!responseHeaders.has("cache-control")) {
    responseHeaders.set("cache-control", "private, no-store");
  }
  responseHeaders.set("x-content-type-options", "nosniff");

  const isStream = (upstream.headers.get("content-type") ?? "")
    .toLowerCase()
    .startsWith("text/event-stream");
  if (isStream) {
    // Server-sent events stream straight through, unbuffered.
    responseHeaders.set("cache-control", "no-cache, no-transform");
    responseHeaders.set("x-accel-buffering", "no");
  }

  // 3xx from the API would point at its internal address: never forward it.
  if (upstream.status >= 300 && upstream.status < 400) {
    await upstream.body?.cancel();
    return problem(502, "Unexpected redirect from the API");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
