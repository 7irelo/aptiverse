"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MotionConfig } from "framer-motion";
import { ColorModeProvider } from "./ColorModeProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { SnackbarProvider } from "./SnackbarProvider";
import { SessionRoleSync } from "./SessionRoleSync";
import { AnalyticsProvider } from "./AnalyticsProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ColorModeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider>
            <AuthProvider>
              <SessionRoleSync />
              {/* reducedMotion="user" makes framer-motion honour
                  prefers-reduced-motion natively. The CSS rule in
                  theme/components.ts only catches CSS transitions;
                  framer's RAF-driven JS tweens slip through it
                  unless this provider is in place. */}
              <MotionConfig reducedMotion="user">
                <QueryProvider>{children}</QueryProvider>
              </MotionConfig>
              {/* Last, and outside QueryProvider, because nothing about the
                  app should be able to block the consent gate from rendering.
                  It paints a bottom sheet and mounts no tag until a decision
                  has been read from storage. */}
              <AnalyticsProvider />
            </AuthProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ColorModeProvider>
    </AppRouterCacheProvider>
  );
}
