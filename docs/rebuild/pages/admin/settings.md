# Admin settings

| | |
|---|---|
| ID | `PG-ADM-SETTINGS` |
| Route | `/admin/settings` with sections `#contacts`, `#legal`, `#budgets`, `#pauses`, `#team`, `#account` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific |
| Entitlement | none; permissions `settings.manage` (edit), any admin can view (proposed) |
| Depends on | Shell and component kit (see `../../frontend/` and `../../frontend/components/`), BE-IDN-04 (consent versions), BE-IDN-07 (role to permission map), BE-NTF-02 (support email destinations), HRD-52 (budget ceilings, decision 9), PG-ADM-DASH-04 to 13, PG-ADM-IMP-06 (step-up); needs new BE tasks for a platform settings store and operational pauses (see Data) |
| Old app reference | `web/src/app/(app)/admin/settings/page.tsx` at f223ca7 (platform name, support email, currency, signup and webhook switches, maintenance mode; all inert) |
| Status | Not started |

## Purpose

PG-ADM-SETTINGS-01 asked to decide the contents. Decided here: the few platform values an admin must be able to change without a deploy, each enforced by the API, each change audited.

1. Contacts: support inbox address, contact form destination, safeguarding lead email.
2. Legal versions: the current Terms and Privacy versions that sign-up and re-consent check against (BE-IDN-04). Publishing a new version prompts users to accept it at next sign-in.
3. Budgets: monthly AI budget used by the AI spend page (and matching the HRD-52 alarm).
4. Operational pauses: pause new sign-ups, pause refunds, pause impersonation, pause AI generation. Enforced by the API, for incidents.
5. Admin team: read-only list of admins and their permissions (changes are made in code or by a future roles screen).
6. Your account: link to the shared account settings (password, sessions).

Not included, on purpose: platform name, currency (always ZAR for plans), maintenance mode (handled at Cloudflare and deploy level), webhook toggles (never switch off payment webhooks from a UI), feature flags (plan says config is enough).

## User stories

- As an admin with `settings.manage`, I change the support inbox address and the next contact form submission goes there.
- As an admin, I publish a new Privacy version after legal updates the text, and users are asked to accept it.
- As an admin, I set the monthly AI budget so the AI spend page shows usage against it.
- As an admin during an incident, I pause refunds or new sign-ups immediately, with a reason, and undo it later.
- As an admin, I see who else is an admin and what they can do.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Settings", description "Platform values that take effect without a deploy. Every change is logged."
2. Section jump links (wrap): Contacts, Legal, Budgets, Pauses, Team, Your account.
3. Contacts card: three read-only rows with values and an "Edit" button each opening a dialog with one email field.
4. Legal card: "Terms of use: version 2026-03, in force since 1 Mar 2026", "Privacy policy: version 2026-03"; button "Publish new version" opening a dialog.
5. Budgets card: "Monthly AI budget: US$400" with Edit.
6. Pauses card: four rows, each with a `Switch`, label, and status line ("Off" or "Paused since 14:05 by Lerato D.: Paystack incident").
7. Team card: list of admins (name, email masked, permissions as badges, last active).
8. Your account card: link "Password and sessions" to the shared settings page.

### Desktop (1440px)

- Two columns: left 3 columns sticky section nav; right 9 columns stacked section cards. Pauses card sits second (after Contacts) on desktop because it is used in incidents.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/settings/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Section nav | `web/src/features/admin/settings/components/settings-section-nav.tsx` | server | Anchor links |
| Contacts | `web/src/features/admin/settings/components/contacts-section.tsx` | server shell | Edit via `edit-email-dialog.tsx` (client) |
| Legal | `web/src/features/admin/settings/components/legal-section.tsx` | server shell | `publish-version-dialog.tsx` (client) with step-up |
| Budgets | `web/src/features/admin/settings/components/budgets-section.tsx` | server shell | `edit-budget-dialog.tsx` (client), money input in whole currency units |
| Pauses | `web/src/features/admin/settings/components/pauses-section.tsx` | server shell | `pause-switch.tsx` (client) opens `action-reason-dialog` before changing |
| Team | `web/src/features/admin/settings/components/team-section.tsx` | server | Read-only |
| Loader | `web/src/features/admin/settings/server/get-settings.ts` | server | Uncached (pauses must be current) |

## Data

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/settings` | needs new BE task (Admin settings store, `admin.platform_settings` table) | GET | `contacts` { `supportInbox`, `contactFormTo`, `safeguardingLead` }, `legal[]` { `document` (`terms`, `privacy`), `version`, `effectiveFrom`, `publishedBy` }, `budgets` { `aiMonthlyCents`, `currency` }, `pauses[]` { `key` (`signups`, `refunds`, `impersonation`, `ai_generation`), `paused`, `since`, `by`, `reason` }, `version` |
| `/admin/team` | needs new BE task (read from Identity role map) | GET | `items[]` { `userId`, `name`, `emailMasked`, `permissions[]`, `lastActiveAt` } |

Mutations (BFF, `Idempotency-Key`, `settings.manage`, `version` for concurrency)

| Action | Endpoint | Request | Notes |
|---|---|---|---|
| Update contact | `PATCH /admin/settings/contacts` | one of the three emails, `reason`, `version` | Validated email; domain allowlist `aptiverse.co.za` for support and safeguarding (proposed) |
| Publish legal version | `POST /admin/settings/legal` | `document`, `version` (format `YYYY-MM`), `effectiveFrom` (today or later), `reason`, header `X-Step-Up-Token` | 409 if version not newer; requires the document page for that version to exist (BE checks a known list) |
| Update budget | `PATCH /admin/settings/budgets` | `aiMonthlyCents`, `reason`, `version` | |
| Set pause | `POST /admin/settings/pauses/{key}` | `paused`, `reason` | Takes effect in the API within 30 seconds (settings cached 30s server-side) |

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Section skeletons |
| Read-only admin | No `settings.manage` | Edit buttons and switches disabled with note "You can view settings but not change them." |
| Saved | 200 | Toast "Saved. Audit ref {id}." |
| Stale | 409 version | "Someone else changed settings. We reloaded them. Make your change again." |
| Invalid email | Validator | "Enter a valid email address on aptiverse.co.za." |
| Version not newer | 409 | "Version {v} is not newer than the current {current}." |
| Pause on | Switch on | Row: "Paused since {time} by {name}: {reason}." Pauses card header shows "{n} paused" in attention zone; the admin shell shows a small top notice "Refunds are paused" on billing pages |
| Budget not set | null | "No monthly budget set." |
| Error | Load fails | "We could not load settings. Try again." |

## Stage variants

- Not stage-specific.

## Interactions and edge cases

- Publishing a legal version: dialog explains "Everyone will be asked to accept the new {document} at their next sign-in. Under-18 accounts may need parent consent again (see BE-FAM-14)." Requires step-up.
- Pausing sign-ups: the register page shows "Sign-ups are paused for a short while. Please try again later." (PG-AUTH-REG handles the 503 `signups_paused`).
- Pausing refunds sets the same disabled state as the `ADMIN_REFUNDS` env switch on the Payments tab, but at runtime and enforced by the API.
- Pausing AI generation: tutor and practice generation return a friendly 503 to students; the student pages handle `ai_paused`.
- Pause switches never toggle optimistically; the switch shows pending until the API confirms.
- Two admins editing: `version` concurrency on contacts and budgets.

## Copy

- h1 "Settings"; description "Platform values that take effect without a deploy. Every change is logged."
- Section headings "Contacts", "Legal versions", "Budgets", "Operational pauses", "Admin team", "Your account"
- Contact labels "Support inbox", "Contact form sends to", "Safeguarding lead"
- Pause labels "Pause new sign-ups", "Pause refunds", "Pause viewing as a user", "Pause AI generation"
- Publish dialog: title "Publish new {document} version", fields "Version", "In force from", "Reason", "Confirm it is you", confirm "Publish"

## Acceptance criteria

- Given `settings.manage`, when an admin changes the contact form destination, then the next contact form submission is emailed to the new address (Mailpit) and the audit log has the change.
- Given refunds paused, when a billing admin tries to refund, then the API returns 503 `refunds_paused` and the Payments tab shows the paused tooltip.
- Given a new Privacy version published effective today, when a student signs in, then they are asked to accept it.
- Given an admin without `settings.manage`, when the page renders, then all controls are disabled and the note shows.
- Given a stale version, when saving, then the 409 copy shows and values reload.

## Production readiness

Security
- `settings.manage` server-side on all writes; step-up for legal publishing. Email destinations restricted to an allowlisted domain to stop mail redirection abuse.
- Every change audited with before and after values and reason.

Performance
- Settings read once per request on this page; API caches settings 30s for enforcement paths.

Resilience
- `version` concurrency; idempotent writes; pause changes confirmed before UI changes.

Observability
- Audit events `admin.settings.contacts`, `.legal_publish`, `.budget`, `.pause`. Metric gauge `platform_pause{key}` so Grafana shows active pauses.

Accessibility (WCAG 2.2 AA)
- Switches have visible labels and state text; confirmation dialog before change so a stray tap does nothing.

Privacy and POPIA
- Team list shows masked emails. Legal version publishing drives the re-consent flow required by POPIA.

Rollout
- Under `ADMIN_CONSOLE`. Pauses are themselves the runtime kill switches for the console's riskiest actions.

Monitoring
- Alert whenever any pause has been on for more than 4 hours (so a pause is not forgotten).

Tasks
- [ ] **PG-ADM-SETTINGS-14** Admin shell notice on billing pages when refunds are paused
- [ ] **PG-ADM-SETTINGS-15** Grafana gauge for active pauses and the 4 hour alert
- [ ] **PG-ADM-SETTINGS-16** Request new BE tasks: settings store, team read, pause enforcement in Identity, Billing and AiTutor (coordinator)

## Build tasks

- [ ] **PG-ADM-SETTINGS-01** Decide contents in spec (legal versions, support emails) (done in this file's Purpose; mark checked when the coordinator accepts it)
- [ ] **PG-ADM-SETTINGS-02** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-SETTINGS-03** Route files, `get-settings.ts` loader and section nav
- [ ] **PG-ADM-SETTINGS-04** Contacts section and edit email dialog with domain validation
- [ ] **PG-ADM-SETTINGS-05** Legal section display
- [ ] **PG-ADM-SETTINGS-06** Publish version dialog with step-up and 409 handling
- [ ] **PG-ADM-SETTINGS-07** Budgets section and edit budget dialog
- [ ] **PG-ADM-SETTINGS-08** Pauses section with confirm-before-change switches
- [ ] **PG-ADM-SETTINGS-09** Team section (read-only)
- [ ] **PG-ADM-SETTINGS-10** Your account link and read-only admin state
- [ ] **PG-ADM-SETTINGS-11** Stale version handling across sections
- [ ] **PG-ADM-SETTINGS-12** Sign-ups paused copy hand-off to PG-AUTH-REG and `ai_paused` hand-off to student AI pages (note in their files via coordinator)
- [ ] **PG-ADM-SETTINGS-13** Runtime refunds pause wired into the Payments tab disabled state

## Quality tasks

- [ ] **PG-ADM-SETTINGS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-SETTINGS-Q02** Server loader in `src/features/admin/settings/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-SETTINGS-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states (never optimistic for pauses)
- [ ] **PG-ADM-SETTINGS-Q04** Empty state with one clear next action
- [ ] **PG-ADM-SETTINGS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-SETTINGS-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-SETTINGS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-SETTINGS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-SETTINGS-Q09** Layout at 1440px
- [ ] **PG-ADM-SETTINGS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-SETTINGS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-SETTINGS-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-SETTINGS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-SETTINGS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-SETTINGS-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/settings/components/pause-switch.test.tsx`: "opens reason dialog before change", "stays pending until confirmed", "reverts on failure"
- `features/admin/settings/components/publish-version-dialog.test.tsx`: "rejects version not in YYYY-MM", "requires step-up"

Playwright (`web/tests/e2e/admin/settings.spec.ts`)
- "change contact form destination is audited"
- "pause refunds disables refund on payments tab"
- "publish privacy version prompts re-consent"
- "read-only admin sees disabled controls"
- "settings page has no axe violations in light and dark"

## Open questions

- Is a runtime pause store wanted, or are web env switches plus redeploys enough? Runtime pauses are recommended for refunds and sign-ups during incidents.
- Domain allowlist for contact emails: only `aptiverse.co.za`, or also the Zoho inbox domain?
- Should the admin team list allow granting permissions in v1? Recommend no; role map in code (BE-IDN-07) until a second team member needs a subset.
