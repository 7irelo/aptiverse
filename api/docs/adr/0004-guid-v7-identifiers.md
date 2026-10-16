# 0004. Guid v7 identifiers for every entity

- Status: Accepted
- Date: 2026-10-16

## Context

The old schema mixed int, string and Guid keys, which caused id-type confusion across features and in the web app. Random Guid v4 keys fragment B-tree indexes.

## Decision

- Every entity derives from `Entity`, whose `Id` is `Guid.CreateVersion7()`, assigned in the application (`ValueGeneratedNever`).
- Users use the same scheme, so every `user_id` is `uuid`.
- Ids are safe to expose in URLs and API payloads.

## Consequences

- Ids sort by creation time, so inserts append to the index instead of scattering.
- Ids exist before the insert, which lets a handler publish an event referencing the new row inside the same transaction.
- The creation time is roughly readable from the id; nothing secret may depend on ids being unguessable.
- The data migration (Phase 11) maps old ids to new ones.
