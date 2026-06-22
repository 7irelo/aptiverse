// Typed fetch for the .NET API. Reads the Aptiverse JWT off the NextAuth
// session and attaches it as a Bearer token. On 401, redirects to /login.
//
// Refresh-token flow (server endpoint exists at POST /api/auth/refresh-token)
// is not yet wired here — wiring it requires extending the NextAuth jwt
// callback to detect token expiry and call refresh, which is a separate
// task. Until then, an expired access token redirects through the
// standard sign-in flow.

import { getSession, signIn } from "next-auth/react";

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
  const session = await getSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
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
      void signIn();
    }
    throw new ApiError(401, "", "Not authenticated");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
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
