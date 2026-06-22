import { RoleGuard } from "@/components/common/RoleGuard";
import { FeatureGuard } from "@/components/common/FeatureGuard";

// Parent area = role-gated AND plan-gated. A Parent without a Family
// subscription sees an upgrade prompt instead of the dashboard.
export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="parent">
      <FeatureGuard feature="parent.dashboard">{children}</FeatureGuard>
    </RoleGuard>
  );
}
