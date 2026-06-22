"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="rewards.redeem">{children}</FeatureGuard>;
}
