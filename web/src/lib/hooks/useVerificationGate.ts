"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// The soft email-verification gate. An unverified account CAN sign in — login
// does not block on verification — but it may not use the app until the address
// is confirmed. Every authenticated area runs this; when the session says the
// email is not confirmed, it sends the person to /verify-email, which shows the
// "check your inbox" notice and a resend.
//
// The check is deliberately `=== false`, not "falsy". A session minted before
// emailConfirmed existed carries `undefined`, and bouncing those users on a
// missing field would eject everyone already signed in until their token
// happens to refresh. Only an explicit false — which every current login and
// refresh now sets — trips the gate. OAuth accounts are confirmed on creation,
// so they never see it.
export function useVerificationGate() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    const confirmed = (session?.user as { emailConfirmed?: boolean } | undefined)?.emailConfirmed;
    if (confirmed === false) {
      router.replace("/verify-email");
    }
  }, [status, session, router]);
}
