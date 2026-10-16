import type { Role } from "@/providers/RoleProvider";

// Permissions are dot-notation strings: <resource>.<action>
// Resources: users, schools, classes, students, tutors,
//           subscriptions, payments, audit, system, billing
// Actions:   read, write, manage (full), delete, refund
//
// Mirrors PermissionResolver.cs on the API; the two must stay in step.
//
// content.* and flags.* are gone, and so is users.impersonate. They gated a
// moderation queue with no content-report pipeline, a feature-flag screen no
// flag consumer reads, and an impersonation form with no endpoint behind it.
// A permission whose only job is to reveal a control that does nothing is part
// of the same claim as the control.

export type Permission =
  | "users.read" | "users.write" | "users.manage" | "users.delete"
  | "schools.read" | "schools.write" | "schools.manage"
  | "classes.read" | "classes.write" | "classes.manage"
  | "students.read" | "students.write" | "students.manage"
  | "tutors.read" | "tutors.write" | "tutors.manage" | "tutors.verify"
  | "subscriptions.read" | "subscriptions.write" | "subscriptions.manage"
  | "payments.read" | "payments.refund" | "payments.manage"
  | "audit.read"
  | "system.read" | "system.manage"
  | "billing.read" | "billing.write" | "billing.manage";

// Roles in the platform — the existing five plus admin and super_admin
export type RbacRole = Role | "admin" | "super_admin";

const STUDENT: Permission[] = [
  "tutors.read", "subscriptions.read", "billing.read",
];

const PARENT: Permission[] = [
  ...STUDENT,
  "students.read", "billing.read", "billing.write",
];

const TEACHER: Permission[] = [
  "classes.read", "classes.write", "students.read", "students.write", "audit.read",
];

const SCHOOL_ADMIN: Permission[] = [
  ...TEACHER,
  "classes.manage", "students.manage", "schools.read", "schools.write", "users.read",
  "billing.read", "billing.write",
];

const TUTOR: Permission[] = [
  "students.read", "billing.read",
];

// An affiliate holds no RBAC permissions. Their pages (the referral dashboard,
// payout details) are gated by authentication and scope to their own account,
// not by a permission. Mirrors PermissionResolver's empty affiliate set.
const AFFILIATE: Permission[] = [];

const ADMIN: Permission[] = [
  "users.read", "users.write", "users.manage",
  "schools.read", "schools.write", "schools.manage",
  "classes.read", "classes.write", "classes.manage",
  "students.read", "students.write", "students.manage",
  "tutors.read", "tutors.write", "tutors.manage", "tutors.verify",
  "subscriptions.read", "subscriptions.write", "subscriptions.manage",
  "payments.read", "payments.refund", "payments.manage",
  "billing.read", "billing.write", "billing.manage",
  "audit.read",
  "system.read",
];

const SUPER_ADMIN: Permission[] = [
  ...ADMIN,
  "users.delete",
  "system.manage",
];

const ROLE_PERMISSIONS: Record<RbacRole, readonly Permission[]> = {
  student: STUDENT,
  parent: PARENT,
  teacher: TEACHER,
  school_admin: SCHOOL_ADMIN,
  tutor: TUTOR,
  affiliate: AFFILIATE,
  admin: ADMIN,
  super_admin: SUPER_ADMIN,
};

export function permissionsFor(role: RbacRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function can(role: RbacRole, permission: Permission): boolean {
  return permissionsFor(role).includes(permission);
}

export function canAny(role: RbacRole, perms: Permission[]): boolean {
  return perms.some((p) => can(role, p));
}

export function canAll(role: RbacRole, perms: Permission[]): boolean {
  return perms.every((p) => can(role, p));
}

// Identity's role names ("SchoolAdmin", "Superuser") are what the API stores
// and returns; the UI speaks snake_case. One place to cross that boundary.
export function normaliseIdentityRole(identityRole: string): RbacRole {
  if (identityRole === "Superuser") return "super_admin";
  return identityRole.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase() as RbacRole;
}

export function identityRoleLabel(identityRole: string): string {
  return ROLE_LABEL[normaliseIdentityRole(identityRole)] ?? identityRole;
}

export const ROLE_LABEL: Record<RbacRole, string> = {
  student: "Student",
  parent: "Parent / Guardian",
  teacher: "Teacher",
  school_admin: "School Admin",
  tutor: "Tutor",
  affiliate: "Affiliate",
  admin: "Admin",
  super_admin: "Super Admin",
};
