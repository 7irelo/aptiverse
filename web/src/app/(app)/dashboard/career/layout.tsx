"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="career_navigator">{children}</FeatureGuard>;
}
