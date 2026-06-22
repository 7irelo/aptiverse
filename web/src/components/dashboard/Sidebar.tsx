"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navForRole, type NavSection } from "./nav-config";
import { useRoleStore } from "@/providers/RoleProvider";

export const SIDEBAR_WIDTH = 264;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "temporary";
};

export function Sidebar({ open, onClose, variant = "permanent" }: SidebarProps) {
  const role = useRoleStore((s) => s.role);
  const sections = navForRole(role);

  const content = <SidebarContent sections={sections} onLinkClick={onClose} />;

  if (variant === "temporary") {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { "aria-label": "Main navigation" } }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          bgcolor: "background.paper",
        },
      }}
    >
      {content}
    </Drawer>
  );
}

function SidebarContent({
  sections,
  onLinkClick,
}: {
  sections: NavSection[];
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <Stack component="nav" aria-label="Main navigation" sx={{ height: "100%" }}>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          // scrollbar-gutter: stable reserves space for the scrollbar
          // whether it's showing or not, so the nav doesn't shift 10px
          // sideways the moment content grows past one viewport.
          scrollbarGutter: "stable",
          py: 1.5,
          px: 1.25,
        }}
      >
        {sections.map((s) => (
          <Box key={s.heading} sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              sx={{ px: 1.5, color: "text.secondary" }}
            >
              {s.heading}
            </Typography>
            <List disablePadding sx={{ mt: 0.5 }}>
              {s.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    item.href !== "/teacher" &&
                    item.href !== "/parent" &&
                    item.href !== "/school-admin" &&
                    item.href !== "/tutor" &&
                    pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      selected={active}
                      onClick={onLinkClick}
                      sx={{
                        py: 1,
                        px: 1.5,
                        // ListItemIcon defaults to the parent text colour. The
                        // global override at MuiListItemButton.Mui-selected
                        // recolours it to primary.main — don't inline an
                        // sx color here or specificity wins over the system.
                        "& .MuiListItemIcon-root": { color: "text.secondary", minWidth: 36 },
                        "&.Mui-selected .MuiListItemIcon-root": { color: "primary.main" },
                      }}
                    >
                      <ListItemIcon>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        slotProps={{
                          primary: {
                            sx: { fontSize: "0.9rem", fontWeight: active ? 600 : 500 },
                          },
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
