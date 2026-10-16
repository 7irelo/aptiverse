# Affiliate and campus parallel

The zero-cost channel that runs alongside paid. Two motions: recruit affiliates
who promote Aptiverse for a cut, and your own campus/community outreach. Neither
needs the Meta pixel or ad budget, so this can start today while paid is wired.

Two different audiences, two different rulebooks:

- **Affiliate-facing copy** (recruiting promoters): the earnings ARE the product,
  so commission and rand figures are allowed and expected.
- **Student-facing copy** (campus shares): the `ad-copy.md` / `claims-ledger.md`
  rules apply in full. No prices, no guarantees, no red-list features, no emojis,
  no em dashes.

## What is live

- Programme: **40% commission** on the first **3 monthly payments** of each
  referred student (an annual plan counts as **1** commissionable payment). Paid
  after a **30-day hold**. Attribution is lifetime, first-touch-wins.
- Per-signup, at the current catalogue: about **R275** for a Student Max referral
  (R229 x 40% x 3) and **R155** for Student Pro (R129 x 40% x 3). An annual Max is
  ~R916 (one payment). These track the live plan prices.
- Public pages: `/affiliates` (pitch) and `/affiliates/join` (sign up). Top-nav
  "Earn" points at `/affiliates`.
- A referral link is `aptiverse.co.za/?ref=CODE`. First touch is stored on the
  device and survives until the student signs up. Affiliates get their own link
  on `/refer` after joining.

## UTM scheme

Same keys `attribution.ts` captures, so these stay separable from paid and from
each other.

- `utm_source`: `campus`, `whatsapp`, `instagram`, `reddit`, `noticeboard`
- `utm_medium`: `organic`
- `utm_campaign`: `uni_s2_2026` (student acquisition), `affiliate_recruit_2026`
- `utm_content`: the variant or placement

## Motion 1: recruit affiliates

Point promoters at `/affiliates`. Link template:

`https://aptiverse.co.za/affiliates?utm_source=PLACEMENT&utm_medium=organic&utm_campaign=affiliate_recruit_2026`

Examples: `...utm_source=instagram`, `...utm_source=whatsapp`,
`...utm_source=student_entrepreneur_group`.

**Short (status, story, one-liner)**
> Know students who'd use a study tool? Aptiverse pays you 40% on the first three
> months of everyone you refer. Up to R275 per signup. Free to join, get your
> link: [link]

**Group or forum post (student entrepreneurs, side-hustle communities)**
> Aptiverse is a South African study platform and it runs an affiliate programme.
> You get 40% on the first three months of every student who subscribes through
> your link, roughly R275 for a Max plan and R155 for Pro. The link is yours for
> life, attribution is first-touch, and payouts clear after a 30-day hold. No cost
> to join. If you have reach with students, this is a clean fit: [link]

**Direct message**
> Saw you post to a lot of students. Aptiverse pays 40% for three months on anyone
> who subscribes through your link, about R275 a Max signup. Worth a look if you
> want to monetise that audience: [link]

## Motion 2: campus and community (your own outreach)

Student-facing, so no prices. Send people to the value page. Link template:

`https://aptiverse.co.za/for-students?utm_source=campus&utm_medium=organic&utm_campaign=uni_s2_2026&utm_content=PLACEMENT`

Set `utm_content` to where it went: `residence`, `course_chat`, `society`,
`noticeboard`. If a student ambassador is an affiliate, they share their own
`?ref=CODE` link instead so their referrals are credited.

**Residence or society group chat**
> If your marks aren't matching the effort, this actually helped. You add your
> modules and the assessments you really have, and it builds practice for the
> topics you are weakest on, at your year of study. Free to start: [link]

**Course group chat, near a test**
> For anyone worried about the next test: this builds practice from the actual
> assessment you have coming, not generic questions, and tells you which topics
> are weak before the test does. The free tier is usable: [link]

**Noticeboard or one-line drop**
> Study the topics you are actually losing marks on. [link]

**Society or class WhatsApp, longer**
> Most study apps give you generic questions. This one only works from your real
> coursework: you log your modules and assessments, and the practice is generated
> for those, pitched at your year of study. Your weak topics come from your own
> results, not a guess. Free to start, worth a look before the semester gets
> heavy: [link]

## Sequencing

Run this from day one. It is the cheapest source of the first hundred users and it
does not wait on the pixel. Track it in analytics by `utm_source`, and track the
affiliate side by referrals and commission in the `/refer` dashboard. When the
pixel is live, campus links still carry UTMs, so nothing needs to change.
