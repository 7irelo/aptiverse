import { RoleGuard } from "@/components/common/RoleGuard";

// Student dashboard area. Admins / super_admins pass through too via
// RoleGuard's admin bypass (lets them shadow any role for support).
export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allow="student">{children}</RoleGuard>;
}
