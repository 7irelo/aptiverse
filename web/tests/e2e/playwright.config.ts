// Playwright + Cucumber (BDD) configuration for Aptiverse end-to-end tests.
//
// Per-role projects:
//   - one setup project per role (student/parent/teacher/tutor/admin/
//     school-admin), each signs in and saves its session to
//     .auth/<role>.json
//   - one main project per role, depending ONLY on that role's setup
//     and grep-filtering scenarios by @<role> tag
//
// Isolation: a failed setup for one role doesn't block the other suites.
//
// Tests run against your local dev stack:
//   - Next.js UI on  http://localhost:3000
//   - .NET API on    http://localhost:5100
//   - Postgres via SSH tunnel on localhost:5432

import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

const testDir = defineBddConfig({
  features: path.resolve(__dirname, "features"),
  steps: path.resolve(__dirname, "steps"),
});

const auth = (role: string) => path.resolve(__dirname, `.auth/${role}.json`);
const setupDir = path.resolve(__dirname, "setup");

function setupProject(role: string) {
  return {
    name: `setup-${role}`,
    testDir: setupDir,
    // Anchor on a path separator (or start-of-string) so `setup-admin`
    // doesn't also match `school-admin.setup.ts`.
    testMatch: new RegExp(`(?:^|[\\\\/])${role}\\.setup\\.ts$`),
    use: { ...devices["Desktop Chrome"] },
    // Setup is the cold-compile victim: each role lands on its own
    // post-login route (/dashboard, /parent, /school-admin, …) and the
    // very first hit on each forces Next to compile it from source.
    // 60s is tight on a cold cache; bump to 180s so a single slow
    // compile doesn't fail the entire suite. Steady-state runs hit
    // none of this — the cap only matters for first-time-after-restart.
    timeout: 180_000,
  };
}

function roleProject(role: string) {
  return {
    name: role,
    use: { ...devices["Desktop Chrome"], storageState: auth(role) },
    dependencies: [`setup-${role}`],
    grep: new RegExp(`@${role}\\b`),
  };
}

const ROLES = ["student", "parent", "teacher", "tutor", "admin", "school-admin"];

export default defineConfig({
  testDir,
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : [["list"]],
  // 120s test timeout (was 60s). Generous enough that a first-hit
  // Next.js dev compile of a route (e.g. /about, /school-admin) doesn't
  // blow past the limit while the rest of the steady-state suite still
  // finishes in 5-30s each.
  timeout: 120_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.E2E_UI_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    ...ROLES.map(setupProject),
    ...ROLES.map(roleProject),
  ],
});
