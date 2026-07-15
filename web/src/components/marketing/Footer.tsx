"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import { Logo } from "@/components/common/Logo";

const SUPPORT_EMAIL = "support@aptiverse.co.za";

type Column = {
  title: string;
  links: { label: string; href: string }[];
};

// Four columns, every route the marketing site actually has. Legal used to be
// stranded in the bottom bar at 13px next to the copyright, which reads as
// boilerplate; a student checking what happens to their data should find it
// where they look for everything else.
const COLUMNS: Column[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Who it's for",
    links: [
      { label: "Students", href: "/for-students" },
      { label: "Families", href: "/for-families" },
      { label: "Tutors", href: "/for-tutors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
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
        py: { xs: 6, md: 9 },
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 } }}>
        <Box
          sx={{
            display: "grid",
            // The brand block gets its own wider column at desktop and the full
            // width on mobile, so the sentence under the logo never wraps to
            // three ragged lines beside the link grid.
            gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 1.2fr) 2fr" },
            columnGap: { md: 8 },
            rowGap: { xs: 5, md: 0 },
          }}
        >
          <Stack spacing={2} alignItems="flex-start">
            <Logo size={28} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 320, lineHeight: 1.6 }}
            >
              Aptiverse turns marks, topics and mood into one honest picture of where a student
              stands, and what to do next.
            </Typography>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Support
              </Typography>
              <MuiLink
                href={`mailto:${SUPPORT_EMAIL}`}
                underline="none"
                sx={{
                  display: "block",
                  fontSize: "0.875rem",
                  color: "text.primary",
                  fontWeight: 600,
                  transition: "color 150ms",
                  "&:hover": { color: "secondary.main" },
                }}
              >
                {SUPPORT_EMAIL}
              </MuiLink>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
              columnGap: { xs: 3, sm: 4 },
              rowGap: 4,
            }}
          >
            {COLUMNS.map((c) => (
              <Stack key={c.title} spacing={1.25} component="nav" aria-label={c.title}>
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
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 4, md: 5 } }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Aptiverse. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Built in South Africa for South African students.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}
