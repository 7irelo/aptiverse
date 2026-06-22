"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreOutlined";

// Lightweight collapsible section. Click anywhere in the header to
// toggle. Body animates open/closed via MUI's Collapse (uses
// prefers-reduced-motion globally so accessibility-honouring users
// get the snap behaviour automatically).
//
// Header layout:
//   [chevron]  LABEL                  meta?
//
// Meta is small right-aligned text — useful for counts, status, etc.

type Props = {
  label: React.ReactNode;
  /** Initial open state. Uncontrolled — flip the key to reset. */
  defaultOpen?: boolean;
  /** Optional small text rendered right-aligned in the header. */
  meta?: React.ReactNode;
  children: React.ReactNode;
};

export function CollapsibleSection({
  label,
  defaultOpen = false,
  meta,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        sx={{
          cursor: "pointer",
          py: 0.75,
          px: 0.5,
          borderRadius: 1,
          userSelect: "none",
          "&:hover": {
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(255,255,255,0.03)"
                : "rgba(0,0,0,0.03)",
          },
          "&:focus-visible": { outline: "none" },
        }}
      >
        <IconButton
          size="small"
          tabIndex={-1}
          sx={{
            color: "text.secondary",
            transition: "transform 180ms ease",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
          aria-hidden
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ letterSpacing: "0.06em", fontWeight: 600, textTransform: "uppercase", flex: 1 }}
        >
          {label}
        </Typography>
        {meta && (
          <Typography variant="caption" color="text.secondary">
            {meta}
          </Typography>
        )}
      </Stack>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}
