import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { ApiError } from "@/lib/api/fetcher";
import { getMe } from "@/lib/api/generated/endpoints/identity/identity";
import { GetMeResponse } from "@/lib/api/generated/zod/identity/identity.zod";
import { devToolsEnabled } from "@/lib/dev-tools";

import type { MeResponse } from "@/lib/api/generated/model";

import { mapMeToSessionUser, type SessionUser } from "./map-me";
import { readSession, visitorHeaders } from "./session-store";

export {
  isRole,
  mapMeToSessionUser,
  type Role,
  type SessionUser,
} from "./map-me";

/** Cookie that picks a mock user in development. Value: a Role. */
export const DEV_SESSION_COOKIE = "aptiverse-dev-session";

/**
 * The single place the app asks "who is signed in?". Returns null when
 * nobody is. Reads cookies, so callers must sit inside a Suspense boundary.
 *
 * Reads the encrypted session cookie and asks the API's GET /me for the
 * profile, roles and permissions, once per request (React cache). It never
 * refreshes tokens: Server Components cannot write cookies, and a refresh
 * whose new tokens are not stored would reuse a spent refresh token on the
 * next request and end the session. proxy.ts refreshes before rendering.
 *
 * Throws when the API fails for any reason other than 401, so the route's
 * error boundary offers a retry instead of pretending nobody is signed in.
 *
 * With developer tools on and no real session, the dev cookie still picks a
 * mock user (never in a production deployment).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await readSession();
  if (session) {
    const me = await getCurrentMe();
    return me ? mapMeToSessionUser(me) : null;
  }
  if (!devToolsEnabled()) return null;
  const { devSessionUser } = await import("./dev-users");
  const role = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
  return devSessionUser(role);
});

/**
 * The raw GET /me payload for the signed-in user, once per request, or null
 * when there is no usable session. For pages that need more than the
 * SessionUser (onboarding prefill). Never refreshes tokens.
 */
export const getCurrentMe = cache(async (): Promise<MeResponse | null> => {
  const session = await readSession();
  if (!session || session.accessTokenExpiresAt <= Date.now()) return null;
  try {
    return GetMeResponse.parse(
      await getMe({
        cache: "no-store",
        headers: {
          ...(await visitorHeaders()),
          authorization: `Bearer ${session.accessToken}`,
        },
      }),
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
