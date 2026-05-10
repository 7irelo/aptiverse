"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ColorModeProvider } from "./ColorModeProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { SnackbarProvider } from "./SnackbarProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ColorModeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <SnackbarProvider>
            <AuthProvider>
              <QueryProvider>{children}</QueryProvider>
            </AuthProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ColorModeProvider>
    </AppRouterCacheProvider>
  );
}
