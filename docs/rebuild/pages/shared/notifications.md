# Notifications

| | |
|---|---|
| ID | `PG-CMN-NOTIF` |
| Route | `/dashboard/notifications` (student), `/parent/notifications` (parent), `/admin/notifications` (admin); the bell sheet in the top bar everywhere (SHL-07) |
| Phase | 2 |
| Roles | student / parent / admin |
| Stages | high school, university (page is stage-neutral; notification text is written per stage by the API) |
| Entitlement | free |
| Depends on | BE-NTF-05, BE-NTF-07, BE-NTF-08, BE-NTF-10, BE-IDN-28; FE-24, FE-25, FE-63; UI-10, UI-11, UI-22; SHL-06, SHL-07; permission `notifications.read` (exists in `Permissions.cs`) |
| Old app reference | `43f9faa:web/src/app/(app)/dashboard/notifications/page.tsx` (flat list of the latest 50, mark read on view, "Mark all read" disabled when nothing is unread, "You're all caught up"), `43f9faa:api/Controllers/NotificationsController.cs` (`GET /api/notifications` capped at 50, separate `GET unread-count` for the bell, `PATCH {id}/read` returning 404 for ids the user does not own, `POST mark-all-read` returning the count marked, partial-update preferences) |
| Status | Not started (0 of 43 tasks) |

## Purpose

One place to see everything Aptiverse has told you: deadlines, results, invites, payment and account messages. Each item says what happened, when, and takes you straight to the thing it is about. This page also owns the notification item component and type registry that the bell sheet (SHL-07) reuses, and it creates the shared date formatter `web/src/lib/format/date.ts` that later pages depend on.

## User stories

- As a student, I want to see what needs my attention today, so that I do not miss a deadline or a result.
- As a student, I want to tap a notification and land on the assessment, test or goal it is about.
- As a parent, I want to see invites, celebrations and billing messages for my family in one list.
- As any user, I want to mark one item or everything as read, so the unread count means something.
- As any user, I want older notifications to load only when I ask, so the page stays quick on mobile data.
- As an admin, I want my own account notifications (security, support) without seeing anyone else's.

## Layout

### Mobile (360px)

1. `PageHeader`: `h1` "Notifications", description "Deadlines, results and messages, newest first." Action on the right: "Mark all read" text button (hidden when unread count is 0).
2. Filter tabs (`Tabs`, full width, two tabs): "All" and "Unread (n)". Tab state lives in the URL as `?filter=unread`.
3. Day groups, top to bottom. Each group has an `h2` day heading ("Today", "Yesterday", then "Mon 13 Oct", then "13 Oct 2025" for a previous year) and a list of `NotificationItem` rows.
4. `NotificationItem` row (min height 64px, full-width tap target, 16px gutters): type icon in a 36px tinted circle on the left, then title (one line, truncated), body (two lines, clamped), time on the right ("14:05"). Unread rows show a 8px dot plus visually hidden text "Unread" and a slightly stronger surface.
5. "Show older" button (full width, 44px) after the last group when `nextCursor` exists. Replaced by "That is everything." when the end is reached.

### Desktop (1440px)

- `PageShell` content column at `max-w-3xl`, centred inside the app shell (sidebar on the left from SHL-04).
- Header row: title and description on the left, "Mark all read" as an outline button on the right.
- Tabs sit under the header, left aligned, auto width.
- Rows gain a hover surface and show the full body (no clamp beyond three lines). Time shows as "14:05" with a tooltip of the full date and time ("Sun 19 Oct 2026, 14:05").
- No second column. The bell sheet (SHL-07) shows the latest 10 items with "See all" linking here.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Route page (student) | `web/src/app/(app)/dashboard/notifications/page.tsx` | server | Reads session, renders `NotificationsView` inside `<Suspense>`; `generateMetadata` title "Notifications" |
| Route page (parent) | `web/src/app/(app)/parent/notifications/page.tsx` | server | Same view; alias so the shell stays in the parent area |
| Route page (admin) | `web/src/app/(app)/admin/notifications/page.tsx` | server | Same view |
| Loading | `web/src/app/(app)/{dashboard,parent,admin}/notifications/loading.tsx` | server | Header skeleton plus 6 row skeletons (`Skeleton`) |
| Error | `web/src/app/(app)/{dashboard,parent,admin}/notifications/error.tsx` | client | `PageState` error with retry (`{ error, retry }`), reports to Sentry with tag `page: PG-CMN-NOTIF` |
| NotificationsView | `web/src/features/notifications/components/notifications-view.tsx` | server | Fetches first page, passes it as `initialData` to the client list |
| NotificationList | `web/src/features/notifications/components/notification-list.tsx` | client | TanStack `useInfiniteQuery` seeded with server data; grouping, filter, show older, mark all read. Reused by the bell sheet with `limit={10}` and `compact` |
| NotificationItem | `web/src/features/notifications/components/notification-item.tsx` | client | Link row; marks read on activation; icon from the registry |
| MarkAllReadButton | `web/src/features/notifications/components/mark-all-read-button.tsx` | client | Optimistic, disabled while pending |
| Notification type registry | `web/src/features/notifications/lib/notification-types.ts` | shared | Type to Lucide icon, colour zone token, accessible type label; unknown types fall back to `Bell` |
| groupByDay | `web/src/features/notifications/lib/group-by-day.ts` | shared | Pure; groups by Africa/Johannesburg calendar day |
| safeDeepLink | `web/src/features/notifications/lib/safe-deep-link.ts` | shared | Allows only same-origin relative paths starting with a single `/` |
| Server loader | `web/src/features/notifications/server/get-notifications.ts` | server | Generated client, zod parse, React `cache()`; no shared `"use cache"` (per-user data) |
| Query keys | `web/src/features/notifications/lib/query-keys.ts` | shared | `notifications.list(filter)`, `notifications.unreadCount()`; shared with the bell so counts stay in sync |
| Date formatter | `web/src/lib/format/date.ts` | shared | Created here: `dayKey`, `formatDayHeading`, `formatTime`, `formatDate`, `formatDateTime`, all in Africa/Johannesburg |
| Kit used | `components/shell/page-shell.tsx`, `page-header.tsx`, `page-state.tsx`, `page-states.tsx` (`PageEmpty`); `components/ui/tabs.tsx`, `button.tsx`, `tooltip.tsx`, `skeleton.tsx`, `sonner.tsx` | | |

Type registry (initial set, extended as modules add types; the API owns the list):

| Type | Lucide icon | Zone | Accessible label |
|---|---|---|---|
| `assessment_due` | `CalendarClock` | terracotta | Deadline |
| `assessment_graded` | `ClipboardCheck` | forest | Result |
| `practice_ready` | `FileCheck2` | neutral | Practice test ready |
| `practice_graded` | `ClipboardCheck` | forest | Practice result |
| `goal_progress` | `Flag` | neutral | Goal update |
| `achievement_earned` | `Award` | amber | Achievement |
| `wellbeing_checkin` | `HeartHandshake` | magenta | Check-in reminder |
| `family_invite` | `UserPlus` | neutral | Family invite |
| `family_link_changed` | `Users` | neutral | Family link |
| `celebration` | `PartyPopper` | amber | Celebration (parent) |
| `billing_receipt` | `Receipt` | neutral | Receipt |
| `billing_payment_failed` | `CreditCard` | terracotta | Payment |
| `billing_plan_changed` | `CreditCard` | neutral | Plan change |
| `affiliate_commission` | `Gift` | neutral | Referral earnings |
| `support_ticket_reply` | `LifeBuoy` | neutral | Support reply |
| `security_new_session` | `ShieldCheck` | neutral | Security |
| `account_export_ready` | `Download` | neutral | Data export |
| unknown | `Bell` | neutral | Notification |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache |
|---|---|---|---|
| `/notifications?limit=20&cursor=&unreadOnly=` (BE-NTF-07) | GET | `items[]: { id, type, title, body, deepLink \| null, createdAt, readAt \| null }`, `unreadCount`, `nextCursor \| null` | Per user, none shared. Server: React `cache()` per request. Client: TanStack key `notifications.list(filter)`, `staleTime` 30 s, refetch on window focus |
| `/me` (BE-IDN-28) | GET | `role`, `permissions` (needs `notifications.read`) | Session, already loaded by the shell |

### Mutations

| Endpoint (BE ID) | Method | Request | Client behaviour |
|---|---|---|---|
| `/notifications/{id}/read` (BE-NTF-08) | POST | none | Optimistic: set `readAt` now, decrement `unreadCount` in both `list` and `unreadCount` keys. On failure: roll back silently and log; no toast (navigation already happened) |
| `/notifications/read-all` (BE-NTF-08) | POST | `{ upTo: createdAt of newest loaded item }` (proposed field so items that arrive during the request stay unread) | Optimistic: mark every loaded item read, set count to 0. On failure: roll back, toast "Could not mark everything as read. Try again." |

All mutations go through `/api/bff` with the generated hooks. Both endpoints are idempotent on the server, so a double click or retry is harmless.

Additions from the 43f9faa review:

- A lightweight unread count read for the bell, separate from the list so the badge can refresh more often without re-sending the list (old `GET /api/notifications/unread-count`). Proposed as `GET /notifications/unread-count` on BE-NTF-07, or the bell reads `unreadCount` from a `limit=0` list call. (PG-CMN-NOTIF-15)
- Mark all read returns `marked` (count); the page uses it for the toast and to settle the optimistic count. (PG-CMN-NOTIF-16)

## States

| State | Trigger | Exact copy | Action |
|---|---|---|---|
| Loading | First render, Suspense fallback | Visually hidden "Loading notifications" | None |
| Empty (All) | No items at all | Title "You are all caught up". Body "Nothing new. We will let you know when a deadline, result or message needs you." | None |
| Empty (Unread) | `filter=unread` and no unread items | Title "No unread notifications". Body "Everything here has been read." | Button "Show all" (switches to All) |
| Error | Loader throws (network, 5xx, zod parse failure) | Title "We could not load your notifications". Body "Check your connection and try again. If it keeps happening, contact support from Help." | Button "Try again" (`retry`) |
| Load older failed | `fetchNextPage` fails | Inline under the list: "Could not load older notifications." | Button "Try again" |
| Mark all failed | `read-all` fails | Toast: "Could not mark everything as read. Try again." | Toast action "Try again" |
| Forbidden | Session lacks `notifications.read` (API 403) | Title "Notifications are not available for this account". Body "If you think this is wrong, contact support from Help." | Link "Go to Help" |
| Upgrade | Not applicable (free) | | |
| No evidence | Not applicable | | |
| Populated | One or more items | Day headings and rows as in Layout. End of list: "That is everything." | "Show older" while `nextCursor` exists |
| Blocked deep link | `deepLink` fails `safeDeepLink` | Row renders without a link; tooltip and visually hidden text "This notification has no page to open." | Row still marks read on activation |

## Stage variants

- The page has no stage-specific UI. Notification titles and bodies are produced by the API from per-stage templates (BE-NTF-03, BE-NTF-10): high school wording uses "SBA task", "Grade 11", "term mark"; university wording uses "assignment", "course", "semester". The page renders them as given.
- Quality check Q07 confirms with seeded data for one high school and one university student that no row mixes vocabularies.
- Parents see notifications about each child with that child's first name in the title ("Thandi submitted her History SBA task"); the API, not the page, chooses the wording per child's stage.

## Interactions and edge cases

- Activating an unread row marks it read (optimistic) and navigates to `deepLink`. Activating a read row only navigates. Middle click or Cmd/Ctrl click opens a new tab and still marks read.
- A row with no `deepLink` (for example a general announcement) is a `button` that only marks read; it is never a dead link.
- `safeDeepLink` rejects absolute URLs, protocol-relative `//host`, `javascript:` and any path containing `\`. Rejected links are reported once per type to Sentry as a warning (no payload text).
- A deep link to a page the role cannot open (stale link after a role or link change, for example a parent unlinked from a child) lands on that page's own forbidden state; this page does not pre-check.
- Mark all read sends `upTo` so a notification that arrives mid-request is not silently marked read. After success the unread tab shows the Unread empty state.
- New notifications arriving while the page is open: the list refetches on window focus and when the bell count changes (shared query key). No live socket in v1. New items appear at the top of "Today" without moving keyboard focus.
- Day grouping uses Africa/Johannesburg, so an item at 23:30 UTC on 18 Oct sits under 19 Oct. Unit-tested at the midnight boundary.
- Pagination is a "Show older" button, never infinite scroll, so keyboard and screen reader users can reach the footer. Focus moves to the first newly loaded row.
- Very long titles truncate with an ellipsis and the full text is in the accessible name; bodies clamp to two lines on mobile.
- Soft-deleted or expired notifications are never returned by the API; the page does not show tombstones.
- Signing out in another tab: the next fetch gets 401, the BFF refresh fails, and the app redirects to `/login` (FE-23).
- Unknown `type` from a newer API renders with the `Bell` fallback, never crashes.
- Unread count refresh: 60 s while the tab is visible, plus on window focus and after any mark-read mutation; paused when hidden. The list itself refetches on focus only. (PG-CMN-NOTIF-15)
- "Mark all read" is disabled (not hidden) while the unread count is zero on the All tab, and hidden when the whole list is empty, so the header does not jump. (PG-CMN-NOTIF-16)

## Copy

| Key | Text |
|---|---|
| Title | Notifications |
| Description | Deadlines, results and messages, newest first. |
| Tab all | All |
| Tab unread | Unread ({count}) |
| Mark all | Mark all read |
| Mark all pending | Marking as read |
| Day headings | Today / Yesterday / Mon 13 Oct / 13 Oct 2025 |
| Unread marker (screen reader) | Unread |
| Show older | Show older |
| End of list | That is everything. |
| Empty all title | You are all caught up |
| Empty all body | Nothing new. We will let you know when a deadline, result or message needs you. |
| Empty unread title | No unread notifications |
| Empty unread body | Everything here has been read. |
| Error title | We could not load your notifications |
| Error body | Check your connection and try again. If it keeps happening, contact support from Help. |
| Mark all failed | Could not mark everything as read. Try again. |
| Bell sheet footer | See all notifications |

- Mark all toast: "Marked {marked} as read." (singular: "Marked 1 as read.")

## Acceptance criteria

- **AC-01** Given a student with 3 unread and 5 read notifications, when they open `/dashboard/notifications`, then they see 8 rows grouped under day headings, newest first, and the Unread tab reads "Unread (3)".
- **AC-02** Given an unread row with a deep link to `/dashboard/assessments/{id}`, when the student taps it, then the browser navigates there and returning to the list shows the row as read and the count as 2.
- **AC-03** Given unread notifications, when the user activates "Mark all read", then every loaded row shows as read immediately and the bell count shows no badge.
- **AC-04** Given the read-all request fails, when the response arrives, then the rows return to unread and the toast "Could not mark everything as read. Try again." appears.
- **AC-05** Given 45 notifications, when the page loads, then 20 rows show with "Show older"; after two activations all 45 show and "That is everything." appears.
- **AC-06** Given a notification created at 22:30 UTC on 18 Oct 2026, when it is grouped, then it appears under the 19 Oct heading (00:30 SAST).
- **AC-07** Given a notification whose `deepLink` is `https://evil.example`, when it renders, then it is not a link and activating it only marks it read.
- **AC-08** Given a parent signed in, when they open the bell and choose "See all notifications", then they land on `/parent/notifications` inside the parent shell.
- **AC-09** Given a user with no notifications, when they open the page, then they see "You are all caught up" and no "Mark all read" button.
- **AC-10** Given the API returns 500, when the page loads, then the error state shows "We could not load your notifications" with "Try again", and activating it refetches.
- **AC-11** Given user A, when a request marks user B's notification id read through the BFF, then the API returns 404 and B's notification is unchanged.
- **AC-12** Given the page is open and visible, when a new notification arrives, then the unread count updates within 60 s without reloading the list.
- **AC-13** Given 3 unread notifications, when the user presses "Mark all read", then the toast reads "Marked 3 as read." and the button becomes disabled.

## Production readiness

### Security

- [ ] Notifications are read and marked only for the caller: ownership enforced in the BE-NTF-07 and BE-NTF-08 handlers, proven by a cross-user integration test and a Playwright check (Q16).
- [ ] Deep links are same-origin relative paths only; `safeDeepLink` is unit tested against every bypass form (Q17).
- [ ] Mutations go through `/api/bff`, which enforces same-origin and the session cookie (FE-25), so no CSRF from other sites; checked in Q16.
- [ ] No notification text, email or child name is written to logs, Sentry breadcrumbs or analytics properties (Q18).

### Privacy and POPIA

- [ ] Per-type payload review: parent-facing types never carry wellbeing scores, mood values or any diary text; security types show device and approximate area only, never full IP (Q26).
- [ ] Notification rows for minors carry no marketing content; marketing never uses this channel (Q26).

### Performance

- [ ] Route JS under 150 KB gzip; the list island is the only client code (Q19).
- [ ] LCP under 2.5 s on Lighthouse mobile with 20 seeded rows; first page server-rendered so rows paint without waiting on client JS (Q19).
- [ ] Cache: no shared cache for per-user rows; client `staleTime` 30 s with focus refetch keeps API load low (Q19).

### Resilience

- [ ] Mark read and mark all read are idempotent and optimistic with rollback; double click sends at most one request while pending (Q20).
- [ ] API outage shows the error state with retry; the bell degrades to no badge instead of an error (Q20).

### Observability

- [ ] Sentry error boundary on each route alias with tags `{ page: "PG-CMN-NOTIF", role }`; `traceparent` forwarded by `fetcher.ts` so a web error links to the API trace (Q22).
- [ ] Analytics events (consent-gated, no content): `notif_page_viewed { unreadCount bucket }`, `notif_opened { type }`, `notif_mark_all_read`, `notif_load_older`, `notif_deeplink_blocked { type }` (Q21).

### Accessibility (WCAG 2.2 AA)

- [ ] Unread is never colour alone: dot plus hidden "Unread" text (1.4.1); count changes announced through a polite live region (Q23).
- [ ] Focus after "Mark all read" stays on the button; after "Show older" moves to the first new row; sticky header never hides the focused row (2.4.11) (Q23).

### Rollout

- [ ] Release with Phase 2 behind `flags.notifications` (nav entries and bell hidden when off); staging soak for 3 days with seeded traffic; rollback by turning the flag off, which leaves data untouched (Q24).

### Monitoring and alerts

- [ ] Alerts: `GET /notifications` 5xx rate above 2% for 10 minutes; p95 above 500 ms for 15 minutes; `read-all` failure rate above 5% for 15 minutes (Q25).

## Build tasks

- [ ] **PG-CMN-NOTIF-01** Grouped list with per-type icons and deep links (`NotificationsView` and `NotificationList` render day groups from the server-loaded first page)
- [ ] **PG-CMN-NOTIF-02** Mark read, mark all read (single-item read on activation; `MarkAllReadButton` with `upTo`)
- [ ] **PG-CMN-NOTIF-03** Use the shared date helpers from `web/src/lib/format/date.ts` (owned by FE-82: `dayKey`, `formatDayHeading`, `formatTime`, `formatDate`, `formatDateTime`, Africa/Johannesburg) for grouping and timestamps; extend FE-82 rather than adding local helpers
- [ ] **PG-CMN-NOTIF-04** Notification type registry `features/notifications/lib/notification-types.ts` (icon, zone token, accessible label, `Bell` fallback)
- [ ] **PG-CMN-NOTIF-05** `NotificationItem` component (link or button, unread dot plus hidden text, clamped body, time with full-date tooltip)
- [ ] **PG-CMN-NOTIF-06** `groupByDay` pure function with midnight-boundary tests
- [ ] **PG-CMN-NOTIF-07** `safeDeepLink` sanitiser and blocked-link rendering
- [ ] **PG-CMN-NOTIF-08** Server loader `features/notifications/server/get-notifications.ts` (generated client, zod parse, React `cache()`) and query keys file
- [ ] **PG-CMN-NOTIF-09** All and Unread tabs bound to `?filter=unread`, with the Unread empty state and "Show all"
- [ ] **PG-CMN-NOTIF-10** "Show older" cursor pagination with `useInfiniteQuery`, focus to first new row, end-of-list text, inline retry
- [ ] **PG-CMN-NOTIF-11** Optimistic cache updates shared with the bell (`unreadCount` key) and rollback on failure
- [ ] **PG-CMN-NOTIF-12** Route aliases `/parent/notifications` and `/admin/notifications` rendering the same view
- [ ] **PG-CMN-NOTIF-13** Add a Notifications entry to the parent and admin Account sections in `nav-config.ts` (student entry exists)
- [ ] **PG-CMN-NOTIF-14** Export a compact `NotificationList` (latest 10, "See all notifications" link resolved per role) for the SHL-07 bell sheet
- [ ] **PG-CMN-NOTIF-15** Unread count query (proposed `GET /notifications/unread-count`) with 60 s visible-tab refetch, focus refetch and the shared `notifications.unreadCount()` key
- [ ] **PG-CMN-NOTIF-16** Mark all read: disabled at zero unread, toast with the returned `marked` count

## Quality tasks

- [ ] **PG-CMN-NOTIF-Q01** Route files: `page.tsx` (Server Component), `loading.tsx` (skeleton), `error.tsx` (retry via `PageState`) for each role alias; no `not-found.tsx` needed (no id in the route)
- [ ] **PG-CMN-NOTIF-Q02** Server loader in `src/features/notifications/server/` using the generated client, validated with the generated zod schema
- [ ] **PG-CMN-NOTIF-Q03** Client mutations through `/api/bff` with generated TanStack hooks; optimistic updates with rollback
- [ ] **PG-CMN-NOTIF-Q04** Empty state with one clear next action (All: none needed; Unread: "Show all")
- [ ] **PG-CMN-NOTIF-Q05** Error state copy: what went wrong and how to fix it
- [ ] **PG-CMN-NOTIF-Q06** Forbidden state for a session without `notifications.read`; no upgrade state (free)
- [ ] **PG-CMN-NOTIF-Q07** Stage-aware wording checked with seeded high school and university notifications (no SBA, APS, matric or Grade wording for university students; no course or GPA wording for high-school students)
- [ ] **PG-CMN-NOTIF-Q08** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters)
- [ ] **PG-CMN-NOTIF-Q09** Layout at 1440px
- [ ] **PG-CMN-NOTIF-Q10** Light and dark both correct (OS-driven), including zone tints on icons
- [ ] **PG-CMN-NOTIF-Q11** Copy review: no emojis, no em or en dashes, plain and specific
- [ ] **PG-CMN-NOTIF-Q12** axe: zero violations in light and dark
- [ ] **PG-CMN-NOTIF-Q13** Keyboard pass: visible focus, real buttons and links, one `h1`, day headings as `h2`
- [ ] **PG-CMN-NOTIF-Q14** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome, covering populated, empty and error states
- [ ] **PG-CMN-NOTIF-Q15** `generateMetadata` title; nav entry active state correct for all three aliases
- [ ] **PG-CMN-NOTIF-Q16** Security: cross-user mark-read returns 404 (integration test on BE-NTF-08 plus Playwright through the BFF); BFF rejects a cross-origin POST
- [ ] **PG-CMN-NOTIF-Q17** `safeDeepLink` bypass tests (absolute, `//host`, `javascript:`, backslash, encoded slashes)
- [ ] **PG-CMN-NOTIF-Q18** Logging review: Sentry `beforeSend` and breadcrumbs scrub notification title and body; analytics carry type only
- [ ] **PG-CMN-NOTIF-Q19** Performance: Lighthouse mobile LCP under 2.5 s with 20 rows, route JS under 150 KB gzip, CLS under 0.1 when older items load
- [ ] **PG-CMN-NOTIF-Q20** Resilience: double click on "Mark all read" sends one request; offline mark read rolls back; bell hides badge when the count request fails
- [ ] **PG-CMN-NOTIF-Q21** Analytics events `notif_page_viewed`, `notif_opened`, `notif_mark_all_read`, `notif_load_older`, `notif_deeplink_blocked`, consent-gated, no content
- [ ] **PG-CMN-NOTIF-Q22** Sentry boundary tags and trace propagation verified (a forced API 500 shows the same trace id in web and API)
- [ ] **PG-CMN-NOTIF-Q23** WCAG 2.2 AA pass: unread not colour alone, polite live region for count, focus not obscured, focus placement after mark all and show older
- [ ] **PG-CMN-NOTIF-Q24** Rollout: `flags.notifications` gate on nav entries, bell and routes; staging soak; rollback steps written in the PR
- [ ] **PG-CMN-NOTIF-Q25** Monitoring: alerts for list 5xx rate, list p95 and read-all failure rate wired to the ops channel
- [ ] **PG-CMN-NOTIF-Q26** Privacy review of every type's payload with the API owner (no wellbeing values or diary text for parents, no full IPs, no marketing to minors)
- [ ] **PG-CMN-NOTIF-Q27** Load check: unread count polling stays within the `default` rate-limit group at 3 open tabs per user and stops when hidden (Playwright network assertion)

## Tests

### Unit (Vitest)

- `lib/format/date.test.ts`: `dayKey` at 21:59 and 22:00 UTC; `formatDayHeading` returns Today, Yesterday, weekday form and previous-year form; `formatTime` 24-hour.
- `features/notifications/lib/group-by-day.test.ts`: groups in order, newest first; empty input; midnight SAST boundary.
- `features/notifications/lib/safe-deep-link.test.ts`: allows `/dashboard/goals/1`; rejects `https://x`, `//x`, `javascript:alert(1)`, `/\x`, `/%2F%2Fx`.
- `features/notifications/lib/notification-types.test.ts`: every known type maps to a Lucide icon; unknown maps to `Bell`.
- `features/notifications/components/notification-item.test.tsx`: unread shows hidden "Unread"; no deep link renders a button; activation calls mark read.
- `features/notifications/components/mark-all-read-button.test.tsx`: optimistic update, rollback and toast on failure, disabled while pending.

### Playwright

- `notifications.spec.ts` "student sees grouped notifications and unread count" (AC-01).
- "tapping an unread notification opens its page and marks it read" (AC-02).
- "mark all read clears the badge" (AC-03) and "mark all read rolls back on failure" (AC-04, route mocked to 500).
- "show older loads the next page and ends with that is everything" (AC-05).
- "unsafe deep link is not clickable" (AC-07).
- "parent see all opens parent notifications" (AC-08).
- "empty and error states" (AC-09, AC-10).
- "cannot mark another user's notification" (AC-11).
- axe in light and dark on Pixel 7, iPhone 14 and desktop Chrome.
- Unit `use-unread-count.test.ts`: 60 s interval when visible, paused when hidden, refetch on focus.
- Playwright `mark all read toast shows count`, `mark all read disabled with nothing unread`.

## Open questions

- `read-all` needs an `upTo` field to avoid marking items that arrive mid-request; add to BE-NTF-08 or accept the race.
- Should the parent and admin navs show Notifications as a sidebar entry (PG-CMN-NOTIF-13) or rely on the bell only? Recommendation: both, for consistent help and findability.
- Retention: how long are notifications kept (proposal: 180 days, then purged)? Affects "That is everything."
- Decided (66): typed config flags in `web/src/lib/flags.ts` (FE-84), no third-party flag service. `flags.notifications` lives there.
