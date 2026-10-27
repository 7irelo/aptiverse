import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PASSWORD = "correct horse battery";

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function logIn(page: Page, email: string) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function expectNoSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
}

// Phones first: these flows run on the mobile projects.
test.beforeEach(({}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("mobile"),
    "Study flows run on the mobile projects",
  );
});

test.describe("practice", () => {
  test("generates a test, takes it and sees the results", async ({ page }) => {
    await logIn(page, "student@example.test");
    await page.goto("/dashboard/practice");
    await expect(
      page.getByRole("heading", { level: 1, name: "Practice" }),
    ).toBeVisible();
    await expect(page.getByText("No practice tests yet")).toBeVisible();
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "New practice test" }).click();
    const dialog = page.getByRole("dialog", { name: "New practice test" });
    await expect(dialog.getByLabel("Practising for")).toBeVisible();
    await dialog.getByRole("button", { name: "Generate test" }).click();

    await expect(
      page.getByRole("heading", { name: "Your test is ready" }),
    ).toBeVisible({ timeout: 15_000 });
    await page.getByRole("link", { name: "Open test" }).click();

    // Instructions gate: Start is disabled until the student acknowledges.
    const start = page.getByRole("button", { name: "Start test" });
    await expect(start).toBeDisabled();
    await page
      .getByLabel("I understand. I have one attempt at this test.")
      .check();
    await start.click();

    await expect(page.getByText("Question 1 of 2").first()).toBeVisible();
    await page.getByRole("radio").first().check();
    await page.getByRole("button", { name: "Next" }).click();
    await expect(page.getByText("Question 2 of 2").first()).toBeVisible();
    await page.getByRole("radio").nth(1).check();
    await page.getByRole("button", { name: "Review answers" }).click();

    await expect(
      page.getByRole("heading", { name: "Review your answers" }),
    ).toBeVisible();
    await expect(
      page.getByText("2 answered, 0 unanswered, 0 flagged"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Submit test" }).click();

    await expect(
      page.getByRole("heading", { level: 1, name: "Your results" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("2 of 2 marks")).toBeVisible();
    await expect(page.getByText("Submitted by you")).toBeVisible();
    await expect(
      page.getByText("You've already taken this test."),
    ).not.toBeVisible();

    await page.getByRole("button", { name: /Question 1/ }).click();
    await expect(page.getByText("Correct answer")).toBeVisible();
    await expectNoSidewaysScroll(page);
  });

  test("practice page is accessible in light and dark", async ({ page }) => {
    await logIn(page, "student@example.test");
    for (const scheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/dashboard/practice");
      await expect(
        page.getByRole("heading", { level: 1, name: "Practice" }),
      ).toBeVisible();
      await expectNoA11yViolations(page);
    }
  });
});

test.describe("tutor", () => {
  test("streams a reply with a citation", async ({ page }) => {
    await logIn(page, "student@example.test");
    await page.goto("/dashboard/tutor");
    await expect(
      page.getByRole("heading", { name: "What are you working on?" }),
    ).toBeVisible();
    await page.waitForLoadState("networkidle");

    await page
      .getByLabel("Message the tutor")
      .fill("How do I solve x squared equals 9?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(
      page.getByRole("log").getByText("take the square root of both sides"),
    ).toBeVisible();
    await expect(page.getByText("Sources")).toBeVisible();
    await expect(
      page.getByText(
        "CAPS Mathematics Grade 11, Algebra, Quadratic equations, page 24",
      ),
    ).toBeVisible();
    await expect(page.getByText("Looked through the curriculum")).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/tutor\/[0-9a-f-]{36}$/);
    await expectNoSidewaysScroll(page);
  });

  test("is blocked while a practice test is in progress", async ({ page }) => {
    await logIn(page, "busy@example.test");
    await page.goto("/dashboard/tutor");
    await expect(
      page.getByRole("heading", { name: "The tutor is off during your test" }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "It comes back as soon as you submit Mathematics practice quiz.",
      ),
    ).toBeVisible();
    await expect(page.getByLabel("Message the tutor")).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Back to your test" }),
    ).toHaveAttribute("href", /\/dashboard\/practice\/[0-9a-f-]{36}$/);
    await expectNoA11yViolations(page);
  });
});

test.describe("dashboard", () => {
  test("shows real numbers only, with no marks yet instead of zero", async ({
    page,
  }) => {
    await logIn(page, "student@example.test");
    await expect(
      page.getByRole("heading", { level: 2, name: "Predicted results" }),
    ).toBeVisible();
    await expect(page.getByText("No marks yet").first()).toBeVisible();
    await expect(page.getByText("0%")).toHaveCount(0);
    await expectNoSidewaysScroll(page);
    await expectNoA11yViolations(page);
  });
});
