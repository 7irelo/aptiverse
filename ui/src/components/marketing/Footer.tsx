"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Demo", href: "/demo" },
      { label: "Roadmap", href: "/roadmap" },
    ],
  },
  {
    title: "For",
    links: [
      { label: "Students", href: "/for-students" },
      { label: "Parents", href: "/for-parents" },
      { label: "Teachers", href: "/for-teachers" },
      { label: "Schools", href: "/for-schools" },
      { label: "Tutors", href: "/for-tutors" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Bursaries & NSFAS", href: "/bursaries" },
      { label: "Universities", href: "/universities" },
      { label: "Careers Guide", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Help centre", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Press", href: "/press" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: { xs: 6, md: 10 },
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 5, md: 8 }}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ maxWidth: 320 }}>
            <Logo size={36} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The holistic student success partner — built for South African Grade 11 & 12 learners. Grow with confidence.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
              Made with care in South Africa.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 4, sm: 8 }}
            sx={{ flex: 1, flexWrap: "wrap" }}
          >
            {COLUMNS.map((c) => (
              <Stack key={c.title} spacing={1.25} sx={{ minWidth: 140 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  {c.title}
                </Typography>
                {c.links.map((l) => (
                  <Box
                    key={l.href}
                    component={Link}
                    href={l.href}
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      transition: "color 150ms",
                      "&:hover": { color: "text.primary" },
                    }}
                  >
                    {l.label}
                  </Box>
                ))}
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 5 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Aptiverse. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box component={Link} href="/privacy" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              Privacy
            </Box>
            <Box component={Link} href="/terms" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              Terms
            </Box>
            <Box component={Link} href="/cookies" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              Cookies
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
