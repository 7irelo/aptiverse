# Navigation (server-driven app navigation)

| | |
|---|---|
| ID range | `BE-NAV-01` (original), `BE-NAV-02` to `BE-NAV-11` (splits and additions), `BE-NAV-20` to `BE-NAV-31` (production readiness) |
| Schema | none (navigation is code-defined data; no tables) |
| Projects | hosted in `src/Modules/Identity/Aptiverse.Identity` under `Features/Navigation/` (it needs roles, permissions and stage, which Identity owns); no separate module project |
| Phase | 3 (shell), entitlement filtering completes in Phase 6 |
| Consumes | Identity internals (roles, `RolePermissions`, education level), `Aptiverse.Billing.Contracts` (`IEntitlementResolver`), `Aptiverse.Affiliates.Contracts` (`IAffiliateProfileLookup`), `Aptiverse.Notifications.Contracts` (none required; the badge count comes from BE-NTF-22 on the client) |
| Publishes | nothing |
| Depends on | BE-IDN-08, BE-IDN-15, BE-IDN-65, BE-BIL-05, web `src/components/shell/nav-schema.ts` (the response contract the web already validates) |
| Status | Not started (0 of 23 tasks). The web shell has a static fallback (`web/src/components/shell/nav-config.ts`) and the zod schema for this endpoint (`nav-schema.ts`); nothing exists in the API |

## Responsibilities and out of scope

Responsible for:

- `GET /navigation`: the sections and items the signed-in user should see, filtered by role, permission, entitlement, education stage and affiliate status, plus the ordered ids for the mobile bottom bar.
- Icon keys only (strings from the web's Lucide registry in `nav-icons.ts`), never component or MUI icon names.

Out of scope:

- Route protection (the web `proxy.ts` and every API endpoint's own permission check; hiding a nav item is never security).
- Badge counts (the client reads `GET /notifications/unread-count`).
- Marketing site navigation (static in the web).

## Data model

No tables. The navigation definition is an internal static model in code:

```
NavDefinition
  Role: student | parent | admin
  Sections: NavSectionDef[] { Id, Label, Items: NavItemDef[] }
  NavItemDef { Id, Label, Href, Icon, Permission?, Entitlement?, Stages? (high_school | tertiary), RequiresAffiliateProfile?, LabelByStage? }
  Primary: string[] (item ids, max 4)
```

Defined per role in `Features/Navigation/NavDefinitions.cs`, mirroring the current web fallback so the switch-over changes nothing visible:

| Role | Section | Items (id, href, icon, gate) |
|---|---|---|
| student | learn | `dashboard` `/dashboard` `home`; `subjects` `/dashboard/subjects` `book-open` (label by stage, BE-NAV-03); `practice` `/dashboard/practice` `clipboard-check`; `past-papers` `/dashboard/past-papers` `library-big` (high school only); `tutor` `/dashboard/tutor` `sparkles` entitlement `ai_tutor`; `progress` `/dashboard/progress` `chart-line`; `goals` `/dashboard/goals` `flag` |
| student | wellbeing | `diary` `/dashboard/diary` `notebook-pen`; `wellbeing` `/dashboard/wellbeing` `heart-handshake` |
| student | future | `careers` `/dashboard/careers` `compass` (free for everyone, never entitlement gated, as in the old app) |
| student | account | `calendar` `/dashboard/calendar` `calendar`; `notifications` `/dashboard/notifications` `bell`; `refer` `/refer` `gift` (BE-NAV-10); `billing` `/dashboard/billing` `credit-card` permission `billing.manage`; `settings` `/dashboard/settings` `settings`; `help` `/help` `help` |
| parent | overview | `dashboard` `/parent` `home`; `students` `/parent/students` `users` permission `family.read`; `wellbeing` `/parent/wellbeing` `heart-handshake` permission `family.read`; `celebrations` `/parent/celebrations` `party-popper` permission `family.read` |
| parent | account | `refer`, `billing` `/parent/billing`, `settings` `/parent/settings`, `help` |
| admin | operations | `dashboard` `/admin` `dashboard`; `users` `/admin/users` `users` permission `users.read`; `content` `/admin/content` `file-text` permission `content.manage`; `support` `/admin/support` `support` permission `support.manage`; `billing` `/admin/billing` `credit-card` permission `billing.admin`; `affiliates` `/admin/affiliates` `gift` permission `affiliates.manage`; `audit` `/admin/audit` `shield` permission `audit.read`; `system` `/admin/system` `server` permission `system.read` |
| admin | account | `settings` `/admin/settings` `settings` |

Primary (mobile bottom bar): student `dashboard, subjects, practice, progress`; parent `dashboard, students, wellbeing, celebrations`; admin `dashboard, users, content, support`. Icon keys `shield` and `server` are new and must be added to the web registry in the same release (BE-NAV-08).

## Contracts

None published. Response contract (matches `web/src/components/shell/nav-schema.ts` exactly):

```
NavigationResponse { sections: NavSection[], primary: string[] }
NavSection { id: string, label: string, items: NavItem[] }
NavItem { id: string, label: string, href: string (starts with "/"), icon: string, permission?: string, entitlement?: string }
```

`permission` and `entitlement` are returned for transparency (the web filter is a second line); items the user cannot see are already removed.

## Tasks

- [ ] **BE-NAV-02** `NavDefinitions` per role as above, with unit tests that every href starts with `/`, ids are unique per role, every `Primary` id exists, and `Primary` has at most 4 entries
- [ ] **BE-NAV-03** Stage variants: for tertiary students the `subjects` item label becomes "Courses" (decision 27) and `past-papers` is removed (NSC papers mean nothing to a university student, as in the old `NavigationController`); students with no completed onboarding see `dashboard`, `settings` and `help` only, plus a first item `onboarding` `/onboarding` `compass`
- [ ] **BE-NAV-04** Entitlement filtering through `IEntitlementResolver.GetFeaturesAsync(userId)`; admins bypass entitlement gates; a Billing failure (500 ms timeout) fails open for free items and closed for gated ones (gated items hidden), with a `degraded` log field
- [ ] **BE-NAV-05** Permission filtering from `RolePermissions.For(roles)` (the same map the API enforces); a user with several roles gets the template of the highest role (admin over parent over student) as in the old app
- [ ] **BE-NAV-06** Impersonation: during an impersonation session the response is the target user's navigation, never admin items, so the impersonating admin sees exactly what the user sees
- [ ] **BE-NAV-07** Contract test: serialise every role and stage combination and validate it against a JSON Schema generated from the web zod `navigationSchema` (copied into the test project as `nav-schema.json`, refreshed by a script); the OpenAPI response record must produce the same shape
- [ ] **BE-NAV-08** Icon key allowlist: `NavIcons.All` mirrors the keys in `web/src/components/shell/nav-icons.ts`; a test fails on any unknown key; adding an icon is a two-repo change listed in the PR template
- [ ] **BE-NAV-09** Caching: response cached in HybridCache by `(primary role, stage, onboarding complete, sorted entitlement set hash, affiliate status)` for 10 min; `ETag` from the same hash so the BFF can revalidate cheaply with `If-None-Match` (304)
- [ ] **BE-NAV-10** Affiliate item: `refer` is shown to students and parents; its label is "Refer and earn" without a profile and "Referrals" with an approved profile; hidden while a profile is `suspended` or `rejected` (`IAffiliateProfileLookup`, null-safe before BE-AFF lands)
- [ ] **BE-NAV-11** Remove the static fallback in the web once this ships (FE task cross-reference; tracked here so the API side is not considered done until the web consumes it)

## Slices

### BE-NAV-01  GET /navigation

| | |
|---|---|
| Operation id | `getNavigation` |
| Permission | authenticated (any role; no permission required so a user with a broken role map still gets settings and help) |
| Entitlement | none for the endpoint; items are filtered by entitlement |
| Rate limit | `default` |
| Idempotency | safe read; `ETag` and `Cache-Control: private, max-age=0, must-revalidate` |
| Metric | `aptiverse.navigation.get.duration` (histogram, ms), `aptiverse.navigation.cache.hits` (counter), `aptiverse.navigation.degraded` (counter, tag `dependency`) |
| Log fields | `UserId`, `PrimaryRole`, `Stage`, `ItemCount`, `CacheHit`, `Degraded` |

Request: none (headers `If-None-Match` optional). Response `200 NavigationResponse` or `304`.

Failures: `401` only. Never 500 because of Billing or Affiliates (degrades per BE-NAV-04 and BE-NAV-10).

- [ ] **BE-NAV-01** `GET /navigation` filtered by permissions and entitlements, icon keys not icon names from MUI
  - [ ] Endpoint (group `/navigation`, tag `Identity`)
  - [ ] Response records (no request record, so no validator)
  - [ ] Handler (definition selection, filters, primary trimming to visible items, cache)
  - [ ] Unit tests: student high school, student tertiary, student before onboarding, parent with and without `family.read`, admin, entitlement present and absent, degraded Billing
  - [ ] Integration tests: each role over HTTP, 304 on matching ETag, impersonation returns target nav

## Background work

None.

## Production readiness

### Threat model (STRIDE summary)

| Threat | Exposure | Control | Task |
|---|---|---|---|
| Spoofing | none beyond the access token | standard JWT validation | BE-IDN-15 |
| Tampering | client-supplied role or stage | none accepted; all inputs come from the token and server state | BE-NAV-01 |
| Repudiation | not applicable (read only) | | |
| Information disclosure | revealing admin routes or feature names to students | per-role definitions; admin items only in the admin template | BE-NAV-05 |
| Denial of service | called on every page render through the BFF | cache, ETag, no heavy queries | BE-NAV-09 |
| Elevation of privilege | treating a visible item as authorisation | documented: every API endpoint enforces its own permission; nav is presentation only | BE-NAV-20 |

- [ ] **BE-NAV-20** Threat model note in `api/docs/security/threat-model-identity.md` (navigation section), including the statement that nav filtering is never an access control

### Authorisation and ownership tests

- [ ] **BE-NAV-21** Integration: a student never receives any admin item; a parent without links still receives `students` only if `family.read` is held; anonymous 401

### Input limits

- [ ] **BE-NAV-22** No body; `If-None-Match` header capped at 128 chars (longer values ignored)

### Rate limits

- [ ] **BE-NAV-23** `default` group; verify the BFF caches per session so one page view is at most one call (FE cross-check)

### Idempotency and concurrency

- [ ] **BE-NAV-24** Read only; cache key includes every input so a role or plan change is visible within one request after `/me` changes (cache entries also evicted on `UserOnboarded`, `StudentStageChanged` and subscription change events)

### Resilience

- [ ] **BE-NAV-25** Billing and Affiliates lookups wrapped with a 500 ms timeout and fallback (BE-NAV-04, BE-NAV-10); unit tests with throwing fakes

### Data retention and POPIA

- [ ] **BE-NAV-26** No personal data stored; response contains no PII (labels and routes only); nothing to export or erase

### Audit

- [ ] **BE-NAV-27** No audit rows (read only, no sensitive data)

### Observability

- [ ] **BE-NAV-28** Metrics above; alert **navigation p95 above 150 ms for 10 min** (it blocks every page render) and **degraded responses above 5 percent for 10 min**

### Performance budgets

- [ ] **BE-NAV-29** p95 under 30 ms on cache hit and under 120 ms on miss (one entitlement call plus one profile read)

### Migration safety

- [ ] **BE-NAV-30** No migrations; changing an item id is a breaking change for the web's active-state logic and bottom bar, so ids are append-only and renames ship with a web change

### SLO contribution

- [ ] **BE-NAV-31** Part of the shell critical path: availability target 99.9 percent; the web keeps rendering a minimal shell (dashboard, settings, help) when the call fails (FE cross-reference)

## Old data mapping

Not applicable (no data). Old reference: `api/Controllers/NavigationController.cs` at `43f9faa` (role templates, entitlement gating with admin bypass, tertiary swap of Subjects to Courses, past papers hidden for tertiary, affiliate template before the student fallback, career navigator never gated). The rebuild keeps those rules and drops the tutor, teacher, school admin, workspace, reports and psychologist items (not in v1).

## Tests

- Unit: BE-NAV-02 definition invariants, BE-NAV-01 filter matrix, BE-NAV-08 icon allowlist.
- Integration: BE-NAV-01, BE-NAV-21.
- Contract: BE-NAV-07.

## Open questions

1. Decided (27): "Courses" everywhere (nav, page titles, API copy); `PG-STU-UNITS-02` must say Courses, not Modules.
2. Entitlement-gated items: hide them (plan, old app) or show them with a lock that leads to the upgrade page? Hiding is assumed; showing would need a `locked` flag in the web schema.
3. Decided (9b): the proposed catalogue is adopted, so admin nav uses `system.read`, `affiliates.manage` and `audit.read` from admin.md BE-ADM-45, matching BE-IDN-65.
