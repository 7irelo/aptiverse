import "server-only";

import { redirect } from "next/navigation";

import { ROLE_HOME } from "./landing";
import type { Role, SessionUser } from "./map-me";
import { getSessionUser } from "./session-user";

/** Pure permission check, safe to call anywhere a SessionUser is at hand. */
export function can(user: SessionUser | null, permission: string): boolean {
  return !!user && user.permissions.includes(permission);
}

/** The signed-in user, or a redirect to the login page. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/** The signed-in user holding one of the roles, else back to their home. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.some((role) => user.roles.includes(role))) {
    redirect(ROLE_HOME[user.role]);
  }
  return user;
}

/** The signed-in user holding the permission, else back to their home. */
export async function requirePermission(
  permission: string,
): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user, permission)) redirect(ROLE_HOME[user.role]);
  return user;
}
