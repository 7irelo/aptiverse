"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// GroupedList — buckets items by a key and renders each bucket as a collapsible
// section with a header (icon, label, count) and a chevron. Recreated for
// aptiverse (Graphite & Citron, MUI v7) from the Euphoria grouped-list idea,
// as a plain data component (no react-admin, no datagrid coupling). Grouping is
// presentational and client-side over data you already have.

export type GroupedListProps<T> = {
  items: T[];
  /** The group key for an item. */
  groupBy: (item: T) => string;
  /** Row body for a single item. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Human label for a group key. Defaults to the key itself. */
  groupLabel?: (key: string) => React.ReactNode;
  /** Optional leading icon per group. */
  groupIcon?: (key: string) => React.ReactNode;
  /** Explicit group order; unknown keys keep their first-seen order after these. */
  groupOrder?: string[];
  /** Start every group collapsed. Default false. */
  defaultCollapsed?: boolean;
  /** Gap between rows within a group, on the 8px scale. Default 1. */
  itemSpacing?: number;
};

export function GroupedList<T>({
  items,
  groupBy,
  renderItem,
  groupLabel,
  groupIcon,
  groupOrder,
  defaultCollapsed = false,
  itemSpacing = 1,
}: GroupedListProps<T>) {
  const groups = useMemo(() => {
    const map = new Map<string, T[]>();
    for (const item of items) {
      const key = groupBy(item);
      const bucket = map.get(key);
      if (bucket) bucket.push(item);
      else map.set(key, [item]);
    }
    let keys = [...map.keys()];
    if (groupOrder) {
      const rank = new Map(groupOrder.map((k, i) => [k, i]));
      keys = keys.sort((a, b) => (rank.get(a) ?? 999) - (rank.get(b) ?? 999));
    }
    return keys.map((key) => ({ key, items: map.get(key)! }));
  }, [items, groupBy, groupOrder]);

  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(defaultCollapsed ? groups.map((g) => g.key) : []),
  );

  const toggle = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <Stack spacing={2}>
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.key);
        return (
          <Box key={group.key}>
            <Box
              role="button"
              tabIndex={0}
              aria-expanded={!isCollapsed}
              onClick={() => toggle(group.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(group.key);
                }
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
                px: 0.5,
                mb: 1,
                cursor: "pointer",
                userSelect: "none",
                borderBottom: 1,
                borderColor: "divider",
                "&:hover .group-label": { color: "text.primary" },
              }}
            >
              <ExpandMoreIcon
                sx={{
                  color: "text.secondary",
                  transform: isCollapsed ? "rotate(-90deg)" : "none",
                  transition: "transform 150ms ease",
                }}
              />
              {groupIcon && (
                <Box sx={{ display: "flex", color: "text.secondary" }}>{groupIcon(group.key)}</Box>
              )}
              <Typography
                variant="subtitle2"
                className="group-label"
                sx={{ fontWeight: 700, color: "text.secondary", transition: "color 150ms ease" }}
              >
                {groupLabel ? groupLabel(group.key) : group.key}
              </Typography>
              <Chip
                label={group.items.length}
                size="small"
                sx={{
                  height: 20,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                  color: "primary.main",
                }}
              />
            </Box>
            <Collapse in={!isCollapsed} unmountOnExit>
              <Stack spacing={itemSpacing} sx={{ pb: 1 }}>
                {group.items.map((item, index) => (
                  <Box key={index}>{renderItem(item, index)}</Box>
                ))}
              </Stack>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
}
