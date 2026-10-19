# Diary

| | |
|---|---|
| ID | `PG-STU-DIARY` |
| Route | `/dashboard/diary` (optional `?entry=<id>` opens one entry; `?new=1` opens the composer) |
| Phase | 7 |
| Roles | student |
| Stages | high school, university |
| Entitlement | free |
| Depends on | BE-WEL-04, BE-WEL-05, BE-WEL-06, UI-02, UI-03, UI-07, UI-10, UI-22, UI-25, UI-33, FE-25, OBS-04, OBS-06, PG-STU-WELL-07 (`mood-scale.ts`), PG-ADM-DASH-13 (`web/src/lib/format/datetime.ts`) |
| Old app reference | `web/src/app/(app)/dashboard/diary/page.tsx` at 43f9faa (inline composer with writing prompts, mood scale, entry list; the earlier "nothing leaves your device" claim had already been corrected there); `WellbeingController.cs` (`GET` and `POST /api/wellbeing/diary` only, no edit or delete) and `DiaryEntry.cs` (AI sentiment columns) at 43f9faa; the "diary/print fixes" in commit `3d4181c` |
| Status | Not started (backend not started; no route, loader or components exist) |

`PG-STU-DIARY-07` in the original single-file backlog is the old "DoD" line. It is covered here by the quality tasks and is not reused.

## Purpose

A private journal. The student writes, tags a mood if they want, and reads back. Entries are encrypted at rest on the server (BE-WEL-04), only the student sees them in the app, and linked parents never see the contents or even the count unless the student shares a check-in trend (which never includes diary data). The page says this plainly and accurately: it does not claim end-to-end encryption, because the server holds the keys.

## User stories

- As a student, I want to write an entry quickly, so I actually use it.
- As a student, I want to tag how I felt, so I can look back at patterns myself.
- As a student, I want to read an old entry in a calm view.
- As a student, I want to edit or delete an entry, and know delete means gone.
- As a student, I want to be sure my parents cannot read my diary.
- As a student, I want to print one entry cleanly, with nothing else on the page.

## Layout

### Mobile (360px)

List view (no `?entry`), single column, `px-4`, `gap-4`:

1. `PageHeader`: h1 "Diary", description "Private to you. Parents never see what you write." Primary action "New entry" (full width, `PenLine` icon).
2. `PrivacyNote`: small magenta-tinted card with `LockKeyhole` icon: "Your entries are encrypted at rest and never shown to parents. Our support team can't open them either." Link "How this works" opens a `Sheet` with the details in the Copy section.
3. `EntryList`: grouped by month (h2 "October 2026"). Row: date ("Tue 14 Oct"), mood icon and label if tagged, title or the first 60 characters of the body if no title. Rows are links to `?entry=<id>`. 20 per page, "Show older" button.

Composer (`?new=1` or `?entry=<id>&edit=1`), full-screen sheet on mobile:

1. Top bar: "Cancel" (left), title "New entry" or "Edit entry", "Save" (right, primary).
2. Mood picker: the five moods from `mood-scale.ts`, optional, deselectable.
3. "Title (optional)" input, max 120.
4. Body `Textarea`, autogrow, min 8 rows, max 10 000 characters, counter shown after 9 000.
5. Footer line: "Only you can read this."

Reading view (`?entry=<id>`), replaces the list:

1. Back link "All entries".
2. Date and time (h2 is the title, or the date when there is no title), mood chip.
3. Body in a comfortable reading measure (max 65 characters per line, `text-base`, line height 1.7), paragraphs preserved, no Markdown rendering (plain text with line breaks).
4. Actions row: "Edit", "Print", "Delete" (destructive, outline).
5. "Edited {relative time}" when `updatedAt` differs from `createdAt`.

### Desktop (1440px)

`PageShell`, 12 columns:

- Left (4 of 12): header, "New entry", `PrivacyNote`, `EntryList` with the open entry highlighted.
- Right (8 of 12): reading view or the composer inline (not a sheet), centred at a 65-character measure.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page | `web/src/app/(app)/dashboard/diary/page.tsx` | server | Dynamic, `no-store`; `generateMetadata` title "Diary" only (never the entry title, so it does not show in tab history or OS switchers) |
| Loading | `web/src/app/(app)/dashboard/diary/loading.tsx` | server | List skeleton |
| Error | `web/src/app/(app)/dashboard/diary/error.tsx` | client | `PageError` with retry |
| Not found | `web/src/app/(app)/dashboard/diary/not-found.tsx` | server | Unknown, deleted or other user's `?entry` |
| PrivacyNote | `web/src/features/wellbeing/components/diary-privacy-note.tsx` | server | Sheet trigger is a client leaf |
| EntryList | `web/src/features/wellbeing/components/diary-entry-list.tsx` | server | First page server-rendered; month groups via a shared `group-by-month` helper |
| ShowOlderEntries | `web/src/features/wellbeing/components/diary-show-older.tsx` | client | Infinite query through `/api/bff`, `gcTime` 0 so entries are not kept in the client cache after leaving |
| EntryReader | `web/src/features/wellbeing/components/diary-entry-reader.tsx` | server | Plain text rendering with `white-space: pre-wrap`; print styles |
| EntryActions | `web/src/features/wellbeing/components/diary-entry-actions.tsx` | client | Edit link, `window.print()`, delete dialog |
| DiaryComposer | `web/src/features/wellbeing/components/diary-composer.tsx` | client | `ResponsiveDialog` full-screen on mobile, inline on desktop; `useZodForm` with generated schemas |
| DeleteEntryDialog | `web/src/features/wellbeing/components/diary-delete-dialog.tsx` | client | `ConfirmDialog`, destructive variant |
| Unsaved guard | `web/src/features/wellbeing/hooks/use-unsaved-guard.ts` | client | `beforeunload` and in-app navigation confirm while the composer is dirty |
| Print styles | `web/src/features/wellbeing/components/diary-print.css` (imported by the reader) | n/a | `@media print`: hides shell, nav, actions, toasts; prints date, mood and body only |
| Loaders | `web/src/features/wellbeing/server/get-diary-entries.ts`, `get-diary-entry.ts` | server | `no-store`; zod-validated |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/wellbeing/diary?cursor=&limit=20` (BE-WEL-05) | GET | `items[]`: `id`, `createdAt`, `updatedAt`, `mood` (1 to 5 or null), `title` (or null), `preview` (first 60 characters, decrypted server-side); `nextCursor` | none (`no-store`) |
| `/wellbeing/diary/{id}` (BE-WEL-05) | GET | `id`, `createdAt`, `updatedAt`, `mood`, `title`, `body`, `version` | none |

Mutations (through `/api/bff`, generated hooks):

| Endpoint (BE ID) | Method | Request | Responses | After success |
|---|---|---|---|---|
| `/wellbeing/diary` | POST | `title` (optional, max 120), `body` (required, 1 to 10 000), `mood` (optional); `Idempotency-Key` per composer instance | 201 `{ id }`; 400; 413 body too large | `router.refresh()`; toast "Entry saved"; open `?entry=<id>` |
| `/wellbeing/diary/{id}` | PATCH | changed fields; `If-Match` version | 200; 404; 412 | refresh; toast "Entry updated" |
| `/wellbeing/diary/{id}` | DELETE | none | 204; 404 (already gone, treated as success) | refresh; toast "Entry deleted" (no undo: delete is permanent); back to list |

Rules:

- Content is encrypted at rest per entry with an envelope key (BE-WEL-04); the API decrypts only for the owner's requests. No admin, parent or support endpoint returns diary content or counts.
- Delete is a hard delete of the ciphertext (plus key destruction if per-entry keys are used), not a soft delete, so "deleted" means gone. Backups age out under the retention policy (HRD-35).
- The web never stores entry content in `localStorage`, `sessionStorage`, IndexedDB or the Next data cache. Drafts live only in component memory.
- The page sets `Cache-Control: private, no-store` and the API does the same, so the browser back-forward cache and shared proxies do not keep entries.

## States

| State | When | Exact copy and action |
|---|---|---|
| Loading | Pending | List skeleton; "Loading your diary" |
| Empty | No entries | `EmptyState`, `NotebookPen` icon. Title "Your diary is empty". Body "Write about your day, something on your mind, or anything at all. Only you can read it." Button "Write your first entry" |
| Saving | POST or PATCH pending | "Save" shows "Saving", disabled; fields read-only |
| Save failed | 5xx or network | Inline above the body: "That didn't save. Your writing is still here. Copy it somewhere safe if you need to, then try again." Button "Try again" |
| Too long | 400 or 413 | Counter turns to the destructive colour; "Entries can be up to 10 000 characters. Split this into two entries." |
| Version conflict | 412 | "This entry changed on another device. Copy your changes, then reload to see the latest version." Buttons "Copy my text", "Reload" |
| Unsaved changes | Leaving a dirty composer | `ConfirmDialog`: "Leave without saving?" body "What you've written here will be lost." Confirm "Leave", cancel "Keep writing" |
| Delete confirm | Delete pressed | `ConfirmDialog` destructive: title "Delete this entry?", body "This can't be undone. The entry is removed for good.", confirm "Delete entry", cancel "Keep it" |
| Older failed | Next page failed | "We couldn't load older entries." Button "Try again" |
| Error | Loader failed | "We couldn't open your diary. Check your connection and try again." Button "Try again" |
| Not found | `?entry` unknown | "We couldn't find that entry. It may have been deleted." Link "All entries" |
| Forbidden | Not a student | "This page is for students." Link "Go to my dashboard" |

## Stage variants

None. Copy is the same for high-school and university students. Stage wording checks still run (no school terms for university students).

## Interactions and edge cases

- Opening the composer focuses the body field (or title on desktop). `Ctrl` or `Cmd` plus `Enter` saves.
- Double press on "Save": disabled on first press; the idempotency key prevents duplicates on a retried request.
- Network drop while saving: the text stays in the field; nothing is written to device storage; the copy suggests copying it out.
- Session expires while writing: the BFF returns 401; the composer shows "You've been signed out. Copy your writing, then sign in again." with "Copy my text", and the page does not redirect until the student chooses "Sign in".
- Print: only the open entry prints (date, mood label, title, body); the shell, sidebar, bottom nav, action buttons and toasts are hidden; long entries break across pages without clipping; works from the reading view only.
- Preview text in the list is shown only to the owner; on a shared screen the student can collapse previews with "Hide previews" (remembered per device as a boolean only, no content stored).
- The page title in the browser tab is always "Diary", never the entry title.
- Very long words or URLs wrap (`overflow-wrap: anywhere`).
- Mood tag is optional; untagged entries show no chip.
- An entry opened by id after deletion on another device shows not found.

## Copy

- h1: "Diary"
- Description: "Private to you. Parents never see what you write."
- Privacy note: "Your entries are encrypted at rest and never shown to parents. Our support team can't open them either."
- "How this works" sheet: "We encrypt each entry before it's stored, on servers in South Africa. Only your signed-in account can open it. Parents linked to you never see your diary, not even how many entries you have. If you delete an entry, it's removed for good. We don't read or analyse what you write."
- Composer: "New entry", "Edit entry", "Title (optional)", footer "Only you can read this."
- Toasts: "Entry saved", "Entry updated", "Entry deleted"
- Reader actions: "Edit", "Print", "Delete"

## Acceptance criteria

1. Given no entries, when the page loads, then the "Your diary is empty" state renders with one button that opens the composer.
2. Given the student writes a body and taps "Save", when the POST succeeds, then the reading view opens on the new entry and a toast "Entry saved" shows.
3. Given the save fails, when the error shows, then the typed text is still in the field and nothing was written to `localStorage`, `sessionStorage` or IndexedDB (asserted in Playwright).
4. Given a dirty composer, when the student navigates away, then "Leave without saving?" appears.
5. Given the student deletes an entry and confirms, when the DELETE succeeds, then the entry is gone from the list and opening its id shows not found.
6. Given the reading view, when the student prints, then the printed page contains only the date, mood, title and body (Playwright `page.pdf` text check).
7. Given a parent account linked to this student, when it calls `/wellbeing/diary` or `/wellbeing/diary/{id}`, then the API returns 403, and no Family endpoint returns diary data (integration test).
8. Given any diary page view, when the browser tab title is read, then it is "Diary" and never the entry title.
9. Given the diary route, when analytics and Sentry traffic are inspected, then no request carries the path, the title, the preview or the body.
10. Given 360px, when the composer is open, then "Save" stays visible above the on-screen keyboard and the body field has no horizontal scroll.

## Production readiness

| Area | Requirement for this page | Verified by |
|---|---|---|
| Security | Ownership enforced in BE-WEL-05 for every verb; other users' ids return 404; parent, admin and support roles have no permission that reaches diary content (permission map test) | PG-STU-DIARY-Q16 |
| Security | Encryption boundary: plaintext exists only in the API process memory during the owner's request and in the owner's browser; never in Postgres, logs, traces, Sentry, the outbox, search indexes or the Next cache; trace spans for diary endpoints carry no attributes with content | PG-STU-DIARY-Q17 |
| Security | Mutations through the BFF only (same-origin, `Origin` check, session cookie `SameSite=Lax`); no entry id or content in query strings except the opaque `?entry=<id>` Guid | PG-STU-DIARY-Q18 |
| Privacy and POPIA | Diary content is special personal information of minors: residency in af-south-1, hard delete, included in the POPIA export (BE-IDN-37) as decrypted text for the owner only, excluded from every analytics tool (path filter shared with wellbeing), Session Replay off, `no-store` everywhere | PG-STU-DIARY-Q19 |
| Performance | LCP under 2.5s mobile; JS under 150 KB gzip; composer chunk lazy; list first page server-rendered | PG-STU-DIARY-Q20 |
| Resilience | Idempotent create; `If-Match` on edit; delete treats 404 as success; failure keeps the text in memory; 401 during writing never discards text | PG-STU-DIARY-Q21 |
| Observability | Sentry on with `beforeSend` dropping request bodies, breadcrumbs of input events and the URL query on this route; no analytics events; technical metrics only (save latency, error count) | PG-STU-DIARY-Q22 |
| Accessibility | WCAG 2.2 AA; composer fields labelled; counter announced politely near the limit; reading view at a readable measure with 200% zoom support; dialogs trap focus and return it | PG-STU-DIARY-Q23 |
| Rollout | Flag `wellbeing` (shared); encryption key rotation runbook tested before the flag goes on in production | PG-STU-DIARY-Q24 |
| Monitoring | Grafana "BE-WEL-05 success rate and p95" and "decryption failures" (any decryption failure alerts immediately, it means key or data trouble); alert on POST 5xx over 1% for 10 minutes | PG-STU-DIARY-Q25 |

## Build tasks

- [ ] **PG-STU-DIARY-01** Entry list: `EntryList` with month groups, previews and first page server-rendered
- [ ] **PG-STU-DIARY-02** Composer with mood tag: `DiaryComposer` fields and mood picker from `mood-scale.ts`
- [ ] **PG-STU-DIARY-03** Reading view: `EntryReader` with plain text rendering and reading measure
- [ ] **PG-STU-DIARY-04** Edit, delete: edit entry point and `DeleteEntryDialog` (UI wiring)
- [ ] **PG-STU-DIARY-05** Privacy messaging (parents never see contents): `PrivacyNote` and the "How this works" sheet
- [ ] **PG-STU-DIARY-06** Print fix carried over: print stylesheet that prints only the open entry, with page breaks
- [ ] **PG-STU-DIARY-08** Loaders with `no-store`, zod-validated; `not-found.tsx`
- [ ] **PG-STU-DIARY-09** Create mutation through the BFF with `Idempotency-Key`, saving and failure states
- [ ] **PG-STU-DIARY-10** Edit mutation with `If-Match` and the 412 copy-and-reload flow
- [ ] **PG-STU-DIARY-11** Delete mutation (hard delete, 404 as success) and return to list
- [ ] **PG-STU-DIARY-12** `use-unsaved-guard.ts` for browser and in-app navigation
- [ ] **PG-STU-DIARY-13** 401-while-writing handling with "Copy my text"
- [ ] **PG-STU-DIARY-14** `ShowOlderEntries` infinite list with `gcTime` 0
- [ ] **PG-STU-DIARY-15** "Hide previews" toggle (boolean only on device)
- [ ] **PG-STU-DIARY-16** Character limit counter and too-long state
- [ ] **PG-STU-DIARY-17** Desktop two-pane layout with inline composer
- [ ] **PG-STU-DIARY-18** Static "Diary" metadata title and `Cache-Control: private, no-store` headers on the route
- [ ] **PG-STU-DIARY-19** Writing prompts as chips above the body (old app): "What went well?", "What's stressing me?", "What am I grateful for?", "What's one small win?"; tapping inserts the prompt as the first line, nothing is sent anywhere
- [ ] **PG-STU-DIARY-20** Entry date field defaulting to today, editable to a past date (old `EntryDate`), so a student can write up yesterday; the list groups by entry date, not created date

## Quality tasks

- [ ] **PG-STU-DIARY-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`), `not-found.tsx` where the route takes an id
- [ ] **PG-STU-DIARY-Q02** Server loader in `src/features/<domain>/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-STU-DIARY-Q03** Client mutations (if any) through `/api/bff` with generated TanStack hooks; optimistic or pending states
- [ ] **PG-STU-DIARY-Q04** Empty state with one clear next action
- [ ] **PG-STU-DIARY-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-STU-DIARY-Q06** Forbidden state, and upgrade state if the page is entitlement-gated
- [ ] **PG-STU-DIARY-Q07** Stage-aware wording checked (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-STU-DIARY-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters); tables collapse to cards
- [ ] **PG-STU-DIARY-Q09** Layout at 1440px
- [ ] **PG-STU-DIARY-Q10** Light and dark both correct (OS-driven)
- [ ] **PG-STU-DIARY-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-STU-DIARY-Q12** axe: zero violations in light and dark
- [ ] **PG-STU-DIARY-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, headings in order
- [ ] **PG-STU-DIARY-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-STU-DIARY-Q15** `generateMetadata` title; nav entry active state correct

Production readiness

- [ ] **PG-STU-DIARY-Q16** Integration tests: another student and a linked parent get 404 or 403 on every diary verb; permission map test that no non-student role holds a diary permission
- [ ] **PG-STU-DIARY-Q17** Encryption boundary review: DB row holds ciphertext only (integration test reads the raw column); log, trace and Sentry payloads checked with a canary string
- [ ] **PG-STU-DIARY-Q18** BFF cross-origin write rejected; no content in query strings
- [ ] **PG-STU-DIARY-Q19** POPIA checks: export includes entries for the owner, delete removes ciphertext, analytics path filter and Replay off verified
- [ ] **PG-STU-DIARY-Q20** Lighthouse CI mobile budget; composer chunk lazy
- [ ] **PG-STU-DIARY-Q21** Failure tests: save 500 keeps text with no device storage writes; double save creates one entry; 401 while writing keeps text
- [ ] **PG-STU-DIARY-Q22** Sentry `beforeSend` scrubbing test with a canary string in the body
- [ ] **PG-STU-DIARY-Q23** Screen reader and zoom pass on composer and reader
- [ ] **PG-STU-DIARY-Q24** Key rotation runbook rehearsed in staging before enabling the flag in production
- [ ] **PG-STU-DIARY-Q25** Grafana panels, decryption failure alert and POST 5xx alert

## Tests

Unit (Vitest):

- `diary-composer.test.tsx`: "save disabled while pending", "counter appears after 9000 characters", "never writes to localStorage or sessionStorage".
- `use-unsaved-guard.test.ts`: "prompts when dirty", "does not prompt after save".
- `diary-entry-reader.test.tsx`: "renders body as plain text without HTML", "shows edited line only when updated".

Playwright (`web/e2e/student/diary.spec.ts`):

- "diary: write, save and read an entry"
- "diary: save failure keeps the text and stores nothing on the device"
- "diary: leaving with unsaved text asks first"
- "diary: edit conflict offers copy and reload"
- "diary: delete is permanent and the id shows not found"
- "diary: print shows only the entry"
- "diary: tab title is always Diary"
- "diary: no analytics or Sentry request carries diary content"
- "diary: axe clean light and dark at 360 and 1440"

## Open questions

- Decided (36): the copy says "encrypted at rest and never shown to parents" until the key design is built; never "end-to-end" and never "only you can read them".
- Decided (DECISIONS E): diary entries and check-in notes are hard-deleted, a POPIA exception to the soft-delete default.
- Should the list show previews at all? They are useful but visible on a shared screen; the "Hide previews" toggle is the compromise here.
- "Print fix carried over" is read as "printing an entry prints only that entry". Commit `3d4181c` fixed printing for practice papers and wired the diary save; if a different fix was meant, update PG-STU-DIARY-06.
- Decided (7): no diary NLP. BE-WEL-04 carries no sentiment, theme or follow-up columns and MIG does not migrate them.
- Edit and delete are new in the rebuild (the old API had only list and create).
