# Impersonation (from user drawer)

| | |
|---|---|
| ID | `PG-ADM-IMP` |
| Route | `/admin/users (drawer action)`; banner on every `(app)` route while active |
| Phase | 9 |
| Roles | admin (actor); student or parent (target) |
| Stages | high school, university (target can be either) |
| Entitlement | none; permission `users.impersonate` (proposed) plus step-up confirmation |
| Depends on | BE-ADM-10, BE-IDN-28 (`impersonation` block in `/me`), FE-22, FE-23, FE-25, FE-28 (banner support), SHL-03 (app shell), PG-ADM-USERS-10 (drawer), PG-ADM-DASH-09, PG-ADM-DASH-10, PG-ADM-DASH-12; needs new BE task for step-up re-authentication and for read-only enforcement (see Data) |
| Old app reference | `f223ca7:web/src/app/(app)/admin/impersonate/page.tsx` (user id or email, reason, session length; a form with no endpoint). At 43f9faa the form and the `users.impersonate` permission were removed because nothing backed them (`43f9faa:web/src/lib/rbac.ts`, comment in `43f9faa:web/src/app/(app)/admin/users/page.tsx`), so impersonation is net new in the rebuild |
| Status | Not started |

## Purpose

Let an admin see the app exactly as one student or parent sees it, to reproduce a problem, without knowing their password. It is time-boxed (15, 30 or 60 minutes, server-enforced), needs a written reason, needs a fresh step-up confirmation, is audited at start, at every request and at end (including failed attempts), and shows a banner that cannot be dismissed. In v1 it is read-only: the API refuses writes made under an impersonation session. Private wellbeing content (diary text, mood notes) and tutor conversations stay hidden even while impersonating.

## User stories

- As a support admin, from a user's drawer I start a 30 minute view-as session with the ticket number as the reason, and land on that person's dashboard.
- As an impersonating admin, I always see who I am viewing as, how long is left, and a button to end now.
- As an impersonating admin, when the time box ends I am returned to the admin console automatically and told why.
- As the impersonated student, I can later see in my security events that an Aptiverse admin viewed my account, when, and for how long.
- As a security reviewer, I can find every impersonation session in the audit log with actor, target, reason, start, end and pages visited.

## Layout

### Mobile (360px)

Start dialog (from the drawer Actions menu, item "View as this person"):
1. `ResponsiveDialog` as a bottom sheet. Title "View as {name}".
2. Warning text block (attention colour zone): what will happen, read-only, what stays hidden.
3. Reason textarea, required, 10 to 500 characters, counter.
4. Ticket reference input, optional ("Ticket number").
5. Time box radio group: 15 minutes, 30 minutes (default), 60 minutes. Each 44px.
6. Step-up block: "Confirm it is you" password field (or "Continue with Google" for Google-only admins).
7. Sticky footer: "Cancel" and "Start viewing".

Banner (while active, every `(app)` page):
1. Full-width bar fixed above the top bar, terracotta surface, 48px tall, text in on-surface ink.
2. Left: Lucide `eye` icon (aria-hidden) and "Viewing as Thandi M. (student). Read only."
3. Right: countdown "24:13 left" and button "End".
4. At 360px the text truncates name to first name plus initial; countdown and End always visible.

### Desktop (1440px)

- Start dialog is a centred 520px dialog with the same fields in one column.
- Banner is a single line: "Viewing as Thandi Mokoena (student, high school). Read only. Started 14:05 by you. 24:13 left." plus "End viewing" button.
- The app shell renders the target's navigation (student or parent nav), not the admin nav. Admin nav is unreachable until the session ends.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Start action item | `web/src/features/admin/impersonation/components/start-impersonation-item.tsx` | client | Menu item in `user-actions-menu.tsx`; hidden when `isImpersonatable` false or no permission |
| Start dialog | `web/src/features/admin/impersonation/components/start-impersonation-dialog.tsx` | client | react-hook-form plus generated zod schema |
| Step-up field | `web/src/features/admin/shared/components/step-up-field.tsx` | client | Shared with refunds (`billing-payments.md`); posts to step-up endpoint, returns a step-up token valid 5 minutes |
| Banner | `web/src/components/shell/impersonation-banner.tsx` | server shell plus client countdown | Rendered by the `(app)` layout when `/me` has `impersonation` |
| Countdown | `web/src/features/admin/impersonation/components/impersonation-countdown.tsx` | client | Uses server `expiresAt` and server time offset; `aria-live` only at 5 and 1 minute marks |
| End button | `web/src/features/admin/impersonation/components/end-impersonation-button.tsx` | client | Calls end endpoint through BFF, then hard navigates to `/admin/users?user=<id>` |
| Session swap route | `web/src/app/api/bff/impersonation/start/route.ts` | server | Exchanges the API response for an impersonation overlay in the session cookie, keeping the admin tokens aside |
| Session end route | `web/src/app/api/bff/impersonation/end/route.ts` | server | Calls API end, drops the overlay, restores admin tokens |
| Expiry handling | `web/src/lib/auth/impersonation.ts` | server | Session helper: overlay present and `expiresAt` past means end and restore before rendering |
| Read-only guard UI | `web/src/features/admin/impersonation/components/read-only-notice.tsx` | client | Toast shown when the BFF returns 403 `impersonation_read_only` |

## Data

| Endpoint | BE ID | Method | Fields | Notes |
|---|---|---|---|---|
| `/auth/step-up` | needs new BE task (Identity) | POST | Request `password` or `googleIdToken`; response `stepUpToken`, `expiresAt` (5 min) | Rate-limited in the `auth` group; failures written to security events |
| `/admin/impersonation` | BE-ADM-10 | POST | Request `targetUserId`, `reason`, `ticketRef?`, `minutes` (15, 30, 60), header `X-Step-Up-Token`, `Idempotency-Key`; response `sessionId`, `accessToken`, `expiresAt`, `target` { `id`, `displayName`, `role`, `stage` }, `auditEventId` | Failures: 403 no permission or target is admin, 409 actor already impersonating, 422 invalid minutes or reason, 401 step-up missing or expired, 423 target deletion requested |
| `/admin/impersonation/{sessionId}/end` | BE-ADM-10 | POST | Request `endedBy` (`actor`, `expiry`); response `auditEventId`, `endedAt` | Idempotent: ending an ended session returns 200 with the original `endedAt` |
| `/me` | BE-IDN-28 | GET | `impersonation`: `sessionId`, `actorId`, `actorName`, `targetId`, `targetName`, `targetRole`, `targetStage`, `startedAt`, `expiresAt`, `readOnly`, `serverTime` | Drives the banner |
| Read-only enforcement | needs new BE task (Identity or SharedKernel middleware) | n/a | Any non-GET request with an impersonation token returns 403 with error code `impersonation_read_only` and is audited | Exceptions: the end endpoint only |
| Privacy exclusion | needs new BE task (Wellbeing, AiTutor) | n/a | Diary content, mood notes and tutor messages return 403 `impersonation_private` under an impersonation token | Pages show a private placeholder |

Cookie and token rules:
- The impersonation access token has claim `act` (actor id), `imp_sid`, and a hard `exp` equal to `expiresAt`. No refresh token is issued, so it cannot outlive the time box.
- The admin's own tokens stay in the encrypted cookie, unused, until end.

## States

| State | When | Copy |
|---|---|---|
| Item hidden | No `users.impersonate`, target is admin, target deleted, or `ADMIN_IMPERSONATION` off | Not shown (switch off shows disabled item with tooltip "Viewing as a user is paused by an administrator.") |
| Dialog idle | Opened | Title "View as {name}"; body "You will see Aptiverse as {name} sees it for up to the time you choose. You cannot change anything while viewing. Their diary, mood notes and tutor chats stay private. This is recorded in the audit log and in their security history." |
| Dialog validation | Reason too short | "Write at least 10 characters so the reason makes sense later." |
| Step-up failed | 401 from step-up | "That password is not right. Try again." After 5 failures: "Too many attempts. Try again in 15 minutes." |
| Starting | Submitting | Button "Starting..." disabled; dialog cannot close |
| Start refused | 409 | "You are already viewing as someone. End that session first." |
| Start refused | 403 target admin | "You cannot view as another admin." |
| Start refused | 423 | "This person asked for their account to be deleted, so viewing as them is not allowed." |
| Start error | 5xx or network | "We could not start viewing. Nothing changed. Try again." |
| Active | Overlay present | Banner as in Layout |
| Five minutes left | `expiresAt - now` at 5:00 | Banner countdown turns bold; screen reader announcement "5 minutes left viewing as {name}." |
| Write blocked | 403 `impersonation_read_only` | Toast "Read only while viewing as {name}. Nothing was saved." |
| Private content | 403 `impersonation_private` | Placeholder in the affected card: "Private to {first name}. Hidden while viewing as them." |
| Expired | Countdown hits 0 or any request returns 401 with `imp_expired` | Hard navigation to `/admin/users?user=<id>`, toast "Viewing ended: the {n} minute time box ran out." |
| Ended by admin | End clicked | Navigate to drawer, toast "Viewing ended. Audit ref {short id}." |
| End failed | End endpoint 5xx | Overlay is still dropped locally; toast "Viewing ended on this device. The server will close the session at {time}." |

## Stage variants

- Target high school student: banner says "(student, high school)"; target sees high school nav and copy.
- Target university student: banner says "(student, university)".
- Target parent: banner says "(parent)"; parent nav renders; linked children's data follows the parent's consent scope, unchanged by impersonation.

## Interactions and edge cases

- Expiry while a page is open: the countdown triggers `end` with `endedBy: expiry` at 0; independently, the session helper checks `expiresAt` on every server render, and the API rejects the token after `exp`. Three layers, so a sleeping laptop cannot extend it.
- Clock skew: countdown uses `serverTime` from `/me` to compute an offset; never trusts the browser clock alone.
- Multiple tabs: every tab reads the same cookie; ending in one tab makes the next navigation in other tabs render admin. A `BroadcastChannel("aptiverse-impersonation")` message prompts other tabs to reload immediately.
- Browser closed during impersonation: the token dies at `exp`; the API marks the session ended by expiry via a scheduled message at `expiresAt` (BE-ADM-10).
- Permission revoked mid-session: the API checks `users.impersonate` on every request under an impersonation token; on failure it returns 401 `imp_revoked` and the web ends the session with toast "Viewing ended: your access changed."
- Target account locked or deleted mid-session: API returns 401 `imp_target_unavailable`; same end flow.
- Admin tries to open `/admin` while impersonating: the layout guard sees role of target, returns 404; banner remains so the way out is obvious.
- Payment pages while impersonating: checkout and payment method buttons render disabled with "Not available while viewing as someone."
- Analytics `track()` events and Vercel Analytics must not fire under impersonation (there is no Meta pixel in v1, decision 8; any later marketing tag inherits this rule through the consent module).
- Notifications: viewing as someone must not mark their notifications as read (read-only rule covers the POST).

## Copy

- Menu item: "View as this person"
- Dialog title: "View as {name}"
- Fields: "Reason (saved in the audit log)", "Ticket number (optional)", "How long", "Confirm it is you"
- Time options: "15 minutes", "30 minutes", "60 minutes"
- Confirm: "Start viewing"
- Banner: "Viewing as {name} ({role}). Read only." and "{mm:ss} left" and "End viewing" (mobile "End")
- Expired toast: "Viewing ended: the {n} minute time box ran out."
- Target's security history line: "An Aptiverse admin viewed your account for {n} minutes on {date}. Reason: support request."

## Acceptance criteria

- Given an admin with `users.impersonate`, when they submit a valid reason, 30 minutes and a correct password, then `POST /auth/step-up` then `POST /admin/impersonation` are called once each, the browser lands on the target's home route, and the banner shows the target name and about 30:00 left.
- Given an active session, when any page in `(app)` renders, then the banner is present, is not dismissible and contains an End control reachable by keyboard as the first focusable element after the skip link.
- Given an active session, when the user tries to save a goal, then the API returns 403 `impersonation_read_only`, nothing is saved and the toast shows.
- Given an active session, when the diary page renders, then entry content is replaced with the private placeholder.
- Given an active 15 minute session, when 15 minutes pass with the tab in the background, then the next interaction or the countdown ends the session, the admin lands on the user drawer and the expired toast shows; the API rejects the old token.
- Given a target who is an admin, when an admin calls start directly, then the API returns 403 and the failure is audited.
- Given a wrong step-up password, when submitted, then no impersonation request is sent and the failure appears in the actor's security events.
- Given a session ended, when the target later opens their security history, then the "An Aptiverse admin viewed your account" line is present.

## Production readiness

Security
- Permission `users.impersonate` checked at start and on every request under an impersonation token.
- Step-up re-authentication within the last 5 minutes required to start (new BE task).
- Read-only enforced in the API, not the UI; private content blocked in the API.
- No refresh token for impersonation; hard `exp`.
- Never impersonate admins; never impersonate accounts pending deletion.
- CSRF: start and end only through BFF routes that check `Origin`.

Performance
- Banner adds no extra request: data comes from the existing `/me` read.
- Countdown is one client island under 3 KB.

Resilience
- End is idempotent; local overlay drop happens even if the API end call fails.
- Expiry enforced in three layers (client countdown, server render check, API token `exp`), plus a scheduled server-side close.

Observability
- Audit events: `admin.impersonation.start` (success and failure with reason code), `admin.impersonation.request` (method, route template, status; sampled 100 percent), `admin.impersonation.end` (actor or expiry).
- Trace attribute `impersonation.session_id` on every request under the token.
- Sentry: tag `impersonating:true`; user context is the actor id, not the target.

Accessibility (WCAG 2.2 AA)
- Banner is a `region` landmark labelled "Viewing as another person"; countdown announcements only at 5 and 1 minutes (no chatty live region).
- Timing adjustable (2.2.1): the time box is a security control and is disclosed before start; the 5 minute warning gives time to finish.
- Banner contrast checked on terracotta surface in light and dark.

Privacy and POPIA
- Target is told afterwards via their security history.
- Diary, mood notes and tutor chats hidden; data export and deletion endpoints blocked.
- Reason and ticket ref retained with the audit record per retention policy (HRD-35).

Rollout
- `ADMIN_IMPERSONATION` switch default off in prod until the security review (HRD-20) signs off. Rollback: switch off ends new starts; existing sessions die at `exp` (60 minutes max).

Monitoring
- Alert on any impersonation session lasting past `expiresAt + 1 minute` (should be impossible).
- Alert on more than 5 failed step-ups for one admin in 15 minutes.
- Weekly digest panel: sessions per admin, average length, targets per admin.

Tasks
- [ ] **PG-ADM-IMP-19** BroadcastChannel cross-tab end and reload
- [ ] **PG-ADM-IMP-20** Disable `track()` events and Vercel Analytics under impersonation, enforced in `lib/analytics` so a future marketing tag inherits it
- [ ] **PG-ADM-IMP-21** Permission revoked and target unavailable mid-session handling (`imp_revoked`, `imp_target_unavailable`)
- [ ] **PG-ADM-IMP-22** `ADMIN_IMPERSONATION` switch states (hidden, disabled with tooltip)
- [ ] **PG-ADM-IMP-23** Sentry tag `impersonating:true` and trace attribute check
- [ ] **PG-ADM-IMP-24** Grafana alerts: overlong session, failed step-up burst; weekly impersonation panel
- [x] **PG-ADM-IMP-25** Request new BE tasks: step-up endpoint, read-only middleware, private content exclusion, target security history line (now in `../../backend/identity.md`, `admin.md`, `wellbeing.md` and `ai-tutor.md`)
- [ ] **PG-ADM-IMP-26** Threat model note for impersonation as a net-new capability (the old app shipped only a dead form, removed at 43f9faa); reviewed in HRD-20 before `ADMIN_IMPERSONATION` is switched on in prod

## Build tasks

- [ ] **PG-ADM-IMP-01** Start with reason, time box (umbrella; delivered by 04 to 08)
- [ ] **PG-ADM-IMP-02** Global banner with end button (umbrella; delivered by 09 to 13)
- [ ] **PG-ADM-IMP-03** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-IMP-04** `start-impersonation-item.tsx` in the drawer actions menu with visibility rules
- [ ] **PG-ADM-IMP-05** `start-impersonation-dialog.tsx` form (reason, ticket, time box) with generated zod schema
- [ ] **PG-ADM-IMP-06** `step-up-field.tsx` shared component (password and Google variants, error and lockout copy)
- [ ] **PG-ADM-IMP-07** BFF `impersonation/start` route: call API, store overlay in session cookie, keep admin tokens
- [ ] **PG-ADM-IMP-08** Start error mapping (401, 403, 409, 422, 423, 5xx) and redirect to target home
- [ ] **PG-ADM-IMP-09** `impersonation-banner.tsx` in the `(app)` layout from `/me.impersonation`
- [ ] **PG-ADM-IMP-10** `impersonation-countdown.tsx` with server time offset and 5 and 1 minute announcements
- [ ] **PG-ADM-IMP-11** `end-impersonation-button.tsx` and BFF `impersonation/end` route
- [ ] **PG-ADM-IMP-12** `lib/auth/impersonation.ts` server render expiry check and restore
- [ ] **PG-ADM-IMP-13** Expired and ended toasts after returning to the drawer
- [ ] **PG-ADM-IMP-14** `read-only-notice.tsx`: BFF maps 403 `impersonation_read_only` to the toast globally
- [ ] **PG-ADM-IMP-15** Private placeholder component for `impersonation_private` used by diary, wellbeing and tutor pages
- [ ] **PG-ADM-IMP-16** Target nav swap: shell renders target role nav; admin routes 404 while active
- [ ] **PG-ADM-IMP-17** Disabled checkout and payment method buttons under impersonation
- [ ] **PG-ADM-IMP-18** Responsive banner layout (360px truncation, 1440px full line)

## Quality tasks

- [ ] **PG-ADM-IMP-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id (no own route; confirm drawer and BFF routes handle errors)
- [ ] **PG-ADM-IMP-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema (the `/me` impersonation block)
- [ ] **PG-ADM-IMP-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-ADM-IMP-Q04** Empty state with one clear next action (not applicable; confirm hidden item rules instead)
- [ ] **PG-ADM-IMP-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-IMP-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-IMP-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-IMP-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-IMP-Q09** Layout at 1440px
- [ ] **PG-ADM-IMP-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-IMP-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-IMP-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-IMP-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-IMP-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-IMP-Q15** `generateMetadata` title; nav entry active state correct (target nav while active)
- [ ] **PG-ADM-IMP-Q16** Security test: no token for the impersonation session is readable from browser JS

## Tests

Unit (Vitest)
- `features/admin/impersonation/components/impersonation-countdown.test.tsx`: "uses server time offset", "announces at 5 and 1 minutes only", "calls end at zero"
- `features/admin/impersonation/components/start-impersonation-dialog.test.tsx`: "requires 10 character reason", "defaults to 30 minutes", "blocks submit until step-up passes"
- `lib/auth/impersonation.test.ts`: "expired overlay restores admin session", "missing overlay is a no-op"

Playwright (`web/tests/e2e/admin/impersonation.spec.ts`)
- "admin starts 15 minute session and sees banner on student dashboard"
- "write while impersonating is refused with read-only toast"
- "diary content is hidden while impersonating"
- "session expires and returns admin to the drawer" (clock mocked)
- "end viewing returns to the drawer with audit ref"
- "ending in one tab reloads the other tab"
- "cannot start for an admin target"
- "wrong step-up password sends no impersonation request"
- "banner has no axe violations in light and dark at 360 and 1440"

## Open questions

- Read-only in v1 is the recommendation here. Is there any support case that needs writes while impersonating? If yes, it needs a separate permission and an explicit write-mode toggle.
- Should a parent be told when an admin viewed their child's account? POPIA leans yes for minors.
- Step-up for Google-only admin accounts: Google re-auth prompt, or require admins to have a password? Recommend requiring a password plus TOTP for admins later.
