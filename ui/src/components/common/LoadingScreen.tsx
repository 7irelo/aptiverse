"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { LogoMark } from "./Logo";

export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        zIndex: (t) => t.zIndex.modal + 1,
      }}
    >
      <Stack spacing={2} alignItems="center">
        <LogoMark size={56} />
        <CircularProgress size={28} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
    </Box>
  );
}
