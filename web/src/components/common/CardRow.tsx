"use client";

import * as React from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { type SxProps, type Theme } from "@mui/material/styles";
import { StatusChip, type StatusChipProps, type StatusKind } from "@/components/common/StatusChip";

// CardRow — the shared "title + metadata + progress/chips + actions" card
// that goals, subjects and other entity-list pages all reach for. One
// component, one set of spacing / border / accent decisions, so pages stop
// re-deriving the same layout (and drifting apart while they do it).
//
// Obeys the design system, not the other way round:
//   - border-only surface at 12px (inherited from the MuiCard override)
//   - 8px spacing scale only — p: 2.5 card padding, gaps at 0.5 / 1 / 1.5 / 2
//   - one accent per surface: hover lifts the border to `accent` (default
//     the academic teal `primary`); pass `wellbeing` / `achievement` to
//     switch the single accent for that surface — never to add a second one
//   - no box-shadow (the border does the elevation work)
//
// Compose the whole row via <CardRow .../>, or drop the sub-parts
// (CardRowProgress, CardRowFooter) into a custom body when a page needs
// something the high-level props don't cover.

/** The single accent a surface is allowed to show (hover border + bar). */
export type CardRowAccent = "primary" | "wellbeing" | "achievement";

// LinearProgress doesn't accept our augmented palette keys, and the
// "one accent" rule means the bar should echo the surface accent rather
// than introduce a new colour. `achievement` collapses to `success` for
// the bar (a verified/earned row is a "grown well" signal); everything
// else maps to its like-named MUI colour.
const BAR_COLOR: Record<CardRowAccent, "primary" | "success"> = {
  primary: "primary",
  wellbeing: "primary",
  achievement: "success",
};

const ACCENT_BORDER: Record<CardRowAccent, string> = {
  primary: "primary.main",
  wellbeing: "wellbeing.main",
  achievement: "achievement.main",
};

export type CardRowProgress = {
  /** 0–100. Clamped before render. */
  value: number;
  /** Left-hand caption, e.g. "Progress · 75% mastery". */
  label?: React.ReactNode;
  /** Right-hand emphasised value. Defaults to `${value}%` when omitted. */
  valueLabel?: React.ReactNode;
};

export type CardRowProps = {
  /** Primary line. h6 weight 700 — one heading per row. */
  title: React.ReactNode;
  /** Caption under the title (subject, grade, owner). */
  subtitle?: React.ReactNode;
  /** Body copy between header and footer. */
  description?: React.ReactNode;

  /**
   * Leading visual — a 44px square badge slot (subject code, avatar).
   * Pass the inner node; CardRow does not impose its colour so the badge
   * keeps the page's own category accent.
   */
  leading?: React.ReactNode;

  /**
   * Top-right header action(s) — typically a single IconButton (delete)
   * or a lock affordance. Kept compact; not a place for primary CTAs.
   */
  headerAction?: React.ReactNode;

  /** A chip row above the title (category, tags). */
  chips?: React.ReactNode;

  /** Optional progress block rendered above the footer. */
  progress?: CardRowProgress;

  /** Status pill shown bottom-left. */
  status?: { kind: StatusKind; label: React.ReactNode } & Pick<StatusChipProps, "dot">;
  /** Meta text shown bottom-right of the footer (e.g. "Due in 3 days"). */
  footerMeta?: React.ReactNode;

  /** Action row pinned to the bottom (buttons). Sits below the footer. */
  actions?: React.ReactNode;

  /**
   * Makes the whole card a link. When set, the card gets the hover-accent
   * border treatment and renders as a Next.js `Link`.
   */
  href?: string;

  /** The one accent this surface may show. Defaults to `primary`. */
  accent?: CardRowAccent;

  /** Escape hatch for the rare per-page tweak. Merged last. */
  sx?: SxProps<Theme>;
};

function clampPercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

/**
 * Progress block: label + value caption row, then the bar. Exported so a
 * custom card body can use it standalone with the same spacing + accent.
 */
export function CardRowProgressBar({
  value,
  label,
  valueLabel,
  accent = "primary",
}: CardRowProgress & { accent?: CardRowAccent }) {
  const v = clampPercent(value);
  return (
    <Box>
      {(label != null || valueLabel != null) && (
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
          {label != null && (
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          )}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {valueLabel ?? `${Math.round(v)}%`}
          </Typography>
        </Stack>
      )}
      <LinearProgress variant="determinate" value={v} color={BAR_COLOR[accent]} />
    </Box>
  );
}

/**
 * Footer: status pill bottom-left, meta text bottom-right. Exported for
 * custom bodies that still want the standard footer rhythm.
 */
export function CardRowFooter({
  status,
  meta,
}: {
  status?: CardRowProps["status"];
  meta?: React.ReactNode;
}) {
  if (!status && meta == null) return null;
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      {status ? (
        <StatusChip kind={status.kind} dot={status.dot} label={status.label} />
      ) : (
        <span />
      )}
      {meta != null && (
        <Typography variant="caption" color="text.secondary">
          {meta}
        </Typography>
      )}
    </Stack>
  );
}

export function CardRow({
  title,
  subtitle,
  description,
  leading,
  headerAction,
  chips,
  progress,
  status,
  footerMeta,
  actions,
  href,
  accent = "primary",
  sx,
}: CardRowProps) {
  const interactive = Boolean(href);

  const body = (
    <CardContent
      sx={{
        p: 2.5,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        // The footer block (progress + status + actions) sits at the
        // bottom regardless of body length, so a grid of these rows lines
        // up across cards of different content height.
        gap: 1.5,
        "&:last-child": { pb: 2.5 },
      }}
    >
      {chips && (
        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {chips}
        </Stack>
      )}

      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {leading && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
            }}
          >
            {leading}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap={interactive ? undefined : true}>
            {title}
          </Typography>
          {subtitle != null && (
            <Typography variant="caption" color="text.secondary" component="div">
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerAction && <Box sx={{ flexShrink: 0, mt: -0.5, mr: -0.5 }}>{headerAction}</Box>}
      </Stack>

      {description != null && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}

      {/* Everything below pins to the bottom of the card. */}
      <Stack spacing={1.5} sx={{ mt: "auto", pt: description != null || progress ? 0.5 : 0 }}>
        {progress && (
          <CardRowProgressBar
            value={progress.value}
            label={progress.label}
            valueLabel={progress.valueLabel}
            accent={accent}
          />
        )}
        <CardRowFooter status={status} meta={footerMeta} />
        {actions && (
          <Stack direction="row" spacing={1} alignItems="center">
            {actions}
          </Stack>
        )}
      </Stack>
    </CardContent>
  );

  return (
    <Card
      {...(interactive
        ? { component: Link, href: href as string }
        : {})}
      sx={[
        {
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
        interactive && {
          textDecoration: "none",
          color: "inherit",
          // One accent per surface: the hover border is the only colour
          // this card introduces on interaction — no shadow, no fill.
          transition: "border-color 150ms ease",
          "&:hover": { borderColor: ACCENT_BORDER[accent] },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {body}
    </Card>
  );
}
