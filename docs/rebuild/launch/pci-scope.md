# PCI DSS scope

| | |
|---|---|
| ID range | `HRD-108` to `HRD-113` |
| Phase | 6 (design), 10 (evidence) |
| Depends on | `backend/billing.md`, `launch/security.md` (HRD-93), `observability/telemetry.md` (OBS-06) |
| Status | 0 done, 0 partial, 0 unverified, 6 not started |

## Purpose

Keep Aptiverse out of PCI DSS scope beyond SAQ A by never letting card data touch our servers, browsers we control or logs. Paystack handles the card.

## Scope

- Checkout: Paystack hosted checkout (redirect to `checkout.paystack.com`) or the Paystack Popup (Paystack-hosted iframe). No card fields rendered by our code, no Paystack inline card form fed by our inputs.
- Server: the api only sees Paystack references, authorisation codes and customer codes, never PAN, CVV or expiry.
- Webhooks: HMAC-SHA512 verified with the webhook secret from Secrets Manager.
- Evidence: `docs/security/pci-saq-a.md` in the api repo.

## Tasks

- [ ] **HRD-108** Record the decision: hosted checkout or Popup only, with the SAQ A eligibility criteria listed and how each is met
- [ ] **HRD-109** CSP for the checkout page allows only the Paystack origins needed (`js.paystack.co`, `checkout.paystack.com`) and nothing else new; verify page scripts are not modifiable by third parties
- [ ] **HRD-110** Test that no request or response body logged by the api, the BFF or Sentry contains card fields: a log scan over a staging test checkout for PAN patterns returns nothing
- [ ] **HRD-111** Webhook verification test: unsigned, wrongly signed and replayed payloads are rejected or no-ops, and signature check happens before JSON parsing
- [ ] **HRD-112** Confirm admin Paystack cockpit shows only masked card data (last four, brand) as returned by Paystack, never stored in our DB beyond that
- [ ] **HRD-113** Complete SAQ A self-assessment questionnaire with the payments owner, store the signed copy *(human action)*

## Verification

- A grep of the api and web code for card input fields (`cardNumber`, `cvv`, `expiry`) returns nothing outside tests.
- The log scan in HRD-110 is attached to the evidence file.

## Open questions

- Does Paystack require an annual SAQ submission from us at our volume, or only on request?
