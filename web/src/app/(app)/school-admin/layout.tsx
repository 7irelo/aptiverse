import { RoleGuard } from "@/components/common/RoleGuard";
import { FeatureGuard } from "@/components/common/FeatureGuard";

// School-admin area = role + plan gate. school_admin.dashboard is a
// School-plan feature.
export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="school_admin">
      <FeatureGuard feature="school_admin.dashboard">{children}</FeatureGuard>
    </RoleGuard>
  );
}
