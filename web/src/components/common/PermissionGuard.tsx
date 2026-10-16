"use client";

import { type Permission } from "@/lib/rbac";
import { usePermission } from "@/lib/hooks/usePermission";
import { SignedInForbidden } from "./Forbidden";

export type PermissionGuardProps = {
  require: Permission | Permission[];
  any?: boolean; // any of the permissions instead of all
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

// Permissions are part of who you are, not part of what you have paid for, so
// the denial here is a 403 and not an upgrade wall. Callers gating a single
// control inside a page still pass fallback={null} and get nothing rendered,
// which is what you want for a button that should simply not be offered.
export function PermissionGuard({ require, any, children, fallback }: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermission();
  const allowed = Array.isArray(require)
    ? any
      ? canAny(require)
      : canAll(require)
    : can(require);

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <SignedInForbidden />;
}
