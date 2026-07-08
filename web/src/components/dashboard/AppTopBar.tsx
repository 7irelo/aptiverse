"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import HelpIcon from "@mui/icons-material/HelpOutline";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "@/components/common/Logo";
import { initials } from "@/lib/format";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
} from "@/lib/api/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  onMobileMenuClick: () => void;
};

export function AppTopBar({ onMobileMenuClick }: Props) {
  const [profileEl, setProfileEl] = useState<null | HTMLElement>(null);
  const [notifEl, setNotifEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const u = (session?.user ?? {}) as { name?: string | null; email?: string | null; firstName?: string; lastName?: string };
  const displayName =
    (u.firstName || u.lastName)
      ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
      : (u.name ?? u.email ?? "Aptiverse");
  const subtitle = u.email ?? "";

  // Bell badge counts unread server-side. Separate query from the list
  // below so we can keep this badge refreshing on window focus without
  // re-shipping the full 50-row list every time.
  const unreadQuery = useUnreadNotificationsCount();
  const unreadCount = unreadQuery.data?.count ?? 0;

  // Recent notifications for the dropdown preview. Only fired once the
  // user opens the menu — no point shipping the list with every page
  // load when most users will never open this menu.
  const recentQuery = useNotifications({ enabled: !!notifEl });
  const recent = (recentQuery.data ?? []).slice(0, 5);
  const markRead = useMarkNotificationRead();

  const handleNotifClick = (
    id: string,
    read: boolean,
    actionHref: string | null | undefined,
  ) => {
    if (!read) markRead.mutate(id);
    setNotifEl(null);
    if (actionHref) router.push(actionHref);
  };

  return (
    <AppBar position="sticky">
      <Toolbar
        disableGutters
        sx={{
          minHeight: { xs: 64, md: 68 },
          // Right gutter mirrors the main content's px scale so the
          // avatar's right edge lines up vertically with the content's
          // right edge instead of floating 16px past it on wide screens.
          pr: { xs: 2, sm: 3, lg: 5 },
          gap: 1.5,
        }}
      >
        <IconButton
          color="inherit"
          onClick={onMobileMenuClick}
          sx={{ ml: 2, display: { md: "none" } }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>

        {/* Brand shows here only on mobile, where the rail (which owns the
            logo on desktop) is a hidden drawer. */}
        <Box
          component={Link}
          href="/"
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            height: "100%",
            ml: 0.5,
            color: "text.primary",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Logo size={28} />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setNotifEl(e.currentTarget)}
              color="inherit"
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
            >
              <Badge
                // Hide the badge when the count is zero or still loading
                // (avoids a brief "0" flash before the first fetch lands).
                badgeContent={unreadCount}
                color="error"
                overlap="circular"
                invisible={unreadCount === 0}
                max={99}
                sx={{ "& .MuiBadge-badge": { fontVariantNumeric: "tabular-nums" } }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            open={!!notifEl}
            anchorEl={notifEl}
            onClose={() => setNotifEl(null)}
            slotProps={{
              paper: {
                sx: {
                  width: { xs: "calc(100vw - 32px)", sm: 380 },
                  maxWidth: 380,
                  maxHeight: 480,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {unreadCount} unread
                </Typography>
              )}
            </Box>

            {recentQuery.isLoading && (
              <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Loading…
                </Typography>
              </Box>
            )}

            {recentQuery.isSuccess && recent.length === 0 && (
              <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  You&apos;re all caught up.
                </Typography>
              </Box>
            )}

            {recent.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => handleNotifClick(n.id, n.read, n.actionHref)}
                sx={{
                  alignItems: "flex-start",
                  py: 1.5,
                  whiteSpace: "normal",
                  bgcolor: n.read
                    ? "transparent"
                    : (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.06 : 0.04),
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
                    {n.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {n.body}
                  </Typography>
                </Box>
              </MenuItem>
            ))}

            <Divider />
            <MenuItem component={Link} href="/dashboard/notifications" onClick={() => setNotifEl(null)}>
              <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                View all
              </Typography>
            </MenuItem>
          </Menu>

          <IconButton
            onClick={(e) => setProfileEl(e.currentTarget)}
            aria-label="Account menu"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              {initials(displayName)}
            </Avatar>
          </IconButton>

          <Menu
            open={!!profileEl}
            anchorEl={profileEl}
            onClose={() => setProfileEl(null)}
            slotProps={{ paper: { sx: { minWidth: 220, maxWidth: 280 } } }}
          >
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                {displayName}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Divider />
            <MenuItem component={Link} href="/dashboard/settings" onClick={() => setProfileEl(null)}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <MenuItem component={Link} href="/dashboard/help" onClick={() => setProfileEl(null)}>
              <ListItemIcon>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Help & feedback" />
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setProfileEl(null);
                signOut({ callbackUrl: "/login" });
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
