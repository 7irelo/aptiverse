// Shared steps used by every feature.
//
// Auth is handled outside the steps via Playwright's storageState (see
// playwright.config.ts -> setup project). Every scenario therefore starts
// already signed in.

import { expect } from "@playwright/test";
import { When, Then, Before } from "./fixtures";

// Reset the test user's academic profile + content before every scenario.
// Hits POST /api/academic-planning/me/reset (dev-only / admin-only) which
// wipes curriculum + grade + school + all subjects + all assessments. Then
// wipes goals separately.
Before(async ({ api }) => {
  await api.post("/api/academic-planning/me/reset");

  const goals = await api.get<{ id: string }[]>("/api/goals");
  for (const g of goals) {
    await api.delete(`/api/goals/${g.id}`);
  }
});

When("I open {string}", async ({ page }, path: string) => {
  await page.goto(path);
});

Then("I should see {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
});

Then("I should not see {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).not.toBeVisible();
});
