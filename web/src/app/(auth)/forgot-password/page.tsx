"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";
import { useHydrated } from "@/lib/hooks/useHydrated";

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({ mutationFn: api.forgotPassword });
  const hydrated = useHydrated();

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="primary.main">
          Forgot password
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>
          Reset your password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          We'll email you a link to choose a new one.
        </Typography>
      </Box>

      {mutation.isSuccess ? (
        <Alert severity="success">Check your inbox for the reset link. It expires in 30 minutes.</Alert>
      ) : (
        <Box component="form" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            {/* Gated on hydration, never on `isValid`. See useHydrated. */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={!hydrated || mutation.isPending}
            >
              {mutation.isPending ? "Sending…" : "Send reset link"}
            </Button>
          </Stack>
        </Box>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
        Remembered it?{" "}
        <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
          Back to sign in
        </Link>
      </Typography>
    </Stack>
  );
}
