@admin
Feature: Admin page smoke tests
  Every page in the admin dashboard loads without crashing. These
  scenarios run against an Aptiverse Admin / Superuser account.

  Scenario: Signed-in admin lands on the admin dashboard
    When I open "/admin"
    Then I should see "Admin"
    And I should not see "Wrong role for this area"

  Scenario Outline: <name> page loads
    When I open "<path>"
    Then I should see "<text>"
    And I should not see "Wrong role for this area"

    Examples:
      | name                | path                       | text                |
      | dashboard home      | /admin                     | Admin               |
      | audit               | /admin/audit               | Audit log           |
      | courses             | /admin/courses             | Courses             |
      | flags               | /admin/flags               | Feature flags       |
      | impersonate         | /admin/impersonate         | Impersonate user    |
      | invoices            | /admin/invoices            | Invoices            |
      | moderation          | /admin/moderation          | Moderation queue    |
      | payments            | /admin/payments            | Payments & refunds  |
      | schools             | /admin/schools             | Schools             |
      | school enquiries    | /admin/school-enquiries    | School enquiries    |
      | settings            | /admin/settings            | Platform settings   |
      | subscriptions       | /admin/subscriptions       | Subscriptions       |
      | system              | /admin/system              | System health       |
      | tutors              | /admin/tutors              | Tutors              |
      | users               | /admin/users               | Users               |
