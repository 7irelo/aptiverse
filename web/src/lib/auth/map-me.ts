import type { MeResponse } from "@/lib/api/generated/model";

export type Role = "student" | "parent" | "admin";

/** The signed-in user as the shell and pages see it, built from GET /me. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  /** The role that picks the home and navigation. */
  role: Role;
  /** Every role the account holds. */
  roles: readonly Role[];
  /** Permission codes from the API, for example "billing.manage". */
  permissions: readonly string[];
  /** Plan entitlements, for example "ai-tutor". */
  entitlements: readonly string[];
  onboardingRequired: boolean;
  educationLevel: "high_school" | "tertiary" | null;
};

export function isRole(value: unknown): value is Role {
  return value === "student" || value === "parent" || value === "admin";
}

/** Highest privilege first, so an admin who is also a parent lands as admin. */
const ROLE_PRIORITY: readonly Role[] = ["admin", "parent", "student"];

/** Picks the primary role: the API's primaryRole, else the highest held. */
export function primaryRole(
  roles: readonly string[],
  preferred?: string | null,
): Role | null {
  const known = roles
    .map((role) => role.toLowerCase())
    .filter(isRole) as Role[];
  const wanted = preferred?.toLowerCase();
  if (isRole(wanted) && known.includes(wanted)) return wanted;
  return ROLE_PRIORITY.find((role) => known.includes(role)) ?? null;
}

/**
 * Maps the API's /me payload to the SessionUser the UI uses. Returns null
 * when the account holds no role the web app knows, so an unexpected role
 * never falls through to a default.
 */
export function mapMeToSessionUser(me: MeResponse): SessionUser | null {
  const role = primaryRole(me.roles, me.primaryRole);
  if (!role) return null;
  const level = me.onboarding.educationLevel;
  return {
    id: me.id,
    name: me.name,
    email: me.email,
    emailConfirmed: me.emailConfirmed,
    role,
    roles: me.roles.map((r) => r.toLowerCase()).filter(isRole),
    permissions: [...me.permissions],
    entitlements: [...me.entitlements],
    onboardingRequired: me.onboarding.required,
    educationLevel:
      level === "high_school" || level === "tertiary" ? level : null,
  };
}
