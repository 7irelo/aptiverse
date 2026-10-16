import type { MetadataRoute } from "next";

// Web app manifest. Aptiverse is a phone-first product for South African
// students, so "Add to home screen" is a real install path, not a novelty:
// it removes the browser chrome (worth ~110px of vertical space on a
// mid-range Android) and gives the app a real launcher entry.
//
// Scope is deliberately the whole origin and start_url is /dashboard, so an
// installed shortcut lands the student on their home base rather than the
// marketing page. Signed-out users get redirected to /login by middleware,
// which is the correct behaviour for an installed app too.
//
// This is manifest only. No service worker and no offline support: that is a
// separate planned feature, and shipping a half-built worker would cache
// stale bundles onto metered devices.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aptiverse",
    short_name: "Aptiverse",
    description:
      "Practice, mastery tracking, wellbeing, and goals in one calm place.",
    id: "/",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    // Matches the light background painted in globals.css, so the splash
    // screen does not flash a colour the app never uses.
    background_color: "#F6F7F5",
    theme_color: "#1B1D22",
    categories: ["education", "productivity"],
    lang: "en-ZA",
    dir: "ltr",
    icons: [
      {
        // app/icon.svg is served at /icon.svg. The glyph sits inside the
        // middle 45% of the canvas, comfortably inside the maskable safe
        // zone, so the same file is valid for both purposes.
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
