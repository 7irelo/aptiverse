// Auth steps. The Playwright "setup" project signs in once via the UI
// and persists storage state to .auth/user.json; every other test loads
// that state at startup and is already signed in.
//
// Keep this file for any explicit re-sign-in scenarios that need to
// exercise the login form itself.

import { expect } from "@playwright/test";
import { When, Then } from "./fixtures";

type Notification = { title: string; time: string };

// Module-scoped store keyed by an opaque token returned to subsequent
// steps. Steps are sequential within a scenario and playwright-bdd does
// not expose a shared scenario-state fixture, so this single-slot store
// is the simplest way to thread newly-registered credentials from the
// When step to the Then step.
const registered: { token?: string; email?: string } = {};

When("I register a fresh student account", async ({ request }) => {
  const baseUrl = process.env.E2E_API_BASE_URL ?? "http://localhost:5100";
  // Randomised email — registration creates a real user in the dev DB
  // and there is no cleanup endpoint. The "+e2e" segment makes these
  // accounts easy to grep + delete later if they accumulate.
  const email = `e2e.welcome.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@aptiverse.test`;
  const password = "Erincu76@";

  const reg = await request.post(`${baseUrl}/api/auth/register`, {
    data: {
      email,
      password,
      firstName: "E2E",
      lastName: "Welcome",
      role: "Student",
    },
  });
  expect(reg.ok(), `register failed: ${reg.status()} ${await reg.text()}`).toBeTruthy();

  const login = await request.post(`${baseUrl}/api/auth/login`, {
    data: { email, password },
  });
  expect(login.ok(), `login after register failed: ${login.status()}`).toBeTruthy();
  const body = await login.json();
  const token: string | undefined = body.accessToken ?? body.token ?? body.access_token;
  expect(token, "no token in login response").toBeTruthy();

  registered.token = token;
  registered.email = email;
});

Then(
  "their first notification should start with {string}",
  async ({ request }, prefix: string) => {
    expect(registered.token, "no registered user — did the register step run?").toBeTruthy();
    const baseUrl = process.env.E2E_API_BASE_URL ?? "http://localhost:5100";
    const res = await request.get(`${baseUrl}/api/notifications`, {
      headers: { Authorization: `Bearer ${registered.token}` },
    });
    expect(res.ok(), `GET /api/notifications -> ${res.status()}`).toBeTruthy();
    const rows = (await res.json()) as Notification[];
    // The welcome enqueue happens synchronously in RegisterUserAsync,
    // before the register call returns. By the time login completes,
    // the row is on disk — no polling needed.
    expect(rows.length, `expected at least one notification for ${registered.email}`).toBeGreaterThan(0);
    // Newest first per the controller's OrderByDescending(Time).
    expect(rows[0].title).toMatch(new RegExp(`^${prefix}`));
  },
);
