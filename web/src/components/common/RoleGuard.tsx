"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import LockIcon from "@mui/icons-material/LockOutlined";
import { EmptyState } from "./EmptyState";
import { SignedInForbidden } from "./Forbidden";
import { useRoleStore, type Role } from "@/providers/RoleProvider";
import { homeRouteForRole } from "@/lib/home-route";

export type RoleGuardProps = {
  allow: Role | Role[];
  children: React.ReactNode;
};

// Wraps a section of the app that only specific roles may access. Admins
// and super_admins always pass (so they can shadow / inspect any area).
// Reads the display role from RoleProvider; the demo "Switch role" menu
// still mutates that store directly, so it stays the source for what the
// guard shows.
//
// A freshly-authenticated non-student can be dropped onto the student
// /dashboard before anything knows their role: OAuth signups hand a static
// callbackUrl of "/dashboard", and a paid parent returns through /welcome
// which also lands on "/dashboard". Left alone they hit the "wrong role"
// screen. So when the SESSION (the authoritative role, not the store) says
// the signed-in user does not belong in this area, bounce them to their own
// home instead. Keying the redirect off the session, never the store,
// keeps it race-free: it can't fire on the store's persisted/default
// "student" value, and it leaves the unauthenticated demo switcher alone.
//
// That bounce is now scoped to the one route it was written for. /dashboard is
// the static post-auth landing every provider and the /welcome return hand
// back, so a parent or teacher arriving there has not chosen to be there and
// should be moved on quietly. Anywhere else, an authenticated user standing in
// another role's area is answered honestly with a 403: these areas are named
// on the marketing site and the nav config ships to every client, so hiding
// them would protect nothing and only read as the app being broken. Records
// they do not own are the opposite case and stay 404 at the page level, since
// confirming a record exists is enough to enumerate.
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const role = useRoleStore((s) => s.role);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const allowedRoles = Array.isArray(allow) ? allow : [allow];
  const isAdmin = role === "admin" || role === "super_admin";
  const allowed = isAdmin || allowedRoles.includes(role);

  const sessionRole = (session?.user as { role?: string } | undefined)?.role;
  const sessionAllowed =
    !sessionRole ||
    sessionRole === "admin" ||
    sessionRole === "super_admin" ||
    (allowedRoles as readonly string[]).includes(sessionRole);
  const roleMismatch = status === "authenticated" && !!sessionRole && !sessionAllowed;
  const isPostAuthLanding = pathname === "/dashboard";
  const shouldRedirect = roleMismatch && isPostAuthLanding;

  useEffect(() => {
    if (shouldRedirect && sessionRole) {
      router.replace(homeRouteForRole(sessionRole));
    }
  }, [shouldRedirect, sessionRole, router]);

  // Being moved off the generic landing route is not an error, so show a calm
  // spinner rather than the screen we are about to leave, and never flash the
  // guarded content at them.
  if (shouldRedirect) {
    return (
      <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Signed in, real role, wrong area: answer with the 403.
  if (roleMismatch) return <SignedInForbidden allow={allowedRoles} />;

  if (allowed) return <>{children}</>;

  // No session role to go on: this is the unauthenticated demo switcher, where
  // the store role is the only role there is. Keep the switcher affordance
  // instead of a 403, and leave sign-in to the API fetcher.
  return (
    <Box sx={{ py: 6 }}>
      <EmptyState
        icon={<LockIcon />}
        title="Wrong role for this area"
        description={`This dashboard is for ${allowedRoles
          .map((r) => r.replace("_", " "))
          .join(" / ")}. Switch role in the top bar, or head back to your own dashboard.`}
        action={
          <Button component={Link} href={homeRouteForRole(role)} variant="contained">
            Go to my dashboard
          </Button>
        }
      />
    </Box>
  );
}
