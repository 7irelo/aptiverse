@parent
Feature: Parent page smoke tests
  Every page in the parent dashboard loads without crashing.

  Scenario: Signed-in parent lands on the parent dashboard
    When I open "/parent"
    Then I should see "Family dashboard"
    And I should not see "Wrong role for this area"

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"
    And I should not see "Wrong role for this area"

    Examples:
      | name           | path                   | text                |
      | dashboard home | /parent                | Family dashboard    |
      | children       | /parent/children       | Children            |
      | celebrations   | /parent/celebrations   | Celebrations        |
      | wellbeing      | /parent/wellbeing      | Wellbeing summary   |
      | live           | /parent/live           | Live family view    |
      | billing        | /parent/billing        | Billing             |
      | help           | /parent/help           | How can I help?     |
      | settings       | /parent/settings       | Settings            |
