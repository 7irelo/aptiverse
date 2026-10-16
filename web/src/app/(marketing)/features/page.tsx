"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import {
  Target,
  FileText,
  ClipboardCheck,
  CalendarDays,
  Lock,
  Wind,
  HeartHandshake,
  LayoutDashboard,
  PartyPopper,
  CalendarClock,
  ShieldCheck,
  UsersRound,
  Presentation,
} from "lucide-react";
import { Section } from "@/components/common/Section";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { FeatureCard } from "@/components/common/FeatureCard";
import { FeatureShowcase } from "@/components/marketing/FeatureShowcase";
import {
  TutorChatDemo,
  MasteryChartDemo,
  MoodCheckInDemo,
  DiaryEncryptedDemo,
  ExamSimulatorDemo,
  GoalsBoardDemo,
  RewardsSpendDemo,
  CareerTargetsDemo,
} from "@/components/marketing/FeatureDemos";

export default function FeaturesPage() {
  return (
    <>
      <GradientBackdrop variant="hero">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 820 }}>
            <Typography variant="overline" color="primary.main">
              The full toolkit
            </Typography>
            <Typography variant="h1" component="h1">
              Everything you need to do well, and stay well.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              One place for your learning and your wellbeing, from your first term to your last exam.
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ pt: 2 }} flexWrap="wrap" useFlexGap>
              <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
                Start free
              </Button>
              <Button component={Link} href="/pricing" variant="outlined" size="large">
                See pricing
              </Button>
            </Stack>
          </Stack>
        </Box>
      </GradientBackdrop>

      {/* Learn */}
      <Section id="learn" py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2, maxWidth: 720, mx: "auto" }}>
          <Typography variant="overline" color="primary.main">
            Learn
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Study smarter, with less guesswork.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The tools do the heavy lifting: what to practise, where you are losing marks, and how to fix it.
          </Typography>
        </Stack>

        {/* Checked against the tutor's system prompt in AiController.cs:205.
            Two claims here were false. "Cites your material, not random web
            sources" described retrieval we do not have: there is no RAG, no
            document index, no citation path anywhere in the AI module. And
            "stays in scope for your grade or module" was the exact opposite of
            what the prompt says, which is "Never tell a student that a subject
            or level is not your focus". What is real is BuildTutorPrompt at
            :232, which injects the student's level, subjects, marks, mastery
            and upcoming assessments into every reply. That is worth saying. */}
        <FeatureShowcase
          eyebrow="Study assistant"
          title="It already knows what you are studying."
          body="Your level, your subjects or courses, your marks, and what is due next all go into every reply. A Grade 11 term test and a second-year module get answered differently, without you setting the scene each time."
          bullets={[
            "Pitched at your level, drawing on the subjects you actually take",
            "Shows the working step by step, then sets you original questions",
            "Gives structure on essays instead of writing them for you",
            "Quick answers for small questions, deep help for big ones",
          ]}
          demo={<TutorChatDemo />}
        />

        {/* MasteryController.cs:76-144 is real: it projects a term mark from
            graded assessments, recent trend and mastery gap. Two details were
            oversold. It returns a single confidence figure (:130), not an
            upper/lower band, and the app renders it as "72% confidence"
            (analytics/page.tsx:465). And "shareable with a parent" was false:
            StudentOverviewDto (ParentLinksController.cs:324) carries no
            forecast field, so no parent can see it on any plan. */}
        <FeatureShowcase
          id="predictions"
          reverse
          eyebrow="Term predictions"
          title="See where your marks are heading."
          body="Log your assessment marks and Aptiverse projects the term ahead per subject or course, weighing your recent trend and the topics you have not locked down yet."
          bullets={[
            "A projected mark, with how confident it is",
            "Flags the topics that need work",
            "Sharpens as you log more marks and do more practice",
          ]}
          demo={<MasteryChartDemo />}
        />

        {/* Added back after the truth pass removed it, because it has now
            shipped. The earlier version of this card sold a timed paper while
            the feature was still being built; this one is written off the code
            that exists. Sizes: PAPER_SIZES (practice/page.tsx:169). Structure
            and 1/2-4/6-12 mark bands: the generator prompt
            (PracticeController.cs:509-512). A minute a mark: :371-376. Part
            marks against a per-question memo: MarkWrittenAnswersAsync
            (PracticeService.cs:106-198). Marks and percent: :606-622.

            Deliberately not claimed: that it is adaptive (you pick the length
            and difficulty), that it is an official NSC paper (Claude writes it,
            it is not a DBE paper), or that it predicts your result. */}
        <FeatureShowcase
          id="exam-simulator"
          eyebrow="Exam simulator · Student Max"
          title="A full paper, timed, one attempt."
          body="Pick a length, 30 up to 150 marks, and Aptiverse sets a paper structured like a real one: Section A multiple choice, Section B short written answers, Section C extended questions. The marks add up to exactly what you asked for."
          bullets={[
            "Every question shows what it is out of, so you can budget your time",
            "Roughly a minute a mark, and you get one attempt, like the real thing",
            "Written answers marked against a memo, with part marks and where they went",
            "Scored out of marks as well as a percent, with maths in proper notation",
          ]}
          demo={<ExamSimulatorDemo />}
        />

        <Box sx={{ pt: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", textAlign: "center", mb: 2 }}>
            Also in Learn
          </Typography>
          <Grid container spacing={3}>
            {LEARN_EXTRAS.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>

      {/* Wellbeing */}
      <Section id="wellbeing" bg="paper" py={2}>
        <Stack spacing={1.5} sx={{ textAlign: "center", mb: 2, maxWidth: 720, mx: "auto" }}>
          <Typography variant="overline" color="primary.main">
            Wellbeing
          </Typography>
          <Typography variant="h2" component="h2" sx={{ fontWeight: 700 }}>
            Marks matter. So does how you feel.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check in daily, write freely, and keep an eye on the trend yourself.
          </Typography>
        </Stack>

        {/* "The platform watches for stress and connects you to a real person"
            was two promises we do not keep. WellbeingController.cs:67 returns
            an empty counsellor list unconditionally: there is no counsellor
            table and no booking. And nothing detects a trend. mood-trend
            (:45) returns a day-averaged series and draws it; no code computes
            direction or decline. StressSignal reads only the latest check-in's
            free text. Telling a struggling teenager the app is watching, when
            nothing is watching, is the kind of claim that gets someone hurt.
            The chart is real and a person reading their own chart is real, so
            that is what this says now. */}
        <FeatureShowcase
          eyebrow="Daily check-in"
          title="Sixty seconds a day, and the term stops being a blur."
          body="Log how you are doing and Aptiverse keeps the run of days. A week of dips looks nothing like one bad Tuesday, and you can see which one you are having."
          bullets={[
            "A mood chart across days, not a single snapshot",
            "A check-in streak you can actually keep",
            // Was "Your family sees the trend, never your entries". No parent
            // endpoint returns a mood: StudentOverviewDto
            // (ParentLinksController.cs:409) carries a name, an education level
            // and the next five assessments, and nothing else. Promising a
            // parent-visible trend invented a screen in the wrong direction,
            // which is the one direction a privacy claim must never move.
            "Yours to read. No parent screen shows your check-ins at all",
          ]}
          demo={<MoodCheckInDemo />}
        />

        {/* This block claimed the diary was "encrypted on your device, so the
            key never leaves your phone" and "end-to-end encrypted, even we
            cannot read it". None of that was true. DiaryEntry.Content is a
            plain string column, there is no client-side crypto anywhere in this
            app, and the server writes SentimentAnalysis and KeyThemes onto the
            entry, which is only possible because the server reads the text.

            It also claimed the diary works offline, which nothing implements.

            This one mattered more than the rest: it invited a teenager to write
            something they would only write somewhere truly private, on a
            promise the system cannot keep. What is written below is what the
            product actually does. If we want to make the stronger claim, we
            have to build it first, and building it means giving up the
            sentiment analysis that reads the text. */}
        {/* Two of the three bullets were still wrong after that encryption
            fix. "Gentle nightly prompts" are four hardcoded chips that paste
            text into the box (diary/page.tsx:157); nothing is nightly and
            nothing is personalised. "Flags a rough patch to you" is wired and
            dead: FrontendWellbeingService.cs:43 hardcodes NeedsFollowUp =
            false and defers to a Python service that subscribes to a
            "diary.entry.created" event the API never publishes. So no entry is
            ever analysed and nothing is ever flagged.

            Worth recording for whoever picks up the encryption question: right
            now the AI does not read the diary at all, because that event never
            fires. So the sentiment analysis we would have to give up to encrypt
            it is not currently running. The trade-off may be cheaper than the
            comment above assumes. */}
        <FeatureShowcase
          reverse
          eyebrow="Private diary"
          title="Yours, and not your parents' reading material."
          body="Write honestly about how the term is going. There is no parent endpoint that returns a diary entry, a mood or a check-in, so there is nothing for anyone at home to open."
          bullets={[
            "No parent screen shows entries, moods or check-ins",
            "Prompts to start you off when the page is blank",
            "Stored on our servers, not encrypted on your device",
          ]}
          demo={<DiaryEncryptedDemo />}
        />

        <Box sx={{ pt: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", textAlign: "center", mb: 2 }}>
            Also in Wellbeing
          </Typography>
          <Grid container spacing={3}>
            {WELLBEING_EXTRAS.map((f) => (
              <Grid key={f.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <FeatureCard {...f} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Section>

      {/* Goals
          This section was four identical icon-heading-paragraph cards, and it
          was the one the product owner picked out: it told you goals are
          verified and never once showed you a goal. Nothing about the claims
          was wrong, but a reader finished it with no picture of the screen.

          It is now the two screens the claims actually live on, drawn from the
          running app: the goals list with its four tabs and its real card, and
          the rewards page where the points get spent. Same four claims, shown
          instead of asserted. */}
      <Section id="goals" eyebrow="Goals" title="Goals you cannot fake" subtitle="Set the target yourself. Aptiverse checks it against your real practice scores and topic mastery, and pays out only when you beat your own baseline.">
        <FeatureShowcase
          eyebrow="Set it, then prove it"
          title="You pick the target. Your own work decides whether you hit it."
          body="A practice score, a topic to master, an assessment mark, or a streak to keep. Aptiverse reads your actual attempts and mastery to settle it, so there is no tick box you can press yourself."
          bullets={[
            "Academic or personal, with a due date you set",
            "Measured from your real practice, marks and mastery",
            "The card shows where you started, so progress is the distance travelled",
            "Falling behind shows up as At risk while there is still time to act",
          ]}
          demo={<GoalsBoardDemo />}
        />

        <FeatureShowcase
          reverse
          eyebrow="Points"
          title="Beat your own best, and the limits move."
          body="Two goal kinds pay points, and only above the baseline you were already standing on. Points buy more AI questions, deeper tutor sessions, or more practice sets. The quota really changes."
          bullets={[
            "Paid on how far past your own baseline you get, not on the number itself",
            "Spent on limits the usage meter genuinely enforces",
            "A reward you cannot afford yet says how far short you are",
            "Streaks and self-reported marks are tracked honestly, and pay nothing",
          ]}
          demo={<RewardsSpendDemo />}
        />
      </Section>

      {/* Real, shipped, and previously unmentioned on this page. The career
          navigator in particular: it is free (features.ts:140), it is fully
          built (AdmissionTargetsController), and the page never sold it.

          It has been promoted out of the card grid into a showcase, because a
          sentence about "tracking requirements against your marks" is exactly
          the kind of claim nobody can picture. The two that remain are a
          directory and a group scheduler: real, worth listing, and not worth a
          full mock each. */}
      <Section id="included" eyebrow="Also included" title="The rest of it, free tier included">
        <FeatureShowcase
          eyebrow="Career navigator · free on every plan"
          title="Every requirement, against the marks you actually have."
          body="Enter what a programme asks for and Aptiverse measures it against your record, closest first. The number on each plan is your biggest single gap, because an application is judged on the requirement you missed, not the average of the ones you met."
          bullets={[
            "Your plans ranked by how far off you are",
            "Per-requirement status, so you know which subject is the problem",
            "Deadlines flagged as they get close",
            "Requirements are the ones you researched and entered yourself",
          ]}
          demo={<CareerTargetsDemo />}
        />

        <Grid container spacing={3} sx={{ pt: 2 }}>
          {ALSO.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* For parents */}
      <Section id="for-parents" bg="paper" eyebrow="For parents" title="A calm view, never an invasive one" subtitle="Link each child and see what is coming up for them. The privacy boundary is the part we have built hardest.">
        <Grid container spacing={3}>
          {FOR_PARENTS.map((f) => (
            <Grid key={f.title} size={{ xs: 12, sm: 6, md: 4 }}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section py={6}>
        <Stack spacing={2} alignItems="center" sx={{ textAlign: "center" }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            See the whole thing.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620 }}>
            The free tier gets you goals, the diary, mood check-ins, practice, past papers, and the career navigator, no card needed.
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ pt: 1 }} flexWrap="wrap" useFlexGap>
            <Button component={Link} href="/register" variant="contained" color="secondary" size="large">
              Start free
            </Button>
            <Button component={Link} href="/pricing" variant="outlined" size="large">
              See pricing
            </Button>
          </Stack>
        </Stack>
      </Section>
    </>
  );
}

// Four cards, four problems.
//
// "Adaptive practice: difficulty scales to your level" was not adaptive. You
// pick foundation, core or challenge from a dropdown (practice/page.tsx:183)
// and PracticeController passes your choice straight to the generator (:178).
// Nothing reads your mastery to set it. The generation is real and good; the
// word "adaptive" was the lie, so the card now says what it does.
//
// "Past papers with worked solutions" contradicted the page it links to:
// past-papers/page.tsx:24 says outright that we do not host papers and funnel
// to the DBE archive instead. There are no worked solutions to filter.
//
// "Exam practice: sit a timed paper" was being built and unfinished when this
// card was cut. It has since shipped and now has its own showcase above, on
// Student Max.
//
// "Study planner" does not exist in any form. No entity, no endpoint, no
// route. `study_plan.ai` is a key in features.ts and a row in the seeder, and
// that is the whole feature.
//
// Replaced with four things that are real and were going unsold.
const LEARN_EXTRAS = [
  {
    icon: <Target size={18} />,
    title: "Practice on demand",
    description: "Generate a set on any topic, at the difficulty you pick. Multiple choice, short answer, or flashcards.",
    accent: "primary" as const,
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: "Marked, with a mastery read",
    description: "Answers are marked automatically and every question feeds per-topic mastery, so you see the pattern.",
    accent: "primary" as const,
  },
  {
    icon: <FileText size={18} />,
    title: "Straight to the DBE archive",
    description: "Past papers come from the Department of Basic Education's official NSC archive, with a study note per subject.",
    accent: "primary" as const,
  },
  {
    icon: <CalendarDays size={18} />,
    title: "Assessment tracking",
    description: "Log what is due and what you scored. That is what the term projection is built from.",
    accent: "primary" as const,
  },
];

// "Take a break" has no implementation. The wellbeing page links to
// /dashboard/diary?tool=breathing (wellbeing/page.tsx:549) and the diary page
// never reads a `tool` param, so the link opens a plain diary. The only
// breathing animation in this repo is the marketing mock.
//
// "Talk to a counsellor, included on paid plans" is the worst of the set. It
// was sold as a paid benefit and there is nothing behind it: no Counsellor
// entity, no table, no booking, and GetCounsellors returns an empty array
// (WellbeingController.cs:67). The buttons on /dashboard/psychologist have no
// handlers. A student in trouble who upgrades for this finds an empty page.
// The one real thing on that page is the SADAG number, so that is what we
// name, and we name it as what it is: someone else's helpline, not our
// service.
//
// "Reach a goal or a streak" was half true. GoalEvaluator.cs:113 does fire a
// celebration when a goal verifies. Nothing fires on a streak.
const WELLBEING_EXTRAS = [
  {
    icon: <Lock size={18} />,
    title: "Private diary",
    // Was "End-to-end encrypted on your device. Not us, not your parents."
    // The second half is true and enforced. The first was never built.
    description: "The parent view is a name and what is due. No mood, no entries, no marks.",
    accent: "secondary" as const,
  },
  {
    icon: <Wind size={18} />,
    title: "Mood over time",
    description: "Every check-in lands on a chart you can read yourself, across the term.",
    accent: "secondary" as const,
  },
  {
    icon: <HeartHandshake size={18} />,
    title: "Crisis numbers, up front",
    description: "SADAG's free counselling line is on the wellbeing page. It is their service, staffed by them, not ours.",
    accent: "secondary" as const,
  },
  {
    icon: <PartyPopper size={18} />,
    title: "Celebrate wins",
    description: "Hit a goal you set and Aptiverse marks the moment, gently.",
    accent: "secondary" as const,
  },
];

// The four cards that used to live here are gone, replaced by the two
// showcases in the Goals section. Keeping the notes, because they are the
// reason the section says what it says and the mocks draw what they draw.
//
// "Break it into steps" is the subtle one, and it is the reason to check the
// UI and not just the API. GoalMilestone is a real entity with full CRUD
// (GoalsController.cs:534-659), so a grep for milestones looks healthy. But
// web/src/lib/api/queries.ts exposes only a read hook and a reorder hook, and
// every write button on goals/[id]/page.tsx renders with no handler: "Add
// milestone" (:204), the tick box (:215), the delete (:237). A student cannot
// create a milestone, so we cannot sell breaking a goal into steps. The
// backend is there; the last mile is not. Worth building, not worth claiming.
//
// "Weekly targets" has nothing behind it at all, in the UI or the API.
//
// What replaces them is the part that is genuinely unusual: GoalEvaluator
// verifies goals against real evidence, and GoalKinds.Rewarded (Goal.cs:195)
// pays points only for practice score and topic mastery, only above your own
// baseline. Points buy quota grants that UsageMeter really enforces
// (UsageMeter.cs:15, 58). That whole loop is real and was going unsold, and it
// is now shown rather than described.

// This section was six cards and five of them were fiction. The structural
// fact that decides it: ParentLink is read in exactly one file,
// ParentLinksController.cs. No other endpoint consults it, so no other
// endpoint can hand a parent any child's data. Card by card:
//
// - "Result forecast per child": StudentOverviewDto (:324) has no forecast
//   field. `parent.forecast` is a key in features.ts and a seeder row that
//   bills for "matric mark prediction per child". Nothing computes it.
// - "Wellbeing summary": /parent/wellbeing calls GET /api/entitlements/children,
//   an endpoint that does not exist, so the page 404s. The chart it would draw
//   is Math.random() (parent/wellbeing/page.tsx:63).
// - "Celebration alerts": a "celebration" notification type is real, but every
//   emitter targets the actor themselves (GoalEvaluator.cs:115 -> studentId).
//   No parent-directed celebration exists. /parent/celebrations is a
//   hardcoded array of invented children.
// - "Shared calendar": CalendarController.cs:12 returns an empty array to
//   everyone, unconditionally. There is no per-user calendar to share.
//
// What survives is the dashboard (real page, real linked children, real
// upcoming assessments) and the privacy boundary, which is the one thing here
// that is enforced rather than described. So we sell those two honestly and
// say plainly what a parent does not get, rather than inventing a third.
// The career navigator card was promoted to a showcase above, so it is no
// longer duplicated here.
const ALSO = [
  {
    icon: <UsersRound size={18} />,
    title: "Study groups",
    description: "Start or join a group, and schedule sessions with the people you are studying alongside.",
    accent: "info" as const,
  },
  {
    icon: <Presentation size={18} />,
    title: "Find a tutor",
    description:
      "Browse tutor profiles with their subjects, qualifications, rates, and reviews. You arrange it with them directly.",
    accent: "secondary" as const,
  },
];

const FOR_PARENTS = [
  {
    icon: <LayoutDashboard size={18} />,
    title: "Parent dashboard",
    description: "Link each child to your account and see them in one place, with the assessments coming up for each of them.",
    accent: "primary" as const,
  },
  {
    icon: <CalendarClock size={18} />,
    title: "What is due, per child",
    description: "The next pieces of work for each child, so you can ask a useful question instead of a vague one.",
    accent: "info" as const,
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Private by design",
    description: "There is no screen and no endpoint that shows you your child's diary. You cannot read it, and that cannot be switched on.",
    accent: "success" as const,
  },
];
