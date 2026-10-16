import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

test.describe("help page", () => {
  test("lists FAQs grouped by category and opens an answer", async ({
    page,
  }) => {
    await page.goto("/help");

    await expect(
      page.getByRole("heading", { level: 1, name: "Help and FAQs" }),
    ).toBeVisible();
    const categories = page.getByRole("heading", { level: 2 });
    await expect(categories).toHaveText([
      "Getting started",
      "Practice",
      "Account and support",
    ]);

    const question = page.getByRole("button", {
      name: "Who is Aptiverse for?",
    });
    await expect(question).toHaveAttribute("aria-expanded", "false");
    await question.click();
    await expect(question).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByText(/High school learners and university students/),
    ).toBeVisible();
  });

  test("has no accessibility violations in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/help");
    await page.getByRole("button", { name: "Who is Aptiverse for?" }).click();
    await expectNoA11yViolations(page);
  });

  test("has no accessibility violations in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/help");
    await page.getByRole("button", { name: "Who is Aptiverse for?" }).click();
    await expectNoA11yViolations(page);
  });

  test("shows a retry state when the API is down", async ({ page }) => {
    await page.goto("http://localhost:3101/help");
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: "We could not load the questions" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("fits a 360px wide screen without sideways scrolling", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/help");
    await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("home page", () => {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`has no accessibility violations in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoA11yViolations(page);
    });
  }
});
