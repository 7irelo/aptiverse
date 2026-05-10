"use client";

import { type Permission } from "@/lib/rbac";
import { usePermission } from "@/lib/hooks/usePermission";
import { EmptyState } from "./EmptyState";
import LockIcon from "@mui/icons-material/LockOutlined";

export type PermissionGuardProps = {
  require: Permission | Permission[];
  any?: boolean; // any of the permissions instead of all
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({ require, any, children, fallback }: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermission();
  const allowed = Array.isArray(require)
    ? any
      ? canAny(require)
      : canAll(require)
    : can(require);

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return (
    <EmptyState
      icon={<LockIcon />}
      title="You don't have access to this area"
      description="If you believe this is a mistake, contact your school admin or our support team."
    />
  );
}
