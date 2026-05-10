"use client";

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
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
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import HelpIcon from "@mui/icons-material/HelpOutline";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { ColorModeToggle } from "@/components/common/ColorModeToggle";
import { ROLES, useRoleStore } from "@/providers/RoleProvider";
import { initials } from "@/lib/format";
import { NOTIFICATIONS } from "@/lib/mockData";
import Link from "next/link";
import { SIDEBAR_WIDTH } from "./Sidebar";

type Props = {
  onMobileMenuClick: () => void;
};

export function AppTopBar({ onMobileMenuClick }: Props) {
  const role = useRoleStore((s) => s.role);
  const setRole = useRoleStore((s) => s.setRole);
  const [profileEl, setProfileEl] = useState<null | HTMLElement>(null);
  const [notifEl, setNotifEl] = useState<null | HTMLElement>(null);
  const [roleEl, setRoleEl] = useState<null | HTMLElement>(null);

  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <AppBar
      position="sticky"
      sx={{
        ml: { md: `${SIDEBAR_WIDTH}px` },
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 68 }, px: { xs: 2, md: 3 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMobileMenuClick}
          sx={{ mr: 1.5, display: { md: "none" } }}
          aria-label="Open menu"
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            width: { xs: 0, sm: 320, md: 380 },
            opacity: { xs: 0, sm: 1 },
            transition: "opacity 200ms",
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
          <InputBase
            placeholder="Search subjects, SBAs, tutors…"
            sx={{ flex: 1, fontSize: "0.875rem" }}
          />
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              px: 0.75,
              py: 0.25,
              fontSize: "0.7rem",
              color: "text.secondary",
            }}
          >
            ⌘K
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={0.75} alignItems="center">
          <Tooltip title="Switch role (demo)">
            <IconButton onClick={(e) => setRoleEl(e.currentTarget)} color="inherit">
              <SwapHorizIcon />
            </IconButton>
          </Tooltip>
          <Menu open={!!roleEl} anchorEl={roleEl} onClose={() => setRoleEl(null)}>
            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Switch role (demo)
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            {ROLES.map((r) => (
              <MenuItem
                key={r.value}
                selected={role === r.value}
                onClick={() => {
                  setRole(r.value);
                  setRoleEl(null);
                  // route map for first page
                  const target =
                    r.value === "student"
                      ? "/dashboard"
                      : r.value === "teacher"
                        ? "/teacher"
                        : r.value === "parent"
                          ? "/parent"
                          : r.value === "school_admin"
                            ? "/school-admin"
                            : "/tutor";
                  window.location.href = target;
                }}
              >
                <ListItemText primary={r.label} secondary={r.description} />
              </MenuItem>
            ))}
          </Menu>

          <ColorModeToggle />

          <Tooltip title="Notifications">
            <IconButton onClick={(e) => setNotifEl(e.currentTarget)} color="inherit">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            open={!!notifEl}
            anchorEl={notifEl}
            onClose={() => setNotifEl(null)}
            slotProps={{ paper: { sx: { width: 380, maxHeight: 480 } } }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>
            {NOTIFICATIONS.slice(0, 5).map((n) => (
              <MenuItem key={n.id} sx={{ alignItems: "flex-start", py: 1.5, whiteSpace: "normal" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600 }}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
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

          <IconButton onClick={(e) => setProfileEl(e.currentTarget)} sx={{ ml: 0.5 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.85rem", fontWeight: 700 }}>
              {initials("Thandi M")}
            </Avatar>
          </IconButton>

          <Menu open={!!profileEl} anchorEl={profileEl} onClose={() => setProfileEl(null)}>
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Thandi Mokoena
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Grade 12 · Crawford Pretoria
              </Typography>
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
            <MenuItem component={Link} href="/login" onClick={() => setProfileEl(null)}>
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
