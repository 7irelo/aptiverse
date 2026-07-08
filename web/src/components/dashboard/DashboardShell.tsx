"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AppTopBar } from "./AppTopBar";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./sidebar-context";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarProvider>
      <Box sx={{ display: "flex", alignItems: "flex-start", minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Full-height rail owns the brand (top) — Euphoria layout. */}
        <Sidebar open variant="permanent" onClose={() => setMobileOpen(false)} />
        <Sidebar open={mobileOpen} variant="temporary" onClose={() => setMobileOpen(false)} />

        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppTopBar onMobileMenuClick={() => setMobileOpen(true)} />

          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 2, sm: 3, lg: 5 },
              py: { xs: 3, md: 4 },
              maxWidth: 1480,
              width: "100%",
              mx: "auto",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </SidebarProvider>
  );
}
