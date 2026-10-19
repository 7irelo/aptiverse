# Children

| | |
|---|---|
| ID | `PG-PAR-CHILDREN` |
| Route | `/parent/students` (`?invite=1` opens the invite sheet) |
| Phase | 8 |
| Roles | parent |
| Stages | high school, university (per child) |
| Entitlement | free (linking never needs a plan; seat coverage is shown, not required) |
| Depends on | BE-FAM-03, BE-FAM-05, BE-FAM-06, BE-FAM-14, BE-BIL-14 (seat flags), BE-BIL-19 (seat change, linked out to billing), proposed invite list, resend and cancel endpoints (see open questions), UI-07, UI-10, UI-25, FE-24, FE-25 |
| Old app reference | `43f9faa:web/src/app/(app)/parent/students/page.tsx` (invite, pending, unlink, plus per-child coverage: "{n} of {m} students covered", "Cover with Pro", "Cover with Max", "Upgrade to Max", "Switch to Pro"), `43f9faa:api/Controllers/ParentLinksController.cs` (invites, `mine`, delete, overview, student-side accept and decline, public `/invite/{token}` resolve), `43f9faa:web/src/lib/api/queries.ts` (`useChildren`, `useSetChildPlan` on `PUT /api/entitlements/children/{id}/plan`) |
| Status | Not started (0 of 45 tasks) |

## Purpose

Where a parent manages the family links: see every linked child, invite a new one, follow up on invites that have not been accepted, give consent for under-18 children, and unlink. Linking always needs the student's acceptance (student-side consent, BE-FAM-04); a parent can never attach a student on their own.

## User stories

- As a parent, I invite my child by email and know exactly what happens next.
- As a parent, I see which invites are still pending, when they expire, and can resend or cancel them.
- As a parent of a 15 year old, I give my consent so my child can keep using Aptiverse (POPIA).
- As a parent, I can unlink a child, understand what that changes (I stop seeing their progress; their account and data stay theirs), and confirm deliberately.
- As a parent paying for a family plan, I see which children are covered by my plan's seats and where to change that.

## Layout

### Mobile (360px)

1. `PageHeader`: h1 "Children", description "Invite your children and manage what you are linked to." Primary button "Invite a child" (full width under the description).
2. Consent section (anchor `#consent`, only when needed): card per child needing consent, with "Give consent" button.
3. Linked children list: one card per active link: avatar, display name, `StageLine`, "Linked since {date}", sharing summary line ("Shares: academics, wellbeing trend" or "Shares: academics only"), seat badge, row of actions: "View" link and overflow menu (`DropdownMenu`) with "Unlink".
4. Pending invites section: h2 "Waiting to be accepted"; one row per invite: child name as typed by the parent, masked email (`t***@gmail.com`), "Sent {date}, expires {date}", buttons "Resend" and "Cancel invite" (each 44px).
5. Expired invites (collapsed `Accordion`, only when present): "Expired invites ({n})" with "Send again".
6. Footer note: "Your child can unlink from their side at any time. Linking never gives you access to their diary."

### Desktop (1440px)

- Header row with the "Invite a child" button right-aligned.
- Linked children as a `DataTable` (columns: child, stage, linked since, shares, plan, actions); collapses to the mobile cards below `md` (UI-26 card fallback).
- Pending and expired invites in a second table below.
- Invite sheet becomes a centred `Dialog` (ResponsiveDialog, UI-07).

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/parent/students/page.tsx` | server | `requireRole("parent")`; reads `searchParams.invite` to open the sheet |
| Loading | `web/src/app/(app)/parent/students/loading.tsx` | server | table and card skeleton |
| Error | `web/src/app/(app)/parent/students/error.tsx` | client | `PageState` retry; Sentry tag `PG-PAR-CHILDREN` |
| ChildrenView | `web/src/features/family/components/children-view.tsx` | server | sections and ordering |
| LinkedChildrenTable | `web/src/features/family/components/linked-children-table.tsx` | server | `DataTable` with card fallback; reuses `StageLine`, seat badge |
| SharingSummary | `web/src/features/family/components/sharing-summary.tsx` | server | read-only list of what the student shares |
| InviteChildSheet | `web/src/features/family/components/invite-child-sheet.tsx` | client | ResponsiveDialog plus form |
| InviteChildForm | `web/src/features/family/components/invite-child-form.tsx` | client | `useZodForm` with generated schema for BE-FAM-03 |
| PendingInvitesList | `web/src/features/family/components/pending-invites-list.tsx` | server | rows with client action buttons |
| InviteActions | `web/src/features/family/components/invite-actions.tsx` | client | resend and cancel mutations, pending state, cooldown |
| UnlinkChildDialog | `web/src/features/family/components/unlink-child-dialog.tsx` | client | `ConfirmDialog` destructive variant, typed-name confirm not required (two-step is enough) |
| ConsentCard | `web/src/features/family/components/consent-card.tsx` | client | consent statement plus checkbox and submit (BE-FAM-14) |
| Email mask helper | `web/src/features/family/lib/mask-email.ts` | shared | display only; API already returns masked email (see Data) |
| Loader | `web/src/features/family/server/get-children.ts` | server | shared with PG-PAR-DASH |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/family/children` (BE-FAM-06) | GET | `items[]` (`linkId`, `studentId`, `displayName`, `stage`, `grade`, `curriculum`, `yearOfStudy`, `institutionName`, `linkedAt`, `sharing.*`, `seat.covered`, `seat.endsAt`, `parentConsentRequired`, `consentStatementVersion`) | none shared |
| `/family/invites` (proposed, gap in BE list) | GET | `items[]` (`inviteId`, `childName`, `emailMasked`, `sentAt`, `expiresAt`, `status` (`pending`, `expired`), `resendAvailableAt`) | none shared |

### Mutations

| Endpoint (BE ID) | Method | Request | Success | Failures (HTTP to copy) | Notes |
|---|---|---|---|---|---|
| `/family/invites` (BE-FAM-03) | POST | `childName` (1 to 60 chars), `email` (valid, max 254), `relationship` (`parent`, `guardian`), `idempotencyKey` | 201 `inviteId`, `expiresAt` | 409 already linked: "You are already linked to this account." 409 invite pending: "You already invited this email. Resend it from the list below." 422 own email: "Use your child's email, not your own." 429: "You have sent a lot of invites. Try again in an hour." | email sent by Notifications; the response never says whether the email has an account (no enumeration) |
| `/family/invites/{id}/resend` (proposed) | POST | none | 202, new `resendAvailableAt` | 429 cooldown: "You can resend this in {minutes} minutes." 404: "This invite no longer exists." | 15 minute cooldown, max 5 resends |
| `/family/invites/{id}` (proposed) | DELETE | none | 204 | 404 treated as success (already gone) | token invalidated server-side |
| `/family/links/{id}` (BE-FAM-05) | DELETE | none | 204 | 404 treated as success | publishes `FamilyLinkRemoved` |
| `/family/links/{id}/parent-consent` (BE-FAM-14, path proposed) | POST | `statementVersion`, `confirmed: true` | 204 | 409 statement version outdated: "The consent statement changed. Read the new version and confirm again." | API records version, timestamp, IP and user agent like `user_consents` |

All mutations go through `/api/bff` with generated TanStack hooks, carry an `Idempotency-Key` header, disable their button while pending, and end with `router.refresh()`.

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | first render | "Loading your children" (screen reader) | skeleton |
| Empty | no links, no invites | Title "No children linked yet". Body "Send an invite to your child's email. They accept it from their own account, so they always know you are linked." | "Invite a child" |
| Error | children or invites load fails | Title "We could not load your children". Body "Check your connection and try again." | "Try again" |
| Forbidden | non-parent | Title "This page is for parents". | link to role home |
| Invite sent | POST 201 | Toast "Invite sent to {emailMasked}. It expires on {date}." | sheet closes, list refreshes |
| Invite resent | resend 202 | Toast "Invite sent again." | cooldown starts |
| Invite cancelled | DELETE 204 | Toast "Invite cancelled." | row removed |
| Unlinked | DELETE link 204 | Toast "You are no longer linked to {firstName}." | card removed |
| Consent given | 204 | Toast "Thank you. Consent recorded for {firstName}." | consent card removed |
| Mutation error (generic) | 5xx or network | Toast "That did not work. Check your connection and try again." | button re-enabled |
| Expired invite | `status` expired | "Expired on {date}" | "Send again" (creates a new invite) |

## Stage variants

- `StageLine` as on the dashboard: "Grade 10, IEB" or "1st year, Wits".
- Consent cards appear only for children flagged `parentConsentRequired` (the API decides from date of birth; a university student who is 17 still needs it, an 18 year old Grade 12 learner does not). Copy never assumes stage from age.
- The invite form is stage-neutral: the parent does not pick the child's stage; the student sets it in their own onboarding.

## Interactions and edge cases

- Invite to an email that belongs to a parent or admin account: API accepts and sends a generic email; acceptance fails on the other side with a clear message there. The parent sees nothing different (no enumeration).
- Invite to an email with no account yet: the email invites them to sign up as a student; the invite token survives sign-up (BE-FAM-04).
- Invite expires (7 days, set by the API): row moves to expired; "Send again" creates a new invite with a new token.
- Student declines: the old API had a decline action (`POST invites/{token}/decline`), so the invite leaves pending and shows in the accordion as "Declined on {date}" with "Send again".
- Coverage on accept (43f9faa rule): when the student accepts, they move onto the parent's plan only if the parent holds a paid parent plan with a free place. Without one, the link still works (consent and the overview are the point) and the card shows "Not covered". A coverage failure never undoes the accepted link; it is reconciled later. This stops anyone getting a free paid plan by inviting a second address of their own.
- Per-child plan (43f9faa): each covered child was on Student Pro or Student Max; in v1 only Student Pro exists (decision 12), so only "Cover {firstName}" and the Pro chip render; the Max actions below are kept for when Max ships. The card shows the plan chip and actions "Cover with Pro", "Cover with Max", "Upgrade to Max", "Switch to Pro". When the parent's plan has no free place, the API returns 409 and the card says "Your plan covers {n} children. Add a place in Billing to cover {firstName}." with a link to `/parent/billing`.
- Invite to an email with no account: copy says they will get an email to join and will connect once they sign up; nothing is shared and no plan changes until they accept.
- The invite email links to the public `/invite/{token}` landing (owned by auth and onboarding pages), which handles signed-out, wrong-account and signed-in states; the accept still checks the signed-in email matches.
- Double click on "Send invite": the button is disabled on first click and the idempotency key makes a retry return the same invite.
- Unlink while a parent plan seat covers that child: the dialog explains "Your plan still covers {n} children. To pay for fewer, change your plan in Billing." with a link; unlinking never changes billing on its own.
- Student unlinks from their side: the card disappears on next load; no notification copy blames the student ("{firstName} is no longer linked" email is neutral, owned by Notifications).
- Re-linking after unlink: needs a fresh invite and acceptance.
- Consent for a child whose statement version changed: the card shows the new statement text and requires a fresh confirm.
- The same student linked to two parents (two households): each parent sees only their own link; sharing settings are per link (BE-FAM-02).
- Rate limit: more than 10 invites in an hour returns 429; the sheet shows the copy inline and keeps the form values.

## Copy

- h1 "Children"; description "Invite your children and manage what you are linked to."
- Invite sheet title "Invite a child"; body "We will email your child a link. They need to accept it from their own Aptiverse account before you can see anything."
- Fields: "Child's first name" (hint "So you can tell invites apart."), "Child's email", "You are their" (Parent, Guardian).
- Submit "Send invite"; cancel "Cancel".
- What you will see (inside the sheet): "You will see: academic standing, upcoming deadlines, celebrations, and a wellbeing trend if they choose to share it. You will never see: diary entries, check-in notes or chats with the AI tutor."
- Unlink dialog: title "Unlink {firstName}?"; body "You will stop seeing {firstName}'s progress. Their account, marks and diary stay theirs. You can link again later if they accept a new invite." Buttons "Unlink" (destructive) and "Keep linked".
- Consent card: title "Consent for {firstName}"; body "{firstName} is under 18. Under POPIA, we need a parent or guardian to agree to Aptiverse processing their information as described in our privacy policy." Checkbox "I am {firstName}'s parent or guardian and I agree." Link "Read the privacy policy". Button "Give consent".

## Acceptance criteria

- AC-01 Given a parent, when they submit a valid invite, then a toast confirms with the masked email and expiry, and the invite appears under "Waiting to be accepted".
- AC-02 Given an email that is already linked, when the parent invites it, then the inline error "You are already linked to this account." shows and no new invite exists.
- AC-03 Given an email of an unknown or existing account, when the parent invites it, then the success copy is identical (no account enumeration).
- AC-04 Given a pending invite resent less than 15 minutes ago, when the parent presses "Resend", then the button is disabled with "You can resend this in {minutes} minutes."
- AC-05 Given a pending invite, when the parent cancels it, then it disappears and the token no longer accepts.
- AC-06 Given a linked child, when the parent confirms unlink, then the child disappears from this page and from `/parent`, and `/parent/students/{id}` shows the not-linked state.
- AC-07 Given a child covered by a seat, when the parent opens the unlink dialog, then it states that billing is unchanged and links to Billing.
- AC-08 Given a child requiring consent, when the parent ticks the box and submits, then the consent card disappears and the dashboard banner is gone.
- AC-09 Given the invite form, when the parent double-clicks submit, then exactly one invite is created.
- AC-10 Given `?invite=1`, when the page loads, then the invite sheet is open with focus on the first field.
- AC-11 Given a list at 360px, when rendered, then every action is at least 44px tall and nothing scrolls horizontally.

## Production readiness

### Security
- [ ] All mutations go through `/api/bff` (same-site cookie, CSRF protection via the BFF's origin check and `SameSite=Lax`) with no token in the browser. PG-PAR-CHILDREN-Q16.
- [ ] Server enforces that a parent can only resend, cancel or unlink their own invites and links (BE-FAM-13); Playwright tries another family's `inviteId` and gets 404. PG-PAR-CHILDREN-Q16.
- [ ] Invite tokens never reach the parent's browser; only `inviteId` does. PG-PAR-CHILDREN-Q17.
- [ ] Emails are masked in every response and never logged; the child's email does not appear in URLs. PG-PAR-CHILDREN-Q17.

### Privacy and POPIA
- [ ] Parent consent records the statement version and is shown only for flagged minors (BE-FAM-14). PG-PAR-CHILDREN-12.
- [ ] Unlink is immediate and the API stops returning child data on the next request; verified by an E2E that reloads the child detail after unlink. PG-PAR-CHILDREN-Q18.
- [ ] The "what you will and will not see" text is reviewed against BE-WEL-06 sharing rules. PG-PAR-CHILDREN-07.

### Performance
- [ ] LCP under 2.5 s mobile; invite sheet code is lazy loaded (`next/dynamic`) so route JS stays under 150 KB gzip. PG-PAR-CHILDREN-Q19.

### Resilience
- [ ] Idempotency keys on invite, resend, cancel, unlink and consent; double-click protection by disabling while pending. PG-PAR-CHILDREN-Q20.
- [ ] 404 on cancel or unlink treated as success (already done elsewhere). PG-PAR-CHILDREN-Q20.

### Observability
- [ ] Analytics: `parent_invite_sheet_opened`, `parent_invite_sent`, `parent_invite_failed` (prop `reason` code), `parent_invite_resent`, `parent_invite_cancelled`, `parent_child_unlinked`, `parent_consent_given`. No emails or names. PG-PAR-CHILDREN-Q21.
- [ ] Sentry boundary tagged `PG-PAR-CHILDREN`; mutation failures captured with the API trace id. PG-PAR-CHILDREN-Q21.

### Accessibility
- [ ] WCAG 2.2 AA: sheet traps focus and returns it to the trigger; inline errors linked by `aria-describedby`; redundant entry (3.3.7) avoided by keeping form values after an error. PG-PAR-CHILDREN-Q22.

### Rollout
- [ ] Behind `flags.parentTrack`; invite resend and cancel ship only when their endpoints exist, otherwise the buttons are not rendered. PG-PAR-CHILDREN-Q23.

### Monitoring and alerts
- [ ] Alert when invite POST 5xx rate exceeds 2% in 15 minutes, and when invite email bounces exceed 5% per day (Notifications metric). PG-PAR-CHILDREN-Q24.

## Build tasks

- [ ] **PG-PAR-CHILDREN-01** Linked children list (`LinkedChildrenTable` with card fallback)
- [ ] **PG-PAR-CHILDREN-02** Invite a child sheet (`InviteChildSheet` shell, opens from button and `?invite=1`)
- [ ] **PG-PAR-CHILDREN-03** Pending invites (resend, cancel): list rendering
- [ ] **PG-PAR-CHILDREN-04** Unlink with confirm (`UnlinkChildDialog`, mutation, toast, refresh)
- [ ] **PG-PAR-CHILDREN-05** `InviteChildForm` with generated zod schema, field hints and inline server errors (409, 422, 429)
- [ ] **PG-PAR-CHILDREN-06** Invite mutation through the BFF with idempotency key, toast, sheet close and refresh
- [ ] **PG-PAR-CHILDREN-07** "What you will and will not see" block inside the invite sheet
- [ ] **PG-PAR-CHILDREN-08** `InviteActions`: resend with cooldown display and cancel, both via BFF
- [ ] **PG-PAR-CHILDREN-09** Expired and declined invites accordion with "Send again"
- [ ] **PG-PAR-CHILDREN-10** `SharingSummary` line per child (read-only, from `sharing.*`)
- [ ] **PG-PAR-CHILDREN-11** Seat badge and the unlink dialog's billing note with link to Billing
- [ ] **PG-PAR-CHILDREN-12** `ConsentCard` and consent mutation (BE-FAM-14), section anchor `#consent`
- [ ] **PG-PAR-CHILDREN-13** Empty state and footer privacy note
- [ ] **PG-PAR-CHILDREN-14** Backend gap: raise and spec the invite list, resend and cancel endpoints in the Family backend file (doc task, no code)
- [ ] **PG-PAR-CHILDREN-15** Rename the parent nav label "My students" to "Children" in `nav-config.ts` (keep id `students` and href)
- [ ] **PG-PAR-CHILDREN-16** Coverage summary line "{covered} of {linked} children covered" above the linked list (BE-BIL-14 seats, BE-FAM-06 `seat.covered`)
- [ ] **PG-PAR-CHILDREN-17** Per-child cover chip and a single "Cover {firstName}" action (Student Pro; Max actions are not in v1, decision 12) through the BFF, pending state per card, toast "{firstName} is now on {plan}."
- [ ] **PG-PAR-CHILDREN-18** 409 no free place handling on cover actions with the link to `/parent/billing`
- [ ] **PG-PAR-CHILDREN-19** "Not covered" state after accept when the parent has no paid plan or no free place, with the plan upsell line
- [ ] **PG-PAR-CHILDREN-20** Invite copy for emails with no account yet ("they will get an email to join") and the "no plan changes until they accept" line
- [ ] **PG-PAR-CHILDREN-21** Backend gap: per-child plan endpoint (old `PUT /api/entitlements/children/{id}/plan`) mapped to BE-BIL-19 or a new seat-assignment slice (doc task, aligns with PG-BIL-MANAGE seat tasks)

## Quality tasks

- [ ] **PG-PAR-CHILDREN-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-PAR-CHILDREN-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-PAR-CHILDREN-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-PAR-CHILDREN-Q04** Empty state with one clear next action
- [ ] **PG-PAR-CHILDREN-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-PAR-CHILDREN-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-PAR-CHILDREN-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-PAR-CHILDREN-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-PAR-CHILDREN-Q09** Layout at 1440px
- [ ] **PG-PAR-CHILDREN-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-PAR-CHILDREN-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-PAR-CHILDREN-Q12** axe: zero violations in light and dark
- [ ] **PG-PAR-CHILDREN-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-PAR-CHILDREN-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-PAR-CHILDREN-Q15** `generateMetadata` title; nav entry active state correct
- [ ] **PG-PAR-CHILDREN-Q16** Security: BFF-only mutations; cross-family `inviteId` and `linkId` attempts return 404 (E2E)
- [ ] **PG-PAR-CHILDREN-Q17** No invite tokens or unmasked emails in responses, URLs, logs or Sentry
- [ ] **PG-PAR-CHILDREN-Q18** Unlink revokes access immediately: E2E reloads child detail after unlink and gets the not-linked state
- [ ] **PG-PAR-CHILDREN-Q19** Performance: lazy-loaded sheet, LCP under 2.5 s mobile, route JS under 150 KB gzip
- [ ] **PG-PAR-CHILDREN-Q20** Resilience: idempotency keys, disabled-while-pending buttons, 404-as-success on cancel and unlink
- [ ] **PG-PAR-CHILDREN-Q21** Observability: seven analytics events with no PII; Sentry tags and trace id on mutation errors
- [ ] **PG-PAR-CHILDREN-Q22** WCAG 2.2 AA: focus trap and return, error association, values kept after errors
- [ ] **PG-PAR-CHILDREN-Q23** Rollout: flag gate and conditional rendering of resend and cancel until endpoints ship
- [ ] **PG-PAR-CHILDREN-Q24** Monitoring: invite 5xx and bounce-rate alerts defined

## Tests

### Unit (Vitest)
- `features/family/components/invite-child-form.test.tsx`: validation messages, server 409 and 429 mapping, values kept after error.
- `features/family/components/invite-actions.test.tsx`: cooldown countdown, disabled while pending.
- `features/family/components/unlink-child-dialog.test.tsx`: seat note shown only when covered.
- `features/family/components/consent-card.test.tsx`: submit disabled until checked; version mismatch copy.
- `features/family/lib/mask-email.test.ts`.

### Playwright (`web/tests/e2e/parent/children.spec.ts`)
- `parent invites a child and sees it pending`
- `invite to already linked email shows inline error`
- `invite copy is identical for known and unknown emails`
- `resend respects cooldown`
- `cancel invite removes it`
- `unlink child removes access everywhere`
- `parent gives consent for under-18 child`
- `double submit creates one invite`
- `cross-family invite id returns not found` (security)
- `parent covers a linked child with pro`
- `cover action without a free place links to billing`
- `accepted child without parent plan shows not covered`
- `declined invite shows declined with send again`
- axe light and dark at 360 and 1440, sheet open and closed

## Open questions

- `GET /family/invites`, `POST /family/invites/{id}/resend` and `DELETE /family/invites/{id}` are specified in `../../backend/family.md`.
- Declined status: 43f9faa had a decline action, so this spec shows "Declined on {date}"; confirm BE-FAM-04 keeps a `declined` status.
- Decided (12): Student Max is not in v1, so the per-child picker is a single "Cover {firstName}" action.
- Per-child cover actions here and the seats section on PG-BIL-MANAGE overlap; one of them should own the mutation and the other link to it.
- Invite expiry (7 days assumed) and resend limits (15 minute cooldown, 5 resends assumed) need confirming in the Family spec.
- Route naming: this file and `nav-config.ts` use `/parent/students`; the original single-file backlog says `/parent/children`. This file keeps `/parent/students` to match the nav.
- Where is parent consent first asked: here, in parent onboarding (PG-ONB-PAR), or in the email the student triggers? This file assumes here plus a link from the dashboard banner.
