# Support module

| | |
|---|---|
| ID range | `BE-SUP-01` to `BE-SUP-04`, `BE-SUP-10` to `BE-SUP-15` (original); `BE-SUP-05` to `BE-SUP-09`, `BE-SUP-16` to `BE-SUP-36` (splits and additions); `BE-SUP-40` to `BE-SUP-58` (production readiness) |
| Schema | `support` |
| Projects | `src/Modules/Support/Aptiverse.Support`, `src/Modules/Support/Aptiverse.Support.Contracts`, `tests/Aptiverse.Support.UnitTests` |
| Phase | 1 (FAQ sample module), 9 (full support) |
| Consumes | `Aptiverse.Identity.Contracts` (`IUserDirectory`, `UserErased`), `Aptiverse.Notifications.Contracts` (`NotifyUser`, `SendTemplatedEmail`), `Aptiverse.Academics.Contracts` (search provider, BE-SUP-31) |
| Publishes | `FaqPublished` (exists), planned `TicketCreated`, `TicketReplied`, `TicketSafeguardingFlagged`, `ContactEnquiryReceived`, `SchoolEnquiryReceived`; implements `ISupportAdminQueries` for Admin (counts for the dashboard attention list) |
| Depends on | BE-SK-37 (build fix), BE-SK-38, BE-SK-45, BE-SK-47, BE-SK-58, BE-NTF-12, BE-IDN-42, BE-IDN-65 |
| Status | Partial. 2 done, 2 partial, 1 unverified, 48 not started (53 tasks). Projects, schema, `Faq` entity, migration, seeder, `GET /support/faqs`, `POST /support/faqs` and their unit and integration tests exist; the module does not build today because `CreateFaqEndpoint` uses the deleted `Policies.Admin` (BE-SK-37) |

## Responsibilities and out of scope

Responsible for:

- FAQs (public, cached) and help articles (public, searchable), with admin CRUD.
- Support tickets with threaded messages for signed-in users; an admin queue with assignment, status, priority, internal notes, and a safeguarding flag with escalation.
- The public contact form (saves the enquiry and emails the support inbox on Zoho, plus an acknowledgement) and school enquiries, with admin status handling.
- Global search across help content, the user's own study units and app pages.

Out of scope:

- Live chat and the AI help bot (AiTutor `POST /ai/help`, BE-AI-21).
- Moderation of user-generated content (none in v1).
- Sales CRM beyond the enquiry status (school onboarding is a later phase).

## Data model

Schema `support`. Platform columns on every table unless noted.

### faqs (exists, verified in `Persistence/Migrations/20261016141608_InitialCreate.cs`)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| question | varchar(300) | no | unique `ix_faqs_question` filtered `deleted_at IS NULL` |
| answer | varchar(4000) | no | |
| category | varchar(80) | no | |
| sort_order | integer | no | 0 to 10 000 (validator) |
| is_published | boolean | no | index `ix_faqs_is_published_category_sort_order` |

### help_articles (BE-SUP-29)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| slug | varchar(96) | no | unique filtered `deleted_at IS NULL`; `^[a-z0-9]+(-[a-z0-9]+)*$` |
| title | varchar(160) | no | |
| summary | varchar(300) | no | |
| body_markdown | text | no | check `char_length(body_markdown) <= 50000`; rendered by the web with the same Markdown and KaTeX pipeline as tutor output (no raw HTML) |
| category | varchar(48) | no | check over `getting_started`, `account`, `subjects_and_courses`, `assessments`, `practice`, `ai_tutor`, `progress`, `wellbeing`, `parents`, `billing`, `affiliates`, `privacy` |
| audience | varchar(16) | no | check `audience IN ('all','student','parent','high_school','tertiary')` |
| is_published | boolean | no | |
| published_at | timestamptz | yes | |
| search_vector | tsvector | no | stored generated `setweight(to_tsvector('english', title), 'A') || setweight(to_tsvector('english', summary), 'B') || setweight(to_tsvector('english', body_markdown), 'C')`; GIN index |
| updated_by_user_id | uuid | yes | admin id (no FK) |

### tickets (BE-SUP-10)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| reference | varchar(12) | no | unique; human readable `APT-` plus 6 Crockford base32 characters |
| requester_user_id | uuid | no | index `(requester_user_id, last_message_at desc)` |
| subject | varchar(160) | no | |
| category | varchar(24) | no | check over `account`, `billing`, `academics`, `practice`, `ai_tutor`, `wellbeing`, `family`, `affiliates`, `technical`, `other` |
| status | varchar(24) | no | check `status IN ('awaiting_support','awaiting_user','resolved','closed')`; index `(status, last_message_at)` |
| priority | varchar(8) | no | check `priority IN ('low','normal','high','urgent')` |
| assigned_admin_id | uuid | yes | index |
| safeguarding_flag | boolean | no | partial index filtered `safeguarding_flag` |
| safeguarding_flagged_at | timestamptz | yes | |
| safeguarding_flagged_by | uuid | yes | admin id, or null when raised by the keyword screen (BE-SUP-23) |
| escalated_at | timestamptz | yes | |
| channel | varchar(16) | no | check `channel IN ('web','contact_form','email')` |
| last_message_at | timestamptz | no | |
| first_response_at | timestamptz | yes | SLA metric |
| resolved_at | timestamptz | yes | |
| closed_at | timestamptz | yes | auto-close 7 days after `resolved` without a reply |
| satisfaction_rating | smallint | yes | check 1 to 5 |

### ticket_messages (BE-SUP-10)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| ticket_id | uuid | no | FK `tickets.id` restrict; index `(ticket_id, created_at)` |
| author_user_id | uuid | yes | null for system messages |
| author_kind | varchar(16) | no | check `author_kind IN ('requester','support','system')` |
| body | varchar(5000) | no | plain text |
| is_internal | boolean | no | internal notes are never returned to the requester; check `NOT is_internal OR author_kind = 'support'` |

### contact_enquiries (BE-SUP-24)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| first_name | varchar(80) | no | |
| last_name | varchar(80) | no | |
| email | varchar(256) | no | index on lowercased value |
| organisation | varchar(160) | yes | |
| reason | varchar(24) | no | check over `general`, `support`, `billing`, `partnership`, `press`, `schools`, `privacy`, `other` |
| message | varchar(4000) | no | |
| user_id | uuid | yes | set when the submitter was signed in |
| status | varchar(16) | no | check `status IN ('new','contacted','closed','spam')`; index `(status, created_at)` |
| contacted_at | timestamptz | yes | |
| handled_by_admin_id | uuid | yes | |
| linked_ticket_id | uuid | yes | FK `tickets.id`, index; when converted to a ticket |
| client_ip_hash | char(64) | no | peppered hash for abuse correlation only |

### school_enquiries (BE-SUP-26; moved from the old Sales module)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| school_name | varchar(160) | no | |
| contact_name | varchar(120) | no | |
| contact_role | varchar(80) | yes | |
| email | varchar(256) | no | |
| phone | varchar(32) | yes | |
| province | varchar(32) | yes | check over the nine provinces |
| city | varchar(80) | yes | |
| curricula | varchar(32) | yes | comma list of `CAPS`, `IEB` (validated) |
| fet_learner_count | varchar(16) | yes | FET (Grades 10 to 12) learner count band, check over `under_100`, `100_to_250`, `250_to_500`, `over_500` |
| buying_stage | varchar(24) | yes | check over `just_exploring`, `planning_next_year`, `budget_approved`, `ready_to_start` (the old free-text `stage`) |
| grades | varchar(32) | yes | for example `8-12` |
| notes | varchar(2000) | yes | |
| status | varchar(16) | no | check `status IN ('new','contacted','qualified','not_now','closed')`; index `(status, created_at)` |
| contacted_at | timestamptz | yes | |
| handled_by_admin_id | uuid | yes | |
| status_note | varchar(500) | yes | latest admin note |
| client_ip_hash | char(64) | no | |

## Contracts

```
// exists
public sealed record FaqPublished(Guid FaqId, string Category, DateTimeOffset OccurredAt);

// planned (BE-SUP-33)
public sealed record TicketCreated(Guid TicketId, string Reference, Guid RequesterUserId, string Category, DateTimeOffset OccurredAt);
public sealed record TicketReplied(Guid TicketId, string Reference, Guid RequesterUserId, string AuthorKind, DateTimeOffset OccurredAt);
public sealed record TicketSafeguardingFlagged(Guid TicketId, string Reference, Guid RequesterUserId, string Source, DateTimeOffset OccurredAt);
public sealed record ContactEnquiryReceived(Guid EnquiryId, string Reason, DateTimeOffset OccurredAt);
public sealed record SchoolEnquiryReceived(Guid EnquiryId, string? Province, DateTimeOffset OccurredAt);

// planned (BE-SUP-35), used by Admin dashboard attention list (BE-ADM-34)
public interface ISupportAdminQueries
{
    Task<SupportAttentionCounts> GetAttentionCountsAsync(CancellationToken ct);
}
public sealed record SupportAttentionCounts(int AwaitingSupport, int AwaitingSupportOver24h, int Unassigned, int SafeguardingOpen,
    int NewContactEnquiries, int NewSchoolEnquiries);

// planned (BE-SUP-31): implemented by modules that contribute search results
public interface ISearchProvider
{
    string Source { get; }   // "articles", "units", "pages"
    Task<IReadOnlyList<SearchHit>> SearchAsync(Guid? userId, string query, int take, CancellationToken ct);
}
public sealed record SearchHit(string Source, string Title, string? Snippet, string Href, double Score);
```

## Foundation tasks

- [x] **BE-SUP-01** Module projects `Aptiverse.Support` and `.Contracts`, `support` schema. *(`SupportModule.cs`, `SupportDbContext`, design-time factory, registered in Host, Worker and `ArchitectureTests/Modules.cs`)*
- [x] **BE-SUP-02** `Faq` entity, configuration, migration, seed. *(`Domain/Faq.cs`, `FaqConfiguration`, `20261016141608_InitialCreate`, `SupportSeeder` with 10 FAQs, idempotent by question and never reviving soft-deleted rows)*
- [ ] **BE-SUP-04** Phase 1 exit: FAQ served through pipeline-applied migration. *(unverified: needs the deployed dev environment, the migration task (CI-12) and the web FAQ page; the code path is proven locally by `SupportFaqsTests`)*
- [ ] **BE-SUP-09** FAQ caching and invalidation: `ListFaqsHandler` reads through HybridCache key `support:faqs:published` (10 min); create, update and delete evict it; `FaqPublishedHandler` keeps its metric
- [ ] **BE-SUP-10** `tickets` and `ticket_messages` tables: entities, configurations, migration (the original task also named the two endpoints, now BE-SUP-16 and BE-SUP-17)
- [ ] **BE-SUP-24** `contact_enquiries` table and migration
- [ ] **BE-SUP-26** `school_enquiries` table and migration
- [ ] **BE-SUP-29** `help_articles` table with the generated `search_vector` and GIN index; seed of starter articles from `Data/help/*.md` with front matter (title, summary, category, audience), loaded by the Support seeder
- [ ] **BE-SUP-32** Permissions: `support.use` (student, parent), `support.manage` (admin), `content.manage` (admin) per BE-IDN-65; replace `support.faqs.manage` on FAQ endpoints with `content.manage` (decision 9b) and delete the old constant
- [ ] **BE-SUP-33** Integration events above, published through the outbox; Notifications wiring: `TicketReplied` by support sends `NotifyUser` (category `support`) and `SendTemplatedEmail` (`support.ticket_reply`) to the requester; `TicketCreated` notifies admins holding `support.manage` in-app; `TicketSafeguardingFlagged` emails the safeguarding lead list (BE-SUP-23)
- [ ] **BE-SUP-34** POPIA: `IPersonalDataExporter` (the user's tickets and non-internal messages, contact enquiries matched by `user_id`) and `IPersonalDataEraser` on `UserErased` (tickets kept 12 months for safeguarding evidence with requester anonymised, then deleted; non-safeguarding tickets deleted after 90 days; contact enquiries linked to the user deleted)
- [ ] **BE-SUP-35** `ISupportAdminQueries` implementation for the admin dashboard attention list
- [ ] **BE-SUP-36** Public form abuse controls: Cloudflare Turnstile token verified server-side on contact and school enquiry submits (`Turnstile:SecretKey` from Secrets Manager, 3 s timeout, fail closed with `503 support.verification_unavailable`), plus a hidden honeypot field that silently accepts and discards bot submissions

## Slices

Group `/support`, tag `Support`. Ownership: requester routes filter `requester_user_id = current user`; another user's ticket returns 404. Admin routes live under `/support/admin/*`.

### BE-SUP-03  GET /support/faqs

| | |
|---|---|
| Operation id | `listFaqs` (exists) |
| Permission | anonymous (allowlisted) |
| Entitlement | none |
| Rate limit | `default` (global per-IP limiter today) |
| Idempotency | safe read; planned `Cache-Control: public, max-age=300` |
| Metric | planned `aptiverse.support.faqs.list.duration`; exists `aptiverse.support.faqs_published` (counter on publish) |
| Log fields | `ResultCount`, `CacheHit` |

Request: none. Response `200 FaqResponse[] { id, question, answer, category, sortOrder }` (published only, ordered by category, sort order, question). Contract shape asserted by `SupportFaqsTests.List_returns_seeded_faqs_in_contract_shape_and_order`.

- [ ] **BE-SUP-03** `GET /support/faqs` (public, cached) *(partial: endpoint, handler, unit and integration tests exist; no caching and no cache headers)*
  - [x] Endpoint (`ListFaqsEndpoint`, `AllowAnonymous`, `WithName("listFaqs")`)
  - [x] Response record (`FaqResponse`)
  - [x] Handler (`ListFaqsHandler`, `AsNoTracking`, index-ordered)
  - [x] Unit tests (`ListFaqsHandlerTests`: published only, ordering, soft delete hidden)
  - [x] Integration tests (`SupportFaqsTests`)
  - [ ] HybridCache and `Cache-Control` (BE-SUP-09)

### BE-SUP-05  POST /support/faqs

| | |
|---|---|
| Operation id | `createFaq` (exists) |
| Permission | `content.manage` (currently `Policies.Admin`, which no longer exists; BE-SK-37 moves it to `RequirePermission(Permissions.Support.ManageFaqs)` first) |
| Rate limit | `default` |
| Idempotency | natural: unique question returns `409 support.faq.duplicate_question` |
| Metric | `aptiverse.support.faqs_published` (counter, tag `category`, exists) |
| Log fields | `FaqId`, `Category` (exists in `FaqPublishedHandler`), planned `AdminUserId` |

Request `CreateFaqRequest`: `question` 1 to 300, `answer` 1 to 4000, `category` 1 to 80, `sortOrder` 0 to 10 000, `isPublished` (exists, `CreateFaqValidator`). Response `201 CreateFaqResponse`. Failures `400`, `401`, `403`, `409`. Events `FaqPublished` when published (exists, through the outbox).

- [ ] **BE-SUP-05** `POST /support/faqs` (admin) *(partial: slice, unit tests and integration tests exist; does not compile until BE-SK-37; no admin audit)*
  - [x] Endpoint, request records, validator, handler
  - [x] Unit tests (`CreateFaqHandlerTests`, `CreateFaqValidatorTests`)
  - [x] Integration tests (401, 400, happy with outbox event, duplicate 409)
  - [ ] Permission switch (BE-SK-37), audit through `AdminActionRecorded` (BE-ADM-30), cache eviction (BE-SUP-09)

### BE-SUP-08  GET /support/admin/faqs

| | |
|---|---|
| Operation id | `adminListFaqs` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.support.admin.faqs.list.duration` |
| Log fields | `AdminUserId`, `ResultCount` |

Response `200 AdminFaqView[]` including unpublished, with `updatedAt`.

- [ ] **BE-SUP-08** admin FAQ list (all states)
  - [ ] Endpoint, response record, handler, integration test (student 403)

### BE-SUP-06  PATCH /support/faqs/{id}

| | |
|---|---|
| Operation id | `updateFaq` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | PATCH; `If-Match` honoured |
| Metric | `aptiverse.support.admin.faqs.updated` (counter) |
| Log fields | `AdminUserId`, `FaqId`, `ChangedFields` |

Request: any of question, answer, category, sortOrder, isPublished (same rules). Publishing an unpublished FAQ raises `FaqPublished`. Response `200 AdminFaqView`. Failures `400`, `404`, `409` duplicate or concurrency.

- [ ] **BE-SUP-06** update an FAQ
  - [ ] Endpoint, request record, validator, handler, unit and integration tests

### BE-SUP-07  DELETE /support/faqs/{id}

| | |
|---|---|
| Operation id | `deleteFaq` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.support.admin.faqs.deleted` (counter) |
| Log fields | `AdminUserId`, `FaqId` |

Soft delete (the seeder will not revive it). Response `204`.

- [ ] **BE-SUP-07** delete an FAQ
  - [ ] Endpoint, handler, integration test

### BE-SUP-16  POST /support/tickets

| | |
|---|---|
| Operation id | `createTicket` |
| Permission | `support.use` |
| Entitlement | free |
| Rate limit | `default` plus a cap of 5 open tickets and 10 new tickets per day per user |
| Idempotency | `Idempotency-Key` |
| Metric | `aptiverse.support.tickets.created` (counter, tags `category`, `channel=web`) |
| Log fields | `UserId`, `TicketId`, `Reference`, `Category` (never the body) |

Request `CreateTicketRequest`: `subject` 3 to 160; `category` known value; `message` 10 to 5000 plain text. Creates the ticket (`awaiting_support`, priority `normal`), the first message, runs the safeguarding keyword screen (BE-SUP-23). Response `201 TicketDetail`. Failures `400`, `409 support.too_many_open_tickets`. Events `TicketCreated` (and `TicketSafeguardingFlagged` when screened).

- [ ] **BE-SUP-16** `POST /support/tickets` (split from BE-SUP-10)
  - [ ] Endpoint, request and response records, validator, handler (reference generator with collision retry)
  - [ ] Unit tests: reference format; open ticket cap
  - [ ] Integration tests: happy; parent can create; admin notified in-app

### BE-SUP-17  GET /support/tickets

| | |
|---|---|
| Operation id | `listMyTickets` |
| Permission | `support.use` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.support.tickets.list.duration` |
| Log fields | `UserId`, `ResultCount` |

Request (query): `status` optional (`open` = awaiting either side, `resolved`, `closed`, `all`), `page`, `pageSize` (max 50). Response `200 PagedResult<TicketSummary> { id, reference, subject, category, status, lastMessageAt, unreadForRequester }`.

- [ ] **BE-SUP-17** `GET /support/tickets` (split from BE-SUP-10)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: only own tickets

### BE-SUP-18  GET /support/tickets/{id}

| | |
|---|---|
| Operation id | `getMyTicket` |
| Permission | `support.use` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.support.tickets.get.duration` |
| Log fields | `UserId`, `TicketId` |

Response `200 TicketDetail { id, reference, subject, category, status, createdAt, resolvedAt, messages: [ { id, authorKind, authorName ("You", "Aptiverse support", or "System"), body, createdAt } ], canReply, canRate }`. Internal notes and the safeguarding flag are never included. Failures `404`.

- [ ] **BE-SUP-18** ticket detail with replies (requester view)
  - [ ] Endpoint, response records, handler
  - [ ] Integration tests: internal notes absent; other user 404

### BE-SUP-19  POST /support/tickets/{id}/messages

| | |
|---|---|
| Operation id | `replyToMyTicket` |
| Permission | `support.use` |
| Rate limit | `default` (30 replies per hour per user) |
| Idempotency | `Idempotency-Key` |
| Metric | `aptiverse.support.messages.created` (counter, tag `author=requester`) |
| Log fields | `UserId`, `TicketId`, `MessageId` |

Request `ReplyRequest`: `body` 1 to 5000. Allowed when status is not `closed`; a reply on a `resolved` ticket reopens it to `awaiting_support`. Sets `awaiting_support`, `last_message_at`; runs the safeguarding screen. Response `201 TicketMessageView`. Failures `400`, `404`, `409 support.ticket_closed`.

- [ ] **BE-SUP-19** requester reply
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: reopen on resolved; closed 409

### BE-SUP-20  POST /support/tickets/{id}/resolve and /rate

| | |
|---|---|
| Operation id | `resolveMyTicket`, `rateMyTicket` |
| Permission | `support.use` |
| Rate limit | `default` |
| Idempotency | idempotent |
| Metric | `aptiverse.support.tickets.resolved` (counter, tag `by=requester`), `aptiverse.support.tickets.rating` (histogram) |
| Log fields | `UserId`, `TicketId`, `Rating` |

Resolve: requester marks the issue solved (status `resolved`). Rate: `rating` 1 to 5 once the ticket is `resolved` or `closed`; one rating per ticket (`409 support.already_rated`).

- [ ] **BE-SUP-20** requester resolve and rate
  - [ ] Endpoints, request record, validator, handlers, integration tests

### BE-SUP-11  GET /support/admin/tickets

| | |
|---|---|
| Operation id | `adminListTickets` |
| Permission | `support.manage` |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.support.admin.queue.duration` |
| Log fields | `AdminUserId`, `Filters`, `ResultCount` |

Request (query): `status` (repeatable), `priority`, `category`, `assignee` (`me`, `unassigned`, or an admin id), `safeguarding` bool, `q` (reference or subject, 2 to 60), `sort` (`oldest_waiting` default, `newest`, `priority`), `cursor`, `limit` max 50. Response `CursorPage<AdminTicketRow> { id, reference, subject, category, status, priority, requester: { userId, name, emailMasked, role }, assignee, safeguardingFlag, waitingSince, firstResponseAt, messageCount }` (requester details through `IUserDirectory`).

- [ ] **BE-SUP-11** admin ticket queue (the original also named "reply", now BE-SUP-21)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: filters; student 403

### BE-SUP-21  POST /support/admin/tickets/{id}/messages

| | |
|---|---|
| Operation id | `adminReplyToTicket` |
| Permission | `support.manage` |
| Rate limit | `default` |
| Idempotency | `Idempotency-Key` |
| Metric | `aptiverse.support.messages.created` (tag `author=support`, `internal`) |
| Log fields | `AdminUserId`, `TicketId`, `MessageId`, `Internal` |

Request `AdminReplyRequest`: `body` 1 to 5000; `internal` bool (note visible to admins only); `setStatus` optional (`awaiting_user` default for public replies, `resolved`). Sets `first_response_at` on the first public reply. Public replies publish `TicketReplied` (email and in-app to the requester). Response `201 AdminTicketMessageView`. Audited (`AdminActionRecorded`).

- [ ] **BE-SUP-21** admin reply and internal note (split from BE-SUP-11)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: internal note never visible to requester; email captured for public reply

### BE-SUP-22  PATCH /support/admin/tickets/{id}

| | |
|---|---|
| Operation id | `adminUpdateTicket` |
| Permission | `support.manage` |
| Rate limit | `default` |
| Idempotency | PATCH; `If-Match` honoured |
| Metric | `aptiverse.support.admin.ticket_updates` (counter, tag `field`) |
| Log fields | `AdminUserId`, `TicketId`, `ChangedFields` |

Request: `status` (any, with `closed` final), `priority`, `assignedAdminId` (must hold `support.manage`, or null to unassign; `me` shortcut), `category`. Each change writes a `system` message ("Assigned to Lerato", "Priority set to high") visible to admins only. Audited. Failures `400`, `404`, `409 concurrency_conflict`.

- [ ] **BE-SUP-22** ticket assignment, status and priority
  - [ ] Endpoint, request record, validator, handler
  - [ ] Integration tests: assign to a non-admin 400; stale version 409

### BE-SUP-23  POST /support/admin/tickets/{id}/safeguarding

| | |
|---|---|
| Operation id | `adminSetTicketSafeguarding` |
| Permission | `support.manage` (step-up not required; speed matters) |
| Rate limit | `default` |
| Idempotency | idempotent per state |
| Metric | `aptiverse.support.safeguarding.flagged` (counter, tag `source=admin|screen`), `aptiverse.support.safeguarding.escalated` (counter) |
| Log fields | `AdminUserId`, `TicketId`, `Flagged`, `Escalated` (never message content) |

Request `SafeguardingRequest`: `flagged` bool; `escalate` bool; `note` max 1000 (internal). Flagging sets priority `urgent`, records who and when, writes an internal system message and publishes `TicketSafeguardingFlagged`; escalation emails the safeguarding lead list (`Support:SafeguardingLeads`, validated non-empty in Production) with the reference and a link to the admin ticket (no content in the email) and sets `escalated_at`. Unflagging requires a note and is audited. A keyword screen on requester messages (self-harm, abuse disclosure terms in English and Afrikaans, maintained in `Data/safeguarding/terms.json`) flags automatically with `source = screen` and never replies automatically; the requester sees the standard support resources link in the confirmation copy for every ticket.

Failures `400` (unflag without note), `404`.

- [ ] **BE-SUP-23** safeguarding flag with escalation
  - [ ] Endpoint, request record, validator, handler
  - [ ] Keyword screen (pure, unit tested, no false negative on the fixture list)
  - [ ] Integration tests: flag sets urgent and emails leads; unflag without note 400; requester cannot see the flag

### BE-SUP-12  POST /support/contact

| | |
|---|---|
| Operation id | `submitContactEnquiry` |
| Permission | anonymous (allowlisted); signed-in users are linked by `user_id` |
| Rate limit | `public-forms` (5 per 10 min per IP) |
| Idempotency | `Idempotency-Key` optional; duplicate identical submissions within 10 min from the same IP hash are collapsed |
| Metric | `aptiverse.support.contact.submitted` (counter, tags `reason`, `signed_in`), `aptiverse.support.contact.rejected` (counter, tag `reason=turnstile|honeypot|rate`) |
| Log fields | `EnquiryId`, `Reason`, `SignedIn` (never name, email or message) |

Request `ContactRequest`: `firstName` 1 to 80, `lastName` 1 to 80, `email` (rules as register), `organisation` optional max 160, `reason` known value, `message` 10 to 4000, `turnstileToken` required, `website` honeypot (must be empty). Saves the enquiry (`status = new`), then through the outbox: `SendTemplatedEmail` to the support inbox (`Support:InboxAddress`, Zoho, template `support.contact_enquiry`, reply-to set to the submitter) and an acknowledgement to the submitter (`support.contact_received`). Response `202 { id }` (as the old `ContactController`). Failures `400`, `429`, `503 support.verification_unavailable`.

- [ ] **BE-SUP-12** `POST /support/contact` (port the working contact form; email to Zoho)
  - [ ] Endpoint, request record, validator, handler
  - [ ] Templates `support.contact_enquiry`, `support.contact_received` (with BE-NTF-03)
  - [ ] Unit tests: honeypot silently accepted and discarded
  - [ ] Integration tests: two emails captured through the outbox; Turnstile failure 400; rate limit 429

### BE-SUP-25  GET /support/admin/contact-enquiries and PATCH /support/admin/contact-enquiries/{id}

| | |
|---|---|
| Operation id | `adminListContactEnquiries`, `adminUpdateContactEnquiry` |
| Permission | `support.manage` |
| Rate limit | `default` |
| Idempotency | GET safe; PATCH idempotent per status |
| Metric | `aptiverse.support.admin.enquiries.updated` (counter, tags `kind=contact`, `status`) |
| Log fields | `AdminUserId`, `EnquiryId`, `Status` |

GET query: `status`, `reason`, `q` (email or name, 2 to 60), `cursor`, `limit`. Response rows include full contact details (admins need them to reply). PATCH: `status` (`contacted` sets `contacted_at` and `handled_by_admin_id`, `spam`, `closed`), optional `convertToTicket` (only when the email matches an account: creates a ticket on that account with the message as the first entry and links it). Audited.

- [ ] **BE-SUP-25** contact enquiry admin (list, mark contacted, close, spam, convert to ticket)
  - [ ] Endpoints, request records, validators, handlers
  - [ ] Integration tests: convert creates a ticket visible to the user

### BE-SUP-13  POST /support/school-enquiries

| | |
|---|---|
| Operation id | `submitSchoolEnquiry` |
| Permission | anonymous (allowlisted) |
| Rate limit | `public-forms` |
| Idempotency | as contact |
| Metric | `aptiverse.support.school_enquiries.submitted` (counter, tag `province`) |
| Log fields | `EnquiryId`, `Province` |

Request `SchoolEnquiryRequest`: `schoolName` 2 to 160, `contactName` 2 to 120, `contactRole` max 80, `email`, `phone` optional (SA formats normalised to E.164), `province` optional known value, `city` max 80, `curricula` subset of `CAPS`, `IEB`, `fetLearnerCount` optional known band, `buyingStage` optional known value, `grades` optional, `notes` max 2000, `turnstileToken`, `website` honeypot. Saves, emails the inbox (`support.school_enquiry`) and acknowledges the contact. Response `202 { id }`.

- [ ] **BE-SUP-13** `POST /support/school-enquiries`
  - [ ] Endpoint, request record, validator, handler, templates
  - [ ] Integration tests: happy; validation; rate limit

### BE-SUP-27  GET /support/admin/school-enquiries and PATCH /support/admin/school-enquiries/{id}

| | |
|---|---|
| Operation id | `adminListSchoolEnquiries`, `adminUpdateSchoolEnquiry` |
| Permission | `support.manage` |
| Rate limit | `default` |
| Idempotency | PATCH idempotent per status |
| Metric | `aptiverse.support.admin.enquiries.updated` (tags `kind=school`, `status`) |
| Log fields | `AdminUserId`, `EnquiryId`, `Status` |

GET filters: `status`, `province`, `buyingStage`, `q`, `cursor`, `limit`; rows show school, contact, buying stage, curricula, FET learner count, location (city and province), notes, submitted and contacted dates. `GET /support/admin/school-enquiries/counts` returns counts per status (the old "not contacted" figure is `new`). PATCH: `status` (`new`, `contacted`, `qualified`, `not_now`, `closed`), `statusNote` max 500, `Idempotency-Key`; moving to `contacted` sets `contacted_at`, and moving back to `new` is the undo (clears `contacted_at`, audited as `school_enquiry.contact_reopened`, as the old `SetContacted(false)`). Audited. Admin page `PG-ADM-SCHOOLS` reads these (BE-ADM-11 points here).

- [ ] **BE-SUP-27** school enquiry admin with status changes, counts and undo contacted
  - [ ] Endpoints (list, counts, update), request records, validators, handlers
  - [ ] Integration tests: contacted then back to `new` clears the date and writes two audit rows; counts match

### BE-SUP-14  GET /support/articles

| | |
|---|---|
| Operation id | `listHelpArticles` |
| Permission | anonymous (allowlisted) |
| Rate limit | `default`; `Cache-Control: public, max-age=300` |
| Idempotency | safe read |
| Metric | `aptiverse.support.articles.search.duration`, `aptiverse.support.articles.zero_results` (counter) |
| Log fields | `QueryLength`, `Category`, `ResultCount` (never the query text) |

Request (query): `q` optional 2 to 80 (Postgres `websearch_to_tsquery('english', q)`), `category`, `audience`, `page`, `pageSize` max 50. Response `200 PagedResult<ArticleSummary> { slug, title, summary, category, audience, updatedAt, snippet }` (`ts_headline` snippet when searching, with `<mark>` replaced by plain markers the web renders).

- [ ] **BE-SUP-14** help articles list and search (the original also named the slug route, now BE-SUP-28)
  - [ ] Endpoint, request and response records, validator, handler
  - [ ] Integration tests: search ranking title over body; unpublished hidden

### BE-SUP-28  GET /support/articles/{slug}

| | |
|---|---|
| Operation id | `getHelpArticle` |
| Permission | anonymous |
| Rate limit | `default`; cached 5 min |
| Idempotency | safe read; `ETag` |
| Metric | `aptiverse.support.articles.views` (counter, tag `category`) |
| Log fields | `Slug` |

Response `200 Article { slug, title, summary, bodyMarkdown, category, audience, updatedAt, related: ArticleSummary[3] }`. Failures `404 support.article_not_found`.

- [ ] **BE-SUP-28** help article by slug (split from BE-SUP-14)
  - [ ] Endpoint, response record, handler, integration test

### BE-SUP-30  Admin help articles CRUD: /support/admin/articles

| | |
|---|---|
| Operation id | `adminListArticles`, `adminCreateArticle`, `adminUpdateArticle`, `adminDeleteArticle` |
| Permission | `content.manage` |
| Rate limit | `default` |
| Idempotency | create unique by slug; PATCH with `If-Match` |
| Metric | `aptiverse.support.admin.articles.changes` (counter, tag `action`) |
| Log fields | `AdminUserId`, `Slug`, `Action` |

Create and edit title, slug (immutable once published, redirects not supported in v1), summary, body (Markdown, 50 000 chars, raw HTML rejected by the validator), category, audience, publish state. Audited. Cache evicted on change.

- [ ] **BE-SUP-30** admin help articles CRUD
  - [ ] Endpoints, request records, validators (raw HTML rejection), handlers, integration tests

### BE-SUP-15  GET /search

| | |
|---|---|
| Operation id | `globalSearch` |
| Permission | authenticated (any role; results per provider are scoped to the caller) |
| Rate limit | `default` (60 per minute per user) |
| Idempotency | safe read |
| Metric | `aptiverse.support.search.duration` (histogram), `aptiverse.support.search.provider_timeouts` (counter, tag `source`) |
| Log fields | `UserId`, `QueryLength`, `ResultCount`, `TimedOutSources` |

Request (query): `q` 2 to 80; `sources` optional subset of `articles`, `units`, `pages`; `limit` 1 to 20. Fans out to every registered `ISearchProvider` in parallel with a 300 ms budget each and merges by score. Providers: `articles` (Support FTS), `units` (Academics: the caller's enrolled units by name and code), `pages` (static page index generated from the navigation definitions and help routes, filtered by the caller's permissions). Response `200 { hits: SearchHit[], partial: bool }`.

- [ ] **BE-SUP-15** global search endpoint `GET /search` (units, articles, pages)
  - [ ] Endpoint (group `/search`, tag `Support`), request and response records, validator, handler
  - [ ] Integration tests: student finds own unit and an article; another student's unit never appears; slow provider yields `partial: true`
- [ ] **BE-SUP-31** `ISearchProvider` contract in Support.Contracts plus the `pages` provider; Academics implements `units` (BE-ACA cross-reference); registration through DI so providers stay optional

## Background work

| Message | Trigger | Handler |
|---|---|---|
| `FaqPublished` | outbox | `FaqPublishedHandler` (exists, metric) |
| `AutoCloseResolvedTickets` | scheduled daily | closes `resolved` tickets older than 7 days without a requester reply |
| `TicketSlaCheck` | scheduled every 15 min | in-app reminder to `support.manage` admins for tickets awaiting support over 24 h; safeguarding tickets over 1 h page the leads again |
| `PurgeSupportData` | scheduled weekly | BE-SUP-34 retention: enquiries and closed tickets past retention |
| `UserErased` | Identity outbox | BE-SUP-34 |

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | bots submitting public forms as anyone; fake "support" replies | Turnstile plus honeypot plus rate limit; support replies only from `support.manage` principals | BE-SUP-36 |
| Tampering | script injection in articles or ticket bodies rendered in the admin UI | plain text tickets, Markdown without raw HTML for articles, web escapes output | BE-SUP-30 |
| Repudiation | disputed admin replies or safeguarding decisions | `AdminActionRecorded` audit for every admin write; safeguarding unflag needs a note | BE-SUP-50 |
| Information disclosure | internal notes or safeguarding flags leaking to requesters; enquiry PII in logs; search leaking other users' units | internal filtering, log field allowlist, per-user providers | BE-SUP-18, BE-SUP-15 |
| Denial of service | form floods, email floods to the support inbox, ticket spam | `public-forms` limits, collapsed duplicates, ticket caps, per-recipient email caps in Notifications | BE-SUP-44 |
| Elevation of privilege | students reaching admin queue routes | `support.manage` on every `/support/admin/*` route; negative auth suite | BE-SUP-41 |

- [ ] **BE-SUP-40** Write `api/docs/security/threat-model-support.md` from the table, including the safeguarding escalation procedure owner and response times

### Authorisation and ownership tests

- [ ] **BE-SUP-41** Integration matrix: requester routes with another user's ticket id return 404; every `/support/admin/*` route returns 403 for students and parents; anonymous only on FAQs, articles, contact and school enquiries

### Input limits

- [ ] **BE-SUP-42** Limits enforced and tested: subjects 160, messages 5000, contact message 4000, article body 50 000, search query 80, request bodies under 64 KB (articles) and 16 KB (everything else)

### Rate limits

- [ ] **BE-SUP-43** Groups: public forms `public-forms`; ticket create and reply `default` with per-user caps (5 open tickets, 10 new per day, 30 replies per hour); search 60 per minute per user
- [ ] **BE-SUP-44** Inbox flood guard: at most 200 contact and school enquiry emails per hour to the support inbox (excess saved but batched into an hourly digest email)

### Idempotency and concurrency

- [ ] **BE-SUP-45** `Idempotency-Key` on ticket create, replies and admin replies; duplicate public form submissions collapsed by `(client_ip_hash, email, message hash)` within 10 min; concurrent admin PATCH with a stale version returns 409; two admins replying at once both succeed (append-only messages)

### Resilience

- [ ] **BE-SUP-46** Turnstile verification through the resilience pipeline (3 s timeout, 1 retry, fail closed); outbound email is always outbox-based so SES or Zoho trouble never fails a submission

### Data retention and POPIA

- [ ] **BE-SUP-47** Classify columns: contact details on enquiries (contact), ticket and message bodies (free text, may include health or safeguarding information about minors, special personal information), IP hashes (network). Retention: contact and school enquiries 24 months then deleted; closed tickets 24 months; safeguarding tickets 5 years with restricted access (open question 3); export and erasure via BE-SUP-34

### Audit

- [ ] **BE-SUP-50** Every admin write (FAQ, article, ticket reply, status, assignment, safeguarding, enquiry status, convert) publishes `AdminActionRecorded` with actor, entity, action and a field-level summary without message bodies

### Observability

- [ ] **BE-SUP-51** Metrics as listed per slice plus `aptiverse.support.tickets.first_response_seconds` (histogram), `aptiverse.support.tickets.awaiting_support` (gauge), `aptiverse.support.safeguarding.open` (gauge); alerts: **safeguarding ticket unacknowledged for 1 h** (pages leads), **tickets awaiting support over 24 h above 10**, **contact form 5xx above 1 percent for 10 min**, **Turnstile unavailable for 5 min**
- [ ] **BE-SUP-52** Spans `Support.<UseCase>` and `Support.Search` with child spans per provider and attribute `aptiverse.search.partial`

### Performance budgets

- [ ] **BE-SUP-53** p95: FAQs under 20 ms cached, article search under 120 ms, article read under 40 ms, ticket list and detail under 80 ms, admin queue under 150 ms, global search under 400 ms end to end; query plans checked for the FTS GIN index and `(status, last_message_at)` (BE-SK-83)

### Migration safety

- [ ] **BE-SUP-54** New tables ship additively after the existing `InitialCreate`; adding the generated `search_vector` is in the table's first migration; changing the FAQ uniqueness rule or column lengths follows expand and contract; the existing `faqs` table is never rebuilt

### SLO contribution

- [ ] **BE-SUP-55** SLIs: public FAQ and article reads 99.9 percent (marketing pages depend on them; the web caches them, so the API can degrade to stale), form submission success 99.5 percent, safeguarding escalation emails sent within 5 min of a flag 100 percent (alerted)

### Load and failure tests

- [ ] **BE-SUP-56** k6: FAQ and article endpoints at 200 rps for 10 min (marketing traffic spikes); contact form at the rate limit edge returns clean 429s
- [ ] **BE-SUP-57** Failure drill: Notifications queue stalled; contact submissions still return 202 and emails go out after recovery without duplicates
- [ ] **BE-SUP-58** Safeguarding drill in staging: a test ticket containing a fixture phrase is flagged by the screen, leads receive the email, the alert fires if nobody acknowledges within the window

## Old data mapping

Source: `support.*` and `sales.*` at `43f9faa` (`api/Migrations/ApplicationDbContextModelSnapshot.cs`; controllers `api/Controllers/SupportController.cs`, `ContactController.cs`, `SalesController.cs`). Feeds MIG-18.

| Old table.column | New | Transform |
|---|---|---|
| FAQs in `SupportController.GetFaqs` (hard-coded) | `faqs` | the new seeder already holds the rewritten list (BE-SUP-02); nothing to migrate |
| `support.support_tickets` (`requester_user_id`, `subject`, `description`, `status`, `priority`, `category_id`, `channel`, `assigned_to_user_id`, `resolution_notes`, `resolved_at`, `closed_at`, `satisfaction_rating`) | `tickets` plus first `ticket_messages` row | `description` becomes the first requester message; `status` mapped (`open`, `in_progress` to `awaiting_support`; `pending_customer` or similar to `awaiting_user`; `resolved`, `closed` kept); `priority` mapped to the four values; `category_id` resolved through `support_categories.name` to the new category list (unknown to `other`); `resolution_notes` become an internal message; `satisfaction_rating` 0 to null; new `reference` generated |
| `support.support_messages` (`ticket_id`, `sender_user_id`, `sender_role`, `content`, `is_internal`, `attachment_urls`) | `ticket_messages` | `sender_role` to `author_kind`; attachments dropped (no attachments in v1, open question 2) with a system note listing that the original had attachments |
| `support.support_categories` | dropped | fixed category list |
| `support.students` | dropped | |
| `sales.contact_enquiries` (`first_name`, `last_name`, `email`, `organisation`, `reason`, `message`, `contacted`, `contacted_at`, `submitted_at`) | `contact_enquiries` | `contacted` true to `status = contacted`, else `new`; `submitted_at` to `created_at`; `reason` mapped to the new list (unknown to `other`); rows older than 24 months not migrated; `client_ip_hash` set to a fixed migration marker |
| `sales.school_enquiries` (`school_name`, `contact_name`, `contact_role`, `email`, `phone`, `province`, `city`, `curricula` (comma text), `learner_count` (text), `stage`, `notes`, `contacted`, `contacted_at`, `submitted_at`) | `school_enquiries` | `learner_count` parsed into the FET band where possible, else null with the raw value appended to `notes`; `stage` mapped to `buying_stage` where it matches a known value, else appended to `notes`; `contacted` true to `status = contacted` with `contacted_at`, else `new`; `submitted_at` to `created_at` |

## Tests

- Unit (existing `tests/Aptiverse.Support.UnitTests` plus new): FAQ validator and handlers (exist), reference generator, safeguarding keyword screen, honeypot, status transitions, article Markdown validator, search merge.
- Integration (existing `SupportFaqsTests` plus new): every slice's happy, validation, forbidden and not found cases; BE-SUP-41, BE-SUP-45; outbox email capture for contact, enquiries and replies.

## Open questions

1. Decided (9b): `support.faqs.manage` is folded into `content.manage`, which covers FAQs, articles and past papers (BE-SUP-32).
2. Ticket attachments: none in v1 (proposed; screenshots can be described or sent later), or reuse the S3 upload flow from Academics with the same limits?
3. Decided (34): a named safeguarding lead owns escalations of flagged tickets; name pending, DECISIONS.md F. The response time commitment and the 5 year retention for flagged tickets about minors are set by that lead with the Information Officer (decision 32, name pending) before launch (HRD-31).
4. Contact form for signed-in users: create a ticket directly instead of an enquiry? Proposed: the help page routes signed-in users to tickets and keeps the contact form for visitors.
5. Turnstile on public forms needs a Cloudflare site key in the web; confirm it is acceptable for the marketing site (privacy notice update).
