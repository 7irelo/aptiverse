"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="workspace">{children}</FeatureGuard>;
}
