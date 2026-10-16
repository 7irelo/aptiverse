# 0003. Wolverine with the Postgres transactional outbox

- Status: Accepted
- Date: 2026-10-16

## Context

Modules communicate by integration events, and background work (reminders, renewals, affiliate hold releases, digests) must survive restarts. Publishing an event after `SaveChanges` loses it if the process dies in between. MediatR is now commercially licensed. Hangfire would add a second job system next to whatever carries events.

## Decision

- WolverineFx for in-process messaging, durable local queues, scheduled messages and the outbox.
- Message storage in Postgres (schema `wolverine`), same database as the modules.
- EF Core integration: module DbContexts are registered with `AddDbContextWithWolverineIntegration`, and handlers publish through `IDbContextOutbox<TContext>` so the row and the event commit in one transaction and are delivered after commit.
- Handler discovery is explicit (`IncludeType`) per module; conventional discovery is off.
- Both Host and Worker run Wolverine in Balanced mode with leader election. The Worker exists so durability agents and scheduled messages keep running independently of API scaling. When an external transport (SQS) arrives, the API can stop listening and leave processing to the Worker.
- Wolverine tables are created by `resources setup` in the migration step, not on boot (except in tests).
- Runtime code generation via `WolverineFx.RuntimeCompilation` for now. Pre-generated code (`codegen write` plus `TypeLoadMode.Static`) is the option if cold start matters.

## Consequences

- Events cannot be lost between the DB write and publish.
- Wolverine handlers must be public, which is the one allowed exception to internal-by-default; the architecture test requires their message type to come from a Contracts assembly.
- Wolverine is a significant dependency; its upgrades are grouped by Renovate and covered by the integration tests, which assert an event is handled through the outbox.
