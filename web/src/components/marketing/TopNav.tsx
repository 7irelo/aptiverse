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
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Features", href: "/features" },
  { label: "Students", href: "/for-students" },
  { label: "Families", href: "/for-families" },
  { label: "Tutors", href: "/for-tutors" },
  { label: "Pricing", href: "/pricing" },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Box
                  key={l.href}
                  component={Link}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: active ? 600 : 500,
                    color: active ? "text.primary" : "text.secondary",
                    textDecoration: "none",
                    // Ease-out-quart so colour fade reads as deceleration,
                    // not the default linear-ish browser easing.
                    transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {l.label}
                </Box>
              );
            })}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              component={Link}
              href="/login"
              color="inherit"
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              Sign in
            </Button>
            <Button component={Link} href="/register" variant="contained" color="secondary">
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

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { "aria-label": "Site navigation" } }}
        sx={{ display: { md: "none" } }}
      >
        <Box sx={{ width: { xs: "min(320px, 88vw)", sm: 320 }, p: 2 }}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mb: 1 }}>
            <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />
          <List component="nav" aria-label="Site navigation">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <ListItem key={l.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    selected={active}
                    aria-current={active ? "page" : undefined}
                  >
                    <ListItemText
                      primary={l.label}
                      slotProps={{
                        primary: { sx: { fontWeight: active ? 600 : 500 } },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Stack direction="row" spacing={1.25} sx={{ mt: 2 }}>
            <Button component={Link} href="/login" fullWidth variant="outlined">
              Sign in
            </Button>
            <Button component={Link} href="/register" fullWidth variant="contained" color="secondary">
              Get started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
