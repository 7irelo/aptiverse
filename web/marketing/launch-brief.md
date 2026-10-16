# Tier-1 launch brief

The concrete first flight, built from `ad-copy.md` (ledger-checked) and
`campaign-strategy.md`. Every headline and body line here is lifted verbatim
from an approved variant, so nothing contradicts `claims-ledger.md`: no prices,
no guarantees, no red-list features.

**Do not spend until measurement is live.** `NEXT_PUBLIC_META_PIXEL_ID` (web),
`META_PIXEL_ID` and `META_CAPI_ACCESS_TOKEN` (API) must be set, the pixel must be
seeing events in Test Events, and the `FirstPractice` custom conversion must
exist. Optimise every ad set toward **FirstPractice**, never registration.

## UTM scheme

Put these on every link, including unpaid campus/community shares, so paid,
organic and affiliate traffic stay separable. These are the keys
`web/src/lib/analytics/attribution.ts` already captures.

- `utm_source`: `meta`, `tiktok`, `google`, `campus`
- `utm_medium`: `paid_social`, `paid_search`, `organic`
- `utm_campaign`: `uni_s2_2026`, `tutor_supply_2026`
- `utm_content`: the creative variant (e.g. `wasted_effort`)

## Campaign 1: university students (lead, primary spend)

- Audience: university students. Placement: Instagram Reels + Stories.
- Landing: `/for-students`. Channel: Meta.
- A/B test 1 (from strategy): headline angle only, everything else identical.

Held constant across both variants:
- Primary text: "Add your modules and real assessments. Get practice built for
  them, at your level. Your weak topics come from your own results."
- Description: "Works from your real work"
- CTA button: Learn More

**Variant A, wasted-effort** (`ad-copy.md` uni headline 1)
- Headline: "Study the topics you're losing marks on"
- Link: `https://aptiverse.co.za/for-students?utm_source=meta&utm_medium=paid_social&utm_campaign=uni_s2_2026&utm_content=wasted_effort`

**Variant B, exam-pressure** (`ad-copy.md` uni headline 4)
- Headline: "Know your weak topics before the test"
- Link: `https://aptiverse.co.za/for-students?utm_source=meta&utm_medium=paid_social&utm_campaign=uni_s2_2026&utm_content=exam_pressure`

Retire the loser once one variant has enough registrations to mean something,
not once it looks like it is winning. Next tests, in order: format (static vs
short video), then landing (`/for-students` vs `/register`), then CTA wording.

## Campaign 2: tutors (parallel, small fixed budget)

Runs from day one, judged on completed profiles and first proposals, not on
subscription revenue. Sharper hook is the no-commission fact (strategy test 6).

- Audience: tutors, incl. postgraduates tutoring undergraduates.
- Placement: Meta feed. Landing: `/for-tutors`.
- Headline: "We never take a cut. Not on any plan." (`ad-copy.md` tutor headline 2)
- Primary text: "Free profile. Real requests from students. You arrange the
  lessons and keep everything you earn."
- Description: "Your rates, your money"
- CTA button: Sign Up
- Link: `https://aptiverse.co.za/for-tutors?utm_source=meta&utm_medium=paid_social&utm_campaign=tutor_supply_2026&utm_content=no_commission`

## Not in this flight

Parents (phase 2, opens only when the phase-2 conditions in the strategy are
met), TikTok, Google Search, and YouTube all wait for later tiers. Affiliate
referrals run in parallel as a zero-cost channel and are briefed separately.
