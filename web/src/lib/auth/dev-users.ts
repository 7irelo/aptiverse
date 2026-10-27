import "server-only";

import { devToolsEnabled } from "@/lib/dev-tools";

import { isRole, type Role, type SessionUser } from "./map-me";

/**
 * Mock users for local development and the Playwright shell runs. Loaded
 * with a dynamic import from getSessionUser only when developer tools are
 * on, and guarded again here so production can never return one.
 */
const MOCK_USERS: Record<Role, SessionUser> = {
  student: {
    id: "dev-student",
    name: "Thandi Mokoena",
    email: "student@example.test",
    emailConfirmed: true,
    role: "student",
    roles: ["student"],
    permissions: ["billing.manage"],
    entitlements: [],
    onboardingRequired: false,
    educationLevel: "high_school",
  },
  parent: {
    id: "dev-parent",
    name: "Sipho Mokoena",
    email: "parent@example.test",
    emailConfirmed: true,
    role: "parent",
    roles: ["parent"],
    permissions: ["billing.manage"],
    entitlements: [],
    onboardingRequired: false,
    educationLevel: null,
  },
  admin: {
    id: "dev-admin",
    name: "Lerato Dlamini",
    email: "admin@example.test",
    emailConfirmed: true,
    role: "admin",
    roles: ["admin"],
    permissions: ["users.read", "content.manage", "billing.admin"],
    entitlements: [],
    onboardingRequired: false,
    educationLevel: null,
  },
};

export function devSessionUser(role: string | undefined): SessionUser | null {
  if (!devToolsEnabled()) return null;
  return isRole(role) ? MOCK_USERS[role] : null;
}
