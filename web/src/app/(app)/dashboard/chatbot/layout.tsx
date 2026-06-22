"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

// AI tutor is a Student-plan feature. Free-tier users see an upgrade
// card when they navigate here.
export default function ChatbotLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="ai_tutor">{children}</FeatureGuard>;
}
