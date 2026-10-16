"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import {
  BookOpenCheck,
  CalendarCheck,
  EyeOff,
  HeartPulse,
  Layers,
  MessageSquare,
  Target,
} from "lucide-react";
import {
  Artboard,
  AdBody,
  AdEyebrow,
  AdHeadline,
  CitronBlock,
  ScaledDepiction,
  Wordmark,
  adSurfaces,
  CITRON,
  GRAPHITE,
  type AdScheme,
} from "./adkit";
import { PracticeDepiction } from "./depictions";
import { ProjectionDumbbell, ProjectionLegend } from "./charts";

// =====================================================================
// ORGANIC units. These are posts, not ads.
//
// The eleven units in units.tsx are paid: they interrupt someone, sell,
// and push to a landing page. These are the opposite end. Somebody
// follows the account, or a friend forwards one. So the bar is that the
// image has to be worth looking at even if the viewer never clicks:
// useful, specific, or quietly funny about being a student. There is no
// call to action on any of them and no "start free" pill; the wordmark
// and the URL sit in the footer and that is the whole ask.
//
// Audience is university students. Semesters, modules they chose
// themselves, first-year volume, week 9. Never school framing: no CAPS,
// no matric, no grades, no terms.
//
// Every number on every one of these is either computed by the product
// or read from the plan catalogue seeder. Nothing here is an outcome
// statistic, because the product has never measured an outcome.
// =====================================================================

const SITE = "aptiverse.co.za";

/** Footer for an organic unit: no CTA pill, just who made it. */
function OrganicFooter({ scheme, size = 30 }: { scheme: AdScheme; size?: number }) {
  const s = adSurfaces(scheme);
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing="20px"
      sx={{ pt: `${size * 0.8}px`, borderTop: `2px solid ${s.hair}` }}
    >
      <Wordmark scheme={scheme} size={size * 1.05} />
      <Typography sx={{ fontSize: size * 0.85, color: s.muted, letterSpacing: "-0.01em" }}>
        {SITE}
      </Typography>
    </Stack>
  );
}

// ---------------------------------------------------------------------
// 1. THE CHART. Portrait feed.
//
// The mastery projection is the most useful thing the product computes
// and the only one that is worth a chart on its own. The headline is the
// reading of the chart, not a claim about the product.
// ---------------------------------------------------------------------
function ChartPortrait() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1350} scheme={scheme}>
      <AdEyebrow scheme={scheme} size={23}>
        One student, six courses, week 9
      </AdEyebrow>
      <Box sx={{ height: 26 }} />
      <AdHeadline scheme={scheme} size={82} maxWidth={900}>
        51 is not the problem. 51 heading for 46 is.
      </AdHeadline>
      <Box sx={{ height: 20 }} />
      <AdBody scheme={scheme} size={28} maxWidth={880}>
        A first-year Engineering student&rsquo;s six courses. The mark now, against the mark
        projected from the graded work already logged.
      </AdBody>
      <Box sx={{ height: 26 }} />
      <ProjectionLegend scheme={scheme} size={23} />
      <Box sx={{ height: 22 }} />
      <ProjectionDumbbell scheme={scheme} scale={{ name: 30, value: 29, row: 94, dot: 21 }} />
      <Box sx={{ flex: 1, minHeight: 16 }} />
      <Typography sx={{ fontSize: 22, lineHeight: 1.4, color: s.muted, maxWidth: 900 }}>
        Five are flat or climbing. One is not, and it was heading there before anyone noticed. This
        is arithmetic on marks already logged, weighted by topic mastery from practice. It is not a
        forecast of a final result.
      </Typography>
      <Box sx={{ height: 26 }} />
      <OrganicFooter scheme={scheme} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// 2. THE CHART. Story, reel and WhatsApp status.
//
// Same data, laid out for a 9:16 frame where the platform covers roughly
// the top 250 and bottom 350 with its own furniture, so the plot sits in
// the middle band and nothing load-bearing goes near an edge.
// ---------------------------------------------------------------------
function ChartStory() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1920} scheme={scheme}>
      <Box sx={{ height: 120 }} />
      <AdEyebrow scheme={scheme} size={26}>
        Six courses, week 9
      </AdEyebrow>
      <Box sx={{ height: 32 }} />
      <AdHeadline scheme={scheme} size={96} maxWidth={920}>
        One of these is moving backwards.
      </AdHeadline>
      <Box sx={{ height: 26 }} />
      <AdBody scheme={scheme} size={32} maxWidth={900}>
        Mark now, against the mark projected from graded work already logged.
      </AdBody>
      <Box sx={{ flex: 0.7, minHeight: 34 }} />
      <ProjectionLegend scheme={scheme} size={26} />
      <Box sx={{ height: 26 }} />
      <ProjectionDumbbell scheme={scheme} scale={{ name: 36, value: 34, row: 118, dot: 25 }} />
      <Box sx={{ flex: 1, minHeight: 30 }} />
      <Typography sx={{ fontSize: 26, lineHeight: 1.4, color: s.muted, maxWidth: 920 }}>
        One of the six is going the wrong way. Nobody had noticed yet.
      </Typography>
      <Box sx={{ height: 34 }} />
      <OrganicFooter scheme={scheme} size={34} />
      <Box sx={{ height: 150 }} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// 3. Week 9. The observation post. No product at all: this one exists to
//    be recognised and forwarded, and the wordmark is the only ask.
// ---------------------------------------------------------------------
function WeekNine() {
  const scheme: AdScheme = "dark";
  return (
    <Artboard width={1080} height={1080} scheme={scheme}>
      <AdEyebrow scheme={scheme}>Week 9</AdEyebrow>
      <Box sx={{ flex: 1 }} />
      {/* The citron phrase has to fit one line. Wrapped over two it stops
          being an emphasis and becomes a slab that eats the frame. */}
      <AdHeadline scheme={scheme} size={112} maxWidth={940}>
        Six modules. Each one behaving like
      </AdHeadline>
      <Box sx={{ mt: "16px" }}>
        <CitronBlock size={112} px={24} py={8}>
          the only one.
        </CitronBlock>
      </Box>
      <Box sx={{ height: 44 }} />
      <AdBody scheme={scheme} size={34} maxWidth={880}>
        Nothing makes it five. Knowing which one to open first is the whole of it.
      </AdBody>
      <Box sx={{ flex: 1 }} />
      <OrganicFooter scheme={scheme} size={32} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// 4. A study idea worth screenshotting. The technique is free, works on
//    paper, and is described so it is useful to someone who never
//    installs anything. The product gets one honest line at the bottom
//    and nothing more, because a post that only works if you sign up is
//    an ad wearing a hat.
// ---------------------------------------------------------------------
function RecallIdea() {
  const scheme: AdScheme = "light";
  const s = adSurfaces(scheme);
  const steps = [
    "Close the notes. All of them.",
    "Write down everything you remember about one topic. Messy is fine, nobody is marking it.",
    "Open the notes. Mark only what you missed.",
    "What you marked is your study plan. The rest is done, and you can stop reading it.",
  ];
  return (
    <Artboard width={1080} height={1350} scheme={scheme}>
      <AdEyebrow scheme={scheme}>A study idea. No app required.</AdEyebrow>
      <Box sx={{ height: 30 }} />
      <AdHeadline scheme={scheme} size={92} maxWidth={900}>
        Rereading is not studying. This is.
      </AdHeadline>
      <Box sx={{ height: 20 }} />
      <AdBody scheme={scheme} size={29} maxWidth={880}>
        Ten minutes, once per topic. It feels worse than rereading, which is the point: the part
        that hurts is the part that is working.
      </AdBody>
      <Box sx={{ height: 48 }} />
      <Stack spacing="30px">
        {steps.map((text, i) => (
          <Stack key={text} direction="row" spacing="24px" alignItems="flex-start">
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: "12px",
                bgcolor: CITRON,
                color: GRAPHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </Box>
            <Typography sx={{ fontSize: 37, lineHeight: 1.3, color: s.ink, fontWeight: 500, pt: "9px" }}>
              {text}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 34 }} />
      <Typography sx={{ fontSize: 24, color: s.muted, lineHeight: 1.4, maxWidth: 900 }}>
        Works with a blank page and a pen. Aptiverse keeps the step 4 list between sessions and
        writes practice against it, which is the only part a notebook cannot do.
      </Typography>
      <Box sx={{ height: 26 }} />
      <OrganicFooter scheme={scheme} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// 5. The free tier, stated in full.
//
// Every figure is read straight out of EntitlementsCatalogSeeder:
// ("free", "practice.generate", 3) and ("free", "ai.quick", 15) per
// month, "subjects.up_to_6", "diary", "wellbeing.basic", "calendar",
// "goals.basic". Admission targets are free on every tier. The last row
// says what is NOT free, because a free-tier post that hides the ceiling
// is the fastest way to lose the person who signs up because of it.
// ---------------------------------------------------------------------
function FreeTier() {
  const scheme: AdScheme = "light";
  const s = adSurfaces(scheme);
  const rows: { icon: React.ReactNode; count: string; label: string }[] = [
    { icon: <BookOpenCheck size={30} />, count: "3", label: "AI practice tests generated a month" },
    { icon: <MessageSquare size={30} />, count: "15", label: "Quick AI tutor questions a month" },
    { icon: <Layers size={30} />, count: "6", label: "Courses tracked at once" },
    { icon: <CalendarCheck size={30} />, count: "All", label: "Assessments logged, weighted, graded" },
    { icon: <HeartPulse size={30} />, count: "", label: "Private diary and mood check-ins" },
    { icon: <Target size={30} />, count: "", label: "Admission targets you set yourself" },
  ];
  return (
    <Artboard width={1080} height={1350} scheme={scheme}>
      <AdEyebrow scheme={scheme}>The free tier, in full</AdEyebrow>
      <Box sx={{ height: 30 }} />
      <AdHeadline scheme={scheme} size={104} maxWidth={880}>
        What you get without paying.
      </AdHeadline>
      <Box sx={{ height: 20 }} />
      <AdBody scheme={scheme} size={29} maxWidth={880}>
        No card, no trial clock. These are the actual monthly numbers, not a teaser.
      </AdBody>
      <Box sx={{ flex: 1, minHeight: 30 }} />
      <Stack spacing="0px">
        {rows.map((r, i) => (
          <Stack
            key={r.label}
            direction="row"
            spacing="24px"
            alignItems="center"
            sx={{
              py: "22px",
              borderTop: i === 0 ? `2px solid ${s.hair}` : "none",
              borderBottom: `2px solid ${s.hair}`,
            }}
          >
            <Box sx={{ display: "flex", color: s.muted, flexShrink: 0 }}>{r.icon}</Box>
            {/* The two rows with no number still reserve the block's width,
                so every label starts on the same left edge. Without this the
                list develops two ragged left margins. */}
            <Box
              sx={{
                minWidth: 74,
                px: "12px",
                py: "4px",
                borderRadius: "8px",
                bgcolor: r.count ? CITRON : "transparent",
                color: GRAPHITE,
                fontSize: 34,
                fontWeight: 700,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {r.count || " "}
            </Box>
            <Typography sx={{ fontSize: 32, fontWeight: 500, color: s.ink, lineHeight: 1.2 }}>
              {r.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 26 }} />
      <Typography sx={{ fontSize: 24, color: s.muted, lineHeight: 1.4, maxWidth: 900 }}>
        What is not free: practice generations past the third, and the deep AI answers. Everything
        above stays on the free plan for as long as you use it.
      </Typography>
      <Box sx={{ height: 24 }} />
      <OrganicFooter scheme={scheme} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// CAROUSEL: five square frames, one story, swiped in order.
//
// The story is the practice loop, because it is the one mechanic that is
// entirely real end to end and it contains a genuine surprise: the app
// refuses before it obliges. Frame 1 is the hook, frame 3 carries the
// only product picture, frame 5 closes the loop back to the number.
//
// All five commit to dark so they read as one object in a feed. The
// counter is the only element in a fixed position across all frames,
// which is what tells a scroller there is more to swipe.
// ---------------------------------------------------------------------
function CarouselFrame({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1080} scheme={scheme}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing="20px">
        <Stack direction="row" spacing="14px" alignItems="center">
          <Box sx={{ width: 12, height: 32, bgcolor: CITRON, borderRadius: "3px" }} />
          <Wordmark scheme={scheme} size={30} />
        </Stack>
        <Stack direction="row" spacing="10px" alignItems="center">
          {[1, 2, 3, 4, 5].map((n) => (
            <Box
              key={n}
              sx={{
                width: n === index ? 30 : 12,
                height: 12,
                borderRadius: 999,
                bgcolor: n === index ? CITRON : s.hair,
              }}
            />
          ))}
        </Stack>
      </Stack>
      <Box sx={{ height: 44 }} />
      {children}
    </Artboard>
  );
}

function CarouselOne() {
  const scheme: AdScheme = "dark";
  return (
    <CarouselFrame index={1}>
      <Box sx={{ flex: 1 }} />
      <AdEyebrow scheme={scheme}>How the practice actually works</AdEyebrow>
      <Box sx={{ height: 28 }} />
      <AdHeadline scheme={scheme} size={108} maxWidth={920}>
        It says no before it says yes.
      </AdHeadline>
      <Box sx={{ height: 30 }} />
      <AdBody scheme={scheme} size={34} maxWidth={880}>
        You cannot generate a practice test in Aptiverse out of nothing. There has to be a real
        assessment to write it against.
      </AdBody>
      <Box sx={{ flex: 1.2 }} />
      <AdBody scheme={scheme} size={26}>
        Swipe.
      </AdBody>
    </CarouselFrame>
  );
}

function CarouselTwo() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  const known = [
    "The course you created yourself",
    "Your year of study",
    "The assessment you are sitting",
    "Your weakest topics so far",
  ];
  return (
    <CarouselFrame index={2}>
      <AdHeadline scheme={scheme} size={90} maxWidth={900}>
        So it starts from what it already knows.
      </AdHeadline>
      <Box sx={{ height: 26 }} />
      <AdBody scheme={scheme} size={30} maxWidth={880}>
        None of this is asked twice. It is read off your own account.
      </AdBody>
      <Box sx={{ flex: 1, minHeight: 30 }} />
      <Stack spacing="18px">
        {known.map((k) => (
          <Stack
            key={k}
            direction="row"
            spacing="20px"
            alignItems="center"
            sx={{
              px: "24px",
              py: "20px",
              borderRadius: "14px",
              border: `2px solid ${s.hair}`,
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: CITRON, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 34, fontWeight: 500, color: s.ink }}>{k}</Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ flex: 1, minHeight: 20 }} />
    </CarouselFrame>
  );
}

function CarouselThree() {
  const scheme: AdScheme = "dark";
  return (
    <CarouselFrame index={3}>
      <AdHeadline scheme={scheme} size={92} maxWidth={900}>
        Then it writes the questions.
      </AdHeadline>
      <Box sx={{ height: 22 }} />
      <AdBody scheme={scheme} size={29} maxWidth={880}>
        Original, generated for that assessment. Not a scraped past paper.
      </AdBody>
      <Box sx={{ height: 30 }} />
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <ScaledDepiction designWidth={1080} width={936}>
          <PracticeDepiction scheme={scheme} />
        </ScaledDepiction>
      </Box>
    </CarouselFrame>
  );
}

function CarouselFour() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <CarouselFrame index={4}>
      <Box sx={{ flex: 0.8 }} />
      <AdHeadline scheme={scheme} size={104} maxWidth={920}>
        One attempt. Timed. Tutor off.
      </AdHeadline>
      <Box sx={{ height: 30 }} />
      <AdBody scheme={scheme} size={33} maxWidth={880}>
        Leave the tab and it counts it. A test you can quietly retake until it flatters you is not
        telling you anything.
      </AdBody>
      <Box sx={{ height: 40 }} />
      <Stack direction="row" spacing="16px" alignItems="center" sx={{ color: s.muted }}>
        <EyeOff size={34} />
        <Typography sx={{ fontSize: 27, color: s.muted }}>
          The AI tutor is locked for the duration.
        </Typography>
      </Stack>
      <Box sx={{ flex: 1 }} />
    </CarouselFrame>
  );
}

function CarouselFive() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <CarouselFrame index={5}>
      <Box sx={{ flex: 0.8 }} />
      <AdHeadline scheme={scheme} size={98} maxWidth={920}>
        Every answer is filed under a topic.
      </AdHeadline>
      <Box sx={{ height: 30 }} />
      <AdBody scheme={scheme} size={33} maxWidth={880}>
        That is what the mastery number is made of, and what the projection on each course is
        weighted by.
      </AdBody>
      <Box sx={{ height: 40 }} />
      <Box>
        <CitronBlock size={58} px={22} py={10}>
          No answers in, no number out.
        </CitronBlock>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          px: "28px",
          py: "24px",
          borderRadius: "16px",
          bgcolor: alpha(CITRON, 0.1),
          border: `2px solid ${s.hair}`,
        }}
      >
        <Typography sx={{ fontSize: 27, color: s.ink, lineHeight: 1.4 }}>
          Free plan: three generated practice tests a month, fifteen quick tutor questions, six
          courses. {SITE}
        </Typography>
      </Box>
    </CarouselFrame>
  );
}

export const ORGANIC_UNITS = {
  ChartPortrait,
  ChartStory,
  WeekNine,
  RecallIdea,
  FreeTier,
  CarouselOne,
  CarouselTwo,
  CarouselThree,
  CarouselFour,
  CarouselFive,
};
