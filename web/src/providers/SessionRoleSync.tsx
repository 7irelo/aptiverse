"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRoleStore, type Role } from "./RoleProvider";

const VALID_ROLES: Role[] = ["student", "parent", "teacher", "school_admin", "tutor", "admin", "super_admin"];

// Mirrors the authenticated user's role from the NextAuth session into
// the zustand role store. The store is the single read source for the
// rest of the app (RoleGuard, AppTopBar, nav config), so once the session
// arrives every role-aware UI flips automatically.
//
// The demo "Switch role" menu still mutates the store directly — that
// override stays until the next session change (login/logout). When we
// scope the switcher to admins only, this becomes purely a session
// reflector.
export function SessionRoleSync() {
  const { data: session } = useSession();
  const setRole = useRoleStore((s) => s.setRole);

  useEffect(() => {
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role && (VALID_ROLES as readonly string[]).includes(role)) {
      setRole(role as Role);
    }
  }, [session, setRole]);

  return null;
}
