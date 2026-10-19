# Phase 0 live-app stabilisation (old code)

| | |
|---|---|
| ID range | `FIX-01` to `FIX-30` |
| Phase | 0 |
| Owner repo | `7irelo/aptiverse` (old code on `origin/main`, commit `f223ca7`), deployed to EC2 (api) and Vercel (web) |
| Depends on | SEC rotation tasks for anything that touches credentials |
| Status | 0 done, 0 partial, 30 unverified (live app and EC2 host cannot be checked from this tree) |

## Purpose

Keep the live app safe and stop data loss while the rebuild happens. These are small fixes to the OLD code, not rebuild work. The live app is what `origin/main` of `7irelo/aptiverse` holds (`f223ca7`); the local `main` in this tree is 6 commits ahead with the rebuild and must not be pushed over it by accident.

## Scope

- Old code paths (read with `git show f223ca7:<path>`):
  - `api/.github/workflows/deploy.yml` (inline compose, no uploads volume)
  - `infra/compose.prod.yml` (has the `assessment_uploads` volume)
  - `api/Modules/AcademicPlanning/Aptiverse.Api.Infrastructure/Storage/LocalDiskAssessmentUploadStorage.cs`
  - `api/Modules/Auth/Aptiverse.Application/Auth/Services/AuthService.cs` (line 218 `CheckPasswordAsync`)
  - `api/Registrations.cs` (`AddRateLimitingServices`, partitions by tier name)
  - `api/Controllers/InsightsController.cs`
  - `api/Middleware/ExceptionHandlingFilter.cs`
  - `api/Program.cs` (lines 156 and 157 clear `KnownNetworks` and `KnownProxies`)
  - `infra/terraform/envs/dev/main.tf` (security group variables default `0.0.0.0/0`, RDS retention 1 day)
  - `web/src/app/(app)/teacher/**` and `web/src/app/(app)/school-admin/**`
- Work happens on a branch of the old repo (for example `hotfix/phase-0`), never on top of the rebuild history.

## Tasks

### Uploads (data loss)

- [ ] **FIX-01** `deploy.yml` uses `infra/compose.prod.yml` (or add `assessment_uploads` volume and `AssessmentUploads__RootPath` to the inline compose) *(unverified: live app, check old code at f223ca7 and the EC2 host)*
- [ ] **FIX-14** Deploy FIX-01 and confirm an upload survives a second redeploy (split from FIX-01) *(unverified: live app)*
- [ ] **FIX-02** Check the EC2 host for surviving uploads (`docker volume ls`, container filesystems, `/opt/aptiverse`) *(unverified: EC2 host)*
- [ ] **FIX-15** Copy surviving uploads off the box to a private, versioned S3 bucket with a checksum manifest; this feeds MIG-19 (split from FIX-02) *(unverified: EC2 host and AWS)*

### Auth and rate limits

- [ ] **FIX-03** `AuthService.LoginUserAsync` uses `SignInManager.CheckPasswordSignInAsync` with `lockoutOnFailure: true` *(unverified: live app, check old code at f223ca7)*
- [ ] **FIX-16** Verify lockout: five wrong passwords lock the test account, correct password then fails until lockout ends (split from FIX-03) *(unverified: live app)*
- [ ] **FIX-04** Rate limiter in `api/Registrations.cs` partitions by user id (signed in) or client IP (anonymous) *(unverified: live app)*
- [ ] **FIX-05** Paystack webhook gets its own rate-limit partition *(unverified: live app)*
- [ ] **FIX-06** Strict rate-limit policy on login and register (for example 5 per minute per IP) *(unverified: live app)*
- [ ] **FIX-17** Verify FIX-04 to FIX-06: burst 20 login attempts from one IP returns 429 while another IP still logs in, and a Paystack test webhook succeeds during the burst (split from FIX-04) *(unverified: live app)*

### Data exposure

- [ ] **FIX-07** Insights live-activity endpoints in `InsightsController.cs` restricted to `Admin,Superuser` *(unverified: live app)*
- [ ] **FIX-08** `ExceptionHandlingFilter` stops returning `ex.Message`; returns a generic message plus a trace id *(unverified: live app)*
- [ ] **FIX-18** Verify FIX-07 and FIX-08: a teacher token gets 403 on the SSE endpoint; a forced exception returns no stack or message text (split from FIX-08) *(unverified: live app)*
- [ ] **FIX-11** Hide teacher and school-admin pages (random data) from navigation and route them to not-found *(unverified: live web on Vercel)*
- [ ] **FIX-19** Also hide the random charts in `parent/wellbeing` or replace them with "no data yet" (split from FIX-11) *(unverified: live web)*

### Network and origin

- [ ] **FIX-09** EC2 security group: HTTP from Cloudflare ranges only *(unverified: AWS state)*
- [ ] **FIX-20** EC2 security group: SSH from the owner IP only, or closed in favour of SSM Session Manager (split from FIX-09) *(unverified: AWS state)*
- [ ] **FIX-10** Forwarded headers in `Program.cs` trusted from Cloudflare ranges only (stop clearing `KnownNetworks`) *(unverified: live app)*
- [ ] **FIX-21** Verify from outside Cloudflare that the origin IP refuses port 80 and 22 (`nc -zv <origin> 80`) (split from FIX-09) *(unverified: live host)*

### Backups

- [ ] **FIX-12** Move AWS account off the free plan *(unverified: AWS billing)*
- [ ] **FIX-22** Raise old RDS backup retention to 7 days (split from FIX-12) *(unverified: AWS state)*
- [ ] **FIX-13** Manual RDS snapshot of the old instance *(unverified: AWS state)*
- [ ] **FIX-23** Test restore of that snapshot into a scratch instance, check row counts on five key tables, then delete the scratch instance; record the time taken (split from FIX-13) *(unverified: AWS state)*

### Operating the old app until cutover (added)

- [ ] **FIX-24** Freeze non-fix changes to the old app: branch protection on `7irelo/aptiverse` `main`, only `hotfix/*` PRs merge until cutover *(unverified: GitHub settings)*
- [ ] **FIX-25** Make sure nobody pushes the local rebuild `main` to `7irelo/aptiverse`: rename the local remote or set a pre-push hook that refuses `origin` from this tree *(unverified: each working copy)*
- [ ] **FIX-26** Confirm the old Vercel project's env vars, region and production branch, and record them for CUT tasks *(unverified: Vercel dashboard)*
- [ ] **FIX-27** External uptime check on the live app (home page and `/health`) every 5 minutes, alert by email *(unverified: monitoring service)*
- [ ] **FIX-28** Weekly manual RDS snapshot of the old instance until cutover, retained 30 days *(unverified: AWS state)*
- [ ] **FIX-29** Sentry or log check after each fix deploy: no new error class for 24 hours *(unverified: live app logs)*
- [ ] **FIX-30** Record every fix deploy (date, commit, verifier) in `docs/rebuild/phase-0/live-app-log.md` *(unverified: depends on fix deploys)*

## Verification

- Each fix has its paired verify task ticked with evidence (command output or screenshot) linked in the log from FIX-30.
- Uploads: a file uploaded before a redeploy is downloadable after it.
- `curl -I https://<api>/api/...` from a non-Cloudflare IP fails to connect.
- RDS console shows retention 7 days and a restore test record.

## Open questions

- Is the old app's api deployed from `api/.github/workflows/deploy.yml` or the root `.github/workflows/dev-deploy.yml` (both exist at `f223ca7`)? The fix goes into whichever actually runs.
- Decided (61): teacher and tutor accounts migrate as students or parents where possible and the rest are hidden until Phase 12. Still open: whether a notice is needed before hiding the pages.
