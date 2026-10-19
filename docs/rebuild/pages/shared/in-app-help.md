# In-app help

| | |
|---|---|
| ID | `PG-CMN-HELP` |
| Route | `/help` (public page from PG-MKT-HELP, with signed-in extras: help bot, contact options, your tickets); `/help/tickets`, `/help/tickets/new`, `/help/tickets/[id]` (signed in, app shell) |
| Phase | 9 (help bot behind `flags.helpBot`) |
| Roles | student / parent / admin (anonymous visitors get the public page only) |
| Stages | high school, university |
| Entitlement | free (help bot rate-limited per user, not plan-gated) |
| Depends on | PG-MKT-HELP (public `/help` and `/help/[slug]`), BE-SUP-03, BE-SUP-10, BE-SUP-14, BE-AI-21, BE-WEL-08, BE-IDN-28, BE-NAV-01; FE-24, FE-25, FE-63; UI-07, UI-29; proposed API slices in Open questions (ticket detail and reply) |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/help/page.tsx` and `43f9faa:web/src/app/(app)/parent/help/page.tsx` (hardcoded FAQs, corrected in 43f9faa to honest answers: no offline use, diary stored on the server and not end-to-end encrypted, goals verify from the student's own work; still showed an unbacked "Live chat 7am to 7pm" row and `support@aptiverse.co.za`), `43f9faa:web/src/components/dashboard/AIHelpBot.tsx` and `43f9faa:web/src/lib/hooks/useAiHelp.ts` (floating help bot in the shell for every role, charged the `ai.quick` quota, usage meter, 402 `quota_exhausted` state with upgrade links, neutral starter prompts) |
| Status | Not started (0 of 49 tasks) |

## Purpose

When a signed-in user is stuck, help is one tap away from every page and always in the same place. They can search articles (shared with the public help centre), ask a help bot that answers "how do I" questions and links to the right page, or open a support ticket and follow its replies. If someone writes something that suggests they are in distress, they are shown South African support lines straight away. The page never claims a live chat, opening hours or features that do not exist.

## User stories

- As a student, I want to search "how do I add a subject" and get an article, so I can fix it myself.
- As a student, I want to ask the help bot where something is, and get a link to the right page.
- As a parent, I want to ask about billing for my children and be taken to the billing page.
- As any user, I want to open a ticket when the bot and articles do not solve it, and see when someone replies.
- As a student who is struggling, I want to be shown who I can talk to right now.
- As an admin, I want the same help surfaces for my own account, with links only to admin pages.

## Layout

### Mobile (360px)

Signed-in `/help` (public sections from PG-MKT-HELP stay in place; signed-in additions marked new):

1. Site header in signed-in variant: "Back to app" link (to the role home: `/dashboard`, `/parent` or `/admin`) replaces "Log in" (new).
2. `h1` "How can we help?" and the article search input (full width, 44px) from PG-MKT-HELP-02.
3. "Get help" card (new): three full-width rows, 56px each: "Ask the help assistant" (`Sparkles`, opens the bot sheet; hidden when `flags.helpBot` is off), "Open a support ticket" (`LifeBuoy`, to `/help/tickets/new`), "Your tickets" (`Inbox`, with "1 awaiting your reply" when relevant).
4. Topic groups and FAQs from PG-MKT-HELP (getting started, account, billing, features, privacy).
5. "Need to talk to someone?" card (new, always visible, magenta wellbeing zone): one line and a link "Support lines" that opens the support resources sheet.

Help bot sheet (bottom `Sheet`, 90% height):

1. Header: "Help assistant" with a close button, subline "Answers come from an AI assistant. It can see which page you came from, never your diary, marks or messages."
2. Starter prompts (chips, 44px) when the conversation is empty.
3. Message log (`role="log"`), assistant answers rendered with `Markdown`, followed by link chips.
4. Composer pinned to the bottom: textarea (max 500 characters, counter at 400+), "Send" button. Above it, a small link "Still stuck? Open a ticket" that carries the conversation summary into the ticket form.

`/help/tickets` (app shell): `PageHeader` "Your tickets" with "New ticket" button; list of ticket cards (reference "APT-1042", subject, status badge, "Updated 19 Oct").

`/help/tickets/new`: back link "Help", `h1` "Open a support ticket", form fields stacked: Topic (select), Subject, Message (textarea), "Which page were you on?" (prefilled from `?from=`, editable), a note "Never share passwords or card numbers.", "Send" button.

`/help/tickets/[id]`: reference and subject as `h1`, status badge, message thread (oldest first), reply box at the bottom when not resolved.

### Desktop (1440px)

- `/help`: content `max-w-5xl`. Search and the "Get help" card sit side by side above the topic groups (search 2/3, card 1/3). The bot opens as a right-side panel (`Sheet` side `right`, 420px) so the article stays readable.
- Tickets routes use the app shell (sidebar) with `PageShell` `max-w-3xl`. The ticket list becomes a `DataTable` (Reference, Subject, Status, Updated) with the mobile card fallback below `md`.
- Ticket detail: thread on the left (2/3), a details card on the right (topic, opened, page, status).

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Public help page | `web/src/app/(marketing)/help/page.tsx` (exists) | server | Reads session with `getSessionUser()`; renders `SignedInHelpExtras` when signed in. Anonymous output stays static with zero bot JS |
| SignedInHelpExtras | `web/src/features/support/components/signed-in-help-extras.tsx` | server | "Get help" card, "Your tickets" count, support lines card |
| Site header signed-in variant | `web/src/components/shell/site-header.tsx` (exists) | server | "Back to app" link by role |
| HelpBotLauncher | `web/src/features/support/components/help-bot/help-bot-launcher.tsx` | client | Button that lazy-loads the panel with `next/dynamic` on first open |
| HelpBotPanel | `web/src/features/support/components/help-bot/help-bot-panel.tsx` | client | `Sheet` (bottom on mobile, right on desktop), message log, composer |
| HelpBotMessage | `web/src/features/support/components/help-bot/help-bot-message.tsx` | client | `Markdown` (UI-29) plus link chips |
| filterBotLinks | `web/src/features/support/lib/filter-bot-links.ts` | shared | Keeps only same-origin paths the role can open (navigation hrefs plus `/help/*`) |
| detectDistress | `web/src/features/support/lib/detect-distress.ts` | shared | Client-side keyword and phrase check (supplements the server check) |
| SupportResourcesSheet | `web/src/features/support/components/support-resources-sheet.tsx` | client | Lists helplines from BE-WEL-08 with `tel:` links; static fallback |
| Crisis fallback data | `web/src/features/support/lib/support-resources-fallback.ts` | shared | Used only when BE-WEL-08 fails |
| Tickets list route | `web/src/app/(app)/help/tickets/page.tsx` | server | App shell; `generateMetadata` "Your tickets" |
| New ticket route | `web/src/app/(app)/help/tickets/new/page.tsx` | server | Renders `TicketForm` |
| Ticket detail route | `web/src/app/(app)/help/tickets/[id]/page.tsx` | server | `notFound()` when the API returns 404 (not yours or missing) |
| Route states | `web/src/app/(app)/help/tickets/{loading,error,not-found}.tsx`, `[id]/{loading,not-found}.tsx` | server / client (error) | `PageState` with retry |
| TicketForm | `web/src/features/support/components/tickets/ticket-form.tsx` | client | `useZodForm` with the generated schema; idempotency key per form instance |
| TicketList | `web/src/features/support/components/tickets/ticket-list.tsx` | server | `DataTable` with card fallback |
| TicketThread and ReplyForm | `web/src/features/support/components/tickets/{ticket-thread,reply-form}.tsx` | server / client | Reply depends on the proposed slice |
| Server loaders | `web/src/features/support/server/{get-articles,get-tickets,get-ticket,get-support-resources}.ts` | server | Articles: `"use cache"` with `cacheTag("support:articles")`; tickets: per user, React `cache()` only |
| Kit used | `components/shell/page-shell.tsx`, `page-header.tsx`, `page-state.tsx`, `page-states.tsx`; `components/common/data-table.tsx`, `empty-state.tsx`, `form-fields.tsx`, `markdown.tsx`; `components/ui/sheet.tsx`, `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `select.tsx`, `field.tsx`, `sonner.tsx` | | |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/support/articles?q=` (BE-SUP-14) | GET | `items[]: { slug, title, summary, category }` | Public: `"use cache"`, `cacheTag("support:articles")`, `cacheLife` revalidate 300 s |
| `/support/faqs` (BE-SUP-03) | GET | Existing loader `features/support/server/get-faqs.ts` | Exists: tag `support:faqs` |
| `/me` (BE-IDN-28) | GET | `role`, `firstName`, `educationLevel` (starter prompts) | Session |
| `/navigation` (BE-NAV-01) or `getNavigation()` from `nav-config.ts` until it exists | GET | `sections[].items[].href` for the bot link allowlist | Session |
| `/ai/help` (BE-AI-21) | POST | Request `{ message (1 to 500 chars), fromPath \| null, history: last 6 turns [{ role, text }] }`. Response `{ answer (markdown), links: [{ label, href }], safety: { showSupportResources: boolean } }` | Not cached. Rate-limit group `ai`, per user (proposed 20 messages per hour) |
| `/support/tickets` (BE-SUP-10) | GET | `items[]: { id, reference, subject, topic, status: open \| awaiting_you \| resolved, updatedAt }` | Per user, React `cache()`; `router.refresh()` after create |
| `/support/tickets/{id}` (proposed) | GET | `{ id, reference, subject, topic, status, fromPath, createdAt, messages[]: { id, author: you \| support, body, createdAt } }` | Per user |
| `/wellbeing/support-resources` (BE-WEL-08) | GET | `items[]: { name, description, phone, sms \| null, hours, url \| null }` | Public static, `"use cache"`, tag `wellbeing:resources`; fallback file on failure |

### Mutations

| Endpoint (BE ID) | Method | Request | Client behaviour |
|---|---|---|---|
| `/support/tickets` (BE-SUP-10) | POST | `{ topic: account \| billing \| practice \| family \| privacy \| other, subject (5 to 120 chars), message (20 to 4000 chars), fromPath \| null, botSummary \| null }` with header `Idempotency-Key` | Button pending and disabled; on success redirect to `/help/tickets/{id}` with toast "Ticket APT-1042 sent. We reply by email and here." A retry with the same key returns the same ticket |
| `/support/tickets/{id}/messages` (proposed) | POST | `{ body (1 to 4000 chars) }` with `Idempotency-Key` | Appends optimistically with "Sending"; rollback and inline error on failure |
| `/ai/help` (BE-AI-21) | POST | As above | Shows a typing indicator; one request in flight at a time; Send disabled while pending |

All client calls go through `/api/bff` with generated hooks.

Additions from the 43f9faa review:

- `POST /ai/help` (BE-AI-21) response adds `quota` (`used`, `limit`, `null` limit for unlimited). A `402` with `error: quota_exhausted` carries `used` and `limit`. (PG-CMN-HELP-19)

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading (tickets) | Suspense fallback | Visually hidden "Loading your tickets"; card skeletons | None |
| Empty (tickets) | No tickets | Title "No tickets yet". Body "If something is not working, tell us and we will reply by email and here." | Button "Open a support ticket" |
| Error (tickets list) | Loader fails | Title "We could not load your tickets". Body "Check your connection and try again. You can also email support@aptiverse.co.za." | "Try again" (`retry`) |
| Not found (ticket) | 404 (missing or not yours) | Title "We could not find that ticket". Body "It may belong to another account." | Link "Your tickets" |
| Ticket sent | POST success | Toast "Ticket {reference} sent. We reply by email and here." | |
| Ticket failed | POST fails | Inline above Send: "Your ticket was not sent. Check your connection and try again. Your message is still here." | "Send" again (same idempotency key) |
| Bot empty | Panel opened, no messages | "Ask how to do something in Aptiverse. For example:" plus starter prompts | Chips |
| Bot thinking | Request in flight | Visually hidden "The assistant is answering"; three-dot indicator with reduced-motion fallback "Answering" | None |
| Bot unavailable | 5xx, timeout (15 s) or `flags.helpBot` turned off mid-session | "The help assistant is not available right now. Search the articles above or open a ticket." | Link "Open a support ticket" |
| Bot limit | 429 | "You have asked a lot of questions in a short time. Try again in a few minutes, or open a ticket." | Link "Open a support ticket" |
| Bot safety | `safety.showSupportResources` true or `detectDistress` matches | Card above the answer: "It sounds like things might be hard right now. You do not have to handle it alone. You can talk to someone today, for free." | "See support lines" (opens sheet) |
| Support lines fallback | BE-WEL-08 fails | Static list from the fallback file, same layout | `tel:` links |
| Forbidden | Signed-in route without `account.manage` | Title "Support tickets are not available for this account". Body "Email support@aptiverse.co.za for help." | None |
| Upgrade | Not applicable | | |
| Populated | Default | Layout as described | |

## Stage variants

- Starter prompts for a high school student: "How do I add my subjects?", "Where do I log an SBA task mark?", "How do practice tests work?", "Who can see my diary?".
- Starter prompts for a university student: "How do I add a module?", "Where do I log an assignment mark?", "How do practice tests work?", "Who can see my diary?".
- Parent prompts: "How do I link my child?", "What can I see about my child?", "How does family billing work?".
- Admin prompts: "Where do I find a user?", "How do I reply to a ticket?".
- The bot's server context carries only role and stage (`educationLevel`), so answers use the right vocabulary; it carries no marks, subjects, diary or wellbeing data.
- Ticket topics are the same for every stage; the "Family" topic is shown to students and parents only.

## Interactions and edge cases

- Help is reachable from the same place on every page: the "Help" nav item (`/help`) and the account menu (SHL-09). Contextual entry from an error state passes `?from=/dashboard/practice` (a path only, never ids of other users or personal data); paths are stripped of query strings before being sent.
- The bot panel loads its JavaScript only when first opened. Closing the panel keeps the conversation in memory for the page visit; it is not stored in the browser. Reopening restores it.
- History sent to `/ai/help` is the last 6 turns, each capped at 500 characters; the server rebuilds its own context and never trusts client-supplied role or permissions.
- Every bot link passes `filterBotLinks`: same-origin relative path, present in the role's navigation hrefs or under `/help/`. Links that fail are dropped silently and reported as `help_bot_link_blocked`. A parent never receives a `/dashboard/...` link; a student never receives `/admin/...`.
- Prompt injection: the bot answer is rendered as Markdown with raw HTML disabled and images disabled; links in the Markdown body are subject to the same filter.
- Distress: the client check runs on each message before sending, and the server flags answers. When either fires, the safety card shows above the answer and the bot also answers the question normally if there is one. The message is still sent (the user is never blocked). Matching tickets are flagged for priority review by the API (open question).
- Support lines are always reachable from `/help` without typing anything.
- "Still stuck? Open a ticket" pre-fills the ticket message with a short bot summary the user can edit or remove before sending; nothing is sent without the user pressing Send.
- Ticket form keeps its contents after a failed send. Double click on Send creates one ticket (button disabled plus idempotency key).
- The "Never share passwords or card numbers" note is shown on the form; the API additionally masks digit runs that look like card numbers (open question for Support).
- Ticket replies from support arrive as `support_ticket_reply` notifications (PG-CMN-NOTIF) and by email; the ticket status becomes `awaiting_you`. Replying moves it to `open`. A resolved ticket shows "This ticket is resolved. Open a new ticket if you need more help." and no reply box.
- Article search is shared with PG-MKT-HELP-02 and behaves the same signed in or not.
- The slug `tickets` is reserved and must never be used for an article (the static `(app)/help/tickets` segment wins over `(marketing)/help/[slug]`).
- Anonymous users visiting `/help/tickets/*` are redirected by `proxy.ts` to `/login?returnTo=`.
- Quota: the old bot spent the student's `ai.quick` allowance. The panel shows a small meter when the limit is finite ("{used} of {limit} quick AI replies this month", warning tone at 75%, stronger at 95%), a quiet "Unlimited on your plan" line when unlimited, and nothing when the limit is zero. On `402 quota_exhausted` the composer is disabled and the panel offers "See plans" and "Open a ticket". (PG-CMN-HELP-19)
- Reach: the old bot floated on every app page. In the rebuild the help assistant opens from `/help` and from the account menu (SHL-09) in the same lazy-loaded sheet, behind `flags.helpBot`; no floating button covers page content. (PG-CMN-HELP-20)
- Honest answers: the corrected 43f9faa FAQ answers (no offline use, diary storage as it really is, goals verify from your own work, practice tests built from the subject and topics you choose) seed the first article set with PG-MKT-HELP-04. f223ca7's false claims (offline use, end-to-end diary encryption, school-verified rewards) and the unbacked "Live chat" row never return. (PG-CMN-HELP-21)

## Copy

| Key | Text |
|---|---|
| Get help card title | Get help |
| Bot row | Ask the help assistant |
| Ticket row | Open a support ticket |
| Tickets row | Your tickets |
| Tickets awaiting | {n} awaiting your reply |
| Bot header | Help assistant |
| Bot disclosure | Answers come from an AI assistant. It can see which page you came from, never your diary, marks or messages. |
| Bot placeholder | Ask how to do something |
| Bot counter | {n} of 500 characters |
| Bot to ticket | Still stuck? Open a ticket |
| Support card title | Need to talk to someone? |
| Support card body | Free, confidential support lines in South Africa. |
| Support card link | Support lines |
| Safety card | It sounds like things might be hard right now. You do not have to handle it alone. You can talk to someone today, for free. |
| Ticket form title | Open a support ticket |
| Topic label | What is it about? |
| Subject label | Subject |
| Message label | What happened? |
| Message hint | Tell us what you were trying to do and what you saw. |
| From label | Which page were you on? |
| Safety note | Never share passwords or card numbers. |
| Send | Send ticket |
| Status badges | Open / Awaiting your reply / Resolved |
| Back to app | Back to app |

- Quota meter: "{used} of {limit} quick AI replies this month"; unlimited: "Unlimited on your plan".
- Quota exhausted: "You have used all {limit} quick AI replies this month. They reset on {date}. You can still open a ticket." Buttons "See plans" and "Open a ticket".

## Acceptance criteria

- **AC-01** Given an anonymous visitor, when they open `/help`, then the page matches PG-MKT-HELP with no "Get help" card and no help bot JavaScript loaded.
- **AC-02** Given a signed-in student, when they open `/help`, then they see "Back to app" linking to `/dashboard`, the "Get help" card and the support lines card.
- **AC-03** Given `flags.helpBot` is off, when a signed-in user opens `/help`, then "Ask the help assistant" is not shown.
- **AC-04** Given a parent asks the bot "where do I pay", when the answer includes links to `/parent/billing` and `/dashboard/billing`, then only the `/parent/billing` chip is shown.
- **AC-05** Given the bot endpoint returns 500, when the user sends a message, then "The help assistant is not available right now. Search the articles above or open a ticket." shows with a ticket link.
- **AC-06** Given a student types a message containing a distress phrase from the reviewed list, when they send it, then the safety card appears above the answer and "See support lines" opens a sheet with `tel:` links.
- **AC-07** Given BE-WEL-08 fails, when the support lines sheet opens, then the fallback list renders.
- **AC-08** Given a valid ticket form, when the user double-clicks "Send ticket", then exactly one ticket is created and they land on its detail page with the reference in a toast.
- **AC-09** Given a send fails, when the error shows, then the typed message is still in the form and resending creates one ticket.
- **AC-10** Given user A, when they open `/help/tickets/{id}` for user B's ticket, then they see "We could not find that ticket".
- **AC-11** Given a ticket with status `awaiting_you`, when the user opens the list, then the badge reads "Awaiting your reply" and the help card reads "1 awaiting your reply".
- **AC-12** Given the help bot server handler, when it builds context for a student who has diary entries and marks, then the prompt contains role and stage only (integration test asserts seeded diary text and marks are absent).
- **AC-13** Given a user who has used all quick AI replies, when they send a message, then the exhausted copy shows, the composer is disabled and "Open a ticket" works.
- **AC-14** Given any app page, when the user opens the account menu and chooses "Ask the help assistant", then the same help sheet opens with focus in the composer.

## Production readiness

### Security

- [ ] Bot context is built server-side from role and stage only; an integration test seeds diary text, marks and wellbeing values and asserts none reach the prompt (Q16).
- [ ] Bot links validated on the server (BE-AI-21 returns only known routes for the role) and again on the client (`filterBotLinks`); Markdown renders without raw HTML (Q16).
- [ ] Ticket reads are owner-scoped in the API; ids in URLs are Guid v7, never the human reference; cross-user access returns 404 (Q17).
- [ ] Mutations go through `/api/bff` (same-origin, httpOnly session), so no CSRF and no token in the browser (Q17).
- [ ] No PII in URLs or logs: `?from=` carries a path only, ticket bodies and bot messages are never logged or sent to Sentry, analytics carry no text (Q18).

### Privacy and POPIA

- [ ] Bot disclosure shown before the first message; transcripts retained for 30 days for quality and abuse review, then deleted; never used to train models (Q23).
- [ ] Minors: no data beyond role and stage reaches the AI provider; support lines include Childline (116) for under-18s (Q23).
- [ ] Ticket data minimisation: no attachments in v1; the safety note discourages card numbers and passwords (Q23).

### Performance

- [ ] Anonymous `/help` stays statically rendered with zero bot JS; signed-in extras stream in a Suspense boundary (Q19).
- [ ] Bot panel code split with `next/dynamic`; `/help` route JS under 150 KB gzip before the panel opens; tickets routes under 150 KB (Q19).
- [ ] LCP under 2.5 s on Lighthouse mobile for `/help` signed in and `/help/tickets` (Q19).
- [ ] Cache: articles and support resources use public `"use cache"` tags; tickets are per user with no shared cache (Q19).

### Resilience

- [ ] Anthropic outage or timeout (15 s) shows the unavailable state with article and ticket fallbacks; the rest of `/help` is unaffected (Q20).
- [ ] Ticket create and reply carry an `Idempotency-Key`; double click and retry create one ticket or message (Q20).
- [ ] Support lines render from a static fallback when BE-WEL-08 fails (Q20).

### Observability

- [ ] Sentry boundaries on tickets routes and an error boundary around the bot panel with tags `{ page: "PG-CMN-HELP", role }`; `traceparent` forwarded through the BFF so bot failures link to AI module traces (Q22).
- [ ] Analytics events (consent-gated, no text): `help_page_viewed { signedIn }`, `help_search { resultsCount bucket }`, `help_article_opened { slug }`, `help_bot_opened`, `help_bot_message_sent { turn }`, `help_bot_link_clicked { href }`, `help_bot_link_blocked`, `help_bot_failed { reason }`, `help_ticket_created { topic }`, `help_ticket_replied`, `help_safety_card_shown { source: client \| server }` (Q21).

### Accessibility (WCAG 2.2 AA)

- [ ] Consistent help (3.2.6): Help sits in the same nav position and account menu on every page (Q24).
- [ ] Bot log uses `role="log"` with polite announcements; focus moves into the sheet on open and back to the launcher on close; composer never hidden behind the on-screen keyboard (2.4.11) (Q24).
- [ ] Typing indicator respects reduced motion; ticket form errors summarised and linked (Q24).

### Rollout

- [ ] Help bot behind `flags.helpBot`: on in staging first, then production for admin accounts only, then all roles after one week of reviewed transcripts; kill switch is the flag (panel hides, `/help` unaffected). Tickets ship behind `flags.supportTickets` with Phase 9 (Q25).

### Monitoring and alerts

- [ ] Alerts: help bot error rate above 5% for 15 minutes; help bot p95 above 8 s; daily help bot AI spend above the budget set in decision 9; ticket create 5xx above 2% for 10 minutes; tickets in `open` with no staff reply for 2 business days (Q26).
- [ ] Weekly aggregate of `help_safety_card_shown` reviewed (counts only, no content) to check the trigger list is not over or under firing (Q26).

## Build tasks

- [ ] **PG-CMN-HELP-01** Article search (shared with public help; reuses PG-MKT-HELP-02 unchanged for signed-in users)
- [ ] **PG-CMN-HELP-02** Help bot panel (`HelpBotPanel` in a responsive `Sheet` with message log and composer)
- [ ] **PG-CMN-HELP-03** Open a ticket, my tickets (routes `/help/tickets` and `/help/tickets/new`)
- [ ] **PG-CMN-HELP-04** Signed-in variant of `/help`: session read with `getSessionUser()`, `SignedInHelpExtras` in a Suspense boundary, anonymous output unchanged
- [ ] **PG-CMN-HELP-05** "Back to app" link in the signed-in site header, resolved per role
- [ ] **PG-CMN-HELP-06** "Get help" card with bot, new ticket and your tickets rows, including the awaiting-reply count
- [ ] **PG-CMN-HELP-07** `HelpBotLauncher` with `next/dynamic` lazy load and `flags.helpBot` gate
- [ ] **PG-CMN-HELP-08** Composer: 500-character limit with counter, one request in flight, last 6 turns of history
- [ ] **PG-CMN-HELP-09** Answer rendering with `Markdown` (no raw HTML, no images) and link chips through `filterBotLinks`
- [ ] **PG-CMN-HELP-10** `filterBotLinks` with the role allowlist from navigation hrefs plus `/help/*`
- [ ] **PG-CMN-HELP-11** Bot unavailable, rate-limited and timeout states
- [ ] **PG-CMN-HELP-12** Starter prompts per role and stage
- [ ] **PG-CMN-HELP-13** `TicketForm` with topics, `?from=` prefill (path only), safety note, idempotency key, kept contents on failure
- [ ] **PG-CMN-HELP-14** `TicketList` with status badges, empty state and `DataTable` card fallback
- [ ] **PG-CMN-HELP-15** Ticket detail route with thread and reply form (depends on the proposed detail and reply slices)
- [ ] **PG-CMN-HELP-16** "Still stuck? Open a ticket" handoff with an editable bot summary
- [ ] **PG-CMN-HELP-17** `detectDistress` with the reviewed phrase list and the safety card in the bot and ticket form
- [ ] **PG-CMN-HELP-18** Support lines card and `SupportResourcesSheet` from BE-WEL-08 with the static fallback file
- [ ] **PG-CMN-HELP-19** Help bot quota meter, unlimited line and `402 quota_exhausted` state with "See plans" and "Open a ticket"
- [ ] **PG-CMN-HELP-20** Account menu entry that opens the same lazy help sheet (SHL-09), behind `flags.helpBot`
- [ ] **PG-CMN-HELP-21** Carry the corrected 43f9faa FAQ answers into the first help article set with PG-MKT-HELP-04, and drop the unbacked live chat and hours rows

## Quality tasks

- [ ] **PG-CMN-HELP-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` for `/help/tickets/[id]`
- [ ] **PG-CMN-HELP-Q02** Server loaders in `src/features/support/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-CMN-HELP-Q03** Client mutations through `/api/bff` with generated TanStack hooks; pending states and idempotency keys
- [ ] **PG-CMN-HELP-Q04** Empty state with one clear next action (no tickets: "Open a support ticket")
- [ ] **PG-CMN-HELP-Q05** Error state copy: what went wrong and how to fix it (tickets, bot, send failure)
- [ ] **PG-CMN-HELP-Q06** Forbidden state for tickets; no upgrade state (free)
- [ ] **PG-CMN-HELP-Q07** Stage-aware wording checked in starter prompts and bot answers (no SBA, APS, matric or Grade wording for university students; no module or GPA wording for high-school students)
- [ ] **PG-CMN-HELP-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); ticket table collapses to cards
- [ ] **PG-CMN-HELP-Q09** Layout at 1440px (side-by-side search and help card, right-side bot panel)
- [ ] **PG-CMN-HELP-Q10** Light and dark both correct (OS-driven), including the magenta support card
- [ ] **PG-CMN-HELP-Q11** Copy review: no emojis, no em or en dashes, plain and specific; no claims of live chat, hours or offline use
- [ ] **PG-CMN-HELP-Q12** axe: zero violations in light and dark, with the bot panel open
- [ ] **PG-CMN-HELP-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order, sheet focus trap and return
- [ ] **PG-CMN-HELP-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-CMN-HELP-Q15** `generateMetadata` titles; Help nav entry active state correct on `/help` and the tickets routes
- [ ] **PG-CMN-HELP-Q16** Security: bot context integration test (no diary, marks or wellbeing data) and link allowlist tests on server and client
- [ ] **PG-CMN-HELP-Q17** Security: cross-user ticket access returns 404; BFF rejects cross-origin ticket posts
- [ ] **PG-CMN-HELP-Q18** PII review: `?from=` path only, no ticket or bot text in logs, Sentry or analytics
- [ ] **PG-CMN-HELP-Q19** Performance: anonymous `/help` static with no bot JS, panel code split, route JS under 150 KB gzip, LCP under 2.5 s on mobile
- [ ] **PG-CMN-HELP-Q20** Resilience: AI outage fallback, ticket idempotency under double click and retry, support lines fallback
- [ ] **PG-CMN-HELP-Q21** Analytics events listed in Production readiness, consent-gated, no text
- [ ] **PG-CMN-HELP-Q22** Sentry boundaries and trace propagation for tickets routes and the bot panel
- [ ] **PG-CMN-HELP-Q23** POPIA review: bot disclosure, transcript retention, minors, no attachments
- [ ] **PG-CMN-HELP-Q24** WCAG 2.2 AA: consistent help, chat log semantics, focus not obscured by the keyboard, reduced motion
- [ ] **PG-CMN-HELP-Q25** Rollout: `flags.helpBot` staged release (staging, admins, all) and `flags.supportTickets`, with rollback notes
- [ ] **PG-CMN-HELP-Q26** Monitoring: bot error rate, latency and spend alerts; ticket create failures; unanswered tickets; weekly safety-card aggregate review
- [ ] **PG-CMN-HELP-Q27** Safety review of the distress phrase list, safety card copy and helpline list with a wellbeing advisor, recorded in the PR
- [ ] **PG-CMN-HELP-Q28** Claims check: help articles and bot starter prompts reviewed against the claims ledger; no offline, end-to-end diary or live chat claim unless backed by a shipped feature

## Tests

### Unit (Vitest)

- `features/support/lib/filter-bot-links.test.ts`: parent drops `/dashboard/*` and `/admin/*`; keeps `/help/billing`; drops absolute and protocol-relative URLs.
- `features/support/lib/detect-distress.test.ts`: matches the reviewed phrases in upper and lower case and with extra spaces; does not match the ordinary study phrases agreed in Q27.
- `features/support/components/help-bot/help-bot-panel.test.tsx`: send disabled while pending; 429 and 500 states; safety card on server flag.
- `features/support/components/tickets/ticket-form.test.tsx`: validation limits, same idempotency key on retry, contents kept on failure, `?from=` stripped of query strings.
- `features/support/components/support-resources-sheet.test.tsx`: renders fallback on loader failure; `tel:` links present.

### Playwright

- `help.spec.ts` "anonymous help has no signed-in extras" (AC-01).
- "signed-in student sees get help and back to app" (AC-02); "bot hidden when flag is off" (AC-03).
- "parent bot answer shows only parent links" (AC-04, `/ai/help` mocked).
- "bot unavailable shows fallback" (AC-05).
- "distress message shows support lines" (AC-06) and "support lines fallback" (AC-07).
- `tickets.spec.ts` "double click creates one ticket" (AC-08); "failed send keeps message" (AC-09); "cannot open another user's ticket" (AC-10); "awaiting reply badge and count" (AC-11).
- axe in light and dark with the bot panel open on Pixel 7, iPhone 14 and desktop Chrome.
- Unit `help-bot-quota.test.tsx`: meter thresholds, unlimited line, hidden at zero, exhausted disables composer.
- Playwright `help assistant opens from account menu`, `quota exhausted offers plans and ticket`.

## Open questions

- BE-SUP-10 lists only `POST` and `GET /support/tickets`. Ticket detail (`GET /support/tickets/{id}`) and user replies (`POST /support/tickets/{id}/messages`) need slices, plus the `awaiting_you` status.
- In-app help lives on the public `/help` route inside the marketing layout, so signed-in users leave the app shell there (mitigated by "Back to app"); tickets use the app shell. Alternative: an `(app)/help` page that duplicates the article list inside the shell. Recommendation: keep one `/help` for consistent help and SEO.
- Should tickets that trigger the distress check be flagged for priority review by Support, and who is on call for that?
- Should the API mask card-number-like digit runs in ticket bodies?
- Help bot rate limit (20 per hour proposed) and daily spend ceiling follow the Anthropic monthly ceiling (decision 57); the amount is a fact owed (DECISIONS.md section F).
- Is a support email address (`support@aptiverse.co.za`) confirmed on Zoho? Used in error copy.
- `flags.helpBot` and `flags.supportTickets` live in `web/src/lib/flags.ts`, owned by FE-84 (decision 66); add both keys there with their defaults.
- Should the help assistant spend the same `ai.quick` quota as study use (old behaviour), or a separate small `ai.help` quota so getting help is never blocked by studying? Recommend separate.
