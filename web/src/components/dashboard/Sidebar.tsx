"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/common/Logo";
import { usePathname } from "next/navigation";
import { navForRole } from "./nav-config";
import { useRoleStore } from "@/providers/RoleProvider";
import { useNavigation, useAcademicProfile } from "@/lib/api/queries";
import { iconForKey } from "./nav-icons";
import { sectionsToTree, isNodeActive, isLeafActive, type NavNode } from "./nav-tree";
import { ExpandedMenu } from "./ExpandedMenu";
import {
  useSidebarState,
  SIDEBAR_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
} from "./sidebar-context";

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./sidebar-context";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "temporary";
};

// Shared: resolve the nav tree from server-driven nav (falls back to the
// static per-role config while it loads so the rail never flashes empty).
function useNavTree(): NavNode[] {
  const role = useRoleStore((s) => s.role);
  const { data } = useNavigation();
  const profileQuery = useAcademicProfile();
  const isTertiary = profileQuery.data?.educationLevel === "tertiary";

  const sections = data
    ? data.map((s) => ({
        heading: s.heading,
        items: s.items.map((i) => ({
          label: i.label,
          href: i.href,
          icon: iconForKey(i.icon),
          badge: i.badge ?? undefined,
        })),
      }))
    : navForRole(role);

  // Tertiary students study Courses, not CAPS Subjects. Relabel and repoint
  // the one "Subjects" nav item so the rail matches their world and skips the
  // subjects -> courses redirect bounce. The data layer already unifies both
  // behind a single study-unit id (practiceKey), so this is label-only.
  const resolved = isTertiary
    ? sections.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.href === "/dashboard/subjects"
            ? { ...i, label: "Courses", href: "/dashboard/courses" }
            : i,
        ),
      }))
    : sections;

  return sectionsToTree(resolved);
}

export function Sidebar({ open, onClose, variant = "permanent" }: SidebarProps) {
  const tree = useNavTree();

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
        <MobileNav tree={tree} onNavigate={onClose} />
      </Drawer>
    );
  }

  return <DesktopRail tree={tree} />;
}

/* ---------------------------------------------------------------- desktop */

function DesktopRail({ tree }: { tree: NavNode[] }) {
  const { collapsed, toggle } = useSidebarState();
  const [openNode, setOpenNode] = useState<NavNode | null>(null);

  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  const handleOpenerClick = (node: NavNode) => {
    setOpenNode((prev) => (prev?.name === node.name ? null : node));
  };

  const closePopover = () => setOpenNode(null);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width,
        flexShrink: 0,
        transition: (t) =>
          t.transitions.create("width", { duration: t.transitions.duration.shorter }),
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          bgcolor: "background.paper",
          overflowX: "hidden",
          // Full-height rail, pinned while content scrolls beside it.
          position: "sticky",
          top: 0,
          height: "100vh",
          transition: (t) =>
            t.transitions.create("width", { duration: t.transitions.duration.shorter }),
        },
      }}
    >
      <Stack component="nav" aria-label="Main navigation" sx={{ height: "100%" }}>
        {/* Brand + collapse toggle. Collapsed, the mark itself expands the rail
            (Euphoria's SidebarToggle model). */}
        <Box
          sx={{
            height: { xs: 64, md: 68 },
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            gap: 1,
            px: collapsed ? 0 : 1.5,
            flexShrink: 0,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {collapsed ? (
            <Tooltip title="Expand menu" placement="right">
              <IconButton onClick={toggle} aria-label="Expand menu">
                <LogoMark size={26} />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Box
                component={Link}
                href="/"
                sx={{ display: "flex", alignItems: "center", minWidth: 0, textDecoration: "none" }}
              >
                <Logo size={28} />
              </Box>
              <Tooltip title="Collapse menu" placement="right">
                <IconButton onClick={toggle} aria-label="Collapse menu" size="small">
                  <MenuOpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pb: 1.5,
            px: 0,
          }}
        >
          <List disablePadding>
            {tree.map((node) => (
              <RailItem
                key={node.name}
                node={node}
                collapsed={collapsed}
                popoverOpen={openNode?.name === node.name}
                onOpenerClick={handleOpenerClick}
              />
            ))}
          </List>
        </Box>
      </Stack>

      <ExpandedMenu node={openNode} left={width} open={!!openNode} onClose={closePopover} />
    </Drawer>
  );
}

function RailItem({
  node,
  collapsed,
  popoverOpen,
  onOpenerClick,
}: {
  node: NavNode;
  collapsed: boolean;
  popoverOpen: boolean;
  onOpenerClick: (node: NavNode) => void;
}) {
  const isOpener = !!node.items?.length;
  const Icon = node.icon;

  const selectedSx = {
    // Full-width, square rows (Euphoria). The highlight tracks the *selected*
    // section — the one whose submenu is open — not the current route.
    bgcolor: popoverOpen ? "action.selected" : "transparent",
    borderRadius: 0,
    py: 1.25,
    px: collapsed ? 0 : 2,
    justifyContent: collapsed ? "center" : "flex-start",
    "& .MuiListItemIcon-root": {
      color: popoverOpen ? "text.primary" : "text.secondary",
      minWidth: collapsed ? 0 : 36,
      justifyContent: "center",
    },
    "&:hover": { bgcolor: popoverOpen ? "action.selected" : "action.hover" },
  };

  const content = (
    <>
      <ListItemIcon>
        <Icon fontSize="small" />
      </ListItemIcon>
      {!collapsed && (
        <>
          <ListItemText
            primary={node.name}
            slotProps={{
              primary: { sx: { fontSize: "0.9rem", fontWeight: popoverOpen ? 700 : 500 } },
            }}
          />
          {node.badge && (
            <Chip
              label={node.badge}
              size="small"
              color="success"
              sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
            />
          )}
          {isOpener && (
            <ChevronRightIcon
              fontSize="small"
              sx={{ color: popoverOpen ? "text.primary" : "text.disabled", ml: 0.5 }}
            />
          )}
        </>
      )}
    </>
  );

  const button = isOpener ? (
    <ListItemButton onClick={() => onOpenerClick(node)} sx={selectedSx}>
      {content}
    </ListItemButton>
  ) : (
    <ListItemButton component={Link} href={node.path ?? "#"} sx={selectedSx}>
      {content}
    </ListItemButton>
  );

  return (
    <ListItem disablePadding>
      {collapsed ? (
        <Tooltip title={node.name} placement="right">
          <Box sx={{ width: "100%" }}>{button}</Box>
        </Tooltip>
      ) : (
        button
      )}
    </ListItem>
  );
}

/* ----------------------------------------------------------------- mobile */

// A flyout can't work on a phone, so the mobile drawer drills in place:
// openers expand their children inline (accordion). The section holding the
// current route starts expanded.
function MobileNav({ tree, onNavigate }: { tree: NavNode[]; onNavigate: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(() =>
    tree.filter((n) => n.items?.length && isNodeActive(n, pathname)).map((n) => n.name),
  );

  const toggle = (name: string) =>
    setExpanded((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  return (
    <Stack component="nav" aria-label="Main navigation" sx={{ height: "100%" }}>
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          px: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Box
          component={Link}
          href="/"
          onClick={onNavigate}
          sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <Logo size={28} />
        </Box>
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto", py: 1.5, px: 1.25 }}>
      <List disablePadding>
        {tree.map((node) => {
          const isOpener = !!node.items?.length;
          const Icon = node.icon;

          if (!isOpener) {
            const active = isLeafActive(node.path, pathname);
            return (
              <ListItem key={node.name} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  href={node.path ?? "#"}
                  selected={active}
                  onClick={onNavigate}
                  sx={mobileRowSx(active)}
                >
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={node.name}
                    slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: active ? 700 : 500 } } }}
                  />
                  {node.badge && (
                    <Chip label={node.badge} size="small" color="success" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          }

          const isExpanded = expanded.includes(node.name);
          const sectionActive = isNodeActive(node, pathname);
          return (
            <Box key={node.name} sx={{ mb: 0.25 }}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => toggle(node.name)} sx={mobileRowSx(false)}>
                  <ListItemIcon sx={{ color: sectionActive ? "text.primary" : "text.secondary" }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={node.name}
                    slotProps={{ primary: { sx: { fontSize: "0.9rem", fontWeight: sectionActive ? 700 : 500 } } }}
                  />
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      color: "text.disabled",
                      transform: isExpanded ? "rotate(180deg)" : "none",
                      transition: "transform .2s ease",
                    }}
                  />
                </ListItemButton>
              </ListItem>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List disablePadding sx={{ pl: 2 }}>
                  {node.items?.map((child) => {
                    const active = isLeafActive(child.path, pathname);
                    const ChildIcon = child.icon;
                    return (
                      <ListItem key={child.name} disablePadding sx={{ mb: 0.25 }}>
                        <ListItemButton
                          component={Link}
                          href={child.path ?? "#"}
                          selected={active}
                          onClick={onNavigate}
                          sx={mobileRowSx(active)}
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <ChildIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={child.name}
                            slotProps={{ primary: { sx: { fontSize: "0.85rem", fontWeight: active ? 700 : 500 } } }}
                          />
                          {child.badge && (
                            <Chip label={child.badge} size="small" color="success" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }} />
                          )}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
      </Box>
    </Stack>
  );
}

function mobileRowSx(active: boolean) {
  return {
    borderRadius: 1.5,
    py: 1,
    px: 1.5,
    bgcolor: active ? "action.selected" : "transparent",
    "& .MuiListItemIcon-root": { color: active ? "text.primary" : "text.secondary", minWidth: 36 },
    "&:hover": { bgcolor: active ? "action.selected" : "action.hover" },
  };
}
