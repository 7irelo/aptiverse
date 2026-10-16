"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import { Logo } from "@/components/common/Logo";
import { openConsentPreferences } from "@/lib/analytics/consent";

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
      { label: "Parents", href: "/for-families" },
      { label: "Tutors", href: "/for-tutors" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      // Deliberately here rather than under "Who it's for". Someone looking to
      // earn is not choosing which product tier suits them, and the footer is
      // where people go looking for a programme they were told about.
      { label: "Affiliate programme", href: "/affiliates" },
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
        // Tighter vertical rhythm on phones. The footer measured 624px against
        // an 844px viewport, nearly three quarters of a screen, and almost all
        // of that was padding and gaps rather than content: it holds only ten
        // links. Trimming the spacing is the honest fix. Dropping links on
        // mobile is not, since mobile is where most of these users are, and
        // Google indexes the mobile DOM, so a link that only exists on desktop
        // effectively does not exist.
        py: { xs: 4.5, md: 9 },
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
            rowGap: { xs: 3.5, md: 0 },
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
                  // Citron is surface-only. As a hover text colour it scored
                  // 1.4:1 on light paper, so the address vanished on hover.
                  // The hover state is carried by an underline plus a citron
                  // underline colour, keeping the ink at full contrast.
                  textDecorationColor: "transparent",
                  "&:hover": {
                    textDecoration: "underline",
                    textDecorationThickness: 2,
                    textUnderlineOffset: 3,
                    textDecorationColor: "secondary.main",
                  },
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
              rowGap: { xs: 3, sm: 4 },
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

        <Divider sx={{ my: { xs: 3, md: 5 } }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Aptiverse. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Withdrawal has to be as reachable as the original ask, which is
                why this is a real control in the footer of every page and not
                a paragraph in the policy telling people to clear their
                cookies. Rendered as a button, because it opens a dialog. */}
            <Box
              component="button"
              type="button"
              onClick={() => openConsentPreferences()}
              sx={{
                appearance: "none",
                background: "none",
                border: 0,
                p: 0,
                cursor: "pointer",
                font: "inherit",
                fontSize: "0.75rem",
                color: "text.secondary",
                textDecoration: "underline",
                textUnderlineOffset: 3,
                transition: "color 150ms",
                "&:hover": { color: "text.primary" },
              }}
            >
              Privacy choices
            </Box>
            <Typography variant="caption" color="text.secondary">
              Built in South Africa for South African students.
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
