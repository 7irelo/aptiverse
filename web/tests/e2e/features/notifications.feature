@student @notifications
Feature: Notifications
  Bell badge + notifications page + mark-read flows. The bell reads from
  /api/notifications/unread-count and refetches after any mutation whose
  server-side handler can enqueue a notification.

  Scenario: Bell badge is hidden when no unread notifications
    Given my notifications are all marked read
    When I open "/dashboard"
    Then the bell badge should be hidden

  Scenario: Bell badge updates when a producer fires
    Given my notifications are all marked read
    And I have a goal titled "Bell probe"
    When I push that goal to 100% progress
    And I open "/dashboard"
    Then the bell should show 1 unread

  Scenario: Mark all read on the notifications page clears the badge
    Given my notifications are all marked read
    And I have a goal titled "Mark-all probe"
    And I push that goal to 100% progress
    When I open "/dashboard/notifications"
    And I click "Mark all read"
    Then the API should report 0 unread notifications
    And the bell badge should be hidden

  Scenario: Notifications page lists my most recent notification
    Given my notifications are all marked read
    And I have a goal titled "List probe"
    And I push that goal to 100% progress
    When I open "/dashboard/notifications"
    Then I should see "Goal achieved: List probe"
