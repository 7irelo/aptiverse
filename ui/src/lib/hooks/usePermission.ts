"use client";

import { useRoleStore } from "@/providers/RoleProvider";
import { can, canAll, canAny, type Permission, type RbacRole } from "@/lib/rbac";

export function usePermission() {
  const role = useRoleStore((s) => s.role) as RbacRole;
  return {
    role,
    can: (p: Permission) => can(role, p),
    canAny: (perms: Permission[]) => canAny(role, perms),
    canAll: (perms: Permission[]) => canAll(role, perms),
  };
}
