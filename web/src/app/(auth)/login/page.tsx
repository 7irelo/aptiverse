"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField } from "@/components/auth/PasswordField";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import { homeRouteForRole } from "@/lib/home-route";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { clearAccessToken } from "@/lib/api/token";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginInner />
    </Suspense>
  );
}

function LoginSkeleton() {
  return (
    <Stack spacing={3}>
      <Typography variant="h3" sx={{ fontWeight: 700 }}>Sign in</Typography>
    </Stack>
  );
}

// True only when the API access token is present AND still in date.
//
// A NextAuth session outlives the API token (30 days vs Jwt:ExpireHours), so
// "has a session" is not the same as "can call the API". Bouncing a stale-token
// user to the dashboard would 401 on its first query, trip signIn(), and land
// them back here — a redirect loop. When the token is dead we keep them on the
// form so a real sign-in can mint a fresh one.
function tokenStillValid(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(
      atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "=")),
    ) as { exp?: number };
    return typeof claims.exp === "number" && claims.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Friendly copy for the ?error= codes next-auth and our Google signIn callback
// redirect back with. OAuthNoAccount is our invite-only rejection.
//
// Every ?error= next-auth can send here, not only the OAuth ones. Errors now
// route to /login rather than next-auth's built-in page, so this is the only
// thing standing between a code in the query string and a person wondering
// what just happened.
function authErrorMessage(code: string | null): string | null {
  switch (code) {
    case "OAuthNoAccount":
      return "No Aptiverse account is linked to that Google email. Create an account first, then you can sign in with Google.";
    case "OAuthFailed":
    case "OAuthCallback":
    case "OAuthAccountNotLinked":
    case "AccessDenied":
      return "We couldn't sign you in with Google. Please try again.";
    // The long-tab case. The access token lasts four hours and renews itself
    // only while a tab is awake to poll, so a session left open overnight
    // lapses. Say that plainly: nothing has gone wrong with their account and
    // signing in again is the whole fix.
    case "SessionRequired":
      return "Your session ended. Sign in again to pick up where you left off.";
    case "Verification":
      return "That link has expired. Request a new one and try again.";
    case null:
    case "":
      return null;
    // Anything unrecognised still says something. Landing on a sign-in form
    // with no explanation reads as the app having broken, which is worse than
    // a plain sentence.
    default:
      return "Your session ended. Sign in again to continue.";
  }
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawCallback = params.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const oauthError = authErrorMessage(params.get("error"));
  const { data: session, status } = useSession();
  const hydrated = useHydrated();

  // Carry an invitee's destination onto the register link too, so a brand new
  // invitee who has no account lands back where they were headed (e.g. the
  // connections hub) once they finish signing up. Same-origin paths only, to
  // avoid turning the register link into an open redirect.
  const registerHref =
    rawCallback && rawCallback.startsWith("/")
      ? `/register?callbackUrl=${encodeURIComponent(rawCallback)}`
      : "/register";

  // Already signed in with a live token? Don't make them sign in again —
  // send them where they were headed, or to their role's dashboard.
  useEffect(() => {
    if (status !== "authenticated") return;
    // An in-flight submit owns the navigation (a hard load). Bailing here keeps
    // this soft redirect from racing it the instant the session flips.
    if (submitting) return;
    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!tokenStillValid(token)) return;
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.replace(
      !rawCallback || rawCallback === "/dashboard" ? homeRouteForRole(role) : rawCallback,
    );
  }, [status, session, rawCallback, router, submitting]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setError(null);
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    // Only clear the submitting flag on failure. On success we stay disabled
    // until the redirect below unmounts this form, so there is no window in
    // which a second click fires a second sign-in.
    if (!res || res.error) {
      setSubmitting(false);
      setError("Invalid email or password");
      return;
    }

    // A different account may have been signed in a moment ago, and the API
    // token is cached in memory for the lifetime of the tab. Drop it here so
    // the first request after signing in cannot go out carrying the previous
    // user's token.
    clearAccessToken();

    // Resolve where to send the user. If they were redirected here from
    // a specific protected page, honour that. Otherwise fall back to the
    // dashboard for their role. The default /dashboard from NextAuth is
    // student-only and would bounce non-students to the RoleGuard page.
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const dest =
      !rawCallback || rawCallback === "/dashboard" ? homeRouteForRole(role) : rawCallback;

    // Hard navigation, deliberately NOT router.push. A soft client-side
    // navigation can win the race against NextAuth writing its session cookie:
    // the destination's guard then reads no session yet and bounces back here,
    // and the form sits stuck on "Signing in…" until a manual reload. That is
    // the intermittent "stuck on login" bug. A full load guarantees the cookie
    // is sent with the request and the app boots authenticated. `submitting`
    // stays true so the overlay shows until the browser leaves this page.
    window.location.assign(dest);
  }

  return (
    <Stack spacing={3}>
      {/* Full-screen "signing you in" state. It stays up from a successful
          submit until the browser leaves for the destination, so the moment
          between clicking Sign in and the app appearing is never a frozen
          form — which is what the stuck-looking login was. */}
      <Backdrop
        open={submitting}
        sx={{ zIndex: (t) => t.zIndex.modal + 1, color: "#fff", flexDirection: "column", gap: 2 }}
      >
        <CircularProgress color="inherit" />
        <Typography variant="body1">Signing you in…</Typography>
      </Backdrop>

      <Box>
        <Typography variant="overline" color="primary.main">
          Welcome back
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>
          Sign in
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Continue to your Aptiverse workspace.
        </Typography>
      </Box>

      <OAuthButtons callbackUrl={rawCallback ?? "/dashboard"} />

      {(error ?? oauthError) && <Alert severity="error">{error ?? oauthError}</Alert>}

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            autoComplete="email"
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <PasswordField
            fullWidth
            label="Password"
            autoComplete="current-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={<Checkbox size="small" {...register("remember")} defaultChecked />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <MuiLink
              component={Link}
              href="/forgot-password"
              variant="body2"
              color="text.secondary"
              underline="hover"
              sx={{ "&:hover": { color: "text.primary" } }}
            >
              Forgot password?
            </MuiLink>
          </Stack>
          {/* Disabled only while this button genuinely cannot work: before
              hydration (a native submit would put the password in the URL)
              and while a sign-in is in flight. Never gate it on the form's
              `isValid`. See useHydrated for the full reasoning: gating on
              `isValid` is what made the first click on Sign in do nothing. */}
          <Button
            type="submit"
            size="large"
            variant="contained"
            disabled={!hydrated || submitting}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        New to Aptiverse?{" "}
        <MuiLink
          component={Link}
          href={registerHref}
          color="text.primary"
          underline="hover"
          sx={{ fontWeight: 600 }}
        >
          Create an account
        </MuiLink>
      </Typography>
    </Stack>
  );
}
