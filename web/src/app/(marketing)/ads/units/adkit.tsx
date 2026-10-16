"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ThemeProvider, alpha } from "@mui/material/styles";
import { useMemo } from "react";
import { buildTheme, type ColorMode } from "@/theme";

// =====================================================================
// Ad kit: the primitives every exported ad unit is built from.
//
// Three rules make these different from the rest of the marketing site.
//
// 1. FIXED SCHEME. A PNG has no OS colour scheme to follow, so each unit
//    commits to light or dark at author time and the artboard pins a
//    freshly built theme over whatever the page around it is doing.
// 2. FIXED PIXELS. The artboard is an exact export size (1080x1350 and so
//    on). Every type size here is an absolute px value, because the theme's
//    display sizes are clamp(vw) and would resize under a different preview
//    viewport, which is exactly what a deterministic capture must not do.
// 3. CITRON IS A SURFACE. Citron only ever appears as a filled block with
//    graphite ink on top. It is never a text colour on either scheme: it
//    scores 1.4:1 on paper and would be unreadable at the thumbnail size a
//    platform actually shows these at.
//
// Colours come from the theme tokens (palette.brandSurface, palette.secondary),
// never from a hex typed into a component.
// =====================================================================

export type AdScheme = ColorMode;

/** Ink and surface for a unit, derived once from the pinned theme. */
export function adSurfaces(scheme: AdScheme) {
  // brandSurface is the graphite panel token, i.e. the one colour that stays
  // dark with light content in both schemes. Light units sit on the canvas
  // neutral instead so they read as paper, not as a washed-out panel.
  return scheme === "dark"
    ? { bg: "#1B1D22", ink: "#F2F3F1", muted: "#9EA29C", hair: "rgba(255,255,255,0.14)" }
    : { bg: "#F6F7F5", ink: "#1B1D22", muted: "#5B5E5A", hair: "rgba(27,29,34,0.14)" };
}

export const CITRON = "#C3E84F";
export const GRAPHITE = "#1B1D22";

/**
 * The raised surface a product panel is drawn on. Exported because the
 * depictions draw their own markers on top of it and need the exact colour to
 * ring them with; reading it off a second hardcoded literal is how the two
 * quietly drift apart.
 */
export function adPanelBg(scheme: AdScheme) {
  return scheme === "dark" ? "#0F1012" : "#FFFFFF";
}

// ---------------------------------------------------------------------
// THE GROUND. Every unit used to sit on one flat fill, which at 1080x1350
// reads as unfinished rather than restrained: there is a lot of empty
// graphite around the composition and nothing for the eye to rest on.
//
// One idea, executed quietly: a dot lattice. Not a gradient, not a blob
// field, not glass, and not all three stacked. The lattice is already this
// product's own language, the 404 sets its status code as a dot matrix, the
// brand mark is a five-node graph, and the mastery grid is a lattice, so a
// dot field behind the work looks like Aptiverse rather than like a stock
// background.
//
// Three rules keep it from becoming decoration:
//   1. It is painted as a background-image on the artboard itself, so it
//      costs no DOM and cannot shift a single pixel of layout.
//   2. It is 5% ink. Every product panel is opaque and masks it entirely,
//      and no text ever loses contrast because type sits on its own solid
//      run rather than on the dots.
//   3. It is registered to the padding, so the first dot sits exactly on the
//      content edge and the field reads as part of the grid the layout is
//      already on, not as wallpaper behind it.
// ---------------------------------------------------------------------
const LATTICE_STEP = 44;

function latticeImage(scheme: AdScheme) {
  const ink = scheme === "dark" ? "255,255,255" : "27,29,34";
  const dot = scheme === "dark" ? 0.055 : 0.05;
  return `radial-gradient(circle at center, rgba(${ink},${dot}) 1.6px, rgba(${ink},0) 1.7px)`;
}

/**
 * The export canvas. Exactly `width` x `height` CSS pixels, top-left of the
 * viewport, above everything the marketing layout paints, with its own pinned
 * theme. Playwright clips to these coordinates.
 */
export function Artboard({
  width,
  height,
  scheme,
  pad = 72,
  children,
}: {
  width: number;
  height: number;
  scheme: AdScheme;
  pad?: number;
  children: React.ReactNode;
}) {
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  const s = adSurfaces(scheme);

  return (
    <ThemeProvider theme={theme}>
      <Box
        data-ad-artboard
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width,
          height,
          // The marketing shell paints a sticky nav; this sits over all of it
          // so a full-page capture at the artboard viewport is only the ad.
          zIndex: 2147483000,
          overflow: "hidden",
          bgcolor: s.bg,
          backgroundImage: latticeImage(scheme),
          backgroundSize: `${LATTICE_STEP}px ${LATTICE_STEP}px`,
          // Registered to the content edge rather than to the artboard edge.
          backgroundPosition: `${pad}px ${pad}px`,
          color: s.ink,
          display: "flex",
          flexDirection: "column",
          p: `${pad}px`,
          // Roboto is the bundled fallback. Frygia is loaded from a remote
          // stylesheet, so the export script waits on document.fonts before it
          // shoots; without that wait the capture can land mid-swap.
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {children}
      </Box>
    </ThemeProvider>
  );
}

/** Small uppercase label. Sets the audience or the context in one glance. */
export function AdEyebrow({
  children,
  scheme,
  size = 24,
}: {
  children: React.ReactNode;
  scheme: AdScheme;
  size?: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Typography
      component="p"
      sx={{
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: s.muted,
        lineHeight: 1,
      }}
    >
      {children}
    </Typography>
  );
}

/**
 * The focal element. One per unit, and it should still be readable when a
 * platform renders the whole thing 140px wide in a feed.
 */
export function AdHeadline({
  children,
  size,
  scheme,
  maxWidth,
}: {
  children: React.ReactNode;
  size: number;
  scheme: AdScheme;
  maxWidth?: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Typography
      component="h1"
      sx={{
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: "-0.032em",
        fontWeight: 600,
        color: s.ink,
        maxWidth,
        textWrap: "balance",
      }}
    >
      {children}
    </Typography>
  );
}

export function AdBody({
  children,
  size = 32,
  scheme,
  maxWidth,
}: {
  children: React.ReactNode;
  size?: number;
  scheme: AdScheme;
  maxWidth?: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Typography
      component="p"
      sx={{ fontSize: size, lineHeight: 1.35, color: s.muted, maxWidth, fontWeight: 400 }}
    >
      {children}
    </Typography>
  );
}

/**
 * A citron block with graphite ink on it. This is the ONLY way citron is
 * allowed to carry a word, and it works identically on both schemes because
 * the ink is always graphite.
 */
export function CitronBlock({
  children,
  size,
  px = 20,
  py = 4,
}: {
  children: React.ReactNode;
  size?: number;
  px?: number;
  py?: number;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        bgcolor: CITRON,
        color: GRAPHITE,
        px: `${px}px`,
        py: `${py}px`,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: "-0.032em",
        fontWeight: 600,
        borderRadius: "6px",
      }}
    >
      {children}
    </Box>
  );
}

/** The action pill. Citron fill, graphite ink, never an outline. */
export function AdCta({ children, size = 30 }: { children: React.ReactNode; size?: number }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        bgcolor: CITRON,
        color: GRAPHITE,
        px: `${size * 1.1}px`,
        py: `${size * 0.55}px`,
        borderRadius: 999,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

/** Wordmark. Lowercase, tight, the way it is set everywhere else. */
export function Wordmark({ scheme, size = 34 }: { scheme: AdScheme; size?: number }) {
  const s = adSurfaces(scheme);
  return (
    <Typography
      component="span"
      sx={{
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "-0.03em",
        color: s.ink,
        lineHeight: 1,
      }}
    >
      aptiverse
    </Typography>
  );
}

/** Bottom rail: wordmark on the left, CTA or URL on the right. */
export function AdFooter({
  scheme,
  cta,
  url = "aptiverse.co.za",
  size = 32,
}: {
  scheme: AdScheme;
  cta?: string;
  url?: string;
  size?: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={3}
      sx={{ pt: `${size * 0.8}px`, borderTop: `2px solid ${s.hair}` }}
    >
      <Stack direction="row" spacing={2.5} alignItems="baseline" sx={{ minWidth: 0 }}>
        <Wordmark scheme={scheme} size={size * 1.05} />
        <Typography
          component="span"
          sx={{ fontSize: size * 0.8, color: s.muted, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}
        >
          {url}
        </Typography>
      </Stack>
      {cta && <AdCta size={size * 0.85}>{cta}</AdCta>}
    </Stack>
  );
}

/**
 * A product panel at ad scale. The website's MockAppFrame is built for a
 * 400-600px column; at 1080 wide it would either look like a screenshot of a
 * screenshot or need a transform scale that softens every edge. So the panel
 * is rebuilt here at native size, with the same anatomy: URL rail, badge,
 * hairline, elevated surface.
 */
/**
 * The three macOS window buttons, in the real system hues. They are the only
 * fixed colours in the kit that are not a brand token, and deliberately so:
 * they are window furniture, recognised as a shape rather than read as colour,
 * and repainting them citron would make the window stop looking like a window.
 * Off by default, because the nine-tile sheet and the existing paid units use
 * a neutral rail; the three-card unit opts in.
 */
const MAC_DOTS = ["#FF5F57", "#FEBC2E", "#28C840"];

export function AdPanel({
  scheme,
  url,
  badge,
  children,
  flex,
  traffic,
  dotSize = 12,
  urlSize = 21,
  railPad = 18,
  pad = 30,
}: {
  scheme: AdScheme;
  url: string;
  /**
   * The rail pill. A node rather than a string, because a live-state badge
   * wants a status dot in front of the words and a plain label cannot carry
   * one.
   */
  badge?: React.ReactNode;
  children: React.ReactNode;
  flex?: number;
  /** Paint the three rail dots in the macOS hues rather than as hairlines. */
  traffic?: boolean;
  dotSize?: number;
  /** Rail URL size. Drops where a badge shares the rail with a long path. */
  urlSize?: number;
  /**
   * Vertical padding on the URL rail, and the inset around the panel body.
   *
   * Both exist because chrome is the cheapest height on a crowded artboard.
   * A unit carrying three windows spends roughly 130px per window on rail
   * padding and body inset before any product is drawn, and on the 1080x1350
   * cut that is most of a row. Trimming chrome costs nothing a reader wants;
   * trimming the product inside it costs everything. Defaults are the
   * original values, so every unit that does not pass these is unchanged.
   */
  railPad?: number;
  pad?: number;
}) {
  const s = adSurfaces(scheme);
  // The panel always lifts off the artboard: paper on a light unit, a raised
  // graphite on a dark one, so the product reads as a separate object.
  const panelBg = adPanelBg(scheme);
  const railBg = scheme === "dark" ? "#181A1E" : "#F1F2EF";

  return (
    <Box
      sx={{
        flex,
        minHeight: 0,
        borderRadius: "20px",
        overflow: "hidden",
        border: `2px solid ${s.hair}`,
        bgcolor: panelBg,
        color: s.ink,
        display: "flex",
        flexDirection: "column",
        boxShadow: scheme === "dark" ? "none" : `0 32px 70px -30px ${alpha(GRAPHITE, 0.35)}`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          px: "26px",
          py: `${railPad}px`,
          bgcolor: railBg,
          borderBottom: `2px solid ${s.hair}`,
        }}
      >
        {/* Spacing stays at the original 8px for the default 12px dot, so the
            units that already ship are pixel-identical after this change. */}
        <Stack direction="row" spacing={dotSize === 12 ? 1 : `${dotSize * 0.7}px`} sx={{ flexShrink: 0 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                bgcolor: traffic ? MAC_DOTS[i] : s.hair,
              }}
            />
          ))}
        </Stack>
        <Typography
          sx={{
            fontSize: urlSize,
            color: s.muted,
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {url}
        </Typography>
        {badge && (
          <Box
            sx={{
              px: "14px",
              py: "6px",
              borderRadius: 999,
              border: `2px solid ${s.hair}`,
              fontSize: 19,
              fontWeight: 600,
              color: s.muted,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {badge}
          </Box>
        )}
      </Stack>
      <Box sx={{ p: `${pad}px`, flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

/** Outlined chip at ad scale. */
export function AdChip({
  children,
  scheme,
  icon,
  tone,
  size = 19,
}: {
  children: React.ReactNode;
  scheme: AdScheme;
  icon?: React.ReactNode;
  tone?: string;
  /** Label size. Drops where two chips have to share one line. */
  size?: number;
}) {
  const s = adSurfaces(scheme);
  const colour = tone ?? s.muted;
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        px: `${size * 0.74}px`,
        py: `${size * 0.37}px`,
        borderRadius: 999,
        border: `2px solid ${tone ? alpha(tone, 0.4) : s.hair}`,
        bgcolor: tone ? alpha(tone, 0.14) : "transparent",
        fontSize: size,
        fontWeight: 600,
        color: colour,
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      <span>{children}</span>
    </Stack>
  );
}

/**
 * Landscape units give the product panel roughly half the width a portrait
 * unit does. Rather than maintain a second set of type sizes for it, the
 * depiction is laid out at its native `designWidth` and scaled down. Captures
 * run at deviceScaleFactor 2, so a 0.6 scale still resolves above 1x and no
 * edge softens.
 */
export function ScaledDepiction({
  designWidth,
  width,
  children,
}: {
  designWidth: number;
  width: number;
  children: React.ReactNode;
}) {
  const scale = width / designWidth;
  // `zoom` rather than `transform: scale()` on purpose. A transform does not
  // affect layout, so the wrapper would keep reserving the child's full
  // unscaled height and the panel would be clipped by whatever sits below it.
  // zoom scales the box the layout engine sees, so the wrapper ends up the
  // right height with no measuring. Captures run in Chromium, which has
  // supported it forever and now implements the standardised version.
  return <Box sx={{ width: designWidth, zoom: scale }}>{children}</Box>;
}

/** Horizontal meter used in the product depictions. */
export function AdMeter({
  value,
  tone,
  scheme,
  height = 10,
}: {
  value: number;
  tone: string;
  scheme: AdScheme;
  height?: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Box sx={{ height, borderRadius: 999, bgcolor: s.hair, overflow: "hidden" }}>
      <Box sx={{ width: `${Math.min(100, value)}%`, height: "100%", bgcolor: tone }} />
    </Box>
  );
}
