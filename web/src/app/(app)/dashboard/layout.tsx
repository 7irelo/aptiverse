"use client";

import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/common/RoleGuard";

// Student dashboard area. Admins / super_admins pass through too via
// RoleGuard's admin bypass (lets them shadow any role for support).
//
// Study groups are shared: tutors join them alongside students, so the one
// /dashboard/study-groups route also admits tutors. Every other /dashboard/*
// route stays student-only. Scoping the allowance by pathname keeps the
// carve-out to that single route without touching the study-groups pages.
export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudyGroups = pathname?.startsWith("/dashboard/study-groups") ?? false;
  return (
    <RoleGuard allow={isStudyGroups ? ["student", "tutor"] : "student"}>{children}</RoleGuard>
  );
}
