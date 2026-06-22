@student
Feature: Auth flow pages
  Forgot-password / reset-password / verify-email shells render and
  surface the right state when the URL is missing required tokens.

  Scenario: Forgot password page asks for an email
    When I open "/forgot-password"
    Then I should see "Reset your password"
    And I should see "Send reset link"

  Scenario: Reset password page without a token tells the user to request a new link
    When I open "/reset-password"
    Then I should see "This link is missing its reset token"
    And I should see "Request a new reset link"

  Scenario: Verify-email landing (no token in URL) shows the inbox message + resend
    When I open "/verify-email"
    Then I should see "Verify your email"
    And I should see "Resend"

  Scenario: Verify-email with invalid token shows the failure card
    When I open "/verify-email?userId=fake&token=expired"
    Then I should see "Couldn't verify"

  @notifications
  Scenario: Registering a new account creates a welcome notification
    When I register a fresh student account
    Then their first notification should start with "Welcome to Aptiverse"
