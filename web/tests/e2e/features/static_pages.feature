@student
Feature: Static link pages
  Past papers and universities are curated link pages — we
  smoke-test that they render with the key content and external links
  rather than blank pages.

  Scenario: Past papers page points to the DBE archive with subject tips
    When I open "/dashboard/past-papers"
    Then I should see "National Senior Certificate"
    And I should see "Mathematics"
    And I should see "Browse the archive"

  Scenario: Universities page lists the major SA universities
    When I open "/dashboard/universities"
    Then I should see "University of Cape Town"
    And I should see "University of the Witwatersrand"
    And I should see "Stellenbosch University"

  Scenario: Career page shows the empty dream-course state by default
    When I open "/dashboard/career"
    Then I should see "Not set yet"
    And I should see "Set dream course"
