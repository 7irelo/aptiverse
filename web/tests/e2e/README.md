# End-to-end tests

Playwright + Cucumber-style BDD scenarios that drive a real browser
against the local dev stack. The same test exercises the Next.js UI,
the .NET API, and Postgres in a single run, so we catch regressions
across all three layers.

## What you need running first

1. **Postgres** via SSH tunnel to the dev RDS
   ```powershell
   ssh -i C:\Dev\aptiverse-labs\infra\terraform\envs\dev\aptiverse-dev.pem `
       -L 5432:aptiverse-dev.ctguiw0wkcql.af-south-1.rds.amazonaws.com:5432 `
       -N ec2-user@15.240.75.50
   ```
2. **.NET API** on `http://localhost:5100`
   ```powershell
   cd C:\Dev\aptiverse-labs\api
   # load .env first (see api/.env)
   dotnet run
   ```
3. **Next.js UI** on `http://localhost:3000`
   ```bash
   npm run dev
   ```

## Setup once

```bash
cp tests/e2e/.env.example tests/e2e/.env
# Fill in E2E_TEST_EMAIL / E2E_TEST_PASSWORD with a dedicated test account
# (the suite creates and deletes content under that account)
```

## Run

```bash
npm run e2e            # headless
npm run e2e:headed     # visible browser (good for debugging)
npm run e2e:ui         # Playwright UI mode
```

## Layout

```
tests/e2e/
  features/            *.feature  Gherkin scenarios
  steps/               *.steps.ts  Step definitions
  fixtures.ts          Custom Playwright fixtures (authenticated API client)
  playwright.config.ts
  .env                 (gitignored) test creds
```

## How a scenario works

```gherkin
Scenario: Student logs a Maths SBA test
  Given I have a subject "Mathematics" in grade 12 on the NSC curriculum
  When I create an assessment titled "Calculus & Trig Test" with type test weight 15% due in 14 days
  Then the API should report an assessment titled "Calculus & Trig Test"
```

- **Given** sets up state via direct API calls (fast, deterministic)
- **When** drives the UI like a user would (clicks, fills, navigates)
- **Then** asserts both UI visibility and API state

A `Before` hook in `steps/common.steps.ts` resets the test user's
content (assessments, non-compulsory subjects, goals) before each
scenario so they don't pollute each other.

## When tests fail

Playwright drops `trace.zip`, screenshot, and video into `test-results/`
on every failure. Open the trace with:

```bash
npx playwright show-trace test-results/.../trace.zip
```
