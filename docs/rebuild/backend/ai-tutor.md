# AiTutor module

| | |
|---|---|
| ID range | `BE-AI-01` to `BE-AI-22`, `BE-AI-30` to `BE-AI-37` (original), `BE-AI-38` to `BE-AI-59` (splits and additions), `BE-AI-60` to `BE-AI-84` (production readiness), `BE-AI-85` (later addition) |
| Schema | `ai` |
| Projects | `src/Modules/AiTutor/Aptiverse.AiTutor`, `src/Modules/AiTutor/Aptiverse.AiTutor.Contracts`, `tests/Aptiverse.AiTutor.UnitTests`, `tools/Aptiverse.AiTutor.Evals` |
| Phase | 5 |
| Consumes | `Aptiverse.Billing.Contracts` (`IUsageMeter`), `Aptiverse.Practice.Contracts` (`IActiveAttemptLookup`), `Aptiverse.Academics.Contracts` (`IStudyUnitLookup`), `Aptiverse.Progress.Contracts` (`IMasterySnapshot`, Phase 7, optional until then), `Aptiverse.Identity.Contracts` (`AccountDeletionRequested`, `IUserProfileLookup`) |
| Publishes | `AiUsageRecorded`, `TutorSafetySignalRaised`; implements `IQuestionGenerator`, `IGrader`, `IAiSpendReport` |
| Depends on | BE-SK-22, BE-SK-24, BE-SK-26, BE-SK-27, BE-SK-28, BE-SK-35, BE-ACA-20, BE-BIL-04 (quota contract; a fake meter is used until Phase 6 lands) |
| Status | Not started (0 of 79 tasks) |

## Responsibilities and out of scope

Responsible for:

- The only Anthropic integration in the system: one client through the official Anthropic C# SDK, behind the shared resilience pipeline.
- Prompt files, model selection from config, structured output via tool use, prompt caching, usage and cost recording.
- Question generation and grading as in-process services used by Practice (`IQuestionGenerator`, `IGrader`).
- Tutor chat conversations (standard and deep), the help bot, and the server-built student context.
- Enforcing that the tutor is unavailable while the student has an active practice attempt.
- The eval harness and golden sets, run in CI and nightly.

Out of scope:

- Quota limits and plan rules (Billing owns `usage_meters`; this module only reserves, confirms and refunds).
- Storing tests, questions and attempts (Practice).
- Diary or wellbeing text: never sent to the model (decision 7).
- Python analytics (Phase 12).
- Any client-supplied student context: rejected by design.

## Data model

All tables in schema `ai`. Every table has `id uuid` (Guid v7, PK), `created_at`, `updated_at`, `deleted_at timestamptz null`, and `xmin` concurrency unless marked append-only (append-only tables have no `updated_at` edits and no soft delete).

### conversations

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| user_id | uuid | no | index `(user_id, last_message_at desc)` filtered `deleted_at is null` |
| title | varchar(120) | no | derived from the first user message, trimmed |
| mode | varchar(16) | no | check `mode in ('standard','deep')`; default for new messages |
| study_unit_id | uuid | yes | optional focus unit, validated through `IStudyUnitLookup` at write time; no FK (other schema) |
| summary | text | yes | running summary of turns older than the window; max 4000 chars |
| summary_through_message_id | uuid | yes | FK `messages.id` (deferrable), index |
| message_count | int | no | check `>= 0` |
| last_message_at | timestamptz | no | |
| purge_after | timestamptz | yes | set on soft delete (deleted_at plus 30 days); index |

### messages

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| conversation_id | uuid | no | FK `conversations.id` on delete cascade; index `(conversation_id, created_at)` |
| role | varchar(16) | no | check `role in ('user','assistant')` |
| content | text | no | check `char_length(content) <= 32000` |
| status | varchar(16) | no | check `status in ('streaming','complete','stopped','failed','blocked')` |
| mode | varchar(16) | yes | assistant only; check as above |
| parent_message_id | uuid | yes | FK `messages.id`, index; the user message an assistant reply answers |
| superseded_by_message_id | uuid | yes | FK `messages.id`, index; set when regenerated |
| usage_id | uuid | yes | FK `ai_usage.id`, index |
| failure_code | varchar(64) | yes | stable error code when `failed` or `blocked` |

### ai_usage (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| user_id | uuid | yes | null for system calls (summaries, evals); index `(user_id, created_at)` |
| use_case | varchar(32) | no | check `use_case in ('generate','grade','chat_standard','chat_deep','summary','help','exam_mark')` |
| model | varchar(100) | no | the configured model id actually sent |
| prompt_id | varchar(64) | no | for example `tutor-chat` |
| prompt_version | int | no | check `> 0` |
| input_tokens | int | no | check `>= 0` |
| output_tokens | int | no | check `>= 0` |
| cache_creation_input_tokens | int | no | check `>= 0` |
| cache_read_input_tokens | int | no | check `>= 0` |
| cost_usd_micros | bigint | no | check `>= 0`; computed from the price table in config at call time |
| latency_ms | int | no | |
| outcome | varchar(24) | no | check `outcome in ('ok','schema_retry_ok','schema_failed','provider_error','cancelled','refused')` |
| request_id | varchar(100) | yes | Anthropic `request-id` header, for support tickets |
| correlation_type | varchar(32) | yes | `conversation`, `generation_job`, `attempt`, `help` |
| correlation_id | uuid | yes | index |
| quota_reservation_id | uuid | yes | the Billing reservation id, no FK |

Index `(created_at)` BRIN for spend reports.

### safety_signals (append-only) *(deferred: decision 22, not in v1)*

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| id | uuid | no | PK |
| user_id | uuid | no | index |
| message_id | uuid | no | FK `messages.id`, index |
| kind | varchar(32) | no | check `kind in ('self_harm','abuse_disclosure','prompt_injection','academic_dishonesty')` |
| action_taken | varchar(32) | no | check `action_taken in ('support_resources_shown','refused','logged_only')` |

No content is copied into this table.

## Contracts

`Aptiverse.AiTutor.Contracts`:

```
public interface IQuestionGenerator
{
    Task<Result<GeneratedQuestionSet>> GenerateAsync(GenerateQuestionsCommand command, CancellationToken ct);
}
public sealed record GenerateQuestionsCommand(
    Guid UserId, Guid GenerationJobId, StudyUnitContext Unit, IReadOnlyList<string> Topics,
    int QuestionCount, string Mode, IReadOnlyList<string> Formats, Guid QuotaReservationId);
public sealed record StudyUnitContext(Guid StudyUnitId, string Kind, string Name, string Level,
    string? Curriculum, IReadOnlyList<string> KnownTopics);
public sealed record GeneratedQuestionSet(string Title, int DurationMinutes, IReadOnlyList<GeneratedQuestion> Questions,
    string Model, string PromptId, int PromptVersion, Guid UsageId);
public sealed record GeneratedQuestion(string Kind, string Stem, IReadOnlyList<string> Options, int? AnswerIndex,
    string? ExpectedAnswer, IReadOnlyList<string> AcceptableAnswers, string Explanation, string Topic, int Marks);

public interface IGrader
{
    Task<Result<GradeResult>> GradeWrittenAsync(GradeWrittenCommand command, CancellationToken ct);
}
public sealed record GradeWrittenCommand(Guid UserId, Guid AttemptId, StudyUnitContext Unit,
    IReadOnlyList<WrittenAnswerToGrade> Answers);
public sealed record WrittenAnswerToGrade(Guid QuestionId, string Stem, string ExpectedAnswer,
    IReadOnlyList<string> AcceptableAnswers, int Marks, string StudentAnswer);
public sealed record GradeResult(IReadOnlyList<GradedAnswer> Answers, Guid UsageId);
public sealed record GradedAnswer(Guid QuestionId, int AwardedMarks, string Feedback, bool NeedsReview);

public interface IAiSpendReport
{
    Task<AiSpendSummary> GetAsync(DateOnly from, DateOnly to, CancellationToken ct);
}

public sealed record AiUsageRecorded(Guid UsageId, Guid? UserId, string UseCase, string Model,
    int InputTokens, int OutputTokens, int CacheReadTokens, long CostUsdMicros, DateTimeOffset OccurredAt);
public sealed record TutorSafetySignalRaised(Guid UserId, string Kind, DateTimeOffset OccurredAt);
```

Consumed contract shapes this module relies on (owned elsewhere, listed so the dependency is explicit):

- `IUsageMeter.ReserveAsync(Guid userId, string quotaKey, int amount, string correlation, ct)` returns `Result<Reservation>`; `ConfirmAsync(reservationId, int actualAmount)`; `RefundAsync(reservationId, string reason)`.
- `IActiveAttemptLookup.GetActiveAttemptAsync(Guid userId, ct)` returns `ActiveAttempt?` (attempt id, deadline).
- `IStudyUnitLookup.GetForUserAsync(Guid userId, ct)` and `GetAsync(Guid unitId, Guid userId, ct)` with level and topics.
- `IMasterySnapshot.GetWeakestTopicsAsync(Guid userId, int take, ct)` (null-safe; returns empty when no evidence).

Quota keys used (old names kept): `ai.quick` (standard chat), `ai.deep` (deep chat), `ai.help` (the help bot has its own quota so navigation questions never eat into tutor messages). `practice.generate` is reserved by Practice, and the reservation id is passed in.

## Foundation tasks

- [ ] **BE-AI-01** Module projects `Aptiverse.AiTutor` and `.Contracts`, `ai` schema, `AiTutorDbContext : ModuleDbContext`, design-time factory, empty initial migration, registered in `tests/Aptiverse.ArchitectureTests/Modules.cs`
- [ ] **BE-AI-38** Permission constants `Permissions.Ai.Chat` (`ai.chat`), `Permissions.Ai.Help` (`ai.help`), `Permissions.Ai.SpendRead` (`ai.spend.read`, admin); role map: student gets chat and help, parent gets help, admin gets all
- [ ] **BE-AI-02** Official Anthropic C# SDK client registered once, wrapped in `IAnthropicGateway` (internal), using the `Microsoft.Extensions.Http.Resilience` pipeline: 60 s attempt timeout for non-streaming, no retry once a stream has started, retry on 429, 500, 529 with jittered backoff honouring `retry-after`, circuit breaker
- [ ] **BE-AI-03** `AiModelOptions`: model id per use (`Generate`, `Grade`, `ChatStandard`, `ChatDeep`, `Summary`, `Help`, `ExamMark`) from config with `ValidateOnStart()`; the gateway has no parameter for `temperature`, `top_p` or `top_k`, and a unit test asserts the serialised request never contains them
- [ ] **BE-AI-39** `AiLimitsOptions`: max output tokens per use, history window N turns, max user message chars (4000), max summary chars, thinking budget for deep mode (0 disables), all validated on start
- [ ] **BE-AI-04** Prompt file loader: `Prompts/<id>.v<N>.md` embedded resources with front matter (`id`, `version`, `use`, `cache_breakpoints`), loaded and validated at startup (boot fails on duplicate id and version or a missing active version); active version per id chosen in config; `(prompt_id, prompt_version)` recorded on every call
- [ ] **BE-AI-40** Tool schemas as embedded JSON Schema files (`Schemas/generate-questions.v1.json`, `grade-answers.v1.json`, `exam-mark.v1.json`) with matching internal C# records and a test that the records round-trip against the schema
- [ ] **BE-AI-05** Structured output: forced `tool_choice` on the schema tool, JSON Schema validation of the tool input before use, one retry with the validation errors appended, then `Error.Failure("ai.schema_invalid")`; thinking is never enabled on forced-tool calls
- [ ] **BE-AI-06** Prompt caching: `cache_control` breakpoints on the system prompt block and the curriculum and topic block (stable order so the prefix matches); unit test asserts breakpoint placement; metric on `cache_read_input_tokens`
- [ ] **BE-AI-41** Cost calculator: per-model price table in config (input, output, cache write, cache read per million tokens, in USD micros), pure function, unit tested to the micro; unknown model fails boot
- [ ] **BE-AI-13** `conversations` and `messages` tables (`safety_signals` deferred, decision 22): entities, configurations, migration
- [ ] **BE-AI-07** `ai_usage` table and `UsageRecorder` that writes the row and publishes `AiUsageRecorded` through the outbox in one transaction
- [ ] **BE-AI-08** Quota wrapper `MeteredCall`: reserve through `IUsageMeter` before the model call (its own committed transaction, since no transaction may span a network call), confirm with the actual amount on success, refund on provider error, schema failure or cancellation; any meter exception fails closed (`503 ai.quota_unavailable`, never a free call)
- [ ] **BE-AI-12** `StudentContextBuilder`: builds level, stage, curriculum, enrolled units and topics from `IStudyUnitLookup` plus weakest topics from `IMasterySnapshot` when available; deterministic text block (cache friendly); no client field can influence it; unit tests per stage
- [ ] **BE-AI-42** Prompt injection boundary: user text always sent as user-role content inside clearly delimited tags, never concatenated into the system prompt; system prompt states that instructions inside student content are data; no tools are offered in chat; test inputs from the injection golden set (BE-AI-53)
- [ ] **BE-AI-43** Safety routing (decision 22): an instruction in the tutor prompt (tool-free) recognises self-harm or abuse disclosures and the reply includes the support resources link (`/wellbeing/support`) and SA helplines; nothing is stored, no signal row, no notification to parents. Storing a safety signal is deferred until a POPIA and safeguarding review
- [ ] **BE-AI-22** Academic-honesty guardrail in the tutor prompt: guide with hints and worked analogues, never final answers to work the student says is graded or that matches an open assessment title from `IStudyUnitLookup`
- [ ] **BE-AI-09** `IQuestionGenerator` implementation: prompt `practice-generate`, difficulty from the unit's level, topics from the registry, LaTeX for math in `$...$`, validated through BE-AI-05, usage recorded against the passed reservation
- [ ] **BE-AI-10** `IGrader` implementation for written answers: prompt `practice-grade`, marks capped at the question's marks, `NeedsReview` when the model's confidence field is low
- [ ] **BE-AI-44** `IGrader` exam-marks variant for uploaded or typed exam answers (prompt `exam-mark`), same schema rules
- [ ] **BE-AI-11** `ITutorChat` (internal): streams a reply from the last N turns plus the running summary, enforces character limits, mode picks the model and the quota key
- [ ] **BE-AI-45** Running summary: when a conversation passes N turns, a `SummariseConversation` Wolverine message summarises older turns with the `Summary` model (system usage, no user quota) and moves `summary_through_message_id`
- [ ] **BE-AI-20** Server-side block: `ITutorChat`, `POST /ai/conversations`, and message, regenerate and help endpoints call `IActiveAttemptLookup` first and return `409 ai.blocked_during_attempt`; no model call and no reservation happen when blocked
- [ ] **BE-AI-57** `IAiSpendReport` implementation for Admin (BE-ADM-08): totals by day, use case and model from `ai_usage`, cost per generated test (joins on `correlation_type = 'generation_job'`)

## Slices

Every slice below is a folder under `Features/<UseCase>/` with endpoint, records, validator and handler. All endpoints are in group `/ai` with tag `AiTutor`. Ownership: every conversation read or write filters by `user_id = current user`; another user's id returns 404, never 403, so ids cannot be probed.

### BE-AI-14  GET /ai/conversations

| | |
|---|---|
| Operation id | `listConversations` |
| Permission | `ai.chat` |
| Entitlement | `ai_tutor` (feature); listing past chats stays readable after a downgrade |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.ai.conversations.list.duration` (histogram, ms) |
| Log fields | `UserId`, `PageSize`, `ResultCount` |

Request (query): `page` int >= 1 (default 1), `pageSize` 1 to 50 (default 20).

Response `200 PagedResult<ConversationSummary>`: `id`, `title`, `mode`, `studyUnitId`, `messageCount`, `lastMessageAt`. Ordered by `lastMessageAt desc`. Never returns message content.

Failures: `400` validation; `401`; `403` missing permission.

- [ ] **BE-AI-14** `GET /ai/conversations`
  - [ ] Endpoint (`WithName`, `RequirePermission`, `WithValidation`, `ProducesProblem`)
  - [ ] `ListConversationsRequest`, `ConversationSummary` records
  - [ ] Validator (page bounds)
  - [ ] Handler (index-backed query, `AsNoTracking`)
  - [ ] Unit tests: ordering, paging maths
  - [ ] Integration tests: happy, validation, forbidden (parent role), another user's rows never returned

### BE-AI-15  POST /ai/conversations

| | |
|---|---|
| Operation id | `createConversation` |
| Permission | `ai.chat` |
| Entitlement | `ai_tutor`; deep mode also needs `ai_tutor.deep` |
| Rate limit | `ai` group, policy `ai-conversation-create` (10 per minute per user) |
| Idempotency | optional `Idempotency-Key` header; replay returns the same `201` body |
| Metric | `aptiverse.ai.conversations.created` (counter; tags `mode`, `stage`) |
| Log fields | `UserId`, `ConversationId`, `Mode`, `StudyUnitId` |

Request: `mode` in `standard|deep` (required), `studyUnitId` uuid optional (must be one of the user's units).

Response `201 ConversationResponse`: `id`, `title` ("New chat"), `mode`, `studyUnitId`, `createdAt`.

Rules: at most 20 conversations per student (old app cap); the 21st returns `409 ai.conversation_limit` and the UI asks the student to delete one (no silent auto-deletion).

Failures: `400 ai.mode_invalid`; `403 ai.feature_required` (deep without entitlement); `404 ai.study_unit_not_found`; `409 ai.blocked_during_attempt`; `409 ai.conversation_limit`; `429`.

- [ ] **BE-AI-15** `POST /ai/conversations`
  - [ ] Endpoint with `RequireFeature("ai_tutor")`
  - [ ] `CreateConversationRequest`, `ConversationResponse`
  - [ ] Validator
  - [ ] Handler (unit ownership via `IStudyUnitLookup`, attempt block)
  - [ ] Unit tests: deep mode entitlement branch
  - [ ] Integration tests: happy, validation, forbidden, unknown unit 404, blocked during attempt 409, 21st conversation 409

### BE-AI-16  GET /ai/conversations/{id}

| | |
|---|---|
| Operation id | `getConversation` |
| Permission | `ai.chat` |
| Entitlement | none beyond permission (history stays readable) |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.ai.conversations.get.duration` |
| Log fields | `UserId`, `ConversationId`, `MessageCount` |

Request: route `id` uuid; query `before` (message id cursor, optional), `take` 1 to 100 (default 50).

Response `200 ConversationDetail`: conversation fields plus `messages[]` (`id`, `role`, `content`, `status`, `mode`, `createdAt`, `parentMessageId`, `supersededByMessageId`), oldest first within the page, plus `nextCursor`. Superseded assistant messages are included and flagged so the UI can show only the latest.

Failures: `404 ai.conversation_not_found` (missing, deleted or not owned).

- [ ] **BE-AI-16** `GET /ai/conversations/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (cursor and take)
  - [ ] Handler (keyset pagination on `(conversation_id, created_at)`)
  - [ ] Unit tests: cursor maths
  - [ ] Integration tests: happy, another user's id returns 404, deleted returns 404

### BE-AI-48  PATCH /ai/conversations/{id}

| | |
|---|---|
| Operation id | `renameConversation` |
| Permission | `ai.chat` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | naturally idempotent (same title twice is a no-op) |
| Metric | `aptiverse.ai.conversations.renamed` (counter) |
| Log fields | `UserId`, `ConversationId` (never the title) |

Request: `title` 1 to 120 chars, trimmed, no control characters; `mode` optional `standard|deep` (deep needs entitlement).

Response `200 ConversationResponse`.

Failures: `400`; `403 ai.feature_required`; `404`; `409 ai.concurrency_conflict` on `xmin` mismatch.

- [ ] **BE-AI-48** `PATCH /ai/conversations/{id}`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (catches `DbUpdateConcurrencyException`, maps to 409)
  - [ ] Unit tests: trimming and control-character rejection
  - [ ] Integration tests: happy, 404 for another user, 409 on stale version

### BE-AI-17  DELETE /ai/conversations/{id}

| | |
|---|---|
| Operation id | `deleteConversation` |
| Permission | `ai.chat` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | deleting an already deleted conversation returns `204` |
| Metric | `aptiverse.ai.conversations.deleted` (counter) |
| Log fields | `UserId`, `ConversationId` |

Response `204`. Soft delete, sets `purge_after`; the purge job (BE-AI-58) hard-deletes messages after 30 days. A stream in progress for the conversation is cancelled.

Failures: `404` for not owned.

- [ ] **BE-AI-17** `DELETE /ai/conversations/{id}`
  - [ ] Endpoint
  - [ ] Records (route only)
  - [ ] Validator (id not empty)
  - [ ] Handler
  - [ ] Unit tests: purge date from `IClock`
  - [ ] Integration tests: happy, idempotent second delete, 404 for another user

### BE-AI-85  DELETE /ai/conversations/{id}/messages

| | |
|---|---|
| Operation id | `clearConversationHistory` |
| Permission | `ai.chat` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | clearing an empty conversation returns `204` |
| Metric | `aptiverse.ai.conversations.cleared` (counter) |
| Log fields | `UserId`, `ConversationId`, `MessagesDeleted` |

Clears the history but keeps the conversation (title, mode, unit). Messages are hard-deleted (the student asked for them to be gone), `summary` and `summary_through_message_id` reset, `message_count` set to 0. Refused while a reply is streaming (`409 ai.reply_in_progress`).

- [ ] **BE-AI-85** Clear conversation history
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: summary reset
  - [ ] Integration tests: happy, streaming 409, another user's id 404

### BE-AI-18  POST /ai/conversations/{id}/messages (SSE)

| | |
|---|---|
| Operation id | `sendTutorMessage` |
| Permission | `ai.chat` |
| Entitlement | `ai_tutor`; quota `ai.quick` or `ai.deep` (1 per reply) |
| Rate limit | `ai` group, policy `ai-chat` (20 per minute per user) plus a concurrency limiter of 1 open stream per user |
| Idempotency | required `Idempotency-Key` header (uuid); a replay while streaming returns `409 ai.reply_in_progress`, a replay after completion returns the stored reply as a single `done` event without a new model call or reservation |
| Metric | `aptiverse.ai.chat.reply.duration` (histogram, tags `mode`, `outcome`), `aptiverse.ai.chat.time_to_first_token` (histogram), `aptiverse.ai.cost_per_request_usd_micros` (histogram, tag `use_case`) |
| Log fields | `UserId`, `ConversationId`, `UserMessageId`, `AssistantMessageId`, `Mode`, `Model`, `PromptVersion`, `InputTokens`, `OutputTokens`, `CacheReadTokens`, `Outcome`, `AnthropicRequestId` (never message content) |

Request: `content` 1 to 4000 chars after trim; `mode` optional override `standard|deep`.

Order of operations: ownership, attempt block (BE-AI-20), entitlement, insert user message, reserve quota, build context and history, stream, persist assistant message, confirm or refund, record usage, publish `AiUsageRecorded`.

Response `200 text/event-stream`, events:

- `meta`: `{ userMessageId, assistantMessageId, mode, quotaRemaining }`
- `delta`: `{ text }` repeated
- `done`: `{ assistantMessageId, status: "complete" }`
- `error`: `{ code, message }` then the stream closes (status `failed`, quota refunded)

Pre-stream failures are normal ProblemDetails: `400` validation; `402`-style upgrade is expressed as `403 ai.feature_required`; `404 ai.conversation_not_found`; `409 ai.blocked_during_attempt`; `409 ai.reply_in_progress`; `429 ai.quota_exhausted` (with `resetsAt` extension); `429` rate limit; `503 ai.quota_unavailable` (meter down, fails closed); `503 ai.provider_unavailable` (circuit open).

Events: `AiUsageRecorded`. (`TutorSafetySignalRaised` is deferred with `safety_signals`, decision 22.)

- [ ] **BE-AI-18** `POST /ai/conversations/{id}/messages` streaming SSE
  - [ ] Endpoint writing `text/event-stream` with flush per delta and heartbeat comment every 15 s
  - [ ] `SendTutorMessageRequest` and SSE event records (documented in OpenAPI as `text/event-stream`)
  - [ ] Validator
  - [ ] Handler (ordering above; cancellation token linked to request abort)
  - [ ] Unit tests: refund on provider error, refund on cancel, confirm on success, no reservation when blocked
  - [ ] Integration tests with a fake gateway: happy stream, quota exhausted 429, idempotent replay, blocked during attempt, meter down returns 503

### BE-AI-19  POST /ai/conversations/{id}/messages/{messageId}/stop

| | |
|---|---|
| Operation id | `stopTutorReply` |
| Permission | `ai.chat` |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | stopping a finished reply returns `204` |
| Metric | `aptiverse.ai.chat.stopped` (counter, tag `mode`) |
| Log fields | `UserId`, `ConversationId`, `AssistantMessageId`, `TokensSoFar` |

Behaviour: signals the in-process cancellation registry for the streaming message (works across BFF disconnects); the partial text is stored with status `stopped`; quota is confirmed at 1 (the model did work) and usage recorded with outcome `cancelled`.

Failures: `404` not owned or unknown.

- [ ] **BE-AI-19** Stop support
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler plus `StreamCancellationRegistry` (singleton, keyed by message id; multi-instance note: a stop landing on another task falls back to client abort, see open question 2)
  - [ ] Unit tests: registry lifecycle, partial text saved
  - [ ] Integration tests: stop mid-stream, stop after done is 204

### BE-AI-46  POST /ai/conversations/{id}/messages/{messageId}/regenerate (SSE)

| | |
|---|---|
| Operation id | `regenerateTutorReply` |
| Permission | `ai.chat` |
| Entitlement | `ai_tutor`; quota as BE-AI-18 |
| Rate limit | `ai-chat` plus the per-user stream concurrency limiter |
| Idempotency | required `Idempotency-Key` |
| Metric | `aptiverse.ai.chat.regenerated` (counter), plus the BE-AI-18 histograms |
| Log fields | as BE-AI-18 plus `SupersededMessageId` |

Rules: only the latest assistant message in the conversation can be regenerated; the old one gets `superseded_by_message_id`; the new reply uses the same parent user message. Same SSE events and failures as BE-AI-18, plus `409 ai.not_latest_reply`.

- [ ] **BE-AI-46** Regenerate support
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (reuses the BE-AI-18 pipeline)
  - [ ] Unit tests: supersede linkage, only latest
  - [ ] Integration tests: happy, not latest 409, blocked during attempt

### BE-AI-21  POST /ai/help

| | |
|---|---|
| Operation id | `askHelpBot` |
| Permission | `ai.help` |
| Entitlement | free; quota `ai.help` (generous, abuse cap) |
| Rate limit | `ai` group, policy `ai-help` (10 per minute per user) |
| Idempotency | none needed (no state beyond usage) |
| Metric | `aptiverse.ai.help.duration`, `aptiverse.ai.help.links_returned` (histogram) |
| Log fields | `UserId`, `Model`, `PromptVersion`, `LinkCount`, `Outcome` |

Request: `question` 1 to 500 chars; `currentPath` optional app-relative path (max 200, must start with `/`).

Response `200 HelpAnswer`: `answer` (markdown, max 1500 chars), `links[]` of `{ label, path }` where every path is validated against the server's route allowlist (from `GET /navigation` data and help articles); unknown paths are dropped.

Failures: `400`; `409 ai.blocked_during_attempt` (help bot is also blocked during an attempt); `429 ai.quota_exhausted`; `503`.

- [ ] **BE-AI-21** Help bot prompt (`help-bot.v1.md`) and `POST /ai/help`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (structured output tool `help_answer` with links; allowlist filter)
  - [ ] Unit tests: link allowlist filter drops external and unknown paths
  - [ ] Integration tests: happy with fake gateway, blocked during attempt, validation

### BE-AI-47  GET /ai/access

| | |
|---|---|
| Operation id | `getTutorAccess` |
| Permission | `ai.chat` |
| Entitlement | none (it reports entitlement) |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: no-store` |
| Metric | `aptiverse.ai.access.reads` (counter, tag `state`) |
| Log fields | `UserId`, `State` |

One combined read so the tutor page and the shell can render the right state without three calls. Response `200 TutorAccess`:

- `state`: `available`, `upgrade_required`, `quota_exhausted`, `blocked_during_attempt`, `temporarily_unavailable` (spend breaker or circuit open), evaluated in that priority order after the attempt check (an active attempt always wins)
- `entitled` (`ai_tutor`), `deepEntitled` (`ai_tutor.deep`)
- `quotas`: `standard` and `deep` as `{ used, limit (null when unlimited), resetsAt }` from `IUsageMeter.GetAsync`
- `activeAttempt`: `{ attemptId, testTitle, deadlineAt }` or null (from `IActiveAttemptLookup`)

- [ ] **BE-AI-47** `GET /ai/access`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (empty)
  - [ ] Handler (three contract calls in parallel, each with a 200 ms budget; a meter failure reports `temporarily_unavailable`, never `available`)
  - [ ] Unit tests: state priority table
  - [ ] Integration tests: each state

## Error codes

Stable strings in the ProblemDetails `code` extension (contract test BE-AI-49).

| Code | HTTP | Meaning |
|---|---|---|
| `ai.feature_required` | 403 | No tutor (or deep) entitlement (`feature` extension) |
| `ai.quota_exhausted` | 429 | Quota used up (`quotaKey`, `resetsAt`) |
| `ai.quota_unavailable` | 503 | Meter unreadable; fails closed |
| `ai.blocked_during_attempt` | 409 | Active practice attempt (`attemptId`) |
| `ai.reply_in_progress` | 409 | A reply is still streaming for this key or conversation |
| `ai.not_latest_reply` | 409 | Only the latest reply can be regenerated |
| `ai.conversation_not_found` | 404 | Unknown, deleted or not owned |
| `ai.study_unit_not_found` | 404 | Unit not owned |
| `ai.mode_invalid` | 400 | Unknown mode |
| `ai.provider_unavailable` | 503 | Anthropic unreachable or circuit open (`Retry-After`) |
| `ai.temporarily_unavailable` | 503 | Daily spend breaker tripped |
| `ai.schema_invalid` | 502 | Structured output failed after one retry (internal callers only) |
| `ai.conversation_limit` | 409 | 20 conversations already; delete one first |
| `ai.concurrency_conflict` | 409 | `xmin` mismatch |

## Background work

- `SummariseConversation` message: see BE-AI-45 in the foundation tasks.
- [ ] **BE-AI-58** `PurgeDeletedConversations`: scheduled daily message, hard-deletes conversations and messages where `purge_after < now`, in batches of 500; reschedules itself.
- [ ] **BE-AI-59** `AccountDeletionRequested` handler: soft-deletes all the user's conversations with `purge_after = now`, nulls `user_id` on `ai_usage` rows after the retention period (usage keeps cost history without identity).
- Reservation expiry is Billing's job (BE-BIL-35); this module never leaves a reservation unresolved on a code path it controls, and an integration test kills a stream mid-way to prove the refund.

## Evals

- [ ] **BE-AI-30** Eval harness project `tools/Aptiverse.AiTutor.Evals`: golden set format (YAML per case: id, level, stage, curriculum, unit, topics, use case, expected properties), runner that calls the real gateway or a recorded fixture, JSON and markdown report
- [ ] **BE-AI-31** Golden set: Grade 8 (about 50 inputs across Mathematics, Natural Sciences, English HL, EMS)
- [ ] **BE-AI-54** Golden set: Grade 10 and 11 (about 50 inputs)
- [ ] **BE-AI-32** Golden set: Grade 12 NSC and IEB (about 50 inputs, split between the two)
- [ ] **BE-AI-33** Golden set: first-year university (about 50 inputs, STEM and humanities)
- [ ] **BE-AI-55** Golden set: second and third-year university (about 30 inputs)
- [ ] **BE-AI-52** Golden set: grader accuracy (about 60 written answers with human marks; assert mean absolute error within 0.5 marks and no award above max)
- [ ] **BE-AI-53** Golden set: tutor safety and honesty (prompt injection attempts, requests for graded answers, self-harm phrasing; assert refusal or support routing)
- [ ] **BE-AI-34** Assertion: schema valid (every generated set passes the tool schema without retry, target 95%)
- [ ] **BE-AI-50** Assertion: level-appropriate (model-graded rubric with a separate judge prompt, plus a weekly human review sample of 20; target 90%)
- [ ] **BE-AI-51** Assertion: LaTeX renders (Node script with KaTeX `throwOnError: true` over every stem, option and explanation)
- [ ] **BE-AI-35** CI job: runs the fixture-backed evals on any change under `Prompts/` or `Schemas/`; real-model run on label `eval:live`
- [ ] **BE-AI-36** Nightly real-model eval run in the Worker environment (GitHub Actions schedule with an eval-only API key and spend cap), report uploaded as an artifact and summarised by email (decision 63)
- [ ] **BE-AI-37** Cost per generated test metric: `aptiverse.ai.cost_per_generated_test_usd_micros` (histogram) recorded when a generation job completes, plus a nightly eval figure
- [ ] **BE-AI-56** Eval pass thresholds in config, and the Phase 5 exit gate check that reads the latest nightly report

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Spoofing | All `/ai` endpoints | JWT bearer, permission policy, ownership filter returns 404 | BE-AI-61 |
| Tampering: client-supplied context | Chat | No context fields accepted; context built server-side only | BE-AI-12, BE-AI-61 |
| Prompt injection (direct) | Chat, help | Delimited user content, no tools in chat, injection golden set | BE-AI-42, BE-AI-53 |
| Prompt injection (indirect) | Generation from topic names typed by students | Topic names length-capped (80), stripped of markup, passed as data in tagged block | BE-AI-62 |
| Repudiation | Model calls | `ai_usage` row per call with Anthropic request id and prompt version | BE-AI-07 |
| Information disclosure: cross-user data | Context builder | Context queries take the authenticated user id only; test that another user's units never appear | BE-AI-61 |
| Information disclosure: exfiltration via model output | Help bot links, markdown images | Links filtered to an allowlist; markdown image syntax stripped from replies before persisting and streaming | BE-AI-63 |
| Information disclosure: system prompt leakage | Chat | Prompts contain no secrets or PII; leakage is accepted as low impact and tested in BE-AI-53 | BE-AI-53 |
| Denial of service: cost exhaustion | Chat, help, generation | Quotas fail closed, per-user rate limits, stream concurrency 1, max output tokens per use, global daily spend breaker | BE-AI-08, BE-AI-66 |
| Elevation of privilege | Deep mode, admin spend | Entitlement check server-side; spend report needs `ai.spend.read` | BE-AI-15, BE-AI-57 |

- [ ] **BE-AI-60** Threat model note committed in `src/Modules/AiTutor/README.md` with the table above and the residual risks

### Authorisation and ownership

- [ ] **BE-AI-61** Per-endpoint authorisation matrix test: for each `/ai` endpoint, anonymous gets 401, wrong role gets 403, another student's resource gets 404, owner succeeds; plus a context-builder test with two seeded students

### Input limits

- [ ] **BE-AI-62** Limits enforced and tested: request body cap 16 KB on all `/ai` endpoints (Kestrel per-endpoint `MaxRequestBodySize`), message 4000 chars, title 120, help question 500, topic names 80, history window and summary caps from `AiLimitsOptions`
- [ ] **BE-AI-63** Output sanitising: strip markdown images and raw HTML from model output, cap reply at max output tokens, reject null bytes; unit tests

### Rate limits

- [ ] **BE-AI-64** Rate-limit policies registered and documented: `ai-chat` 20/min/user, `ai-help` 10/min/user, `ai-conversation-create` 10/min/user, stream concurrency 1/user, values from config; integration test trips each

### Idempotency and concurrency

- [ ] **BE-AI-65** `Idempotency-Key` handling on send and regenerate (stored on the user message as a unique `(conversation_id, idempotency_key)` index); `xmin` conflicts on conversation updates map to `409 ai.concurrency_conflict`; test two parallel sends with the same key produce one reply

### Resilience and graceful degradation

- [ ] **BE-AI-66** Global spend breaker: if `sum(cost_usd_micros)` for today exceeds the configured ceiling (decision 57; amount pending, DECISIONS.md F), chat returns `503 ai.temporarily_unavailable` and generation queues are paused; admin override flag in config
- [ ] **BE-AI-67** Degradation behaviour: circuit open returns `503 ai.provider_unavailable` with `Retry-After`; deep mode falls back to a clear error, never silently to standard; generation jobs retry through Wolverine (Practice) rather than inline; chaos test with the fake gateway returning 529 and timeouts

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `messages.content` | Personal information of a possible minor; may contain special personal information volunteered by the student | Until the user deletes the conversation, then 30 days; deleted on account deletion |
| `conversations.title`, `summary` | Personal information | As above |
| `ai_usage.*` | Operational, pseudonymous by user id | 24 months, then `user_id` nulled |
| `safety_signals` (deferred, decision 22) | Special personal information indicator (no content) | 12 months, then deleted |

- [ ] **BE-AI-68** Column classification recorded in the module README and in the POPIA data inventory (HRD); retention jobs cover every row above
- [ ] **BE-AI-69** Data export contributor: implements the Identity export contract (BE-IDN-37) returning the user's conversations and messages as JSON
- [ ] **BE-AI-70** Anthropic data processing: confirm zero data retention or the standard retention terms in writing, record it in the processor register, and never send names, emails or school names in prompts (context uses level and units only); test that the context block contains no email or name

### Audit

- [ ] **BE-AI-71** Audit events (security event table via Identity contract or module log) for: spend breaker tripped, admin override toggled

### Observability

- [ ] **BE-AI-72** Trace spans: `ai.reserve`, `ai.context.build`, `ai.anthropic.call` (attributes `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens`, prompt id and version), `ai.confirm`; no content in attributes
- [ ] **BE-AI-73** Metrics registered on meter `Aptiverse.AiTutor`: `aptiverse.ai.cost_per_request_usd_micros`, `aptiverse.ai.tokens` (counter, tags `direction`, `use_case`), `aptiverse.ai.cache_hit_ratio` (gauge from cache read over input), `aptiverse.ai.schema_retries` (counter), `aptiverse.ai.provider_errors` (counter, tag `status`), `aptiverse.ai.blocked_during_attempt` (counter), `aptiverse.ai.spend_today_usd_micros` (observable gauge)
- [ ] **BE-AI-74** Alerts: daily spend above 80% of ceiling; provider error rate above 5% over 10 min; schema failure rate above 3% over 1 h; cache hit ratio below 30% over 1 h (caching broken); p95 time to first token above 4 s over 15 min
- [ ] **BE-AI-75** Structured log policy test: a logging test sink asserts no log event from the module contains message content, titles or summaries

### Performance budgets

- [ ] **BE-AI-76** Budgets: list and get p95 under 150 ms; time to first token p95 under 3 s (standard) and 6 s (deep); generation of 10 questions p95 under 45 s (recorded, not on request path); `EXPLAIN` checked for the list and history queries with the seed of 10 000 messages per user

### Migration safety

- [ ] **BE-AI-77** Migrations follow expand and contract (new nullable columns first, backfill, then constraints in a later release); each migration PR states its rollback (down migration tested in CI against a copy) and flags destructive steps

### SLO contribution

- [ ] **BE-AI-78** SLO definitions: chat availability (non-5xx excluding `ai.provider_unavailable` caused by Anthropic) 99%; AI endpoints are excluded from the platform p95 500 ms SLO (HRD-50) and carry their own time-to-first-token SLO

### Load and failure tests

- [ ] **BE-AI-79** k6 scenario (HRD-10) for tutor messages against the fake gateway at 10x expected peak: no reservation left unresolved, no duplicate replies
- [ ] **BE-AI-80** Test: kill the process mid-stream (integration test cancels the host) and assert the reservation is refunded by the expiry job and the message ends `failed`
- [ ] **BE-AI-81** Test: prompt file change without a version bump fails CI (hash of each versioned file is pinned)
- [ ] **BE-AI-82** Test: the gateway refuses to start when an active prompt references an unknown schema
- [ ] **BE-AI-83** Runbook `docs/runbooks/anthropic-outage.md` contribution: breaker states, how to pause generation, how to raise the ceiling
- [ ] **BE-AI-49** Error code contract test: every `Error` constant in the module appears in the error code table
- [ ] **BE-AI-84** Config review: secrets (`Anthropic:ApiKey`) only from Secrets Manager, separate keys for prod, staging and evals, each with an Anthropic workspace spend limit

## Old data mapping

| Old (43f9faa) | New | Notes (feeds MIG-11) |
|---|---|---|
| `a_i.tutor_conversations` (`Id` Guid, `StudentId` string, `Title`, `Messages` jsonb list of `{Role, Content}`) | `ai.conversations` plus one `ai.messages` row per list item | `StudentId` mapped through the user id lookup; message `created_at` synthesised from conversation `CreatedAt` plus index milliseconds to keep order; status `complete`; mode `standard` |
| No usage table existed | `ai.ai_usage` starts empty | Historic spend is not reconstructed |
| Prompts inline in `AnthropicClient` and `PracticeTestGenerator` | `Prompts/*.v1.md` | Wording reviewed, not copied verbatim |

## Tests

- Unit: request serialisation never includes `temperature`; cost calculator; prompt loader validation; context builder per stage; schema retry path; link allowlist; output sanitiser; summary trigger.
- Integration (Testcontainers Postgres plus fake gateway): every slice happy, validation, forbidden, not found; quota exhausted; meter unavailable fails closed; blocked during attempt for chat, regenerate, help and conversation create; idempotent replay; purge job.
- Architecture: module references only Contracts; handlers public only for Wolverine.
- Evals: BE-AI-30 to BE-AI-37, BE-AI-50 to BE-AI-56.

## Contracts requested by other modules

- [ ] **BE-AI-86** Impersonation privacy: conversation and message reads return 403 `ai.private_during_impersonation` when the request carries an impersonation claim; integration test with an impersonation token

## Open questions

1. Per-user stream concurrency and stop rely on in-process state; with two API tasks a stop request can land on the other task. Options: sticky sessions on the ALB for `/ai`, or a Postgres `LISTEN/NOTIFY` stop signal. Recommend NOTIFY.
2. Should parents get any tutor access (for example asking about their child's units)? Assumed no in v1; parents get the help bot only.
3. The academic-honesty rule detects "graded work" from open assessment titles; is that signal good enough, or should the student declare it? Recommend both.
4. Safety routing currently relies on the main prompt. A separate lightweight classifier call costs more; decide after BE-AI-53 results.
5. Decided (57): BE-AI-66 trips at the Anthropic monthly ceiling expressed as a daily limit; value pending, DECISIONS.md F.
6. Thumbs up or down feedback on replies would feed the golden sets; not in the original backlog, left out until asked for.
7. Decided (22): no stored safety signal in v1; BE-AI-43 is prompt-only and `safety_signals` is deferred. Background kept for the later review: detecting self-harm or abuse disclosures in a minor's chat and storing a `safety_signals` row is processing of special personal information (POPIA sections 26 to 33) and creates safeguarding duties (who is told, how fast, and what happens with a child at risk). Needs a POPIA and safeguarding review before it is built; until then the tutor prompt only shows support resources and nothing is stored. Never shared with parents without that review.
