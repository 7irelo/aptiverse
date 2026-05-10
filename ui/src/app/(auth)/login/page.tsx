"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Link from "next/link";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
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

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    router.push(callbackUrl);
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

      <OAuthButtons callbackUrl={callbackUrl} />

      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
          <TextField
            fullWidth
            label="Password"
            type="password"
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
            <Link href="/forgot-password" style={{ fontSize: "0.875rem", color: "inherit" }}>
              Forgot password?
            </Link>
          </Stack>
          <Button type="submit" size="large" variant="contained" disabled={!isValid || submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        New to Aptiverse?{" "}
        <Link href="/register" style={{ color: "inherit", fontWeight: 600 }}>
          Create an account
        </Link>
      </Typography>
    </Stack>
  );
}
