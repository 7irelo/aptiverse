"use client";

// Public accept landing page for a parent -> student invite. Reachable while
// logged out (it lives outside the (app) auth area), because the very first
// thing an invited stranger does is open this from the email. It resolves the
// invite by its token, then guides every auth state to the accept:
//
//   signed in, email matches   -> one-click Accept (+ Decline)
//   signed in, email mismatch  -> explain + sign out to re-auth
//   signed out                 -> create the account the invite was sent to,
//                                 or sign in, then return here to accept
//
// The accept endpoint stays authenticated and still verifies the caller owns
// the invited email; this page is only a nicer front door, never a bypass.

import { use } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOutAptiverse } from "@/lib/auth-client";
import {
  Users,
  ShieldAlert,
  CircleCheck,
  CircleSlash,
  LogOut,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { useInviteByToken, useAcceptInvite, useDeclineInvite } from "@/lib/api/queries";

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <InviteInner token={token} />;
}

// A tinted round badge that carries the state's icon. Neutral graphite by
// default; the connect state passes the citron secondary as a surface accent.
function StateBadge({
  icon,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  tone?: "neutral" | "brand";
}) {
  return (
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        color: "primary.main",
        bgcolor: (t) =>
          tone === "brand"
            ? alpha(t.palette.secondary.main, 0.22)
            : alpha(t.palette.primary.main, 0.07),
      }}
    >
      {icon}
    </Box>
  );
}

// Centered, mobile-first shell: the Aptiverse mark over a single calm card,
// echoing the auth pages' visual language.
function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2.5, sm: 3 },
        py: { xs: 5, sm: 8 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 440 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Box component={Link} href="/" sx={{ display: "inline-flex" }} aria-label="Aptiverse home">
            <Logo />
          </Box>
        </Box>
        <Card sx={{ borderColor: "divider" }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>{children}</CardContent>
        </Card>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 2.5 }}
        >
          Aptiverse connects families with consent. You are always in control of who sees your work.
        </Typography>
      </Box>
    </Box>
  );
}

function CenteredLoading({ label }: { label: string }) {
  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
      <CircularProgress size={26} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

function InviteInner({ token }: { token: string }) {
  const router = useRouter();
  const inviteQuery = useInviteByToken(token);
  const { data: session, status: sessionStatus } = useSession();
  const accept = useAcceptInvite(token);
  const decline = useDeclineInvite(token);

  const invite = inviteQuery.data;
  const sessionEmail = (session?.user as { email?: string } | undefined)?.email ?? null;
  const emailMatches =
    !!invite &&
    !!sessionEmail &&
    sessionEmail.trim().toLowerCase() === invite.studentEmail.trim().toLowerCase();

  const inviteCallback = `/invite/${token}`;
  const registerHref = invite
    ? `/register?callbackUrl=${encodeURIComponent(inviteCallback)}&email=${encodeURIComponent(invite.studentEmail)}`
    : "/register";
  const loginHref = `/login?callbackUrl=${encodeURIComponent(inviteCallback)}`;

  function onAccept() {
    accept.mutate(undefined, {
      onSuccess: () => router.push("/dashboard/connections"),
    });
  }

  function onDecline() {
    decline.mutate(undefined, {
      onSuccess: () => router.push("/"),
    });
  }

  // 1. Resolving the token.
  if (inviteQuery.isLoading) {
    return (
      <InviteShell>
        <CenteredLoading label="Loading your invite…" />
      </InviteShell>
    );
  }

  // 2. Unknown token, expired row, or a resolve error: one calm dead-end.
  if (!invite) {
    return (
      <InviteShell>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <StateBadge icon={<ShieldAlert size={26} />} />
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              This invite is not available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This invite link is not valid or has already been used. If you were expecting one, ask
              for a fresh invite.
            </Typography>
          </Stack>
          <Button component={Link} href="/" variant="contained" size="large" fullWidth>
            Go to Aptiverse
          </Button>
        </Stack>
      </InviteShell>
    );
  }

  // 3. Already responded to (or otherwise no longer pending).
  if (invite.status !== "pending") {
    const accepted = invite.status === "accepted";
    const declined = invite.status === "declined";
    return (
      <InviteShell>
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <StateBadge
            icon={accepted ? <CircleCheck size={26} /> : <CircleSlash size={26} />}
            tone={accepted ? "brand" : "neutral"}
          />
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {accepted
                ? "You are connected"
                : declined
                  ? "Invite declined"
                  : "This invite is no longer active"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {accepted
                ? `This invite was already accepted. ${invite.parentName} is connected to your account.`
                : declined
                  ? "This invite was already declined. Nothing further is needed."
                  : "This invite is no longer available. If you were expecting one, ask for a fresh invite."}
            </Typography>
          </Stack>
          {accepted ? (
            <Button
              component={Link}
              href="/dashboard/connections"
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowRight size={16} />}
            >
              View your connections
            </Button>
          ) : (
            <Button component={Link} href="/" variant="outlined" size="large" fullWidth>
              Go to Aptiverse
            </Button>
          )}
        </Stack>
      </InviteShell>
    );
  }

  // 4. Pending: wait for the session to resolve before choosing a path, so we
  //    never flash the signed-out actions at a signed-in invitee.
  if (sessionStatus === "loading") {
    return (
      <InviteShell>
        <CenteredLoading label="Checking your session…" />
      </InviteShell>
    );
  }

  // 4a. Signed in, and the account matches the invited email: accept in place.
  if (sessionStatus === "authenticated" && emailMatches) {
    return (
      <InviteShell>
        <Stack spacing={3} textAlign="center" alignItems="center">
          <StateBadge icon={<Users size={26} />} tone="brand" />
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
              {invite.parentName} invited you to connect on Aptiverse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Accepting gives {invite.parentName} a read-only view of your upcoming assessments and
              progress. You stay in control and can remove access at any time.
            </Typography>
          </Stack>

          {accept.isError && (
            <Alert severity="error" sx={{ width: "100%", textAlign: "left" }}>
              {accept.error.message}
            </Alert>
          )}

          <Stack spacing={1.25} sx={{ width: "100%" }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onAccept}
              disabled={accept.isPending || decline.isPending}
              endIcon={<ArrowRight size={16} />}
            >
              {accept.isPending ? "Connecting…" : "Accept and connect"}
            </Button>
            <Button
              variant="text"
              size="large"
              fullWidth
              color="inherit"
              onClick={onDecline}
              disabled={accept.isPending || decline.isPending}
              sx={{ color: "text.secondary" }}
            >
              {decline.isPending ? "Declining…" : "Decline"}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            Signed in as {sessionEmail}
          </Typography>
        </Stack>
      </InviteShell>
    );
  }

  // 4b. Signed in, but as the wrong account: explain and offer a clean re-auth.
  if (sessionStatus === "authenticated" && !emailMatches) {
    return (
      <InviteShell>
        <Stack spacing={3} textAlign="center" alignItems="center">
          <StateBadge icon={<ArrowLeftRight size={26} />} />
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              This invite is for a different account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This invite was sent to <strong>{invite.studentEmail}</strong>, but you are signed in
              as <strong>{sessionEmail}</strong>. Sign out and continue as {invite.studentEmail} to
              accept it.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => void signOutAptiverse(loginHref)}
            endIcon={<LogOut size={16} />}
          >
            Sign out and switch account
          </Button>
        </Stack>
      </InviteShell>
    );
  }

  // 4c. Signed out: set the context, then send them to the right front door.
  return (
    <InviteShell>
      <Stack spacing={3} textAlign="center" alignItems="center">
        <StateBadge icon={<Users size={26} />} tone="brand" />
        <Stack spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
            {invite.parentName} invited you to connect on Aptiverse
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in as {invite.studentEmail}, or create your account, to accept. Connecting lets{" "}
            {invite.parentName} follow your progress with your consent.
          </Typography>
        </Stack>
        <Stack spacing={1.25} sx={{ width: "100%" }}>
          <Button
            component={Link}
            href={registerHref}
            variant="contained"
            size="large"
            fullWidth
            endIcon={<ArrowRight size={16} />}
          >
            Create an account
          </Button>
          <Button component={Link} href={loginHref} variant="outlined" size="large" fullWidth>
            Sign in
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Invited as {invite.studentEmail}
        </Typography>
      </Stack>
    </InviteShell>
  );
}
