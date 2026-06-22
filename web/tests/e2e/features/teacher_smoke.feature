@teacher
Feature: Teacher page smoke tests
  Every page in the teacher dashboard loads without crashing.

  Scenario: Signed-in teacher lands on the teacher dashboard
    When I open "/teacher"
    Then I should see "Teacher dashboard"
    And I should not see "Wrong role for this area"

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"
    And I should not see "Wrong role for this area"

    Examples:
      | name           | path                       | text                              |
      | dashboard home | /teacher                   | Teacher dashboard                 |
      | students       | /teacher/students          | Students                          |
      | classes        | /teacher/classes           | My classes                        |
      | assignments    | /teacher/assignments       | Assignments & SBAs                |
      | verifications  | /teacher/verifications     | Goal verifications                |
      | analytics      | /teacher/analytics         | Analytics                         |
      | gap analysis   | /teacher/gap-analysis      | Gap analysis                      |
      | differentiator | /teacher/differentiator    | Differentiated assignment creator |
      | live           | /teacher/live              | Live class view                   |
      | calendar       | /teacher/calendar          | Calendar                          |
      | settings       | /teacher/settings          | Settings                          |
