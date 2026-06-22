import type { Role } from "@/providers/RoleProvider";

// Permissions are dot-notation strings: <resource>.<action>
// Resources: users, schools, classes, students, tutors, courses, bursaries,
//           subscriptions, payments, content, audit, flags, system
// Actions:   read, write, manage (full), delete, refund, impersonate

export type Permission =
  | "users.read" | "users.write" | "users.manage" | "users.delete" | "users.impersonate"
  | "schools.read" | "schools.write" | "schools.manage"
  | "classes.read" | "classes.write" | "classes.manage"
  | "students.read" | "students.write" | "students.manage"
  | "tutors.read" | "tutors.write" | "tutors.manage" | "tutors.verify"
  | "courses.read" | "courses.write" | "courses.manage"
  | "bursaries.read" | "bursaries.write" | "bursaries.manage"
  | "subscriptions.read" | "subscriptions.write" | "subscriptions.manage"
  | "payments.read" | "payments.refund" | "payments.manage"
  | "content.read" | "content.moderate"
  | "audit.read"
  | "flags.read" | "flags.write"
  | "system.read" | "system.manage"
  | "billing.read" | "billing.write" | "billing.manage";

// Roles in the platform — the existing five plus admin and super_admin
export type RbacRole = Role | "admin" | "super_admin";

const STUDENT: Permission[] = [
  "courses.read", "tutors.read", "bursaries.read", "subscriptions.read", "billing.read",
];

const PARENT: Permission[] = [
  ...STUDENT,
  "students.read", "billing.read", "billing.write",
];

const TEACHER: Permission[] = [
  "classes.read", "classes.write", "students.read", "students.write", "courses.read", "audit.read",
];

const SCHOOL_ADMIN: Permission[] = [
  ...TEACHER,
  "classes.manage", "students.manage", "schools.read", "schools.write", "users.read",
  "bursaries.read", "billing.read", "billing.write",
];

const TUTOR: Permission[] = [
  "courses.read", "courses.write", "students.read", "billing.read",
];

const ADMIN: Permission[] = [
  "users.read", "users.write", "users.manage",
  "schools.read", "schools.write", "schools.manage",
  "classes.read", "classes.write", "classes.manage",
  "students.read", "students.write", "students.manage",
  "tutors.read", "tutors.write", "tutors.manage", "tutors.verify",
  "courses.read", "courses.write", "courses.manage",
  "bursaries.read", "bursaries.write", "bursaries.manage",
  "subscriptions.read", "subscriptions.write", "subscriptions.manage",
  "payments.read", "payments.refund", "payments.manage",
  "billing.read", "billing.write", "billing.manage",
  "content.read", "content.moderate",
  "audit.read",
  "flags.read", "flags.write",
  "system.read",
];

const SUPER_ADMIN: Permission[] = [
  ...ADMIN,
  "users.delete", "users.impersonate",
  "system.manage",
];

const ROLE_PERMISSIONS: Record<RbacRole, readonly Permission[]> = {
  student: STUDENT,
  parent: PARENT,
  teacher: TEACHER,
  school_admin: SCHOOL_ADMIN,
  tutor: TUTOR,
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

export const ROLE_LABEL: Record<RbacRole, string> = {
  student: "Student",
  parent: "Parent / Guardian",
  teacher: "Teacher",
  school_admin: "School Admin",
  tutor: "Tutor",
  admin: "Admin",
  super_admin: "Super Admin",
};
