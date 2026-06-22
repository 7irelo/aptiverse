import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";

When(
  "I create a goal titled {string} with category {word} due in {int} days",
  async ({ page }, title: string, category: string, daysOut: number) => {
    // Goals page has two entry points: header "New goal" and empty-state
    // "Add your first goal". First-match handles either.
    await page
      .getByRole("button", { name: /(new goal|add your first goal|add a goal)/i })
      .first()
      .click();

    const dialog = page.getByRole("dialog");
    await dialog.waitFor({ state: "visible" });
    await dialog.getByLabel("Title").fill(title);
    await dialog.getByLabel("Category").click();
    await page.getByRole("option", { name: new RegExp(`^${category}$`, "i") }).click();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysOut);
    await dialog.getByLabel("Due date").fill(dueDate.toISOString().slice(0, 10));

    await dialog.getByRole("button", { name: /^add goal$/i }).click();
    // Dialog closes when create succeeds
    await expect(dialog).toBeHidden();
  },
);

Given("I have a goal titled {string}", async ({ api }, title: string) => {
  await api.post("/api/goals", {
    title,
    description: "",
    target: "",
    category: "academic",
    dueDate: new Date(Date.now() + 14 * 86400_000).toISOString(),
  });
});

// Seeds a goal already at 100% progress without going through the patch
// path — used by the celebration-idempotency test. Setting progress on
// CREATE doesn't trigger the producer (the producer only fires on a
// PATCH transition from <100 to >=100), which is exactly what we need
// to verify "PATCH-to-100 on an already-100 goal doesn't re-fire."
Given(
  "I have a goal titled {string} at 100% progress",
  async ({ api }, title: string) => {
    await api.post("/api/goals", {
      title,
      description: "",
      target: "",
      category: "academic",
      progress: 100,
      dueDate: new Date(Date.now() + 14 * 86400_000).toISOString(),
    });
  },
);

When("I reset my academic profile", async ({ api }) => {
  await api.post("/api/academic-planning/me/reset");
});

Then("the API should report {int} goal(s)", async ({ api }, expected: number) => {
  const rows = await api.get<unknown[]>("/api/goals");
  expect(rows).toHaveLength(expected);
});

Then("the API should still report {int} goal(s)", async ({ api }, expected: number) => {
  const rows = await api.get<unknown[]>("/api/goals");
  expect(rows).toHaveLength(expected);
});

Then("I should see a goal card for {string}", async ({ page }, title: string) => {
  // GoalCard renders title in an h6
  await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
});
