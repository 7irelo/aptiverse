"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { CheckCircle2, Globe } from "lucide-react";

// Big text-on-one-side, demo-on-the-other block. Alternates left/right
// via the `reverse` prop. The demo slot is whatever React node makes
// sense for the feature: a chat UI, a chart, a check-in.
export type FeatureShowcaseProps = {
  // Optional anchor so the top navigation can deep-link straight to one
  // showcase instead of dropping the reader at the top of a long page.
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  demo: React.ReactNode;
  reverse?: boolean;
};

export function FeatureShowcase({
  id,
  eyebrow,
  title,
  body,
  bullets,
  demo,
  reverse = false,
}: FeatureShowcaseProps) {
  return (
    <Box
      id={id}
      sx={{
        scrollMarginTop: { xs: 72, md: 88 },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
        gap: { xs: 3.5, md: 8 },
        alignItems: "center",
        py: { xs: 5, md: 8 },
      }}
    >
      <Box sx={{ order: { xs: 1, md: reverse ? 2 : 1 } }}>
        <Stack spacing={2.5}>
          <Typography variant="overline" color="primary.main">
            {eyebrow}
          </Typography>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {body}
          </Typography>
          <Stack spacing={1.25}>
            {bullets.map((b) => (
              <Stack key={b} direction="row" spacing={1.25} alignItems="flex-start">
                <Box sx={{ color: "primary.main", mt: 0.25, flexShrink: 0, display: "flex" }}>
                  <CheckCircle2 size={18} />
                </Box>
                <Typography variant="body2">{b}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ order: { xs: 2, md: reverse ? 1 : 2 }, minWidth: 0 }}>
        <Box
          sx={{
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: -24,
              borderRadius: 4,
              // Derived from the live palette so the glow follows the brand and
              // both schemes. The hardcoded values here were leftover Chalk &
              // Pine teal, which matched neither mode.
              background: (t) =>
                `radial-gradient(60% 60% at 50% 50%, ${alpha(
                  t.palette.secondary.main,
                  t.palette.mode === "dark" ? 0.2 : 0.22,
                )} 0%, ${alpha(t.palette.secondary.main, 0)} 70%)`,
              filter: "blur(20px)",
              pointerEvents: "none",
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>{demo}</Box>
        </Box>
      </Box>
    </Box>
  );
}

// Reusable mock-app frame used by the demos. A clean browser-style frame:
// a small globe glyph plus the URL, no macOS traffic-light dots.
export function MockAppFrame({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        // Graphite-tinted shadow from the brand surface token. Was a leftover
        // Chalk & Pine green-black that read as a colour cast on light.
        boxShadow: (t) =>
          `0 20px 50px -20px ${alpha(
            t.palette.mode === "dark" ? "#000000" : t.palette.brandSurface.main,
            t.palette.mode === "dark" ? 0.5 : 0.22,
          )}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Box sx={{ color: "text.disabled", display: "flex", flexShrink: 0 }}>
          <Globe size={13} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            color: "text.secondary",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        {badge && (
          <Chip
            label={badge}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 20, flexShrink: 0 }}
          />
        )}
      </Box>
      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
    </Card>
  );
}
