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
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";

export default function ResetPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({ mutationFn: api.resetPassword });

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
      {mutation.isSuccess ? (
        <>
          <Alert severity="success">Your password is set. You can now sign in.</Alert>
          <Button component={Link} href="/login" variant="contained" size="large" fullWidth>
            Go to sign in
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <Stack spacing={2}>
            <TextField
              required
              fullWidth
              type="password"
              label="New password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message ?? "At least 8 chars, one uppercase, one number"}
            />
            <TextField
              required
              fullWidth
              type="password"
              label="Confirm new password"
              {...register("confirm")}
              error={!!errors.confirm}
              helperText={errors.confirm?.message}
            />
            <Button type="submit" variant="contained" size="large" disabled={!isValid || mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Update password"}
            </Button>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
