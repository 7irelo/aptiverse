"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="courses.enrol">{children}</FeatureGuard>;
}
