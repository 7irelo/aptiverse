import "server-only";

import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/lib/api/fetcher";
import { readSession, visitorHeaders } from "@/lib/auth/session-store";

/**
 * Server Component access to the API with the signed-in user's token.
 * User-scoped reads are never cached with a shared "use cache": a shared
 * entry could serve one student's data to another. They run per request,
 * uncached, inside the page's Suspense boundary.
 *
 * Token rotation happens in proxy.ts before rendering, so this only reads
 * the session. A missing session sends the visitor to log in.
 */
export async function authInit(next?: string): Promise<RequestInit> {
  const session = await readSession();
  if (!session) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return {
    cache: "no-store",
    headers: {
      ...(await visitorHeaders()),
      authorization: `Bearer ${session.accessToken}`,
    },
  };
}

export type Loaded<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      reason: "forbidden" | "not-found" | "conflict";
      code?: string;
    };

/**
 * Runs a generated API call with the session token. 403 and 404 come back
 * as values so the page can render its forbidden or not-found state; 401
 * sends the visitor to log in; anything else throws to the error boundary,
 * which offers a retry.
 */
export async function load<T>(
  call: (init: RequestInit) => Promise<T>,
  options: { next?: string; allowConflict?: boolean } = {},
): Promise<Loaded<T>> {
  const init = await authInit(options.next);
  try {
    return { ok: true, data: await call(init) };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect(
          options.next
            ? `/login?reason=session-expired&next=${encodeURIComponent(options.next)}`
            : "/login?reason=session-expired",
        );
      }
      if (error.status === 403) {
        return { ok: false, reason: "forbidden", code: error.code };
      }
      if (error.status === 404) {
        return { ok: false, reason: "not-found", code: error.code };
      }
      if (error.status === 409 && options.allowConflict) {
        return { ok: false, reason: "conflict", code: error.code };
      }
    }
    throw error;
  }
}

/** Like load, but a 404 renders the segment's not-found page. */
export async function loadOrNotFound<T>(
  call: (init: RequestInit) => Promise<T>,
  next?: string,
): Promise<Loaded<T>> {
  const result = await load(call, { next });
  if (!result.ok && result.reason === "not-found") notFound();
  return result;
}
