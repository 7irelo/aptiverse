@student
Feature: Subjects
  Students pick a curriculum once, then add subjects from the canonical
  catalog. Compulsory subjects (Life Orientation in NSC/IEB) cannot be
  removed.

  Scenario: First-time student picks NSC and adds Mathematics
    When I open "/dashboard/subjects"
    Then I should see "Pick your curriculum"

    Given I have picked the NSC curriculum
    When I add the "Mathematics" subject
    Then the API should report 1 subject
    And I should see a subject card for "Mathematics"

  Scenario: IEB student adds Advanced Programme Mathematics
    Given I have picked the IEB curriculum
    When I add the "Advanced Programme Mathematics" subject
    Then the API should report 1 subject
    And I should see a subject card for "Advanced Programme Mathematics"

  Scenario: Removing a non-compulsory subject
    Given I have a subject "Mathematics" in grade 12 on the NSC curriculum
    When I open "/dashboard/subjects"
    And I remove the "Mathematics" subject
    Then the API should report 0 subjects

  Scenario: Compulsory subjects cannot be removed from the catalog dialog
    Given I have a subject "Life Orientation" in grade 12 on the NSC curriculum
    When I open "/dashboard/subjects"
    Then I should see a subject card for "Life Orientation"
    And the "Life Orientation" card should not have a remove button

  Scenario: A teacher entered per-subject persists
    Given I have picked the NSC curriculum
    When I add the "English Home Language" subject with teacher "Ms. van der Merwe"
    Then the "English Home Language" subject should have teacher "Ms. van der Merwe"
