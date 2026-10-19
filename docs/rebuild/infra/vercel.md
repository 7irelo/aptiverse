# Vercel project (web hosting)

| | |
|---|---|
| ID range | INF-25, INF-158 to INF-166 |
| Phase | 1 (project and env vars), 2 (auth secrets), 10 (protection and domains for prod) |
| Depends on | REPO-01 (web repo in the org), INF-82 (DNS records), OBS-04 (Sentry source maps) |
| Code path | `web/vercel.json` (`"regions": ["cpt1"]`); everything else is Vercel project settings |
| Status | INF-25 partial: the region pin is in code; the project, its environment variables, domains and protection settings cannot be verified from the repo. |

## Purpose

Host the Next.js 16 web app on Vercel in the Cape Town region, with one project linked to `aptiverse-labs/web`, environment variables per Vercel environment (Preview, a `dev` custom environment or branch, Production), and domains matching the Cloudflare records.

## Scope

- Code: `web/vercel.json` (framework nextjs, region `cpt1`), `web/.env.example` (documents `API_INTERNAL_URL`, `API_SPEC_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`), `web/src/lib/dev-tools.ts` (dev tools off when `VERCEL_ENV = production`).
- Settings to manage: project link, Node 24, build command, environment variables per environment (plus Auth.js secrets from Phase 2: `AUTH_SECRET`, `AUTH_URL`, Google client id and secret if the BFF does the OAuth dance), domains, deployment protection, Git integration (preview per PR, production on tag per CI-26).
- Option: manage the project with the `vercel/vercel` Terraform provider in this repo, or keep it in the dashboard and document it here.

## Tasks

- [ ] **INF-25** Vercel project pinned to `cpt1`, env vars per environment. *(partial: `web/vercel.json` pins `cpt1`; project and env vars unverified)*
- [x] **INF-158** Region pin in code. *(`web/vercel.json` `"regions": ["cpt1"]`)*
- [ ] **INF-159** Project linked to `aptiverse-labs/web` with the production branch and ignored build step policy agreed with CI-26 (production deploys only from release tags or a promote step, not from every push to main). *(unverified: Vercel settings)*
- [ ] **INF-160** Environment variables per environment: Preview and dev point `API_INTERNAL_URL` at the dev api, staging at the staging api, Production at the prod api; `NEXT_PUBLIC_APP_ENV` set to `preview`, `dev`, `staging`, `prod`; Sentry DSN and build-time `SENTRY_*` set; sensitive values marked Sensitive. Record the full list with sources in `web/.env.example`. *(unverified: Vercel settings)*
- [ ] **INF-161** Domains: `aptiverse.co.za`, `www`, `app`, `dev`, `staging` added to the project and verified, matching the records in `dns.md` (INF-82), with the canonical host redirect decided (apex or `app`). *(unverified: Vercel settings)*
- [ ] **INF-162** Deployment protection: Vercel Authentication on Preview deployments (students must not land on previews), protection bypass token for CI E2E and Lighthouse stored as a GitHub secret. *(unverified: Vercel settings)*
- [ ] **INF-163** Function region check: confirm server functions and the BFF route run in `cpt1` (response header `x-vercel-id` contains `cpt1`) so server-to-server calls to af-south-1 stay low latency.
- [ ] **INF-164** Infrastructure as code decision: manage the Vercel project, env vars and domains with the `vercel/vercel` Terraform provider (new `modules/vercel-project`, token in GitHub secrets) or keep dashboard-managed with a quarterly settings review. Record the decision; if Terraform, import the existing project.
- [ ] **INF-165** Double proxy decision: Cloudflare proxied in front of Vercel (one WAF, but Vercel advises against it for caching and certificates) or DNS-only with Vercel Firewall for web hostnames. Align with `edge-security.md` INF-93.
- [ ] **INF-166** Preview environments and the dev api: previews call the dev api server to server, so the dev api CORS list does not need preview origins; browser uploads from previews follow the decision in `storage.md` (INF-60). Document in the web README.

## Verification

- `cat web/vercel.json` shows `cpt1`.
- `vercel env ls` (with the project linked) lists every variable from `web/.env.example` for each environment.
- `curl -sI https://dev.aptiverse.co.za` returns a `x-vercel-id` header containing `cpt1`.
- An anonymous visit to a preview URL shows the Vercel login after INF-162.
- `vercel domains inspect aptiverse.co.za` shows the domain verified.

## Open questions

- Is a Vercel Pro plan in the budget (custom environments, deployment protection options, team seats)?
- Decided (64): the apex `aptiverse.co.za` is canonical for the product; `www` redirects to it.
