"use client";

import { useEffect } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AD_UNITS, AUDIENCE_LABELS, type AdUnit } from "./units";

// =====================================================================
// /ads/units: the internal contact sheet. Every exportable unit, scaled to
// a thumbnail, linking to its own capture URL.
//
// The thumbnails are the real units rendered small on purpose. Ad platforms
// show these at roughly this size in a feed, so if a headline stops working
// here it will not work in the wild either, and that is the point of looking
// at them this way before spending anything.
//
// noindex, and not in the public nav.
// =====================================================================

const THUMB_WIDTH = 260;

export default function AdUnitsIndexPage() {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const groups: AdUnit["audience"][] = ["organic", "uni", "parent", "tutor", "brand"];

  return (
    <Box sx={{ p: { xs: 2.5, md: 5 }, bgcolor: "background.default", minHeight: "100vh" }}>
      <Stack spacing={4} sx={{ maxWidth: 1400, mx: "auto" }}>
        <Box>
          <Chip label="Internal · ad export" size="small" sx={{ mb: 1.5 }} />
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            Ad units
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
            Each unit renders alone at its exact export size at{" "}
            <code>/ads/units/&lt;slug&gt;</code>. Run{" "}
            <code>node scripts/export-ads.mjs</code> from <code>web/</code> to write them all to
            PNG. Thumbnails below are the real thing at feed scale.
          </Typography>
        </Box>

        {groups.map((audience) => {
          const units = AD_UNITS.filter((u) => u.audience === audience);
          if (units.length === 0) return null;
          return (
            <Box key={audience}>
              <Typography variant="overline" color="text.secondary">
                {AUDIENCE_LABELS[audience]}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {units.map((u) => (
                  <UnitCard key={u.slug} unit={u} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

function UnitCard({ unit }: { unit: AdUnit }) {
  const scale = THUMB_WIDTH / unit.width;
  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2.5} alignItems="flex-start">
          {/* The artboard is position:fixed by design, so a thumbnail cannot
              just render it inline. An iframe gives each preview its own
              viewport, which is also the closest thing to what the capture
              actually sees. */}
          <Box
            sx={{
              width: THUMB_WIDTH,
              height: unit.height * scale,
              flexShrink: 0,
              overflow: "hidden",
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Box
              component="iframe"
              src={`/ads/units/${unit.slug}`}
              title={unit.slug}
              scrolling="no"
              sx={{
                width: unit.width,
                height: unit.height,
                border: 0,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, wordBreak: "break-all" }}>
              {unit.slug}
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              <Chip label={`${unit.width}x${unit.height}`} size="small" sx={{ height: 22 }} />
              <Chip label={unit.scheme} size="small" variant="outlined" sx={{ height: 22 }} />
              <Chip label={unit.concept} size="small" variant="outlined" sx={{ height: 22 }} />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.25 }}>
              {unit.note}
            </Typography>
            <Typography
              component={Link}
              href={`/ads/units/${unit.slug}`}
              variant="caption"
              sx={{ display: "block", mt: 1.25, fontWeight: 700 }}
            >
              Open full size
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
