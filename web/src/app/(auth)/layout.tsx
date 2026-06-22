"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { ColorModeToggle } from "@/components/common/ColorModeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          // Monochromatic teal drench. The previous gradient ended in
          // secondary.main (terracotta), which DESIGN.md reserves for
          // "warm attention / needs work" feedback. Coding the welcome
          // panel as warm-attention was a meaning clash; staying inside
          // the primary ramp keeps the panel reading as "Aptiverse".
          background: (t) =>
            `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.primary.main} 55%, ${t.palette.primary.light})`,
          color: "primary.contrastText",
        }}
      >
        <Box component={Link} href="/" sx={{ display: "inline-flex", color: "inherit" }}>
          <Logo />
        </Box>
        <Stack spacing={2}>
          <Typography variant="h2" component="p" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            Grow with confidence. High school, on your side.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 420 }}>
            Join thousands of South African FET-phase learners (Grades 10–12) using Aptiverse for SBA prep, mastery tracking, wellbeing and bursaries.
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ typography: "caption", opacity: 0.85, alignItems: "center" }}
        >
          <Box component="span">© {new Date().getFullYear()} Aptiverse</Box>
          <Box component="span" aria-hidden="true">·</Box>
          <MuiLink
            component={Link}
            href="/privacy"
            color="inherit"
            underline="hover"
            sx={{ "&:focus-visible": { outlineOffset: 4 } }}
          >
            Privacy
          </MuiLink>
          <Box component="span" aria-hidden="true">·</Box>
          <MuiLink
            component={Link}
            href="/terms"
            color="inherit"
            underline="hover"
            sx={{ "&:focus-visible": { outlineOffset: 4 } }}
          >
            Terms
          </MuiLink>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: { xs: 3, md: 6 }, py: 3 }}
        >
          <Box component={Link} href="/" sx={{ display: { md: "none" } }}>
            <Logo size={28} />
          </Box>
          <Box sx={{ ml: "auto" }}>
            <ColorModeToggle />
          </Box>
        </Stack>
        <Box sx={{ flex: 1, display: "grid", placeItems: "center", px: { xs: 3, md: 6 }, py: 4 }}>
          <Box sx={{ width: "100%", maxWidth: 460 }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
