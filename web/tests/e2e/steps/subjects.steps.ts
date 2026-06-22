import { expect } from "@playwright/test";
import { Given, When, Then } from "./fixtures";

// Catalog-subject slug lookups — the UI clicks subjects by name but our
// data attributes use slugs. Keep this map small; extend when new
// scenarios reference more subjects.
const SUBJECT_NAME_TO_SLUG: Record<string, string> = {
  Mathematics: "math",
  "Mathematical Literacy": "math_lit",
  "Physical Sciences": "physci",
  "Life Sciences": "lifesci",
  "English Home Language": "eng_hl",
  "Life Orientation": "lo",
  "Advanced Programme Mathematics": "ap_math",
};

function slugFor(subjectName: string): string {
  const slug = SUBJECT_NAME_TO_SLUG[subjectName];
  if (!slug) {
    throw new Error(`Add SUBJECT_NAME_TO_SLUG mapping for "${subjectName}"`);
  }
  return slug;
}

Given("I have picked the {word} curriculum", async ({ api }, code: string) => {
  await api.patch("/api/academic-planning/me/profile", {
    curriculumId: code.toLowerCase(),
    grade: 12,
  });
});

// Wait for the API to show a specific subject in the user's enrolled
// list. Used after UI-driven add operations because the UI "Added" chip
// races against TanStack Query refetch invalidation — the API is the
// source of truth.
async function waitForSubjectInApi(
  api: { get: <T>(path: string) => Promise<T> },
  slug: string,
  shouldExist: boolean,
  timeoutMs = 10_000,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const subjects = await api.get<{ subjectId: string }[]>("/api/academic-planning/subjects");
    const present = subjects.some((s) => s.subjectId === slug);
    if (present === shouldExist) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(
    `Timed out waiting for subject "${slug}" to ${shouldExist ? "appear" : "disappear"} in API after ${timeoutMs}ms.`,
  );
}

When("I add the {string} subject", async ({ page, api }, subjectName: string) => {
  const slug = slugFor(subjectName);

  await page.goto("/dashboard/subjects");
  await page
    .getByRole("button", { name: /add (subject|your first subject)/i })
    .first()
    .click();

  const row = page.locator(`[data-subject-slug="${slug}"]`).first();
  await row.waitFor({ state: "visible" });
  await row.scrollIntoViewIfNeeded();
  await row.getByRole("button", { name: /^add$/i }).click();

  // Poll the API for the new enrolment (more reliable than waiting for
  // the UI's "Added" chip, which races with the query invalidation).
  await waitForSubjectInApi(api, slug, true);

  await page.getByRole("button", { name: /^done$/i }).click();
});

When(
  "I add the {string} subject with teacher {string}",
  async ({ page, api }, subjectName: string, teacher: string) => {
    const slug = slugFor(subjectName);

    await page.goto("/dashboard/subjects");
    await page
      .getByRole("button", { name: /add (subject|your first subject)/i })
      .first()
      .click();

    const row = page.locator(`[data-subject-slug="${slug}"]`).first();
    await row.waitFor({ state: "visible" });
    await row.scrollIntoViewIfNeeded();
    await row.getByPlaceholder(/teacher/i).fill(teacher);
    await row.getByRole("button", { name: /^add$/i }).click();

    await waitForSubjectInApi(api, slug, true);

    await page.getByRole("button", { name: /^done$/i }).click();
  },
);

When("I remove the {string} subject", async ({ page, api }, subjectName: string) => {
  const slug = slugFor(subjectName);

  // Click the per-card icon-button (scoped to the card so we don't grab
  // any other "Remove subject" label that exists on the page — see the
  // confirm dialog below).
  const heading = page.getByRole("heading", { name: subjectName }).first();
  await heading.waitFor({ state: "visible" });
  const card = heading.locator("xpath=ancestor::*[contains(@class,'MuiCard-root')][1]");
  await card.getByRole("button", { name: /remove subject/i }).click();

  // The IconButton opens a ConfirmDialog (destructive-action UX) with
  // its own "Remove subject" confirm button. Click it inside the dialog
  // so we don't re-match the card's icon-button by accident.
  const dialog = page.getByRole("dialog");
  await dialog.waitFor({ state: "visible", timeout: 5_000 });
  await dialog.getByRole("button", { name: /remove subject/i }).click();

  // Poll API until the subject is actually gone before letting the
  // Then-step assert.
  await waitForSubjectInApi(api, slug, false);
});

Then("the API should report {int} subject(s)", async ({ api }, expected: number) => {
  const subjects = await api.get<unknown[]>("/api/academic-planning/subjects");
  expect(subjects).toHaveLength(expected);
});

Then("I should see a subject card for {string}", async ({ page }, subjectName: string) => {
  await expect(page.getByRole("heading", { name: subjectName }).first()).toBeVisible();
});

Then(
  "the {string} card should not have a remove button",
  async ({ page }, subjectName: string) => {
    const heading = page.getByRole("heading", { name: subjectName }).first();
    await heading.waitFor({ state: "visible" });
    const card = heading.locator("xpath=ancestor::*[contains(@class,'MuiCard-root')][1]");
    await expect(card.getByRole("button", { name: /remove subject/i })).toHaveCount(0);
  },
);

Then(
  "the {string} subject should have teacher {string}",
  async ({ api }, subjectName: string, expectedTeacher: string) => {
    const slug = slugFor(subjectName);
    const subjects = await api.get<{ subjectId: string; teacher: string | null }[]>(
      "/api/academic-planning/subjects",
    );
    const match = subjects.find((s) => s.subjectId === slug);
    expect(match, `expected subject with slug ${slug}`).toBeDefined();
    expect(match!.teacher).toBe(expectedTeacher);
  },
);
