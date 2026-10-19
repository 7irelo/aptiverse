# Cutover

| | |
|---|---|
| ID range | `CUT-01` to `CUT-12` (original), `CUT-13` to `CUT-36` (split and enterprise additions), `CUT-37` and `CUT-38` (decision notices) |
| Phase | 11 |
| Depends on | MIG-25 and MIG-73 (`launch/migration-etl.md`), HRD-63 go/no-go (`launch/prod-readiness.md`), `launch/incident-management.md`, `launch/disaster-recovery.md`, `infra/dns.md`, `infra/env-prod.md`, `phase-0/change-management.md` |
| Status | Not started. 0 of 38 tasks done. Everything here is a human or live-system action on the old stack (EC2, old RDS, Vercel project on `7irelo/aptiverse` main) and the new prod stack. |

## Purpose

Switch every user from the old app (old code at `origin/main` of `7irelo/aptiverse`, API on EC2, web on Vercel) to the rebuilt platform in one planned window, with a rehearsed timeline, a clear point of no return, a tested rollback, and seven days of close watch on payments, commissions and errors. Then retire the old stack safely.

## Scope

- **Systems:** old EC2 host and its compose stack, old RDS (Postgres 16), old Vercel project, Cloudflare zone `aptiverse.co.za`, Paystack dashboard (webhook URL), Google OAuth client, SES and Zoho mail records, new prod ECS, RDS, S3 and Vercel project.
- **Artefacts:** cutover runbook with minute-by-minute timeline (CUT-30), comms templates (CUT-15 to CUT-17), go/no-go record (CUT-14), hypercare log (CUT-23), postmortem (CUT-24), decommission checklist (CUT-11, CUT-25 to CUT-29).
- **Out of scope:** ETL logic itself (`launch/migration-etl.md`).

## Tasks

### Preparation (T minus 14 days to T minus 1 day)

- [ ] **CUT-30** Timed cutover runbook: minute-by-minute schedule with owner per step, expected duration from MIG-25, the point of no return, and the rollback trigger conditions; reviewed in a dry run with everyone on the roster.
- [ ] **CUT-13** Go/no-go criteria written: HRD-63 all green, MIG-25 inside the window, reconciliation 100% in the last rehearsal, prod smoke green on the dress rehearsal (HRD-61), on-call roster filled, rollback rehearsed (CUT-22).
- [ ] **CUT-18** Change freeze: no deploys to the old app or new prod from T minus 3 days except cutover fixes, announced and enforced through GitHub environment protection (`phase-0/change-management.md`).
- [ ] **CUT-02** No affiliate payout run during cutover week.
- [ ] **CUT-15** Email template for the maintenance window (date, time in SAST, expected duration, what users must do: nothing, same password), approved copy, no emojis or long dashes.
- [ ] **CUT-01** Announce maintenance window (email to users) at least 7 days ahead, plus a reminder 24 hours ahead.
- [ ] **CUT-37** Points and top-ups notice (decision 6): at least 14 days before the window, email every student holding unspent reward points or an unexpired quota top-up at the final rehearsal (list from the MIG-58 archive query). Copy says plainly that points and top-ups end at the switch, that the record is kept (MIG-58) so they can be honoured if rewards return, and how to ask support about it; no promise of a date. Top-ups expiring before the window are not mentioned. Approved copy, no emojis or long dashes.
- [ ] **CUT-38** Affiliate terms notice (decisions 3b, 3c): at least 14 days before the window, email every affiliate with a profile: attribution is now capped at 12 months from first touch (referrals keep their original date, so some are already past the window and say so with a count, BE-AFF-84), enrolment is automatic, payouts need confirmed payout details, and the new terms must be accepted at first sign-in after the switch (BE-AFF-85) before new commission accrues. Balances owed are carried over unchanged and stated in the email.
- [ ] **CUT-16** In-app banner on the old app announcing the window (old code change, deployed under FIX rules).
- [ ] **CUT-17** Status page or status section on the marketing site that shows "maintenance in progress" and "complete", linked from the email.
- [ ] **CUT-19** Lower Cloudflare TTLs on the records that will change to the minimum 48 hours before the window (proxied records already switch instantly; note which are unproxied).
- [ ] **CUT-22** Rollback rehearsed on staging: old app back to read-write, DNS pointed back, Paystack webhook pointed back, timed under 15 minutes.
- [ ] **CUT-28** Google OAuth client: add the new redirect URIs for the new domain paths before the window so sign-in with Google works at switch time.
- [ ] **CUT-29** Mail continuity check: SPF, DKIM and DMARC records cover SES eu-west-1 and Zoho inbound together; sending a verification email from new prod to a seed inbox passes alignment.
- [ ] **CUT-14** Go/no-go meeting held at T minus 1 day; decision and attendees recorded with the evidence links.

### Window (T)

- [ ] **CUT-03** Old app read-only mode (write endpoints return 503 with a maintenance ProblemDetails; reads still work), confirmed by a write attempt failing.
- [ ] **CUT-20** Paystack event capture: note the window start time; Paystack webhooks hitting the old app during read-only are logged, and after the switch every transaction and subscription event since the window start is listed from the Paystack API and replayed into the new `billing.paystack_events` inbox (idempotent by event id).
- [ ] **CUT-04** Final snapshot of the old RDS, named `aptiverse-old-final-<date>`, encrypted, with deletion protection.
- [ ] **CUT-05** Run ETL and reconciliation (MIG-60 run mode against the final snapshot restore; MIG-69 report must be 100%).
- [ ] **CUT-21** Point of no return check: if reconciliation fails or the run exceeds its timing budget by more than 30%, abort and run the rollback (CUT-22 procedure); otherwise proceed.
- [ ] **CUT-06** Repoint Paystack webhook URL to the new API, then send a Paystack test event and see it land in the inbox.
- [ ] **CUT-07** Switch DNS in Cloudflare (app and api records to Vercel prod and the prod ALB) through a reviewed Terraform change in `infra/dns.md`, not by hand.
- [ ] **CUT-27** Old Vercel project: remove the production domain from the old project so it cannot answer for `aptiverse.co.za` again.

### Smoke tests (split from CUT-08)

- [ ] **CUT-08** Smoke tests (login per role, practice, payment with a live R5 transaction refunded immediately): umbrella check that CUT-31 to CUT-33 passed, recorded in the cutover log.
- [ ] **CUT-31** Sign in on a real phone as a migrated high school student, a migrated university student, a parent and an admin, with old passwords; each lands on the right home.
- [ ] **CUT-32** Practice: start and submit a practice attempt; tutor chat blocked during the attempt; results view loads.
- [ ] **CUT-33** Payment path: a live R5 transaction on a real plan by an internal account (decision 67), refunded immediately; webhook processed once, entitlement updated, then reverted after the refund.

### Hypercare (T plus 1 to T plus 7 days)

- [ ] **CUT-23** Hypercare roster for 7 days with named primary and backup, daily check-in times, and the incident process from `launch/incident-management.md`.
- [ ] **CUT-09** Watch 7 days: payments, commissions, errors. Daily record of Paystack reconciliation drift (must be zero), commission ledger anomalies, Sentry new issues, error budget burn.
- [ ] **CUT-34** Support inbox triage twice daily during hypercare, with a tag for "migration" issues and a fix or reply within one business day.
- [ ] **CUT-24** Post-cutover postmortem (blameless, template from `launch/incident-management.md`) within 5 business days, with action items owned.

### Decommission (T plus 7 to T plus 30 days and after)

- [ ] **CUT-10** Old stack stopped, snapshot retained 30 days.
- [ ] **CUT-25** Revoke every old credential: old EC2 key pair, old IAM users and access keys, old GitHub secrets on `7irelo/aptiverse`, old Paystack webhook secret, old JWT key (cross-check with `phase-0/secrets.md`).
- [ ] **CUT-11** Decommission old EC2, old RDS, bastion.
- [ ] **CUT-35** Remove old Terraform state keys and the `aptiverse-terraform-locks` DynamoDB table once no old stack uses them (`infra/bootstrap.md`).
- [ ] **CUT-26** Delete the retained old RDS snapshot after 30 days unless `launch/retention-schedule.md` requires longer; record the deletion.
- [ ] **CUT-36** Cost check: the AWS bill and Cost Explorer show no old resources one month after decommission.
- [ ] **CUT-12** Archive `7irelo/aptiverse` after secret check (gitleaks full history clean or findings rotated, SEC-12).

## Verification

- The cutover log shows every step with start and end time, owner and result, and total downtime inside the announced window.
- Reconciliation report from CUT-05 is attached and shows 100%.
- Paystack dashboard shows the new webhook URL and zero failed deliveries after switch; replayed events (CUT-20) are listed with their inbox ids.
- `dig aptiverse.co.za` and `dig api.aptiverse.co.za` resolve to Cloudflare, and the origin behind them is the new stack (response header or health endpoint version).
- Seven daily hypercare entries exist with zero payment or commission anomalies, matching the Phase 11 exit gate.

## Open questions

- Decided (67): CUT-33 uses a live R5 transaction refunded immediately.
- How long does the old app stay read-only versus fully down if rollback is not needed (hours or the full 30 days)?
- Are there scheduled jobs on the old app (subscription schedule, affiliate maintenance) that must be stopped before the final snapshot so they do not act on stale data?
