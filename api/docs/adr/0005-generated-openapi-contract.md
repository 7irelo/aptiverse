# 0005. Generated OpenAPI contract, committed and diffed in CI

- Status: Accepted
- Date: 2026-10-16

## Context

The web app hand-wrote API types, and the old API had two documentation stacks (Swashbuckle and ReDoc). Contract drift between api and web caused bugs.

## Decision

- The built-in `Microsoft.AspNetCore.OpenApi` generator is the only source of the spec. `Microsoft.Extensions.ApiDescription.Server` writes it at build time to `openapi/v1.json`, which is committed.
- CI rebuilds and fails if `openapi/v1.json` differs from the committed file. CI also publishes it as a build artifact for the web repo, which pins a version and generates its client with Orval.
- JSON numbers are strict (`JsonNumberHandling.Strict`) so integers are typed as integers in the contract.
- Scalar is the one docs UI, mapped in Development only.

## Consequences

- Every API change is visible as a diff to `openapi/v1.json` in review.
- Response records are the contract; renaming a property is a breaking change and shows up as one.
- The app boots during build to produce the document, so startup must tolerate having no database in that mode (handled by `PlatformHostingExtensions.IsBuildTimeDocumentGeneration`).
