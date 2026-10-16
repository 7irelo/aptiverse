"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/fetcher";

export type QuotaSnapshot = {
  quotaKey: string;
  used: number;
  limit: number;       // -1 = unlimited
  remaining: number;   // -1 = unlimited
  unlimited: boolean;
  periodStart: string;
};

export type UsageSummary = {
  aiQuick: QuotaSnapshot;
  aiDeep: QuotaSnapshot;
  practiceGenerate: QuotaSnapshot;
};

// Current-month consumption across every metered quota. Powers the
// billing-page allowance card and the help-bot drawer's quota meter.
//
// staleTime: 30s. Usage doesn't change unless the user makes a quota'd call
// (help bot, deep AI session, generating practice). 30s of cache is enough to
// keep the meter snappy without showing stale numbers.
export function useUsage(enabled = true) {
  return useQuery<UsageSummary>({
    queryKey: ["entitlements", "me", "usage"],
    queryFn: () => apiClient.get<UsageSummary>("/api/entitlements/me/usage"),
    enabled,
    staleTime: 30_000,
  });
}
