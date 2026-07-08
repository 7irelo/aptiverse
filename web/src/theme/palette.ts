import type { PaletteOptions } from "@mui/material/styles";

// Aptiverse brand palette - "Graphite & Citron".
//
// Graphite is the workhorse: near-black primary surfaces, controls and text on
// cool light neutrals. Citron is the one signature accent, used sparingly on
// the highest-emphasis action. Semantic colour zones stay disciplined:
//
//   primary (graphite)   academic UI + default controls everywhere
//   secondary (citron)   the sparing signature accent / hero CTA
//   wellbeing (magenta)  non-academic safe space (diary, mood, psychologist)
//   achievement (gold)   earned milestones ONLY (badges, streaks, rewards)
//
// Plus functional accents: clay for warm attention ("needs work" without
// weaponising red), rose for genuinely destructive admin actions. Neutrals are
// cool and faintly graphite-tinted.
//
// Ramp keys are kept from the previous palette (teal/lavender/amber/...) so
// existing brand.* references keep resolving; only the hues changed. `teal`
// now holds graphite, `lavender` now holds magenta.

export const brand = {
  // Primary academic pine. Grounded and trustworthy, distinct from the
  // bright-blue edtech default.
  teal: {
    50: "#F2F3F1",
    100: "#E3E5E1",
    200: "#C7CAC6",
    300: "#A9ADA9",
    400: "#70746E",
    500: "#4B4E4A",
    600: "#1B1D22",
    700: "#141519",
    800: "#0E0F12",
    900: "#08090B",
  },

  // Sage wellbeing zone. Used in diary, wellbeing, psychologist, mood
  // check-ins. Signals visually that this is not graded, not ranked.
  lavender: {
    50: "#FCEAF2",
    100: "#F8CDE0",
    200: "#F2A1C4",
    300: "#EA6BA6",
    400: "#E23E8A",
    500: "#D42078",
    600: "#AE1460",
    700: "#7E0E45",
    800: "#4E0A2B",
    900: "#2A0618",
  },

  // Gold achievement. Earned milestones only, never decorative. The logo
  // apex is gold for the same reason.
  amber: {
    50: "#FBF3E1",
    100: "#F4E1B4",
    200: "#EBCB80",
    300: "#E0B255",
    400: "#CF9A38",
    500: "#C0872B",
    600: "#9E6D1E",
    700: "#765014",
    800: "#4E360D",
    900: "#291C05",
  },

  // Clay warm attention. Replaces "danger red" for performance feedback.
  // "65% needs work" reads as supportive, not punitive.
  terracotta: {
    300: "#E0A08D",
    400: "#D07A62",
    500: "#C25A44",
    600: "#9E4433",
  },

  // Rose reserved for genuinely destructive admin actions only.
  rose: {
    400: "#A45F66",
    500: "#8B4A52",
    600: "#6E3942",
  },

  // Forest "growing well" signals on subject performance.
  forest: {
    400: "#5BAD7E",
    500: "#3D9762",
    600: "#2C7C4E",
  },

  // Citron - the one signature accent. Bright and used sparingly on the
  // highest-emphasis action (hero CTA, key highlight). Always paired with
  // graphite ink for text so it never relies on the light lime for contrast.
  citron: {
    50: "#F8FCE8",
    100: "#EEF8C2",
    200: "#E0F193",
    300: "#CFEA63",
    400: "#C3E84F",
    500: "#AAD22F",
    600: "#87A81F",
    700: "#617815",
  },

  // Cool neutrals, faintly graphite-tinted.
  gray: {
    50: "#F6F7F5",
    100: "#EDEEEB",
    200: "#E4E6E1",
    300: "#CDCFCA",
    400: "#9A9C98",
    500: "#6B6E73",
    600: "#494B4E",
    700: "#303235",
    800: "#202124",
    900: "#131417",
  },
};

// Graphite near-black for primary text.
const inkLight = "#1B1D22";

export const lightPalette: PaletteOptions = {
  mode: "light",
  primary: {
    light: brand.teal[400],
    main: brand.teal[600], // #0F6E5C
    dark: brand.teal[800],
    contrastText: "#FFFFFF",
  },
  secondary: {
    light: brand.citron[300],
    main: brand.citron[400], // #C3E84F - signature accent, used sparingly
    dark: brand.citron[600],
    contrastText: "#1B1D22",
  },
  success: { main: brand.forest[500], light: brand.forest[400], dark: brand.forest[600] },
  warning: { main: brand.terracotta[400], light: brand.terracotta[300], dark: brand.terracotta[600] },
  info: { main: "#2C7DCB", light: "#5BA3E5", dark: "#1A5994" },
  error: { main: brand.rose[500], light: brand.rose[400], dark: brand.rose[600] },
  background: {
    default: brand.gray[50], // #FBFAF6
    paper: "#FFFFFF",
  },
  text: {
    primary: inkLight,
    secondary: brand.gray[500],
    disabled: brand.gray[300],
  },
  divider: "rgba(27, 43, 39, 0.10)",
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
    light: brand.teal[50],
    main: brand.teal[100], // near-white graphite - crisp accents on near-black
    dark: brand.teal[300],
    contrastText: "#0E0F12",
  },
  secondary: {
    light: brand.citron[300],
    main: brand.citron[400], // citron pops on graphite; used sparingly
    dark: brand.citron[500],
    contrastText: "#14160A",
  },
  success: { main: brand.forest[400], light: "#7BCB9D", dark: brand.forest[500] },
  warning: { main: brand.terracotta[400], light: brand.terracotta[300], dark: brand.terracotta[600] },
  info: { main: "#5BA3E5", light: "#8BC0EE", dark: "#2C7DCB" },
  error: { main: brand.rose[400], light: "#C18E94", dark: brand.rose[500] },
  background: {
    default: "#050506", // near-pure black with a faint graphite cast
    paper: "#0F1012", // cards lift just enough off the canvas to read
  },
  text: {
    primary: "#E9EAE6",
    secondary: "#9A9C98",
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

// Semantic tokens outside MUI's default palette shape, exposed via module
// augmentation in theme/index.ts so theme.palette.wellbeing and
// theme.palette.achievement work like first-class colours.

export const wellbeingLight = {
  light: brand.lavender[300],
  main: brand.lavender[500],
  dark: brand.lavender[700],
  contrastText: "#FFFFFF",
};

export const wellbeingDark = {
  light: brand.lavender[200],
  main: brand.lavender[300],
  dark: brand.lavender[600],
  contrastText: "#2A0618",
};

export const achievementLight = {
  light: brand.amber[300],
  main: brand.amber[500],
  dark: brand.amber[700],
  contrastText: "#2A1C05",
};

export const achievementDark = {
  light: brand.amber[300],
  main: brand.amber[400],
  dark: brand.amber[600],
  contrastText: "#241804",
};

// Brand surface — a graphite panel for hero cards / brand badges that must stay
// dark with light content in BOTH modes. Distinct from `primary.main`, which
// flips to near-white in dark mode (great for accents, wrong for a filled
// surface). Dark mode uses a slightly elevated graphite so it lifts off the
// near-black canvas instead of vanishing.
export const brandSurfaceLight = {
  light: "#2A2D33",
  main: "#1B1D22",
  dark: "#141519",
  contrastText: "#F2F3F1",
};

export const brandSurfaceDark = {
  light: "#31353D",
  main: "#262A31",
  dark: "#1B1D22",
  contrastText: "#F2F3F1",
};
