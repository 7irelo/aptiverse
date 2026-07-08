@school-admin
Feature: School-admin page smoke tests
  Every page in the school-admin dashboard loads without crashing. These
  scenarios run against an Aptiverse SchoolAdmin account — the lighter-
  weight admin role scoped to a single school.

  Scenario: Signed-in school admin lands on the school dashboard
    When I open "/school-admin"
    Then I should see "School dashboard"
    And I should not see "Wrong role for this area"

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"
    And I should not see "Wrong role for this area"

    Examples:
      | name             | path                          | text                  |
      | dashboard home   | /school-admin                 | School dashboard      |
      | analytics        | /school-admin/analytics       | Analytics             |
      | classes          | /school-admin/classes         | Classes               |
      | readiness        | /school-admin/readiness       | University readiness  |
      | settings         | /school-admin/settings        | School settings       |
      | students         | /school-admin/students        | All learners          |
      | teachers         | /school-admin/teachers        | Teachers              |
