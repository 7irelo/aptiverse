import type { ReactNode } from "react";

import { SiteHeader } from "@/components/shell/site-header";
import { Toaster } from "@/components/ui/sonner";

/**
 * Authenticated area. A Server Component: Phase 2 reads the session here
 * (src/lib/auth) and builds role-based navigation on the server.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Toaster position="top-center" />
    </>
  );
}
