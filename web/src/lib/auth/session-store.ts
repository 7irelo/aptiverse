import "server-only";

import { cookies, headers } from "next/headers";

import { ApiError } from "@/lib/api/fetcher";

import {
  decodeSession,
  encodeSession,
  sessionMaxAgeSeconds,
  type ApiSession,
} from "./api-session";
import { upstreamContextHeaders } from "./client-ip";
import { sessionCookieName, sessionCookieOptions } from "./config";
import { ensureFreshSession } from "./fresh-session";

/** Reads and decrypts the session cookie. Safe in Server Components. */
export async function readSession(): Promise<ApiSession | null> {
  const store = await cookies();
  return decodeSession(store.get(sessionCookieName())?.value);
}

/** Writes the session cookie. Server actions and route handlers only. */
export async function writeSession(session: ApiSession): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName(), await encodeSession(session), {
    ...sessionCookieOptions(),
    maxAge: sessionMaxAgeSeconds(session),
  });
}

/** Removes the session cookie. Server actions and route handlers only. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(sessionCookieName(), "", { ...sessionCookieOptions(), maxAge: 0 });
}

/** Client IP and trace headers for an API call made on behalf of a visitor. */
export async function visitorHeaders(): Promise<Record<string, string>> {
  return upstreamContextHeaders(await headers());
}

export class SessionEndedError extends Error {
  constructor() {
    super("The session has ended");
    this.name = "SessionEndedError";
  }
}

/**
 * Runs an API call with a fresh access token from the session, rotating and
 * persisting tokens as needed, and retries once after a forced refresh when
 * the API answers 401. Throws SessionEndedError when there is no usable
 * session (the cookie is cleared). For server actions and route handlers.
 */
export async function withAccessToken<T>(
  call: (init: { headers: Record<string, string> }) => Promise<T>,
): Promise<T> {
  const context = await visitorHeaders();
  const run = (session: ApiSession) =>
    call({
      headers: { ...context, authorization: `Bearer ${session.accessToken}` },
    });

  const fresh = await ensureFreshSession(await readSession());
  if (fresh.state === "none" || fresh.state === "ended") {
    if (fresh.state === "ended") await clearSession();
    throw new SessionEndedError();
  }
  if (fresh.state === "unavailable") {
    throw new ApiError(503, { title: "The API could not be reached" }, "");
  }
  if (fresh.rotated) await writeSession(fresh.session);

  try {
    return await run(fresh.session);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const retry = await ensureFreshSession(fresh.session, { force: true });
    if (retry.state !== "valid") {
      if (retry.state === "ended") await clearSession();
      throw new SessionEndedError();
    }
    await writeSession(retry.session);
    return run(retry.session);
  }
}

/** Updates fields in the stored session, for example after onboarding. */
export async function patchSession(
  patch: Partial<Pick<ApiSession, "onboardingRequired" | "roles">>,
): Promise<void> {
  const session = await readSession();
  if (session) await writeSession({ ...session, ...patch });
}
