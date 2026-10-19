# AI tutor

| | |
|---|---|
| ID | `PG-STU-TUTOR` |
| Route | `/dashboard/tutor` (new conversation, `?unit=&topic=` sets context), `/dashboard/tutor/[conversationId]` |
| Phase | 5 |
| Roles | student |
| Stages | high school, university |
| Entitlement | `ai-tutor` (standard mode, monthly message quota); deep mode uses a separate quota key (43f9faa used `ai.quick` for standard and `ai.deep` for deep; confirm with BE-BIL-02) |
| Depends on | BE-AI-11, BE-AI-12, BE-AI-13, BE-AI-14, BE-AI-15, BE-AI-16, BE-AI-17, BE-AI-18, BE-AI-19, BE-AI-20, BE-AI-22, BE-AI-08, BE-ACA-15, BE-ACA-19, BE-WEL-08; FE-25, FE-26, FE-62, UI-07, UI-25, UI-29, UI-32 |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/chatbot/page.tsx`, `43f9faa:web/src/app/(app)/dashboard/chatbot/layout.tsx`, `43f9faa:web/src/components/common/ChatMessage.tsx` |
| Status | Not started. Nav entry "AI tutor" (`/dashboard/tutor`, entitlement `ai-tutor`) exists in `nav-config.ts`. `Markdown` (`web/src/components/common/markdown.tsx`) and `MathText` exist and are reused. Backend (AiTutor) not started. PG-STU-TUTOR-21 deferred (decision 22). |

## Purpose

A calm, subject-aware study aid that explains concepts, works through examples step by step, and suggests practice. It knows the student's level, subjects or courses and recent mastery from the server (never from the client), streams its answers, and is honest that it is an AI study aid, not a person. It guides rather than hands over answers to graded work, and it is switched off by the server during a practice attempt.

## User stories

- As a Grade 11 student, I ask "Why is the derivative of x squared 2x?" and get a step-by-step explanation with properly rendered maths at my level.
- As a university student, I ask about a course topic and the explanation fits second-year level.
- As a student, I pick a subject and topic so the tutor stays on track.
- As a student, I stop a long answer, regenerate it, or copy it.
- As a student, I come back to an earlier conversation.
- As a student, I see how many messages I have left, and that deep mode is a paid option.
- As a student in a practice test, I understand why the tutor is unavailable and when it comes back.

## Layout

### Mobile (360px)

1. Top bar (inside `PageShell` header area): `h1` conversation title (or "AI tutor" for new); "Conversations" button opening a sheet; "New chat" button.
2. Study-aid banner (dismissible per device, shown on first use): "Aptiverse tutor is an AI study aid, not a person. It can make mistakes, so check important answers."
3. Thread (scrollable, fills the screen): messages with role labels; assistant messages rendered with `Markdown` (KaTeX, GFM); action row under each assistant message (Copy, Regenerate on the last one); streaming message with a "Stop" button.
4. Empty conversation: three to four suggested prompts as buttons, chosen by stage and selected unit.
5. "Jump to latest" floating button when scrolled up during streaming.
6. Composer pill (sticky bottom, above the safe area): context chips (unit, topic; tap to change), textarea (auto-grows to 6 lines), mode switch (Standard or Deep), send button; quota line under it ("38 messages left this month").

Conversation sheet: list (title, last message date in SAST), each with an overflow menu (Delete).

### Desktop (1440px)

`PageShell width="wide"` without the page header. Left rail (300px): "New chat" and the conversation list. Main column: thread in a 760px centred column, composer pinned to the bottom of the column. Study-aid banner sits above the thread.

## Components

| Component | File | Server or client | Notes |
|---|---|---|---|
| New chat page | `web/src/app/(app)/dashboard/tutor/page.tsx` | server | entitlement and active-attempt checks, units for context chips |
| Conversation page | `web/src/app/(app)/dashboard/tutor/[conversationId]/page.tsx` | server | loads the conversation; `notFound()` on 404 |
| Layout | `web/src/app/(app)/dashboard/tutor/layout.tsx` | server | rail plus main column; loads the conversation list |
| Loading, error, not found | `.../tutor/loading.tsx`, `error.tsx`, `[conversationId]/not-found.tsx` | mixed | |
| Redirect | `web/next.config.ts` | config | `/dashboard/chatbot` to `/dashboard/tutor` (308) |
| Loaders | `web/src/features/tutor/server/get-conversations.ts`, `get-conversation.ts`, `get-tutor-access.ts` | server | BE-AI-14, BE-AI-16; access combines entitlement, quota and active attempt |
| Conversation list | `web/src/features/tutor/components/conversation-list.tsx` | server | rail on desktop |
| Conversation sheet | `web/src/features/tutor/components/conversation-sheet.tsx` | client | mobile |
| Delete dialog | `web/src/features/tutor/components/delete-conversation-dialog.tsx` | client | `ConfirmDialog` |
| Thread | `web/src/features/tutor/components/message-thread.tsx` | client | virtualised only if over 200 messages |
| Message | `web/src/features/tutor/components/message-bubble.tsx` | client | `Markdown` with KaTeX for assistant, plain text for student |
| Message actions | `web/src/features/tutor/components/message-actions.tsx` | client | copy, regenerate |
| Suggested prompts | `web/src/features/tutor/components/suggested-prompts.tsx` | client | from `suggested-prompts.ts` |
| Prompt sets | `web/src/features/tutor/lib/suggested-prompts.ts` | shared | per stage, with unit name interpolation |
| Composer | `web/src/features/tutor/components/composer.tsx` | client | textarea, send, keyboard rules |
| Context chips | `web/src/features/tutor/components/context-chips.tsx` | client | unit and topic pickers (BE-ACA-15, BE-ACA-19) |
| Mode switch | `web/src/features/tutor/components/mode-switch.tsx` | client | deep mode gated |
| Quota line | `web/src/features/tutor/components/quota-line.tsx` | client | updated from stream `usage` events |
| Study-aid banner | `web/src/features/tutor/components/study-aid-banner.tsx` | client | dismissal in localStorage (try/catch) |
| Blocked state | `web/src/features/tutor/components/tutor-blocked.tsx` | server | active attempt |
| Support panel | `web/src/features/tutor/components/support-resources-callout.tsx` | client | deferred with PG-STU-TUTOR-21 (decision 22) |
| Stream hook | `web/src/features/tutor/hooks/use-tutor-stream.ts` | client | FE-62 SSE reader over the BFF passthrough (FE-26); abort, events, errors |
| Send hook | `web/src/features/tutor/hooks/use-send-message.ts` | client | creates the conversation on first send, then streams |
| Regenerate and stop | `web/src/features/tutor/hooks/use-regenerate.ts`, `use-stop-stream.ts` | client | BE-AI-19 |
| Auto-scroll | `web/src/features/tutor/hooks/use-stick-to-bottom.ts` | client | sticks unless the student scrolled up |
| Event schema | `web/src/features/tutor/lib/stream-events.ts` | shared | zod schemas for SSE events |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/ai/conversations?page=` (BE-AI-14) | GET | `items[] { id, title, unitId or null, updatedAt }` | user-scoped, tag `ai:conversations:<userId>` |
| `/ai/conversations/{id}` (BE-AI-16) | GET | `id, title, unitId, topicId, mode, messages[] { id, role (user, assistant), content, createdAt, status (complete, stopped, failed) }` | user-scoped, no cache (fresh on open) |
| Tutor access (to confirm, see open questions) | GET | `entitled, standard { limit or null, used, resetsAt }, deep { entitled, limit or null, used }, blockedByAttempt { testId, title } or null` | no cache |
| `/academics/units` (BE-ACA-15) and `/academics/units/{id}/topics` (BE-ACA-19) | GET | `id, name` | as on other pages |

Mutations (client, `/api/bff`):

| Endpoint (BE ID) | Method | Request | Response |
|---|---|---|---|
| `/ai/conversations` (BE-AI-15), `Idempotency-Key` | POST | `{ unitId?, topicId?, mode }` | `{ id }`; client then `router.replace` to `/dashboard/tutor/{id}` without a full reload |
| `/ai/conversations/{id}/messages` (BE-AI-18) | POST, `Accept: text/event-stream`, `Idempotency-Key` per message | `{ content (1 to 4 000 characters), mode (standard, deep), unitId?, topicId? }` | SSE events: `message_start { messageId }`, `delta { text }`, `usage { standardLeft, deepLeft }`, `done { messageId, title? }`, `error { code (quota_exhausted, blocked_attempt, rate_limited, model_unavailable, content_refused), retryable }` |
| `/ai/conversations/{id}/messages/{messageId}/stop` (BE-AI-19) | POST | none | 204; server stops generation and refunds unused reservation |
| `/ai/conversations/{id}/messages/{messageId}/regenerate` (BE-AI-19) | POST, SSE | none | same event stream |
| `/ai/conversations/{id}` (BE-AI-17) | DELETE | none | 204; redirect to `/dashboard/tutor` |

The student context (level, units, recent mastery) is built server-side (BE-AI-12); the request carries only the message, mode and the chosen unit and topic ids, which the server checks against the student's enrolments.

## States

| State | When | Copy |
|---|---|---|
| Loading | first render | rail and thread skeletons |
| Empty conversation | new chat | heading "What are you working on?" and suggested prompts |
| No conversations | list empty | rail: "Your conversations will show here." |
| Streaming | after send | assistant bubble grows; "Stop" button; screen reader announces "Tutor is replying" once and the full answer when done |
| Stopped | student pressed Stop | bubble keeps the partial text with label "Stopped"; "Regenerate" available |
| Stream failed | network drop or `error` retryable | partial text kept, label "This reply was cut off." button "Try again" |
| Model unavailable | `model_unavailable` | "The tutor is unavailable right now. Please try again in a few minutes. Your message was not counted." |
| Content refused | `content_refused` | "The tutor can't help with that. Try asking about your schoolwork." |
| Rate limited | 429 or `rate_limited` | "You're sending messages quickly. Wait a moment and try again." |
| Quota exhausted | `quota_exhausted` or limit reached | composer disabled; "You've used this month's tutor messages. They reset on {date}. Student Pro gives you more." actions "See plans" |
| Deep mode not in plan | student taps Deep | inline `UpgradeGate` compact: "Deep mode gives longer, more thorough explanations. It is part of Student Pro." |
| Not entitled | no `ai-tutor` | full-page `UpgradeGate` feature "AI tutor": "Get step-by-step help in any subject, at your level." |
| Blocked by attempt | active practice attempt | `tutor-blocked`: title "The tutor is off during your test"; body "It comes back as soon as you submit {test title}."; action "Back to your test" |
| Wellbeing safety (deferred, decision 22: no distress signal in v1) | none in v1; the tutor prompt itself points a student who seems to be struggling to the support page and a trusted adult, as in 43f9faa | a later callout below the reply: "If you're going through a hard time, you don't have to handle it alone." link "Find support" to `/dashboard/wellbeing/support` |
| Not found | conversation 404 or not owner | "We could not find that conversation." action "Start a new chat" |
| Error | loader fails | `PageError` defaults |
| Populated | messages | thread |

## Stage variants

| Item | High school | University |
|---|---|---|
| Context chip label | "Subject" | "Course" |
| Suggested prompts | "Explain {topic} like I'm seeing it for the first time", "Give me a Grade {grade} exam-style question on {topic}", "Check my working on this problem", "Summarise {subject} Paper 1 topics" | "Explain {topic} with an example", "Give me a practice question on {topic} at {studyLevel} level", "Help me plan an answer for this essay question", "Summarise the key ideas in {course}" |
| Level in replies | set by server context (grade and curriculum) | set by server context (study level, decision 19) |

## Interactions and edge cases

- Enter sends on desktop; Shift+Enter adds a line. On mobile, Enter adds a line and the send button sends (mobile keyboards have no reliable Shift).
- Content limit 4 000 characters with a counter from 3 500; paste over the limit is truncated with a notice.
- Send while streaming is disabled; the student stops first.
- First send on `/dashboard/tutor` creates the conversation, then streams into it; the URL updates to the conversation id with `router.replace` so back does not return to an empty chat.
- Optimistic user message appears immediately with "Sending..."; if creation fails, it shows "Not sent" with "Try again" and the text stays in the composer.
- Network loss mid-stream: the reader aborts after 20 seconds without bytes, marks the reply cut off and keeps the partial text; "Try again" calls regenerate (the server keeps one assistant message per user message).
- Leaving the page during a stream aborts the client reader; the server finishes or stops per BE-AI-19 and the completed reply appears when the conversation is reopened.
- Markdown safety: no raw HTML, links open in a new tab with `rel="noopener noreferrer"`, external images not rendered (shown as links), code blocks have a copy button.
- Copy copies the message's Markdown source (so maths stays as LaTeX).
- Academic honesty: the guardrail is in the prompt (BE-AI-22); the UI adds a one-line hint under the composer the first time a long pasted question is detected: "Tip: the tutor helps you understand, so you can answer graded work yourself."
- Blocked by attempt: checked on page load and also on every send (the server returns `blocked_attempt`), so a test started in another tab blocks immediately.
- Conversation titles come from the server (`done.title`) and update in the rail without reload.
- Context chips: changing the unit mid-conversation applies from the next message and shows a small system line "Now focusing on {unit}".

## Copy

- Banner: "Aptiverse tutor is an AI study aid, not a person. It can make mistakes, so check important answers."
- Composer placeholder: "Ask about {unit or 'any subject'}..."
- Buttons: "Send", "Stop", "Regenerate", "Copy", "New chat", "Conversations"
- Quota: "{n} messages left this month" / "Unlimited messages on your plan"
- Mode switch: "Standard" / "Deep (more thorough, uses more of your quota)"
- Delete dialog: "Delete this conversation? This cannot be undone." confirm "Delete"

## Acceptance criteria

- Given an entitled Grade 11 student, when they send a maths question, then the reply streams token by token, renders LaTeX with KaTeX, and the quota line decreases by one after `done`.
- Given a reply is streaming, when the student taps "Stop", then streaming ends within 1 second, the partial reply is labelled "Stopped", and only the used tokens count.
- Given the network drops mid-reply, when 20 seconds pass without data, then the reply shows "This reply was cut off." with "Try again", and the partial text remains.
- Given an active practice attempt, when the student opens `/dashboard/tutor`, then the blocked state shows; and when a message is posted directly to BE-AI-18, then the API returns `blocked_attempt`.
- Given a student without `ai-tutor`, when they open the route, then the full upgrade gate shows and no conversation list is fetched.
- Given a student with standard but not deep entitlement, when they choose Deep, then the inline upgrade note shows and messages still send in Standard.
- Given a reply that contains `<script>` or an HTML image tag, when rendered, then it shows as text and no script runs.
- Given another student's conversation id, when opened, then not found renders.
- Given an old bookmark `/dashboard/chatbot`, when opened, then it redirects to `/dashboard/tutor`.

## Production readiness

- Security: conversation ownership enforced on every endpoint (404 for others); student context built server-side only (BE-AI-12), so prompt context cannot be spoofed by the client; unit and topic ids checked against enrolments; Markdown rendered without raw HTML (XSS); SSE passes through the BFF (FE-26) so the access token never reaches the browser; `ai` rate-limit group; message length enforced client and server.
- Performance: thread and composer are client, but `Markdown` and KaTeX load once per route; route JS under 150 KB gzip (KaTeX CSS loaded on demand). Time to first token target p95 under 3 seconds for standard mode, measured from send. Conversation list server-rendered.
- Resilience: stream inactivity timeout 20 s; retryable errors offer "Try again" through regenerate; quota reserve, confirm or refund (BE-AI-08) so failed or stopped replies are not fully charged; Anthropic outage maps to `model_unavailable` with no charge; per-message idempotency key prevents double sends on retry.
- Observability: analytics (never message content) `tutor_message_sent { mode, hasUnit, length bucket }`, `tutor_reply_completed { mode, ttftMs, durationMs }`, `tutor_reply_stopped`, `tutor_reply_failed { code }`, `tutor_regenerated`, `tutor_quota_blocked`, `tutor_blocked_by_attempt`. Sentry tag `page:tutor`; request bodies scrubbed; trace id propagated through the BFF into the SSE request so a failed stream links to its API span and model call.
- Accessibility (WCAG 2.2 AA): thread is a `log` region; streaming announced once at start and once at completion, not per token; focus stays in the composer after send; Stop is reachable by keyboard while streaming.
- Privacy and POPIA: messages from minors may contain personal or wellbeing information (special personal information); stored per BE-AI-13 retention, included in export and deletion (BE-IDN-36, BE-IDN-37), never in analytics or logs; no wellbeing signal is raised from tutor conversations in v1 (decision 22); the prompt points to SA helplines and nobody is notified.
- Rollout: behind `tutor.chat`; deep mode behind `tutor.deep`. Internal accounts, then 10%, then everyone while watching cost and error rate. Rollback: flags off; nav entry hidden with the flag; the dashboard tutor card hides too.
- Monitoring: Grafana panels for time to first token, stream error rate by code, stop rate, tokens and cost per message (BE-AI-07), blocked-by-attempt count; alerts when stream error rate exceeds 3% over 15 minutes, TTFT p95 exceeds 6 seconds, or daily tutor spend exceeds the budget threshold.

## Build tasks

- [ ] **PG-STU-TUTOR-01** Conversation list (sheet on mobile, rail on desktop) from BE-AI-14
- [ ] **PG-STU-TUTOR-02** Message thread with `Markdown` and KaTeX for assistant messages, plain text for student messages
- [ ] **PG-STU-TUTOR-03** Composer pill (textarea, send, unit and topic context chips, mode switch)
- [ ] **PG-STU-TUTOR-04** Streaming render via SSE through the BFF (`use-tutor-stream` on the FE-62 reader)
- [ ] **PG-STU-TUTOR-05** Stop, regenerate and copy actions (BE-AI-19)
- [ ] **PG-STU-TUTOR-06** Suggested prompts on an empty conversation, per stage and unit
- [ ] **PG-STU-TUTOR-07** Quota line and deep-mode upgrade gate
- [ ] **PG-STU-TUTOR-08** Blocked state during an active practice attempt (page load and `blocked_attempt` on send)
- [ ] **PG-STU-TUTOR-09** "Study aid, not a person" framing (banner, composer hint, copy review)
- [ ] **PG-STU-TUTOR-10** Routes, layout and loaders (`get-conversations`, `get-conversation`, `get-tutor-access`) with `notFound()`
- [ ] **PG-STU-TUTOR-11** Redirect from the old `/dashboard/chatbot`
- [ ] **PG-STU-TUTOR-12** SSE event zod schemas `stream-events.ts` and parser tests
- [ ] **PG-STU-TUTOR-13** `use-send-message`: optimistic message, create conversation on first send, `router.replace`, idempotency key
- [ ] **PG-STU-TUTOR-14** Stream failure handling: inactivity timeout, cut-off label, retry through regenerate
- [ ] **PG-STU-TUTOR-15** Error code mapping (quota, rate limit, model unavailable, content refused) to copy
- [ ] **PG-STU-TUTOR-16** Delete conversation with confirm (BE-AI-17)
- [ ] **PG-STU-TUTOR-17** `use-stick-to-bottom` and "Jump to latest"
- [ ] **PG-STU-TUTOR-18** Composer keyboard rules, 4 000 character limit and counter
- [ ] **PG-STU-TUTOR-19** Context chips with unit and topic pickers; `?unit=&topic=` prefill, ownership-checked
- [ ] **PG-STU-TUTOR-20** Not-entitled full-page upgrade gate
- [ ] **PG-STU-TUTOR-21** Wellbeing safety callout on `safety` events linking to support resources *(deferred: decision 22, not in v1)*
- [ ] **PG-STU-TUTOR-22** Markdown hardening: no raw HTML, safe links, no remote images, code copy
- [ ] **PG-STU-TUTOR-23** Live title updates in the rail from `done.title`
- [ ] **PG-STU-TUTOR-24** Analytics events listed above, with a test that no payload contains message text
- [ ] **PG-STU-TUTOR-25** Sentry body scrubbing and trace propagation through the SSE request
- [ ] **PG-STU-TUTOR-26** Flags `tutor.chat` and `tutor.deep`, staged rollout plan and rollback note
- [ ] **PG-STU-TUTOR-27** Grafana panels and alerts (TTFT, stream errors, cost per message, spend threshold)
- [ ] **PG-STU-TUTOR-28** Bundle work: KaTeX CSS on demand; route JS budget 150 KB gzip
- [ ] **PG-STU-TUTOR-29** Conversation cap (20 in 43f9faa): the oldest conversation is dropped when a new one would exceed it, and the list footer says "We keep your 20 most recent conversations."
- [ ] **PG-STU-TUTOR-30** Clear all history (confirm "Delete all conversations? This cannot be undone.") from the list menu (43f9faa `DELETE /api/ai/conversations`)
- [ ] **PG-STU-TUTOR-31** Rename a conversation from its overflow menu (43f9faa PUT with title)
- [ ] **PG-STU-TUTOR-32** Starter prompts with short labels and longer sent prompts ("Explain a concept", "Practise a topic", "Outline an essay", "Quiz me"), merged with the stage-specific set in PG-STU-TUTOR-06
- [ ] **PG-STU-TUTOR-33** Mode picker with descriptions ("Standard: fast answers for everyday questions." / "Deep: slower, thinks harder through tough multi-step problems."), last choice remembered per device
- [ ] **PG-STU-TUTOR-34** Quota-exhausted copy offers switching off deep mode when only the deep quota is used up ("You've used this month's deep replies. Switch to Standard, or see plans."); separate `ai.quick` and `ai.deep` keys as in 43f9faa
- [ ] **PG-STU-TUTOR-35** AI unavailable (503) copy: "The AI tutor is not available right now. Please try again later."
- [ ] **PG-STU-TUTOR-36** Mobile history sheet closes when a conversation is picked or a new chat starts, and never reopens itself on the next visit
- [ ] **PG-STU-TUTOR-37** Composer pays back the bottom safe-area inset so the send button is never under the phone's home indicator

## Quality tasks

- [ ] **PG-STU-TUTOR-Q01** Route files: `page.tsx` (Server Component) for both routes, `loading.tsx` (skeleton), `error.tsx` (retry via `PageError`), `not-found.tsx` for `[conversationId]`
- [ ] **PG-STU-TUTOR-Q02** Server loaders in `src/features/tutor/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-TUTOR-Q03** Client mutations and streams through `/api/bff` with generated TanStack hooks and the SSE passthrough; pending and failure states
- [ ] **PG-STU-TUTOR-Q04** Empty state with suggested prompts as the next action
- [ ] **PG-STU-TUTOR-Q05** Error copy for every stream error code
- [ ] **PG-STU-TUTOR-Q06** Forbidden state, not-entitled upgrade gate, deep-mode gate, blocked-by-attempt state
- [ ] **PG-STU-TUTOR-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-TUTOR-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); composer stays above the keyboard and safe area; long LaTeX scrolls horizontally inside its block
- [ ] **PG-STU-TUTOR-Q09** Layout at 1440px
- [ ] **PG-STU-TUTOR-Q10** Light and dark both correct (OS-driven), including KaTeX and code blocks
- [ ] **PG-STU-TUTOR-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-TUTOR-Q12** axe: zero violations in light and dark, while streaming and idle
- [ ] **PG-STU-TUTOR-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, Stop reachable during streaming
- [ ] **PG-STU-TUTOR-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty, streaming, error, upgrade and blocked states
- [ ] **PG-STU-TUTOR-Q15** `generateMetadata` title is the conversation title or "AI tutor"; nav entry active on both routes

## Tests

Unit (Vitest):
- `stream-events.test.ts`: "parses delta, usage, done, error", "rejects unknown event without crashing"
- `use-tutor-stream.test.ts`: "appends deltas in order", "aborts after 20 seconds of silence", "stop aborts the reader", "error event sets the code"
- `use-send-message.test.ts`: "creates conversation on first send then streams", "keeps text on failure", "one idempotency key per message"
- `suggested-prompts.test.ts`: "university prompts have no Grade wording", "unit name interpolated"
- `message-bubble.test.tsx`: "renders LaTeX", "renders HTML tags as text", "external image becomes a link"
- `composer.test.tsx`: "Enter sends on desktop", "Enter adds a line on touch", "limit 4000 enforced"

Playwright (`web/e2e/student/tutor.spec.ts`, SSE mocked through the BFF in CI):
- "student sends a message and sees a streamed reply with maths"
- "stop keeps the partial reply"
- "cut-off stream offers try again"
- "quota exhausted disables the composer"
- "deep mode shows upgrade note without entitlement"
- "active attempt blocks the tutor"
- "not entitled sees the upgrade gate"
- "old chatbot URL redirects"
- "axe clean in light and dark at 360 and 1440"

## Open questions

- No endpoint returns tutor access in one read (entitlement, quotas, active attempt). Options: extend `/me` with quotas plus `GET /practice/attempts/active`, or add `GET /ai/access`.
- BE-AI-18 event names and error codes in this file are proposals; the backend module doc should own them.
- Deep mode quota key name and free-plan message limit come from BE-BIL-02.
- Decided (22): no `safety` event and no distress signal in v1; it needs a POPIA and safeguarding review first. The tutor prompt points students to `/dashboard/wellbeing/support` and a trusted adult instead (system prompt, BE-AI-12).
- Conversation retention period for minors is not defined in BE-AI-13. 43f9faa capped history at 20 conversations per student; keep the cap and add a time limit?
- Not ported from 43f9faa on purpose: the client built the student profile and sent it with each request, and the client saved the whole transcript after each turn with simulated word-by-word reveal. The rebuild builds context server-side (BE-AI-12), persists messages server-side (BE-AI-13) and streams real tokens.
- 43f9faa had no server-side tutor block during a practice attempt; BE-AI-20 is new.
- BE-AI-14 to 17 lack rename and clear-all; PG-STU-TUTOR-30 and 31 need slices.
- The 43f9faa tutor prompt told the model to point students in crisis to the counselling page and a trusted adult; the v1 prompt keeps that and links to `/dashboard/wellbeing/support`.
