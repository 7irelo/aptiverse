"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
            Your Aptiverse account is now active. Sign in to get started.
          </Typography>
        </Box>
        <Button component={Link} href="/login" variant="contained" size="large">
          Sign in
        </Button>
      </Stack>
    );
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
      <Button component={Link} href="/login" variant="text" size="small">
        Back to sign in
      </Button>
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
