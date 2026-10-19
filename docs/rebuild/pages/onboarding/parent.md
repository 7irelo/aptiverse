# Parent onboarding

| | |
|---|---|
| ID | `PG-ONB-PAR` |
| Route | `/onboarding` (parent variant, same route as `PG-ONB-STU`, chosen by role) |
| Phase | 2 (explainer and exit), invite steps light up in Phase 8 behind `flags.parentInvites` |
| Roles | parent |
| Stages | Not stage-specific for the parent; linked children may be high school or university, so wording stays neutral ("subject or course") |
| Entitlement | free (inviting a child needs no plan; seats are a billing matter, PG-BIL pages) |
| Depends on | BE-IDN-28, BE-FAM-03, BE-FAM-04, BE-FAM-06, BE-FAM-14, FE-20, FE-24, FE-27, FE-63, SHL-02, UI-01, UI-02, UI-03, UI-04, UI-05, UI-10, PG-ONB-STU-12 (shared route page) |
| Old app reference | new (no parent onboarding page at 43f9faa; parent linking lived in `ParentLinksController` invites, accept, decline, and the invitee flow ran through `43f9faa:web/src/app/(auth)/login/page.tsx` and `register/page.tsx` via `callbackUrl=/dashboard/connections` and `?email=`) |
| Status | Not started. No `/onboarding` route exists in `web/src/app`. The API has no Family module yet and Identity's `RequiresOnboarding` is true only for students, so nothing tracks parent onboarding. |

## Purpose

Welcome a new parent, explain plainly what they will and will not see about their child, and (once the Family module exists) let them invite one or more children who then accept from their own accounts. The explainer is the trust contract: it must match what the Family module actually enforces (BE-FAM-07, BE-FAM-08, BE-FAM-11). Parents never create child accounts and never see anything before the child accepts.

## User stories

- As a new parent, I want to know exactly what I will see and what stays private, so I can trust the product and explain it to my child.
- As a parent, I want to invite my child by email so they can accept from their own account.
- As a parent, I want to copy an invite link to send on a channel my child actually reads.
- As a parent of several children, I want to invite each of them, even if one is in high school and one is at university.
- As a parent, I want to see which invites are still waiting, resend one, or cancel one sent to the wrong address.
- As a parent who wants to look around first, I want to skip to my dashboard and invite later.

## Layout

Auth shell (SHL-02): wordmark, one centred column, no app navigation.

### Mobile (360px)

Phase 2 (invites flag off):

1. Wordmark.
2. `h1` "Welcome, {first name}" and a one-line description.
3. Card "What you will see": list of 4 items, each with a Lucide icon (`aria-hidden`) and one sentence.
4. Card "What stays private": list of 3 items, `Lock` icon.
5. Note line: "Your child chooses what to share and can change it at any time."
6. Checkbox (required, decision 30): "I confirm I am 18 or older." Saved as the `adultConfirmed` field of `POST /me/onboarding/complete` (BE-IDN-33), stored as a consent row.
7. Main button, full width, "Go to your dashboard" (disabled until the box is ticked).

Phase 8 (invites flag on), after the explainer:

1. Stepper "Step 1 of 2" (Explainer) then "Step 2 of 2" (Invite).
2. Step 1: the explainer cards and the 18 or older checkbox above, main button "Continue", text button "Skip for now" (also needs the box ticked, because skipping still completes onboarding).
3. Step 2: `h1` "Invite your child", description, email field and "Send invite" button, then a divider and a secondary button "Copy an invite link instead".
4. Pending invites list (when any): one row per invite with email (or "Invite link"), sent and expiry dates, "Resend" and "Cancel invite" buttons.
5. Linked children list (when any): name and "Linked".
6. "Invite another child" text button (focuses the email field again).
7. Main button, full width, "Go to your dashboard"; on step 2 it is labelled "Done" once at least one invite exists.

### Desktop (1440px)

- Single column, max width 520px, centred, top padding 64px.
- "What you will see" and "What stays private" sit side by side from `md:` up (two equal cards), the note line spans both.
- Invite form: email field and "Send invite" on one row from `sm:` up.
- Pending rows show actions inline on the right; on mobile actions wrap under the row text.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/onboarding/page.tsx` | server | Shared with `PG-ONB-STU`; renders the parent variant for role `parent` |
| Loading, error, layout | `web/src/app/(app)/onboarding/loading.tsx`, `error.tsx`, `layout.tsx` | server, client, server | Shared with `PG-ONB-STU` |
| Parent variant | `web/src/features/onboarding/components/parent-onboarding.tsx` | server | Chooses explainer only or explainer plus invite step by `flags.parentInvites` |
| Explainer | `web/src/features/onboarding/components/parent-explainer.tsx` | server | Static content from `web/src/features/onboarding/content/parent-explainer.ts` (one file for copy review) |
| Stepper | `web/src/features/onboarding/components/onboarding-stepper.tsx` | server | Shared |
| Invite form | `web/src/features/onboarding/components/invite-child-form.tsx` | client | `useZodForm` with the generated zod schema for `POST /family/invites`, `TextField` from `components/common/form-fields.tsx` |
| Copy link button | `web/src/features/onboarding/components/copy-invite-link-button.tsx` | client | Creates a link invite, copies with the Clipboard API, falls back to a read-only selectable field |
| Pending invites list | `web/src/features/onboarding/components/pending-invites-list.tsx` | server list with client action leaves | Rows from the loader; Resend and Cancel are small client buttons |
| Linked children list | `web/src/features/family/components/linked-children-list.tsx` | server | Reused later by the parent dashboard (PG-PAR pages) |
| Family loader | `web/src/features/family/server/get-family-overview.ts` | server | `GET /family/children` (BE-FAM-06) plus pending invites, generated zod parse |
| Invite actions | `web/src/features/onboarding/server/actions.ts` | server | `createInviteAction`, `resendInviteAction`, `cancelInviteAction`; token attached server-side |
| Confirm dialog | `web/src/components/common/confirm-dialog.tsx` | client | "Cancel this invite?" |
| Toast | `web/src/components/ui/sonner.tsx` | client | Sent, copied, resent, cancelled confirmations |
| Button, Card, Input, Separator, Badge | `web/src/components/ui/*` | mixed | Kit primitives |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/me` (BE-IDN-28) | GET | `roles`, `name` (first name for the greeting) | none, request-scoped `cache()` |
| `/family/children` (BE-FAM-06) | GET | `children[]`: `linkId`, `name`, `stage` (for a neutral label only), `linkedAt` | none (per user), revalidated by `revalidatePath("/onboarding")` after invite actions |
| `/family/invites` (proposed, see open questions) | GET | `invites[]`: `id`, `email?` (null for link invites), `method` (`email` or `link`), `createdAt`, `expiresAt`, `status` (`pending`, `accepted`, `expired`) | none |

Mutations:

| Endpoint (BE ID) | Method | Request fields | Response used | Notes |
|---|---|---|---|---|
| `/family/invites` (BE-FAM-03) | POST | `method` (`email` or `link`), `email?` | `id`, `expiresAt`, `url` (link method only) | Server action with an idempotency key per submit. Response is the same whether or not the email belongs to an existing account (no account enumeration) |
| `/family/invites/{id}/resend` (proposed) | POST | none | `expiresAt` | Rate limited; extends expiry |
| `/family/invites/{id}` (proposed) | DELETE | none | 204 | Revokes the token |

Error mapping: ProblemDetails `errors.email` to the email field, `detail` to the inline alert, `code` drives specific copy (`family.invite_self`, `family.already_linked`, `family.too_many_invites`), never a generic message when the API gave a reason.

## States

| State | When | Exact copy |
|---|---|---|
| Loading | Session or family data loading | Skeleton; screen reader text "Loading" |
| Populated, explainer | Always first | h1 "Welcome, {first name}"; description "Here is how Aptiverse works for parents." Card "What you will see": "How your child is doing in each subject or course, from the marks and practice they log", "Upcoming assessments and deadlines", "Real milestones, like a finished practice test or a goal reached", "Wellbeing trends, only if your child chooses to share them". Card "What stays private": "Their diary. It is private and stays that way.", "Their mood notes and their chats with the AI tutor", "Anything your child has not agreed to share". Note "Your child chooses what to share and can change it at any time." |
| Populated, invite step (no invites yet) | Flag on, no invites, no links | h1 "Invite your child"; description "Your child accepts the invite from their own Aptiverse account. Nothing is shared until they do."; field "Your child's email"; button "Send invite"; secondary "Copy an invite link instead" |
| Pending invites | One or more pending | Section heading "Waiting to be accepted"; row "{email}" or "Invite link", meta "Sent {d MMM}, expires {d MMMM yyyy}"; buttons "Resend", "Cancel invite" |
| Expired invite | Status `expired` | Meta "Expired on {d MMMM yyyy}"; button "Send a new invite" |
| Linked | Child accepted | Section heading "Linked"; row "{child name}" with badge "Linked" |
| Invite sent | POST succeeds (email) | Toast "Invite sent. It expires on {d MMMM yyyy}." |
| Link copied | POST succeeds (link) | Toast "Invite link copied. It works once and expires on {d MMMM yyyy}." |
| Clipboard blocked | Clipboard API rejects | Inline read-only field with the link selected, text "Copy this link and send it to your child." |
| Resent | Resend succeeds | Toast "Invite sent again." |
| Cancelled | Cancel succeeds | Toast "Invite cancelled. The link no longer works." |
| Validation errors | API 400 or client check | "Enter an email address like name@example.com"; `family.invite_self`: "Use your child's email address, not your own."; others: the API `errors.email` text |
| Already linked | `family.already_linked` (409) | The API `detail`; fallback "You are already linked to this child." |
| Rate limited | 429 | The API `detail`; fallback "You have sent a lot of invites. Wait a few minutes and try again." |
| Save error | Network or 5xx | "We could not send that invite. Check your connection and try again." Email value kept |
| Page error | Loader fails (error.tsx) | Title "We could not load this page"; text "This is on our side, not yours. Try again in a moment."; button "Try again" |
| Family unavailable | Flag on but family endpoints fail while `/me` works | Explainer still renders; invite card shows "Inviting is not available right now. You can do it later from your dashboard." with "Go to your dashboard" |
| Forbidden | Role is not parent | Student gets the student variant; admin redirects to `/admin`; signed out redirects to `/login?next=/onboarding` |
| Empty | Not applicable beyond "no invites yet" above | |
| Upgrade | Not applicable (free) | |
| No evidence | Not applicable | |

## Stage variants

The parent has no stage. Children may be at different stages, so:

- Explainer and list wording use "subject or course", "assessments and deadlines", never "SBA", "APS", "matric", "Grade" or "GPA".
- Linked child rows show only the child's name and "Linked"; no stage-specific detail appears during onboarding.
- Under-18 children: when BE-FAM-14 lands, the accept flow on the child's side carries the parental consent step; the parent sees only the line "If your child is under 18, we will ask you to confirm consent once they accept." (copy to confirm with the POPIA review, HRD-32).

## Interactions and edge cases

- Phase 2 (flag off): the page shows the explainer and "Go to your dashboard" only; no stepper.
- Skip: "Skip for now" on the explainer goes to `/parent`; the parent dashboard empty state (PG-PAR dashboard) carries an "Invite your child" action back to `/onboarding?step=invite`.
- Return visits: parents are not forced through onboarding (`RequiresOnboarding` is false for parents); `/onboarding` stays reachable for a parent so the dashboard can link to the invite step.
- Several children: after each send the form clears and focus returns to the email field; the new invite appears at the top of the pending list.
- Own email: blocked client-side by comparing with the session email (lowercased, trimmed) and server-side by the API.
- Unknown email: the API responds as sent regardless; an email goes out only if policy allows (open question). The UI never says whether an account exists.
- Link invites: the URL is shown only once, at creation, in the toast and the fallback field; it is never stored in the page HTML afterwards, never written to logs, Sentry or analytics. Pending link invites show "Invite link" without the URL; to share again the parent cancels and creates a new link.
- Resend: disabled for 60 seconds after a send or resend (button label "Resend in {s}s"); the API enforces its own limit.
- Cancel: confirm dialog "Cancel this invite?" / "The link in the email will stop working." with "Cancel invite" (destructive) and "Keep it".
- Double submit: Send and Copy buttons disable while pending; the server action passes an idempotency key so a retried request does not create two invites.
- Accepted while viewing: the list refreshes on the next action or on focus (`router.refresh()` on window focus, throttled to once a minute).
- Child declines: the invite row disappears from pending (status from API); no notification copy on this page.
- Expiry dates are shown in `Africa/Johannesburg`, format "26 October 2026".

- Invitee without an account (43f9faa lesson): the old invite sent new students to `/register?email=...`, putting the child's email in a URL. The rebuild's invite link points at the accept route with the token only; a student without an account is sent to `/register?invite=<token>` (PG-AUTH-REG-29), which prefills the email server-side and returns them to accept after sign-up. The parent page never builds a URL containing an email.

## Copy

- Greeting: "Welcome, {first name}", "Here is how Aptiverse works for parents."
- Age: "I confirm I am 18 or older." Error: "Please confirm you are 18 or older to continue."
- "What you will see", "What stays private" and their items (see States)
- Note: "Your child chooses what to share and can change it at any time."
- Invite: "Invite your child", "Your child accepts the invite from their own Aptiverse account. Nothing is shared until they do.", "Your child's email", "Send invite", "Copy an invite link instead", "Invite another child"
- Pending: "Waiting to be accepted", "Invite link", "Sent {date}, expires {date}", "Expired on {date}", "Resend", "Resend in {s}s", "Send a new invite", "Cancel invite"
- Linked: "Linked"
- Toasts: "Invite sent. It expires on {date}.", "Invite link copied. It works once and expires on {date}.", "Invite sent again.", "Invite cancelled. The link no longer works."
- Confirm: "Cancel this invite?", "The link in the email will stop working.", "Cancel invite", "Keep it"
- Exits: "Go to your dashboard", "Skip for now", "Continue", "Done"
- Under 18: "If your child is under 18, we will ask you to confirm consent once they accept."
- Errors: see States
- Metadata title: "Welcome to Aptiverse"

## Acceptance criteria

1. Given a signed-in parent and `flags.parentInvites` off, when they open `/onboarding`, then they see the explainer and "Go to your dashboard" and no invite form.
2. Given the explainer, when it renders, then it states that the diary, mood notes and AI tutor chats are private and that wellbeing trends appear only if the child shares them.
3. Given flags on, when the parent submits a valid child email, then `POST /family/invites` is sent once, the toast shows the expiry date and the invite appears under "Waiting to be accepted".
4. Given the parent enters their own email, when they press Send invite, then "Use your child's email address, not your own." shows and no request is sent.
5. Given the API returns 400 with `errors.email`, when the parent submits, then that message shows under the field.
6. Given the parent presses "Copy an invite link instead", when the invite is created, then the link is copied and the toast says it works once with the expiry date.
7. Given the clipboard is blocked, when the link is created, then a selectable read-only field with the link appears.
8. Given a pending invite, when the parent confirms "Cancel invite", then the row disappears and the toast says the link no longer works.
9. Given an invite was resent, when the parent looks at Resend, then it is disabled with a countdown for 60 seconds.
10. Given the family endpoints fail but `/me` works, when the page loads, then the explainer renders and the invite card shows the unavailable message.
11. Given a student, when they open `/onboarding`, then the student variant renders, not this page.
12. Given an invite was sent to an email with no account, when the parent sends it, then the UI shows the same success as for an existing account.
13. Given a parent with two pending invites and one linked child, when the page renders, then both lists show with the correct counts.
14. Given the parent double-taps Send invite, when the first request is pending, then only one invite is created.

## Production readiness

Security
- All family calls are scoped by the token on the API (BE-FAM-13); the page never sends a parent id. Invite list and children list come only from the signed-in parent's links.
- CSRF: invite actions are server actions (origin check); the token is attached server-side, never exposed to the browser.
- No account enumeration: invite creation returns the same shape and copy for known and unknown emails.
- Invite link tokens: shown once, never in URLs of this page, never logged, never sent to Sentry (scrubbed by `beforeSend` on URL patterns `/family/invites/` accept paths) or analytics.
- Email input validated by the generated zod schema and the API; rendered as text.

Performance
- Phase 2 variant is fully server-rendered with no client JS beyond the shared layout. Phase 8 adds only the invite form and two small action buttons as client leaves; JS for `/onboarding` stays under 150 KB gzip.
- LCP under 2.5s mobile: the h1 and explainer are static server HTML; family data streams inside a `<Suspense>` boundary so it never blocks the explainer.
- No caching of per-user family data; `revalidatePath("/onboarding")` after each invite action.

Resilience
- Family API down: explainer still renders (separate Suspense boundary), invite card degrades to the unavailable message.
- Save failure keeps the typed email; retry by pressing Send again; idempotency key prevents duplicates.
- Resend and cancel are idempotent on the API (cancelling a cancelled invite returns 204).

Observability
- Sentry captures loader and action failures with tags `route=/onboarding`, `variant=parent`, `action`; no emails in breadcrumbs.
- `traceparent` forwarded from the server fetcher to the API (OBS-01).
- Analytics (consent-gated `track()`, FE-63): `onboarding_step_completed` {step: "explainer" or "invite", stage: "parent"}, `onboarding_skipped` {step}, `parent_invite_sent` {method: "email" or "link"}, `parent_invite_cancelled` {method}. Never emails, names or tokens.

Accessibility (WCAG 2.2 AA)
- Explainer lists are real `ul` elements under `h2` headings; icons are `aria-hidden`.
- Toasts are announced politely and every toast's information is also visible in the page (the pending list updates), so nothing relies on a disappearing message.
- Countdown on Resend is not announced every second (`aria-live="off"` on the number, label updates only on enable).
- Targets at least 44px; focus returns to the email field after a send and to the list after a cancel.

Privacy and POPIA
- The explainer must match enforced behaviour; any change to Family privacy rules (BE-FAM-07, BE-FAM-08, BE-FAM-11) requires a copy update here (tracked by PG-ONB-PAR-Q19).
- The parent supplies a child's email, which may belong to a minor: stored only on the invite, deleted or anonymised when the invite expires or is cancelled (retention rule in HRD-35).
- Analytics after consent only; no child data in events.

SEO
- Authenticated route: noindex via the shared layout; not in the sitemap.

Rollout
- Phase 2 ships with `flags.parentInvites` off (explainer only). Turn it on per environment once BE-FAM-03, BE-FAM-04 and BE-FAM-06 pass their authorisation tests (BE-FAM-13), staging first with a parent persona linked to a high school and a university child.
- Rollback: turn the flag off (parents keep the explainer and dashboard), or Vercel instant rollback (HRD-03).

Monitoring
- Sentry alert: more than 5 errors in 10 minutes tagged `variant=parent`.
- Grafana (OBS-02): `POST /family/invites` rate, 4xx by code, 5xx ratio and p95; alert on 5xx above 2% over 15 minutes and on a spike of `family.too_many_invites` (abuse signal).
- Vercel Analytics: `parent_invite_sent` per day against parent sign-ups; investigate when invites drop to zero for 48 hours while parents sign up.

## Build tasks

- [ ] **PG-ONB-PAR-01** Explainer: what parents see and what stays private, static content in `content/parent-explainer.ts`, matched to Family privacy rules
- [ ] **PG-ONB-PAR-02** Invite a child by email: form plus `createInviteAction` calling `POST /family/invites` (BE-FAM-03)
- [ ] **PG-ONB-PAR-03** Add several children: clear and refocus after each send, "Invite another child", new invite on top of the list
- [ ] **PG-ONB-PAR-04** Pending invite state: list with email or "Invite link", sent and expiry dates, expired rows with "Send a new invite"
- [ ] **PG-ONB-PAR-05** Invite by copyable link: link invite creation, Clipboard API copy, selectable fallback field, URL shown once
- [ ] **PG-ONB-PAR-06** Parent variant switch in the shared route page and `parent-onboarding.tsx` (explainer only vs explainer plus invite by flag)
- [ ] **PG-ONB-PAR-07** Family loader `get-family-overview.ts`: children (BE-FAM-06) and pending invites, generated zod parse, own Suspense boundary
- [ ] **PG-ONB-PAR-08** Linked children list component in `features/family/components/` (reused by the parent dashboard)
- [ ] **PG-ONB-PAR-09** Resend invite: action, 60 second client cooldown, toast (blocked on the proposed resend endpoint)
- [ ] **PG-ONB-PAR-10** Cancel invite: confirm dialog, action, toast (blocked on the proposed `DELETE /family/invites/{id}`)
- [ ] **PG-ONB-PAR-11** ProblemDetails mapping for `family.invite_self`, `family.already_linked`, `family.too_many_invites`, plus own-email client check
- [ ] **PG-ONB-PAR-12** Exits: "Go to your dashboard", "Skip for now", "Done"; `/onboarding?step=invite` entry for the dashboard empty state
- [ ] **PG-ONB-PAR-13** Family-unavailable degraded state inside the invite card
- [ ] **PG-ONB-PAR-14** Idempotency key and pending states on Send and Copy
- [ ] **PG-ONB-PAR-15** Refresh on window focus (throttled) so accepted invites move to Linked
- [ ] **PG-ONB-PAR-16** `flags.parentInvites` wiring through `web/src/lib/flags.ts`
- [ ] **PG-ONB-PAR-17** Under-18 consent line, shown when BE-FAM-14 is live (copy confirmed with HRD-32)
- [ ] **PG-ONB-PAR-18** Analytics events `onboarding_step_completed`, `onboarding_skipped`, `parent_invite_sent`, `parent_invite_cancelled`
- [ ] **PG-ONB-PAR-19** Sentry scrubbing rule for invite tokens and accept URLs (`beforeSend`), with a unit test
- [ ] **PG-ONB-PAR-20** Invite link contract: the accept URL carries the token only, and a student without an account is routed to `/register?invite=<token>` (coordinated with PG-AUTH-REG-29); test that no generated URL contains an email
- [ ] **PG-ONB-PAR-21** "I confirm I am 18 or older" checkbox (decision 30), required before Continue, Skip or Go to dashboard, sent as `adultConfirmed` to BE-IDN-33; 400 from the API maps to the field

## Quality tasks

- [ ] **PG-ONB-PAR-Q01** Route files: shared `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`); no `not-found.tsx` (no id in the route)
- [ ] **PG-ONB-PAR-Q02** Server loader in `src/features/family/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ONB-PAR-Q03** Mutations through server actions with pending states; `revalidatePath` after each
- [ ] **PG-ONB-PAR-Q04** Empty state (no invites yet) with one clear next action ("Send invite")
- [ ] **PG-ONB-PAR-Q05** Error state copy: what went wrong and how to fix it, API reasons shown verbatim
- [ ] **PG-ONB-PAR-Q06** Forbidden handling: student variant, admin redirect, signed-out redirect; no upgrade state (free)
- [ ] **PG-ONB-PAR-Q07** Stage-neutral wording checked (no SBA, APS, matric, Grade or GPA in parent copy)
- [ ] **PG-ONB-PAR-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); pending rows wrap cleanly
- [ ] **PG-ONB-PAR-Q09** Layout at 1440px (two explainer cards side by side, inline row actions)
- [ ] **PG-ONB-PAR-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ONB-PAR-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ONB-PAR-Q12** axe: zero violations in light and dark, flag off and flag on
- [ ] **PG-ONB-PAR-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order, focus management after send and cancel
- [ ] **PG-ONB-PAR-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering explainer, invite sent, pending, cancel and error states
- [ ] **PG-ONB-PAR-Q15** `generateMetadata` title "Welcome to Aptiverse"; no nav entry (auth shell)
- [ ] **PG-ONB-PAR-Q16** Security check: identical responses for known and unknown emails, no token in HTML after creation, logs or Sentry
- [ ] **PG-ONB-PAR-Q17** Bundle and LCP check: JS under 150 KB gzip, Lighthouse mobile LCP under 2.5s with the flag on
- [ ] **PG-ONB-PAR-Q18** Analytics check: no events before consent, no emails, names or tokens in props
- [ ] **PG-ONB-PAR-Q19** Privacy copy check against the enforced Family rules (BE-FAM-07, 08, 11) before the flag turns on
- [ ] **PG-ONB-PAR-Q20** Monitoring set up: Sentry alert, Grafana panels and alerts for invite endpoints

## Tests

Unit (Vitest)
- `parent-explainer.test.tsx`: "lists the diary, mood notes and tutor chats as private", "uses no stage-specific words".
- `invite-child-form.test.tsx`: "blocks the parent's own email", "shows the API email error under the field", "clears and refocuses after a send", "disables Send while pending".
- `copy-invite-link-button.test.tsx`: "copies the link and shows the expiry toast", "falls back to a selectable field when the clipboard is blocked".
- `pending-invites-list.test.tsx`: "shows Invite link without the URL", "shows expired rows with Send a new invite", "counts down Resend for 60 seconds".
- `actions.test.ts`: "maps family error codes to copy", "sends an idempotency key", "revalidates the onboarding path".
- `sentry-scrub.test.ts`: "removes invite tokens from URLs and breadcrumbs".

Playwright (`web/e2e/onboarding-parent.spec.ts`, mobile projects first)
- "parent sees the explainer and goes to the dashboard" (flag off)
- "parent invites a child by email and sees it pending" (flag on)
- "parent invites two children" (flag on)
- "parent copies an invite link" (flag on)
- "parent cancels a pending invite" (flag on)
- "own email is refused"
- "family service down still shows the explainer"
- "student opening onboarding gets the student variant"
- "parent onboarding has no accessibility violations in light and dark"
- "parent onboarding fits 360px without sideways scrolling"

## Open questions

1. Decided (30, DECISIONS E): parents confirm they are 18 or older through `POST /me/onboarding/complete` (BE-IDN-33), which also records that parent onboarding happened. Still open: whether the dashboard nudges a parent with no family link or pending invite, or stays quiet.
2. No endpoint lists pending invites, resends or cancels them. Propose `GET /family/invites`, `POST /family/invites/{id}/resend` and `DELETE /family/invites/{id}` as new BE-FAM tasks.
3. DESIGN_BRIEF lets parents "create a child profile". REBUILD_PLAN requires student-side consent (BE-FAM-04), so parents cannot create child accounts; this page follows the rebuild plan.
4. Should an invite to an email with no account send a "join Aptiverse" email, or nothing? Either way the UI response must be identical.
5. BE-FAM-14 (parent consent for under-18s) runs on the child's accept flow; exact parent copy and where the consent is recorded need the POPIA review (HRD-32).
6. Invite expiry length (for example 7 days) is a BE decision; this page only renders `expiresAt`.
7. Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84), no third-party flag service.
