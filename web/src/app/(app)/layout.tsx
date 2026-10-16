"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useAutoRefreshSession } from "@/lib/hooks/useAutoRefreshSession";
import { useSessionExpiryGuard } from "@/lib/hooks/useSessionExpiryGuard";
import { useVerificationGate } from "@/lib/hooks/useVerificationGate";
import { useReferralClaim } from "@/lib/api/affiliates";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Keeping a session alive is now the jwt callback's job (lib/auth.ts): it
  // renews from the refresh token on every session read, including the first
  // read after a laptop wakes up. This poll is the belt to that braces — it
  // only ever refreshes a tab that is awake, which is precisely the case the
  // callback already covers.
  useAutoRefreshSession();

  // And when renewal is no longer possible, end the session cleanly instead of
  // rendering a signed-in shell over an API that only returns 401.
  useSessionExpiryGuard();

  // Soft email-verification gate: an unverified account can sign in, but the
  // app sends it to /verify-email until the address is confirmed.
  useVerificationGate();

  // If this person arrived on somebody's referral link, bind the referral to
  // their account now. This is the first authenticated render after signup, so
  // it covers email signup and OAuth with one hook and no change to either
  // flow. Everything about it fails silently: a bad code must never be
  // something a new user notices.
  useReferralClaim(true);

  // The floating AIHelpBot button was dropped — a persistent global
  // help affordance that overlapped page content failed the taste
  // rubric (fake affordance / chrome-on-content). Help lives in
  // /dashboard/help and contextually inside features (the AI tutor
  // in the workspace right rail).
  return <DashboardShell>{children}</DashboardShell>;
}
