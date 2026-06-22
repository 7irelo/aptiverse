"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { buildTheme, type ColorMode } from "@/theme";

const STORAGE_KEY = "aptiverse:color-mode";

type ColorModeContextValue = {
  mode: ColorMode;
  resolvedMode: ColorMode;
  setMode: (mode: ColorMode | "system") => void;
  toggle: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

function getSystemMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStored(): ColorMode | "system" {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark" || v === "system") return v;
  return "system";
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ColorMode | "system">("system");
  const [systemMode, setSystemMode] = useState<ColorMode>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreference(readStored());
    setSystemMode(getSystemMode());
    setHydrated(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedMode: ColorMode = preference === "system" ? systemMode : preference;

  const setMode = useCallback((m: ColorMode | "system") => {
    setPreference(m);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggle = useCallback(() => {
    setMode(resolvedMode === "dark" ? "light" : "dark");
  }, [resolvedMode, setMode]);

  const theme = useMemo(() => buildTheme(resolvedMode), [resolvedMode]);

  const value = useMemo(
    () => ({
      mode: preference === "system" ? systemMode : preference,
      resolvedMode,
      setMode,
      toggle,
    }),
    [preference, systemMode, resolvedMode, setMode, toggle],
  );

  // Avoid hydration flash: until we've read storage, render with light theme baseline.
  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ visibility: hydrated ? "visible" : "visible" }}>{children}</div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) throw new Error("useColorMode must be used within ColorModeProvider");
  return ctx;
}
