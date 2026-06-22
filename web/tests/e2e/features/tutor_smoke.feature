@tutor
Feature: Tutor page smoke tests
  Every page in the tutor dashboard loads without crashing.

  Scenario: Signed-in tutor lands on the tutor dashboard
    When I open "/tutor"
    Then I should see "Tutor dashboard"
    And I should not see "Wrong role for this area"

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"
    And I should not see "Wrong role for this area"

    Examples:
      | name           | path             | text             |
      | dashboard home | /tutor           | Tutor dashboard  |
      | students       | /tutor/students  | My students      |
      | sessions       | /tutor/sessions  | Sessions         |
      | courses        | /tutor/courses   | My courses       |
      | reviews        | /tutor/reviews   | Reviews          |
      | earnings       | /tutor/earnings  | Earnings         |
      | settings       | /tutor/settings  | Settings         |
