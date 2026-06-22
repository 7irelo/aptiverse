import type { TypographyVariantsOptions } from "@mui/material/styles";

// Match Euphoria.v4's commonTheme: Frygia first, then Roboto, then the
// usual system stack. Frygia is loaded via a <link> to Euphoria's
// CloudFront stylesheet in app/layout.tsx (see TODO there about
// replacing before any public launch — licensing).
// next/font/google's Roboto is bundled at /_next/static/media so it's
// always available as a second-choice fallback if Frygia fails.
const fontFamily =
  '"Frygia", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

export const typography: TypographyVariantsOptions = {
  fontFamily,
  htmlFontSize: 16,
  fontSize: 14,
  fontWeightLight: 400,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontFamily,
    fontWeight: 600,
    fontSize: "clamp(2.25rem, 3.6vw, 3.25rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.025em",
  },
  h2: {
    fontFamily,
    fontWeight: 600,
    fontSize: "clamp(1.75rem, 2.6vw, 2.25rem)",
    lineHeight: 1.15,
    letterSpacing: "-0.022em",
  },
  h3: {
    fontFamily,
    fontWeight: 600,
    fontSize: "clamp(1.375rem, 2vw, 1.75rem)",
    lineHeight: 1.22,
    letterSpacing: "-0.018em",
  },
  h4: {
    fontFamily,
    fontWeight: 600,
    fontSize: "1.25rem",
    lineHeight: 1.3,
    letterSpacing: "-0.014em",
  },
  h5: {
    fontFamily,
    fontWeight: 600,
    fontSize: "1.0625rem",
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  h6: {
    fontFamily,
    fontWeight: 600,
    fontSize: "0.9375rem",
    lineHeight: 1.4,
    letterSpacing: "-0.005em",
  },
  subtitle1: { fontWeight: 500, fontSize: "0.9375rem", lineHeight: 1.5 },
  subtitle2: { fontWeight: 500, fontSize: "0.8125rem", lineHeight: 1.5 },
  body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
  body2: { fontSize: "0.8125rem", lineHeight: 1.6 },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.45,
    letterSpacing: "0",
  },
  overline: {
    fontSize: "0.6875rem",
    fontWeight: 600,
    lineHeight: 1.5,
    // 0.08em is what most call-sites had inlined as `sx={{ letterSpacing: "0.08em" }}`.
    // Centralising here so surfaces don't have to override.
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  button: {
    fontWeight: 500,
    letterSpacing: "0",
    textTransform: "none",
  },
};
