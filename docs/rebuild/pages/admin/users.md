# Users

| | |
|---|---|
| ID | `PG-ADM-USERS` |
| Route | `/admin/users`, drawer at `/admin/users?user=<id>` |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific (lists high school and university students, parents and admins; an affiliate profile shows as a badge on a student or parent) |
| Entitlement | none; permissions `users.read` (list and drawer), `users.support` (support actions, proposed) |
| Depends on | BE-ADM-03, BE-ADM-04, BE-IDN-04 (consents), BE-IDN-05 (security events), BE-IDN-29 (sessions), BE-BIL-14 (subscription summary via contracts), BE-FAM-02 (links), UI-08 / `DetailDrawer`, UI-26 / `DataTable`, PG-ADM-DASH-04 to 13 (shared admin foundation) |
| Old app reference | `43f9faa:web/src/app/(app)/admin/users/page.tsx` (server-side search by name, email or id, role filter, roles and plan columns) and `43f9faa:web/src/app/(app)/admin/users/UserDetailDrawer.tsx` (the drawer the plan names: account fields, roles editor with Superuser rails, owned subscriptions, memberships, last 10 audit entries); API `43f9faa:api/Controllers/AdminController.cs` (`GetUsers`, `GetUser`, `GetAssignableRoles`, `SetUserRoles`) |
| Status | Not started. `DataTable` and `DetailDrawer` exist in `web/src/components/common/` |

## Purpose

Find any person on the platform in seconds and see, on one drawer, everything support needs: who they are, which stage they are in, whether they verified and onboarded, their plan and payment health, their sessions, recent security events, family links and tickets. From the drawer an admin can run the three safe support actions (resend verification, revoke sessions, unlock) and, with extra permission, start impersonation (see `impersonation.md`). Viewing a person's details is itself logged.

## User stories

- As an admin, I search by name, email or user id and find the person on the first page of results.
- As an admin, I filter by role, stage, account status, plan state and signup date to answer "who is stuck" without SQL.
- As an admin, I open a user's drawer from a link (for example from a ticket) and get the same view.
- As a support admin, I resend a verification email, revoke all sessions or unlock a locked account, with a reason that lands in the audit log.
- As an admin, I can see that an action failed and why, and the failure is audited too.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Users", description "Search every account. Opening a person's details is logged."
2. Search input full width, placeholder "Name, email or user id". 44px tall.
3. "Filters" button opens a bottom `Sheet` with: Role, Stage, Status, Plan, Signed up (from, to). Active filter count on the button ("Filters (2)").
4. Result count line: "142 people" (or "More than 1 000 people" when the API caps the count).
5. Results as cards (DataTable mobile view): name (title), masked email, role and stage badges, status badge, "Signed up 3 Oct 2026". Whole card is a link that opens the drawer.
6. `cursor-pagination` at the foot.
7. Drawer: full-screen `Sheet` with sticky header (name, close) and sticky footer (Actions menu).

### Desktop (1440px)

- Filter bar inline above the table: search (320px), Role, Stage, Status, Plan selects, date range, "Clear all".
- `DataTable` columns: Name and email, Role, Stage, Status, Plan, Last active, Signed up. Sort by Signed up or Last active (server-side).
- Drawer opens as a 560px side panel on the right; the table keeps its scroll position and the selected row is highlighted.
- Drawer sections are vertical with an in-drawer jump list: Overview, Account, Roles, Plan and payments (owned subscriptions and memberships), Sessions, Security events, Recent audit, Family, Support, Consents.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/admin/users/page.tsx` | server | Parses search params, renders `PermissionGate users.read`, list and drawer slots |
| Loading | `web/src/app/(app)/admin/users/loading.tsx` | server | Filter bar skeleton plus 8 row skeletons |
| Error | `web/src/app/(app)/admin/users/error.tsx` | client | Retry |
| User filters | `web/src/features/admin/users/components/user-filters.tsx` | client | Uses `admin-filter-bar`; mobile Sheet variant |
| User table | `web/src/features/admin/users/components/user-table.tsx` | server | `DataTable` with link rows to `?user=<id>` |
| Status badge | `web/src/features/admin/users/components/user-status-badge.tsx` | server | Active, Unverified, Onboarding, Locked, Deletion requested, Deleted |
| Stage label | `web/src/features/admin/shared/lib/stage-label.ts` | shared | From PG-ADM-DASH-23 |
| User drawer | `web/src/features/admin/users/components/user-drawer.tsx` | client | `DetailDrawer` controlled by `user` search param; closing removes the param |
| Drawer body | `web/src/features/admin/users/components/user-drawer-body.tsx` | server | Streamed as a server component inside the drawer via a parallel slot `@drawer` |
| Drawer sections | `web/src/features/admin/users/components/drawer/*.tsx` | server | `overview.tsx`, `account.tsx`, `roles.tsx`, `plan.tsx`, `sessions.tsx`, `security-events.tsx`, `recent-audit.tsx`, `family.tsx`, `support.tsx`, `consents.tsx` |
| Roles editor | `web/src/features/admin/users/components/roles-editor.tsx` | client | Checkbox per assignable role, Privileged badge, warning, Save and Reset; mirrors the server rails |
| Support actions menu | `web/src/features/admin/users/components/user-actions-menu.tsx` | client | `DropdownMenu`: Resend verification, Revoke all sessions, Unlock account, Impersonate (from `impersonation.md`) |
| Action dialogs | `web/src/features/admin/users/components/actions/*.tsx` | client | Each uses `action-reason-dialog` and `admin-action` |
| Drawer slot | `web/src/app/(app)/admin/users/@drawer/default.tsx`, `@drawer/page.tsx` | server | Parallel route keeps the list rendered while the drawer streams |
| List loader | `web/src/features/admin/users/server/list-users.ts` | server | Not cached; zod parse |
| Detail loader | `web/src/features/admin/users/server/get-user-detail.ts` | server | Not cached (and every call is access-logged by the API) |
| Filter schema | `web/src/features/admin/users/lib/user-filters.ts` | shared | zod over search params |

## Data

| Endpoint | BE ID | Method | Fields used | Cache |
|---|---|---|---|---|
| `/admin/users?q=&role=&stage=&status=&plan=&from=&to=&sort=&cursor=&limit=` | BE-ADM-03 | GET | `items[]`: `id`, `displayName`, `emailMasked`, `role`, `stage` (`high_school`, `tertiary`, null), `grade`, `yearOfStudy`, `status`, `planState`, `lastActiveAt`, `createdAt`; `nextCursor`, `prevCursor`, `total`, `totalCapped` | none |
| `/admin/users/{id}` | BE-ADM-03 | GET | `id`, `displayName`, `email` (full, logged), `emailVerifiedAt`, `role`, `stage`, `curriculum` (`nsc`, `ieb`, decision 29; shown as NSC or IEB), `grade`, `studyLevel`, `schoolOrInstitution`, `onboardingCompletedAt`, `lockedUntil`, `failedLoginCount`, `deletionRequestedAt`, `createdAt`, `lastActiveAt`; `plan`: `planName`, `state`, `currentPeriodEnd`, `lastPaymentStatus`; `sessions[]`: `id`, `device`, `ipMasked`, `lastSeenAt`; `securityEvents[]` (last 20): `type`, `outcome`, `at`, `ipMasked`; `family[]`: `linkId`, `otherUserId`, `otherDisplayName`, `relation`, `status`; `tickets`: `open`, `total`; `consents[]`: `document`, `version`, `acceptedAt`, `source`; `affiliate`: `status` or null; `isImpersonatable`, `accessLogId` | none |

Mutations (all through `/api/bff`, `Idempotency-Key` header, reason required):

| Action | Endpoint | BE ID | Request | Success | Failures |
|---|---|---|---|---|---|
| Resend verification | `POST /admin/users/{id}/verification-email` | BE-ADM-04 | `reason` | `auditEventId`, `sentAt` | 409 already verified, 429 sent in last 10 minutes, 403 |
| Revoke all sessions | `POST /admin/users/{id}/sessions/revoke` | BE-ADM-04 | `reason` | `auditEventId`, `revokedCount` | 404, 403 |
| Unlock account | `POST /admin/users/{id}/unlock` | BE-ADM-04 | `reason` | `auditEventId` | 409 not locked, 403 |
| Change roles | `PUT /admin/users/{id}/roles` | needs new BE task (ported from old `SetUserRoles`) | `roles[]` (full set), `reason` | `auditEventId`, `roles[]` | 400 own account, 400 unknown role, 403 privileged change without `roles.manage`, 409 would remove the last `roles.manage` holder |

After a successful action the drawer re-fetches (`router.refresh()`), and a toast shows "Done. Audit ref {short id}." Every failure response also carries `auditEventId` (BE-ADM-04 must audit failures; flag if missing).

## States

| State | When | Copy |
|---|---|---|
| Loading list | Suspense | Row skeletons; "Loading users" for screen readers |
| Populated | Results | As in Layout |
| No results with filters | `total` 0 and any filter set | Title "No one matches these filters", description "Try a different spelling, or clear filters.", action "Clear filters" |
| Empty platform | `total` 0 and no filters | Title "No accounts yet", description "Accounts appear here as soon as someone signs up." |
| Count capped | `totalCapped` true | "More than 1 000 people. Narrow your search to see an exact count." |
| Drawer loading | Drawer slot streaming | Section skeletons in the drawer |
| Drawer not found | 404 for id | Drawer body: "This account does not exist or was deleted." action "Back to users" |
| Drawer deleted user | `status` deleted | Banner in drawer "This account was deleted on {date}. Personal details are removed." Only id, role and dates show |
| No evidence fields | Null values | "Not set" for profile fields, "Never" for last active, "No sessions" for sessions |
| Action pending | Dialog submitting | Confirm button shows spinner and "Sending..."; both buttons disabled |
| Action failed | 4xx or 5xx | Inline in dialog, e.g. "This email is already verified. Nothing was sent." or "Too many emails in a short time. Try again after 14:20." or "Something went wrong on our side. Nothing changed. Audit ref {id}." |
| Error | List call fails | "We could not load users. Check your connection and try again." Try again |
| Forbidden page | No `users.read` | "You do not have access to user accounts. Ask another admin to grant users.read." |
| Forbidden action | No `users.support` | Action menu items hidden; if called anyway, toast "You do not have permission to do this." |
| Write actions paused | `ADMIN_WRITE_ACTIONS` off | Menu items disabled with tooltip "Support actions are paused by an administrator." |
| Roles: own account | Viewing yourself | Editor read-only with "You cannot change your own roles." |
| Roles: privileged locked | Target holds admin, or a change would add or remove admin, and the actor lacks `roles.manage` | Admin checkbox disabled; note "Only an admin with role management can grant or remove admin, or edit an admin's roles." |
| Roles: granting admin | Admin newly ticked | Attention note "This grants access to every account, subscription and audit entry on the platform. It is recorded in the audit log." |
| Roles: last role manager | 409 | "This is the last admin who can manage roles. Give someone else role management first." |
| Roles saved | 200 | Toast "Roles updated. Audit ref {short id}." |
| No recent audit | Empty list | "Nothing recorded for this account yet." |

## Stage variants

- High school students: stage badge "High school", detail shows "Grade 11, NSC" and school name.
- University or college students: badge "University", detail shows "Year 2" and institution. No grade, curriculum or APS wording.
- Parents: no stage; Family section lists linked students with their stage labels.
- Stage filter options: "High school", "University or college", "No stage (parents and staff)".

## Interactions and edge cases

- Search is server-side, case-insensitive, matches name prefix, full email, email domain, or exact user id (Guid). The API, not the browser, decides; no client-side filtering of a page.
- Filters and cursor live in the URL so a filtered view can be shared in a ticket. Changing a filter resets the cursor.
- Opening the drawer does not reset list scroll; Escape closes it and focus returns to the row link.
- Drawer deep link for an id that is not a Guid: show drawer not found, do not call the API.
- Unlock on an account whose lock already expired: 409 maps to "This account is no longer locked. Nothing changed."
- Revoke sessions for the admin's own account: allowed only with a second confirmation "This will sign you out too."; dialog text changes.
- Actions on another admin account: server rejects unless `users.support.admins` (proposed); UI hides them for admin targets.
- Two admins act on one user at once: actions are idempotent per intent; the second admin sees the refreshed state and a 409 where relevant.
- Deletion requested: actions other than Revoke sessions are disabled with "This person asked for their account to be deleted."
- Masked email in the list; full email only in the drawer, which the API logs as a personal data view.

### Carried over from the old app (43f9faa)

- List: a Roles column showing every role the account holds (not only the primary one) and a Plans column with the plan names the person is entitled to now through any live subscription they own or belong to.
- Drawer header chips: "Email verified" or "Email unverified", "Locked out" (when locked), "Joined {date}". User id shown in monospace with a Copy button.
- Plan and payments splits "Pays for" (subscriptions this person owns, each linking to `/admin/billing?subscription=<id>`) and "Member of" (plans owned by someone else that cover this person, for example a child on a parent's plan, with the member role and joined date).
- Recent audit: the last 10 audit entries where this person is the actor or the target, each linking to `/admin/audit?q=<ref>`, plus "See all" to `/admin/audit?targetUserId=<id>`.
- Roles editor (the only write the old drawer had, now one of several): assignable roles come from `GET /admin/roles` so the UI never offers a role the server would reject. Rails, enforced by the API and mirrored in the UI so the admin sees why a control is unavailable: you cannot change your own roles; granting or removing admin needs the `roles.manage` permission (decision 28; there is no Superuser role, the roles stay student, parent and admin); editing an account that already holds admin needs `roles.manage`; the last holder of `roles.manage` cannot lose it. Privileged changes are audited at warning severity. Save is enabled only when the selection differs; Reset restores it; opening another account resets the editor to that account's roles.
- Assignable roles in v1: `admin` only (granted or removed with `roles.manage`). Affiliate is a profile, not a role (DECISIONS.md E), so it is never offered here; suspending an affiliate is done from `/admin/affiliates`. Switching a person between student and parent is not offered (their data model differs); that is a support case for engineering.
- Not carried: phone number (no phone in BE-IDN-02).

## Copy

- h1 "Users"; description "Search every account. Opening a person's details is logged."
- Search placeholder "Name, email or user id"
- Status labels: "Active", "Email not verified", "Onboarding not finished", "Locked", "Deletion requested", "Deleted"
- Resend dialog: title "Resend verification email", body "We will send a new verification link to {email}. Old links stop working.", confirm "Send email"
- Revoke dialog: title "Sign {name} out everywhere", body "All {n} sessions end now. They will need to sign in again.", confirm "Sign out everywhere"
- Unlock dialog: title "Unlock {name}'s account", body "They can try signing in again straight away. The failed sign-in count resets.", confirm "Unlock"
- Reason label "Reason (saved in the audit log)", hint "For example: ticket 1842, student cannot find the email."
- Toast success "Done. Audit ref {short id}."
- Access notice in drawer footer: "Your view of this account was logged."

## Acceptance criteria

- Given 3 000 users, when an admin searches "thandi", then the API receives `q=thandi`, results come back in under 1s at p95, and only 25 rows render.
- Given a filter of Status "Locked", when the admin copies the URL into a new tab, then the same filtered list renders.
- Given an admin opens `/admin/users?user=<id>`, when the drawer loads, then all eight sections render from `GET /admin/users/{id}` and the footer reads "Your view of this account was logged."
- Given a locked user, when an admin unlocks with a reason, then `POST /admin/users/{id}/unlock` is called once with an `Idempotency-Key`, the drawer shows status Active, and a toast shows the audit ref.
- Given the admin double-clicks "Unlock", when requests are inspected, then exactly one request was sent.
- Given the API returns 429 for resend, when the dialog shows the error, then nothing else changes and the dialog stays open.
- Given an admin without `users.support`, when they open the drawer, then no action menu items show except Impersonate rules from `impersonation.md`.
- Given a university student, when the drawer renders, then no Grade, curriculum or APS text appears.
- Given a 360px viewport, when results render, then rows are cards and the drawer is full screen with no horizontal scroll.
- Given an admin with `roles.manage` opens a student's drawer, when they tick admin and save with a reason, then the warning shows before save, one `PUT /admin/users/{id}/roles` is sent, and the audit log has a warning-severity entry.
- Given an admin without `roles.manage` opens another admin's drawer, when the roles editor renders, then every checkbox is disabled with the role management note.

## Production readiness

Security
- `users.read` enforced on both GET endpoints; `users.support` on each action endpoint. Server rejects actions on admin targets without `users.support.admins`.
- Reason required server-side (validator: 10 to 500 characters), not just in the UI.
- CSRF: mutations only via `/api/bff`, which checks `Origin` and uses the httpOnly session.
- No bulk actions in v1 (one person at a time limits blast radius).

Performance
- Keyset (cursor) pagination on `(created_at, id)` or `(last_active_at, id)`; page size 25, max 50.
- Search uses a trigram index on name and email (BE-ADM-03 must state the index; flag if not).
- Count capped at 1 000 to avoid full scans (`totalCapped`).
- Detail endpoint budget: p95 under 400ms; it reads cross-module data through contracts, not joins.

Resilience
- Actions idempotent per `Idempotency-Key` (one key per dialog open). Retry after timeout reuses the key.
- Partial drawer failure: if a contract read (billing, family) fails, that section shows "We could not load this section." while the rest renders (API returns per-section `errors[]`; needs confirming in BE-ADM-03).

Observability
- Each action logs a structured audit event `admin.user.<action>` with actor, target, reason, outcome, trace id; failures included.
- Sentry breadcrumbs carry user ids only, never email.

Accessibility (WCAG 2.2 AA)
- Drawer is a Radix dialog: focus trap, Escape closes, focus returns to the row.
- Filter Sheet labelled; active filter count announced.
- Target size at least 24px everywhere, 44px on mobile (2.5.8).

Privacy and POPIA
- List returns masked email; drawer returns full email and is access-logged with `accessLogId` (BE-ADM-03 must write the access log; flag as needed).
- Security event IPs masked to /24.
- No export from this page in v1.
- Diary, mood and tutor conversation content never appear in the drawer.

Rollout
- Read view ships first behind `ADMIN_CONSOLE`; actions behind `ADMIN_WRITE_ACTIONS` so they can be paused without redeploying the read view.

Monitoring
- Alert when admin action failure rate exceeds 20 percent over 15 minutes.
- Dashboard panel: actions per day by type and outcome.

Tasks
- [ ] **PG-ADM-USERS-18** Per-section error handling in the drawer (section fallback copy)
- [ ] **PG-ADM-USERS-19** Admin targets: hide actions for admin accounts unless `users.support.admins`
- [ ] **PG-ADM-USERS-20** Self-revoke second confirmation and sign-out handling
- [ ] **PG-ADM-USERS-21** `ADMIN_WRITE_ACTIONS` off state for the actions menu
- [ ] **PG-ADM-USERS-22** Access notice in drawer footer and check that `accessLogId` is present in the response (flag to BE if missing)
- [ ] **PG-ADM-USERS-23** Grafana panel for admin user actions by type and outcome; failure rate alert
- [ ] **PG-ADM-USERS-24** Confirm trigram index and count cap with BE-ADM-03 owner; record result in this file

## Build tasks

- [ ] **PG-ADM-USERS-01** Search and filters, DataTable (umbrella; delivered by 05 to 09)
- [ ] **PG-ADM-USERS-02** User detail drawer (umbrella; delivered by 10 to 13)
- [ ] **PG-ADM-USERS-03** Support actions (resend verification, revoke sessions, unlock) (umbrella; delivered by 14 to 17)
- [ ] **PG-ADM-USERS-04** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-USERS-05** Route files and `list-users.ts` loader with zod parse
- [ ] **PG-ADM-USERS-06** `user-filters.ts` schema and `user-filters.tsx` (desktop inline, mobile Sheet with count)
- [ ] **PG-ADM-USERS-07** `user-table.tsx` columns, mobile card layout, server sort
- [ ] **PG-ADM-USERS-08** `user-status-badge.tsx` and stage labels
- [ ] **PG-ADM-USERS-09** Empty, no-results, capped-count and error states
- [ ] **PG-ADM-USERS-10** `@drawer` parallel slot, `user-drawer.tsx` controlled by `?user=`, focus return
- [ ] **PG-ADM-USERS-11** Drawer sections Overview, Account and Plan
- [ ] **PG-ADM-USERS-12** Drawer sections Sessions and Security events
- [ ] **PG-ADM-USERS-13** Drawer sections Family, Support and Consents; not-found and deleted states
- [ ] **PG-ADM-USERS-14** `user-actions-menu.tsx` with permission and status rules
- [ ] **PG-ADM-USERS-15** Resend verification dialog and error mapping (409, 429)
- [ ] **PG-ADM-USERS-16** Revoke sessions dialog and error mapping
- [ ] **PG-ADM-USERS-17** Unlock dialog and error mapping (409)
- [ ] **PG-ADM-USERS-25** Drawer header chips (verified, locked, joined) and copyable user id
- [ ] **PG-ADM-USERS-26** Plan section split into "Pays for" and "Member of" with subscription links
- [ ] **PG-ADM-USERS-27** `recent-audit.tsx` section (last 10, links to audit, See all)
- [ ] **PG-ADM-USERS-28** Roles and Plans columns in `user-table.tsx` (all roles, live plan names)
- [ ] **PG-ADM-USERS-29** `roles-editor.tsx`: assignable roles from API, Privileged badge, granting-admin warning, dirty tracking, Save and Reset, reset on account switch
- [ ] **PG-ADM-USERS-30** Roles editor rails in the UI (own account, privileged needs `roles.manage`, last `roles.manage` holder) and error mapping (400, 403, 409)
- [ ] **PG-ADM-USERS-31** Request new BE tasks: `GET /admin/roles`, `PUT /admin/users/{id}/roles` with the four rails, drawer fields `ownedSubscriptions`, `memberships`, `recentAudit` in BE-ADM-03 (coordinator)

## Quality tasks

- [ ] **PG-ADM-USERS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id (drawer not-found state covers `?user=`)
- [ ] **PG-ADM-USERS-Q02** Server loader in `src/features/admin/users/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-USERS-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-ADM-USERS-Q04** Empty state with one clear next action
- [ ] **PG-ADM-USERS-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-USERS-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-USERS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-USERS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-USERS-Q09** Layout at 1440px
- [ ] **PG-ADM-USERS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-USERS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-USERS-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-USERS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-USERS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-USERS-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-ADM-USERS-Q16** Drawer keyboard and screen reader pass (focus trap, return focus, section jump list)

## Tests

Unit (Vitest)
- `features/admin/users/lib/user-filters.test.ts`: "parses role and stage", "resets cursor when a filter changes", "rejects non-guid user param"
- `features/admin/users/components/user-actions-menu.test.tsx`: "hides actions without users.support", "disables actions for deletion requested", "hides actions for admin targets"
- `features/admin/users/components/roles-editor.test.tsx`: "own account is read-only", "admin checkbox disabled without roles.manage", "shows warning when granting admin", "save disabled until dirty", "resets when another account opens"
- `features/admin/users/components/drawer/overview.test.tsx`: "university student shows Year and institution, no Grade", "null fields show Not set"

Playwright (`web/tests/e2e/admin/users.spec.ts`)
- "search by email finds the user"
- "role manager grants admin role with warning and audit ref"
- "plain admin cannot edit an admin account roles"
- "drawer shows pays for and member of sections"
- "filtered URL restores the same list"
- "drawer deep link opens and logs access notice"
- "unlock locked user with reason shows audit ref"
- "double click unlock sends one request"
- "resend verification rate limited shows retry time"
- "admin without users.support sees no actions"
- "unknown user id shows drawer not found"
- "mobile shows cards and full screen drawer"
- "users page has no axe violations in light and dark"

## Open questions

- Should admins be able to edit profile fields (name, grade, school) from the drawer? Not in BE-ADM-04 today; recommend no for v1 (support asks the user to change it).
- `users.support.admins` permission: needed, or are admin accounts simply untouchable from the console?
- Does BE-ADM-03 return per-section errors for contract reads, or fail the whole call?
- Search by phone number: users do not have phone numbers in BE-IDN-02, so not offered.
- Decided (28): no Superuser role. Role changes that touch admin need the `roles.manage` permission held by named admins; the rails (no self-edit, the last holder cannot lose it) apply to that permission.
- Should role changes require step-up like refunds? Recommended for granting admin.
