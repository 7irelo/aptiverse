"use client";

import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/fetcher";

// Response shape of POST /api/auth/refresh-token (TokenDto<UserDto>).
type RefreshResponse = {
  token: string;
  expires: string;
  message?: string;
  user: {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    role?: string;
    permissions?: string[];
    features?: string[];
    planCode?: string;
  };
};

// Pulls a fresh JWT (with current features + planCode) from the API and
// flows it into the NextAuth session — both the JWT cookie and the
// in-memory session state — without forcing a re-login. Invalidates the
// /api/entitlements/me query so any caller using useMyEntitlements()
// also re-reads.
//
// Call this after any action that may have changed the user's
// entitlements: an upgrade flow, an admin granting a comp subscription,
// a family member being added to a parent's plan, etc.
//
// Usage:
//   const refresh = useRefreshSession();
//   const handleUpgrade = async () => {
//     await doUpgrade();
//     await refresh();
//   };
export function useRefreshSession() {
  const { update } = useSession();
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const res = await apiClient.post<RefreshResponse>("/api/auth/refresh-token");

    // update() runs the `jwt` callback in lib/auth.ts with
    // trigger === "update", which copies these into the NextAuth token.
    await update({
      aptiverseToken: res.token,
      aptiverseUser: res.user,
    });

    // Bust the live entitlements cache so the next read picks up the
    // new plan / features instantly. Other queries that key off plan
    // (e.g. usePlans) are intentionally NOT invalidated — they're catalog
    // reads, not user-scoped.
    queryClient.invalidateQueries({ queryKey: ["entitlements", "me"] });
  }, [update, queryClient]);
}
