// Single source of truth for "which dashboard root does this role land on".
//
// /dashboard is the STUDENT root. Every other role has its own area
// (/teacher, /parent, /tutor, /school-admin, /admin), each guarded so a
// mismatched role gets bounced. Hardcoding /dashboard everywhere dropped
// every role onto the student home and tripped the RoleGuard, so every
// post-auth redirect resolves through here instead: the login page, the
// /login edge middleware, the RoleGuard fallback, and register auto-login.
//
// Accepts a loose string (session/JWT claims are not statically typed) and
// normalises separators so "school-admin", "school_admin" and "schooladmin"
// all resolve. Unknown / student roles fall back to /dashboard.
export function homeRouteForRole(role: string | null | undefined): string {
  switch ((role ?? "").toLowerCase().replace(/[-\s]/g, "_")) {
    case "teacher":
      return "/teacher";
    case "parent":
      return "/parent";
    case "tutor":
      return "/tutor";
    case "affiliate":
      return "/refer";
    case "school_admin":
    case "schooladmin":
      return "/school-admin";
    case "admin":
    case "super_admin":
    case "superadmin":
    case "superuser":
      return "/admin";
    default:
      return "/dashboard";
  }
}
