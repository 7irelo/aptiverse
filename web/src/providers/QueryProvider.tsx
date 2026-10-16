"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // A screen navigated back to within this window renders from cache
            // instead of refiring its queries. Keeps back-navigation instant on
            // slow mobile connections. Hooks that must stay live (pollers, the
            // notification badge, entitlements) override this per-hook.
            staleTime: 30_000,
            // Hold unmounted query data ten minutes before it's garbage
            // collected, so returning to a route shows cached data at once and
            // only revalidates in the background. Memory-only; does not affect
            // freshness (staleTime governs when a refetch fires).
            gcTime: 10 * 60_000,
            // This app used to refetch every query on tab focus, spamming the
            // API when a student switched back to the tab. Off by default; the
            // few reads that genuinely need it re-enable it per-hook.
            refetchOnWindowFocus: false,
            // Fail fast against a dead or unhappy API: never retry a 4xx (the
            // response won't change on a repeat, so a retry just delays the
            // error and doubles load), and retry anything else (network blips,
            // 5xx) only once.
            retry: (failureCount, error) => {
              const status = (error as { status?: number } | null)?.status;
              if (typeof status === "number" && status >= 400 && status < 500) return false;
              return failureCount < 1;
            },
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
