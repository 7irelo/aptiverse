"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import MuiLink from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Users, Presentation, ChevronRight, Lock } from "lucide-react";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField } from "@/components/auth/PasswordField";
import { useRoleStore, type Role } from "@/providers/RoleProvider";
import { registerStep2Schema, type RegisterValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";

// Self-signup is intentionally limited to roles a person can claim on
// their own. School-side roles (Teacher, SchoolAdmin) are provisioned
// through the school onboarding flow: a school contacts sales, gets a
// SchoolAdmin seat, then invites its teachers from inside the dashboard.
const ROLE_OPTIONS: { value: Role; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "student", label: "Student", description: "At school or university", icon: <GraduationCap size={20} /> },
  { value: "parent", label: "Family", description: "Supporting my children", icon: <Users size={20} /> },
  { value: "tutor", label: "Tutor", description: "List a profile and teach", icon: <Presentation size={20} /> },
];

// Paid plan codes that route through Paystack after signup. Anything else
// (a free plan, or no plan at all) goes straight to the dashboard.
const PAID_PLANS = new Set([
  "student.pro",
  "student.max",
  "family",
  "family.plus",
  "tutor.pro",
  "tutor.premium",
]);

function roleForPlan(plan: string | null): Role | null {
  if (!plan) return null;
  if (plan.startsWith("student")) return "student";
  if (plan.startsWith("family")) return "parent";
  if (plan.startsWith("tutor")) return "tutor";
  return null;
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const roleParam = searchParams.get("role");
  const billing: "monthly" | "annual" = searchParams.get("billing") === "annual" ? "annual" : "monthly";
  // Only treat it as a paid signup if the plan is one we actually charge for.
  const paidPlan = planParam && PAID_PLANS.has(planParam) ? planParam : null;

  const setRole = useRoleStore((s) => s.setRole);
  const role = useRoleStore((s) => s.role);
  const router = useRouter();

  const [step, setStep] = useState(0);

  // Arriving from a pricing CTA: preselect the role the plan implies (or an
  // explicit ?role=) and skip the role picker straight to the details step.
  useEffect(() => {
    const derived = roleForPlan(planParam) ?? (roleParam as Role | null);
    if (derived) {
      setRole(derived);
      setStep(1);
    }
    // Run once, on mount, from the initial query string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerStep2Schema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const isStudent = role === "student";

  const mutation = useMutation({
    mutationFn: async (v: RegisterValues) => {
      // 1. Create the account on the .NET API. Just the basics — the academic
      //    profile (student type + curriculum/institution) is collected in a
      //    separate onboarding step so signup stays short.
      await api.register({
        email: v.email,
        password: v.password,
        firstName: v.firstName,
        lastName: v.lastName,
        role,
      });
      // 2. Sign in so the session carries the Aptiverse JWT, which the API
      //    client needs as a Bearer token for the authenticated checkout.
      const signInRes = await signIn("credentials", {
        email: v.email,
        password: v.password,
        redirect: false,
      });
      if (!signInRes || signInRes.error) {
        throw new Error(
          "Your account was created, but automatic sign-in failed. Please sign in from the login page.",
        );
      }
      // 3a. Paid plan: start Paystack checkout and hand off to their hosted page.
      if (paidPlan) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const { authorizationUrl } = await api.checkout({
          planCode: paidPlan,
          email: v.email,
          billing,
          callbackUrl: `${origin}/welcome`,
        });
        window.location.href = authorizationUrl;
        return { redirecting: true as const };
      }
      // 3b. Free plan: into the app.
      return { redirecting: false as const };
    },
    onSuccess: (r) => {
      if (!r.redirecting) {
        // Students go to the onboarding step to set their academic profile;
        // everyone else straight to their dashboard.
        setTimeout(() => router.push(isStudent ? "/onboarding" : "/dashboard"), 400);
      }
    },
  });

  const activeRole = ROLE_OPTIONS.find((r) => r.value === role);

  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography variant="overline" color="primary.main">
          Get started
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {step === 0
            ? "First, tell us who you are."
            : paidPlan
              ? "A few details, then a secure checkout."
              : "A few details and you are in."}
        </Typography>
      </Box>

      {/* Segmented step indicator, calmer than a progress bar. */}
      <Stack direction="row" spacing={1} aria-hidden>
        {[0, 1].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: i <= step ? "primary.main" : "divider",
              transition: "background-color 240ms cubic-bezier(0.165, 0.84, 0.44, 1)",
            }}
          />
        ))}
      </Stack>

      {step === 0 && (
        <>
          <Stack spacing={1.5}>
            {ROLE_OPTIONS.map((r) => {
              const selected = role === r.value;
              return (
                <Card
                  key={r.value}
                  sx={{
                    borderColor: selected ? "primary.main" : "divider",
                    boxShadow: selected ? (t) => `0 0 0 2px ${alpha(t.palette.primary.main, 0.16)}` : "none",
                    transition:
                      "border-color 180ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 180ms cubic-bezier(0.165, 0.84, 0.44, 1)",
                  }}
                >
                  <CardActionArea
                    onClick={() => {
                      setRole(r.value);
                      setStep(1);
                    }}
                    aria-pressed={selected}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1.75} alignItems="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                            color: "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          {r.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {r.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {r.description}
                          </Typography>
                        </Box>
                        <Box sx={{ color: "text.disabled", display: "flex" }}>
                          <ChevronRight size={18} />
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Already on Aptiverse?{" "}
            <MuiLink component={Link} href="/login" color="text.primary" underline="hover" sx={{ fontWeight: 600 }}>
              Sign in
            </MuiLink>
          </Typography>
        </>
      )}

      {step === 1 && (
        <>
          {activeRole && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ p: 1.5, borderRadius: 2, border: 1, borderColor: "divider", bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}
            >
              <Box sx={{ color: "primary.main", display: "flex" }}>{activeRole.icon}</Box>
              <Typography variant="body2" sx={{ flex: 1 }}>
                Signing up as <strong>{activeRole.label}</strong>
              </Typography>
              {/* When the plan dictates the role, don't offer to change it. */}
              {!paidPlan && (
                <Button size="small" variant="text" onClick={() => setStep(0)}>
                  Change
                </Button>
              )}
            </Stack>
          )}

          {mutation.isSuccess ? (
            <Alert severity="success">
              {paidPlan
                ? "Account created. Redirecting to secure checkout."
                : "Account created. Redirecting to your dashboard."}
            </Alert>
          ) : (
            <>
              {/* Carry the chosen paid plan through the Google round-trip: land
                  on /welcome with the plan so checkout starts once authenticated.
                  Without this, OAuth signups silently drop the plan and land free. */}
              <OAuthButtons
                callbackUrl={
                  paidPlan
                    ? `/welcome?plan=${encodeURIComponent(paidPlan)}&billing=${billing}`
                    : "/dashboard"
                }
              />
              <Box component="form" noValidate onSubmit={handleSubmit((v) => mutation.mutate(v))}>
                <Stack spacing={2}>
                  {mutation.isError && <Alert severity="error">{(mutation.error as Error).message}</Alert>}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField fullWidth required label="First name" {...register("firstName")} error={!!errors.firstName} helperText={errors.firstName?.message} />
                    <TextField fullWidth required label="Last name" {...register("lastName")} error={!!errors.lastName} helperText={errors.lastName?.message} />
                  </Stack>
                  <TextField required fullWidth label="Email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
                  <PasswordField
                    required
                    fullWidth
                    label="Password"
                    autoComplete="new-password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message ?? "At least 8 chars, one uppercase, one number"}
                  />
                  {isStudent && (
                    <Typography variant="body2" color="text.secondary">
                      Next, we&apos;ll ask a couple of quick details to tailor your subjects and
                      practice.
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    By creating an account you agree to our{" "}
                    <MuiLink component={Link} href="/terms" color="text.primary" underline="hover">
                      Terms
                    </MuiLink>{" "}
                    and{" "}
                    <MuiLink component={Link} href="/privacy" color="text.primary" underline="hover">
                      Privacy Policy
                    </MuiLink>
                    .
                  </Typography>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!isValid || mutation.isPending}
                    fullWidth
                    startIcon={paidPlan ? <Lock size={16} /> : undefined}
                  >
                    {mutation.isPending
                      ? paidPlan
                        ? "Starting checkout…"
                        : "Creating account…"
                      : paidPlan
                        ? "Continue to secure payment"
                        : "Create account"}
                  </Button>
                  {paidPlan && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
                      Payment is handled securely by Paystack. Cancel any time.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </>
          )}
        </>
      )}
    </Stack>
  );
}

export default function RegisterPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
