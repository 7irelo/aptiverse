// Real HTTP client for the .NET API. Reads the Aptiverse JWT off the
// NextAuth session and attaches it as a Bearer token. Use the `useApi`
// hook from React components — server-only callers can pass a token
// explicitly.

import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  school?: string;
  grade?: string;
};
export type ForgotPasswordInput = { email: string };
// Shape matches the API's ResetPasswordDto(UserId, ResetToken, NewPassword).
// confirm stays on the input because the form revalidates; it isn't sent.
export type ResetPasswordInput = {
  password: string;
  confirm: string;
  userId: string;
  token: string;
};
export type ConfirmEmailInput = { userId: string; token: string };
export type ResendVerificationInput = { email: string };
export type ContactInput = {
  firstName: string;
  lastName: string;
  email: string;
  organisation?: string;
  reason: string;
  message: string;
};

async function authHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const session = await getSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers as Record<string, string> | undefined) },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  // Login is unauthenticated and goes through NextAuth (signIn) in normal
  // flows. This helper is here for non-React callers and tests.
  async login(input: LoginInput) {
    return request<{ token: string; user: { id: string; email: string; displayName?: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(input) },
    );
  },
  async register(input: RegisterInput) {
    return request<{ ok: true }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async forgotPassword(input: ForgotPasswordInput) {
    return request<{ ok: true }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async resetPassword(input: ResetPasswordInput) {
    // The API's record is positional (UserId, ResetToken, NewPassword) but
    // serialized as a JSON object. Send exactly those three fields; drop
    // `confirm` (UI-only) so the API doesn't see noise.
    return request<{ ok: true }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        userId: input.userId,
        resetToken: input.token,
        newPassword: input.password,
      }),
    });
  },
  async confirmEmail(input: ConfirmEmailInput) {
    // confirm-email reads userId + token from query string, not body.
    const params = new URLSearchParams({ userId: input.userId, token: input.token });
    return request<{ ok: true }>(`/api/auth/confirm-email?${params}`, {
      method: "POST",
    });
  },
  async resendVerification(input: ResendVerificationInput) {
    return request<{ ok: true }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async contact(input: ContactInput) {
    // Contact form has no backend yet — left as a no-op so the form still
    // resolves cleanly. Wire this when you build the support intake.
    await new Promise((r) => setTimeout(r, 400));
    void input;
    return { ok: true } as const;
  },
  async schoolEnquiry(input: import("@/lib/schemas").SchoolEnquiryValues) {
    return request<{ id: number }>("/api/sales/school-enquiry", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
