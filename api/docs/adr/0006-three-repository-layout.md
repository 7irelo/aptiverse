# 0006. Three repositories: api, web, infra

- Status: Accepted
- Date: 2026-10-16

## Context

The code is moving from the personal `7irelo/aptiverse` monorepo to private org repos. A monorepo would let one PR change the API, client and UI together, but the org repos are already in place and give each part its own pipeline and permissions.

## Decision

- `aptiverse-labs/api` (this repo), `aptiverse-labs/web` and `aptiverse-labs/infra`.
- Contract flow: api CI generates `openapi/v1.json` on every merge and publishes it as a versioned artifact. web pins a spec version, regenerates its client with `npm run api:sync`, and fails CI if the committed client does not match. A bot PR opens in web when api publishes a new spec.
- infra owns every deploy definition, including the local compose stack (`../infra/local/compose.yml`). api and web carry no copies of deploy or compose files.
- Analytics, when it arrives, is a fourth repo.

## Consequences

- An API change and the web change that uses it are two PRs, linked by the spec version.
- Local dev expects the repos checked out side by side.
- Deploy drift between app repos and infra (the cause of lost uploads in the old setup) is not possible because only infra defines deploys.
