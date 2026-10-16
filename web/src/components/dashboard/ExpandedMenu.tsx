"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Popover from "@mui/material/Popover";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { NavNode } from "./nav-tree";

// Column geometry mirrors Euphoria's AppMenuItemChildrenExpanded.
const MAIN_COLUMN = 288;
const SUB_COLUMN = 244;
// Matches the rail's logo-header height (desktop) so the panel starts exactly
// where the rail items start.
const HEADER_HEIGHT = 68;

type Props = {
  node: NavNode | null;
  /** x-offset of the rail's right edge — the panel starts flush against it. */
  left: number;
  open: boolean;
  onClose: () => void;
};

/**
 * Port of Euphoria.v4's AppMenuItemChildrenExpanded: a full-height panel that
 * starts flush at the rail's right edge (not a floating card). It sits on its
 * own surface (a step off the rail) so the two menus read as distinct. Left
 * column lists the section's items; one with its own children slides the right
 * sub-panel open. Active items get a full-row highlight.
 */
export function ExpandedMenu({ node, left, open, onClose }: Props) {
  const [selected, setSelected] = useState<NavNode | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSelected(null);
  }, [node?.name]);

  if (!node) return null;

  const go = (path?: string) => {
    if (!path) return;
    router.push(path);
    onClose();
  };

  const handleItemClick = (item: NavNode) => {
    if (item.items?.length) {
      setSelected((prev) => (prev?.name === item.name ? null : item));
    } else {
      go(item.path);
    }
  };

  const hasSub = !!selected?.items?.length;
  const HeaderIcon = node.icon;

  return (
    <Popover
      open={open}
      onClose={onClose}
      disableAutoFocus
      disableEnforceFocus
      anchorReference="anchorPosition"
      anchorPosition={{ top: 0, left }}
      marginThreshold={0}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      // Expand from the left (rail) edge outward, rather than the default
      // corner-grow — a horizontal Collapse reveals the width left-to-right.
      slots={{ transition: Collapse }}
      slotProps={{
        transition: { orientation: "horizontal", timeout: 220 } as any,
        paper: {
          sx: {
            // 100dvh, matching the shell and the marketing layout. On mobile
            // 100vh measures the viewport as if the browser chrome were hidden,
            // so a full-height menu overrun the visible area by roughly the
            // height of the address bar and stranded its last items under it.
            height: "100dvh",
            maxHeight: "100dvh",
            borderRadius: 0,
            m: 0,
            // A step off the rail so the two menus are clearly distinct.
            bgcolor: "grey.100",
            borderLeft: 1,
            borderColor: "divider",
            boxShadow: "6px 0 32px -20px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* The clicked main-menu section is the panel header — aligned to the
          rail's logo-header height so the items below line up with the rail. */}
      <Stack
        direction="row"
        alignItems="center"
        gap={1.75}
        sx={{
          height: HEADER_HEIGHT,
          px: 2.5,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiSvgIcon-root": { color: "text.secondary" },
        }}
      >
        <HeaderIcon fontSize="small" />
        <Typography noWrap sx={{ fontSize: "1rem", fontWeight: 700, color: "text.primary" }}>
          {node.name}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ flex: 1, minHeight: 0 }}>
        {/* Left: section items */}
        <Box
          sx={{
            width: MAIN_COLUMN,
            flexShrink: 0,
            pt: 0,
            pb: 2,
            overflowY: "auto",
            borderRight: hasSub ? 1 : 0,
            borderColor: "divider",
          }}
        >
          {node.items?.map((item) => {
            const expandable = !!item.items?.length;
            const isSelected = selected?.name === item.name;
            const Icon = item.icon;
            return (
              <MenuRow
                key={item.name}
                onClick={() => handleItemClick(item)}
                selected={isSelected}
              >
                <Stack direction="row" alignItems="center" gap={1.75} minWidth={0}>
                  <Icon fontSize="small" />
                  <Typography noWrap sx={{ fontSize: 14, fontWeight: isSelected ? 600 : 500 }}>
                    {item.name}
                  </Typography>
                </Stack>
                {expandable ? (
                  <ChevronRightIcon sx={{ fontSize: 18, flexShrink: 0 }} />
                ) : (
                  item.badge && <Chip label={item.badge} size="small" color="success" sx={CHIP_SX} />
                )}
              </MenuRow>
            );
          })}
        </Box>

        {/* Right: sub-panel, slides open */}
        <Box
          sx={{
            width: hasSub ? SUB_COLUMN : 0,
            opacity: hasSub ? 1 : 0,
            overflowX: "hidden",
            overflowY: "auto",
            transition: "width .25s ease, opacity .2s ease",
            flexShrink: 0,
            pt: 0,
            pb: 2,
          }}
        >
          <Box sx={{ width: SUB_COLUMN }}>
            {selected?.items?.map((sub) => {
              const Icon = sub.icon;
              return (
                <MenuRow key={sub.name} onClick={() => go(sub.path)}>
                  <Stack direction="row" alignItems="center" gap={1.75} minWidth={0}>
                    <Icon fontSize="small" />
                    <Typography noWrap sx={{ fontSize: 14, fontWeight: 500 }}>
                      {sub.name}
                    </Typography>
                  </Stack>
                  {sub.badge && <Chip label={sub.badge} size="small" color="success" sx={CHIP_SX} />}
                </MenuRow>
              );
            })}
          </Box>
        </Box>
      </Stack>
    </Popover>
  );
}

const CHIP_SX = { height: 20, fontSize: "0.65rem", fontWeight: 700, flexShrink: 0 } as const;

function MenuRow({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        height: 48,
        px: 2.5,
        cursor: "pointer",
        // Full-row highlight for the selected item (no accent lines).
        bgcolor: selected ? "action.selected" : "transparent",
        color: "text.primary",
        "& .MuiSvgIcon-root": { color: selected ? "text.primary" : "text.secondary" },
        transition: "background-color .12s ease",
        "&:hover": { bgcolor: selected ? "action.selected" : "action.hover" },
        "&:focus-visible": { outline: "none", bgcolor: "action.hover" },
      }}
    >
      {children}
    </Box>
  );
}
