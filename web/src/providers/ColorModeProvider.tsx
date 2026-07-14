"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTheme, type ColorMode } from "@/theme";

// Colour scheme follows the operating system only. There is no in-app
// light/dark switch by design: the theme mirrors the user's system
// preference and updates live when they change it.

type ColorModeContextValue = { resolvedMode: ColorMode };

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

function getSystemMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [resolvedMode, setResolvedMode] = useState<ColorMode>("light");

  useEffect(() => {
    setResolvedMode(getSystemMode());

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setResolvedMode(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // `buildTheme` is intentionally in the deps. In production it's a stable
  // module import, so the theme still only rebuilds when the colour mode
  // changes. In development, editing the theme files makes Fast Refresh hand
  // us a new `buildTheme` identity, which re-runs this memo so theme edits
  // apply live without a hard refresh.
  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode, buildTheme]);
  const value = useMemo(() => ({ resolvedMode }), [resolvedMode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
}
