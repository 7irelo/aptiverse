// Shared sign-in helper for the per-role setup files. Each role lives in
// its own setup project (student.setup.ts, parent.setup.ts, etc.) so a
// failed setup for one role doesn't skip the main suite for the others.

import { expect, type Page } from "@playwright/test";
import path from "node:path";
import { emailFor, passwordFor, type Role } from "../steps/test-accounts";

const SUCCESS_URL_RE = /\/(dashboard|parent|teacher|tutor|admin|school-admin)/;

export async function authenticate(role: Role, page: Page): Promise<void> {
  const authFile = path.resolve(__dirname, `../.auth/${role}.json`);
  const email = emailFor(role);

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(passwordFor(role));
  await page.getByRole("button", { name: /^sign in$/i }).click();

  try {
    await page.waitForURL(SUCCESS_URL_RE, { timeout: 30_000 });
  } catch {
    // No redirect within 30s. Gather context: the current URL, any
    // alerts on the page with non-empty text, and the form's visible
    // error helpers — then throw something actionable.
    const url = page.url();
    const alertTexts = (await page.getByRole("alert").allTextContents())
      .map((t) => t.trim())
      .filter(Boolean);
    let detail = `Stuck at ${url}.`;
    if (alertTexts.length) {
      detail += ` Alerts: ${alertTexts.join(" | ")}.`;
    } else {
      detail += " No visible alerts — login form may not have submitted, or NextAuth's redirect callback errored.";
    }
    throw new Error(
      `Login for ${role} (${email}) failed. ${detail} ` +
        `Verify the account exists with the password set in tests/e2e/.env.`,
    );
  }

  await expect(page).not.toHaveURL(/\/login/);
  await page.context().storageState({ path: authFile });
}
