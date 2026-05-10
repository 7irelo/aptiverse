"use client";

import { SnackbarProvider as NotistackProvider } from "notistack";

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  return (
    <NotistackProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      autoHideDuration={4000}
    >
      {children}
    </NotistackProvider>
  );
}
