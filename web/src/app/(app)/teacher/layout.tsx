import { RoleGuard } from "@/components/common/RoleGuard";
import { FeatureGuard } from "@/components/common/FeatureGuard";

// Teacher area = role + plan gate. The teacher.dashboard feature is
// included in the School plan only — teachers exist because their
// school subscribed; without that subscription they see the upgrade
// card (the school has to onboard via sales).
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="teacher">
      <FeatureGuard feature="teacher.dashboard">{children}</FeatureGuard>
    </RoleGuard>
  );
}
