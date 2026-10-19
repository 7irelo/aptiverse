# Settings

| | |
|---|---|
| ID | `PG-CMN-SETTINGS` |
| Route | `/dashboard/settings`, `/parent/settings`, `/admin/settings`, each with sections at `/<area>/settings/[section]` where section is `profile`, `appearance`, `language`, `notifications`, `privacy`, `security`, `data` |
| Phase | 2 (privacy controls land with Phase 8, subscription-aware deletion with Phase 6) |
| Roles | student / parent / admin (sections vary by role, see Layout) |
| Stages | high school, university (stage fields on Profile are student only) |
| Entitlement | free |
| Depends on | BE-IDN-28, BE-IDN-29, BE-IDN-30, BE-IDN-32, BE-IDN-34, BE-IDN-35, BE-IDN-36, BE-IDN-37, BE-IDN-38, BE-NTF-09, BE-FAM-05, BE-FAM-06, BE-FAM-11, BE-FAM-14, BE-WEL-06, BE-BIL-14; FE-24, FE-25, FE-63; UI-03, UI-07, UI-10, UI-25, UI-33; PG-CMN-NOTIF-03 (`lib/format/date.ts`); proposed API slices listed in Open questions (email change, export status, deletion cancel, student-side parent links) |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/settings/page.tsx` (tabs Profile, Appearance, Notifications, Security; profile fetched from the API not the session; first and last name required; email read-only; school and grade 10 to 12 editable for high school, institution search for tertiary; appearance note that follows the device; email and push channel switches with in-app always on; per-type switches saved on toggle with partial updates; password change), `43f9faa:web/src/app/(app)/parent/settings/page.tsx` (cosmetic, unwired: name, email, phone, channels), `43f9faa:web/src/components/common/ConsentPreferencesDialog.tsx` and `43f9faa:web/src/lib/analytics/consent.ts` (privacy choices for advertising measurement, Global Privacy Control honoured) |
| Status | Not started (0 of 72 tasks) |

## Purpose

Let every user control their own account in one calm place: who they are, how Aptiverse contacts them, what a linked parent can see, how their account is secured, and their POPIA rights to a copy of their data and to deletion. Settings never surprise: each change says what it does before it happens, and anything destructive asks first.

## User stories

- As a student, I want to correct my name and see my grade or year of study, so my practice is pitched at the right level.
- As a student, I want to choose exactly what each linked parent can see, so I keep my privacy and still let them support me.
- As a student, I want to be told plainly that my diary is never shared.
- As a parent, I want to understand what I can and cannot see for each child, so I know the limits are set by my child.
- As any user, I want to turn email reminders off without losing security messages.
- As any user, I want to change my password and sign out a lost phone.
- As any user, I want to download my data and request deletion of my account, and know what happens next.
- As an admin, I want only the settings that apply to my own account.

## Layout

Section visibility by role (registry in `features/settings/lib/sections.ts`):

| Section | Student | Parent | Admin |
|---|---|---|---|
| Profile | yes (with stage fields) | yes | yes |
| Appearance | yes | yes | yes |
| Language | yes | yes | yes |
| Notifications | yes | yes | yes |
| Privacy | yes (sharing controls) | yes (read-only "What you can see") | no |
| Security | yes | yes | yes |
| Your data | yes | yes | export only (deletion goes through ops) |

### Mobile (360px)

Index route `/<area>/settings`:

1. `PageHeader`: `h1` "Settings", description "Your profile, notifications, privacy and security."
2. Pending deletion banner (only when a deletion request is active), see States.
3. Section list: one full-width row per visible section (56px, Lucide icon, label, one-line summary, `ChevronRight`). Summaries: Profile "Thandi Mokoena, Grade 11"; Appearance "Follows your device"; Language "English"; Notifications "Email on for 6 of 9 types"; Privacy "Shared with 1 parent"; Security "2 devices signed in"; Your data "Download or delete your data".

Section route `/<area>/settings/[section]`:

1. Back link "Settings" with `ChevronLeft` (44px), then `h1` with the section name.
2. Section content as stacked `Card`s, one form per card, each with its own save button (no page-level save).
3. Destructive actions (sign out all others, delete account) at the bottom of their section, separated by a `Separator`.

### Desktop (1440px)

- Two columns inside `PageShell` (`max-w-5xl`): a 240px sticky section nav on the left (vertical list of links, active item marked with `aria-current="page"` and a citron surface), content on the right (`max-w-2xl`).
- The index route renders the section list only below `lg` and renders the Profile section at `lg` and up, so desktop users land on Profile with "Profile" active in the side nav.
- The mobile back link is hidden at `lg`; the side nav replaces it.
- Cards keep one column; forms keep labels above inputs (no side-by-side label grid).

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Layout (per area) | `web/src/app/(app)/{dashboard,parent,admin}/settings/layout.tsx` | server | Reads session, renders `SettingsLayout` with the role's sections |
| Index page | `web/src/app/(app)/{dashboard,parent,admin}/settings/page.tsx` | server | Mobile list, desktop Profile |
| Section page | `web/src/app/(app)/{dashboard,parent,admin}/settings/[section]/page.tsx` | server | `notFound()` for unknown or role-hidden sections; `generateMetadata` "Security settings" and so on |
| loading, error, not-found | `web/src/app/(app)/{dashboard,parent,admin}/settings/{loading,error,not-found}.tsx` | server / client (error) | `PageState` with retry; not-found copy below |
| SettingsLayout | `web/src/features/settings/components/settings-layout.tsx` | server | Side nav at `lg`, back link below |
| SettingsNav | `web/src/features/settings/components/settings-nav.tsx` | client | Uses `usePathname` for `aria-current` |
| Section registry | `web/src/features/settings/lib/sections.ts` | shared | `{ id, label, icon, roles, summary(me) }` |
| ProfileSection | `web/src/features/settings/components/profile/profile-section.tsx` | server | Reads `/me` |
| NameForm | `web/src/features/settings/components/profile/name-form.tsx` | client | `useZodForm` with generated schema for `PATCH /me/profile` |
| EmailChangeForm | `web/src/features/settings/components/profile/email-change-form.tsx` | client | New email plus current password; pending verification banner |
| StageDetailsCard | `web/src/features/settings/components/profile/stage-details-card.tsx` | server | Student only; read-only fields and "Change" link |
| AppearanceNote | `web/src/features/settings/components/appearance-note.tsx` | server | Static copy, no controls |
| LanguageSection | `web/src/features/settings/components/language-section.tsx` | server | Read-only "English" until the decision lands |
| NotificationPreferences | `web/src/features/settings/components/notifications/notification-preferences.tsx` | client | Grouped matrix of `Switch`es (in-app, email), autosave per toggle |
| SharingControls | `web/src/features/settings/components/privacy/sharing-controls.tsx` | client | Student; one card per linked parent with four switches and a "What they see" summary |
| UnlinkParentDialog | `web/src/features/settings/components/privacy/unlink-parent-dialog.tsx` | client | `ConfirmDialog` destructive |
| DiaryPrivacyNote | `web/src/features/settings/components/privacy/diary-privacy-note.tsx` | server | Static |
| ParentVisibilityExplainer | `web/src/features/settings/components/privacy/parent-visibility-explainer.tsx` | server | Parent; per child current sharing state, read-only |
| PasswordForm | `web/src/features/settings/components/security/password-form.tsx` | client | Current, new, confirm; `autocomplete` attributes; paste allowed |
| SessionsList | `web/src/features/settings/components/security/sessions-list.tsx` | client | Rows with "Sign out"; "Sign out all other devices" |
| DataExportCard | `web/src/features/settings/components/data/data-export-card.tsx` | client | Request and status |
| DeleteAccountDialog | `web/src/features/settings/components/data/delete-account-dialog.tsx` | client | Consequences, subscription warning, minor note, typed confirmation, password |
| DeletionPendingBanner | `web/src/features/settings/components/data/deletion-pending-banner.tsx` | server | Shown on every settings route while pending |
| Server loaders | `web/src/features/settings/server/{get-me,get-sessions,get-preferences,get-sharing,get-export-status}.ts` | server | Generated client, zod parse, React `cache()`; no shared `"use cache"` |
| Kit used | `components/shell/page-shell.tsx`, `page-header.tsx`, `page-state.tsx`; `components/common/form-fields.tsx`, `confirm-dialog.tsx`; `components/ui/card.tsx`, `button.tsx`, `input.tsx`, `field.tsx`, `label.tsx`, `badge.tsx`, `separator.tsx`, `dialog.tsx`, `sheet.tsx`, `sonner.tsx`; Switch from UI-02 | | |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/me` (BE-IDN-28) | GET | `id`, `firstName`, `lastName`, `email`, `emailVerified`, `pendingEmail \| null` (proposed), `role`, `permissions`, `educationLevel` (`high_school` \| `tertiary`), `grade \| null`, `yearOfStudy \| null`, `curriculum` (`nsc` \| `ieb` \| null), `schoolName \| null`, `institutionName \| null`, `dateOfBirth \| null` (students; BE-IDN profile date of birth, see backend/identity.md; null for migrated accounts that never gave one), `adultConfirmedAt \| null` (parents), `isMinor` (proposed, from BE-FAM-14 consent data), `hasPassword` (proposed; false for Google-only accounts), `deletionRequest \| null { requestedAt, scheduledFor }` (proposed) | Per user, request-memoised; `router.refresh()` after profile mutations |
| `/notifications/preferences` (BE-NTF-09) | GET | `items[]: { type, category, label, inApp, email, locked, lockedReason \| null }` | TanStack key `settings.preferences`, `staleTime` 60 s |
| `/family/parents` (proposed, student side of BE-FAM-02 links) | GET | `items[]: { linkId, parentFirstName, parentLastNameInitial, linkedAt, sharing: { academics, wellbeingTrend, celebrations, activity } }` | TanStack key `settings.sharing` |
| `/family/children` (BE-FAM-06) | GET | Parent explainer: `items[]: { linkId, childFirstName, stage, sharing: { academics, wellbeingTrend, celebrations, activity } }` | Request-memoised |
| `/me/sessions` (BE-IDN-29) | GET | `items[]: { id, deviceLabel, browser, os, approximateArea \| null, createdAt, lastSeenAt, current }` | TanStack key `settings.sessions`, refetch on focus |
| `/me/export` status (BE-IDN-37, status read proposed) | GET | `latest \| null { id, status: queued \| preparing \| ready \| expired \| failed, requestedAt, readyAt \| null, expiresAt \| null }` | TanStack key `settings.export`, polls every 15 s only while `queued` or `preparing` and the tab is visible |
| `/billing/subscription` (BE-BIL-14) | GET | Deletion dialog only: `planCode`, `planName`, `status`, `currentPeriodEnd`, `coveredChildren` (parent plans) | Fetched when the dialog opens; skipped before Phase 6 |

### Mutations

| Endpoint (BE ID) | Method | Request | Client behaviour |
|---|---|---|---|
| `/me/profile` (BE-IDN-34) | PATCH | `{ firstName, lastName }` (1 to 50 chars each, trimmed, letters, spaces, apostrophes and hyphens) | Pending button, toast "Profile saved", `router.refresh()` so the shell name updates |
| `/me/profile` date of birth (BE-IDN profile date of birth, see backend/identity.md) | PATCH | `{ dateOfBirth }` for students or `{ adultConfirmed: true }` for parents (ISO date, not in the future, age 13 to 100); accepted only while `dateOfBirth` is null, later corrections go through support | Pending button, toast "Date of birth saved", `router.refresh()` so age-gated areas (affiliates, parental consent) re-evaluate |
| `/me/email-change` (proposed) | POST | `{ newEmail, currentPassword }` | Shows pending banner; email stays unchanged until the link in the new inbox is opened |
| `/me/email-change` (proposed) | DELETE | none | Cancels a pending change |
| `/me/onboarding/details` (BE-IDN-32) | PUT | Not called here; "Change" links to `/onboarding?step=details&returnTo=/dashboard/settings/profile` | |
| `/notifications/preferences` (BE-NTF-09) | PUT | `{ items: [{ type, inApp, email }] }` (full set, locked rows ignored by the server) | Optimistic per toggle, debounced 500 ms into one PUT, rollback and toast on failure; 409 refetches |
| `/family/links/{linkId}/privacy` (BE-FAM-11) | PUT | `{ academics, wellbeingTrend, celebrations, activity }` | Optimistic, rollback on failure; toast "Sharing updated for {parentFirstName}" |
| `/family/links/{linkId}` (BE-FAM-05) | DELETE | none | After confirm; card removed; toast "{parentFirstName} is no longer linked" |
| `/me/password` (BE-IDN-35) | POST | `{ currentPassword, newPassword }` (policy from `PasswordPolicy.cs`) | On success other sessions are revoked by the API; toast "Password changed. Other devices have been signed out." |
| `/me/sessions/{id}` (BE-IDN-30) | DELETE | none | Row removed after confirm |
| `/me/sessions?scope=others` (BE-IDN-30, shape to confirm) | DELETE | none | All non-current rows removed after confirm |
| `/me/export` (BE-IDN-37) | POST (plan lists GET; queuing work should be POST) | none | Returns existing active request if one exists (idempotent); status card switches to "Preparing" |
| `/me/deletion-request` (BE-IDN-36) | POST | `{ currentPassword, confirmation: "DELETE", reason \| null }` | Dialog closes, banner appears, toast "Deletion requested" |
| `/me/deletion-request` (proposed) | DELETE | none | Cancels during the cooling-off period |

All mutations go through `/api/bff` with generated hooks and generated zod schemas, so client and server validation match.

Additions from the 43f9faa review:

- Privacy choices read and write the local consent record through `web/src/lib/analytics/consent.ts` (FE-63, FE-156): `version`, `analytics` (bool; `marketing` exists in the record but stays false and unused in v1, decision 8), `decidedAt`, `source` (`banner` or `preferences`), plus `navigator.globalPrivacyControl`. No API call; the record is per device. (PG-CMN-SETTINGS-38)
- `/notifications/preferences` gains channel masters `emailEnabled` (and `pushEnabled` only if push ships). Per-type email switches are disabled while `emailEnabled` is false. Updates are partial, so one toggle never overwrites another (old `PATCH /api/notifications/preferences`). (PG-CMN-SETTINGS-39)
- v1 preference types carried from 43f9faa: `assessment_due` (in-app, optional email), `wellbeing_checkin_reminder` (daily, students only), `weekly_study_summary` (email, off by default). The old study-group reminder is dropped with study groups. (PG-CMN-SETTINGS-40)
- `PATCH /me/profile` also accepts `schoolName` (high school, optional, max 120) and `institutionId` (tertiary, from the institutions list), applying BE-IDN-32 validation. (PG-CMN-SETTINGS-43)

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | Suspense fallback | Visually hidden "Loading settings"; skeleton of side nav and two cards | None |
| Error (page) | `/me` fails | Title "We could not load your settings". Body "Check your connection and try again." | "Try again" (`retry`) |
| Error (section card) | One section loader fails (for example sessions) | Inside the card: "Could not load your devices." | "Try again" |
| Not found | Unknown or role-hidden section | Title "That settings page does not exist". Body "Pick a section from Settings." | Link "Back to settings" |
| Forbidden | Session lacks `account.manage` | Title "You cannot change settings for this account". Body "If you think this is wrong, contact support from Help." | Link "Go to Help" |
| Upgrade | Not applicable (free) | | |
| Saved | Any successful save | Toast: "Profile saved" / "Password changed. Other devices have been signed out." / "Sharing updated for {name}" / "Preferences saved" | |
| Save failed (validation) | 400 with field errors | Inline under the field, from the server ProblemDetails, for example "Use 50 characters or fewer." | Fix and resubmit |
| Save failed (other) | Network or 5xx | Toast "Could not save that change. Try again." | Toast action "Try again" |
| Wrong current password | 400 on password, email change or deletion | Inline: "That password is not right." | |
| Too many attempts | 429 | Inline: "Too many attempts. Wait a few minutes and try again." | |
| Email change pending | `pendingEmail` set | Banner in Profile: "We sent a link to {pendingEmail}. Your email stays {email} until you open it." | "Resend link", "Cancel change" |
| Date of birth missing | Student with `dateOfBirth` null (parents instead see a one-time "I confirm I am 18 or older" checkbox when `adultConfirmedAt` is null; DECISIONS.md E) | Profile card "Add your date of birth". Body "We need it to apply the right rules for your age, such as parental consent and who can join the referral programme. You can only set it once." | Date field and "Save"; arriving from `/refer` with `?next=` returns there after saving |
| Email unverified | `emailVerified` false | Banner: "Verify your email to change your password, export data or delete your account." | "Resend verification email" |
| Google-only account | `hasPassword` false | Password card: "You sign in with Google. To add a password, use Forgot password on the log in page." | Link "Set a password" to `/forgot-password` |
| Privacy empty (student) | No linked parents | "No parents are linked to your account. If a parent invites you, you choose what they can see before anything is shared." | None |
| Privacy (parent) | Parent role | Explainer, see Copy | None |
| Export queued or preparing | status `queued` or `preparing` | "We are preparing your data. We will email you when it is ready, usually within 24 hours." | None |
| Export ready | status `ready` | "Your data is ready to download until {expiresAt}." | "Download" (presigned link from the API) |
| Export expired or failed | status `expired` or `failed` | Expired: "Your last download link has expired." Failed: "We could not prepare your data. Request it again or contact support." | "Request a new copy" |
| Deletion pending | `deletionRequest` set | Banner on every settings page: "Your account is scheduled for deletion on {scheduledFor}. You can cancel until then." | "Cancel deletion" |
| No evidence | Not applicable | | |
| Populated | Default | Sections as in Layout | |

## Stage variants

- **High school student**, Profile shows: Grade (8 to 12), Curriculum (NSC or IEB), School (optional, "Not set" when empty). Label "Grade 11 on CAPS (NSC)".
- **University or college student**, Profile shows: Year of study, Institution. Label "Year 2 at University of Johannesburg". No Grade, curriculum or school wording.
- "Change" on stage details links to the onboarding details step, which applies the onboarding rules (BE-IDN-32). Changing between high school and university is not offered here (see Open questions); the card says "Moving from school to university? Contact support and we will move your subjects across."
- Notification preference labels come from the API per stage ("SBA task due" vs "Assignment due").
- Privacy sharing labels are stage-aware: academics toggle reads "Subjects, marks and deadlines" (high school) or "Courses, marks and deadlines" (university, decision 27).
- Parent and admin profiles have no stage fields.

## Interactions and edge cases

- Each card saves on its own; leaving a section with unsaved edits in a form shows the browser's native "unsaved changes" prompt only for Name, Email and Password forms (not for autosaved switches).
- Email change: requires a verified current email and the current password (re-authentication). The new address gets a link valid for 24 hours; the old address gets a notice "Your email is being changed" with a cancel link. Changing to an address already in use gives the same pending message (no account enumeration); the API simply never sends a link.
- Name change updates the shell and account menu after `router.refresh()`.
- Notification preferences: security and receipt types (`security_new_session`, `billing_receipt`, `account_export_ready`) are locked on for email with the reason "Needed to keep your account safe" or "Required for your records". In-app is always on for every type in v1 (the toggle shows disabled).
- Sharing controls are enforced by the API (BE-FAM-07 to BE-FAM-10 read the flags); the UI never hides data on its own. Turning a toggle off takes effect on the parent's next request. Diary content has no toggle because it is never shareable.
- Default sharing after a student accepts an invite: academics on, celebrations on, wellbeing trend off, activity off (set in the accept flow, BE-FAM-04); shown here so the student can change it.
- Student unlinking a parent: confirm dialog names the parent; the parent is notified (`family_link_changed`); if that parent pays for the student's plan, the dialog adds "{parentFirstName} pays for your plan. Unlinking ends that cover at the end of the billing period." (Phase 6, reads the seat from the billing contract via BE-FAM-06 data; hidden before).
- Parent explainer: per child, lists the four areas with "Shared" or "Not shared" badges, and states "Your child chooses this in their settings. You cannot change it." Diary always shows "Never shared".
- Password change: new password must meet `PasswordPolicy.cs` (shown as hints before typing), must differ from the current one, and confirm must match. Success revokes other sessions; the current session stays.
- Sessions: the current device shows a "This device" badge and has no "Sign out" button (use the account menu). Revoked sessions lose access within the 15-minute access token lifetime plus immediate refresh failure (`SessionRevocationCache.cs`); the copy says "within a few minutes".
- Export: one active request at a time (the API returns the existing one). The download link opens a presigned GET from the API and requires the user to be signed in to fetch it. The emailed link points to this page, never to a file URL.
- Deletion: requires verified email, current password and typing DELETE. Cooling-off period of 14 days (decision 38), during which the user can still sign in and cancel. After the period the account is deleted by the backend job.
- Deletion with an active subscription (Phase 6): the dialog shows "Your {planName} plan will be cancelled now. You keep access until {scheduledFor} and will not be charged again." Parent plans add "{n} children covered by your plan will move to the free plan."
- Deletion by a minor (`isMinor`): allowed, and the dialog adds "Because you are under 18, a linked parent will be told about this request." Linked parents get a notification; whether parental consent is required is an open question.
- Retention notice in the dialog: "Some records must be kept by law after deletion, such as invoices and tax statements, for 5 years. They are not used for anything else."
- Admin: Privacy is hidden and deletion is not offered ("Admin accounts are closed by the operations team.").
- A session that becomes unauthorised mid-form (refresh failed) redirects to `/login?returnTo=` with the section path; form values are not persisted.
- Profile values always come from `/me` on the server, never from the session cookie snapshot, which goes stale after any change (old bug). After a name change the Auth.js session is updated so the account menu shows the new name. (PG-CMN-SETTINGS-41)
- Privacy choices: shows the current choice in plain words with its date; two equally weighted buttons "Allow" and "Do not allow", no pre-ticked switches and no Save step. With Global Privacy Control on, both buttons are disabled and the card explains the signal wins. Sign-in cookies are essential and not part of the choice. Shown to every role, including parents and admins. (PG-CMN-SETTINGS-38)
- Diary note honesty: 43f9faa's help FAQ admitted diary entries were stored on the server without end-to-end encryption and read by AI for the mood trend. The note on this page must state what BE-WEL-04 and decision 7 actually deliver, and may not say staff cannot read entries unless that is true. (PG-CMN-SETTINGS-42)
- High school students can change their school name in place; tertiary students pick their institution from a searchable list. Grade, year of study and curriculum still go through the onboarding details step because they change study units. (PG-CMN-SETTINGS-43)
- Parent profile asks for name and email only. The old parent page showed a phone field that saved nothing; it is not carried over (data minimisation).

## Copy

| Key | Text |
|---|---|
| Title | Settings |
| Description | Your profile, notifications, privacy and security. |
| Profile card | Your name |
| Email card | Email |
| Email help | We send a link to the new address. Nothing changes until you open it. |
| Stage card title | What you study |
| Stage help | Your grade or year sets the level of your practice tests and tutor answers. |
| Appearance body | Aptiverse follows your device's light or dark setting. To switch, change it in your phone or computer settings. Reduced motion follows your device too. |
| Language body | Aptiverse is in English for now. |
| Notifications intro | Choose how we reach you. Security messages and receipts are always emailed. |
| Privacy intro (student) | You choose what each linked parent can see. They never see your diary or your check-in notes. |
| Sharing toggles | Subjects, marks and deadlines (or Courses, marks and deadlines) / Wellbeing trend (a weekly mood summary, never your notes) / Celebrations / Activity (what you completed and when) |
| What they see summary | {parentFirstName} sees: {list}. {parentFirstName} does not see: your diary, your check-in notes{, and any area you turned off}. |
| Diary note | Draft until PG-CMN-SETTINGS-42: "Your diary is private to you. No parent or school can see it." Add an encryption or AI-reading statement only once BE-WEL-04 and decision 7 confirm it. |
| Parent explainer title | What you can see |
| Parent explainer body | Your child chooses what you can see in their settings. You will never see their diary or check-in notes. |
| Password card | Change password |
| Sessions card | Devices signed in |
| Sign out others | Sign out all other devices |
| Sign out others confirm | Sign out all other devices? Anyone using them will need to log in again. |
| Export card | Download your data |
| Export body | Get a copy of everything you have added to Aptiverse, as a zip of JSON and CSV files. |
| Delete card | Delete your account |
| Delete body | We delete your account and everything in it after 14 days. You can cancel until then. |
| Delete confirm label | Type DELETE to confirm |
| Delete button | Request deletion |

- Privacy choices title: "Privacy choices". Body: "We would like to count how Aptiverse is used, such as which pages people open and which features they use, so we can improve it. We do not use advertising tags, and nothing is shared with advertisers."
- Current choice lines: "You allowed usage measurement on {date}." / "You turned usage measurement down on {date}." / "You have not made a choice yet, so nothing is counted beyond anonymous page views." / GPC: "Your browser sends a Global Privacy Control signal, so usage measurement is off and stays off."
- Essential cookies note: "Cookies that keep you signed in are not affected by this choice. The service needs them to work."
- Email master off hint: "Email is off for all notifications. Turn it on to choose which ones you get by email."
- In-app note: "In-app notifications are always on."
- Diary note: final wording is set by PG-CMN-SETTINGS-42; the row above is a draft until then.

## Acceptance criteria

- **AC-01** Given a student on mobile, when they open `/dashboard/settings`, then they see rows for Profile, Appearance, Language, Notifications, Privacy, Security and Your data, each a link of at least 44px.
- **AC-02** Given an admin, when they open `/admin/settings`, then Privacy is not listed and `/admin/settings/privacy` shows "That settings page does not exist".
- **AC-03** Given a desktop student, when they open `/dashboard/settings`, then the side nav shows with Profile marked current and the Profile section renders.
- **AC-04** Given a student edits their first name to "Thandeka" and saves, when the save succeeds, then the toast "Profile saved" shows and the account menu shows "Thandeka".
- **AC-05** Given a first name of 51 characters, when they save, then the field shows "Use 50 characters or fewer." and nothing is sent twice.
- **AC-06** Given a verified student requests an email change with the correct password, when it succeeds, then the banner "We sent a link to {new}. Your email stays {old} until you open it." shows and `/me.email` is unchanged.
- **AC-07** Given a high school student, when they open Profile, then they see Grade, Curriculum and School and no "Year of study"; given a university student, they see Year of study and Institution and no Grade.
- **AC-08** Given the Appearance section, when it renders, then there is no theme control and the copy says it follows the device.
- **AC-09** Given a student turns off email for "Assessment due", when the debounced save succeeds, then reloading the page shows it off; and the "New sign-in" row is disabled with "Needed to keep your account safe".
- **AC-10** Given a student linked to one parent, when they turn off "Wellbeing trend", then a request by that parent to BE-FAM-08 returns the not-shared response, and the parent's wellbeing page shows the not-shared state.
- **AC-11** Given a parent, when they open Privacy, then they see each child's sharing state as read-only badges and "Never shared" for the diary, with no switches.
- **AC-12** Given a correct current password and a valid new one, when the student changes their password, then other sessions are revoked and the toast says "Password changed. Other devices have been signed out."
- **AC-13** Given two sessions, when the user signs out the other one, then it disappears from the list and that device's next refresh fails.
- **AC-14** Given an export is preparing, when the user requests another, then the same request is shown and no second job is created.
- **AC-15** Given a verified student with no subscription, when they type DELETE, enter their password and confirm, then the deletion banner shows the date 14 days ahead with "Cancel deletion".
- **AC-16** Given a pending deletion, when the user chooses "Cancel deletion", then the banner disappears and `/me.deletionRequest` is null.
- **AC-17** Given a parent on `parent.2` requests deletion (Phase 6), when the dialog opens, then it states the plan is cancelled now, access lasts to the period end, and 2 children move to the free plan.
- **AC-18** Given a student under 18 requests deletion, when the dialog opens, then it says a linked parent will be told.
- **AC-19** Given a Google-only account, when Security opens, then no password form shows and the "Set a password" link goes to `/forgot-password`.
- **AC-20** Given Global Privacy Control is on, when a user opens Privacy choices, then both buttons are disabled and the GPC line is shown.
- **AC-21** Given a user taps "Do not allow", when the decision is saved, then no custom analytics events are sent on later pages and the card shows "You turned usage measurement down on {date}."
- **AC-22** Given email is turned off at the channel level, when the user views notification preferences, then every per-type email switch is disabled with the hint.
- **AC-23** Given a student renames themselves, when the save succeeds, then the account menu shows the new name without signing out.
- **AC-24** Given an account with no date of birth arriving from `/refer?next=/refer`, when the user saves a valid date, then `/me.dateOfBirth` is set, the card turns read-only, a second PATCH is refused, and the user is returned to `/refer`.

## Production readiness

### Security

- [ ] Re-authentication (current password) and a verified email are enforced by the API for email change, password change, export and deletion (BE-IDN-38), not only by the form (Q16).
- [ ] Sharing toggles are enforced server-side on every parent read; an end-to-end test flips a toggle and asserts the parent API response changes (Q18).
- [ ] No cross-family leakage: the student sees only their own links; a parent explainer only lists linked children; tested with two families (Q18).
- [ ] All mutations go through `/api/bff` (same-origin check, httpOnly session), so no CSRF and no token in the browser (Q16).
- [ ] Password change revokes other refresh token families; revoked sessions fail within the access token lifetime (Q17).
- [ ] No PII in URLs or logs: emails never in query strings (the email change flow posts in the body), form values scrubbed from Sentry, analytics carry no values (Q19).

### Privacy and POPIA

- [ ] Data minimisation: the profile asks only for name, email and study details; school is optional (Q24).
- [ ] Minors: deletion and sharing flows for under-18 students reviewed against the parent consent model (BE-FAM-14); linked parent notified on deletion request (Q24).
- [ ] Export contents list documented in the privacy policy and matched by the export job; retention list in the deletion dialog matches the retention policy (Q24, Q27).
- [ ] Diary note wording matches the actual encryption design (BE-WEL-04); no "end-to-end" claim unless true (Q27).

### Performance

- [ ] Each section route ships only its own client islands; route JS under 150 KB gzip (Q20).
- [ ] LCP under 2.5 s on Lighthouse mobile for the index and the Security section (Q20).
- [ ] Cache: per-user, no shared cache; export polling only while preparing and the tab is visible (Q20).

### Resilience

- [ ] Every submit button disables while pending; the API treats export requests idempotently and deletion requests as one active request per user (Q21).
- [ ] Preference autosave handles 409 (concurrent edit in another tab) by refetching and reapplying the last toggle (Q21).
- [ ] Billing API outage while opening the deletion dialog shows "We could not check your plan. Try again before deleting." and blocks submit, rather than deleting without the warning (Q21).

### Observability

- [ ] Sentry boundary per settings route with tags `{ page: "PG-CMN-SETTINGS", section, role }` and trace propagation through `fetcher.ts` (Q22).
- [ ] Analytics events (consent-gated, no values): `settings_section_viewed { section }`, `settings_profile_saved`, `settings_email_change_requested`, `settings_password_changed`, `settings_session_revoked { scope }`, `settings_preferences_saved`, `settings_sharing_changed { area, enabled }`, `settings_parent_unlinked`, `settings_export_requested`, `settings_deletion_requested`, `settings_deletion_cancelled` (Q22).

### Accessibility (WCAG 2.2 AA)

- [ ] Accessible authentication (3.3.8): password fields allow paste and password managers (`autocomplete="current-password"` and `"new-password"`); no cognitive tests (Q23).
- [ ] Redundant entry (3.3.7): the deletion dialog does not ask for information already given; email change prefills nothing it does not need (Q23).
- [ ] Switches have visible labels and state text; error summaries link to fields; focus returns to the trigger when dialogs close; sticky side nav never covers focused content (2.4.11) (Q23).

### Rollout

- [ ] Phase 2 ships Profile, Appearance, Language, Notifications, Security and export behind `flags.settings`; Privacy controls ship behind `flags.parentTrack` with Phase 8; deletion ships behind `flags.popiaSelfService` once the deletion job and runbook exist. Turning a flag off hides the section and its row; data is untouched (Q25).

### Monitoring and alerts

- [ ] Alerts: password change or profile save 5xx rate above 2% for 10 minutes; export jobs stuck in `queued` or `preparing` for more than 24 hours; export failure rate above 5% per day; deletion requests past `scheduledFor` and not processed; spike in session revocations above 5x baseline (possible account takeover) (Q26).

## Build tasks

- [ ] **PG-CMN-SETTINGS-01** Settings layout with section nav (list on mobile)
- [ ] **PG-CMN-SETTINGS-02** Profile (name, email, stage fields)
- [ ] **PG-CMN-SETTINGS-03** Appearance note (follows system, no toggle)
- [ ] **PG-CMN-SETTINGS-04** Language (decide v1 languages; ship read-only "English" until decided)
- [ ] **PG-CMN-SETTINGS-05** Notification preferences
- [ ] **PG-CMN-SETTINGS-06** Privacy: parent sharing controls (student), diary encryption note
- [ ] **PG-CMN-SETTINGS-07** Security: change password, sessions list, sign out others
- [ ] **PG-CMN-SETTINGS-08** Data: export request, delete account request
- [ ] **PG-CMN-SETTINGS-09** (01) Route segments for the three areas: `settings/layout.tsx`, `page.tsx`, `[section]/page.tsx`, `notFound()` for unknown or hidden sections
- [ ] **PG-CMN-SETTINGS-10** (01) Section registry `features/settings/lib/sections.ts` with role visibility and summaries, unit tested per role
- [ ] **PG-CMN-SETTINGS-11** (01) Mobile index list and desktop side nav with `aria-current`; index renders Profile at `lg`
- [ ] **PG-CMN-SETTINGS-12** (01) Mobile back link on section pages
- [ ] **PG-CMN-SETTINGS-13** (02) Server loader `get-me.ts` and Profile read card
- [ ] **PG-CMN-SETTINGS-14** (02) Name form (`PATCH /me/profile`, generated zod, toast, `router.refresh()`)
- [ ] **PG-CMN-SETTINGS-15** (02) Email change form with current password, pending banner, resend and cancel (depends on the proposed email-change slice)
- [ ] **PG-CMN-SETTINGS-16** (02) Student stage details card, stage-aware labels, "Change" link to the onboarding details step with `returnTo`
- [ ] **PG-CMN-SETTINGS-17** (02) Unverified email banner with resend (BE-IDN-24)
- [ ] **PG-CMN-SETTINGS-18** (05) Preferences matrix grouped by category with in-app and email switches
- [ ] **PG-CMN-SETTINGS-19** (05) Locked rows rendered disabled with their reason
- [ ] **PG-CMN-SETTINGS-20** (05) Debounced optimistic autosave with rollback toast and 409 refetch
- [ ] **PG-CMN-SETTINGS-21** (06) Student sharing cards per linked parent with four switches (BE-FAM-11), stage-aware academics label
- [ ] **PG-CMN-SETTINGS-22** (06) "What they see" summary per parent, derived from the toggles (pure function, unit tested)
- [ ] **PG-CMN-SETTINGS-23** (06) Diary privacy note and the no-parents empty state
- [ ] **PG-CMN-SETTINGS-24** (06) Unlink a parent from the student side with `ConfirmDialog` (BE-FAM-05), including the paid-cover warning when present
- [ ] **PG-CMN-SETTINGS-25** (06) Parent "What you can see" read-only explainer per child (BE-FAM-06)
- [ ] **PG-CMN-SETTINGS-26** (07) Change password form with policy hints, confirm match and autocomplete attributes
- [ ] **PG-CMN-SETTINGS-27** (07) Google-only account state with "Set a password" link
- [ ] **PG-CMN-SETTINGS-28** (07) Sessions list with "This device" badge (BE-IDN-29)
- [ ] **PG-CMN-SETTINGS-29** (07) Sign out one session with confirm (BE-IDN-30)
- [ ] **PG-CMN-SETTINGS-30** (07) Sign out all other devices with confirm (BE-IDN-30)
- [ ] **PG-CMN-SETTINGS-31** (08) Export request and status card with visible-tab polling and download (BE-IDN-37)
- [ ] **PG-CMN-SETTINGS-32** (08) Delete account dialog: consequences, typed DELETE, password, optional reason (BE-IDN-36)
- [ ] **PG-CMN-SETTINGS-33** (08) Deletion pending banner on every settings route with cancel (depends on the proposed cancel slice)
- [ ] **PG-CMN-SETTINGS-34** (08) Subscription-aware deletion warning from BE-BIL-14, including covered children for parent plans (Phase 6)
- [ ] **PG-CMN-SETTINGS-35** (08) Minor-account deletion note and retention notice in the dialog
- [ ] **PG-CMN-SETTINGS-36** (08) Admin variant of Your data: export only, closure note
- [ ] **PG-CMN-SETTINGS-37** Section summaries on the index rows (name and stage, preferences count, parents shared with, devices signed in)
- [ ] **PG-CMN-SETTINGS-38** Privacy choices card (usage measurement; no advertising tag in v1, decision 8): current choice line, GPC handling, two equal buttons, essential cookies note, wired to `lib/analytics/consent.ts` with source `preferences`
- [ ] **PG-CMN-SETTINGS-39** Channel master switches (email; push only if it ships) with the in-app always-on note and dependent per-type email switches
- [ ] **PG-CMN-SETTINGS-40** Seed v1 preference types with BE-NTF-06: assessment due, daily wellbeing check-in reminder (students), weekly study summary; study-group reminder dropped
- [ ] **PG-CMN-SETTINGS-41** Profile from `/me` per request, never the session snapshot; Auth.js session update after a name change
- [ ] **PG-CMN-SETTINGS-42** Diary note final wording agreed against BE-WEL-04 and decision 7 (no end-to-end or staff-cannot-read claim unless true)
- [ ] **PG-CMN-SETTINGS-44** Date of birth card on Profile, shown only while a student's `dateOfBirth` is null (parents: the one-time 18 or older confirmation while `adultConfirmedAt` is null): date field, once-only save via the BE-IDN profile date of birth slice (see backend/identity.md), `next` return to the page that sent the user (affiliate under-18 rule, parental consent), read-only display once set with "Contact support to correct it"
- [ ] **PG-CMN-SETTINGS-43** In-place school name (high school) and institution picker (tertiary) on Profile via `PATCH /me/profile`

## Quality tasks

- [ ] **PG-CMN-SETTINGS-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` for the `[section]` segment
- [ ] **PG-CMN-SETTINGS-Q02** Server loaders in `src/features/settings/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-CMN-SETTINGS-Q03** Client mutations through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-CMN-SETTINGS-Q04** Empty states with one clear next action (no linked parents, no other sessions, no export yet)
- [ ] **PG-CMN-SETTINGS-Q05** Error state copy: what went wrong and how to fix it (page, card and field level)
- [ ] **PG-CMN-SETTINGS-Q06** Forbidden state; no upgrade state (free)
- [ ] **PG-CMN-SETTINGS-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-CMN-SETTINGS-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-CMN-SETTINGS-Q09** Layout at 1440px (side nav, content width)
- [ ] **PG-CMN-SETTINGS-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-CMN-SETTINGS-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-CMN-SETTINGS-Q12** axe: zero violations in light and dark on every section
- [ ] **PG-CMN-SETTINGS-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order, switches operable with Space
- [ ] **PG-CMN-SETTINGS-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-CMN-SETTINGS-Q15** `generateMetadata` title per section; nav entry active state correct
- [ ] **PG-CMN-SETTINGS-Q16** Security: API rejects email change, password, export and deletion without re-auth or verified email (integration tests); BFF rejects cross-origin mutations
- [ ] **PG-CMN-SETTINGS-Q17** Sessions: password change revokes other families; a revoked session's refresh fails; current session excluded from "sign out others"
- [ ] **PG-CMN-SETTINGS-Q18** Consent enforcement end to end: toggle off, parent API and parent page reflect it; second family cannot see the first family's links
- [ ] **PG-CMN-SETTINGS-Q19** PII review: no emails in URLs, Sentry scrubbing of form fields, analytics without values, server logs without request bodies for these routes
- [ ] **PG-CMN-SETTINGS-Q20** Performance: Lighthouse mobile LCP under 2.5 s on index and Security; route JS under 150 KB gzip; export polling stops when hidden
- [ ] **PG-CMN-SETTINGS-Q21** Resilience: double submit guarded on every form; idempotent export; 409 handling on preferences; billing outage blocks deletion with a clear message
- [ ] **PG-CMN-SETTINGS-Q22** Observability: Sentry tags per section and the analytics events listed in Production readiness
- [ ] **PG-CMN-SETTINGS-Q23** WCAG 2.2 AA: accessible authentication, redundant entry, focus not obscured, dialog focus return, switch labelling
- [ ] **PG-CMN-SETTINGS-Q24** POPIA review: data minimisation, minors' deletion and sharing flows, export contents and retention list signed off
- [ ] **PG-CMN-SETTINGS-Q25** Rollout: `flags.settings`, `flags.parentTrack` and `flags.popiaSelfService` gates with documented rollback
- [ ] **PG-CMN-SETTINGS-Q26** Monitoring: alerts for save 5xx, stuck or failed exports, unprocessed deletions and session revocation spikes
- [ ] **PG-CMN-SETTINGS-Q27** Copy and legal review of the diary note, export and deletion text against the privacy policy (PG-MKT-LEGAL)
- [ ] **PG-CMN-SETTINGS-Q28** Consent record audit: versioned record, GPC respected, no `track()` event before an explicit allow or after a revoke, and no request to any advertising domain in any state (Playwright network assertion on every role's settings route)

## Tests

### Unit (Vitest)

- `features/settings/lib/sections.test.ts`: student sees 7 sections, parent 7 with read-only privacy, admin 6 without privacy; unknown id returns undefined.
- `features/settings/lib/sharing-summary.test.ts`: all on, all off, wellbeing only; diary always in the "does not see" list.
- `features/settings/components/profile/name-form.test.tsx`: trims, rejects 51 characters, shows server field error.
- `features/settings/components/notifications/notification-preferences.test.tsx`: locked rows disabled, debounce batches toggles into one PUT, rollback on failure.
- `features/settings/components/security/password-form.test.tsx`: confirm mismatch, policy hints, paste allowed.
- `features/settings/components/data/delete-account-dialog.test.tsx`: submit disabled until DELETE typed and password entered; subscription and minor notes appear when data says so; billing failure blocks submit.

### Playwright

- "account without a date of birth sets it once and returns to /refer" (AC-24).

- `settings.spec.ts` "student sees all sections on mobile" (AC-01) and "admin has no privacy section" (AC-02).
- "desktop lands on profile with side nav" (AC-03).
- "edit name updates account menu" (AC-04) and "name too long shows field error" (AC-05).
- "email change shows pending banner" (AC-06).
- "stage fields differ for high school and university" (AC-07), using the HS and uni student setups from FE-52.
- "appearance has no toggle" (AC-08).
- "notification preference persists and locked row is disabled" (AC-09).
- "student turns off wellbeing sharing and parent sees not shared" (AC-10, two browser contexts).
- "parent privacy is read only" (AC-11).
- "change password signs out other devices" (AC-12, two contexts) and "sign out one session" (AC-13).
- "export request is idempotent" (AC-14).
- "request and cancel deletion" (AC-15, AC-16); "parent deletion warns about covered children" (AC-17, Phase 6); "minor deletion note" (AC-18).
- "google only account has no password form" (AC-19).
- axe in light and dark on every section, Pixel 7, iPhone 14, desktop Chrome.
- Unit `privacy-choices.test.tsx`: three current-choice lines, GPC disables both buttons, decision writes source `preferences` and the current version.
- Unit `preferences-matrix.test.tsx`: email master off disables per-type email switches; partial update payload has one key.
- Playwright `privacy choices allow then do not allow`, `gpc signal disables choices`, `name change updates account menu without sign out`, `high school student changes school`, `tertiary student picks institution`.

## Open questions

- Email change is BE-IDN-49 in `../../backend/identity.md` (`POST /me/email` with re-verification).
- Students need a list of their linked parents with sharing flags; BE-FAM-06 is parent-side only. Proposed: `GET /family/parents`.
- Decided (section E of DECISIONS.md): Family owns all sharing flags (BE-FAM-11); Wellbeing reads them through a contract.
- BE-IDN-37 is listed as `GET /me/export` but it queues work; recommend `POST /me/export` plus `GET /me/export` for status.
- Decided (38): deletion cooling-off is 14 days. Still open: a cancel endpoint, whether a minor's deletion needs parental consent, and whether deletion cancels a subscription immediately with no refund or at period end.
- Moving between high school and university: allowed self-service (it changes study units and enrolments) or via support only? This page assumes support only.
- v1 languages: the old brief listed English, isiZulu, Afrikaans and isiXhosa; this page ships English only until decided.
- Decided (36): the diary note says "encrypted at rest and never shown to parents" until the key design in BE-WEL-04 is built; never "end-to-end".
- The original single-file backlog maps `admin/settings` to `PG-ADM-SETTINGS`, while this page's route list includes `/admin/settings`. Recommendation: admin uses this shared page for personal settings; `PG-ADM-SETTINGS` covers platform settings at a different route.
- Decided (66): typed config flags in `web/src/lib/flags.ts` (owned by FE-84); `flags.settings`, `flags.parentTrack` and `flags.popiaSelfService` live there.
- Push notifications: the old app had a push switch with no push delivery behind it. Is web push in v1? If not, no push switch ships.
- Should analytics consent be stored server-side per account (so it follows the person across devices) as well as per device? The old app kept it per device only. (No advertising consent exists in v1, decision 8.)
- Is self-service school or institution change acceptable without support review?
