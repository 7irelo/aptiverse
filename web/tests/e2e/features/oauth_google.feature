@student @unauthenticated
Feature: Google OAuth sign-in
  Smoke-tests that the only social-login surface — Continue with Google —
  triggers NextAuth's OAuth flow with the right Cloud Console parameters.
  We deliberately don't follow through to Google's consent screen: that
  needs a real Google account and lives outside our test boundary.

  Scenario: Google is the only social provider on the login screen
    When I open "/login"
    Then I should see "Continue with Google"
    And I should not see "Continue with Apple"

  Scenario: Clicking Google kicks off OAuth with the right client_id + redirect_uri
    When I open "/login"
    Then clicking "Continue with Google" should redirect to Google's OAuth endpoint with my client_id and a "/api/auth/callback/google" redirect_uri
