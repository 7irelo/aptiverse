// Real HTTP client for the .NET API. Reads the Aptiverse JWT off the
// NextAuth session and attaches it as a Bearer token. Use the `useApi`
// hook from React components — server-only callers can pass a token
// explicitly.

import { humanizeApiError } from "@/lib/api/errors";
import { getAccessToken } from "@/lib/api/token";
import { newEventId, track } from "@/lib/analytics/events";
import { getConsentState } from "@/lib/analytics/consent";
import { getAttribution, getReferralCode } from "@/lib/analytics/attribution";
import { getFbc, getFbp } from "@/lib/analytics/meta";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  educationLevel?: string;
  curriculumId?: string;
  grade?: number;
  institutionId?: string;
  // The user ticked the Terms + Privacy Policy box. The API refuses to
  // create an account without it, and records the acceptance against the
  // document versions it has published.
  acceptedTerms: boolean;
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
export type CheckoutInput = {
  planCode: string;
  email: string;
  billing?: "monthly" | "annual";
  callbackUrl?: string;
};

// What travels with a checkout so the API can report the purchase server-side.
// Assembled here rather than by each caller, because there are three callers
// (email signup, post-OAuth signup, billing page) and an attribution bundle
// that only two of them remember to send is worse than none.
export type CheckoutAttribution = {
  // Explicit, and checked again on the API. Without this the server has no way
  // to know whether it is allowed to tell Meta anything about this person.
  marketingConsent: boolean;
  // Shared id so the browser event, the verify path and the webhook path all
  // resolve to one conversion in Meta rather than three.
  eventId: string;
  fbp?: string;
  fbc?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  // The affiliate referral code this buyer arrived on. Sent whether or not
  // marketing consent was granted, because it is not measurement: somebody is
  // owed 20% of this payment and dropping the code would mean not paying them.
  // See lib/analytics/attribution.ts for the full reasoning.
  referralCode?: string;
};

async function authHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  // Shares the same in-memory cache as fetcher(). See token.ts.
  const token = await getAccessToken();
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
    throw new Error(humanizeApiError(res.status, body || res.statusText));
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
  // Starts a Paystack checkout for a paid plan on behalf of the current
  // signed-in user. Returns the hosted-checkout URL to redirect to. The
  // caller must be authenticated (the Bearer token is attached by
  // authHeaders), which is why signup signs the user in first.
  async checkout(input: CheckoutInput) {
    // subscribe_started fires here, once, for every path into Paystack. The
    // attribution bundle goes with the request so the API can hand it to
    // Paystack as transaction metadata and read it back when the money lands.
    const attribution = buildCheckoutAttribution();
    track("subscribe_started", { plan: input.planCode, billing: input.billing ?? "monthly" });
    return request<{ authorizationUrl: string; reference: string; subscriptionId: string }>(
      "/api/payments/checkout",
      { method: "POST", body: JSON.stringify({ ...input, attribution }) },
    );
  },
};

function buildCheckoutAttribution(): CheckoutAttribution {
  const marketingConsent = getConsentState().marketingAllowed;
  const base: CheckoutAttribution = {
    marketingConsent,
    eventId: newEventId(),
    // Deliberately outside the consent gate below. This is a commercial term,
    // not ad measurement, and it is the fallback that catches somebody who
    // arrives on a referral link and pays in the same session before any
    // authenticated page had a chance to record the referral.
    referralCode: getReferralCode(),
  };
  // Nothing beyond the consent flag, the dedup id and the referral code leaves
  // the browser without consent. The id is not personal data and the server
  // needs the flag precisely so it can decide to do nothing.
  if (!marketingConsent) return base;
  const a = getAttribution();
  return {
    ...base,
    fbp: getFbp(),
    fbc: getFbc(a?.fbclid),
    utmSource: a?.utmSource,
    utmMedium: a?.utmMedium,
    utmCampaign: a?.utmCampaign,
    utmContent: a?.utmContent,
  };
}
