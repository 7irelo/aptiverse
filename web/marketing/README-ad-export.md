# Exporting ad creative to PNG

The ad creative is code. It lives in `web/src/app/(marketing)/ads/units/`,
renders in the browser at exact platform pixel sizes, and is captured to PNG by
a Playwright script. There is no design file to keep in sync and no image
generator in the loop: the units are built from the same theme tokens and the
same product depictions as the site, so when the product or the palette moves,
re-running the export is the whole update.

## Run it

The export shoots a running dev server. Start one if it is not already up, then:

```bash
cd web
npm run dev            # only if nothing is serving on :3000 already
node scripts/export-ads.mjs
```

PNGs land in `web/marketing/ad-exports/`. That directory is gitignored on
purpose. Do not commit the images; commit the code that makes them.

Flags:

| Flag | Default | What it does |
| --- | --- | --- |
| `--only <text>` | all units | Only slugs containing this text, e.g. `--only tutor` |
| `--base <url>` | `http://localhost:3000` | Point at a preview deploy instead |
| `--out <dir>` | `marketing/ad-exports` | Relative to `web/` |
| `--scale <n>` | `2` | Device scale factor |

At the default scale a 1080x1350 unit writes a 2160x2700 file. That is
deliberate: every platform downscales, and giving them twice the pixels is the
difference between crisp type and mushy type in a feed.

The first run on a new machine needs the browser binary:

```bash
npx playwright install chromium
```

## Look before you spend

`http://localhost:3000/ads/units` is a contact sheet of every unit at thumbnail
size, which is roughly the size a platform shows them at. If a headline stops
working there it will not work in the wild. Each thumbnail links to
`/ads/units/<slug>`, which renders that one unit alone at full size.

Both pages are `noindex,nofollow` and are not in any public navigation.

## What is in the set

Units are grouped by who can actually pay, in that order.

**University students (primary).** They control their own money and decide
without a parental approval step. Their world is semesters, courses they add
themselves, first-year volume and their own exam timetable. No grades, no
terms, no matric anywhere in this group.

| Slug | Size | Scheme | Concept |
| --- | --- | --- | --- |
| `uni-student-product-1080x1350` | 1080x1350 | dark | The practice generator: you add the course, it writes the questions |
| `uni-student-typographic-1080x1080` | 1080x1080 | dark | Words only, one citron block |
| `uni-student-problem-1080x1920` | 1080x1920 | dark | Week 9, six courses, a plan for none of them |
| `uni-student-mastery-1080x1350` | 1080x1350 | light | The mastery read, per topic and per course |
| `uni-student-landscape-1200x628` | 1200x628 | dark | Link ad: a tutor that already knows your courses |

**Parents (secondary).** Buying for a child at a fee-paying school.
Consent-based visibility, never surveillance.

| Slug | Size | Scheme | Concept |
| --- | --- | --- | --- |
| `parent-privacy-1080x1080` | 1080x1080 | light | Support without surveillance |
| `parent-product-1080x1350` | 1080x1350 | light | Every child and what each has due |
| `parent-landscape-1200x628` | 1200x628 | light | Ask a useful question, not a vague one |

**Tutors.** The supply side.

| Slug | Size | Scheme | Concept |
| --- | --- | --- | --- |
| `tutor-commission-1080x1080` | 1080x1080 | dark | Get found. Keep every rand. |
| `tutor-story-1080x1920` | 1080x1920 | dark | You set R350. You keep R350. |

**Brand.**

| Slug | Size | Scheme | Concept |
| --- | --- | --- | --- |
| `og-default-1200x630` | 1200x630 | dark | Open Graph card |

Institutional and public-school creative is deliberately not in this set. That
buyer has the longest cycle and no self-serve path, so nothing is being spent
on them yet.

## Why each unit picks a scheme

An exported PNG has no OS colour scheme to follow, so every unit commits to one
at author time rather than inheriting anything.

- **University units are dark graphite.** They compete in a feed that is mostly
  dark UI and mostly viewed at night, and graphite with a single citron block is
  the most separable thing we can put in it. The one exception,
  `uni-student-mastery`, is light so the two portrait units in the same audience
  do not read as the same ad run twice.
- **Parent units are light.** The proposition is calm and trust-shaped. A black
  square with a child's name on it reads as an alarm.
- **Tutor units are dark**, because the money line is the whole ad and citron on
  graphite is the loudest legal way to say it.
- **The Open Graph card is dark**, because every platform that unfurls a link
  renders the card on white chrome.

Citron is a surface everywhere, never a text colour. It only ever appears as a
filled block or pill with graphite ink on it. On paper it scores 1.4:1, so
citron type would be illegible at exactly the size platforms show these at.

## The Open Graph image

The site had no `og:image` at all before this work, so every share and every
WhatsApp forward rendered as a grey rectangle.

The live tag is served by `web/src/app/opengraph-image.tsx`, generated at
request time by `next/og`. It is not a committed PNG on purpose: a file in
`public/` is something a person has to remember to regenerate, and the failure
mode when they forget is a meta tag pointing at a 404.

`og-default-1200x630` in the ad set is the same design as a capturable file,
for anywhere that needs an actual image to upload (a paid placement, a press
kit). If one changes, change the other.

`metadataBase` in `web/src/app/layout.tsx` decides the absolute URL the tag
resolves to. It defaults to `https://aptiverse.co.za` and reads
`NEXT_PUBLIC_SITE_URL` if you need to point a staging host at itself.

## The rule these were built under

A picture is a claim, and a mockup reads as evidence. Every product depiction in
`depictions.tsx` is a redraw of a screen that renders today, and each carries a
note naming the page and the endpoint behind it.

Nothing in this set shows: citations on an AI answer, worked solutions, a
mastery confidence band, an SBA draft coach, counsellor or tutor booking,
teacher or school views, offline mode, WhatsApp, or any parent-visible read of a
child's marks, mood or diary. Each of those was checked against the API and does
not exist. Bursaries are not on the platform at all and must never reappear.

If a new unit needs a screen to exist, build the screen first.
