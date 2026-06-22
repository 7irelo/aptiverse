@student
Feature: Assessments
  Students log their own SBA tasks. The Assessments page lists what's
  upcoming and graded; the /new form is the create flow.

  Scenario: Student logs a Maths SBA test
    Given I have a subject "Mathematics" in grade 12 on the NSC curriculum
    When I create an assessment titled "Calculus & Trig Test" with type test weight 15% due in 14 days
    Then the API should report an assessment titled "Calculus & Trig Test"

  Scenario: Cannot reach New assessment form without subjects
    When I open "/dashboard/assessments/new"
    Then I should see "You need at least one subject"

  @notifications
  Scenario: Submitting a draft triggers a "Draft submitted" notification
    Given my notifications are all marked read
    And I have a subject "Mathematics" in grade 12 on the NSC curriculum
    And I have an assessment "Calc test" in subject "Mathematics" with status "in_progress"
    When I push that assessment to status "submitted"
    Then the API should report 1 unread notification
    And that notification should be titled "Draft submitted: Calc test"

  @notifications
  Scenario: Re-PATCH on an already-submitted assessment does not re-fire
    Given my notifications are all marked read
    And I have a subject "Mathematics" in grade 12 on the NSC curriculum
    And I have an assessment "Steady" in subject "Mathematics" with status "submitted"
    When I push that assessment to status "submitted"
    Then the API should report 0 unread notifications
