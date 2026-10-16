# Meta pixel + Conversions API: wiring runbook

Step-by-step to switch on measurement. The code (browser pixel, funnel events,
server-side Conversions API) already exists; this only supplies the values and
flips it on. Nothing here should be skipped, paid media without this is spending
blind.

Meta renames things often, so labels below may differ slightly. The pixel is now
sometimes called a "dataset"; the ID is the same either way.

## Who does what

| Step | You | Me |
|---|---|---|
| Create the pixel, get the ID | yes | |
| Generate the CAPI access token | yes | |
| Add `META_CAPI_ACCESS_TOKEN` GitHub secret | yes | |
| Set `NEXT_PUBLIC_META_PIXEL_ID` in Vercel + redeploy | | yes |
| Set `META_PIXEL_ID` GitHub secret + redeploy API | | yes |
| Create the FirstPractice custom conversion | | yes (or you) |
| Verify events fire (Test Events + walkthrough) | | yes |

You handle the two things tied to your Meta account and the one sensitive secret.
You hand me the Pixel ID (it is public, not sensitive) and I do the rest.

## The three env values (reference)

- `NEXT_PUBLIC_META_PIXEL_ID` (web / Vercel) = the numeric Pixel ID. Build-time,
  so setting it needs a web redeploy to take effect.
- `META_PIXEL_ID` (API / GitHub secret) = the same numeric Pixel ID.
- `META_CAPI_ACCESS_TOKEN` (API / GitHub secret) = the Conversions API token.

The API's server-side reporting is off (a silent no-op) until BOTH API values are
present, so the pixel and the token have to land together.

## Step 1: create the pixel (you)

1. Go to Events Manager: `business.facebook.com/events_manager`.
2. Connect data source > Web > confirm (Meta Pixel).
3. Name it (e.g. "Aptiverse"), enter `https://aptiverse.co.za`.
4. Skip any code-install prompt, ours is already in the app.
5. Open the data source; copy the **Pixel ID** (a long number) from the top.

Send me that ID.

## Step 2: generate the Conversions API token (you)

1. In Events Manager, select the pixel > **Settings**.
2. Scroll to **Conversions API** > **Generate access token** (under "Set up
   manually"). Approve the prompts.
3. Copy the token. Treat it like a password. Do not paste it into chat.

## Step 3: add the token as a GitHub secret (you)

1. `github.com/aptiverse-labs/api` > **Settings** > **Secrets and variables** >
   **Actions**.
2. **New repository secret**:
   - Name: `META_CAPI_ACCESS_TOKEN`
   - Value: the token from step 2.
3. Save. That is the only secret you add by hand.

## Step 4: hand me the Pixel ID (you -> me)

Once you send the Pixel ID, I:

1. Set `NEXT_PUBLIC_META_PIXEL_ID` in **Vercel** (Project > Settings >
   Environment Variables, Production) and trigger a web redeploy so the value is
   baked into the client bundle.
2. Set the `META_PIXEL_ID` GitHub secret and trigger an API redeploy
   (`gh workflow run` / a push) so the container picks up both Meta secrets.

After both redeploys, the browser pixel and the server-side CAPI are live.

## Step 5: set the optimisation target (me or you)

In Events Manager > **Custom Conversions** > Create, based on the custom event
**FirstPractice**. This is what ad sets optimise toward, NOT registration.
Registration is cheap to buy from people who never return; first practice attempt
is the first moment the product actually worked.

The funnel events the pixel will start seeing:

| App event | Meta event | Type |
|---|---|---|
| signup_started | SignupStarted | custom |
| signup_completed | CompleteRegistration | standard |
| onboarding_completed | OnboardingCompleted | custom |
| practice_attempt_submitted | PracticeAttempt | custom |
| first_practice_attempt | **FirstPractice** | custom (optimise here) |
| subscribe_started | InitiateCheckout | standard |
| subscription_activated | (server-side, CAPI) | Purchase |

## Step 6: verify before spending (me)

1. In Events Manager > **Test Events**, get the test code (optional) so events
   show up immediately.
2. I walk the live funnel: land, register, onboard, submit a practice attempt,
   start checkout.
3. Confirm each event appears, that browser and server events **deduplicate** on
   the shared `event_id`, and that consent gating works (events only fire after
   the cookie banner is accepted).

Only once this passes green does any paid spend make sense.

## Rollback

Remove the two GitHub secrets and unset the Vercel var, then redeploy. The code
falls back to its no-op path (server) and no pixel loads (browser). Nothing else
depends on these.
