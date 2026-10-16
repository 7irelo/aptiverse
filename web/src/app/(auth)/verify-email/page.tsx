"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailReadOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import Link from "next/link";
import { api } from "@/lib/api/client";
import { homeRouteForRole } from "@/lib/home-route";

// Shown once the address is confirmed. Two paths:
//   - Already signed in (the soft gate sent them here): refresh the session so
//     emailConfirmed flips to true, which lifts the gate, then send them to
//     their role's home. No re-login.
//   - Not signed in (verified from a link on another device, or an affiliate
//     who never auto-logged-in): offer the sign-in button.
function VerifiedSuccess() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || refreshing) return;
    setRefreshing(true);
    (async () => {
      // Bare update() forces the jwt callback to re-exchange the refresh token
      // (see lib/auth.ts), pulling fresh user state including emailConfirmed.
      await update();
      const role = (session?.user as { role?: string } | undefined)?.role;
      router.replace(homeRouteForRole(role));
    })();
    // update / session identity are stable enough; run once on becoming authed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "success.main", color: "success.contrastText", display: "grid", placeItems: "center" }}>
        <CheckCircleIcon sx={{ fontSize: 38 }} />
      </Box>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Email verified
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 380, mx: "auto" }}>
          {status === "authenticated"
            ? "Your account is active. Taking you in…"
            : "Your Aptiverse account is now active. Sign in to get started."}
        </Typography>
      </Box>
      {status !== "authenticated" && (
        <Button component={Link} href="/login" variant="contained" size="large">
          Sign in
        </Button>
      )}
    </Stack>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const token = params.get("token") ?? "";
  const hasTokenInUrl = Boolean(userId && token);

  // Two distinct flows on one page:
  //   - With ?userId=&token= (came from email link): verify on mount.
  //   - Without (post-register landing): show "check your inbox" + resend.
  const confirmMutation = useMutation({ mutationFn: api.confirmEmail });
  const [didTriggerConfirm, setDidTriggerConfirm] = useState(false);

  useEffect(() => {
    if (hasTokenInUrl && !didTriggerConfirm) {
      setDidTriggerConfirm(true);
      confirmMutation.mutate({ userId, token });
    }
    // intentionally not adding confirmMutation to deps — mutate is stable
    // and we only want to fire once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTokenInUrl, userId, token, didTriggerConfirm]);

  if (hasTokenInUrl) {
    return <ConfirmResult state={confirmMutation} />;
  }
  return <ResendInbox />;
}

function ConfirmResult({
  state,
}: {
  state: ReturnType<typeof useMutation<{ ok: true }, Error, { userId: string; token: string }>>;
}) {
  if (state.isPending || state.isIdle) {
    return (
      <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Verifying your email…
        </Typography>
      </Stack>
    );
  }
  if (state.isSuccess) {
    return <VerifiedSuccess />;
  }
  // isError
  return (
    <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "warning.main", color: "warning.contrastText", display: "grid", placeItems: "center" }}>
        <ErrorIcon sx={{ fontSize: 38 }} />
      </Box>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Couldn&apos;t verify
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 380, mx: "auto" }}>
          The link is either expired or has already been used. Request a fresh one below.
        </Typography>
      </Box>
      <ResendBlock compact />
    </Stack>
  );
}

function ResendInbox() {
  // The soft gate parks a signed-in-but-unverified user here. For them a link
  // to /login is a dead loop: they are already authenticated, so /login sends
  // them home and the verification gate bounces them straight back here. Offer
  // Sign out instead, which actually lets them leave (or switch accounts).
  // Only someone verifying from a link on another device (not signed in here)
  // gets the plain "Back to sign in".
  const { status } = useSession();
  const signedIn = status === "authenticated";
  return (
    <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "brandSurface.main", color: "brandSurface.contrastText", display: "grid", placeItems: "center" }}>
        <MarkEmailReadIcon sx={{ fontSize: 38 }} />
      </Box>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Verify your email
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 380, mx: "auto" }}>
          We&apos;ve sent a verification link to your inbox. Click it to activate your Aptiverse account.
        </Typography>
      </Box>
      <ResendBlock />
      {signedIn ? (
        <Button variant="text" size="small" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      ) : (
        <Button component={Link} href="/login" variant="text" size="small">
          Back to sign in
        </Button>
      )}
    </Stack>
  );
}

function ResendBlock({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const resend = useMutation({ mutationFn: api.resendVerification });

  return (
    <Box sx={{ width: "100%", maxWidth: 380, mx: "auto" }}>
      {resend.isSuccess ? (
        <Alert severity="success">If an account with that email exists, a fresh link is on its way.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {!compact && (
            <Typography variant="caption" color="text.secondary">
              Didn&apos;t get it? We can send another.
            </Typography>
          )}
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              label="Your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Button
              variant="outlined"
              onClick={() => resend.mutate({ email })}
              disabled={!email || resend.isPending}
            >
              {resend.isPending ? "Sending…" : "Resend"}
            </Button>
          </Stack>
          {resend.isError && (
            <Alert severity="info">
              Couldn&apos;t resend. Try again, or contact support if the issue persists.
            </Alert>
          )}
        </Stack>
      )}
    </Box>
  );
}
