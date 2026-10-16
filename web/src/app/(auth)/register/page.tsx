"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { alpha } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Users, Presentation, ChevronRight, Lock, Gift } from "lucide-react";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField } from "@/components/auth/PasswordField";
import { useRoleStore, type Role } from "@/providers/RoleProvider";
import { registerStep2Schema, type RegisterValues } from "@/lib/schemas";
import { homeRouteForRole } from "@/lib/home-route";
import { api } from "@/lib/api/client";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { track } from "@/lib/analytics/events";
import { captureReferralCode, getReferralCode, clearReferralCode } from "@/lib/analytics/attribution";
import { usePlans } from "@/lib/api/queries";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Check as CheckIcon } from "lucide-react";

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
  "parent",
  "parent.2",
  "parent.3",
  "parent.4",
  "tutor.pro",
  "tutor.premium",
]);

// Display names for the plans a student can pick at sign-up. "free" is the key
// used when no paid plan is selected.
const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  "student.pro": "Student Pro",
  "student.max": "Student Max",
};

function roleForPlan(plan: string | null): Role | null {
  if (!plan) return null;
  if (plan.startsWith("student")) return "student";
  if (plan.startsWith("parent")) return "parent";
  if (plan.startsWith("tutor")) return "tutor";
  return null;
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const roleParam = searchParams.get("role");
  const billing: "monthly" | "annual" = searchParams.get("billing") === "annual" ? "annual" : "monthly";
  // A plan carried in via ?plan= (e.g. a pricing CTA). Used to seed the choice.
  const urlInitialPlan = planParam && PAID_PLANS.has(planParam) ? planParam : null;
  // Where to land after a free signup, when arriving from an invite (e.g. a
  // parent invite links to /login?callbackUrl=/dashboard/connections, and the
  // login page threads that through to here). Same-origin paths only, so a
  // stray absolute callbackUrl can never become an open redirect.
  const rawCallback = searchParams.get("callbackUrl");
  const callback = rawCallback && rawCallback.startsWith("/") ? rawCallback : null;
  // A parent invite links here as /register?email=... so a brand-new invitee
  // registers with the exact address the invite was sent to (the accept
  // endpoint requires the emails match). Used only as the field's initial
  // default, so anything the user types still wins.
  const emailParam = searchParams.get("email");
  const invitedEmail = emailParam && emailParam.includes("@") ? emailParam : "";

  const setRole = useRoleStore((s) => s.setRole);
  const role = useRoleStore((s) => s.role);
  const router = useRouter();

  const [step, setStep] = useState(0);

  // The chosen plan. null means the free tier. Step 0 is now a plan picker
  // rather than a role picker: the plan implies the role, and a referred
  // student who lands here with no plan in the URL could otherwise only sign up
  // free, which earns their referrer nothing. Seeded from ?plan= when present.
  const [selectedPlan, setSelectedPlan] = useState<string | null>(urlInitialPlan);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(billing);

  // Only a plan we actually charge for routes through checkout.
  const paidPlan = selectedPlan && PAID_PLANS.has(selectedPlan) ? selectedPlan : null;

  // Arriving from a pricing CTA with a plan (or an explicit ?role=): the choice
  // is already made, so skip step 0 straight to the details step.
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
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerStep2Schema),
    mode: "onTouched",
    // acceptedTerms starts false on purpose. A pre-ticked box is not
    // consent, and in most jurisdictions it is not lawful either.
    defaultValues: { firstName: "", lastName: "", email: invitedEmail, password: "", acceptedTerms: false },
  });

  const isStudent = role === "student";
  const hydrated = useHydrated();

  // signup_started is "they are looking at the account form", not "they landed
  // on /register". Step 0 is a role picker, and counting a person who bounced
  // off the role cards as a started signup would flatter the funnel at exactly
  // the step where the drop-off is most worth seeing.
  const startedRef = useRef(false);
  useEffect(() => {
    if (step !== 1 || startedRef.current) return;
    startedRef.current = true;
    track("signup_started", { role: role ?? "unknown", plan: paidPlan ?? "free" });
  }, [step, role, paidPlan]);

  // Optional "someone referred me" field. Prefilled from a ?ref= link if one
  // brought them here (set in a client effect to avoid a hydration mismatch),
  // otherwise blank for a code they were given by hand. Whatever ends up here
  // is handed to captureReferralCode on submit, which is first-touch-wins, so a
  // real link is never overwritten by what is typed.
  const [referral, setReferral] = useState("");
  // True when the code came from a stored ?ref= link rather than being typed.
  // Those get a clear "you were referred" notice with a remove control, because
  // a code the person never typed appearing in a field is confusing.
  const [referralFromLink, setReferralFromLink] = useState(false);
  useEffect(() => {
    const fromLink = getReferralCode();
    if (fromLink) {
      setReferral(fromLink);
      setReferralFromLink(true);
    }
  }, []);

  const removeReferral = () => {
    setReferral("");
    setReferralFromLink(false);
    clearReferralCode();
  };

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
        acceptedTerms: v.acceptedTerms,
      });
      // The account exists. Report it here rather than after the redirect,
      // because on the paid path the very next thing that happens is a
      // hand-off to Paystack's domain and the event would never be sent.
      track("signup_completed", { role: role ?? "unknown", plan: paidPlan ?? "free" });
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
          billing: billingCycle,
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
        // An invitee carries a same-origin callback (e.g. the connections hub):
        // honour it so they land where the invite meant to send them. Otherwise
        // students go to onboarding to set their academic profile and everyone
        // else goes straight to their own role's dashboard.
        const dest = callback ?? (isStudent ? "/onboarding" : homeRouteForRole(role));
        setTimeout(() => router.push(dest), 400);
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
            ? "Pick your plan. You can change or cancel anytime."
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
          <StudentPlanPicker
            billingCycle={billingCycle}
            onBillingChange={setBillingCycle}
            selected={selectedPlan}
            onSelect={(code) => {
              setRole("student");
              setSelectedPlan(code);
              setStep(1);
            }}
            onSelectRole={(r) => {
              // Parent / tutor: a separate track with no student plan. Straight
              // to the details step.
              setRole(r);
              setSelectedPlan(null);
              setStep(1);
            }}
          />
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
                {isStudent ? (
                  <>
                    On the <strong>{PLAN_LABEL[selectedPlan ?? "free"] ?? "Free"}</strong> plan
                  </>
                ) : (
                  <>
                    Signing up as <strong>{activeRole.label}</strong>
                  </>
                )}
              </Typography>
              {/* Always changeable now that step 0 is the plan/role picker,
                  unless the plan was fixed by a ?plan= link from pricing. */}
              {!urlInitialPlan && (
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
                    ? `/welcome?plan=${encodeURIComponent(paidPlan)}&billing=${billingCycle}`
                    : callback ?? "/dashboard"
                }
              />
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit((v) => {
                  // Persist the referral code before registering so the existing
                  // claim flow and the paid-checkout metadata both pick it up.
                  const code = referral.trim();
                  if (code) captureReferralCode(code);
                  mutation.mutate(v);
                })}
              >
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
                  {referralFromLink ? (
                    <Alert
                      severity="info"
                      icon={<Gift size={18} />}
                      action={
                        <Button color="inherit" size="small" onClick={removeReferral}>
                          Remove
                        </Button>
                      }
                    >
                      You were referred by a friend. Code <strong>{referral}</strong> is applied, so
                      they get credit. Not you? Remove it.
                    </Alert>
                  ) : (
                    <TextField
                      fullWidth
                      label="Referral code (optional)"
                      value={referral}
                      onChange={(e) => setReferral(e.target.value.toUpperCase())}
                      inputProps={{ style: { textTransform: "uppercase" }, autoCapitalize: "characters" }}
                      helperText="Got a code from someone? Enter it so they get credit."
                    />
                  )}
                  {isStudent && (
                    <Typography variant="body2" color="text.secondary">
                      Next, we&apos;ll ask a couple of quick details to tailor your subjects and
                      practice.
                    </Typography>
                  )}
                  {/* Consent has to be an active tick, never a default. The
                      links open in a new tab so reading the terms cannot
                      throw away a half-filled form. */}
                  <Box>
                    <FormControlLabel
                      control={<Checkbox {...register("acceptedTerms")} size="small" sx={{ py: 0.5 }} />}
                      sx={{ alignItems: "flex-start", ml: 0, mr: 0 }}
                      label={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          I agree to the{" "}
                          <MuiLink
                            component={Link}
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="text.primary"
                            underline="hover"
                          >
                            Terms
                          </MuiLink>{" "}
                          and the{" "}
                          <MuiLink
                            component={Link}
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            color="text.primary"
                            underline="hover"
                          >
                            Privacy Policy
                          </MuiLink>
                          .
                        </Typography>
                      }
                    />
                    {errors.acceptedTerms && (
                      <FormHelperText error sx={{ mx: 0 }}>
                        {errors.acceptedTerms.message}
                      </FormHelperText>
                    )}
                  </Box>
                  {/* Not gated on `isValid`: a password manager's "suggest
                      strong password" fill can reach these inputs without
                      react-hook-form seeing it, and a disabled MUI button
                      swallows the click. handleSubmit blocks invalid
                      submits and surfaces the field errors instead. */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!hydrated || mutation.isPending}
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

// The plan chooser that opens the student sign-up. Reads live plan prices, so
// nothing here hard-codes a rand figure. Free selects null (the free tier);
// Pro and Max carry their plan code into checkout after the details step.
function StudentPlanPicker({
  billingCycle,
  onBillingChange,
  selected,
  onSelect,
  onSelectRole,
}: {
  billingCycle: "monthly" | "annual";
  onBillingChange: (c: "monthly" | "annual") => void;
  selected: string | null;
  onSelect: (code: string | null) => void;
  onSelectRole: (role: Role) => void;
}) {
  const plans = usePlans();
  const byCode = (code: string) => plans.data?.find((p) => p.code === code);

  // Per-month figure for the chosen cycle. Annual is billed once but shown per
  // month so the three cards compare like-for-like.
  const perMonth = (code: string): number => {
    const p = byCode(code);
    if (!p) return 0;
    if (billingCycle === "annual" && p.annualPriceZar != null) return Math.round(p.annualPriceZar / 12);
    return p.monthlyPriceZar ?? 0;
  };

  const OPTIONS: { code: string | null; name: string; blurb: string; highlight?: boolean }[] = [
    { code: null, name: "Free", blurb: "The essentials, at no cost. Upgrade whenever you like." },
    { code: "student.pro", name: "Student Pro", blurb: "Unlimited AI practice, predictions and the tutor.", highlight: true },
    { code: "student.max", name: "Student Max", blurb: "Everything in Pro, plus the exam simulator." },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="center">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={billingCycle}
          onChange={(_, v) => v && onBillingChange(v)}
        >
          <ToggleButton value="monthly" sx={{ px: 2 }}>Monthly</ToggleButton>
          <ToggleButton value="annual" sx={{ px: 2 }}>Annual · 2 months free</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Stack spacing={1.5}>
        {OPTIONS.map((o) => {
          const isSel = selected === o.code || (o.code === null && selected === null);
          const price = o.code ? perMonth(o.code) : 0;
          return (
            <Card
              key={o.code ?? "free"}
              sx={{
                borderColor: o.highlight ? "primary.main" : "divider",
                boxShadow: (t) => (o.highlight ? `0 0 0 1px ${alpha(t.palette.primary.main, 0.4)}` : "none"),
                transition: "border-color 180ms, box-shadow 180ms",
              }}
            >
              <CardActionArea onClick={() => onSelect(o.code)} aria-pressed={isSel}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {o.name}
                        </Typography>
                        {o.highlight && (
                          <Box
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                              fontSize: 11,
                              fontWeight: 700,
                              letterSpacing: 0.3,
                            }}
                          >
                            POPULAR
                          </Box>
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {o.blurb}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>
                        {o.code ? `R${price}` : "R0"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {o.code ? "/month" : "free"}
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

      {billingCycle === "annual" && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
          Annual plans are billed once a year. The figure shown is the monthly equivalent.
        </Typography>
      )}

      {/* Parents and tutors are a separate track, so they get their own clear
          way in rather than being buried in a link. */}
      <Box sx={{ pt: 0.5 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
          <Typography variant="caption" color="text.secondary">
            Not a student?
          </Typography>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Users size={18} />}
            onClick={() => onSelectRole("parent")}
          >
            I&apos;m a parent
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Presentation size={18} />}
            onClick={() => onSelectRole("tutor")}
          >
            I&apos;m a tutor
          </Button>
        </Stack>
      </Box>
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
