import type { PaletteOptions } from "@mui/material/styles";

// Aptiverse brand palette.
//
// Three semantic colour zones, applied with discipline:
//
//   primary (teal)        — academic UI everywhere
//   wellbeing (lavender)  — non-academic safe space (diary, mood, psychologist)
//   achievement (amber)   — earned milestones ONLY (badges, streaks, rewards)
//
// Plus two functional accents — terracotta for warm attention ("needs work"
// without weaponising red), rose for genuine destructive admin actions.
// Neutrals are warm-grey, slightly olive — easier on long study sessions
// than clinical cool greys.

export const brand = {
  // Primary — academic UI. Keeps growth/empowerment positioning, distinct
  // from the bright-blue edtech default.
  teal: {
    50: "#EAF4F3",
    100: "#CFE5E2",
    200: "#A6D0CB",
    300: "#74B5AE",
    400: "#3F9991",
    500: "#1F8079",
    600: "#0F6963",
    700: "#08534F",
    800: "#053D3A",
    900: "#02272A",
  },

  // Lavender — non-academic safe-space zone. Used in diary, wellbeing,
  // psychologist, mood check-ins. Tells the student visually: this isn't
  // graded, this isn't ranked.
  lavender: {
    50: "#F1EFF6",
    100: "#DCD6E8",
    200: "#BFB5D2",
    300: "#9C8FBA",
    400: "#7C6BA4",
    500: "#6B5B95",
    600: "#574A7C",
    700: "#443A60",
    800: "#322B47",
    900: "#1F1A2C",
  },

  // Amber — sacred. Earned milestones only. Never decorative. Apex node
  // of the logo is also amber for the same reason.
  amber: {
    50: "#FBF3E0",
    100: "#F5E1B0",
    200: "#EFCC79",
    300: "#EBB957",
    400: "#E8A33D",
    500: "#D08A24",
    600: "#A86E1B",
    700: "#7C5113",
    800: "#52360C",
    900: "#291B05",
  },

  // Terracotta — warm attention. Replaces "danger red" for performance
  // feedback. "65% — needs work" reads as supportive, not punitive.
  terracotta: {
    300: "#E1A179",
    400: "#C97A3D",
    500: "#A8632F",
    600: "#82471F",
  },

  // Rose — reserved for genuinely destructive admin actions only.
  rose: {
    400: "#A45F66",
    500: "#8B4A52",
    600: "#6E3942",
  },

  // Forest — "growing well" signals on subject performance.
  forest: {
    400: "#5BAD7E",
    500: "#3D9762",
    600: "#2C7C4E",
  },

  // Warm gray — slightly olive, less clinical than cool greys for long
  // reading sessions.
  gray: {
    50: "#F7F6F3",
    100: "#EFEDE7",
    200: "#E2DFD7",
    300: "#CFCAC0",
    400: "#9F9C92",
    500: "#5F5E58",
    600: "#48483F",
    700: "#33322C",
    800: "#22221E",
    900: "#121210",
  },
};

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    light: brand.teal[400],
    main: brand.teal[700],
    dark: brand.teal[800],
    contrastText: "#FFFFFF",
  },
  secondary: {
    light: brand.terracotta[300],
    main: brand.terracotta[400],
    dark: brand.terracotta[600],
    contrastText: "#FFFFFF",
  },
  success: { main: brand.forest[500], light: brand.forest[400], dark: brand.forest[600] },
  warning: { main: brand.terracotta[400], light: brand.terracotta[300], dark: brand.terracotta[600] },
  info: { main: "#2C7DCB", light: "#5BA3E5", dark: "#1A5994" },
  // Pure red is reserved for genuinely destructive admin actions only.
  error: { main: brand.rose[500], light: brand.rose[400], dark: brand.rose[600] },
  background: {
    default: brand.gray[50],
    paper: "#FFFFFF",
  },
  text: {
    primary: brand.gray[800],
    secondary: brand.gray[500],
    disabled: brand.gray[300],
  },
  divider: "rgba(34, 34, 30, 0.10)",
  grey: {
    50: brand.gray[50],
    100: brand.gray[100],
    200: brand.gray[200],
    300: brand.gray[300],
    400: brand.gray[400],
    500: brand.gray[500],
    600: brand.gray[600],
    700: brand.gray[700],
    800: brand.gray[800],
    900: brand.gray[900],
  },
};

export const darkPalette: PaletteOptions = {
  mode: "dark",
  primary: {
    light: brand.teal[300],
    main: brand.teal[400],
    dark: brand.teal[600],
    contrastText: "#001613",
  },
  secondary: {
    light: brand.terracotta[300],
    main: brand.terracotta[400],
    dark: brand.terracotta[600],
    contrastText: "#FFFFFF",
  },
  success: { main: brand.forest[400], light: "#7BCB9D", dark: brand.forest[500] },
  warning: { main: brand.terracotta[400], light: brand.terracotta[300], dark: brand.terracotta[600] },
  info: { main: "#5BA3E5", light: "#8BC0EE", dark: "#2C7DCB" },
  error: { main: brand.rose[400], light: "#C18E94", dark: brand.rose[500] },
  background: {
    default: "#0F0E0C",
    paper: "#1A1916",
  },
  text: {
    primary: "#EAE7DF",
    secondary: "#9E9C92",
    disabled: brand.gray[500],
  },
  divider: "rgba(255, 255, 255, 0.08)",
  grey: {
    50: brand.gray[900],
    100: brand.gray[800],
    200: brand.gray[700],
    300: brand.gray[600],
    400: brand.gray[500],
    500: brand.gray[400],
    600: brand.gray[300],
    700: brand.gray[200],
    800: brand.gray[100],
    900: brand.gray[50],
  },
};

// Semantic tokens that aren't in MUI's default palette shape. Exposed
// via module augmentation in theme/index.ts so theme.palette.wellbeing /
// theme.palette.achievement work like first-class colours.

export const wellbeingLight = {
  light: brand.lavender[300],
  main: brand.lavender[500],
  dark: brand.lavender[700],
  contrastText: "#FFFFFF",
};

export const wellbeingDark = {
  light: brand.lavender[300],
  main: brand.lavender[400],
  dark: brand.lavender[600],
  contrastText: "#FFFFFF",
};

export const achievementLight = {
  light: brand.amber[300],
  main: brand.amber[400],
  dark: brand.amber[600],
  contrastText: "#22221E",
};

export const achievementDark = {
  light: brand.amber[300],
  main: brand.amber[400],
  dark: brand.amber[600],
  contrastText: "#22221E",
};
