"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronDown,
  GraduationCap,
  TrendingUp,
  Timer,
  HeartPulse,
  Target,
  Wallet,
  UserRound,
  UsersRound,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";

// Hover intent. Opening is deliberately slower than a raw mouseover so that
// sweeping the pointer across the bar does not flash panels open, and closing
// is slower still so the diagonal move from a label down into the panel, which
// briefly leaves both, does not dismiss it.
const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 250;

type Tile = {
  label: string;
  href: string;
  desc: string;
  icon: LucideIcon;
};

type NavItem = {
  key: string;
  label: string;
  // A plain link when there is nothing meaningful underneath. Only groups with
  // real destinations get a panel: inventing menu depth to fill a wide surface
  // is worse than a normal nav.
  href?: string;
  tiles?: Tile[];
  discover?: { label: string; href: string }[];
};

// Every destination below is a page or a section that exists today. The tiles
// carry a Lucide glyph rather than product photography because the product has
// no content imagery, and stock photos on a study tool read as filler.
const NAV_ITEMS: NavItem[] = [
  {
    key: "product",
    label: "Product",
    tiles: [
      {
        label: "Study assistant",
        href: "/features#learn",
        desc: "Knows your level, subjects and marks",
        icon: GraduationCap,
      },
      {
        label: "Term predictions",
        href: "/features#predictions",
        desc: "Where your marks are heading, per subject",
        icon: TrendingUp,
      },
      {
        label: "Exam simulator",
        href: "/features#exam-simulator",
        desc: "A full paper, timed, one attempt",
        icon: Timer,
      },
      {
        label: "Wellbeing",
        href: "/features#wellbeing",
        desc: "Daily check-ins and a private diary",
        icon: HeartPulse,
      },
      {
        label: "Goals",
        href: "/features#goals",
        desc: "Targets checked against real scores",
        icon: Target,
      },
      {
        label: "Plans",
        href: "/pricing",
        desc: "What each tier costs, in rands",
        icon: Wallet,
      },
    ],
    discover: [
      { label: "All features", href: "/features" },
      { label: "Free tier, in full", href: "/features#included" },
      { label: "What parents see", href: "/features#for-parents" },
      { label: "Compare plans", href: "/pricing" },
    ],
  },
  {
    key: "audience",
    label: "Who it's for",
    tiles: [
      {
        label: "Students",
        href: "/for-students",
        desc: "Practice, marking and a tutor that keeps up",
        icon: UserRound,
      },
      {
        label: "Parents",
        href: "/for-families",
        desc: "See what is due, without reading the diary",
        icon: UsersRound,
      },
      {
        label: "Tutors",
        href: "/for-tutors",
        desc: "Take on students and track their progress",
        icon: Presentation,
      },
    ],
    discover: [
      { label: "About Aptiverse", href: "/about" },
      { label: "Affiliate programme", href: "/affiliates" },
      { label: "Contact us", href: "/contact" },
      { label: "Create a free account", href: "/register" },
      { label: "Sign in", href: "/login" },
    ],
  },
  { key: "pricing", label: "Pricing", href: "/pricing" },
  // Top level on purpose. The affiliate programme was reachable only from the
  // footer and one dropdown, which is invisible to the exact person it is for:
  // someone who wants to earn and would never think to open "Who it's for".
  // "Earn" reads to that audience where "Affiliates" would not.
  { key: "earn", label: "Earn", href: "/affiliates" },
];

const PANEL_ID = "top-nav-mega-panel";

// Header height, mirrored from the Toolbar minHeight below. The scrim starts
// underneath it so the bar itself is never dimmed or blocked.
const HEADER_H = { xs: 64, md: 72 };

export function TopNav() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  // `active` drives which contents the one shared panel shows. `rendered` lags
  // by the collapse duration so the surface does not empty out mid-close.
  const [active, setActive] = useState<string | null>(null);
  const [rendered, setRendered] = useState<string | null>(null);
  const pathname = usePathname();

  const activeRef = useRef<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const setActiveNow = useCallback((key: string | null) => {
    activeRef.current = key;
    setActive(key);
  }, []);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const scheduleOpen = useCallback(
    (key: string) => {
      clearTimers();
      // Already open: swap contents on the spot. Re-running the open delay
      // between two adjacent labels is the thing that makes mega-menus feel
      // sticky and slow.
      if (activeRef.current !== null) {
        setActiveNow(key);
        return;
      }
      openTimer.current = setTimeout(() => setActiveNow(key), OPEN_DELAY_MS);
    },
    [clearTimers, setActiveNow],
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setActiveNow(null), CLOSE_DELAY_MS);
  }, [clearTimers, setActiveNow]);

  const closeNow = useCallback(
    (returnFocus?: string) => {
      clearTimers();
      setActiveNow(null);
      if (returnFocus) triggerRefs.current[returnFocus]?.focus();
    },
    [clearTimers, setActiveNow],
  );

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (active !== null) {
      setRendered(active);
      return;
    }
    const t = setTimeout(() => setRendered(null), 280);
    return () => clearTimeout(t);
  }, [active]);

  // Any navigation dismisses both surfaces, including a same-page hash jump.
  useEffect(() => {
    setActiveNow(null);
    setOpen(false);
  }, [pathname, setActiveNow]);

  // Escape is bound at the document, not the wrapper, so it also dismisses a
  // panel that was opened by hover and therefore holds no focus.
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeNow(activeRef.current ?? undefined);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, closeNow]);

  // Tabbing out of the trigger row or the panel dismisses it. Movement between
  // the two stays inside this wrapper, so it survives.
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeNow();
    },
    [closeNow],
  );

  const panelItem = NAV_ITEMS.find((i) => i.key === rendered);
  const isOpen = active !== null;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            maxWidth: 1240,
            mx: "auto",
            width: "100%",
            px: { xs: 2.5, sm: 4, lg: 6 },
            minHeight: HEADER_H,
            // MUI's Toolbar is position: relative by default, which would make
            // it the containing block for the mega panel and clamp the panel to
            // the 1240px measure. The panel has to resolve against the AppBar
            // so it can go full-bleed.
            position: "static",
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

          <Box
            onMouseLeave={scheduleClose}
            onBlur={handleBlur}
            sx={{ ml: 5, display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            <Stack
              direction="row"
              spacing={3.5}
              alignItems="center"
              component="nav"
              aria-label="Main"
            >
              {NAV_ITEMS.map((item) => {
                const hrefs = item.href
                  ? [item.href]
                  : (item.tiles ?? []).map((t) => t.href.split("#")[0]);
                const onRoute = hrefs.some(
                  (h) => pathname === h || pathname.startsWith(`${h}/`),
                );
                const isCurrent = active === item.key;
                const lit = isCurrent || onRoute;

                const labelSx = {
                  position: "relative",
                  fontSize: "0.875rem",
                  fontWeight: lit ? 600 : 500,
                  color: lit ? "text.primary" : "text.secondary",
                  // Ease-out-quart so colour fade reads as deceleration,
                  // not the default linear-ish browser easing.
                  transition: "color 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
                  "&:hover": { color: "text.primary" },
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 4,
                    borderRadius: 1,
                  },
                  // Citron underline indicator, a surface not a text colour.
                  //
                  // Driven by `lit`, not by whether a panel is open, so every
                  // item behaves the same: it underlines on hover, and stays
                  // underlined while you are on its route. Keying it to the
                  // open panel alone meant Pricing, which has no panel and so
                  // can never be "current", was the one nav item that did
                  // nothing at all under the cursor.
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -8,
                    height: 3,
                    borderRadius: 999,
                    bgcolor: "secondary.main",
                    transform: lit ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 200ms cubic-bezier(0.165, 0.84, 0.44, 1)",
                  },
                  "&:hover::after": { transform: "scaleX(1)" },
                } as const;

                if (item.href) {
                  return (
                    <Box
                      key={item.key}
                      component={Link}
                      href={item.href}
                      aria-current={onRoute ? "page" : undefined}
                      onMouseEnter={scheduleClose}
                      sx={labelSx}
                    >
                      {item.label}
                    </Box>
                  );
                }

                return (
                  <ButtonBase
                    key={item.key}
                    ref={(el: HTMLButtonElement | null) => {
                      triggerRefs.current[item.key] = el;
                    }}
                    disableRipple
                    aria-haspopup="true"
                    aria-expanded={isCurrent}
                    aria-controls={isCurrent ? PANEL_ID : undefined}
                    onMouseEnter={() => scheduleOpen(item.key)}
                    onFocus={() => {
                      if (activeRef.current !== null) setActiveNow(item.key);
                    }}
                    onClick={() =>
                      activeRef.current === item.key ? closeNow() : setActiveNow(item.key)
                    }
                    sx={{
                      ...labelSx,
                      gap: 0.5,
                      fontFamily: "inherit",
                      lineHeight: 1.5,
                    }}
                  >
                    {/* No chevron. The citron underline below already says
                        which item is open, and a caret that flips on hover
                        adds a second, noisier signal for the same state. */}
                    {item.label}
                  </ButtonBase>
                );
              })}
            </Stack>

            {/* One shared, full-bleed surface. It is a child of the AppBar, so
                it spans the viewport without a 100vw scrollbar overhang and
                stays above the scrim without a z-index of its own. */}
            <Box
              id={PANEL_ID}
              // Closed panel is inert, so nothing inside it is tabbable or
              // clickable while it is collapsing or collapsed.
              inert={!isOpen}
              onMouseEnter={clearTimers}
              onMouseLeave={scheduleClose}
              sx={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                display: { xs: "none", md: "grid" },
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                // Driven off `rendered`, which lags the close by the collapse
                // duration, so the surface stays paintable while it shrinks and
                // is then removed from the page outright.
                visibility: rendered !== null ? "visible" : "hidden",
                bgcolor: "background.paper",
                borderBottom: 1,
                borderColor: "divider",
                boxShadow: (t) =>
                  `0 24px 48px -28px ${alpha(t.palette.common.black, t.palette.mode === "dark" ? 0.8 : 0.28)}`,
                transition: "grid-template-rows 280ms cubic-bezier(0.16, 1, 0.3, 1)",
                "@media (prefers-reduced-motion: reduce)": { transition: "none" },
              }}
            >
              <Box sx={{ overflow: "hidden", minHeight: 0 }}>
                {panelItem && (
                  <Box
                    sx={{
                      maxWidth: 1240,
                      mx: "auto",
                      width: "100%",
                      px: { xs: 2.5, sm: 4, lg: 6 },
                      py: 5,
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 232px",
                      columnGap: 5,
                    }}
                  >
                    <Grid container spacing={1}>
                      {(panelItem.tiles ?? []).map((tile) => {
                        const Icon = tile.icon;
                        return (
                          <Grid key={tile.href} size={{ md: 4 }}>
                            <Box
                              component={Link}
                              href={tile.href}
                              onClick={() => closeNow()}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1.75,
                                p: 1.5,
                                borderRadius: 2,
                                height: "100%",
                                transition: "background-color 160ms ease",
                                "&:hover": {
                                  bgcolor: (t) =>
                                    alpha(
                                      t.palette.secondary.main,
                                      t.palette.mode === "dark" ? 0.12 : 0.18,
                                    ),
                                },
                                "&:hover .mega-tile-icon": {
                                  bgcolor: "secondary.main",
                                  color: "secondary.contrastText",
                                },
                                "&:focus-visible": {
                                  outline: "2px solid",
                                  outlineColor: "primary.main",
                                  outlineOffset: 2,
                                },
                              }}
                            >
                              <Box
                                className="mega-tile-icon"
                                aria-hidden
                                sx={{
                                  width: 44,
                                  height: 44,
                                  flexShrink: 0,
                                  borderRadius: 2,
                                  display: "grid",
                                  placeItems: "center",
                                  color: "text.primary",
                                  bgcolor: (t) =>
                                    alpha(
                                      t.palette.secondary.main,
                                      t.palette.mode === "dark" ? 0.22 : 0.3,
                                    ),
                                  transition:
                                    "background-color 160ms ease, color 160ms ease",
                                }}
                              >
                                <Icon size={20} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600, color: "text.primary" }}
                                >
                                  {tile.label}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    lineHeight: 1.45,
                                    mt: 0.25,
                                  }}
                                >
                                  {tile.desc}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Box
                      sx={{
                        borderLeft: 1,
                        borderColor: "divider",
                        pl: 4,
                        pt: 1.5,
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{ color: "text.secondary", fontWeight: 700 }}
                      >
                        Discover
                      </Typography>
                      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                        {(panelItem.discover ?? []).map((d) => (
                          <Box
                            key={`${d.label}-${d.href}`}
                            component={Link}
                            href={d.href}
                            onClick={() => closeNow()}
                            sx={{
                              fontSize: "0.875rem",
                              color: "text.secondary",
                              transition: "color 160ms ease",
                              "&:hover": { color: "text.primary" },
                              "&:focus-visible": {
                                outline: "2px solid",
                                outlineColor: "primary.main",
                                outlineOffset: 3,
                                borderRadius: 1,
                              },
                            }}
                          >
                            {d.label}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

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

      {/* Scrim. Starts below the header so the bar stays lit and clickable,
          and a click anywhere on it dismisses the panel. */}
      <Box
        aria-hidden
        onClick={() => closeNow()}
        sx={{
          position: "fixed",
          top: HEADER_H,
          left: 0,
          right: 0,
          bottom: 0,
          display: { xs: "none", md: "block" },
          zIndex: (t) => t.zIndex.appBar - 1,
          bgcolor: (t) =>
            alpha(t.palette.common.black, t.palette.mode === "dark" ? 0.6 : 0.36),
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 240ms ease",
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        }}
      />

      {/* Touch has no hover, so phones get a tap-driven equivalent of the same
          groupings: a full-screen drawer with expandable sections. */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            "aria-label": "Site navigation",
            sx: { width: "100%", maxWidth: "100%", bgcolor: "background.default" },
          },
        }}
        sx={{ display: { md: "none" } }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ px: 2.5, py: 1.5, flexShrink: 0 }}
          >
            <Logo size={24} />
            <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Divider />

          <Box sx={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
            <List component="nav" aria-label="Site navigation" disablePadding>
              {NAV_ITEMS.map((item) => {
                if (item.href) {
                  const onRoute =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <ListItem key={item.key} disablePadding>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={onRoute ? "page" : undefined}
                        sx={{ minHeight: 56, px: 2.5 }}
                      >
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: { sx: { fontWeight: onRoute ? 700 : 600 } },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                }

                const expanded = openSection === item.key;
                return (
                  <Box key={item.key}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => setOpenSection(expanded ? null : item.key)}
                        aria-expanded={expanded}
                        aria-controls={`nav-section-${item.key}`}
                        sx={{ minHeight: 56, px: 2.5 }}
                      >
                        <ListItemText
                          primary={item.label}
                          slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                        />
                        <Box
                          component="span"
                          aria-hidden
                          sx={{
                            display: "flex",
                            color: "text.secondary",
                            transform: expanded ? "rotate(180deg)" : "none",
                            transition: "transform 200ms ease",
                          }}
                        >
                          <ChevronDown size={18} />
                        </Box>
                      </ListItemButton>
                    </ListItem>

                    <Collapse in={expanded} unmountOnExit>
                      <Box id={`nav-section-${item.key}`} sx={{ pb: 1.5 }}>
                        {(item.tiles ?? []).map((tile) => {
                          const Icon = tile.icon;
                          return (
                            <ListItemButton
                              key={tile.href}
                              component={Link}
                              href={tile.href}
                              onClick={() => setOpen(false)}
                              sx={{ minHeight: 64, px: 2.5, gap: 1.75 }}
                            >
                              <Box
                                aria-hidden
                                sx={{
                                  width: 44,
                                  height: 44,
                                  flexShrink: 0,
                                  borderRadius: 2,
                                  display: "grid",
                                  placeItems: "center",
                                  color: "text.primary",
                                  bgcolor: (t) =>
                                    alpha(
                                      t.palette.secondary.main,
                                      t.palette.mode === "dark" ? 0.22 : 0.3,
                                    ),
                                }}
                              >
                                <Icon size={20} />
                              </Box>
                              <ListItemText
                                primary={tile.label}
                                secondary={tile.desc}
                                slotProps={{
                                  primary: { sx: { fontWeight: 600 } },
                                  secondary: { sx: { lineHeight: 1.4 } },
                                }}
                              />
                            </ListItemButton>
                          );
                        })}

                        {(item.discover ?? []).length > 0 && (
                          <Box sx={{ px: 2.5, pt: 1.5 }}>
                            <Typography
                              variant="overline"
                              sx={{ color: "text.secondary", fontWeight: 700 }}
                            >
                              Discover
                            </Typography>
                          </Box>
                        )}
                        {(item.discover ?? []).map((d) => (
                          <ListItemButton
                            key={`${item.key}-${d.label}`}
                            component={Link}
                            href={d.href}
                            onClick={() => setOpen(false)}
                            sx={{ minHeight: 48, px: 2.5 }}
                          >
                            <ListItemText
                              primary={d.label}
                              slotProps={{
                                primary: {
                                  sx: { fontSize: "0.875rem", color: "text.secondary" },
                                },
                              }}
                            />
                          </ListItemButton>
                        ))}
                      </Box>
                    </Collapse>
                    <Divider />
                  </Box>
                );
              })}
            </List>
          </Box>

          <Stack
            direction="row"
            spacing={1.25}
            sx={{ p: 2.5, flexShrink: 0, borderTop: 1, borderColor: "divider" }}
          >
            <Button
              component={Link}
              href="/login"
              onClick={() => setOpen(false)}
              fullWidth
              variant="outlined"
              size="large"
            >
              Sign in
            </Button>
            <Button
              component={Link}
              href="/register"
              onClick={() => setOpen(false)}
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
            >
              Get started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
