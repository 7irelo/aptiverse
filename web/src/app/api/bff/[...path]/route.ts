import type { NextRequest } from "next/server";

import { upstreamContextHeaders } from "@/lib/auth/client-ip";
import {
  ensureFreshSession,
  type FreshSession,
} from "@/lib/auth/fresh-session";
import {
  clearSession,
  readSession,
  writeSession,
} from "@/lib/auth/session-store";
import { allowedOriginsFor } from "@/lib/bff/csrf";
import { handleBff, type BffToken } from "@/lib/bff/handler";

/**
 * Backend-for-frontend proxy. Client components call /api/bff/<api path>
 * (see src/lib/api/fetcher.ts); this handler checks the origin and path,
 * attaches the access token from the encrypted session cookie and forwards
 * to API_INTERNAL_URL. Rotated tokens are written back to the cookie here;
 * a session the API refuses is cleared. The logic lives in src/lib/bff.
 */

// Long enough for the longest tutor answer streamed over SSE.
export const maxDuration = 300;

async function persist(fresh: FreshSession): Promise<BffToken> {
  switch (fresh.state) {
    case "none":
      return { state: "none" };
    case "ended":
      await clearSession();
      return { state: "ended" };
    case "unavailable":
      return { state: "unavailable" };
    case "valid":
      if (fresh.rotated) await writeSession(fresh.session);
      return { state: "valid", accessToken: fresh.session.accessToken };
  }
}

async function forward(
  request: NextRequest,
  ctx: RouteContext<"/api/bff/[...path]">,
) {
  const { path } = await ctx.params;
  return handleBff(request, path, {
    apiBase: process.env.API_INTERNAL_URL,
    allowedOrigins: allowedOriginsFor(request.url),
    contextHeaders: upstreamContextHeaders(request.headers),
    getToken: async () =>
      persist(await ensureFreshSession(await readSession())),
    forceRefresh: async () =>
      persist(await ensureFreshSession(await readSession(), { force: true })),
  });
}

export const GET = forward;
export const HEAD = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
