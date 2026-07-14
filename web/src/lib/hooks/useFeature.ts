"use client";

import { useSession } from "next-auth/react";
import { type FeatureKey, type PlanCode } from "@/lib/features";
import { useMyEntitlements } from "@/lib/api/queries";

// Two layers of truth, in priority order:
//
//   1. Live entitlements fetched via GET /api/entitlements/me
//      (useMyEntitlements). Always current — picks up plan changes
//      without a re-login.
//
//   2. NextAuth session, populated from the login response. Fast on
//      first paint and SSR-safe; goes stale the moment a plan changes
//      until the user logs back in.
//
// The hooks below prefer (1) when it's loaded and fall through to (2)
// for the first-paint case. The fetch is deduplicated by TanStack
// Query across every hook call, so no n+1 trips.

const ALL_PLAN_CODES: readonly PlanCode[] = [
  "free",
  "student.pro",
  "student.max",
  "parent",
  "parent.2",
  "parent.3",
  "parent.4",
  "tutor.free",
  "tutor.pro",
  "tutor.premium",
  "school",
];

function liveFeatures(features: string[] | undefined): string[] | null {
  return features ? features : null;
}

function sessionFeatures(): string[] {
  // useSession is called inside the consumer hooks below — this helper
  // assumes the caller already has session data and just extracts the
  // shape we care about.
  return [];
}
void sessionFeatures; // referenced for clarity; not used directly.

export function useFeature(feature: FeatureKey): boolean {
  const { data: session } = useSession();
  const live = useMyEntitlements();

  const features =
    liveFeatures(live.data?.features) ??
    (session?.user as { features?: string[] } | undefined)?.features ??
    [];

  return features.includes(feature);
}

export function useFeatures(): {
  features: ReadonlySet<FeatureKey>;
  has: (f: FeatureKey) => boolean;
  hasAny: (fs: FeatureKey[]) => boolean;
  hasAll: (fs: FeatureKey[]) => boolean;
  // False until live entitlements have resolved (success or error). Gates use
  // this to avoid flashing a denial while the real plan is still loading and
  // only the (possibly stale) session features are known.
  ready: boolean;
} {
  const { data: session } = useSession();
  const live = useMyEntitlements();

  const list =
    liveFeatures(live.data?.features) ??
    (session?.user as { features?: string[] } | undefined)?.features ??
    [];

  const set = new Set(list as FeatureKey[]);
  return {
    features: set,
    has: (f) => set.has(f),
    hasAny: (fs) => fs.some((f) => set.has(f)),
    hasAll: (fs) => fs.every((f) => set.has(f)),
    ready: !live.isLoading,
  };
}

export function usePlanCode(): PlanCode {
  const { data: session } = useSession();
  const live = useMyEntitlements();

  const p =
    live.data?.primaryPlanCode ??
    (session?.user as { planCode?: string } | undefined)?.planCode;

  return (ALL_PLAN_CODES as readonly string[]).includes(p ?? "")
    ? (p as PlanCode)
    : "free";
}
