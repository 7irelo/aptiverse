"use client";

import { Suspense, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { alpha } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { getSession } from "next-auth/react";
import { useRefreshSession } from "@/lib/hooks/useRefreshSession";
import { apiClient } from "@/lib/api/fetcher";
import { api } from "@/lib/api/client";

// Paystack redirects here after a hosted-checkout payment (callbackUrl set
// during /api/payments/checkout). We verify the transaction server-side
// (which activates the subscription without waiting on the webhook), then
// pull a fresh JWT so paid features light up, and land the buyer in their
// dashboard.
function Welcome() {
  const router = useRouter();
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref");
  const plan = params.get("plan");
  const billing: "monthly" | "annual" = params.get("billing") === "annual" ? "annual" : "monthly";
  // A plan param with no payment reference means we arrived straight from an
  // OAuth signup that chose a paid plan — payment hasn't happened yet, so we
  // start checkout here. A reference means we're back from Paystack.
  const startingCheckout = !!plan && !reference;
  const refresh = useRefreshSession();
  const [settling, setSettling] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // Case A: post-OAuth paid signup. The session now carries the Bearer
      // token, so start Paystack checkout and hand off to the hosted page.
      // (This is the fix for OAuth signups that used to drop the plan.)
      if (startingCheckout && plan) {
        try {
          // Right after the OAuth redirect the session cookie can take a beat to
          // hydrate. Poll getSession() until the Bearer token is present so the
          // checkout call doesn't fire unauthenticated and 401 (which would
          // silently bounce the buyer to the dashboard as a free user).
          let token: string | undefined;
          let email = "";
          for (let i = 0; i < 20 && active; i++) {
            const session = await getSession();
            token = (session as { accessToken?: string } | null)?.accessToken;
            email = (session?.user as { email?: string } | undefined)?.email ?? email;
            if (token) break;
            await new Promise((r) => setTimeout(r, 250));
          }
          if (!active) return;
          if (!token) {
            // Session never hydrated — go into the app rather than hang here.
            router.push("/dashboard");
            return;
          }
          const origin = window.location.origin;
          const { authorizationUrl } = await api.checkout({
            planCode: plan,
            email,
            billing,
            callbackUrl: `${origin}/welcome`,
          });
          window.location.href = authorizationUrl;
          return; // redirecting to Paystack; skip the payment-return path
        } catch {
          // Couldn't start checkout (bad plan, network) — don't strand the
          // user; drop them into the app where they can subscribe from billing.
          if (active) router.push("/dashboard");
          return;
        }
      }

      // Case B: returned from Paystack. Confirm the payment so the subscription
      // is active before we re-issue the session. Best-effort: webhook backstop.
      try {
        if (reference) {
          await apiClient.post("/api/payments/verify", { reference });
        }
      } catch {
        /* ignore — the webhook will reconcile, and features refresh later */
      }
      try {
        await refresh();
      } catch {
        /* ignore — features will refresh on the next cycle */
      }
      if (active) setSettling(false);
    })();
    // Auto-forward to the dashboard only in the payment-return case; the
    // checkout-start case redirects to Paystack instead.
    const t = startingCheckout ? undefined : setTimeout(() => router.push("/dashboard"), 3500);
    return () => {
      active = false;
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2.5,
        bgcolor: "background.default",
      }}
    >
      <Stack spacing={3} alignItems="center" sx={{ maxWidth: 460, textAlign: "center", py: 8 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
            color: "primary.main",
          }}
        >
          <Check size={34} strokeWidth={2.5} />
        </Box>
        <Stack spacing={1.25}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {startingCheckout ? "Almost there" : "You are all set"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {startingCheckout
              ? "Taking you to our secure checkout to finish setting up your subscription."
              : "Payment received and your plan is being activated. We are taking you to your dashboard."}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {settling && <CircularProgress size={16} thickness={5} />}
          <Typography variant="caption" color="text.secondary">
            {settling
              ? startingCheckout
                ? "Redirecting to secure checkout"
                : "Setting up your account"
              : "Ready"}
          </Typography>
        </Stack>
        <Button component={Link} href="/dashboard" variant="contained" size="large">
          Go to dashboard
        </Button>
        {reference && (
          <Typography variant="caption" color="text.disabled">
            Reference {reference}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default function WelcomePage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <Welcome />
    </Suspense>
  );
}
