# App shell

| | |
|---|---|
| ID range | `SHL-01` to `SHL-10`, `SHL-11` to `SHL-28` |
| Phase | 3 (SHL-07, SHL-08 and SHL-17 wait on their backend slices) |
| Depends on | `FE-24`, `FE-27`, `FE-30` to `FE-37`, `UI-07`, `UI-09`, `UI-20`, `UI-21`, `UI-34`; backend slices `GET /navigation`, `GET /search`, notifications list and unread count, `/me` |
| Code path | `web/src/components/shell/`, `web/src/app/(marketing)/layout.tsx`, `web/src/app/(auth)/layout.tsx`, `web/src/app/(app)/layout.tsx` |
| Status | 28 tasks: 0 done, 6 partial, 0 unverified, 22 not started |

## Purpose

The three frames every page sits in: the public shell (marketing), the auth shell (sign in, register, verify, reset) and the signed-in app shell (desktop sidebar, mobile bottom navigation, top bar, notifications, search, account menu). Server Components by default, client code only on interactive leaves.

## Navigation source

Navigation is the static per-role config in `web/src/components/shell/nav-config.ts` (`navByRole`, `getNavigation(user)`) until the API serves `GET /navigation`. The data model in `nav.ts` already uses icon names (strings), permission and entitlement keys, so the switch is a data-source swap: `nav-schema.ts` (zod) validates the API payload and `nav-icons.ts` resolves names to Lucide components (UI-34). Backend dependency: the `GET /navigation` slice (filtered by the caller's permissions and entitlements) in the backend docs; SHL-17 is blocked until it exists.

The sign-in redirect parameter is `next` (`/login?next=<path>`), matching `src/proxy.ts` and `frontend/auth-bff.md`; shell links and sign-out never use another parameter name.

Stages are high school and university only (no primary-school stage). Stage-dependent wording and items use the helper in `frontend/components/stage-gate.md` (UI-33).

## Scope

- Existing: `site-header.tsx`, `site-footer.tsx`, `wordmark.tsx`, `page-container.tsx`, `page-state.tsx` (committed); `app-sidebar.tsx`, `nav.ts`, `nav-config.ts`, `nav-icons.ts`, `nav-link.tsx`, `nav-schema.ts`, `page-error.tsx`, `page-header.tsx`, `page-shell.tsx`, `page-states.tsx` (uncommitted WIP).
- New: `public-mobile-nav.tsx`, `auth-shell.tsx`, `app-shell.tsx`, `bottom-nav.tsx`, `more-sheet.tsx`, `top-bar.tsx`, `notifications-bell.tsx`, `command-palette.tsx`, `account-menu.tsx`, `impersonation-banner.tsx`, `system-banner.tsx`, `skip-link.tsx`.
- Outputs: layouts for the three route groups; landmark structure `header`, `nav` (labelled), `main#main`, `footer`; one `h1` per page supplied by `PageHeader`.

## Tasks

### Public shell

- [ ] **SHL-01** Public shell: sticky top nav, mobile drawer, footer (real pages only) *(partial: `site-header.tsx` with a Help link only, not sticky; `site-footer.tsx`; skip link in `(marketing)/layout.tsx`; no mobile drawer)*
- [ ] **SHL-11** `public-mobile-nav.tsx`: a Sheet from the right below `sm`, links only to marketing pages that exist (from a typed list, not hard-coded per layout), 44px targets, closes on navigation, focus returns to the trigger. Split from SHL-01.
- [ ] **SHL-12** Footer content: legal links (privacy, terms), POPIA information officer contact, accessibility statement (FE-150), help and contact; no links to unbuilt pages. Split from SHL-01.

### Auth shell

- [ ] **SHL-02** Auth shell: split layout desktop, single column mobile *(partial: `(auth)/layout.tsx` is a single centred column with the wordmark; no desktop split)*
- [ ] **SHL-13** `auth-shell.tsx`: from `lg` a two-column layout with a `brand-surface` panel (static, no stock imagery or invented testimonials) and the form column; `next` is preserved across links between login, register and reset. Split from SHL-02.

### App shell frame

- [ ] **SHL-03** App shell layout as Server Component; decision recorded here: the practice attempt runs in a separate `(focus)` route group without the shell (SHL-28), not by setting `inert` on the shell *(partial: `(app)/layout.tsx` is a Server Component but renders the marketing `SiteHeader`; no sidebar, no bottom nav)*
- [ ] **SHL-28** Focus mode for the practice runner, decided under SHL-03: the attempt route lives in its own route group without the shell, `app/(focus)/practice/attempts/[id]/` with a minimal layout (wordmark, timer slot, exit with confirm), rather than toggling `inert` on the shell, because a separate group sends no shell JS or navigation to the attempt, keeps focus order trivially correct and cannot be undone by a client bug. The `(focus)` group still sits behind `proxy.ts` and the session check (SHL-15). Record the decision in SHL-03 and in `web/CLAUDE.md`; Playwright asserts no nav landmark and no notifications bell during an attempt, and that the tutor entry point is absent. Depends on the practice pages in `pages/student/`.
- [ ] **SHL-14** Consolidate page states: `page-state.tsx` (committed, referenced by `web/CLAUDE.md`) and `page-states.tsx` plus `page-error.tsx` (WIP) become one module; update imports in `app/error.tsx`, `app/not-found.tsx`, the help route and `web/CLAUDE.md`. Split from SHL-03.
- [ ] **SHL-15** `(app)/layout.tsx` reads `getSessionUser()` inside `<Suspense>` and calls `redirect("/login?next=...")` when null, as defence in depth behind `proxy.ts` (FE-27); passes the user to `app-shell.tsx`. Split from SHL-03.

### Navigation

- [ ] **SHL-04** Desktop sidebar from `GET /navigation` *(partial: static `nav-config.ts` with `filterNavigation` by permission and entitlement, `nav-schema.ts` ready for the API payload, `AppSidebarNav` in `app-sidebar.tsx` (all uncommitted WIP); not wired into the layout; `GET /navigation` does not exist yet)*
- [ ] **SHL-16** Wire `AppSidebarNav` into `app-shell.tsx` from `lg` up: sections with headings, active state from `isActiveHref`, collapsible to icons at `lg` and full at `xl`, `aria-current="page"` on the active link. Split from SHL-04.
- [ ] **SHL-17** Swap `getNavigation(user)` to call `GET /navigation` on the server with `"use cache"` and a per-user cache tag, validate with `nav-schema.ts`, and fall back to the static config only in development; production shows the error state with retry if the call fails. Split from SHL-04. Blocked by the backend `GET /navigation` slice.
- [ ] **SHL-05** Mobile bottom nav (4 to 5 items) plus "More" sheet *(partial: `bottomNavModel()` in `nav.ts` picks up to `MAX_BOTTOM_ITEMS = 5`; no component)*
- [ ] **SHL-18** `bottom-nav.tsx`: fixed bar below `lg`, items from `bottomNavModel`, icon plus label, 44px targets, `env(safe-area-inset-bottom)` padding, page content padded so nothing hides behind it. Split from SHL-05.
- [ ] **SHL-19** `more-sheet.tsx`: the remaining sections in a bottom Sheet opened by the "More" item, same filtering and active state. Split from SHL-05.
- [ ] **SHL-26** Stage-aware navigation: labels and items that differ for high school and university (for example "Subjects" vs "Courses") come from the session stage through UI-33; unit test per stage.

### Top bar and menus

- [ ] **SHL-06** Top bar: page context, search trigger, notifications bell, account menu
- [ ] **SHL-07** Notifications bell with unread count and sheet (per-type Lucide icons)
- [ ] **SHL-20** Unread count: server-read with a `notifications` cache tag, revalidated after mark-read mutations; badge hidden at zero, capped display `9+`, announced via `aria-label` ("3 unread notifications"). Split from SHL-07. Blocked by the notifications unread-count slice.
- [ ] **SHL-21** Notifications sheet: latest 20 with per-type icon from the registry, relative time (FE-82), mark one and mark all read through the BFF, link to `/dashboard/notifications`; empty state copy "No notifications yet". Split from SHL-07.
- [ ] **SHL-08** Global search command palette (`GET /search`)
- [ ] **SHL-22** Command palette behaviour: opens with `Ctrl+K` or `Cmd+K` and the top bar trigger, debounced queries through the BFF, results grouped by type with keyboard navigation, recent pages shown before typing, full-screen on mobile. Split from SHL-08. Blocked by the backend `GET /search` slice.
- [ ] **SHL-09** Account menu (profile, settings, help, sign out); sign-out uses the server action from FE-109, never a BFF call

### Accessibility, banners and performance

- [ ] **SHL-10** Skip link, landmark regions *(partial: skip link only in `(marketing)/layout.tsx`; `main#main` in all three layouts)*
- [ ] **SHL-23** `skip-link.tsx` shared by all three layouts; landmark audit (one `banner`, labelled `navigation` regions "Main" and "Mobile", one `main`, `contentinfo` on public pages) checked by an axe rule in the shell spec. Split from SHL-10.
- [ ] **SHL-24** `impersonation-banner.tsx`: persistent bar above the top bar when the session is impersonated, with the viewed user's name and an "End impersonation" button (FE-107); not dismissible.
- [ ] **SHL-25** `system-banner.tsx`: server-driven maintenance or read-only notice (config flag via FE-84), used during cutover and incidents; dismissible per session only for informational level.
- [ ] **SHL-27** Shell weight budget: shell client JS (sidebar active state, bottom nav, sheets, palette trigger) under 40 KB gzip; the palette and notifications sheet load on first open (dynamic import); measured in CI-25.

## Verification

1. At 360px each role sees the bottom nav with at most five items and a working "More" sheet; at 1440px the sidebar shows every permitted section (Playwright, all three projects, light and dark).
2. A student without `ai-tutor` entitlement does not see "AI tutor" in either nav (filterNavigation unit test plus e2e).
3. Signed out, `/dashboard/practice` redirects to `/login?next=/dashboard/practice` (FE-27, SHL-15).
4. Tab from page load: first stop is "Skip to content", which moves focus to `main` (SHL-23).
5. axe passes on `/`, `/login` and `/dashboard` in both schemes; Lighthouse mobile 90+ on the shell (FE-55).
6. With the impersonation flag in the mock session, the banner shows on every `(app)` route (SHL-24).

## Open questions

- Bottom nav items per role: which four plus "More" (student: Dashboard, Subjects, Practice, Progress?).
- Search scope in v1: pages and own content only, or also help articles?
- Should production ever fall back to static navigation if `GET /navigation` fails (SHL-17 says no)?
