"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

export default function StudyGroupsLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="study_groups">{children}</FeatureGuard>;
}
