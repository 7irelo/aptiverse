// OAuth Google sign-in smoke steps.
//
// The full Google consent flow exits our test boundary (requires a real
// Google account, runs in an external domain, often rate-limits CI).
// We test what's actually ours: the click triggers NextAuth's redirect
// to accounts.google.com with the right client_id, scopes, and a
// redirect_uri pointing at our NextAuth callback path.

import { expect } from "@playwright/test";
import { Then, Before } from "./fixtures";

// Every other suite runs with a signed-in storageState (@student loads
// .auth/student.json). For the OAuth tests we need to be SIGNED OUT so
// /login renders the form instead of bouncing us to /dashboard. Drop the
// browser cookies before the scenario opens any page.
Before({ tags: "@unauthenticated" }, async ({ context }) => {
  await context.clearCookies();
});

Then(
  "clicking {string} should redirect to Google's OAuth endpoint with my client_id and a {string} redirect_uri",
  async ({ page }, buttonText: string, expectedRedirectPath: string) => {
    // Listen for the redirect to Google BEFORE clicking — otherwise the
    // browser might be partway through following it by the time we
    // attach the listener.
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => req.url().startsWith("https://accounts.google.com/o/oauth2/"),
        { timeout: 15_000 },
      ),
      page.getByRole("button", { name: new RegExp(buttonText, "i") }).click(),
    ]);

    const url = new URL(request.url());

    expect(
      url.searchParams.get("client_id"),
      "client_id should be from our Google Cloud project",
    ).toMatch(/\.apps\.googleusercontent\.com$/);

    expect(
      url.searchParams.get("redirect_uri"),
      "redirect_uri should target NextAuth's callback",
    ).toContain(expectedRedirectPath);

    // The user-creation path in OAuthExchangeService relies on the email
    // claim — fail loud if anyone strips the email scope by accident.
    const scope = url.searchParams.get("scope") ?? "";
    expect(scope, "scope must include openid").toContain("openid");
    expect(scope, "scope must include email").toContain("email");
  },
);
