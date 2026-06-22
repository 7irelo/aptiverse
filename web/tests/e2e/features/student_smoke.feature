@student
Feature: Student page smoke tests
  Every page in the student dashboard loads without crashing and shows
  its expected hero title / heading. Catches regressions in routing,
  layout, route guards, and per-page imports.

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"

    Examples:
      | name             | path                       | text                |
      | dashboard home   | /dashboard                 | Active goals        |
      | mastery          | /dashboard/mastery         | Mastery             |
      | journey          | /dashboard/journey         | Your learning journey |
      | practice         | /dashboard/practice        | Practice tests      |
      | diary            | /dashboard/diary           | Diary               |
      | wellbeing        | /dashboard/wellbeing       | Wellbeing           |
      | psychologist     | /dashboard/psychologist    | Talk to someone     |
      | calendar         | /dashboard/calendar        | Calendar            |
      | tutors           | /dashboard/tutors          | Tutors              |
      | courses          | /dashboard/courses         | Courses             |
      | study-groups     | /dashboard/study-groups    | Study groups        |
      | rewards          | /dashboard/rewards         | Rewards             |
      | notifications    | /dashboard/notifications   | Notifications       |
      | billing          | /dashboard/billing         | Monthly AI allowance |
      | settings         | /dashboard/settings        | Settings            |
      | help             | /dashboard/help            | Help & feedback     |
      | chatbot          | /dashboard/chatbot         | AI Tutor            |
      | workspace        | /dashboard/workspace       | Workspace           |

  Scenario: No page renders the wrong-role gate for a student
    When I open "/dashboard"
    Then I should not see "Wrong role for this area"
