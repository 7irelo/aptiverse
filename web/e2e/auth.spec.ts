import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const PASSWORD = "correct horse battery";

async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

async function logIn(page: Page, email: string, password = PASSWORD) {
  // Let the form hydrate first, so typed values are not replaced by React.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}

test.describe("log in", () => {
  test("sends a signed-out visitor to log in with the page as next", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Log in to Aptiverse" }),
    ).toBeVisible();
  });

  test("logs a student in to the dashboard and exposes no token to JavaScript", async ({
    page,
    browserName,
  }) => {
    const bodies: string[] = [];
    page.on("response", async (response) => {
      const type = response.headers()["content-type"] ?? "";
      if (/html|json|x-component|text\/plain/.test(type)) {
        bodies.push(await response.text().catch(() => ""));
      }
    });

    await page.goto("/login");
    await logIn(page, "student@example.test");
    await expect(page).toHaveURL(/\/dashboard$/);

    const exposed = await page.evaluate(() => ({
      cookie: document.cookie,
      local: JSON.stringify({ ...localStorage }),
      session: JSON.stringify({ ...sessionStorage }),
    }));
    expect(exposed.cookie).not.toContain("aptiverse.session");
    expect(exposed.local).not.toContain("eyJ");
    expect(exposed.session).not.toContain("eyJ");
    for (const body of bodies) expect(body).not.toContain("eyJmock");

    const cookies = await page.context().cookies();
    const session = cookies.find((c) => c.name.endsWith("aptiverse.session"));
    expect(session?.httpOnly).toBe(true);
    // Playwright WebKit on Windows does not report SameSite; Chromium does.
    if (browserName === "chromium") expect(session?.sameSite).toBe("Lax");
  });

  test("returns to the next page after login", async ({ page }) => {
    await page.goto("/login?next=%2Fdashboard%3Ftab%3Dmarks");
    await logIn(page, "student@example.test");
    await expect(page).toHaveURL(/\/dashboard\?tab=marks$/);
  });

  test("ignores an external next url", async ({ page }) => {
    await page.goto("/login?next=//evil.example");
    await logIn(page, "student@example.test");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("sends a student without onboarding to onboarding", async ({ page }) => {
    await page.goto("/login");
    await logIn(page, "new@example.test");
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Where are you studying?" }),
    ).toBeVisible();
  });

  test("shows the same message for a wrong password and an unknown email", async ({
    page,
  }) => {
    await page.goto("/login");
    await logIn(page, "student@example.test", "wrong password here");
    const alert = page.locator("main").getByRole("alert");
    await expect(alert).toContainText("That email and password do not match");
    const first = await alert.textContent();

    await logIn(page, "nobody@example.test");
    await expect(alert).toHaveText(first ?? "");
  });

  test("shows the lockout wait from Retry-After with a reset link", async ({
    page,
  }) => {
    await page.goto("/login");
    await logIn(page, "locked@example.test");
    const alert = page.locator("main").getByRole("alert");
    await expect(alert).toContainText("15 minutes");
    await expect(
      alert.getByRole("link", { name: "Reset your password" }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  test("shows the session expired notice", async ({ page }) => {
    await page.goto("/login?reason=session-expired");
    await expect(page.getByRole("status")).toContainText(
      "Your session ended, so please log in again.",
    );
  });

  test("redirects a signed-in visitor away from log in, and logs out", async ({
    page,
  }) => {
    await page.goto("/login");
    await logIn(page, "student@example.test");
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login\?reason=signed-out$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test("fits 360px without sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/login");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`has no accessibility violations in ${scheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/login");
      await logIn(page, "student@example.test", "wrong password here");
      await expect(page.locator("main").getByRole("alert")).toBeVisible();
      await expectNoA11yViolations(page);
    });
  }
});

test.describe("BFF", () => {
  test("refuses a cross-site POST and any auth path", async ({ request }) => {
    const crossSite = await request.post("/api/bff/me/consents", {
      headers: { origin: "https://evil.example" },
      data: {},
    });
    expect(crossSite.status()).toBe(403);

    const auth = await request.post("/api/bff/auth/refresh", {
      headers: { origin: "http://localhost:3100" },
      data: { refreshToken: "x" },
    });
    expect(auth.status()).toBe(404);
  });
});

test.describe("other auth pages", () => {
  test("sign up shows the role step first", async ({ page }) => {
    await page.goto("/register");
    await expect(
      page.getByRole("heading", { level: 1, name: "Create your account" }),
    ).toBeVisible();
    await page.getByText("Student", { exact: true }).click();
    await expect(page.getByText("Signing up as")).toBeVisible();
    await expect(page.getByLabel("I agree to the Terms")).not.toBeChecked();
  });

  test("forgot password never says whether the account exists", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.test");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
  });

  test("reset password without a token shows the invalid link panel", async ({
    page,
  }) => {
    await page.goto("/reset-password");
    await expect(
      page.getByRole("heading", {
        name: "This link has expired or was already used",
      }),
    ).toBeVisible();
  });

  test("reset password removes the token from the address bar", async ({
    page,
  }) => {
    await page.goto(
      "/reset-password?token=Zq3f6x0Gm1wQ9tVb2nYc8kLp4sHj7aDe5rUo1iTyEwX",
    );
    await expect(page.getByLabel("New password")).toBeVisible();
    await expect(page).toHaveURL(/\/reset-password$/);
  });
});
