import { RoleGuard } from "@/components/common/RoleGuard";
import { FeatureGuard } from "@/components/common/FeatureGuard";
import { SchoolPlanNotice } from "@/components/common/SchoolPlanNotice";

// School-admin area = role + plan gate. school_admin.dashboard is a School
// plan feature, and like the teacher area it is the school that subscribes,
// never the individual, so the wall is the school notice and not the personal
// upgrade CTA.
export default function SchoolAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="school_admin">
      <FeatureGuard feature="school_admin.dashboard" fallback={<SchoolPlanNotice />}>
        {children}
      </FeatureGuard>
    </RoleGuard>
  );
}
