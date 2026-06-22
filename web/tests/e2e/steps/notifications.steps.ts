// Steps for notification UI + producer assertions.
//
// The seeder ships sample notifications for student.test. They stay in
// place across runs; the @notifications-tagged scenarios start with a
// mark-all-read so unread counts start from zero. We never delete
// notifications — there's no public DELETE endpoint, and read-state is
// what the user actually sees.

import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";

type Goal = { id: string; title: string; progress: number };
type Assessment = { id: string; title: string; status: string };
type Notification = { id: string; title: string; read: boolean };

Given("my notifications are all marked read", async ({ api }) => {
  // mark-all-read is idempotent — safe to run even when nothing's unread.
  await api.post("/api/notifications/mark-all-read");
});

When("I push that goal to 100% progress", async ({ api }) => {
  // Scoped to a clean Before (goals wiped) + a single Given. Find the
  // one goal we just created and patch it to 100. That's the celebration
  // trigger on the server.
  const goals = await api.get<Goal[]>("/api/goals");
  expect(goals.length, "expected exactly one goal in scope").toBe(1);
  await api.patch<Goal>(`/api/goals/${goals[0].id}`, { progress: 100 });
});

When("I push that assessment to status {string}", async ({ api }, status: string) => {
  const rows = await api.get<Assessment[]>("/api/academic-planning/assessments");
  expect(rows.length, "expected exactly one assessment in scope").toBe(1);
  await api.patch<Assessment>(
    `/api/academic-planning/assessments/${rows[0].id}`,
    { status },
  );
});

When("I click {string}", async ({ page }, label: string) => {
  await page.getByRole("button", { name: new RegExp(label, "i") }).first().click();
});

Then("the bell badge should be hidden", async ({ page }) => {
  // The badge's aria-label collapses to "Notifications" when unreadCount
  // is 0 (otherwise it's "<n> unread notifications"). Asserting on the
  // label is more reliable than peeking at MUI's internal badge DOM.
  await expect(page.getByRole("button", { name: /^Notifications$/i })).toBeVisible();
});

Then("the bell should show {int} unread", async ({ page }, expected: number) => {
  const re = new RegExp(`^${expected} unread notifications?$`, "i");
  await expect(page.getByRole("button", { name: re })).toBeVisible();
});

Then(
  "the API should report {int} unread notification(s)",
  async ({ api }, expected: number) => {
    // UI-driven mutations (Mark-all-read button) optimistically update
    // the React Query cache, then the POST settles a beat later. The
    // server-side count therefore lags the click by one round-trip.
    // expect.poll retries until the API catches up — short timeout so a
    // genuine logic regression still fails fast.
    await expect
      .poll(
        async () =>
          (await api.get<{ count: number }>("/api/notifications/unread-count")).count,
        { timeout: 5_000, intervals: [100, 200, 400, 800] },
      )
      .toBe(expected);
  },
);

Then(
  "that notification should be titled {string}",
  async ({ api }, title: string) => {
    const rows = await api.get<Notification[]>("/api/notifications");
    const unread = rows.filter((n) => !n.read);
    expect(unread.length, "expected exactly one unread notification").toBe(1);
    expect(unread[0].title).toBe(title);
  },
);

Then(
  "my unread notifications should include {string}",
  async ({ api }, fragment: string) => {
    const rows = await api.get<Notification[]>("/api/notifications");
    const titles = rows.filter((n) => !n.read).map((n) => n.title);
    expect(
      titles.some((t) => t.includes(fragment)),
      `no unread notification contained "${fragment}". Unread titles: ${titles.join(" | ")}`,
    ).toBeTruthy();
  },
);
