// Test-account lookup, shared by the auth setup and the API fixture.
//
// Resolution order per role:
//   1. E2E_<ROLE>_EMAIL env var          (explicit, wins always)
//   2. role-specific default             (parent/teacher/tutor/admin/school-admin)
//   3. E2E_TEST_EMAIL env var            (legacy single-account fallback,
//                                         only useful for the student role)
//
// Password:
//   1. E2E_PASSWORD env var              (preferred)
//   2. E2E_TEST_PASSWORD env var         (legacy fallback)
//
// The default emails are conventions for our shared test accounts.
// They are not secrets — the password still has to come from .env.
// Hyphens in role names (school-admin) are converted to underscores for
// env-var lookup, since shells don't allow hyphens in identifiers.

export type Role = "student" | "parent" | "teacher" | "tutor" | "admin" | "school-admin";

const DEFAULT_EMAILS: Partial<Record<Role, string>> = {
  parent: "parent.test@gmail.com",
  teacher: "teacher.test@gmail.com",
  tutor: "tutor.test@gmail.com",
  admin: "admin.test@gmail.com",
  "school-admin": "schooladmin.test@gmail.com",
};

function envKey(role: Role): string {
  return `E2E_${role.toUpperCase().replace(/-/g, "_")}_EMAIL`;
}

export function emailFor(role: Role): string {
  const explicit = process.env[envKey(role)];
  if (explicit) return explicit;

  if (role === "student" && process.env.E2E_TEST_EMAIL) {
    return process.env.E2E_TEST_EMAIL;
  }

  const fallback = DEFAULT_EMAILS[role];
  if (fallback) return fallback;

  throw new Error(
    `No email configured for role "${role}". Set ${envKey(role)} in tests/e2e/.env.`,
  );
}

export function passwordFor(_role: Role): string {
  const v = process.env.E2E_PASSWORD ?? process.env.E2E_TEST_PASSWORD;
  if (!v) {
    throw new Error("E2E_PASSWORD (or legacy E2E_TEST_PASSWORD) is not set in tests/e2e/.env.");
  }
  return v;
}
