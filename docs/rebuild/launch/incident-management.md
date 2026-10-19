# Incident management

| | |
|---|---|
| ID range | `HRD-211` to `HRD-220` |
| Phase | 9 (process), 10 (on-call live) |
| Depends on | `launch/slo-and-alerts.md`, `launch/runbooks.md`, `launch/breach-notification.md` |
| Status | 0 done, 0 partial, 0 unverified, 10 not started |

## Purpose

When something breaks, everyone knows how bad it is, who leads, how users hear about it, and how the lesson gets captured so it does not happen again.

## Scope

### Severity levels

| Level | Definition | Examples | Acknowledge | Update cadence |
|---|---|---|---|---|
| SEV1 | Platform down, data loss, security or personal data breach, money wrong | api 5xx for all users, wrong charges, leaked credentials, DB unrecoverable | 15 minutes, any hour | every 30 minutes |
| SEV2 | Major feature down for many users, no workaround | practice generation failing, tutor down, webhooks failing, logins failing for one stage | 30 minutes in waking hours (06:00 to 22:00 SAST), 1 hour otherwise | every hour |
| SEV3 | Degraded or minor feature broken, workaround exists | slow dashboard, one email type not sending, admin page error | next working day | daily |
| SEV4 | Cosmetic or single-user issue | copy error, layout glitch on one device | backlog | n/a |

Any SEV1 that touches personal information starts the breach clock in `launch/breach-notification.md`.

### Roles

- Incident lead: owns the incident until resolved, makes decisions, keeps the timeline.
- Comms lead: status page and user messages (can be the same person at our size, but named).
- Subject expert: whoever knows the failing system.
- On-call rota: primary (founder) and a named backup, one-week shifts, handover note on Mondays.

### Locations

- Incident log: `docs/incidents/YYYY-MM-DD-<slug>.md` in the infra repo (private), one file per incident.
- Status page: a simple hosted status page (for example Instatus or Better Stack) at `status.aptiverse.co.za`.

## Tasks

- [ ] **HRD-211** Write `docs/incidents/README.md` with the severity table, roles, acknowledge and update targets above
- [ ] **HRD-212** On-call rota: named primary and backup, escalation after 15 minutes without ack, phone numbers in the paging tool only (not in git)
- [ ] **HRD-213** Status page set up on `status.aptiverse.co.za` with components (web app, API, AI tutor, payments, email) and Cloudflare DNS record via `infra/dns.md`
- [ ] **HRD-214** User comms templates: investigating, identified, monitoring, resolved; plus a maintenance notice; plain language, no blame on providers by name unless confirmed
- [ ] **HRD-215** Incident record template: summary, severity, start, detect, ack, mitigate, resolve times, impact (users, money, data), timeline, links to alerts and dashboards
- [ ] **HRD-216** Postmortem template (blameless): what happened, impact, timeline, root cause and contributing factors, what went well, what was hard, action items each with owner and due date; required for every SEV1 and SEV2 within 5 working days
- [ ] **HRD-217** Action item tracking: postmortem actions become GitHub issues labelled `postmortem` and are reviewed in the monthly ops review
- [ ] **HRD-218** Paging tool configured with the alert routing from `launch/slo-and-alerts.md` and a test page acknowledged by both primary and backup
- [ ] **HRD-219** Support to incident path: how a support ticket or contact form report becomes an incident (severity call by the on-call person), written in the support process
- [ ] **HRD-220** Game day: simulate a SEV2 (tutor outage) in staging, run the full process including status page and postmortem *(human action)*

## Verification

- HRD-220 produced an incident record and a postmortem using the templates.
- Both on-call people have acknowledged a test page.
- Status page reachable and linked from the app footer and error pages.

## Open questions

- Who is the backup on-call person at launch?
- Paid status page or a static page on Cloudflare Pages?
