# Aptiverse paid campaign: strategy

Companion documents: `claims-ledger.md` for what may be said,
`ad-copy.md` for the creative itself.

## The commercial decision this plan is built on

Aptiverse is going after the people who can pay, first. Not because the
other segments matter less, but because a business needs revenue and
proof before it can serve anyone at scale. That sequencing is the
backbone of this plan and it drives every budget and channel choice
below.

**Lead audience: university students.** They are the segment most likely
to convert on paid traffic. They hold their own payment method, they
already pay for their own subscriptions, they decide alone with no
approval step in the way, the price point is a self-serve impulse rather
than a household negotiation, and semester exams give a sharp, recurring
purchase trigger. The product genuinely fits them: tertiary users build
their own courses rather than following CAPS, practice generation pitches
difficulty at their year of study, and the AI tutor is instructed not to
say CAPS, SBA, NSC or matric to them.

**Second: parents who can comfortably pay.** Independent, private and
fee-paying suburban schools. This is where high-school students are
reached, through the parent who holds the card, which is why high school
does not get its own paid headline set. The parent motion has a longer
consideration cycle and a consent step, so it opens after the university
motion is producing repeatable cost per acquisition.

**Third, and running from day one at low spend: tutors.** Tutors are
supply, not revenue. The marketplace and the jobs board are only worth
anything to a student if there are tutors in them, so tutor acquisition
runs early and cheap to build liquidity, on its own budget line, judged
on profile completions rather than subscription revenue.

**Deferred: government and public schools, and any institutional B2B
motion.** Two independent reasons. Commercially, it is a long, sales-led,
procurement-bound cycle that will consume the budget that needs to be
proving unit economics. Technically, the teacher and school-admin
surfaces are not built: classes, assignments, verifications, school
analytics and readiness reports all return empty arrays today. Selling
into a school right now would be selling a shell.

Conditions that open the school phase, all of them, not any of them:

1. A teacher and school-admin product that actually returns data.
2. Repeatable, positive unit economics on at least one self-serve
   audience, so institutional sales is funded by a working business
   rather than by hope.
3. Two or three named reference customers with permission to be named,
   and outcomes we measured ourselves rather than claimed.
4. A person who owns the sales motion. Institutional sales is not a
   paid-media problem and should not be run out of an ad budget.

## Positioning

The category is crowded with generic AI study tools. The defensible
position is not "AI for studying", it is: **Aptiverse only works from
your real work.**

Every mechanic in the product refuses to invent. Practice tests will not
generate without a real assessment logged against a real course. Mastery
returns nothing until there is evidence. Goals are re-measured against
what actually happened rather than what was promised. Term projections
need graded marks before they will say anything.

That is the story, and it is true, which is why it can carry a campaign.
The tone follows from it: calm, plain, specific, no hype, no urgency
theatre, no guarantee. A product that refuses to overstate should not be
advertised by copy that does.

## Pricing in creative: none

No rand figures appear in any ad, ever. The creative sells the outcome
and sends people to `/pricing`, where the numbers are rendered live from
the plan catalogue. Two reasons. Hardcoded prices in marketing prose
drift out of sync with the catalogue and become a false statement. And
price discovery in the ad filters out people before the value has landed.

The team must still know the real catalogue so that nothing in creative
contradicts it. Confirmed live from `GET /api/entitlements/plans`:

| Code | Name | Monthly | Annual | Members |
|---|---|---:|---:|---:|
| `free` | Free | no charge | no charge | 1 |
| `student.pro` | Student Pro | R129 | R1 290 | 1 |
| `student.max` | Student Max | R229 | R2 290 | 1 |
| `parent` | Parent (1 child) | R159 | R1 590 | 1 |
| `parent.2` | Parent (2 children) | R269 | R2 690 | 2 |
| `parent.3` | Parent (3 children) | R379 | R3 790 | 3 |
| `parent.4` | Parent (4 children) | R489 | R4 890 | 4 |
| `tutor.free` | Tutor Free | no charge | no charge | 1 |
| `tutor.pro` | Tutor Pro | R199 | R1 990 | 1 |
| `tutor.premium` | Tutor Premium | R349 | R3 490 | 1 |
| `school` | School | custom, sales-led | custom | up to 5 000 |

Commission is null on every plan. Aptiverse takes no cut of tutoring
income on any tier including free, so "0% commission tier" is wrong in
both directions and must not be used.

Two things creative may safely say about money without a number: there
is a free tier that is genuinely usable, and Aptiverse never takes a cut
of what a tutor earns.

## Writing for South Africa

This is the differentiator. Generic edtech copy loses here.

**Two calendars, not one.** The university year runs roughly February to
June, then July to November, with two examination seasons, supplementary
and deferred windows, and a DP requirement that can end a module before
the exam does. The school year runs in four terms with school-based
assessment accumulating through it, so a large share of the final mark is
already fixed before the finals begin. Never plan a campaign against a
northern-hemisphere September start.

**Devices and data.** Assume a mid-range Android phone, a shared
household device in the parent segment, and metered mobile data.
Campus wifi is free and mobile data is not, which is a real behavioural
split for university students: they batch heavy work on campus. Creative
should be legible at small size, first frame readable with sound off, and
short enough not to feel expensive to watch. The product is not offline
capable, so never say offline. "Light on data" is the honest phrasing and
only if the pages actually are.

**Load shedding.** Real, and it is a study-planning problem rather than a
product feature. The honest angle is that work saves as you go and the
plan does not fall apart when the power does, not that the app works
without a connection.

**WhatsApp.** It is where South Africa actually talks, and Aptiverse has
no WhatsApp integration at all. That constraint is absolute: no
WhatsApp-based funnel, no "get updates on WhatsApp", no click-to-chat
promise. What is allowed is organic sharing, a link that survives being
pasted into a group chat, and making sure the landing pages preview well
when shared. Treat WhatsApp as a distribution surface we benefit from, not
a channel we operate.

**Language.** English for paid, because that is where the product's
interface is. Do not machine-translate ads into languages the product
cannot serve.

## Audience sequencing and what has to be true to move on

**Phase 1, now: university students.** One audience, one offer, one
landing page, enough spend to learn. Move on when cost per registration
is stable and known, free-to-paid conversion has been measured over a
full month, and at least one creative angle has beaten the others twice
in a row.

**Phase 2, parents.** Opens when phase 1 has a known blended cost per
paying user, the parent invite and consent flow has been walked
end-to-end by someone outside the team, and the parent overview shows
something worth paying for on a child who has only been active for a week.
Until a new child's first week produces a useful parent view, parent
acquisition will churn.

**Phase 3, schools.** Conditions listed above. Not a paid-media phase.

Tutors run alongside phase 1 at a small fixed budget throughout.

## Channel plan

**Meta, Facebook and Instagram. Primary.** Best reach and cheapest
learning in South Africa, with the age and location precision the
university audience needs. Instagram Reels and Stories carry the student
creative, Facebook carries the parent creative later. Blocker: the pixel
does not exist yet. See measurement.

**TikTok. Secondary, high potential for the university audience.** The
format rewards a real person talking about a real problem, which suits a
product whose story is "it only works from your actual work". Cheaper
impressions than Meta. Requires creative made for the platform, not a
cut-down of a polished video.

**Google Search. Small, high intent.** A tight brand-defence campaign
plus a handful of exact-match problem terms. Not a volume channel at this
budget, but it catches people already looking.

**YouTube. Later.** The 60s and 90s cuts fit here once they have been
rewritten against the claims ledger, which they currently fail. Hold
until the creative is truthful and there is enough budget for frequency.

**LinkedIn. Not now.** It is expensive, and the audience it reaches well
is the institutional one that has been deferred. Revisit at phase 3.

**Campus and community, unpaid or nearly so.** Residence and society
groups, course and module group chats, student-run pages, and campus
noticeboards. This is where the university audience actually lives and it
costs almost nothing. It needs a person and a link, not a media buy. Run
it in parallel with paid and treat it as the cheapest source of the first
hundred real users.

**WhatsApp. Cannot be operated.** Stated above. No integration, no funnel,
no promise.

**Email. Owned, not paid.** Outbound runs through Amazon SES which is
still sandboxed, so bulk sending is not available until production access
is granted. Do not build a campaign that depends on nurture email until
that is cleared.

## Campaign calendar, keyed to the South African academic year

Dates are the shape of the year, not exact timetable claims. Confirm
exact examination windows before scheduling flights against them.

**January.** Universities: supplementary and deferred exams, then
registration and orientation. The highest-intent moment of the year for a
first-year, and the moment a student who nearly failed decides to work
differently. Schools: the year opens, parents are buying.
Run: heavy university flight around registration and orientation.

**February to March.** Semester one under way, first tests land, the
first-year reality check arrives. Schools are in term one and the first
SBA marks come back.
Run: sustained university spend. This is the strongest window of the year
because the problem has just become concrete.

**April to May.** Semester one build-up to exams, DP requirements start
to bite. Schools reach term one reports and term two.
Run: university retargeting on exam preparation. Open parent testing here
if phase 2 conditions are met, because term one reports are the moment a
parent sees a problem in writing.

**June.** Semester one examinations, mid-year school examinations.
Run: low new-acquisition spend, both audiences are heads-down. Retarget
existing free users toward paid rather than buying new ones.

**July.** Semester two registration, second chance to change how the year
goes. Schools in term three, matric SBA load peaks.
Run: second heavy university flight. Parent flight if open.

**August to September.** Semester two coursework, school preliminary
examinations, the matric run-in.
Run: steady spend both sides. Highest parent intent of the year sits here.

**October to November.** Semester two examinations, then NSC and IEB
finals.
Run: taper new acquisition. Nobody adopts a new tool in an exam hall.

**December.** Results, then the gap. Low intent, cheap inventory.
Run: minimal spend. Use the period to rebuild creative and fix
measurement.

## Budget tiers

**Tier one, smallest viable budget.** One audience: university students.
One channel: Meta, Instagram placements. Two or three creative angles,
one variable different between them. One landing page: `/for-students`.
Do not split the budget across audiences at this level, it just buys
noise in three places instead of a signal in one. Keep a small fixed
amount on tutor acquisition because marketplace liquidity is a
prerequisite, not a growth lever.

**Tier two, once cost per registration is known.** Add TikTok for the
university audience, add retargeting for site visitors who did not
register, add the brand-defence search campaign. Begin parent testing at
a small fraction of total spend, on Facebook only.

**Tier three, once a paying cohort exists and has been measured.** Scale
whichever audience has the better payback, add YouTube for the video
cuts, widen search beyond brand terms, and fund the campus and community
motion properly with a person rather than a budget line.

Rule that holds at every tier: no channel gets scaled on impressions or
clicks. Nothing scales until it has produced registrations that can be
traced to it.

## A/B testing plan

One variable per test. Everything else held constant, including audience,
placement, budget and landing page. Run each test until it has enough
registrations to mean something, not until it looks like it is winning.

| # | Audience | Single variable | Hypothesis |
|---|---|---|---|
| 1 | University | Headline angle: exam pressure versus wasted study time | The wasted-effort framing beats the deadline framing because it is not seasonal |
| 2 | University | Creative format: static versus short video | Short video wins on cost per click, static wins on cost per registration |
| 3 | University | Landing page: `/for-students` versus `/register` | Sending straight to register wins on volume, features page wins on quality of registration |
| 4 | University | Call to action wording: "Start free" versus "See how it works" | Lower-commitment wording lifts clicks but the registration rate decides it |
| 5 | University | Specificity: named institutions in the copy versus generic "university" | Naming the institution lifts relevance enough to beat the smaller audience |
| 6 | Tutors | Offer framing: get found versus keep every rand | The no-commission fact is the sharper hook |
| 7 | Parents, phase 2 | Emotional register: reassurance versus visibility | Visibility without surveillance outperforms reassurance because it is concrete |
| 8 | Parents, phase 2 | Whose voice: parent-facing versus student-facing creative aimed at parent placement | Parents respond to seeing the child's experience, not to being addressed |

Retire a loser rather than tinkering with it. A test that produced no
clear result is a test that needed more budget or a bigger variable, not
a result to interpret.

## Measurement, and the blocker

**There is no analytics installed. None.** The web application has no
analytics dependency of any kind: no Meta pixel, no Google tag, no
PostHog, no Plausible, no Vercel Analytics. Nothing in `package.json`,
nothing in the root layout. Every conversion claim any campaign makes
today would be unverifiable.

This is the single largest blocker to spending money. Paid media without
conversion tracking is not a campaign, it is a donation. Before the first
rand is spent:

1. Install a product analytics tool and instrument the funnel: landing
   page view, register start, register complete, education level chosen,
   first study unit created, first assessment logged, first practice test
   generated, first attempt submitted, upgrade started, upgrade completed.
2. Install the Meta pixel and the conversions API, and the TikTok pixel if
   TikTok is in the plan. Server-side conversion reporting matters more
   than usual here because mobile browser tracking prevention is
   aggressive on the devices this audience uses.
3. Decide the single conversion event that campaigns optimise toward. It
   should not be registration. Registration is cheap and easy to buy from
   people who never return. Optimise toward first practice attempt
   submitted, which is the first moment the product has actually done its
   job.
4. Add UTM discipline on every link, including the campus and community
   links, so unpaid distribution can be separated from paid.

**What to track once instrumented.**

- Cost per registration, by audience and by creative.
- Registration to activation rate, activation being first practice
  attempt submitted.
- Activation to paid conversion, and the lag between them.
- Free tier quota exhaustion rate. Free gives three practice generations
  a month, so hitting that ceiling is the clearest upgrade signal the
  product has and it should be a tracked event.
- Retention at day seven and day thirty, by audience.
- For tutors: profile created, profile completed, first proposal
  submitted, connects spent.
- For parents: invite sent, invite accepted. The accept rate is the
  health metric of the entire parent motion.

**What not to track as a success metric.** Impressions, reach,
click-through rate in isolation, and follower growth. They are diagnostic
at best and they invite scaling something that is not working.
