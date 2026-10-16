"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTheme, type ColorMode } from "@/theme";

// Run the OS-mode correction in a layout effect on the client so it commits
// before the browser's first post-hydration paint, leaving no light frame.
// Falls back to useEffect on the server, where layout effects do not run, to
// avoid React's "useLayoutEffect does nothing on the server" warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  // Server and first client render both start "light" so hydration matches the
  // SSR markup. The layout effect below corrects to the OS preference before
  // paint, and globals.css already paints the base surface from the CSS media
  // query, so there is no light flash before the correct theme lands.
  const [resolvedMode, setResolvedMode] = useState<ColorMode>("light");

  useIsomorphicLayoutEffect(() => {
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
