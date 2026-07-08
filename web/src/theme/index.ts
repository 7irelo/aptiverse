import { createTheme, responsiveFontSizes, type Theme } from "@mui/material/styles";
import {
  darkPalette,
  lightPalette,
  wellbeingLight,
  wellbeingDark,
  achievementLight,
  achievementDark,
  brandSurfaceLight,
  brandSurfaceDark,
} from "./palette";
import { typography } from "./typography";
import { componentOverrides } from "./components";

export type ColorMode = "light" | "dark";

const baseShape = { borderRadius: 10 };

// Module augmentation — adds `wellbeing` and `achievement` to MUI's
// palette type so theme.palette.wellbeing.main works like a first-class
// colour (typed, autocompleted, themed by mode).
declare module "@mui/material/styles" {
  interface Palette {
    wellbeing: Palette["primary"];
    achievement: Palette["primary"];
    brandSurface: Palette["primary"];
  }
  interface PaletteOptions {
    wellbeing?: PaletteOptions["primary"];
    achievement?: PaletteOptions["primary"];
    brandSurface?: PaletteOptions["primary"];
  }
}

export function buildTheme(mode: ColorMode): Theme {
  const isDark = mode === "dark";
  const base = createTheme({
    palette: {
      ...(isDark ? darkPalette : lightPalette),
      wellbeing: isDark ? wellbeingDark : wellbeingLight,
      achievement: isDark ? achievementDark : achievementLight,
      brandSurface: isDark ? brandSurfaceDark : brandSurfaceLight,
    },
    typography,
    shape: baseShape,
    spacing: 8,
  });

  const themed = createTheme(base, {
    components: componentOverrides(base),
  });

  return responsiveFontSizes(themed);
}

export { lightPalette, darkPalette } from "./palette";
