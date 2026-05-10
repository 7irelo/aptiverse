"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { ColorModeToggle } from "@/components/common/ColorModeToggle";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Features", href: "/features" },
  { label: "For Students", href: "/for-students" },
  { label: "For Schools", href: "/for-schools" },
  { label: "Bursaries", href: "/bursaries" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            maxWidth: 1240,
            mx: "auto",
            width: "100%",
            px: { xs: 2.5, sm: 4, lg: 6 },
            minHeight: { xs: 64, md: 72 },
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Logo size={26} />
          </Box>

          <Stack
            direction="row"
            spacing={3.5}
            alignItems="center"
            sx={{ ml: 5, display: { xs: "none", md: "flex" } }}
          >
            {NAV_LINKS.map((l) => (
              <Box
                key={l.href}
                component={Link}
                href={l.href}
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "text.secondary",
                  textDecoration: "none",
                  transition: "color 150ms",
                  "&:hover": { color: "text.primary" },
                }}
              >
                {l.label}
              </Box>
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1.25} alignItems="center">
            <ColorModeToggle />
            <Button
              component={Link}
              href="/login"
              color="inherit"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Sign in
            </Button>
            <Button component={Link} href="/register" variant="contained">
              Get started
            </Button>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ display: { md: "none" } }}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} sx={{ display: { md: "none" } }}>
        <Box sx={{ width: 320, p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Logo />
            <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />
          <List>
            {NAV_LINKS.map((l) => (
              <ListItem key={l.href} disablePadding>
                <ListItemButton component={Link} href={l.href} onClick={() => setOpen(false)}>
                  <ListItemText primary={l.label} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
            <Button component={Link} href="/login" fullWidth variant="outlined">
              Sign in
            </Button>
            <Button component={Link} href="/register" fullWidth variant="contained">
              Get started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
