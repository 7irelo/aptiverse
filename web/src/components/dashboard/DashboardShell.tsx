"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AppTopBar } from "./AppTopBar";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppTopBar onMobileMenuClick={() => setMobileOpen(true)} />

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Sidebar open variant="permanent" onClose={() => setMobileOpen(false)} />
        <Sidebar open={mobileOpen} variant="temporary" onClose={() => setMobileOpen(false)} />

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
  );
}
