import { RoleGuard } from "@/components/common/RoleGuard";
import { FeatureGuard } from "@/components/common/FeatureGuard";
import { SchoolPlanNotice } from "@/components/common/SchoolPlanNotice";

// Teacher area = role + plan gate. The teacher.dashboard feature is included
// in the School plan only: teachers exist because their school subscribed.
//
// The plan gate keeps its wall, but not the default one. The default points at
// /dashboard/billing to buy a personal student plan, which a teacher cannot
// buy and which would not unlock this area if they did. Staff access is a
// school subscription question, so the fallback says that instead.
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="teacher">
      <FeatureGuard feature="teacher.dashboard" fallback={<SchoolPlanNotice />}>
        {children}
      </FeatureGuard>
    </RoleGuard>
  );
}
