"use client";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { signIn } from "next-auth/react";
import { useState } from "react";

function GoogleIcon() {
  return (
    <Box component="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width={20} height={20}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.7 4.6-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4L31.4 33c-2 1.5-4.6 2.5-7.4 2.5-5.2 0-9.6-3.4-11.3-8L6.5 32.4C9.9 39 16.4 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.3 5.6c-.5.5 6.7-4.9 6.7-15.2 0-1.3-.1-2.4-.4-3.5z" />
    </Box>
  );
}

function AppleIcon() {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      sx={{ color: "currentColor" }}
    >
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.41 2.21-1.21 3.07-.87.95-2.2 1.66-3.49 1.55-.13-1.13.43-2.31 1.18-3.07.84-.86 2.27-1.5 3.52-1.55zM21 17.86a10.55 10.55 0 0 1-1.05 1.92c-.66 1.01-1.6 2.27-2.78 2.28-1.04.01-1.31-.69-2.72-.68-1.41.01-1.71.69-2.75.68-1.18-.02-2.07-1.13-2.74-2.14-1.86-2.84-3.27-8.04-1.36-11.55.96-1.74 2.66-2.83 4.49-2.86 1.13-.02 2.21.78 2.91.78.69 0 2-.96 3.37-.82.57.02 2.18.23 3.21 1.74-.08.05-1.92 1.12-1.9 3.34.02 2.65 2.32 3.53 2.34 3.54-.02.05-.36 1.25-1.02 2.77z"
      />
    </Box>
  );
}

export function OAuthButtons({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [pending, setPending] = useState<string | null>(null);

  async function go(provider: "google" | "apple") {
    setPending(provider);
    try {
      await signIn(provider, { callbackUrl });
    } finally {
      setPending(null);
    }
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => go("google")}
          disabled={pending !== null}
        >
          {pending === "google" ? "Connecting…" : "Continue with Google"}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AppleIcon />}
          onClick={() => go("apple")}
          disabled={pending !== null}
        >
          {pending === "apple" ? "Connecting…" : "Continue with Apple"}
        </Button>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">
          OR
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>
    </Stack>
  );
}
