"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import { Check } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const POINTS = [
  "A curriculum-aware study assistant",
  "Honest predictions of your results",
  "Wellbeing built in, private by default",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Brand panel adapts to the colour scheme: a deep graphite wash in dark
  // mode, a soft light-graphite wash in light mode. Text, mark and the citron
  // accent flip with it so contrast holds either way.
  const panel = {
    background: isDark
      ? "radial-gradient(130% 120% at 0% 0%, #1B1D22 0%, #101116 48%, #08090B 100%)"
      : "radial-gradient(130% 120% at 0% 0%, #EEEFEB 0%, #E4E6E0 48%, #D8DBD3 100%)",
    text: isDark ? "rgba(255,255,255,0.92)" : "rgba(27,29,34,0.90)",
    logo: isDark ? "#FBFAF6" : "#1B1D22",
    badgeBg: isDark ? "rgba(255,255,255,0.12)" : "rgba(27,29,34,0.07)",
    check: isDark ? "#CFEA63" : "#617815",
    glow: isDark
      ? "radial-gradient(55% 45% at 100% 100%, rgba(195,232,79,0.10) 0%, rgba(195,232,79,0) 70%)"
      : "radial-gradient(55% 45% at 100% 100%, rgba(135,168,31,0.14) 0%, rgba(135,168,31,0) 70%)",
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Brand panel, desktop only. Restrained graphite wash with a single
          citron accent that echoes the secondary in the mark; adapts to mode. */}
      <Box
        sx={{
          flex: { xs: "none", md: 1 },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: { md: 6, lg: 8 },
          position: "relative",
          overflow: "hidden",
          color: panel.text,
          background: panel.background,
        }}
      >
        <Box component={Link} href="/" sx={{ display: "inline-flex", position: "relative", zIndex: 1 }}>
          <Logo color={panel.logo} />
        </Box>

        <Stack spacing={3.5} sx={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
          <Typography
            variant="h2"
            component="p"
            sx={{ fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.02em" }}
          >
            Do your best work. Stay well doing it.
          </Typography>
          <Stack spacing={1.75}>
            {POINTS.map((p) => (
              <Stack key={p} direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: panel.badgeBg,
                    color: panel.check,
                    flexShrink: 0,
                  }}
                >
                  <Check size={13} />
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {p}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ typography: "caption", opacity: 0.7, alignItems: "center", position: "relative", zIndex: 1 }}
        >
          <Box component="span">© {new Date().getFullYear()} Aptiverse</Box>
          <Box component="span" aria-hidden="true">
            ·
          </Box>
          <MuiLink component={Link} href="/privacy" color="inherit" underline="hover">
            Privacy
          </MuiLink>
          <Box component="span" aria-hidden="true">
            ·
          </Box>
          <MuiLink component={Link} href="/terms" color="inherit" underline="hover">
            Terms
          </MuiLink>
        </Stack>

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background: panel.glow,
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Form side */}
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
        </Stack>
        <Box sx={{ flex: 1, display: "grid", placeItems: "center", px: { xs: 3, md: 6 }, py: 4 }}>
          <Box sx={{ width: "100%", maxWidth: 420 }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
