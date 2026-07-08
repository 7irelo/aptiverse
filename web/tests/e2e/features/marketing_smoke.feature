@student
Feature: Marketing pages smoke tests
  Every public marketing page renders and shows its key content. Catches
  regressions in catalog wiring (pricing fetches plans from the API),
  the showcase mini-demos on /features, and the audience-tab structure
  introduced in the FET-phase rebuild.

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"

    Examples:
      | name             | path              | text                                          |
      | home             | /                 | South African high school                     |
      | features         | /features         | Six things ChatGPT can't do                   |
      | pricing          | /pricing          | Real tools. Honest pricing                    |
      | about            | /about            | Built with care, in South Africa              |
      | for-students     | /for-students     | Your high school years, on your side          |
      | for-parents      | /for-parents      | For parents                                   |
      | for-tutors       | /for-tutors       | Teach more. Hustle less                       |
      | for-schools      | /for-schools      | Whole-school                                  |
      | universities     | /universities     | Universities                                  |
      | careers          | /careers          | Careers                                       |
      | contact          | /contact          | Contact                                       |

  Scenario: Pricing page shows all four audience tabs
    When I open "/pricing"
    Then I should see "For students"
    And I should see "For families"
    And I should see "For tutors"
    And I should see "For schools"

  Scenario: Features page shows the moat showcase blocks
    When I open "/features"
    Then I should see "Curriculum-aware AI tutor"
    And I should see "SBA Coach"
    And I should see "Mastery predictions"
    And I should see "Exam simulator"

  Scenario: Features page shows the wellbeing showcase blocks
    When I open "/features"
    Then I should see "Daily mood check-in"
    And I should see "Reflective diary"
    And I should see "In-app counselling"

  Scenario: FET-phase framing replaces the old matric-only framing
    When I open "/"
    Then I should see "FET phase"
    And I should not see "Grade 11 & 12 learners"
