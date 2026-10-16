"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/PersonOutline";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import CheckIcon from "@mui/icons-material/Check";
import LockIcon from "@mui/icons-material/LockOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import StarIcon from "@mui/icons-material/Star";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import TipsIcon from "@mui/icons-material/TipsAndUpdatesOutlined";
import {
  Frown,
  Annoyed,
  Meh,
  Smile,
  Laugh,
  Heart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Timer,
  Sparkles,
  ShieldCheck,
  Flame,
  CalendarCheck,
  ClipboardList,
  Gift,
  Zap,
  Brain,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { alpha, useTheme } from "@mui/material/styles";
import { MockAppFrame } from "./FeatureShowcase";
import { AptiverseLineChart } from "@/components/common/AptiverseLineChart";
import { AERO_COURSES } from "@/app/(marketing)/ads/units/charts";

// ============================================================
// 1. AI Tutor: chat-UI mock
// ============================================================
// The two chips under the reply used to read "Stewart, Calculus, §3.4" and
// "Tutorial 4, Q9", i.e. the tutor citing a named textbook page and a specific
// tutorial question. It cannot do that and never could: there is no retrieval,
// no document index and no citation path anywhere in api/Modules/AI. Those
// chips were the whole visual argument for "cites your material", and a mock
// that shows a capability is making the claim just as loudly as the headline
// above it.
//
// What the tutor really does have is the student's profile, injected by
// BuildTutorPrompt (AiController.cs:232): level, subjects, marks, mastery,
// upcoming assessments. So the chips now show that, which is both true and a
// better sell. The trailing caption also said "generating adaptive practice";
// the practice it generates is real, the adaptivity is not.
export function TutorChatDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/chatbot" badge="Calculus">
      <Stack spacing={2}>
        <UserBubble>
          Hey, can you explain the chain rule? I keep getting it wrong on my homework.
        </UserBubble>

        <AiBubble model="Quick">
          Sure. The chain rule lets you differentiate a function inside another function.
          It is the key to <strong>related rates and optimisation</strong>, and it turns up
          right across your calculus work.
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1, fontFamily: "monospace", fontSize: "0.9em" }}>
            d/dx [f(g(x))] = f&apos;(g(x)) · g&apos;(x)
          </Box>
          {/* These two chips measured 400px wide inside a 390px phone
              viewport, so the second one was cut off by the bubble. */}
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
            <Chip
              icon={<MenuBookIcon sx={{ fontSize: 14 }} />}
              label="Knows you take Mathematics"
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.72rem" }}
            />
            <Chip label="Pitched at Grade 11" size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} />
          </Stack>
        </AiBubble>

        <UserBubble>Can you give me 3 worked examples in increasing difficulty?</UserBubble>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 5, opacity: 0.7 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: "pulse 1.4s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 0.3 },
                "50%": { opacity: 1 },
              },
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Writing original questions with worked solutions…
          </Typography>
        </Stack>
      </Stack>
    </MockAppFrame>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ justifyContent: "flex-end" }}>
      <Box
        sx={{
          maxWidth: "78%",
          px: 2,
          py: 1.25,
          borderRadius: 2,
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="body2">{children}</Typography>
      </Box>
      <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.contrastText", width: 32, height: 32 }}>
        <PersonIcon fontSize="small" />
      </Avatar>
    </Stack>
  );
}

function AiBubble({ children, model }: { children: React.ReactNode; model: "Quick" | "Deep" }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
        <AutoAwesomeIcon sx={{ fontSize: 18, color: "primary.contrastText" }} />
      </Avatar>
      <Box
        sx={{
          maxWidth: "82%",
          px: 2,
          py: 1.25,
          borderRadius: 2,
          bgcolor: "action.hover",
          position: "relative",
        }}
      >
        <Chip
          label={model + " AI"}
          size="small"
          sx={{
            position: "absolute",
            top: -10,
            left: 10,
            height: 18,
            fontSize: "0.65rem",
            fontWeight: 600,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
          }}
        />
        <Typography variant="body2" component="div">
          {children}
        </Typography>
      </Box>
    </Stack>
  );
}

// ============================================================
// 2. REMOVED: the SBA coach mock
// ============================================================
// It drew a History essay with inline rubric annotations, "coverage: 64%",
// "rubric match: 5/8 marks" and three pieces of examiner-style feedback.
// `sba.coach` is a string in the entitlements seeder with no controller, no
// rubric model, no draft analysis endpoint and no feedback generator behind
// it, and the claims ledger cut it explicitly. No page imported this any more,
// so it was a false depiction sitting in the drawer waiting to be picked up
// again. Deleted rather than corrected: there is no true version of it.

// ============================================================
// 3. Mastery projection — the real slope, current to predicted
// ============================================================
// This mock used to draw a nine-point monthly curve from Feb to Oct with a
// shaded "Upper band" / "Lower band" behind it and an "Uncertainty" legend
// entry. Every part of that was invented. MasteryController.GetPredictions
// returns one row per study unit with exactly three numbers on it:
// CurrentTerm, PredictedNextTerm and a scalar Confidence (MasteryController.cs
// :138-145). There is no time series, so there is nothing to plot month by
// month, and there is no interval, so there is nothing to shade. A confidence
// band was already identified as a debunked claim and stripped from the ad
// scenes and the depictions; it survived here, on the page a buyer actually
// lands on, which is worse than any of the places it was removed from.
//
// What ships is /dashboard/mastery's "Where each course is heading" panel: a
// two-point slope per study unit, Current on the left and Predicted on the
// right, on a full 0 to 100 axis, rising lines coloured success and falling
// ones warning (mastery/page.tsx:469-492). That is what this draws now, with
// the six real courses from the seeded first-year Aeronautical Engineering
// account, imported from the ads charts module rather than retyped so the two
// cannot drift.
//
// One deliberate difference from the running page: a flat projection is drawn
// neutral here rather than green. The page's test is `predicted >= current`,
// which paints a 65 to 65 line the same colour as a climb. In an ad that reads
// as improvement, and no improvement was computed. The numbers are unchanged.
export function MasteryChartDemo() {
  const theme = useTheme();

  const toneFor = (current: number, predicted: number | null) => {
    if (predicted === null || predicted === current) return theme.palette.text.secondary;
    return predicted > current ? theme.palette.success.main : theme.palette.warning.main;
  };

  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/mastery" badge="From marks you logged">
      <Stack spacing={1.5}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Projection
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Where each course is heading
          </Typography>
        </Box>

        {/* Six series over two x points. The legend is suppressed because six
            course names in a 500px column is unreadable; the rows underneath
            are the key, and they carry the numbers as well as the colour. */}
        <Box sx={{ height: 250, mx: -1 }}>
          <AptiverseLineChart
            hideLegend
            xAxis={[{ data: ["Current", "Predicted"], scaleType: "point" }]}
            yAxis={[{ min: 0, max: 100, tickNumber: 5 }]}
            series={AERO_COURSES.map((c) => ({
              label: c.name,
              data: [c.current, c.predicted],
              color: toneFor(c.current, c.predicted),
              curve: "linear" as const,
              showMark: true,
            }))}
            // The right margin is wide enough for the word "Predicted", which
            // is centred on the last point and would otherwise be clipped to
            // "Pre...". The domain stays the app's full 0 to 100: cropping it
            // to the band the marks sit in would triple every apparent gap.
            margin={{ top: 10, right: 48, bottom: 24, left: 34 }}
          />
        </Box>

        {/* Direction is never left to colour alone: every row carries an arrow
            glyph and both numbers as well as the hue. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            columnGap: 2,
            rowGap: 0.75,
          }}
        >
          {AERO_COURSES.map((c) => (
            <ProjectionKeyRow
              key={c.name}
              name={c.name}
              current={c.current}
              predicted={c.predicted}
              tone={toneFor(c.current, c.predicted)}
            />
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          Each line runs from your current semester mark to the predicted next semester mark. It is
          arithmetic on the marks you have already logged, weighted by your practice mastery, and
          there is no projection at all until you log some.
        </Typography>
      </Stack>
    </MockAppFrame>
  );
}

function ProjectionKeyRow({
  name,
  current,
  predicted,
  tone,
}: {
  name: string;
  current: number;
  predicted: number | null;
  tone: string;
}) {
  const delta = predicted === null ? 0 : predicted - current;
  const Glyph = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: tone, flexShrink: 0 }} />
      <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
        {name}
      </Typography>
      {predicted === null ? (
        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
          no projection yet
        </Typography>
      ) : (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: tone, flexShrink: 0 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: tone, fontVariantNumeric: "tabular-nums" }}
          >
            {current} to {predicted}
          </Typography>
          <Glyph size={13} />
        </Stack>
      )}
    </Stack>
  );
}

// ============================================================
// 4. Past papers: the DBE archive link-out
// ============================================================
// This mock used to render a worked solution: four numbered steps, a mark
// beside each, and a chip reading "Markscheme reference: 2023 P2 Memo, pg.
// 14". Aptiverse has never had a single worked solution, a memo mapping, or a
// hosted paper. /dashboard/past-papers is a set of links into the DBE's public
// archive with a study tip per subject, and its own source comment explains
// that this is deliberate: the DBE is authoritative, and re-hosting risks
// copyright and staleness.
//
// So the mock now shows the page that exists. It is a less impressive picture
// and a better product decision, and the honest version of it is still worth
// something: we send you to the real thing.
export function PastPaperDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/past-papers" badge="Official DBE archive">
      <Stack spacing={1.5}>
        <Typography variant="caption" color="text.secondary">
          We do not re-host papers. These open the Department of Basic Education&apos;s own NSC archive.
        </Typography>

        <PaperRow
          subject="Mathematics"
          papers="P1 (Algebra, Calculus, Functions) · P2 (Trig, Geometry, Stats)"
          tip="Work P1 timed at 3hr, no calculator the first 30 min. Mark with the official memo."
        />
        <PaperRow
          subject="Physical Sciences"
          papers="P1 (Physics) · P2 (Chemistry)"
          tip="Read the equation sheet first. Spend 5 minutes mapping each question to a formula."
        />
        <PaperRow
          subject="Life Sciences"
          papers="P1 (Genetics, Diversity) · P2 (Life Processes)"
          tip="Diagrams must be labelled, not described. The memo expects exact terminology."
        />
      </Stack>
    </MockAppFrame>
  );
}

function PaperRow({ subject, papers, tip }: { subject: string; papers: string; tip: string }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {subject}
        </Typography>
        <Chip
          icon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
          label="DBE"
          size="small"
          variant="outlined"
          sx={{ height: 20, fontSize: "0.65rem" }}
        />
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
        {papers}
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="flex-start">
        <Box sx={{ color: "primary.main", display: "flex", pt: 0.15 }}>
          <TipsIcon sx={{ fontSize: 14 }} />
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
          {tip}
        </Typography>
      </Stack>
    </Box>
  );
}

// ============================================================
// 5. Practice: a generated, marked set
// ============================================================
// The name stays for its importers; the claim does not. This mock showed a
// per-question difficulty ramp ("Coming next, difficulty 0.9") under the line
// "Difficulty is auto-scaling as you get questions right". Nothing in
// PracticeController does that. You pick one difficulty for the whole set and
// the generator receives it verbatim; there is no mid-set adaptation and no
// per-question difficulty score to display. The progress bars were rendering a
// number the system has never computed.
//
// What it shows now is the set as it actually comes back: your chosen
// difficulty, your topic, and per-question marking feeding topic mastery.
export function AdaptivePracticeDemo() {
  const rows = [
    { topic: "Factorise: 2x² − 5x − 3", diff: 0.55, status: "correct" as const },
    { topic: "Factorise by grouping: x³ − x² + x − 1", diff: 0.55, status: "correct" as const },
    { topic: "Solve x² − 4x + 5 = 0 (over ℂ)", diff: 0.55, status: "current" as const },
    { topic: "Simplify (x² − 9) / (x + 3)", diff: 0.55, status: "next" as const },
    { topic: "Solve 3x² + 7x − 6 = 0", diff: 0.55, status: "next" as const },
  ];
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/practice" badge="Core · Algebra">
      <Stack spacing={1.25}>
        <Typography variant="caption" color="text.secondary">
          Written fresh for the topic you asked for, at the difficulty you chose.
        </Typography>
        {rows.map((r, i) => (
          <Box
            key={i}
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: 1,
              borderColor: r.status === "current" ? "primary.main" : "divider",
              bgcolor:
                r.status === "current"
                  ? (t) =>
                      alpha(t.palette.secondary.main, t.palette.mode === "dark" ? 0.12 : 0.16)
                  : "transparent",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <StatusDot status={r.status} />
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  opacity: r.status === "next" ? 0.5 : 1,
                }}
              >
                {r.topic}
              </Typography>
              {/* Was a per-question difficulty bar. There is no such number. */}
              <Chip
                label={r.status === "correct" ? "Marked" : r.status === "current" ? "Now" : "To do"}
                size="small"
                variant="outlined"
                color={r.status === "correct" ? "success" : "default"}
                sx={{ height: 20, fontSize: "0.65rem", flexShrink: 0 }}
              />
            </Stack>
          </Box>
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
          Every answer feeds your Algebra mastery.
        </Typography>
      </Stack>
    </MockAppFrame>
  );
}

function StatusDot({ status }: { status: "correct" | "current" | "next" }) {
  if (status === "correct") {
    return (
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          bgcolor: "success.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckIcon sx={{ fontSize: 12, color: "success.contrastText" }} />
      </Box>
    );
  }
  if (status === "current") {
    return (
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: 2,
          borderColor: "primary.main",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: 2,
        borderColor: "divider",
        flexShrink: 0,
      }}
    />
  );
}

// ============================================================
// Wellbeing 1 — Mood check-in + stress trend
// ============================================================
export function MoodCheckInDemo() {
  // The 7-day mood history shown as a sparkline-style bar chart.
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const moods = [3, 3, 2, 2, 1, 4, 4]; // 0=sad, 4=great

  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/wellbeing" badge="60-second check-in">
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Today
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            How are you feeling?
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="space-between">
          {[
            { Icon: Frown, label: "Tough", active: false },
            { Icon: Annoyed, label: "Meh", active: false },
            { Icon: Meh, label: "OK", active: false },
            { Icon: Smile, label: "Good", active: true },
            { Icon: Laugh, label: "Great", active: false },
          ].map((m) => (
            <Box
              key={m.label}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 1.5,
                textAlign: "center",
                cursor: "pointer",
                border: 2,
                borderColor: m.active ? "primary.main" : "transparent",
                bgcolor: m.active
                  ? (t) =>
                      alpha(t.palette.secondary.main, t.palette.mode === "dark" ? 0.18 : 0.2)
                  : "action.hover",
              }}
            >
              <Box
                sx={{
                  color: m.active ? "primary.main" : "text.secondary",
                  display: "flex",
                  justifyContent: "center",
                  mb: 0.5,
                }}
              >
                <m.Icon size={26} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: m.active ? 700 : 500 }}>
                {m.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* This panel said "Stress trending up this week" and offered a
            3-minute break and a counsellor, "both one tap away". Three claims,
            none real. Nothing computes a stress trend (mood-trend returns a
            series and stops there); the break tool links to a query param the
            diary never reads; and the counsellor list is a hardcoded empty
            array. The check-in and the chart underneath are real, so the panel
            now shows the one thing the check-in genuinely gives back: the
            streak, which FrontendWellbeingService.cs:136 really computes. */}
        <Box
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            bgcolor: (t) =>
              alpha(t.palette.secondary.main, t.palette.mode === "dark" ? 0.10 : 0.12),
            border: 1,
            borderColor: "primary.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ color: "primary.main", display: "flex", pt: 0.25 }}>
              <Heart size={20} fill="currentColor" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                Six days checked in, back to back.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your week is on the chart below. A run of dips looks nothing like one bad day.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ pt: 0.5 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              7-day mood
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
              <TrendingDown size={12} />
              <Typography variant="caption" color="text.secondary">
                Average 2.7
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 56 }}>
            {moods.map((m, i) => {
              const colors = ["#E57373", "#FFB74D", "#FFD54F", "#81C784", "#4DB6AC"];
              return (
                <Box key={i} sx={{ flex: 1, textAlign: "center" }}>
                  <Box
                    sx={{
                      height: `${(m + 1) * 18}%`,
                      bgcolor: colors[m],
                      borderRadius: 1,
                      mb: 0.5,
                      minHeight: 8,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                    {days[i]}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </MockAppFrame>
  );
}

// ============================================================
// Wellbeing 2 — Reflective diary (E2E encrypted)
// ============================================================
export function DiaryEncryptedDemo() {
  return (
    // Badge was "End-to-end encrypted". It is not: DiaryEntry.Content is a
    // plain column and the server reads it to compute sentiment. A padlock in a
    // mock is still a claim, so it says what is actually guaranteed instead.
    <MockAppFrame title="aptiverse.co.za/dashboard/diary" badge="Not shared with family">
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Thursday, 23 May
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              After my Maths SBA today…
            </Typography>
          </Box>
          <Chip
            icon={<LockIcon sx={{ fontSize: 14 }} />}
            label="Private"
            size="small"
            sx={{ height: 24, bgcolor: "action.hover" }}
          />
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: (t) =>
              alpha(t.palette.text.primary, 0.04),
            border: 1,
            borderColor: "divider",
            fontFamily: '"Georgia", "Cambria", serif',
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.7, fontFamily: "inherit" }}>
            I thought I was going to fail. Question 4.2 had me sweating, the chain rule again,
            and my mind just went blank for like two whole minutes. But then I remembered
            the worked example from yesterday and I got it back. Marked roughly 68% in my head.
            Better than last term. <em>Tomorrow I want to drill rate-of-change problems before
            assembly.</em>
          </Typography>
        </Box>

        {/* The badge above this block was fixed, but this panel still said
            "ENCRYPTED ON YOUR DEVICE / the key never leaves your phone" in the
            product's own voice, which is the strongest version of the claim on
            any page and is false. DiaryEntry.Content is a plain column. The
            guarantee we can actually make is the access boundary: no parent
            endpoint returns entries, and none exists to be turned on. */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (t) =>
              alpha(t.palette.secondary.main, t.palette.mode === "dark" ? 0.08 : 0.1),
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <LockIcon sx={{ color: "primary.main", fontSize: 18, mt: 0.25, flexShrink: 0 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: 0.5 }}>
                NOT VISIBLE TO YOUR FAMILY
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No parent endpoint returns a diary entry, a mood or a mark. The parent view is your
                name and what is due next, and that is the whole of it.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Was "TONIGHT'S PROMPT". The prompts are four static chips, not a
            nightly one. */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            NEED A STARTER?
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            What&apos;s one thing you&apos;re proud of today, even a small one?
          </Typography>
        </Box>
      </Stack>
    </MockAppFrame>
  );
}

// ============================================================
// REMOVED: Take A Break
// ============================================================
// It framed itself as /dashboard/break, which is not a route, and opened with
// "You have been on Maths for 92 minutes straight", i.e. session-length
// detection and an unprompted nudge. Nothing measures time on a subject and
// nothing nudges. The four chips under the breathing circle offered a guided
// mindfulness track, lofi audio and a video clip, none of which the product
// has ever contained. Unused by any page. Deleted.
// ============================================================
// REMOVED: in-app counselling
// ============================================================
// The most dangerous mock in the file. It listed three named counsellors with
// invented HPCSA registration numbers, star ratings, bookable time slots, and
// a "Crisis line" promising a reply within 15 minutes. WellbeingController
// .GetCounsellors returns Array.Empty permanently: there is no roster, no
// booking, no session and no duty line. A person in crisis is exactly the
// reader this picture would have convinced. Unused by any page. Deleted.

// ============================================================
// 6. Exam simulator — timer + paper
// ============================================================
// This mock was written for the version of the simulator that did not exist
// yet, and it showed it. The frame pointed at /dashboard/exam-simulator, which
// is not a route: an exam is a practice format, picked on /dashboard/practice
// (practice/page.tsx:297). The badge read "Paper 1", implying an official DBE
// paper, when Claude writes the paper fresh. And the caption promised "detailed
// feedback in the debrief", i.e. the weekly AI debrief, which was one of the
// three invented Student Max features that got stripped. It is still invented,
// so it cannot be the place the feedback lands.
//
// What is real, and what this now shows: a timed paper (:371-376), marks
// against each question, progress counted in marks, and written answers marked
// against a per-question memo with part marks (PracticeService.cs:106-198).
export function ExamSimulatorDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/practice" badge="LIVE · One attempt">
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            // The timer and the progress read sit side by side on a wide card,
            // but 01:23:45 next to "Q3 of 12 · 18/100 marks" is too much for a
            // narrow phone, so they stack there instead of shrinking.
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.25,
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark" ? "rgba(244,67,54,0.15)" : "rgba(244,67,54,0.08)",
            border: 1,
            borderColor: "error.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ color: "error.main", display: "flex" }}>
              <Timer size={20} />
            </Box>
            <Box>
              <Typography variant="overline" color="error.main">
                Time remaining
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>
                01:23:45
              </Typography>
            </Box>
          </Stack>
          <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Q3 of 12 · 18/100 marks
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ p: 2, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Question 3
            </Typography>
            <Chip label="8 marks" size="small" sx={{ height: 20 }} />
          </Stack>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Determine the equation of the tangent to the curve{" "}
            <Box component="span" sx={{ fontFamily: "monospace" }}>
              f(x) = x³ − 3x² + 2
            </Box>{" "}
            at the point where x = 2.
          </Typography>
          <Box
            sx={{
              minHeight: 60,
              p: 1.25,
              borderRadius: 1,
              bgcolor: "action.hover",
              border: 1,
              borderStyle: "dashed",
              borderColor: "divider",
              fontFamily: "monospace",
              fontSize: "0.85rem",
              color: "text.secondary",
            }}
          >
            Your answer…
            <Box component="span" sx={{ ml: 0.5, animation: "blink 1s steps(2) infinite", "@keyframes blink": { "50%": { opacity: 0 } } }}>
              |
            </Box>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
          Marked against the memo at submission, with part marks per question.
        </Typography>
      </Stack>
    </MockAppFrame>
  );
}

// ============================================================
// 7. Goals board — the real /dashboard/goals list
// ============================================================
// Built against the running app and goals/page.tsx, not from imagination.
// Every element below exists on the real page:
//
//   - the four tabs, in order: TABS (goals/page.tsx:50)
//   - the card itself is CardRow (components/common/CardRow.tsx): category chip,
//     h6 title, caption subtitle, body copy, then a pinned block of
//     progress-label + right-aligned percent, a 4px bar, and a status pill with
//     the due/verified meta opposite it
//   - the progress label reads "62% of 75%": progressLabel (:177) prints the
//     current and target values rather than the percent, deliberately
//   - the footer chips are GoalFooter (:761). A rewarded goal gets the points
//     chip, every measured goal gets "Auto-checked", an unrewarded one gets
//     "Tracked", and a verified goal also shows the difficulty it cleared
//   - "Up from 61% when you set this." / "Started at 62%. Now 68%." are the two
//     literal baseline sentences at :832-834
//
// Deliberately not drawn: milestones. GoalMilestone has full server CRUD but
// every write button on the detail page renders without a handler, so a student
// cannot make one, and a picture of a milestone list would be a claim we would
// have to walk back.
export function GoalsBoardDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/goals" badge="Checked, not self-reported">
      <Stack spacing={2}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", gap: 2.5 }}>
          {["Active", "At risk", "Completed", "Verified"].map((t) => (
            <Typography
              key={t}
              variant="body2"
              sx={{
                pb: 1,
                fontWeight: t === "Verified" ? 700 : 500,
                color: t === "Verified" ? "primary.main" : "text.secondary",
                borderBottom: 2,
                borderColor: t === "Verified" ? "primary.main" : "transparent",
                whiteSpace: "nowrap",
                fontSize: { xs: "0.78rem", sm: "0.875rem" },
              }}
            >
              {t}
            </Typography>
          ))}
        </Box>

        <MockGoalCard
          category="Academic"
          title="Lift Trigonometry mastery to 75%"
          subject="Mathematics"
          description="Two practice sets a week until the term test."
          progressLabel="78% of 75%"
          progressValue={100}
          tone="achievement"
          statusLabel="Verified"
          meta="Verified 2 days ago"
          points="320 pts earned"
          checkLabel="Auto-checked"
          difficulty="challenge"
          baseline="Up from 61% when you set this."
        />

        <MockGoalCard
          category="Academic"
          title="Beat your practice score: 80%"
          subject="Physical Sciences"
          progressLabel="68% of 80%"
          progressValue={85}
          tone="warning"
          statusLabel="At risk"
          dot
          meta="Due in 5 days"
          points="At least 180 pts"
          checkLabel="Auto-checked"
          baseline="Started at 62%. Now 68%."
        />
      </Stack>
    </MockAppFrame>
  );
}

type GoalTone = "achievement" | "warning";

function MockGoalCard({
  category,
  title,
  subject,
  description,
  progressLabel,
  progressValue,
  tone,
  statusLabel,
  dot,
  meta,
  points,
  checkLabel,
  difficulty,
  baseline,
}: {
  category: string;
  title: string;
  subject: string;
  description?: string;
  progressLabel: string;
  progressValue: number;
  tone: GoalTone;
  statusLabel: string;
  dot?: boolean;
  meta: string;
  points: string;
  checkLabel: string;
  difficulty?: string;
  baseline: string;
}) {
  return (
    <Box
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: 1.5,
        border: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box>
        <Chip label={category} size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {subject}
        </Typography>
      </Box>

      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {progressLabel}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {progressValue}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          color={tone === "achievement" ? "success" : "warning"}
        />
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <MockStatusChip tone={tone} label={statusLabel} dot={dot} />
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "right" }}>
          {meta}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          icon={<Sparkles size={12} />}
          label={points}
          sx={{
            height: 22,
            fontSize: "0.68rem",
            fontWeight: 600,
            bgcolor: (t) => alpha(t.palette.achievement.main, 0.14),
            color: (t) => t.palette.achievement.dark,
            "& .MuiChip-icon": { color: "inherit", ml: 0.75 },
          }}
        />
        <Chip
          size="small"
          variant="outlined"
          icon={<ShieldCheck size={12} />}
          label={checkLabel}
          sx={{ height: 22, fontSize: "0.68rem", "& .MuiChip-icon": { ml: 0.75 } }}
        />
        {difficulty && (
          <Chip
            size="small"
            variant="outlined"
            label={difficulty}
            sx={{ height: 22, fontSize: "0.68rem", textTransform: "capitalize" }}
          />
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary">
        {baseline}
      </Typography>
    </Box>
  );
}

// StatusChip (components/common/StatusChip.tsx) paints its colour as text on a
// 12% wash of itself with a 24% border. Re-derived here from theme tokens so the
// mock matches the real pill in both schemes without importing app internals.
function MockStatusChip({ tone, label, dot }: { tone: GoalTone; label: string; dot?: boolean }) {
  return (
    <Chip
      size="small"
      icon={
        dot ? (
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: `${tone}.main`,
              ml: 1,
              mr: -0.25,
            }}
          />
        ) : undefined
      }
      label={label}
      sx={{
        height: 22,
        fontSize: "0.7rem",
        fontWeight: 600,
        flexShrink: 0,
        bgcolor: (t) => alpha(t.palette[tone].main, 0.12),
        color: (t) => t.palette[tone].main,
        border: (t) => `1px solid ${alpha(t.palette[tone].main, 0.24)}`,
      }}
    />
  );
}

// ============================================================
// 8. Rewards — points spent on real quota
// ============================================================
// The other half of the goals loop, and the half nobody could picture from a
// card that said "points buy real headroom".
//
// Ground truth is /dashboard/rewards as it renders today: LevelCard (:122)
// prints "Level N", the rank, "N points to spend" and "N points to level N+1"
// over a secondary bar, with practice streak, check-in streak and tests done
// alongside. RewardRow (:364) prints the reward title, the quota it raises,
// the cost in pts, a Redeem button that is only contained when affordable, and
// "N points short" underneath when it is not.
//
// The three quota keys are the only ones the meter knows (QUOTA, :50), and the
// costs and copy below are the seeded rewards read off the running app. Level 1
// and the rank "Getting started" are the real starting state, so nothing here
// implies a ladder we have not built.
export function RewardsSpendDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/rewards" badge="Spends on real limits">
      <Stack spacing={2}>
        <Box
          sx={{
            p: { xs: 1.75, sm: 2.25 },
            borderRadius: 1.5,
            border: 1,
            borderColor: (t) => alpha(t.palette.achievement.main, 0.3),
            bgcolor: (t) => alpha(t.palette.achievement.main, 0.1),
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Level 1
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25 }}>
            Getting started
          </Typography>
          <Typography variant="caption" color="text.secondary">
            320 points to spend
          </Typography>
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={64}
              color="secondary"
              sx={{ height: 8, borderRadius: 999 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
              180 points to level 2.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <MiniStat icon={<Flame size={15} />} value="6" label="Practice streak" />
            <MiniStat icon={<CalendarCheck size={15} />} value="4" label="Check-in streak" />
            <MiniStat icon={<ClipboardList size={15} />} value="12" label="Tests done" />
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: "text.secondary", display: "flex" }}>
              <Gift size={16} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Spend your points
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            320 available
          </Typography>
        </Stack>

        <MockRewardRow
          title="100 extra quick questions"
          quota="Quick questions"
          quotaIcon={<Zap size={12} />}
          body="A hundred more quick tutor exchanges for a week."
          cost="250 pts"
          affordable
        />
        <MockRewardRow
          title="10 extra deep sessions"
          quota="Deep tutor sessions"
          quotaIcon={<Brain size={12} />}
          body="Ten more deep-mode tutor sessions on top of your plan, for a week."
          cost="400 pts"
          short="80 points short"
        />

        <Typography variant="caption" color="text.secondary">
          Each one raises a limit on your plan for a set number of days. It goes live straight away.
        </Typography>
      </Stack>
    </MockAppFrame>
  );
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ color: "text.secondary", display: "flex", mb: 0.25 }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
        {label}
      </Typography>
    </Box>
  );
}

function MockRewardRow({
  title,
  quota,
  quotaIcon,
  body,
  cost,
  affordable,
  short,
}: {
  title: string;
  quota: string;
  quotaIcon: React.ReactNode;
  body: string;
  cost: string;
  affordable?: boolean;
  short?: string;
}) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "flex-start" }}
        justifyContent="space-between"
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Chip
              size="small"
              icon={quotaIcon as React.ReactElement}
              label={quota}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem", "& .MuiChip-icon": { ml: 0.75 } }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {body}
          </Typography>
        </Box>
        <Stack
          spacing={0.5}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ flexShrink: 0 }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
          >
            {cost}
          </Typography>
          <Button
            size="small"
            variant={affordable ? "contained" : "outlined"}
            disabled={!affordable}
            sx={{ py: 0.25, fontSize: "0.72rem" }}
          >
            Redeem
          </Button>
          {short && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {short}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

// ============================================================
// 9. Career navigator — plans measured against real marks
// ============================================================
// Shipped, free on every plan (features.ts:140), and until now the page never
// showed it. Drawn from /dashboard/career in the running app:
//
//   - the plan list is headed "Sorted by how far off you are", closest first,
//     and its own caption explains why the number is the biggest single gap
//   - each row is a status dot, programme, institution, a ReachChip, and a
//     chevron, over a stacked bar whose segments are the requirement counts
//   - "On track" and "4 short" are reachLabel (lib/targets/reach.ts:347); the
//     "2 clear · 1 short" line is joined from the same counts (career/page.tsx:561)
//   - the deadline line reads "8 days to apply · 30 Jul 2026" and turns warning
//     inside 30 days, with a wash inside 14 (:642-656)
//   - the right-hand panel is "Where you stand, course by course", each row a
//     current mark with "N topics practised" when practice has measured it
//
// The requirements are entered by the student. Nothing here implies we hold a
// university prospectus, because we do not.
export function CareerTargetsDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/career" badge="Free on every plan">
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Your plans
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Sorted by how far off you are
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Closest first. The number is your biggest single gap, because an application is judged on
            the requirement you missed.
          </Typography>
        </Box>

        <MockPlanRow
          tone="success"
          programme="BSc Computer Science"
          institution="University of Cape Town"
          reach="On track"
          segments={[{ n: 4, tone: "success" }]}
          counts="4 clear"
          deadline="8 days to apply · 30 Jul 2026"
          urgent
        />
        <MockPlanRow
          tone="warning"
          programme="BSc Actuarial Science"
          institution="University of the Witwatersrand"
          reach="4 short"
          segments={[
            { n: 3, tone: "success" },
            { n: 1, tone: "warning" },
          ]}
          counts="3 clear · 1 short"
          deadline="62 days to apply · 30 Sep 2026"
        />

        <Box sx={{ pt: 0.5, borderTop: 1, borderColor: "divider" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ pt: 1.5 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Your record
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Where you stand, subject by subject
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap", pt: 1 }}>
              2 measured
            </Typography>
          </Stack>

          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            <MockRecordRow name="Mathematics" note="Current mark · 8 topics practised" mark={78} />
            <MockRecordRow name="Physical Sciences" note="Current mark" mark={64} />
          </Stack>
        </Box>
      </Stack>
    </MockAppFrame>
  );
}

type ReachTone = "success" | "warning";

function MockPlanRow({
  tone,
  programme,
  institution,
  reach,
  segments,
  counts,
  deadline,
  urgent,
}: {
  tone: ReachTone;
  programme: string;
  institution: string;
  reach: string;
  segments: { n: number; tone: ReachTone }[];
  counts: string;
  deadline: string;
  urgent?: boolean;
}) {
  const total = segments.reduce((sum, s) => sum + s.n, 0);
  return (
    <Box sx={{ p: 1.5, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          aria-hidden
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            flexShrink: 0,
            mt: 0.75,
            bgcolor: `${tone}.main`,
            boxShadow: (t) => `0 0 0 3px ${alpha(t.palette[tone].main, 0.12)}`,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {programme}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {institution}
          </Typography>
        </Box>
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.375,
            borderRadius: 1,
            fontSize: "0.72rem",
            fontWeight: 700,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
            color: `${tone}.main`,
            bgcolor: (t) => alpha(t.palette[tone].main, 0.14),
          }}
        >
          {reach}
        </Box>
        <Box sx={{ color: "text.disabled", display: "flex", flexShrink: 0, pt: 0.25 }}>
          <ChevronRight size={16} />
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.5} sx={{ mt: 1.25 }}>
        {segments.map((s, i) => (
          <Box
            key={i}
            sx={{
              flex: s.n / total,
              height: 4,
              borderRadius: 999,
              bgcolor: `${s.tone}.main`,
            }}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
        <Typography variant="caption" color="text.secondary">
          {counts}
        </Typography>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={
            urgent
              ? {
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: (t) => alpha(t.palette.warning.main, 0.14),
                }
              : undefined
          }
        >
          {/* The real page only colours a deadline inside 30 days and only
              washes it inside 14 (career/page.tsx:642). A far-off date is plain
              text there, so it is plain text here. */}
          <Box sx={{ color: urgent ? "warning.main" : "text.disabled", display: "flex" }}>
            <CalendarClock size={13} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: urgent ? "warning.main" : "text.secondary",
              fontWeight: urgent ? 700 : 400,
            }}
          >
            {deadline}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function MockRecordRow({ name, note, mark }: { name: string; note: string; mark: number }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {note}
          </Typography>
        </Box>
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: "0.72rem",
            fontWeight: 700,
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
            color: "success.main",
            bgcolor: (t) => alpha(t.palette.success.main, 0.14),
          }}
        >
          {mark}%
        </Box>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={mark}
        color="success"
        sx={{ mt: 0.75, height: 4, borderRadius: 999 }}
      />
    </Box>
  );
}
