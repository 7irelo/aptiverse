"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { Wallet, Check } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { registerStep2Schema, type RegisterValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";

// Affiliate-only sign-up. Deliberately NOT the student /register flow: no
// role cards, no academic profile, no plan step. Someone here wants to earn,
// so the form asks for the least it can and lands them on their referral
// dashboard once their email is verified.
//
// It creates an account with the Affiliate role. That role never sees the
// student app; its home is /refer. See homeRouteForRole and navForRole.
export default function AffiliateJoinPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerStep2Schema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", password: "", acceptedTerms: false },
  });

  const mutation = useMutation({
    mutationFn: async (v: RegisterValues) => {
      await api.register({
        email: v.email,
        password: v.password,
        firstName: v.firstName,
        lastName: v.lastName,
        role: "Affiliate",
        acceptedTerms: v.acceptedTerms,
      });
      return v.email;
    },
    onSuccess: () => {
      // No auto sign-in: an unverified account cannot sign in, so the honest
      // next step is the verify-your-email notice, not a failed login. Once
      // they click the link and sign in, the Affiliate role lands them on
      // /refer.
      router.push("/verify-email");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      // A duplicate email is the common case; keep it readable.
      setServerError(
        /already|exists|taken|duplicate/i.test(msg)
          ? "An account with that email already exists. Sign in instead."
          : msg,
      );
    },
  });

  return (
    <GradientBackdrop variant="hero">
      <Box sx={{ maxWidth: 1080, mx: "auto", px: { xs: 2.5, sm: 4 }, py: { xs: 6, md: 10 } }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 5, md: 8 }} alignItems="center">
          {/* Pitch, kept short. The full case lives on /affiliates. */}
          <Stack spacing={2.5} sx={{ flex: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                color: "primary.main",
              }}
            >
              <Wallet size={22} />
            </Box>
            <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
              Start earning with Aptiverse.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 460 }}>
              Create a free affiliate account. You get a referral link straight away and earn 40% of
              every payment your referrals make, for their first three months.
            </Typography>
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              {[
                "No cost to join, and nothing to buy",
                "Your link works the moment you verify your email",
                "Paid by EFT, with every rand on the record",
              ].map((t) => (
                <Stack key={t} direction="row" spacing={1.25} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.25, display: "flex" }}>
                    <Check size={18} />
                  </Box>
                  <Typography variant="body2">{t}</Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
              Just here to read the details?{" "}
              <MuiLink component={Link} href="/affiliates" color="text.primary" underline="hover" sx={{ fontWeight: 600 }}>
                See how it works
              </MuiLink>
            </Typography>
          </Stack>

          {/* The form. */}
          <Box sx={{ flex: 1, width: "100%", maxWidth: 460, mx: "auto" }}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Create your affiliate account
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Takes a minute. No card needed.
                </Typography>

                {serverError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {serverError}
                  </Alert>
                )}

                <Box component="form" noValidate onSubmit={handleSubmit((v) => { setServerError(null); mutation.mutate(v); })}>
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField
                        fullWidth
                        label="First name"
                        autoComplete="given-name"
                        {...register("firstName")}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                      <TextField
                        fullWidth
                        label="Last name"
                        autoComplete="family-name"
                        {...register("lastName")}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    </Stack>
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
                      autoComplete="new-password"
                      {...register("password")}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                    <FormControlLabel
                      control={<Checkbox size="small" {...register("acceptedTerms")} />}
                      label={
                        <Typography variant="body2" color="text.secondary">
                          I agree to the{" "}
                          <MuiLink component={Link} href="/terms" target="_blank" underline="hover">
                            Terms
                          </MuiLink>{" "}
                          and{" "}
                          <MuiLink component={Link} href="/privacy" target="_blank" underline="hover">
                            Privacy Policy
                          </MuiLink>
                          .
                        </Typography>
                      }
                    />
                    {errors.acceptedTerms && (
                      <Typography variant="caption" color="error.main">
                        {errors.acceptedTerms.message}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      size="large"
                      variant="contained"
                      color="secondary"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Creating your account…" : "Create affiliate account"}
                    </Button>
                  </Stack>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
                  Already have an account?{" "}
                  <MuiLink component={Link} href="/login" color="text.primary" underline="hover" sx={{ fontWeight: 600 }}>
                    Sign in
                  </MuiLink>
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Box>
    </GradientBackdrop>
  );
}
