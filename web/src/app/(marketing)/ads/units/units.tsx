"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  Artboard,
  AdBody,
  AdCta,
  AdEyebrow,
  AdFooter,
  AdHeadline,
  CitronBlock,
  ScaledDepiction,
  Wordmark,
  adSurfaces,
  CITRON,
  type AdScheme,
} from "./adkit";
import {
  CourseListDepiction,
  MasteryDepiction,
  ParentDepiction,
  PracticeDepiction,
  TutorChatDepiction,
  TutorMathsDepiction,
} from "./depictions";
import { CARD_UNITS } from "./cards";
import { ORGANIC_UNITS } from "./organic";
import { SHOWCASE_UNITS } from "./showcase";

// =====================================================================
// The exportable ad units.
//
// One entry per creative. Each renders at an exact platform size, commits
// to one colour scheme (a PNG has no OS scheme to follow), and is written
// for one audience with one concept. Audiences are ordered by who can
// actually pay today:
//
//   uni     university students, who buy their own study tools and decide
//           without a parental approval step. Semesters, courses they add
//           themselves, first-year volume. Never grades, terms or matric.
//   parent  parents at fee-paying schools. Consent-based visibility only.
//   tutor   the supply side.
//
// Deliberately absent: any institutional or public-school unit. That
// segment is deferred, and building creative for it now would spend the
// budget on the buyer with the longest cycle.
//
// Scheme choices, per audience rather than per unit, so a campaign reads as
// one campaign:
//   - University units are DARK graphite. They compete in a feed that is
//     mostly dark UI and mostly viewed at night, and graphite with a single
//     citron block is the most separable thing we can put there.
//   - Parent units are LIGHT. The proposition is calm and trust-shaped;
//     a black square with a child's name on it reads as an alarm.
//   - Tutor units are DARK, because the money line is the whole ad and
//     citron on graphite is the loudest legal way to say it.
//   - The Open Graph card is DARK, because link previews are rendered on
//     white chrome by every platform that shows them.
// =====================================================================

export type AdUnit = {
  slug: string;
  width: number;
  height: number;
  scheme: AdScheme;
  // "organic" is not a fourth demographic: it is the same university
  // student seen in a feed they chose rather than an ad break. Kept as its
  // own bucket so paid and organic never get shipped as one campaign.
  audience: "uni" | "parent" | "tutor" | "brand" | "organic";
  concept: "product" | "typographic" | "problem" | "og" | "chart" | "carousel";
  /** What a human should understand this unit is doing. */
  note: string;
  render: () => React.ReactNode;
};

// ---------------------------------------------------------------------
// UNIVERSITY STUDENTS (primary)
// ---------------------------------------------------------------------

function UniProduct() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1350} scheme={scheme}>
      <AdEyebrow scheme={scheme}>For students</AdEyebrow>
      <Box sx={{ height: 34 }} />
      <AdHeadline scheme={scheme} size={92}>
        You add the course. It writes the questions.
      </AdHeadline>
      <Box sx={{ height: 22 }} />
      <AdBody scheme={scheme} size={31} maxWidth={860}>
        Original practice, weighted to your weakest topic, marked the moment you finish.
      </AdBody>
      <Box sx={{ height: 34 }} />
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <PracticeDepiction scheme={scheme} />
      </Box>
      <Box sx={{ height: 34 }} />
      <AdFooter scheme={scheme} cta="Start free" />
    </Artboard>
  );
}

function UniTypographic() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1080} scheme={scheme}>
      <AdEyebrow scheme={scheme}>For students</AdEyebrow>
      <Box sx={{ flex: 1 }} />
      <AdHeadline scheme={scheme} size={136}>
        Study with a plan,
      </AdHeadline>
      <Box sx={{ mt: "14px" }}>
        <CitronBlock size={136} px={26} py={8}>
          not panic.
        </CitronBlock>
      </Box>
      <Box sx={{ height: 40 }} />
      <AdBody scheme={scheme} size={36} maxWidth={840}>
        Practice, mastery and goals for the courses you are actually taking. Free to start.
      </AdBody>
      <Box sx={{ flex: 1 }} />
      <AdFooter scheme={scheme} />
    </Artboard>
  );
}

function UniProblem() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1920} scheme={scheme}>
      <AdEyebrow scheme={scheme} size={26}>
        Week 9
      </AdEyebrow>
      <Box sx={{ height: 40 }} />
      <AdHeadline scheme={scheme} size={112}>
        Six courses. A plan for none of them.
      </AdHeadline>
      <Box sx={{ height: 30 }} />
      <AdBody scheme={scheme} size={36} maxWidth={880}>
        Aptiverse turns what you are taking into what you should practise next.
      </AdBody>
      {/* Two weighted spacers rather than one. A story is 1920 tall and the
          platform covers the top ~250 and bottom ~350 with its own UI, so the
          product wants to sit just above centre with the CTA clear of the
          bottom furniture. A single trailing spacer left a dead third. */}
      <Box sx={{ flex: 0.6, minHeight: 40 }} />
      <CourseListDepiction scheme={scheme} />
      <Box sx={{ flex: 1, minHeight: 40 }} />
      <Box>
        <CitronBlock size={64} px={22} py={10}>
          Start with the 44%.
        </CitronBlock>
      </Box>
      <Box sx={{ height: 44 }} />
      <AdFooter scheme={scheme} cta="Start free" size={34} />
    </Artboard>
  );
}

function UniMastery() {
  const scheme: AdScheme = "light";
  return (
    <Artboard width={1080} height={1350} scheme={scheme}>
      <AdEyebrow scheme={scheme}>Mastery</AdEyebrow>
      <Box sx={{ height: 34 }} />
      <AdHeadline scheme={scheme} size={88}>
        Know which topic is costing you. Before the exam does.
      </AdHeadline>
      <Box sx={{ height: 22 }} />
      <AdBody scheme={scheme} size={31} maxWidth={880}>
        Worked out from your own answers, topic by topic, course by course.
      </AdBody>
      <Box sx={{ height: 34 }} />
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <MasteryDepiction scheme={scheme} />
      </Box>
      <Box sx={{ height: 34 }} />
      <AdFooter scheme={scheme} cta="Start free" />
    </Artboard>
  );
}

function UniLandscape() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1200} height={628} scheme={scheme} pad={56}>
      <Stack direction="row" spacing="48px" sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ width: 560, flexShrink: 0 }}>
          <AdEyebrow scheme={scheme} size={20}>
            For students
          </AdEyebrow>
          <Box sx={{ height: 22 }} />
          <AdHeadline scheme={scheme} size={62}>
            A tutor that already knows your courses.
          </AdHeadline>
          <Box sx={{ height: 18 }} />
          <AdBody scheme={scheme} size={25}>
            It is handed your level and what you are studying before you ask a thing.
          </AdBody>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing="20px" alignItems="center">
            <AdCta size={24}>Start free</AdCta>
            <Wordmark scheme={scheme} size={28} />
          </Stack>
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          <ScaledDepiction designWidth={1080} width={536}>
            <TutorChatDepiction scheme={scheme} />
          </ScaledDepiction>
        </Box>
      </Stack>
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// PARENTS (secondary)
// ---------------------------------------------------------------------

function ParentPrivacy() {
  const scheme: AdScheme = "light";
  return (
    <Artboard width={1080} height={1080} scheme={scheme}>
      <AdEyebrow scheme={scheme}>For parents</AdEyebrow>
      <Box sx={{ flex: 1 }} />
      <AdHeadline scheme={scheme} size={132}>
        Support
        <br />
        without
      </AdHeadline>
      <Box sx={{ mt: "14px" }}>
        <CitronBlock size={132} px={26} py={8}>
          surveillance.
        </CitronBlock>
      </Box>
      <Box sx={{ height: 40 }} />
      <AdBody scheme={scheme} size={34} maxWidth={860}>
        You see what each child has due. You never see the diary. It is not a setting you can turn
        on.
      </AdBody>
      <Box sx={{ flex: 1 }} />
      <AdFooter scheme={scheme} cta="See Parent plans" />
    </Artboard>
  );
}

function ParentProduct() {
  const scheme: AdScheme = "light";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1350} scheme={scheme}>
      <AdEyebrow scheme={scheme}>For parents</AdEyebrow>
      <Box sx={{ height: 34 }} />
      <AdHeadline scheme={scheme} size={86}>
        Every child, and what each of them has due.
      </AdHeadline>
      <Box sx={{ height: 22 }} />
      <AdBody scheme={scheme} size={31} maxWidth={880}>
        So the conversation starts from something real instead of a vague question at dinner.
      </AdBody>
      <Box sx={{ height: 34 }} />
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <ParentDepiction scheme={scheme} />
      </Box>
      <Box sx={{ height: 24 }} />
      <Typography sx={{ fontSize: 26, color: s.muted }}>
        Parent plans from R159 a month for one child. Each extra child costs less than the first.
      </Typography>
      <Box sx={{ height: 20 }} />
      <AdFooter scheme={scheme} cta="Start free" />
    </Artboard>
  );
}

function ParentLandscape() {
  const scheme: AdScheme = "light";
  return (
    <Artboard width={1200} height={628} scheme={scheme} pad={56}>
      <Stack direction="row" spacing="48px" sx={{ flex: 1, minHeight: 0 }}>
        <Stack sx={{ width: 560, flexShrink: 0 }}>
          <AdEyebrow scheme={scheme} size={20}>
            For parents
          </AdEyebrow>
          <Box sx={{ height: 22 }} />
          <AdHeadline scheme={scheme} size={58}>
            Ask a useful question, not a vague one.
          </AdHeadline>
          <Box sx={{ height: 18 }} />
          <AdBody scheme={scheme} size={25}>
            Your children in one place, with what is due for each. One bill. No reading over their
            shoulder.
          </AdBody>
          <Box sx={{ flex: 1 }} />
          <Stack direction="row" spacing="20px" alignItems="center">
            <AdCta size={24}>Start free</AdCta>
            <Wordmark scheme={scheme} size={28} />
          </Stack>
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
          <ScaledDepiction designWidth={1080} width={536}>
            <ParentDepiction scheme={scheme} />
          </ScaledDepiction>
        </Box>
      </Stack>
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// TUTORS (supply side)
// ---------------------------------------------------------------------

function TutorCommission() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1080} scheme={scheme}>
      <AdEyebrow scheme={scheme}>For tutors</AdEyebrow>
      <Box sx={{ flex: 1 }} />
      <AdHeadline scheme={scheme} size={128}>
        Get found.
      </AdHeadline>
      <Box sx={{ mt: "14px" }}>
        <CitronBlock size={128} px={26} py={8}>
          Keep every rand.
        </CitronBlock>
      </Box>
      <Box sx={{ height: 40 }} />
      <AdBody scheme={scheme} size={34} maxWidth={880}>
        List a public profile free. Families find you, you arrange the lesson, and you are paid
        directly. Aptiverse never takes a cut.
      </AdBody>
      <Box sx={{ flex: 1 }} />
      <AdFooter scheme={scheme} cta="List your profile free" url="aptiverse.co.za/for-tutors" />
    </Artboard>
  );
}

function TutorStory() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1920} scheme={scheme}>
      <AdEyebrow scheme={scheme} size={26}>
        For tutors
      </AdEyebrow>
      <Box sx={{ height: 40 }} />
      <AdHeadline scheme={scheme} size={120}>
        You set R350. You keep R350.
      </AdHeadline>
      <Box sx={{ height: 30 }} />
      <AdBody scheme={scheme} size={36} maxWidth={900}>
        Not a lower commission. No commission.
      </AdBody>
      <Box sx={{ flex: 0.6, minHeight: 52 }} />
      <TutorMathsDepiction scheme={scheme} />
      <Box sx={{ flex: 1, minHeight: 40 }} />
      <Box>
        <CitronBlock size={64} px={22} py={10}>
          Listing is free.
        </CitronBlock>
      </Box>
      <Box sx={{ height: 44 }} />
      <AdFooter scheme={scheme} cta="Get listed" url="aptiverse.co.za/for-tutors" size={34} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// OPEN GRAPH
// ---------------------------------------------------------------------
// The site had no og:image at all, so every share, every WhatsApp forward and
// every Slack unfurl rendered as a bare grey rectangle. This is the capture
// source for one; app/opengraph-image.tsx serves the live equivalent so the
// tag is never pointed at a file somebody forgot to upload.
function OpenGraphCard() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1200} height={630} scheme={scheme} pad={64}>
      <Stack direction="row" alignItems="center" spacing="20px">
        <Box sx={{ width: 16, height: 44, bgcolor: CITRON, borderRadius: "3px" }} />
        <Wordmark scheme={scheme} size={44} />
      </Stack>
      <Box sx={{ flex: 1 }} />
      <AdHeadline scheme={scheme} size={82} maxWidth={980}>
        Study with a plan, not panic.
      </AdHeadline>
      <Box sx={{ height: 24 }} />
      <AdBody scheme={scheme} size={30} maxWidth={900}>
        Practice, mastery, wellbeing and goals in one calm place. High school and university, in
        South Africa.
      </AdBody>
      <Box sx={{ flex: 1 }} />
      <Typography sx={{ fontSize: 28, color: s.muted, letterSpacing: "-0.01em" }}>
        aptiverse.co.za
      </Typography>
    </Artboard>
  );
}

// ---------------------------------------------------------------------

export const AD_UNITS: AdUnit[] = [
  {
    slug: "uni-student-product-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "Portrait feed. The practice generator, which is the thing a first-year is buying: they add their own course and get questions back.",
    render: () => <UniProduct />,
  },
  {
    slug: "uni-student-typographic-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "uni",
    concept: "typographic",
    note: "Square feed. No product, the words carry it. One citron block does all the emphasis.",
    render: () => <UniTypographic />,
  },
  {
    slug: "uni-student-problem-1080x1920",
    width: 1080,
    height: 1920,
    scheme: "dark",
    audience: "uni",
    concept: "problem",
    note: "Story and reel. Names the week-9 feeling first, then shows the four courses and points at the weakest one.",
    render: () => <UniProblem />,
  },
  {
    slug: "uni-student-mastery-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "light",
    audience: "uni",
    concept: "product",
    note: "Portrait feed, second product angle. The mastery read, deliberately light so the two portrait units do not look like the same ad twice.",
    render: () => <UniMastery />,
  },
  {
    slug: "uni-student-landscape-1200x628",
    width: 1200,
    height: 628,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "Meta link ad, LinkedIn, Google Display. Headline left, tutor chat right.",
    render: () => <UniLandscape />,
  },
  {
    slug: "parent-privacy-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "light",
    audience: "parent",
    concept: "typographic",
    note: "Square feed. The privacy boundary is the one thing here that is enforced rather than described, so it is the whole ad.",
    render: () => <ParentPrivacy />,
  },
  {
    slug: "parent-product-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "light",
    audience: "parent",
    concept: "product",
    note: "Portrait feed. The parent dashboard exactly as it is: children, what is due, and the diary they cannot open.",
    render: () => <ParentProduct />,
  },
  {
    slug: "parent-landscape-1200x628",
    width: 1200,
    height: 628,
    scheme: "light",
    audience: "parent",
    concept: "problem",
    note: "Meta link ad and LinkedIn. Frames the problem as the useless dinner-table question.",
    render: () => <ParentLandscape />,
  },
  {
    slug: "tutor-commission-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "tutor",
    concept: "typographic",
    note: "Square feed. The live for-tutors headline, set large, with the money word on citron.",
    render: () => <TutorCommission />,
  },
  {
    slug: "tutor-story-1080x1920",
    width: 1080,
    height: 1920,
    scheme: "dark",
    audience: "tutor",
    concept: "problem",
    note: "Story and reel. Does the arithmetic with our own numbers only, and makes no claim about what anyone else charges.",
    render: () => <TutorStory />,
  },
  {
    slug: "og-default-1200x630",
    width: 1200,
    height: 630,
    scheme: "dark",
    audience: "brand",
    concept: "og",
    note: "Open Graph and Twitter card. Mirrors app/opengraph-image.tsx, which is what actually serves the tag.",
    render: () => <OpenGraphCard />,
  },

  // -------------------------------------------------------------------
  // ORGANIC. Posts rather than ads: no CTA pill, no landing-page push,
  // and each one has to be worth looking at even if nobody clicks. Built
  // in organic.tsx and charts.tsx; see the header of each for what is and
  // is not allowed on them.
  // -------------------------------------------------------------------
  {
    slug: "org-chart-projection-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "dark",
    audience: "organic",
    concept: "chart",
    // The note used to say "three rows honestly left unprojected", which was
    // true of an earlier, wrong version of AERO_COURSES. Every course in the
    // seeded account projects, and the data was corrected without the note
    // following it.
    note: "THE chart. Dumbbell of current mark to projected mark across one student's six courses, full 0-100 domain, five flat or climbing and one falling. Status colours validated with the dataviz palette validator (CVD dE 10.2 deutan).",
    render: () => <ORGANIC_UNITS.ChartPortrait />,
  },
  {
    slug: "org-chart-projection-1080x1920",
    width: 1080,
    height: 1920,
    scheme: "dark",
    audience: "organic",
    concept: "chart",
    note: "The same chart cut for story, reel and WhatsApp status. Plot sits in the middle band, clear of the platform furniture top and bottom.",
    render: () => <ORGANIC_UNITS.ChartStory />,
  },
  {
    slug: "org-week9-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "organic",
    concept: "typographic",
    note: "Square feed. No product at all. The week-9 observation, made to be recognised and forwarded, with the wordmark as the only ask.",
    render: () => <ORGANIC_UNITS.WeekNine />,
  },
  {
    slug: "org-recall-idea-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "light",
    audience: "organic",
    concept: "typographic",
    note: "Portrait feed. One study technique, complete and usable on paper, branded only in the footer. The screenshot-and-send unit.",
    render: () => <ORGANIC_UNITS.RecallIdea />,
  },
  {
    slug: "org-free-tier-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "light",
    audience: "organic",
    concept: "product",
    note: "Portrait feed. The free plan stated in full, every figure read out of the entitlements seeder, including the line saying what is not free.",
    render: () => <ORGANIC_UNITS.FreeTier />,
  },
  {
    slug: "org-carousel-1of5-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "organic",
    concept: "carousel",
    note: "Carousel 1/5. Hook: the app refuses before it obliges.",
    render: () => <ORGANIC_UNITS.CarouselOne />,
  },
  {
    slug: "org-carousel-2of5-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "organic",
    concept: "carousel",
    note: "Carousel 2/5. What the generator already knows before you type anything.",
    render: () => <ORGANIC_UNITS.CarouselTwo />,
  },
  {
    slug: "org-carousel-3of5-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "organic",
    concept: "carousel",
    note: "Carousel 3/5. The only product picture in the set, reusing the real practice depiction.",
    render: () => <ORGANIC_UNITS.CarouselThree />,
  },
  {
    slug: "org-carousel-4of5-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "organic",
    concept: "carousel",
    note: "Carousel 4/5. The integrity rules, which are real: one attempt, timed, tutor locked, focus loss recorded.",
    render: () => <ORGANIC_UNITS.CarouselFour />,
  },
  {
    slug: "org-carousel-5of5-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "organic",
    concept: "carousel",
    note: "Carousel 5/5. Closes the loop back to mastery and states the free numbers.",
    render: () => <ORGANIC_UNITS.CarouselFive />,
  },

  // -------------------------------------------------------------------
  // SHOWCASE SHEET. The features page compressed into one postable picture:
  // nine real screens on an even grid, each labelled, so a reader sees the
  // whole product in one sweep. Built in showcase.tsx; the header there
  // records which surface came from which screen and what is legible at
  // which viewing size.
  //
  // Deliberately dense and small typed, which is the opposite of every
  // other unit here. The paid units interrupt somebody with one idea; this
  // one rewards stopping. Complementary to org-chart-projection-*, which
  // owns the projection as a plot.
  // -------------------------------------------------------------------
  {
    slug: "showcase-sheet-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "THE sheet. Portrait feed. Nine real surfaces on a 3x3 grid: courses, mastery, projection, the timed runner, the ground rules, assessments, an auto-checked goal, the tutor, the diary check-in.",
    render: () => <SHOWCASE_UNITS.ShowcasePortrait />,
  },
  {
    slug: "showcase-sheet-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "Square cut. Six surfaces on a 3x2 grid rather than the portrait squashed: a whole row is dropped, not shrunk.",
    render: () => <SHOWCASE_UNITS.ShowcaseSquare />,
  },
  {
    slug: "showcase-sheet-1080x1920",
    width: 1080,
    height: 1920,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "Story and reel. The same nine, with the grid in the middle band clear of the platform furniture top and bottom.",
    render: () => <SHOWCASE_UNITS.ShowcaseStory />,
  },

  // -------------------------------------------------------------------
  // THREE-SCREEN UNIT. The answer to "the sheet is too busy, just show 3
  // pages", and to the second note on top of it: three windows stacked with
  // a caption each is an inventory, not a layout.
  //
  // So this is the features page compressed into one image, using that
  // page's own rhythm: copy left / screen right, screen left / copy right,
  // copy left / screen right, with the rows deliberately unequal and one
  // citron accent on the row that matters. Built in cards.tsx; the header
  // there records the composition decisions, which screen each row is drawn
  // from, and what survives at thumbnail size.
  //
  // These are the only units in the registry that paint the macOS traffic
  // lights in their real hues. That is deliberate and scoped: window
  // furniture, not brand colour, and nothing else on the artboard borrows
  // them.
  // -------------------------------------------------------------------
  {
    slug: "three-cards-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "THE three-screen unit, portrait feed and the cut the composition is authored at. Alternating copy and screen down the page: the AI tutor, the projection plotted across all six real courses on a 0-100 axis, and the exam paper mid attempt with its countdown and written answer. Citron on row one only.",
    render: () => <CARD_UNITS.CardsPortrait />,
  },
  {
    slug: "three-cards-1080x1080",
    width: 1080,
    height: 1080,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "Square cut, and TWO rows rather than three. A square is a whole row shorter; cramming the third in would mean 250px bands with the copy squeezed to a line. The exam paper is what goes, because the swap from tutor to projection is the minimum the rhythm needs.",
    render: () => <CARD_UNITS.CardsSquare />,
  },
  {
    slug: "three-cards-1080x1920",
    width: 1080,
    height: 1920,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "Story and reel. All three rows in the middle band, clear of the platform furniture. The extra height goes into air rather than more content.",
    render: () => <CARD_UNITS.CardsStory />,
  },
  {
    slug: "three-cards-1350x1920",
    width: 1350,
    height: 1920,
    scheme: "dark",
    audience: "uni",
    concept: "product",
    note: "The wide cut of the three-screen unit, 45:64. Same composition, same copy, more width in both columns. The projection row is why it exists: its 0-100 domain gets roughly 450px here against roughly 260 on the 1080 cuts, so the travel between the current mark and the projected one is legible on every course. No platform-safe spacers, because this is a feed image and not a story.",
    render: () => <CARD_UNITS.CardsWide />,
  },
  {
    slug: "showcase-sheet-light-1080x1350",
    width: 1080,
    height: 1350,
    scheme: "light",
    audience: "uni",
    concept: "product",
    note: "The same nine on paper. For a deck, a pitch page, a printed one-pager, or anywhere the sheet lands on white.",
    render: () => <SHOWCASE_UNITS.ShowcaseLight />,
  },
];

export const AUDIENCE_LABELS: Record<AdUnit["audience"], string> = {
  uni: "University students",
  parent: "Parents",
  tutor: "Tutors",
  brand: "Brand",
  organic: "Organic posts",
};

export function findUnit(slug: string): AdUnit | undefined {
  return AD_UNITS.find((u) => u.slug === slug);
}
