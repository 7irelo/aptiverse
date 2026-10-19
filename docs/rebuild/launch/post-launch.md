# After launch: scale and grow

| | |
|---|---|
| ID range | `GRW-01` to `GRW-11` (original), `GRW-12` to `GRW-22` (enterprise follow-ups) |
| Phase | 12 (ongoing, triggered by metrics, not scheduled) |
| Depends on | Cutover complete (`launch/cutover.md`), SLOs live (`launch/slo-and-alerts.md`), dashboards (`observability/telemetry.md`), cost controls (`launch/cost-controls.md`) |
| Status | Not started. 0 of 22 tasks done. None of these is due before launch. |

## Purpose

Keep the post-launch work honest: each item names the metric and threshold that starts it, so nothing is built for scale or features that the data does not justify (REBUILD_PLAN section 4, Phase 12). Also list the recurring enterprise hygiene that keeps the platform production-proof after launch.

## Scope

- Growth and scale items from the plan, each with a trigger.
- Recurring security, compliance, resilience and cost reviews.
- A quarterly review that checks every trigger against the dashboards and records the decision.

## Tasks

### Trigger review

- [ ] **GRW-12** Quarterly trigger review: check every GRW trigger below against the dashboards, record "start" or "not yet" with the metric value, and file the record next to the incident log.

### Scale (metric triggered)

- [ ] **GRW-01** Analytics worker repo (Python, SQS consumer, BKT mastery into `analytics` schema). Trigger: at least 3 months of real attempt data and 50,000 graded answer submissions, plus a product question the .NET aggregates cannot answer.
- [ ] **GRW-02** Valkey L2 cache and distributed rate limiter (more than 2 API tasks). Trigger: the api service runs more than 2 tasks for more than 25% of a week, or rate limits are visibly inconsistent across tasks.
- [ ] **GRW-03** RDS read replica for admin and analytics. Trigger: admin or reporting queries contribute more than 20% of primary DB load in `pg_stat_statements`, or primary CPU above 60% p95 for a week.
- [ ] **GRW-04** Extract AiTutor or Notifications into its own service. Trigger: that module's scaling profile forces the whole api to scale (for example AI streaming holds more than half the api task capacity), or its deploy cadence blocks other modules.
- [ ] **GRW-10** AWS Organizations: separate prod account. Trigger: before the first external hire with AWS access, or before any compliance assessment, whichever comes first.

### Product tracks (metric or demand triggered)

- [ ] **GRW-05** Tutor discovery track (jobs board with connects). Trigger: sustained demand signal (support requests or survey share above an agreed threshold) and v1 retention targets met.
- [ ] **GRW-06** Teacher and school track (school-scoped live activity, gap analysis). Trigger: a signed school pilot.
- [ ] **GRW-07** Study groups. Trigger: users requesting group features in support or surveys above an agreed threshold.
- [ ] **GRW-08** PWA install and offline practice papers. Trigger: more than 70% mobile sessions and measurable sessions lost to connectivity (failed fetches on mobile in Sentry or Speed Insights).
- [ ] **GRW-09** Native app (Expo) if mobile usage justifies. Trigger: PWA shipped and still blocked on native capabilities (notifications reach, store presence) with evidence.
- [ ] **GRW-11** Product analytics (PostHog, POPIA-reviewed). Trigger: product questions that Vercel Analytics and server events cannot answer, and a completed POPIA assessment for minors (`launch/popia.md`).
- [ ] **GRW-13** Data warehouse for reporting. Trigger: GRW-03 in place and reporting still competes with production load, or finance needs multi-source reports.

### Security and compliance hygiene (recurring)

- [ ] **GRW-14** AWS Organizations guardrails after GRW-10: SCPs denying region use outside af-south-1 and eu-west-1, denying CloudTrail and GuardDuty disablement, and denying root user actions.
- [ ] **GRW-15** Quarterly access review: GitHub org members and roles, AWS IAM Identity Center users, Cloudflare, Vercel, Paystack, Anthropic, Sentry and Grafana seats; remove leavers, record the review.
- [ ] **GRW-16** Annual external penetration test (follows HRD-24) with findings tracked to closure.
- [ ] **GRW-17** Annual POPIA review: processing register, operator agreements, retention schedule and privacy notice re-checked; information officer signs off.
- [ ] **GRW-18** SOC 2 or ISO 27001 readiness decision: record whether a customer (for example schools in GRW-06) requires it, and if so, a gap assessment against the current controls.

### Resilience and cost (recurring)

- [ ] **GRW-19** Quarterly game day: inject one failure (kill api tasks, block Anthropic egress, expire a secret in staging, fail over RDS Multi-AZ) and confirm alerts, runbooks and recovery times; record results.
- [ ] **GRW-20** Multi-region DR upgrade decision: if RTO or RPO targets in `launch/disaster-recovery.md` tighten, evaluate a warm standby in a second region, with POPIA residency confirmed.
- [ ] **GRW-21** Cost optimisation review every 6 months: Savings Plans for Fargate, reserved instances for RDS, NAT data processing, log volume, Anthropic prompt caching hit rate.
- [ ] **GRW-22** Platform upgrade cadence: .NET LTS, Next.js major, Postgres major and Terraform provider majors planned per release calendar, each with a staging soak and rollback plan.

## Verification

- Each quarterly review (GRW-12) has a dated record listing every trigger, its measured value and the decision.
- Started items link to the dashboard panel or query that crossed the threshold.
- Access reviews, pentests, POPIA reviews and game days each have a dated record with findings and owners.

## Open questions

- Exact thresholds for GRW-05 and GRW-07 demand signals.
- Which tool provides the user survey signal (in-app prompt, email survey)?
- Decided (33): a second region (eu-west-1 the candidate) only after a POPIA opinion; GRW-20 waits for it.
