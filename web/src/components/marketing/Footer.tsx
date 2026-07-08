"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

type Column = {
  title: string;
  links: { label: string; href: string }[];
  // These duplicate the top menu, so they are hidden on mobile.
  hideOnMobile?: boolean;
};

const COLUMNS: Column[] = [
  {
    title: "Product",
    hideOnMobile: true,
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "For",
    hideOnMobile: true,
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
];

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: { xs: 4, md: 9 },
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3.5, md: 8 }}
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Logo size={28} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, auto)" },
              columnGap: { xs: 3, sm: 6 },
              rowGap: 3,
              width: { xs: "100%", md: "auto" },
            }}
          >
            {COLUMNS.map((c) => (
              <Stack
                key={c.title}
                spacing={1}
                sx={c.hideOnMobile ? { display: { xs: "none", md: "flex" } } : undefined}
              >
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
        </Stack>

        <Divider sx={{ my: { xs: 3, md: 5 } }} />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Aptiverse
          </Typography>
          <Stack direction="row" spacing={3}>
            <Box component={Link} href="/privacy" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              Privacy
            </Box>
            <Box component={Link} href="/terms" sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              Terms
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
