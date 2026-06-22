"use client";

import { FeatureGuard } from "@/components/common/FeatureGuard";

export default function PsychologistLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard feature="psychologist.read">{children}</FeatureGuard>;
}
