"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

// Shared overline + title + optional action header for card sections.
//
// Replaces the inline Stack pattern repeated three times on the
// dashboard (Upcoming, Mastery, Active Goals card headers) and the
// equivalent in other surfaces. The overline carries the eyebrow
// (per DESIGN.md Overline-As-Eyebrow Rule); the title carries the
// section name; the action sits on the right.
//
// Defaults the title to h5 (1.0625rem in the theme scale) -- the
// product-register card-header tier. Callers wanting a larger title
// (e.g. a hero block) should compose their own header rather than
// reach for a `titleVariant` knob; SectionHeader is for the standard
// rhythm, not for hero treatments.

export type SectionHeaderProps = {
  /** Eyebrow text rendered as overline. Optional. */
  overline?: string;
  /** Section title rendered as h5. */
  title: string;
  /**
   * Right-side action, typically a Button with endIcon or an
   * IconButton. Omit if the section has no navigation hook.
   */
  action?: ReactNode;
  /** Margin-bottom applied to the header block. Defaults to 2. */
  mb?: number;
};

export function SectionHeader({ overline, title, action, mb = 2 }: SectionHeaderProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-end"
      sx={{ mb, gap: 1.5 }}
    >
      <Box sx={{ minWidth: 0 }}>
        {overline && (
          <Typography variant="overline" color="text.secondary">
            {overline}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Stack>
  );
}
