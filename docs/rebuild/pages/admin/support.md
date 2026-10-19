# Support queue

| | |
|---|---|
| ID | `PG-ADM-SUPPORT` |
| Route | `/admin/support` (Tickets tab, default), `/admin/support/[ticketId]`, `/admin/support/contact` (Contact enquiries tab) |
| Phase | 9 |
| Roles | admin |
| Stages | not stage-specific (tickets come from students, parents and visitors) |
| Entitlement | none; permission `support.manage` (permission catalogue, decision 9b; nav entry has no permission today) |
| Depends on | BE-SUP-10, BE-SUP-11, BE-SUP-12, BE-NTF-02 (reply emails), BE-WEL-08 (helplines for safeguarding guidance), PG-ADM-DASH-04 to 13, PG-ADM-USERS-10 (user drawer links); needs new BE tasks for contact enquiry admin read and ticket assignment (see Data) |
| Old app reference | new (contact form at f223ca7 sent email only; no admin queue existed) |
| Status | Not started |

## Purpose

Work the support inbox: see open tickets oldest first, read the thread, reply (the user gets an email and an in-app notification), set status and priority, assign to yourself, and add internal notes users never see. Contact form enquiries from the public site sit in their own tab. Tickets that hint at a student in distress are flagged for safeguarding with clear escalation guidance.

## User stories

- As a support admin, I see open tickets sorted by waiting time, with priority and category, and filter to mine or unassigned.
- As a support admin, I open a ticket, see the requester's role and stage and a link to their user drawer, and read the whole thread.
- As a support admin, I reply and set the status to "Waiting on user" in one action.
- As a support admin, I add an internal note that the user never sees.
- As a support admin, I mark a ticket as a safeguarding concern and see what to do next.
- As an admin, I see contact form enquiries from the public site, mark them handled, or turn one into a ticket.

## Layout

### Mobile (360px)

Queue (`/admin/support`):
1. `PageHeader`: h1 "Support", description "Tickets and contact enquiries. Oldest waiting first."
2. Tab links: Tickets (open count), Contact enquiries (new count).
3. Quick filter chips (links): "Open", "Mine", "Unassigned", "Waiting on user", "Resolved". Then "Filters" sheet (Category, Priority, Safeguarding only, Created between).
4. Ticket cards: subject (title, 2 lines max), requester display name and role, status badge, priority badge, "Waiting 2 days", safeguarding badge if flagged. Whole card links to the ticket page.
5. Pagination.

Ticket (`/admin/support/[ticketId]`):
1. Back link "Support".
2. h1 ticket subject; meta line: "#1842, opened 17 Oct 2026 by Thandi M. (student, high school)" with link "Open user".
3. Status, priority and assignee controls as three selects in a stacked group.
4. Safeguarding banner when flagged.
5. Thread: messages oldest first; user messages left-aligned card, admin replies right-aligned card on a muted surface, internal notes on an attention surface labelled "Internal note".
6. Composer sticky at the bottom: segmented "Reply" or "Internal note", textarea (auto-grow, max 5 000 characters), "Then set status" select (default "Waiting on user" for replies), "Send" button.

Contact enquiries (`/admin/support/contact`): cards with name, email (masked until opened), topic, received, status (New, Handled); card opens a drawer with the full message and actions "Mark handled", "Create ticket".

### Desktop (1440px)

- Queue: `DataTable` columns Subject, Requester, Category, Priority, Status, Assignee, Waiting, Updated.
- Ticket page: two columns. Left 8 columns: thread and composer. Right 4 columns: details panel (status, priority, assignee, category, requester card with role, stage, plan, open tickets count, link to user drawer), safeguarding toggle.
- Contact enquiries: table with a drawer.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| Support layout | `web/src/app/(app)/admin/support/layout.tsx` | server | h1, tabs, `PermissionGate support.manage` |
| Queue page | `web/src/app/(app)/admin/support/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Ticket page | `web/src/app/(app)/admin/support/[ticketId]/page.tsx` (+ `loading.tsx`, `error.tsx`, `not-found.tsx`) | server | |
| Contact page | `web/src/app/(app)/admin/support/contact/page.tsx` (+ `loading.tsx`, `error.tsx`) | server | |
| Queue filters | `web/src/features/admin/support/components/ticket-filters.tsx` | client | Chips plus sheet |
| Ticket table | `web/src/features/admin/support/components/ticket-table.tsx` | server | |
| Badges | `web/src/features/admin/support/components/ticket-badges.tsx` | server | Status, priority, safeguarding |
| Thread | `web/src/features/admin/support/components/ticket-thread.tsx` | server | Plain text with line breaks and autolinks; no HTML from users |
| Composer | `web/src/features/admin/support/components/ticket-composer.tsx` | client | Reply or note, status after send, draft kept in `sessionStorage` (try/catch) |
| Details panel | `web/src/features/admin/support/components/ticket-details-panel.tsx` | client | Status, priority, assignee selects, each saves on change |
| Safeguarding toggle | `web/src/features/admin/support/components/safeguarding-toggle.tsx` | client | Reason required |
| Safeguarding banner | `web/src/features/admin/support/components/safeguarding-banner.tsx` | server | Escalation steps and helplines from BE-WEL-08 |
| Contact table | `web/src/features/admin/support/components/contact-table.tsx` | server | |
| Contact drawer | `web/src/features/admin/support/components/contact-drawer-body.tsx` | server | |
| Contact actions | `web/src/features/admin/support/components/contact-actions.tsx` | client | Mark handled, Create ticket |
| Loaders | `web/src/features/admin/support/server/*.ts` | server | Uncached; counts cached 30s `cacheTag("admin-support-counts")` |

## Data

| Endpoint | BE ID | Method | Fields used |
|---|---|---|---|
| `/admin/support/tickets?status=&assignee=&category=&priority=&safeguarding=&from=&to=&cursor=` | BE-SUP-11 | GET | `items[]` { `id`, `number`, `subject`, `requester` { `userId`, `displayName`, `role`, `stage` }, `category`, `priority` (`low`, `normal`, `high`), `status` (`open`, `waiting_on_user`, `resolved`), `assignee` { `id`, `name` } or null, `safeguarding`, `waitingSince`, `updatedAt` }, `nextCursor`, `total` |
| `/admin/support/tickets/{id}` | BE-SUP-11 | GET | Ticket fields plus `messages[]` { `id`, `kind` (`user`, `admin_reply`, `internal_note`, `system`), `authorName`, `body`, `createdAt`, `emailDelivery` (`sent`, `failed`, `pending`, null) }, `requester` { `planName`, `openTickets` }, `version` |
| `/admin/support/counts` | BE-SUP-11 (needs counts field; flag) | GET | `openTickets`, `unassigned`, `newContactEnquiries` |
| `/admin/support/admins` | needs new BE task (assignable admins list) | GET | `items[]` { `id`, `name` } |
| `/admin/support/contact-enquiries?status=&cursor=` | needs new BE task (admin read for BE-SUP-12 records) | GET | `items[]` { `id`, `name`, `emailMasked`, `topic`, `receivedAt`, `status` } |
| `/admin/support/contact-enquiries/{id}` | needs new BE task | GET | `name`, `email` (full, access-logged), `topic`, `message`, `receivedAt`, `status`, `ticketId` |

Mutations (BFF, `Idempotency-Key`)

| Action | Endpoint | BE ID | Request | Notes |
|---|---|---|---|---|
| Reply | `POST /admin/support/tickets/{id}/messages` | BE-SUP-11 | `kind: "admin_reply"`, `body` (1 to 5 000), `setStatus?`, `version` | Sends email and in-app notification via outbox |
| Internal note | same | BE-SUP-11 | `kind: "internal_note"`, `body` | Never emailed, never visible to the user |
| Update ticket | `PATCH /admin/support/tickets/{id}` | BE-SUP-11 (assignment needs new BE task) | `status?`, `priority?`, `assigneeId?`, `version` | 409 on stale `version` |
| Safeguarding flag | `POST /admin/support/tickets/{id}/safeguarding` | needs new BE task | `flagged`, `reason` | Audited; notifies the safeguarding lead by email |
| Mark enquiry handled | `POST /admin/support/contact-enquiries/{id}/handled` | needs new BE task | `note?` | |
| Create ticket from enquiry | `POST /admin/support/contact-enquiries/{id}/ticket` | needs new BE task | none | Returns `ticketId`; links a user if the email matches an account |

## States

| State | When | Copy |
|---|---|---|
| Loading | Suspense | Row skeletons; ticket page thread skeleton |
| Queue empty (open) | No open tickets | "No open tickets. Nice. New tickets from students and parents show here." |
| No matches | Filters | "No tickets match these filters." action "Clear filters" |
| Ticket not found | 404 | "This ticket does not exist." action "Back to support" |
| Reply sending | Submitting | Send button "Sending..." disabled; composer read-only |
| Reply sent | 200 | Message appears in thread; toast "Reply sent." |
| Email failed | Message `emailDelivery` failed | Under the reply: "Email did not reach {masked email}. They will still see it in the app." |
| Stale ticket | 409 | "Someone else updated this ticket. We reloaded it. Your draft is kept." |
| Safeguarding banner | `safeguarding` true | "Safeguarding concern. If a student may be in danger, do not wait on email. Follow the safeguarding steps and contact the safeguarding lead now." plus helplines list (from BE-WEL-08) |
| Contact empty | None | "No contact enquiries yet." |
| Error | Load fails | "We could not load support tickets. Try again." |
| Forbidden | No `support.manage` | "You do not have access to support. Ask an admin who holds roles.manage to grant support.manage." |

## Stage variants

- Requester labels: "(student, high school)", "(student, university)", "(parent)", "(visitor)" for contact enquiries without an account.
- Reply templates are not stage-aware in v1; admins write plain replies.

## Interactions and edge cases

- Ticket bodies are plain text from users. Rendered as text with line breaks and safe autolinks (`rel="noopener noreferrer nofollow"`). No Markdown, no HTML from user input.
- Composer draft survives a reload via `sessionStorage` keyed by ticket id; cleared on send.
- Reply and status change are one request so the status cannot change without the reply being saved.
- Internal note mode changes the composer border and the Send label to "Add note" so admins do not send a note as a reply by mistake.
- Assignee select shows "Unassigned" and "Assign to me" first.
- Tickets from deleted accounts: requester shows "Deleted account"; replying is disabled with "This person deleted their account. You cannot reply."
- A ticket that mentions self-harm keywords is not auto-flagged in v1 (no NLP, decision 7); admins flag manually.
- Contact enquiry from an email that matches an account: drawer shows "Matches an account" with a link to the user drawer.
- Attachments: not supported in v1 tickets (BE-SUP-10 has none).

## Copy

- h1 "Support"; description "Tickets and contact enquiries. Oldest waiting first."
- Tabs "Tickets", "Contact enquiries"
- Chips "Open", "Mine", "Unassigned", "Waiting on user", "Resolved"
- Status labels "Open", "Waiting on user", "Resolved"; priority "Low", "Normal", "High"
- Composer: "Reply", "Internal note", placeholder "Write a reply. The person gets it by email and in the app.", note placeholder "Only admins see this note.", "Then set status", "Send", "Add note"
- Safeguarding toggle "Mark as safeguarding concern", reason label "Why are you concerned?"
- Contact actions "Mark handled", "Create ticket"

## Acceptance criteria

- Given open tickets, when the queue loads, then tickets are sorted by `waitingSince` ascending and the Tickets tab badge equals `openTickets`.
- Given a ticket, when an admin sends a reply with "Then set status: Waiting on user", then one request is sent, the reply appears in the thread, the status shows "Waiting on user" and the user receives an email (Mailpit in local tests).
- Given internal note mode, when the admin adds a note, then it appears with "Internal note" styling and the requester's ticket view does not include it (checked through the student ticket API).
- Given two admins on one ticket, when the second saves with a stale version, then the 409 copy shows and the draft is kept.
- Given an admin flags safeguarding with a reason, when saved, then the banner shows, the audit log has the event and the safeguarding lead email is queued.
- Given a ticket body containing `<script>`, when rendered, then it shows as text.
- Given a contact enquiry, when the admin creates a ticket from it, then the admin lands on the new ticket page.

## Production readiness

Security
- `support.manage` enforced on every endpoint (the nav entry needs this permission added).
- User text rendered as text only; React escaping plus no `dangerouslySetInnerHTML` in support components (lint check).
- Reply email built from a template server-side; admin text is escaped in the email.
- Safeguarding flag changes audited with reason.

Performance
- Queue keyset-paginated by `(waiting_since, id)`; index on `(status, waiting_since)`.
- Ticket page loads thread in one call; threads over 200 messages paginate older messages ("Show earlier messages").

Resilience
- Reply idempotent per key; double-click guard.
- Email sending through the outbox (BE-NTF-02); failure shows on the message, reply still saved.
- Optimistic concurrency with `version`.

Observability
- Audit events `admin.ticket.reply`, `.note`, `.update`, `.safeguarding`, `admin.contact.handled`, `.to_ticket`.
- Metric: time to first reply, open ticket age p90.

Accessibility (WCAG 2.2 AA)
- Thread is a list with each message labelled by author and time; internal notes announced as "Internal note".
- Composer mode switch is a radio group; status select labelled.

Privacy and POPIA
- Contact enquiry full email visible only in the drawer, access-logged.
- Ticket content can contain sensitive personal information about minors; retention per HRD-35; no export.

Rollout
- Under `ADMIN_CONSOLE`; replies under `ADMIN_WRITE_ACTIONS`.

Monitoring
- Alert when any open ticket waits longer than 48 hours, and when any safeguarding ticket waits longer than 2 hours without an admin reply.
- Panel: open tickets, median first reply time, email delivery failures.

Tasks
- [ ] **PG-ADM-SUPPORT-17** Lint rule or test: no `dangerouslySetInnerHTML` in `features/admin/support`
- [ ] **PG-ADM-SUPPORT-18** Older messages pagination for long threads
- [ ] **PG-ADM-SUPPORT-19** Alerts for ticket age and safeguarding wait; support panel in Grafana
- [ ] **PG-ADM-SUPPORT-20** Add `support.manage` to the Support nav entry in `nav-config.ts`
- [ ] **PG-ADM-SUPPORT-21** Request new BE tasks: assignment and admins list, counts, safeguarding flag and lead notification, contact enquiry admin read and actions (coordinator)

## Build tasks

- [ ] **PG-ADM-SUPPORT-01** Ticket queue and reply (umbrella; delivered by 04 to 11)
- [ ] **PG-ADM-SUPPORT-02** Contact enquiries list (umbrella; delivered by 13 to 15)
- [ ] **PG-ADM-SUPPORT-03** Definition of Done: every quality and production readiness task in this file checked
- [ ] **PG-ADM-SUPPORT-04** Support layout with tabs and counts
- [ ] **PG-ADM-SUPPORT-05** Queue page, filters (chips and sheet) and loader
- [ ] **PG-ADM-SUPPORT-06** `ticket-table.tsx` and `ticket-badges.tsx`, mobile cards
- [ ] **PG-ADM-SUPPORT-07** Ticket page route files including `not-found.tsx`
- [ ] **PG-ADM-SUPPORT-08** `ticket-thread.tsx` with safe plain-text rendering
- [ ] **PG-ADM-SUPPORT-09** `ticket-composer.tsx` reply mode with status after send
- [ ] **PG-ADM-SUPPORT-10** Composer internal note mode and draft persistence
- [ ] **PG-ADM-SUPPORT-11** `ticket-details-panel.tsx` (status, priority, assignee) with 409 handling
- [ ] **PG-ADM-SUPPORT-12** Safeguarding toggle and banner with helplines
- [ ] **PG-ADM-SUPPORT-13** Contact enquiries page, table and loader
- [ ] **PG-ADM-SUPPORT-14** Contact drawer with account match
- [ ] **PG-ADM-SUPPORT-15** Mark handled and Create ticket actions
- [ ] **PG-ADM-SUPPORT-16** Deleted requester and email delivery failed states

## Quality tasks

- [ ] **PG-ADM-SUPPORT-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-ADM-SUPPORT-Q02** Server loader in `src/features/admin/support/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-ADM-SUPPORT-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-ADM-SUPPORT-Q04** Empty state with one clear next action
- [ ] **PG-ADM-SUPPORT-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-ADM-SUPPORT-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-ADM-SUPPORT-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-ADM-SUPPORT-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-ADM-SUPPORT-Q09** Layout at 1440px
- [ ] **PG-ADM-SUPPORT-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-ADM-SUPPORT-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-ADM-SUPPORT-Q12** axe: zero violations in light and dark
- [ ] **PG-ADM-SUPPORT-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-ADM-SUPPORT-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-ADM-SUPPORT-Q15** `generateMetadata` title; nav entry active state correct

## Tests

Unit (Vitest)
- `features/admin/support/components/ticket-thread.test.tsx`: "renders user html as text", "autolinks with noopener", "labels internal notes"
- `features/admin/support/components/ticket-composer.test.tsx`: "defaults status to waiting on user for replies", "note mode changes send label", "restores draft from session storage", "survives storage throwing"

Playwright (`web/tests/e2e/admin/support.spec.ts`)
- "queue sorted by waiting time"
- "reply with status change sends email"
- "internal note hidden from requester"
- "stale ticket update keeps draft"
- "safeguarding flag shows banner and audits"
- "contact enquiry becomes ticket"
- "support pages have no axe violations in light and dark"

## Open questions

- Decided (34): a named safeguarding lead owns escalations; the banner and lead notification use that role. The person's name and contact are a fact still owed (DECISIONS F) and the written escalation procedure lives in the runbook (`launch/runbooks.md`).
- Should students see the assignee's name on their side? Recommend first name only.
- Canned replies (saved responses): useful but not in BE-SUP-11; later.
