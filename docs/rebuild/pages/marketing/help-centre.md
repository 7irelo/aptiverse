# Help centre

| | |
|---|---|
| ID | `PG-MKT-HELP` |
| Route | `/help`, `/help/[slug]` |
| Phase | 1 (FAQ list), 9 (articles and search) |
| Roles | public (anyone); also linked from the student and parent app nav (`nav-config.ts` help item, href `/help`) |
| Stages | high school, university (articles may be tagged by stage) |
| Entitlement | free (public page) |
| Depends on | BE-SUP-03 (built: `api/src/Modules/Support/Aptiverse.Support/Features/ListFaqs`), BE-SUP-14, BE-SUP-15 (later), UI-29, SHL-01, PG-MKT-LEGAL-01 (long-form components) |
| Old app reference | new as a public page. The old app had in-app help only: `43f9faa:web/src/app/(app)/dashboard/help/page.tsx` (four hardcoded FAQs, a search box that did nothing, and "Live chat" and "Knowledge base" cards whose "Open" buttons went nowhere). Its honest answers are reused as seed content; its dead controls are the anti-pattern this page must not repeat. |
| Status | Partial. `/help` FAQ list is built and tested (Phase 1 walking skeleton): Server Component page, loading, error with retry, not-found, cached loader on `GET /support/faqs`, unit and component tests, Playwright with axe on three devices. Not started: topic index, articles, `/help/[slug]`, search, OG image. |

## Purpose

Answer common questions without a support ticket. One public place with grouped FAQs today, and topic-grouped long-form articles with search later, served from the Support module so the team can edit content without a deploy.

## User stories

- As a new student, I want to find "how do I add my subjects" quickly on my phone.
- As a parent, I want to understand what I can and cannot see about my child before I pay.
- As anyone, I want to search help for a word like "cancel" and get the right article.
- As a signed-in user, I want the Help link in the app to take me to the same answers.

## Layout

### Mobile (360px)

`/help`
1. Public header (SHL-01).
2. Page header: `h1` "Help and FAQs", subhead.
3. Search field (Phase 9), full width, 44px, with a clear button.
4. Topic index (Phase 9): five topic cards stacked (Getting started, Account, Billing, Features, Privacy), each with Lucide icon, title, article count from the API.
5. FAQ groups (built): `h2` per category, accordion of questions.
6. "Still stuck?" block linking to `/contact`.
7. Footer.

`/help/[slug]` (Phase 9)
1. Header.
2. Breadcrumb: "Help" then topic name.
3. `h1` article title, "Updated {d MMMM yyyy}".
4. Collapsible "On this page" table of contents (only when 3 or more `h2`).
5. Article body (long-form typography).
6. Related articles (up to 3, same topic).
7. "Still stuck?" block.

### Desktop (1440px)

- `/help`: 1120px container. Search and topic index in a 3-column grid of topic cards (5 cards wrap to 3 plus 2). FAQ groups below in a single 720px column for readability.
- `/help/[slug]`: two columns, table of contents sticky on the left (3 of 12), article in a 65-character measure (7 of 12), related articles on the right (2 of 12) or under the article below `xl`.

## Components

| Component | File path | Server or client | Notes |
|---|---|---|---|
| Help page | `web/src/app/(marketing)/help/page.tsx` | server | Built. Static metadata; streams `HelpFaqs` in `<Suspense>` |
| Loading | `web/src/app/(marketing)/help/loading.tsx` | server | Built. Skeleton |
| Error | `web/src/app/(marketing)/help/error.tsx` | client | Built. Sentry capture, `PageState` with "Try again" calling `retry` |
| Not found | `web/src/app/(marketing)/help/not-found.tsx` | server | Built. "That help page does not exist" |
| HelpFaqs | `web/src/features/support/components/help-faqs.tsx` | server | Built. `await connection()`, empty state |
| FaqList | `web/src/features/support/components/faq-list.tsx` | server, accordion client leaf | Built. Grouped, `h2` per category |
| FaqListSkeleton | `web/src/features/support/components/faq-list-skeleton.tsx` | server | Built |
| groupFaqsByCategory | `web/src/features/support/lib/group-faqs.ts` | shared | Built, unit tested |
| getFaqs | `web/src/features/support/server/get-faqs.ts` | server only | Built. `"use cache"`, `cacheTag("support:faqs")`, stale 60 s, revalidate 300 s, expire 3 600 s |
| Article page | `web/src/app/(marketing)/help/[slug]/page.tsx` | server | New. `generateStaticParams` from published slugs, `generateMetadata` per article |
| Article not found | `web/src/app/(marketing)/help/[slug]/not-found.tsx` | server | New. Reuses the help not-found copy |
| TopicIndex | `web/src/features/support/components/topic-index.tsx` | server | New. Cards link to `/help?topic=<key>` |
| HelpSearch | `web/src/features/support/components/help-search.tsx` | client | New. Filters the article index passed as props |
| ArticleBody | `web/src/features/support/components/article-body.tsx` | server | Wraps `LongForm` and `Markdown` |
| RelatedArticles | `web/src/features/support/components/related-articles.tsx` | server | |
| StillStuck | `web/src/features/support/components/still-stuck.tsx` | server | Link to `/contact` |
| getArticles, getArticle | `web/src/features/support/server/get-articles.ts` | server only | `"use cache"`, tags `support:articles` and `support:article:<slug>` |
| LongForm, TableOfContents | `web/src/features/marketing/components/long-form.tsx`, `table-of-contents.tsx` | server (TOC disclosure client on mobile) | Owned by PG-MKT-LEGAL-01, reused |
| Markdown | `web/src/components/common/markdown.tsx` | server | Sanitised, no raw HTML, GFM, KaTeX not needed |
| PageContainer, PageState | `web/src/components/shell/page-container.tsx`, `page-state.tsx` | server | |

## Data

| Endpoint (BE ID) | Method | Fields used | Cache tag |
|---|---|---|---|
| `/support/faqs` (BE-SUP-03, built) | GET | `id`, `question`, `answer`, `category`, `sortOrder` (as generated in `faqResponse.ts`) | `support:faqs` |
| `/support/articles` (BE-SUP-14) | GET | `slug`, `title`, `summary`, `topic` (`getting-started`, `account`, `billing`, `features`, `privacy`), `stage` (`all`, `high_school`, `tertiary`), `updatedAt` | `support:articles` |
| `/support/articles/{slug}` (BE-SUP-14) | GET | `slug`, `title`, `topic`, `bodyMarkdown`, `updatedAt`, `related[]` (`slug`, `title`) | `support:article:<slug>` |
| `/search` (BE-SUP-15) | GET | Later only, see open questions | none |

- Reads happen on the server through the generated client and are validated with the generated zod schemas.
- Admin edits (Phase 9 admin content page) call `POST /api/revalidate` with the matching tag (route owned by PG-MKT-PRICE-13).
- Search in v1 is a client-side filter over the article index (title, summary, topic) passed from the server: the index is small (tens of articles), needs no extra endpoint, and works on a flaky connection once loaded. Move to `GET /search` when the article count passes about 200 or when in-app search (SHL-08) ships.
- Mutations: none.

## States

| State | When | Exact copy |
|---|---|---|
| Loading | FAQs or articles streaming | Skeleton; screen reader text "Loading questions" (built) |
| Populated | Data returned | Groups, topics, articles |
| Empty FAQs | API returns no FAQs | Title "No questions here yet", body "We are still writing answers. Check back soon." (built) |
| Empty topic | `?topic=` has no articles | Title "Nothing in this topic yet", body "Try another topic or search for a word." Action "See all help" |
| No search results | Query matches nothing | "No help articles match \"{query}\". Try a shorter word, or ask us directly." Link "Contact us" |
| Error | API down or schema mismatch | Title "We could not load the questions", body "This is on our side, not yours. Check your connection and try again in a moment." Button "Try again" (built) |
| Article not found | Unknown or unpublished slug | Title "That help page does not exist", body "Try the full list of questions instead." Button "See all questions" (built for `/help`, reused) |
| Forbidden, upgrade, no evidence | Not applicable | |

## Stage variants

- Articles carry a `stage` tag. Public visitors see all articles. Signed-in students see their own stage first and the other stage hidden behind "Show articles for {other stage}" (high school sees "university students", tertiary sees "high school learners").
- Wording rule for articles: anything tagged `tertiary` never mentions SBA, APS, matric or Grade; anything tagged `high_school` never says "course" or GPA. Articles tagged `all` say "subjects or courses".

## Interactions and edge cases

- FAQ accordions allow several open at once (built, `type="multiple"`).
- Deep link to a FAQ: `/help#faq-<id>` opens that item on load (small client effect) and scrolls it into view under the sticky header.
- Search: debounced 150 ms, matches case and accent insensitive, highlights matches with `<mark>`, Escape clears. Query kept in `?q=` so it can be shared; it never contains personal data because it is typed by the user, but it is not sent to analytics as free text.
- Topic filter in `?topic=`; unknown topic ignored.
- Article Markdown with external links opens in the same tab with `rel="noopener"`; internal links stay client-side.
- Unpublished slug or deleted article: `notFound()`, and `generateStaticParams` drops it after revalidation.
- Very long article titles wrap with `text-wrap: balance`.
- No control ships before it works (lesson from the old in-app help page): the search field and topic cards render only when `helpArticles` is on and the article index loaded; there is no "Live chat" card (no live chat exists) and no "Knowledge base" card that leads nowhere. Every support channel shown is a real link (`/contact`, `mailto:support@aptiverse.co.za`).
- Seed FAQ answers stay honest about limits, ported from the old in-app help: practice tests are generated from the subject or course and topics the student picks (no claim beyond that); goals with measurable targets verify themselves from logged marks and practice results; Aptiverse needs a connection, there is no offline mode (claims ledger red list), so the answer says what to do if the signal drops mid-test; the diary answer states exactly what BE-WEL-04 implements and never says "end-to-end encrypted".
- The old in-app diary answer said "our AI reads each entry to work out the mood trend", while the old privacy policy said nothing analyses the diary. The rebuild has no diary NLP in v1 (decision 7, decided), so the FAQ, the privacy policy (PG-MKT-LEGAL-22) and the wellbeing pages must say the same thing: the mood trend comes from check-ins only.
- Signed-in user arriving from the app nav sees the public header (help stays in the marketing group); a "Back to your dashboard" link shows if a session exists, read in a small client leaf so the page stays cached.

## Copy

- `h1`: "Help and FAQs" (built)
- Subhead: "Quick answers to the questions students ask us most." (built)
- Search label: "Search help", placeholder "For example: cancel, subjects, password"
- Topics: "Getting started", "Account", "Billing", "Features", "Privacy"
- Topic card count: "{n} articles" or "1 article"
- Article meta: "Updated {d MMMM yyyy}"
- TOC: "On this page"
- Still stuck heading: "Still stuck?", body "Send us a message and we will reply by email.", link "Contact us"
- First article set (PG-MKT-HELP-04), titles: "Create your account", "Set up your subjects (high school)", "Add your courses (university)", "Log an assessment and a mark", "Start a practice test", "How the AI tutor works and its limits", "Link a parent to your account", "What parents can and cannot see", "Change or cancel your plan", "Update your payment card", "Reset your password", "Your privacy and POPIA rights", "Delete your account". Each is checked against the claims ledger (the tutor article states it can be wrong and has no citations).

## Acceptance criteria

1. Given published FAQs, when I open `/help`, then I see them grouped under `h2` category headings and can open any answer (built, `help.spec.ts`).
2. Given the API is down, when I open `/help`, then I see "We could not load the questions" and a "Try again" button (built).
3. Given published articles, when I open `/help`, then I see five topic cards with real counts from the API.
4. Given I type "cancel" in search, then only matching articles show, matches are highlighted, and the result count is announced.
5. Given I open `/help/change-or-cancel-your-plan`, then I see the article with its updated date, a table of contents if it has 3 or more sections, and related articles.
6. Given an unpublished slug, when I open `/help/<slug>`, then I see the not-found state with a link back to `/help`.
7. Given article Markdown contains a `<script>` tag, then it is rendered as text or dropped, never executed.
8. Given an admin edits an article, when the revalidate call runs, then the next request shows the new content.

## Production readiness

- Security
  - Content is public and read server-side; the browser never calls the API.
  - Markdown sanitised by `components/common/markdown.tsx` (no `rehype-raw`, link protocols limited to `https`, `mailto` and relative). Covered by a unit test with a script payload.
  - Search query stays client-side; never logged, never sent to analytics.
- Performance
  - LCP is the `h1` (text). Under 2.5s on mobile; currently the FAQ list streams after the shell.
  - Route JS under 150 KB gzip; client code is the accordion, the search filter and the TOC disclosure only.
  - Caching: `support:faqs` (built), `support:articles`, `support:article:<slug>`; article pages prerendered with `generateStaticParams`.
- Resilience
  - API down: error boundary with retry (built); stale cache keeps serving if warm.
  - Article loader failure on one slug does not break `/help`.
- Observability
  - `error.tsx` captures to Sentry (built); add tag `route:/help` and `route:/help/[slug]`.
  - Analytics (consent-gated `track()`): `help_faq_opened` {faqId}, `help_search_used` {resultCount}, `help_article_viewed` {slug}, `help_contact_clicked` {from}.
  - Server fetches carry `traceparent` through the shared fetcher.
- Accessibility (WCAG 2.2 AA)
  - Accordion via Radix, `aria-expanded` (built and tested). axe clean in light and dark (built for `/help`).
  - Search results count in a polite live region; `<mark>` highlights also use weight, not colour alone.
  - Breadcrumb is a `nav` with `aria-label="Breadcrumb"`; TOC is a `nav` with `aria-label="On this page"`.
  - Anchored headings not hidden by the sticky header (2.4.11, `scroll-margin-top`).
- Privacy and POPIA
  - No personal data shown or collected. Analytics only after consent.
- SEO
  - Canonical `/help` and `/help/<slug>`; `?q` and `?topic` canonicalise to `/help`.
  - Sitemap entries for `/help` and every published article slug (from `getArticles()`).
  - JSON-LD `FAQPage` on `/help` built only from the real FAQs returned; `Article` JSON-LD on article pages with `dateModified`.
  - OG image per route via `opengraph-image.tsx`.
- Rollout
  - `/help` is live behaviour already. Articles ship behind `helpArticles` switch in `lib/flags.ts`: off hides topic index, search and `/help/[slug]` (returns `notFound()`), leaving the FAQ list.
  - Rollback: switch off or Vercel instant rollback (HRD-03).
- Monitoring
  - Sentry issue alert on `route:/help*`.
  - Grafana panels (OBS-02) for `GET /support/faqs` and `GET /support/articles*` error rate and p95.
  - Speed Insights LCP for `/help` and `/help/[slug]`; Lighthouse CI budget.

## Build tasks

- [ ] **PG-MKT-HELP-01** Topic index (Getting started, Account, Billing, Features, Privacy) with counts from the API
- [ ] **PG-MKT-HELP-02** Search: client-side filter over the article index with `?q=`, highlight and result count
- [ ] **PG-MKT-HELP-03** Article page `/help/[slug]` with long-form typography, TOC and related articles
- [ ] **PG-MKT-HELP-04** Write the first article set (13 titles listed in Copy), checked against the claims ledger
- [x] **PG-MKT-HELP-05** FAQ list grouped by category from `GET /support/faqs` (`features/support/components/help-faqs.tsx`, `faq-list.tsx`, `lib/group-faqs.ts`)
- [x] **PG-MKT-HELP-06** Cached FAQ loader with tag `support:faqs` and zod parse (`features/support/server/get-faqs.ts`)
- [x] **PG-MKT-HELP-07** Loading skeleton, error with retry and Sentry capture, not-found (`app/(marketing)/help/`)
- [x] **PG-MKT-HELP-08** Empty FAQ state ("No questions here yet")
- [ ] **PG-MKT-HELP-09** `getArticles` and `getArticle` loaders with tags `support:articles` and `support:article:<slug>`
- [ ] **PG-MKT-HELP-10** `generateStaticParams` and `generateMetadata` for `/help/[slug]`; `not-found.tsx` for the segment
- [ ] **PG-MKT-HELP-11** Topic filter `?topic=` and empty-topic state
- [ ] **PG-MKT-HELP-12** Stage-aware ordering for signed-in students with "Show articles for ..." toggle
- [ ] **PG-MKT-HELP-13** FAQ deep link `#faq-<id>` opens and scrolls the item
- [ ] **PG-MKT-HELP-14** "Still stuck?" block linking to `/contact`
- [ ] **PG-MKT-HELP-15** `FAQPage` JSON-LD from real FAQs on `/help`; `Article` JSON-LD on article pages
- [ ] **PG-MKT-HELP-16** Sitemap entries for `/help` and published slugs; canonical URLs
- [ ] **PG-MKT-HELP-17** Analytics events (`help_faq_opened`, `help_search_used`, `help_article_viewed`, `help_contact_clicked`)
- [ ] **PG-MKT-HELP-18** `helpArticles` switch in `lib/flags.ts`
- [ ] **PG-MKT-HELP-19** Revalidation of article tags wired from the admin content edit (uses PG-MKT-PRICE-13 route)
- [ ] **PG-MKT-HELP-20** Seed FAQ content for the Support seed data (BE-SUP-02): practice generation, diary privacy, goal verification, no offline mode, each answer checked against the claims ledger and BE-WEL-04
- [ ] **PG-MKT-HELP-21** Guard that search and topic cards render only when the article index is available; no live chat or dead "knowledge base" entry points
- [ ] **PG-MKT-HELP-22** Diary wording parity: one shared answer for the FAQ, the privacy policy and the wellbeing page (no diary analysis, no "end-to-end")

## Quality tasks

- [ ] **PG-MKT-HELP-Q01** Route files: `page.tsx` as a Server Component with no client JS beyond interactive leaves *(partial: `/help` done; `/help/[slug]` missing)*
- [ ] **PG-MKT-HELP-Q02** `generateMetadata` title and description; OG image *(partial: static title and description on `/help`; no OG image, no per-article metadata)*
- [x] **PG-MKT-HELP-Q03** Layout at 360px first (no horizontal scroll, 44px tap targets, 16px gutters) (for `/help`: 360px no-scroll test in `e2e/help.spec.ts`; recheck when articles land)
- [ ] **PG-MKT-HELP-Q04** Layout at 768px and 1440px *(unverified: no visual check or snapshot exists)*
- [ ] **PG-MKT-HELP-Q05** Light and dark both correct (OS-driven) *(partial: axe passes in both schemes on `/help`; no visual review, articles not built)*
- [ ] **PG-MKT-HELP-Q06** Copy review: real South African context, no emojis, no em or en dashes, claims checked against the claims ledger
- [ ] **PG-MKT-HELP-Q07** axe: zero violations in light and dark *(partial: done for `/help` and its error state; articles and search not built)*
- [ ] **PG-MKT-HELP-Q08** Keyboard pass: visible focus on every link and control, one `h1`, headings in order *(partial: `/help` has one `h1` and `h2` groups; no recorded keyboard pass)*
- [ ] **PG-MKT-HELP-Q09** Lighthouse mobile: 90 or higher, LCP under 2.5s
- [ ] **PG-MKT-HELP-Q10** Playwright spec on Pixel 7 and iPhone 14, then desktop Chrome *(partial: `e2e/help.spec.ts` covers `/help` on all three; no article or search scenarios)*
- [ ] **PG-MKT-HELP-Q11** Markdown sanitisation unit test with script, iframe and `javascript:` link payloads
- [ ] **PG-MKT-HELP-Q12** Stage wording sweep across the first article set
- [ ] **PG-MKT-HELP-Q13** Sentry route tags and Grafana panels for the FAQ and article endpoints exist
- [ ] **PG-MKT-HELP-Q14** Dead-control sweep: every button and link on `/help` and article pages leads somewhere real (Playwright clicks each and asserts a navigation or an expanded panel)

## Tests

Built
- Unit: `group-faqs.test.ts` (grouping and order), `help-faqs.test.tsx`, `help-error.test.tsx`
- Playwright `e2e/help.spec.ts`: `lists FAQs grouped by category and opens an answer`, `has no accessibility violations in light mode`, `has no accessibility violations in dark mode`, `shows a retry state when the API is down`, `fits a 360px wide screen without sideways scrolling`

To add
- Unit: `HelpPage hides search and topics when the article index is unavailable`, `filterArticles matches title and summary case insensitively`, `filterArticles returns empty for no match`, `Markdown drops script tags and javascript links`, `TableOfContents renders only with three or more sections`, `faqJsonLd builds from real FAQs only`
- Playwright (`e2e/help.spec.ts`, `e2e/help-article.spec.ts`): `shows topic cards with counts`, `search filters articles and announces the count`, `opens an article with table of contents`, `unknown slug shows not found`, `deep link opens the FAQ`, `article page has no accessibility violations in light and dark`

## Open questions

1. Client-side search over the index (chosen for v1) versus `GET /search` (BE-SUP-15): confirm the switch point and whether in-app global search (SHL-08) should include help articles from day one.
2. Who writes and approves the first article set, and is the admin content editor (Phase 9) needed before launch, or are articles seeded from Markdown files?
3. `/help` currently uses `await connection()` so the build never needs the API; article pages want `generateStaticParams`, which needs the API at build. Decide: build-time fetch with a fallback to on-demand rendering, or no static params.
4. Should the in-app help page (`pages/shared/in-app-help.md`) reuse these components, or link here only?
5. Is there any live support channel in v1 (the old in-app page advertised live chat 7am to 7pm SAST that did not exist)? This spec assumes email and the contact form only.
