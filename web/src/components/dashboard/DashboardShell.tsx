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
//
// These routes also pin the shell to exactly one viewport and scroll inside
// themselves, so the page itself never scrolls. Pinning here rather than
// letting the route work out its own height is what keeps it honest: the top
// bar is 64/68px of content plus a 1px border, and a route doing
// `calc(100dvh - 68px)` overflowed the document by that border and earned a
// full-height page scrollbar for one stray pixel.
const FULL_BLEED = new Set(["/dashboard/chatbot"]);

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const fullBleed = FULL_BLEED.has(pathname ?? "");

  return (
    <SidebarProvider>
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          bgcolor: "background.default",
          // 100dvh, not 100vh. On mobile Safari and Chrome Android 100vh is
          // the viewport with the browser chrome retracted, so a plain
          // `minHeight: 100vh` page is always ~110px taller than what the
          // student can see and always has a phantom scrollbar.
          ...(fullBleed ? { height: "100dvh", overflow: "hidden" } : { minHeight: "100dvh" }),
        }}
      >
        {/* Full-height rail owns the brand (top) — Euphoria layout. */}
        <Sidebar open variant="permanent" onClose={() => setMobileOpen(false)} />
        <Sidebar open={mobileOpen} variant="temporary" onClose={() => setMobileOpen(false)} />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            ...(fullBleed ? { height: "100dvh", minHeight: 0 } : { minHeight: "100dvh" }),
          }}
        >
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
                    // Gutters are the designed 16/24/40 unless a safe-area
                    // inset is larger. Landscape on a notched phone puts the
                    // notch on a side edge, and viewport-fit=cover (set in the
                    // root layout) means the page paints under it, so the
                    // gutter has to pay it back or text runs under the cutout.
                    pl: {
                      xs: "max(env(safe-area-inset-left), 16px)",
                      sm: "max(env(safe-area-inset-left), 24px)",
                      lg: "max(env(safe-area-inset-left), 40px)",
                    },
                    pr: {
                      xs: "max(env(safe-area-inset-right), 16px)",
                      sm: "max(env(safe-area-inset-right), 24px)",
                      lg: "max(env(safe-area-inset-right), 40px)",
                    },
                    pt: { xs: 3, md: 4 },
                    // The gesture bar always eats the bottom edge. Without
                    // this the last card and any page-level primary action sit
                    // under the home indicator.
                    pb: {
                      xs: "calc(env(safe-area-inset-bottom) + 24px)",
                      md: "calc(env(safe-area-inset-bottom) + 32px)",
                    },
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
