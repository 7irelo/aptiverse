"use client";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";
import LockIcon from "@mui/icons-material/LockOutlined";
import { EmptyState } from "./EmptyState";
import { useRoleStore, type Role } from "@/providers/RoleProvider";

export type RoleGuardProps = {
  allow: Role | Role[];
  children: React.ReactNode;
};

const HOME_FOR_ROLE: Record<Role, string> = {
  student: "/dashboard",
  parent: "/parent",
  teacher: "/teacher",
  school_admin: "/school-admin",
  tutor: "/tutor",
  admin: "/admin",
  super_admin: "/admin",
};

// Wraps a section of the app that only specific roles may access. Admins
// and super_admins always pass (so they can shadow / inspect any area).
// Reads the role from RoleProvider; once we wire NextAuth session claims
// onto the store, this guard automatically becomes session-backed.
export function RoleGuard({ allow, children }: RoleGuardProps) {
  const role = useRoleStore((s) => s.role);
  const allowedRoles = Array.isArray(allow) ? allow : [allow];
  const isAdmin = role === "admin" || role === "super_admin";
  const allowed = isAdmin || allowedRoles.includes(role);

  if (allowed) return <>{children}</>;

  return (
    <Box sx={{ py: 6 }}>
      <EmptyState
        icon={<LockIcon />}
        title="Wrong role for this area"
        description={`This dashboard is for ${allowedRoles
          .map((r) => r.replace("_", " "))
          .join(" / ")}. Switch role in the top bar, or head back to your own dashboard.`}
        action={
          <Button component={Link} href={HOME_FOR_ROLE[role]} variant="contained">
            Go to my dashboard
          </Button>
        }
      />
    </Box>
  );
}
