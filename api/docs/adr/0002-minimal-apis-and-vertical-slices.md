# 0002. Minimal APIs and vertical slices

- Status: Accepted
- Date: 2026-10-16

## Context

Controllers plus layered services spread one use case across many folders and made the OpenAPI document drift from reality. We want each use case readable in one place and an accurate generated contract.

## Decision

- HTTP endpoints are Minimal APIs grouped per module (`MapGroup("/support")`, tag = module name).
- Endpoints return `TypedResults` with explicit return types (`Results<Created<T>, ProblemHttpResult>`) so metadata is exact.
- Operation ids are camelCase via `WithName("listFaqs")`; they become the generated client's function names.
- Code is organised by feature: `Features/<UseCase>/` holds the endpoint, request and response records, validator and handler.
- Expected failures travel as `Result`/`Error` and map to RFC 9457 ProblemDetails. Unexpected exceptions go through one `IExceptionHandler` that never leaks messages.
- Every request type has a FluentValidation validator, applied with `.WithValidation<T>()`. An architecture test enforces the validator exists.

## Consequences

- A use case is one folder; deleting a feature is deleting a folder.
- Some duplication between slices is accepted over shared service layers.
- Handlers are plain classes resolved from DI. Wolverine is used for messaging, not as an HTTP mediator.
