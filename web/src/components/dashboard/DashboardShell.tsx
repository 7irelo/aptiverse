"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import { AppTopBar } from "./AppTopBar";
import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./sidebar-context";

// Routes that own the whole viewport below the top bar. The shell's page
// padding and 1480px measure are right for document-shaped pages, but they
// frame a conversation as a card floating on a background. A chat is a
// surface, not a document — it runs edge to edge.
const FULL_BLEED = new Set(["/dashboard/chatbot"]);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const fullBleed = FULL_BLEED.has(pathname ?? "");

  return (
    <SidebarProvider>
      <Box sx={{ display: "flex", alignItems: "stretch", minHeight: "100vh", bgcolor: "background.default" }}>
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
              width: "100%",
              ...(fullBleed
                ? { display: "flex", flexDirection: "column", minHeight: 0 }
                : {
                    px: { xs: 2, sm: 3, lg: 5 },
                    py: { xs: 3, md: 4 },
                    maxWidth: 1480,
                    mx: "auto",
                  }),
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </SidebarProvider>
  );
}
