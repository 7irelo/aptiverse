"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailReadOutlined";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Stack spacing={3} alignItems="center" sx={{ textAlign: "center" }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "primary.main", color: "primary.contrastText", display: "grid", placeItems: "center" }}>
        <MarkEmailReadIcon sx={{ fontSize: 38 }} />
      </Box>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Verify your email
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 380, mx: "auto" }}>
          We've sent a verification link to your inbox. Click it to activate your Aptiverse account.
        </Typography>
      </Box>
      <Stack direction="row" spacing={1.5}>
        <Button variant="outlined">Resend email</Button>
        <Button component={Link} href="/login" variant="contained">
          Back to sign in
        </Button>
      </Stack>
    </Stack>
  );
}
