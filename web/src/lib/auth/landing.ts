import type { Role } from "./map-me";

/** Where each role lives in the app. */
export const ROLE_HOME: Record<Role, string> = {
  student: "/dashboard",
  parent: "/parent",
  admin: "/admin",
};

/** Areas only one role may open. Anything else signed in is shared. */
const ROLE_AREAS: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/parent", role: "parent" },
  { prefix: "/dashboard", role: "student" },
];

function inArea(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(`${prefix}/`);
}

/** True when a user holding `roles` may open `path`. */
export function roleMayOpen(roles: readonly string[], path: string): boolean {
  const pathname = path.split(/[?#]/)[0] ?? path;
  const area = ROLE_AREAS.find((a) => inArea(pathname, a.prefix));
  return !area || roles.includes(area.role);
}

/**
 * Where a signed-in person goes next: onboarding first (students and
 * parents), else a safe `next` their role may open, else their home.
 * `next` must already be sanitised with safeNextPath.
 */
export function resolveLanding(input: {
  role: Role;
  roles: readonly string[];
  onboardingRequired: boolean;
  next?: string | null;
}): string {
  if (input.onboardingRequired && input.role !== "admin") return "/onboarding";
  if (
    input.next &&
    !inArea(input.next.split(/[?#]/)[0] ?? "", "/onboarding") &&
    roleMayOpen(input.roles, input.next)
  ) {
    return input.next;
  }
  return ROLE_HOME[input.role];
}
