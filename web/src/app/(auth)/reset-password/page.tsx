"use client";

import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";
import { useHydrated } from "@/lib/hooks/useHydrated";

// next/navigation's useSearchParams requires a Suspense boundary in the
// app router. Wrap the real form once so the page is self-contained.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const token = params.get("token") ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { userId, token, password: "", confirm: "" },
  });

  // useSearchParams returns null on initial paint in some edge cases;
  // backfill the hidden fields once the values resolve.
  useEffect(() => {
    setValue("userId", userId, { shouldValidate: true });
    setValue("token", token, { shouldValidate: true });
  }, [userId, token, setValue]);

  const mutation = useMutation({ mutationFn: api.resetPassword });
  const hydrated = useHydrated();

  const missingToken = !userId || !token;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="primary.main">
          Reset password
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>
          Choose a new password
        </Typography>
      </Box>

      {missingToken ? (
        <>
          <Alert severity="warning">
            This link is missing its reset token. Request a fresh one. They expire after 30 minutes.
          </Alert>
          <Button component={Link} href="/forgot-password" variant="contained" size="large" fullWidth>
            Request a new reset link
          </Button>
        </>
      ) : mutation.isSuccess ? (
        <>
          <Alert severity="success">Your password is set. You can now sign in.</Alert>
          <Button component={Link} href="/login" variant="contained" size="large" fullWidth>
            Go to sign in
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <Stack spacing={2}>
            {mutation.isError && (
              <Alert severity="error">
                That link is invalid or expired. Request a new one from{" "}
                <Link href="/forgot-password" style={{ color: "inherit", fontWeight: 600 }}>
                  forgot password
                </Link>
                .
              </Alert>
            )}
            <input type="hidden" {...register("userId")} />
            <input type="hidden" {...register("token")} />
            <TextField
              required
              fullWidth
              type="password"
              label="New password"
              autoComplete="new-password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message ?? "At least 8 chars, one uppercase, one number"}
            />
            <TextField
              required
              fullWidth
              type="password"
              label="Confirm new password"
              autoComplete="new-password"
              {...register("confirm")}
              error={!!errors.confirm}
              helperText={errors.confirm?.message}
            />
            {/* Gated on hydration, never on `isValid`. See useHydrated. */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!hydrated || mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Update password"}
            </Button>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
