"use client";

import Box from "@mui/material/Box";
import { TopNav } from "@/components/marketing/TopNav";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    // 100dvh: on mobile 100vh measures the viewport with the browser chrome
    // retracted, so the page is always taller than what is actually visible.
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <TopNav />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
