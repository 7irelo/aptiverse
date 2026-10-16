"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { findUnit } from "../units";

// =====================================================================
// /ads/units/<slug> renders exactly one ad unit, alone, at its exact export
// size, pinned to the top-left of the viewport. Nothing else is visible:
// the artboard is fixed-position above the marketing chrome and this page
// locks the document so no scroll offset can creep into a capture.
//
// One unit per URL rather than a switcher, so the export script can shoot
// each one from a cold page load and get a byte-identical result every run.
//
// noindex, and not linked from any public navigation.
// =====================================================================

export default function AdUnitCapturePage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
  const unit = slug ? findUnit(slug) : undefined;

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);

    // Any scroll position at all would shift a viewport-clipped capture, and
    // a scrollbar gutter would shave pixels off the right edge.
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    return () => {
      document.head.removeChild(meta);
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  // A stable marker the export script waits on, so it never shoots a page
  // that resolved to "unit not found" and silently writes a blank PNG.
  useEffect(() => {
    if (unit) document.body.setAttribute("data-ad-ready", unit.slug);
    return () => document.body.removeAttribute("data-ad-ready");
  }, [unit]);

  if (!unit) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          No ad unit called &ldquo;{slug}&rdquo;
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          See /ads/units for the list.
        </Typography>
      </Box>
    );
  }

  return <>{unit.render()}</>;
}
