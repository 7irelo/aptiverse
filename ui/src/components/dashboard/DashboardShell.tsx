"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import { AppTopBar } from "./AppTopBar";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar open variant="permanent" onClose={() => setMobileOpen(false)} />
      <Sidebar open={mobileOpen} variant="temporary" onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { xs: 0 },
        }}
      >
        <AppTopBar onMobileMenuClick={() => setMobileOpen(true)} />
        <Box
          sx={{
            flex: 1,
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
