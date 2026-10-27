import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { devToolsEnabled } from "@/lib/dev-tools";

export type Role = "student" | "parent" | "admin";

/**
 * The signed-in user as the shell and pages see it. Phase 2 fills this from
 * the Auth.js session and the API's /me endpoint; until then a mock user is
 * returned in development only (see getSessionUser).
 */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Permission codes from the API, for example "billing.manage". */
  permissions: readonly string[];
  /** Plan entitlements, for example "ai-tutor". */
  entitlements: readonly string[];
};

/** Cookie that picks a mock user in development. Value: a Role. */
export const DEV_SESSION_COOKIE = "aptiverse-dev-session";

const MOCK_USERS: Record<Role, SessionUser> = {
  student: {
    id: "dev-student",
    name: "Thandi Mokoena",
    email: "student@example.test",
    role: "student",
    permissions: ["billing.manage"],
    entitlements: [],
  },
  parent: {
    id: "dev-parent",
    name: "Sipho Mokoena",
    email: "parent@example.test",
    role: "parent",
    permissions: ["billing.manage"],
    entitlements: [],
  },
  admin: {
    id: "dev-admin",
    name: "Lerato Dlamini",
    email: "admin@example.test",
    role: "admin",
    permissions: ["users.read", "content.manage", "billing.admin"],
    entitlements: [],
  },
};

export function isRole(value: unknown): value is Role {
  return value === "student" || value === "parent" || value === "admin";
}

/**
 * The single place the app asks "who is signed in?". Returns null when
 * nobody is. Reads a cookie, so callers must sit inside a Suspense boundary.
 *
 * Placeholder: returns a mock user only when developer tools are enabled
 * (never in a real production deployment) and the dev cookie is set. Phase 2
 * swaps the body for the Auth.js session without changing the signature.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  if (!devToolsEnabled()) return null;
  const role = cookieStore.get(DEV_SESSION_COOKIE)?.value;
  return isRole(role) ? MOCK_USERS[role] : null;
});
