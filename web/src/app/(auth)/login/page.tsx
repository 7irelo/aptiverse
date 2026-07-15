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
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField } from "@/components/auth/PasswordField";
import { loginSchema, type LoginValues } from "@/lib/schemas";

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

// Maps a NextAuth session role to that role's dashboard root. Used post-
// login when no specific callbackUrl was supplied — without this every
// role was being dropped onto /dashboard (student) and bouncing into the
// "Wrong role for this area" RoleGuard.
function dashboardForRole(role: string | undefined | null): string {
  switch ((role ?? "").toLowerCase()) {
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    case "tutor":
      return "/tutor";
    case "schooladmin":
    case "school_admin":
    case "school-admin":
      return "/school-admin";
    case "admin":
    case "superuser":
      return "/admin";
    default:
      return "/dashboard";
  }
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

// Friendly copy for the ?error= codes NextAuth (and our Google signIn
// callback) redirect back with. OAuthNoAccount is our invite-only rejection.
function oauthErrorMessage(code: string | null): string | null {
  switch (code) {
    case "OAuthNoAccount":
      return "No Aptiverse account is linked to that Google email. Create an account first, then you can sign in with Google.";
    case "OAuthFailed":
    case "OAuthCallback":
    case "OAuthAccountNotLinked":
    case "AccessDenied":
      return "We couldn't sign you in with Google. Please try again.";
    default:
      return null;
  }
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const rawCallback = params.get("callbackUrl");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const oauthError = oauthErrorMessage(params.get("error"));
  const { data: session, status } = useSession();

  // Already signed in with a live token? Don't make them sign in again —
  // send them where they were headed, or to their role's dashboard.
  useEffect(() => {
    if (status !== "authenticated") return;
    const token = (session as { accessToken?: string } | null)?.accessToken;
    if (!tokenStillValid(token)) return;
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.replace(
      !rawCallback || rawCallback === "/dashboard" ? dashboardForRole(role) : rawCallback,
    );
  }, [status, session, rawCallback, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
    setSubmitting(false);
    if (!res || res.error) {
      setError("Invalid email or password");
      return;
    }

    // Resolve where to send the user. If they were redirected here from
    // a specific protected page, honour that. Otherwise fall back to the
    // dashboard for their role. The default /dashboard from NextAuth is
    // student-only and would bounce non-students to the RoleGuard page.
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const dest =
      !rawCallback || rawCallback === "/dashboard" ? dashboardForRole(role) : rawCallback;
    router.push(dest);
    router.refresh();
  }

  return (
    <Stack spacing={3}>
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
          <Button type="submit" size="large" variant="contained" disabled={!isValid || submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        New to Aptiverse?{" "}
        <MuiLink
          component={Link}
          href="/register"
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
