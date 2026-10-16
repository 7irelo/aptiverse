import type { NextRequest } from "next/server";

/**
 * Backend-for-frontend proxy. Client components call /api/bff/<api path>
 * (see src/lib/api/fetcher.ts) and this handler forwards the request to the
 * API at API_INTERNAL_URL, so the browser never talks to the API directly.
 *
 * TODO(phase-2 auth): read the Auth.js session here, attach the access token
 * as `Authorization: Bearer <token>`, refresh it when expired, and strip the
 * session cookie before forwarding. Until then requests go through anonymous.
 */

// Headers that must not be forwarded between hops, plus ones we set ourselves.
const DROPPED_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "cookie",
  "host",
  "keep-alive",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const DROPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "set-cookie",
  "transfer-encoding",
]);

async function forward(
  request: NextRequest,
  ctx: RouteContext<"/api/bff/[...path]">,
) {
  const apiBase = process.env.API_INTERNAL_URL;
  if (!apiBase) {
    return Response.json(
      { title: "API is not configured", status: 503 },
      { status: 503, headers: { "content-type": "application/problem+json" } },
    );
  }

  const { path } = await ctx.params;
  const target = new URL(
    `${apiBase.replace(/\/+$/, "")}/${path.map(encodeURIComponent).join("/")}`,
  );
  target.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!DROPPED_REQUEST_HEADERS.has(key.toLowerCase()))
      headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return Response.json(
      { title: "The API could not be reached", status: 502 },
      { status: 502, headers: { "content-type": "application/problem+json" } },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!DROPPED_RESPONSE_HEADERS.has(key.toLowerCase()))
      responseHeaders.set(key, value);
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
