// Typed fetch for the .NET API. Reads the Aptiverse JWT off the NextAuth
// session and attaches it as a Bearer token. On 401, redirects to /login.
//
// Renewal happens upstream of this file. The NextAuth jwt callback
// (lib/auth.ts) exchanges the refresh token for a new access token whenever the
// session is read and the current one is close to expiring, and token.ts
// re-reads the session shortly before expiry — so by the time a request is
// built here the token is already fresh. A 401 now means the session is
// genuinely over, not merely stale, which is why bouncing to sign-in is the
// right response to it.

import { signIn } from "next-auth/react";
import { humanizeApiError } from "@/lib/api/errors";
import { clearAccessToken, getAccessToken } from "@/lib/api/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

async function authHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  // Cached in memory. See token.ts: this used to be a session round trip on
  // every single call, in front of every single query.
  const token = await getAccessToken();
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

export async function fetcher<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      // Drop the cached token first. The API has just refused it, so replaying
      // it on the next call would only produce another 401.
      clearAccessToken();
      void signIn();
    }
    throw new ApiError(401, "", "Not authenticated");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body, humanizeApiError(res.status, body));
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/**
 * Opens a Server-Sent-Events stream over `fetch` (not `EventSource`) so the
 * Aptiverse Bearer token can be attached — `EventSource` cannot set an
 * Authorization header, and the API's SSE endpoint is `[Authorize]`.
 *
 * Parses standard SSE frames (`event:` / `data:`), ignores `:` comment /
 * heartbeat lines, and invokes `onEvent(eventName, data)` per frame. Returns a
 * stop function — call it on unmount to abort the stream. Network drops fail
 * silently; the caller's polling + backlog query still cover the data.
 */
export function openEventStream(
  path: string,
  onEvent: (event: string, data: string) => void,
): () => void {
  const controller = new AbortController();
  let stopped = false;

  void (async () => {
    if (typeof window === "undefined") return;
    const token = await getAccessToken();
    try {
      const res = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      if (!res.ok || !res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!stopped) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);

          let event = "message";
          let data = "";
          for (const line of frame.split("\n")) {
            if (line.startsWith(":")) continue; // heartbeat / comment
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) data += line.slice(5).replace(/^ /, "");
          }
          if (data) onEvent(event, data);
        }
      }
    } catch {
      // aborted on unmount or transient network drop — intentionally silent.
    }
  })();

  return () => {
    stopped = true;
    controller.abort();
  };
}

export const apiClient = {
  get: <T>(path: string) => fetcher<T>(path),
  post: <T>(path: string, body?: unknown) =>
    fetcher<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    fetcher<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    fetcher<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => fetcher<T>(path, { method: "DELETE" }),
};
