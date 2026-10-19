# Phase 0 specs and inventories

| | |
|---|---|
| ID range | `ARC-20` to `ARC-29`, `ARC-50` to `ARC-63` |
| Phase | 0 |
| Owner repo | docs (this backlog), inventories under `docs/inventory/` |
| Depends on | ARC-03 (v1 scope), read-only access to the old prod DB snapshot, Paystack and Anthropic dashboards |
| Status | 0 done, 0 partial, 7 unverified (need old prod data or provider dashboards), rest not started |

## Purpose

Define v1 precisely and capture everything the migration and billing continuity depend on before any rebuild feature work: one-page specs per feature, an entity inventory that becomes the ETL mapping, and inventories of Paystack, affiliates and Anthropic usage.

## Scope

- Spec template and per-feature specs. The page files under `docs/rebuild/pages/` already carry most of what a spec needs (route, data, states, acceptance criteria); a spec adds the user story, permissions and entitlements in one page and links the page files.
- Entity inventory from the old schema at `f223ca7` (47 migrations, 124 tables, 23 schemas): old table, new module, schema and table, id type change, PII class, retention class. Output feeds `launch/migration-etl.md`.
- Paystack, affiliate and Anthropic inventories: counts and codes from live data, held privately (no PII or secrets committed; commit only counts and structure).
- Files: `docs/inventory/entities.csv`, `docs/inventory/paystack.md`, `docs/inventory/affiliates.md`, `docs/inventory/anthropic.md`, `docs/specs/<feature>.md`.

## Tasks

### Specs

- [ ] **ARC-20** One-page spec template (user story, acceptance criteria, mobile wireframe, endpoints, permissions, entitlements) at `docs/specs/0000-template.md`
- [ ] **ARC-21** Write v1 feature specs, one file per feature: identity and onboarding (list areas from `docs/rebuild/pages/README.md`)
- [ ] **ARC-27** Specs: academics (study units, assessments, uploads, calendar) (split from ARC-21)
- [ ] **ARC-28** Specs: practice and AI tutor, including integrity rules (split from ARC-21)
- [ ] **ARC-29** Specs: billing, entitlements and affiliates (split from ARC-21)
- [ ] **ARC-50** Specs: progress, careers, wellbeing, parent track (split from ARC-21)
- [ ] **ARC-51** Specs: admin, support and operations (split from ARC-21)

### Entity inventory

- [ ] **ARC-22** Entity inventory format and tooling: script that lists every table and column from the old migrations at `f223ca7` into `docs/inventory/entities.csv` (columns: old schema, old table, row estimate, new module, new schema, new table, id type change, PII class, retention class, notes)
- [ ] **ARC-52** Map identity, auth, consents, audit tables (split from ARC-22)
- [ ] **ARC-53** Map academics, calendar, curriculum, admission targets tables (split from ARC-22)
- [ ] **ARC-54** Map practice, AI, mastery, goals, points tables (split from ARC-22)
- [ ] **ARC-55** Map billing, entitlements, affiliates tables (split from ARC-22)
- [ ] **ARC-56** Map wellbeing, family, notifications, support tables; mark dropped tables (marketplace, booking, feature flags, moderation, study groups) with the reason (split from ARC-22)
- [ ] **ARC-57** Row counts per table from a restored snapshot, added to the CSV (split from ARC-22) *(unverified: needs a restored old prod snapshot, see FIX-13)*

### Provider inventories

- [ ] **ARC-23** Paystack inventory: plans and plan codes *(unverified: Paystack dashboard)*
- [ ] **ARC-58** Paystack inventory: webhook events subscribed and which the old code handles (`git show f223ca7:api/Controllers/PaymentsController.cs`) (split from ARC-23)
- [ ] **ARC-59** Paystack inventory: live subscription count, subscription and customer codes, next billing dates (stored privately, count committed) (split from ARC-23) *(unverified: live data)*
- [ ] **ARC-24** Affiliate inventory: affiliates, open holds, unpaid balances, payout history, sums to the cent *(unverified: live data)*
- [ ] **ARC-25** Anthropic inventory: every prompt in use and its call site in the old code
- [ ] **ARC-60** Anthropic inventory: models per call site (hard-coded `claude-opus-4-8` in six Practice files) and the config key that replaces each (split from ARC-25)
- [ ] **ARC-61** Anthropic inventory: monthly spend for the last 6 months and tokens per feature (split from ARC-25) *(unverified: Anthropic console)*

### Sign-off

- [ ] **ARC-26** Freeze the v1 feature list (sign-off) *(unverified: product owner sign-off)*
- [ ] **ARC-62** Record the frozen list, its date and the sign-off in `docs/rebuild/README.md`; any later addition needs a new spec and a note in the change log (split from ARC-26)
- [ ] **ARC-63** Classify each entity in the inventory as PII, special personal information (minors, wellbeing), financial, or none; this feeds the POPIA processing register in `launch/popia.md` (split from ARC-22) *(unverified: depends on ARC-52 to ARC-56)*

## Verification

- `docs/inventory/entities.csv` has 124 rows, each with a new module or an explicit "dropped" with reason.
- Sum of affiliate unpaid balances in `docs/inventory/affiliates.md` equals the old ledger query result to the cent.
- No inventory file in git contains an email address, phone number, API key or Paystack customer code (gitleaks plus a manual review).
- Each v1 feature in the frozen list has a spec file and a page file.

## Open questions

- Where do private inventory details (codes, emails) live, given nothing personal may be committed? Proposed: an encrypted S3 object in the prod account, linked by name only.
- The old schema has 23 schemas but the new plan has 12 modules; confirm the dropped modules list before ARC-56.
