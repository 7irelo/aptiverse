# 0001. Modular monolith with real module projects

- Status: Accepted
- Date: 2026-10-16

## Context

The old API grew into 61 projects and four services with no enforced boundaries, so features reached into each other's tables and changes rippled. We are one developer with Claude Code, so a distributed system is not affordable, but we still want to be able to pull a module out later.

## Decision

One deployable (.NET 10) built from module projects:

- Each module is `Aptiverse.<Name>` (internal implementation) plus `Aptiverse.<Name>.Contracts` (public integration events and query interfaces).
- Everything in a module is `internal` except its registration class (`Add<Name>Module`, `Map<Name>Endpoints`) and Wolverine handlers.
- A module references only `Aptiverse.SharedKernel` and other modules' Contracts.
- Each module has its own DbContext, Postgres schema and migrations history table. No cross-schema foreign keys.
- The same modules run in two roles from one image: `Aptiverse.Host` (HTTP) and `Aptiverse.Worker` (background).
- `tests/Aptiverse.ArchitectureTests` enforces these rules, so they hold without relying on review.

## Consequences

- Boundaries are compile-time and test-time facts, not conventions.
- Extracting a module into a service later means swapping in-process event delivery for a transport, not untangling tables.
- Cross-module reads need a Contracts query interface or a local projection fed by events, which is more work than a join. That cost is intended.
