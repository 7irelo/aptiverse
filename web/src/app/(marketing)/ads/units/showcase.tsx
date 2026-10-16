"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Clock,
  Frown,
  Laugh,
  ListChecks,
  Meh,
  Minus,
  ShieldAlert,
  ShieldCheck,
  Smile,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from "lucide-react";
import {
  AdBody,
  AdEyebrow,
  AdHeadline,
  Artboard,
  Wordmark,
  adSurfaces,
  CITRON,
  GRAPHITE,
  type AdScheme,
} from "./adkit";
import { CHART_UP, CHART_DOWN } from "./charts";

// =====================================================================
// PRODUCT SHOWCASE SHEET. One picture, nine real screens.
//
// The brief is the features page compressed into a single postable image.
// "Chart" here means laid out, gridded, catalogued. It is not a plot; the
// plot is org-chart-projection-*, which this deliberately does not repeat.
//
// DENSITY IS THE POINT, and it is the opposite of every other unit in the
// registry. The paid units are one idea at 90px and nothing else, because
// they interrupt somebody. This one rewards stopping: the pleasure is "look
// how much of a semester this thing actually holds", read in one sweep and
// then picked over. So the type scale is small, the grid is even, and nine
// surfaces sit on it rather than one.
//
// WHAT READS AT WHAT SIZE, stated rather than hoped:
//   full size (1080 wide or the 2160 export)  everything, including the
//       14px secondary lines inside the tiles.
//   half feed (~540px)  the tile labels, the big numerals, the ring, the
//       bars, the mood faces. Enough to name every screen.
//   thumbnail (~260px)  the headline, the citron marks, the nine card
//       silhouettes and the ring. The tile labels go soft here, and that is
//       an accepted trade: a catalogue is not a glance unit, and protecting
//       thumbnail legibility would mean four tiles instead of nine.
//
// Tiles are drawn at one fixed design size and reused across the three
// sizes, so a surface looks identical wherever it appears and there is one
// set of type sizes to keep honest rather than three.
//
// TRUTH. Every tile was read off the running app with the seeded first-year
// Aeronautical Engineering student at Wits:
//   /dashboard/mastery       ring 75% Building, 20 topics practised,
//                            5 courses, 8 improving, Strongest Newton Laws
//                            100%, Focus on Friction 33%, the PROJECTION
//                            panel "Where each course is heading", the
//                            weakest-topic list, and Every topic by course
//   /dashboard/assessments    titles, weights, marks, Graded status, 21 marked
//   /dashboard/practice       format and level chips, questions, time,
//                            attempts, best score, topic chips
//   PracticeRunner.tsx        the timer chip, "Question 3 of 5",
//                            "2/5 answered", and the four ground rules
//   /dashboard/goals          the card anatomy and the Auto-checked chip
//   /dashboard/diary          the five check-in moods and the four prompts
//   AiController BuildTutorPrompt  what the tutor is handed, which is a
//                            profile, never a citation
//   charts.tsx AERO_COURSES   the six course marks
//
// Not drawn, because it does not exist: citations on an AI answer, worked
// solutions, a confidence band, counsellor booking, teacher or school views,
// audio explanations, a weekly debrief, study-plan AI, anything WhatsApp. No
// outcome statistic and no user count anywhere. "One attempt" is also absent:
// the generated practice cards in the running app show three and four
// attempts, so the only integrity claims here are the ones InstructionsView
// literally makes.
// =====================================================================

const SITE = "aptiverse.co.za";

/** Every tile is authored at exactly this box and reused at every size. */
const TILE_W = 316;
const TILE_H = 300;
const GUTTER = 18;

// ---------------------------------------------------------------------
// Tile chrome
// ---------------------------------------------------------------------

function Tile({
  scheme,
  label,
  children,
}: {
  scheme: AdScheme;
  label: string;
  children: React.ReactNode;
}) {
  const s = adSurfaces(scheme);
  const panelBg = scheme === "dark" ? "#0F1012" : "#FFFFFF";
  const railBg = scheme === "dark" ? "#181A1E" : "#F1F2EF";

  return (
    <Box
      sx={{
        width: TILE_W,
        height: TILE_H,
        borderRadius: "12px",
        overflow: "hidden",
        border: `1.5px solid ${s.hair}`,
        bgcolor: panelBg,
        color: s.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* The label rail is the tile's whole caption. It sits inside the card
          rather than under it so the sheet reads as a set of screens, not as
          a table of pictures with a key. */}
      <Stack
        direction="row"
        alignItems="center"
        spacing="9px"
        sx={{
          px: "12px",
          py: "8px",
          bgcolor: railBg,
          borderBottom: `1.5px solid ${s.hair}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ width: 6, height: 17, bgcolor: CITRON, borderRadius: "2px", flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: "-0.015em",
            color: s.ink,
            flex: 1,
            minWidth: 0,
          }}
          noWrap
        >
          {label}
        </Typography>
      </Stack>
      <Box sx={{ p: "12px", flex: 1, minHeight: 0, overflow: "hidden" }}>{children}</Box>
    </Box>
  );
}

/**
 * The grid. Fixed columns of TILE_W with even gutters, left aligned, so a
 * short final row does not centre itself and break the left edge every other
 * element on the artboard is aligned to.
 */
function Sheet({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${TILE_W}px)`,
        gap: `${GUTTER}px`,
        justifyContent: "start",
      }}
    >
      {children}
    </Box>
  );
}

function sheetWidth(cols: number) {
  return cols * TILE_W + (cols - 1) * GUTTER;
}

// ---------------------------------------------------------------------
// Shared small parts
// ---------------------------------------------------------------------

function Chip({
  scheme,
  children,
  icon,
  tone,
}: {
  scheme: AdScheme;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: string;
}) {
  const s = adSurfaces(scheme);
  return (
    <Stack
      direction="row"
      spacing="5px"
      alignItems="center"
      sx={{
        px: "8px",
        py: "3px",
        borderRadius: 999,
        border: `1.5px solid ${tone ? alpha(tone, 0.4) : s.hair}`,
        bgcolor: tone ? alpha(tone, 0.14) : "transparent",
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.35,
        color: tone ?? s.muted,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {icon}
      <span>{children}</span>
    </Stack>
  );
}

function Bar({
  scheme,
  value,
  tone,
  height = 6,
}: {
  scheme: AdScheme;
  value: number;
  tone: string;
  height?: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Box sx={{ height, borderRadius: 999, bgcolor: s.hair, overflow: "hidden" }}>
      <Box sx={{ width: `${Math.min(100, value)}%`, height: "100%", bgcolor: tone }} />
    </Box>
  );
}

// ---------------------------------------------------------------------
// 1. Mastery. The overall read on /dashboard/mastery.
// ---------------------------------------------------------------------

function Ring({ scheme, value, band }: { scheme: AdScheme; value: number; band: string }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const size = 104;
  const thickness = 10;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  // band(): >=80 Strong, >=50 Building, else Keep going.
  const tone =
    value >= 80 ? t.palette.success.main : value >= 50 ? t.palette.primary.main : t.palette.warning.main;
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Box component="svg" width={size} height={size} sx={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} stroke={s.hair} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          stroke={tone}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontSize: 30, fontWeight: 700, color: s.ink, lineHeight: 1 }}>
          {value}%
        </Typography>
        <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.4 }}>{band}</Typography>
      </Box>
    </Box>
  );
}

function InsightRow({
  scheme,
  tone,
  icon,
  label,
  topic,
  percent,
}: {
  scheme: AdScheme;
  tone: string;
  icon: React.ReactNode;
  label: string;
  topic: string;
  percent: number;
}) {
  const s = adSurfaces(scheme);
  return (
    <Stack direction="row" spacing="9px" alignItems="center">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: tone,
          bgcolor: alpha(tone, 0.16),
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: s.muted,
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: s.ink, lineHeight: 1.3 }} noWrap>
          {topic}
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: 18, fontWeight: 700, color: tone, lineHeight: 1.3, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {percent}%
      </Typography>
    </Stack>
  );
}

function MasteryTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const counts = [
    { value: "20", label: "topics" },
    { value: "5", label: "courses" },
    { value: "8", label: "improving" },
  ];
  return (
    <Tile scheme={scheme} label="Mastery">
      <Stack spacing="12px">
        <Stack direction="row" spacing="14px" alignItems="center">
          <Ring scheme={scheme} value={75} band="Building" />
          <Stack spacing="8px" sx={{ flex: 1, minWidth: 0 }}>
            {counts.map((c) => (
              <Stack key={c.label} direction="row" spacing="8px" alignItems="baseline">
                <Typography
                  sx={{ fontSize: 20, fontWeight: 700, color: s.ink, width: 26, textAlign: "right", lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}
                >
                  {c.value}
                </Typography>
                <Typography sx={{ fontSize: 14, color: s.muted, lineHeight: 1.2 }} noWrap>
                  {c.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Box sx={{ height: 1.5, bgcolor: s.hair }} />
        <Stack spacing="10px">
          <InsightRow
            scheme={scheme}
            tone={t.palette.success.main}
            icon={<TrendingUp size={15} />}
            label="Strongest"
            topic="Newton Laws"
            percent={100}
          />
          <InsightRow
            scheme={scheme}
            tone={t.palette.warning.main}
            icon={<Target size={15} />}
            label="Focus on"
            topic="Friction"
            percent={33}
          />
        </Stack>
        <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.4 }}>
          From your own answers, topic by topic.
        </Typography>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 2. Projection. The PROJECTION panel on the same page, "Where each course
//    is heading". Values read back from GET /api/mastery/predictions for the
//    seeded account: every course projects, because every course has graded
//    work in it. A four-row subset of charts.tsx AERO_COURSES, chosen to show
//    one climbing, one flat and one falling rather than to flatter.
// ---------------------------------------------------------------------

function ProjectionTile({ scheme }: { scheme: AdScheme }) {
  const s = adSurfaces(scheme);
  const rows: { name: string; current: number; predicted: number | null }[] = [
    { name: "Electrical Engineering", current: 70, predicted: 73 },
    { name: "Mathematics", current: 65, predicted: 65 },
    { name: "Physics", current: 61, predicted: 66 },
    { name: "Chemistry", current: 51, predicted: 46 },
  ];
  return (
    <Tile scheme={scheme} label="Where each course is heading">
      <Stack spacing="11px">
        {rows.map((r) => {
          const up = r.predicted !== null && r.predicted >= r.current;
          const tone = r.predicted === null ? s.muted : up ? CHART_UP : CHART_DOWN;
          return (
            <Box key={r.name}>
              <Stack direction="row" spacing="8px" alignItems="baseline" sx={{ mb: "5px" }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: s.ink, flex: 1, minWidth: 0, lineHeight: 1.3 }} noWrap>
                  {r.name}
                </Typography>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 700, color: s.ink, lineHeight: 1.3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}
                >
                  {r.current}
                </Typography>
                {r.predicted === null ? (
                  <Stack direction="row" spacing="3px" alignItems="center" sx={{ color: s.muted, flexShrink: 0 }}>
                    <Minus size={12} />
                    <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.3, whiteSpace: "nowrap" }}>
                      no projection
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing="3px" alignItems="center" sx={{ color: tone, flexShrink: 0 }}>
                    {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    <Typography
                      sx={{ fontSize: 15, fontWeight: 700, color: tone, lineHeight: 1.3, fontVariantNumeric: "tabular-nums" }}
                    >
                      {r.predicted}
                    </Typography>
                  </Stack>
                )}
              </Stack>
              <Bar scheme={scheme} value={r.predicted ?? r.current} tone={tone} height={5} />
            </Box>
          );
        })}
        <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.4 }}>
          Arithmetic on marks already logged, weighted by topic mastery. Not a forecast of a final
          result.
        </Typography>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 3. The practice runner, mid test.
// ---------------------------------------------------------------------

function RunnerTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const answers = [
    { text: "The weight of the ladder", picked: false },
    { text: "The reaction at the wall", picked: true },
  ];
  return (
    <Tile scheme={scheme} label="Timed. Tutor off.">
      <Stack spacing="10px">
        <Stack direction="row" spacing="10px" alignItems="center">
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.ink, flex: 1, minWidth: 0, lineHeight: 1.3 }} noWrap>
            Statics: equilibrium and moments
          </Typography>
          <Chip scheme={scheme} icon={<Clock size={12} />}>
            17:42
          </Chip>
        </Stack>
        <Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: "5px" }}>
            <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.3, fontVariantNumeric: "tabular-nums" }}>
              Question 3 of 5
            </Typography>
            <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.3 }}>2/5 answered</Typography>
          </Stack>
          <Bar scheme={scheme} value={60} tone={t.palette.primary.main} height={5} />
        </Box>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: s.ink, lineHeight: 1.35 }}>
          Which force balances the friction at the base of the ladder?
        </Typography>
        <Stack spacing="7px">
          {answers.map((o) => (
            <Stack
              key={o.text}
              direction="row"
              spacing="9px"
              alignItems="center"
              sx={{
                px: "10px",
                py: "8px",
                borderRadius: "8px",
                border: `1.5px solid ${o.picked ? t.palette.primary.main : s.hair}`,
                bgcolor: o.picked ? alpha(t.palette.primary.main, 0.14) : "transparent",
              }}
            >
              <Box
                sx={{
                  width: 13,
                  height: 13,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `2px solid ${o.picked ? t.palette.primary.main : s.hair}`,
                  bgcolor: o.picked ? t.palette.primary.main : "transparent",
                }}
              />
              <Typography sx={{ fontSize: 14, color: s.ink, lineHeight: 1.3 }} noWrap>
                {o.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 4. The ground rules a test states before it starts. Verbatim from
//    PracticeRunner's InstructionsView.
// ---------------------------------------------------------------------

function RulesTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const rules = [
    { icon: <Clock size={14} />, title: "Timed: 18 minutes", body: "The clock starts when you begin and it submits itself when time runs out." },
    { icon: <ShieldAlert size={14} />, title: "Stay on this tab", body: "Switching tabs or apps during the test is recorded. Pause if you need to step away." },
    { icon: <Bot size={14} />, title: "No AI tutor", body: "The AI tutor is turned off while the test is running." },
    { icon: <ListChecks size={14} />, title: "5 questions", body: "Move back and forth and change answers freely before you submit." },
  ];
  return (
    <Tile scheme={scheme} label="Before you start">
      <Stack spacing="11px">
        {rules.map((r) => (
          <Stack key={r.title} direction="row" spacing="9px" alignItems="flex-start">
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "7px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.palette.primary.main,
                bgcolor: alpha(t.palette.primary.main, 0.14),
              }}
            >
              {r.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.ink, lineHeight: 1.3 }}>
                {r.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.35 }}>{r.body}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 5. Assessments. Weight is the column that matters and is the reason the
//    projection can exist at all.
// ---------------------------------------------------------------------

function AssessmentsTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const rows = [
    { title: "Laboratory 1: DC Circuits", course: "Electrical Engineering I", weight: "10%", mark: "75%" },
    { title: "Practical Report 1", course: "Physics I (Engineering)", weight: "5%", mark: "74%" },
    { title: "Tutorial Test 1", course: "Mathematics I (Engineering)", weight: "5%", mark: "72%" },
    { title: "Practical 1: Titration", course: "Chemistry I (Engineering)", weight: "5%", mark: "65%" },
  ];
  const head = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: s.muted,
    lineHeight: 1.3,
    whiteSpace: "nowrap" as const,
  };
  return (
    <Tile scheme={scheme} label="What is due, and its weight">
      <Stack spacing="0px">
        <Stack direction="row" spacing="8px" sx={{ pb: "7px" }}>
          <Typography sx={{ ...head, flex: 1, minWidth: 0 }}>TITLE</Typography>
          <Typography sx={{ ...head, width: 46, textAlign: "right", flexShrink: 0 }}>WEIGHT</Typography>
          <Typography sx={{ ...head, width: 34, textAlign: "right", flexShrink: 0 }}>MARK</Typography>
        </Stack>
        {rows.map((r) => (
          <Stack
            key={r.title}
            direction="row"
            spacing="8px"
            alignItems="center"
            sx={{ py: "7px", borderTop: `1.5px solid ${s.hair}` }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.ink, lineHeight: 1.3 }} noWrap>
                {r.title}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: s.muted, lineHeight: 1.3 }} noWrap>
                {r.course}
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: 14, fontWeight: 600, color: s.ink, width: 46, textAlign: "right", flexShrink: 0, lineHeight: 1.3, fontVariantNumeric: "tabular-nums" }}
            >
              {r.weight}
            </Typography>
            <Typography
              sx={{ fontSize: 14, fontWeight: 700, color: t.palette.success.main, width: 34, textAlign: "right", flexShrink: 0, lineHeight: 1.3, fontVariantNumeric: "tabular-nums" }}
            >
              {r.mark}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 6. A goal settled by the student's own work. The Auto-checked chip and
//    its tooltip are goals/page.tsx GoalFooter, on a topic_mastery goal,
//    which is one of the two rewarded auto-verified kinds.
// ---------------------------------------------------------------------

function GoalsTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const tabs = ["Active", "At risk", "Completed", "Verified"];
  return (
    <Tile scheme={scheme} label="A goal you cannot tick yourself">
      <Stack spacing="10px">
        <Stack direction="row" spacing="14px" sx={{ borderBottom: `1.5px solid ${s.hair}`, pb: "6px" }}>
          {tabs.map((tab) => (
            <Typography
              key={tab}
              sx={{
                fontSize: 12.5,
                fontWeight: tab === "Active" ? 700 : 500,
                color: tab === "Active" ? s.ink : s.muted,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
              }}
            >
              {tab}
            </Typography>
          ))}
        </Stack>
        <Box>
          <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: s.ink, lineHeight: 1.3 }}>
            Raise Friction mastery to 75%
          </Typography>
          <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.35 }}>Mechanics I</Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.35 }}>
          Two practice sets a week until the class test.
        </Typography>
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: "5px" }}>
            <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.3 }}>33% of 75%</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.ink, lineHeight: 1.3, fontVariantNumeric: "tabular-nums" }}>
              44%
            </Typography>
          </Stack>
          <Bar scheme={scheme} value={44} tone={t.palette.primary.main} height={5} />
        </Box>
        <Stack direction="row" spacing="7px" alignItems="center">
          <Chip scheme={scheme} icon={<Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: t.palette.primary.main }} />}>
            Active
          </Chip>
          <Chip scheme={scheme} icon={<ShieldCheck size={12} />}>
            Auto-checked
          </Chip>
        </Stack>
        <Typography sx={{ fontSize: 11.5, color: s.muted, lineHeight: 1.35 }}>
          Measured from your work. Nobody can set this by hand.
        </Typography>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 7. The courses a tertiary student created, with the current mark on each.
//    Six rows, the six seeded marks.
// ---------------------------------------------------------------------

function CoursesTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const rows = [
    { name: "Engineering Drawing", mark: 78 },
    { name: "Electrical Engineering I", mark: 70 },
    { name: "Mathematics I", mark: 65 },
    { name: "Physics I", mark: 61 },
    { name: "Mechanics I", mark: 57 },
    { name: "Chemistry I", mark: 51 },
  ];
  return (
    <Tile scheme={scheme} label="Courses you added yourself">
      <Stack spacing="9px">
        {rows.map((r) => {
          const tone =
            r.mark >= 75 ? t.palette.success.main : r.mark >= 55 ? t.palette.primary.main : t.palette.warning.main;
          return (
            <Box key={r.name}>
              <Stack direction="row" spacing="8px" alignItems="baseline" sx={{ mb: "4px" }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: s.ink, flex: 1, minWidth: 0, lineHeight: 1.3 }} noWrap>
                  {r.name}
                </Typography>
                <Typography
                  sx={{ fontSize: 14.5, fontWeight: 700, color: tone, lineHeight: 1.3, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
                >
                  {r.mark}%
                </Typography>
              </Stack>
              <Bar scheme={scheme} value={r.mark} tone={tone} height={5} />
            </Box>
          );
        })}
        <Typography sx={{ fontSize: 12, color: s.muted, lineHeight: 1.4 }}>
          Added by the student, not from a prospectus.
        </Typography>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 8. The AI tutor. The chips are what BuildTutorPrompt actually hands it:
//    the student's level and study units. They are not citations, because
//    nothing in the AI module can cite anything.
// ---------------------------------------------------------------------

function TutorTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const bubble = scheme === "dark" ? "#1B1D22" : "#F1F2EF";
  return (
    <Tile scheme={scheme} label="A tutor that knows your courses">
      <Stack spacing="9px">
        <Stack direction="row" spacing="7px" justifyContent="flex-end" alignItems="flex-start">
          <Box
            sx={{
              maxWidth: "82%",
              px: "10px",
              py: "7px",
              borderRadius: "9px",
              bgcolor: t.palette.primary.main,
              color: t.palette.primary.contrastText,
              fontSize: 13,
              lineHeight: 1.35,
            }}
          >
            I keep losing marks on friction problems. Where do I start?
          </Box>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: CITRON,
              color: GRAPHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <User size={13} />
          </Box>
        </Stack>
        <Stack direction="row" spacing="7px" alignItems="flex-start">
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: t.palette.primary.main,
              color: t.palette.primary.contrastText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={13} />
          </Box>
          <Box
            sx={{
              px: "10px",
              py: "8px",
              borderRadius: "9px",
              bgcolor: bubble,
              color: s.ink,
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            Start with the free body diagram, because most friction marks are lost before any
            arithmetic happens. Draw the normal force first, then decide whether the block is on the
            point of moving.
            <Stack direction="row" spacing="5px" sx={{ mt: "8px" }} flexWrap="wrap" useFlexGap>
              <Chip scheme={scheme}>Knows you take Mechanics I</Chip>
              <Chip scheme={scheme}>Pitched at first year</Chip>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// 9. The daily check-in. The five moods and the four prompts are the real
//    ones on /dashboard/diary. No padlock and no privacy promise: entries
//    are stored on the server and the page says so itself.
// ---------------------------------------------------------------------

function DiaryTile({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const moods = [
    { Icon: Frown, label: "Really tough" },
    { Icon: Meh, label: "Down" },
    { Icon: Meh, label: "Okay" },
    { Icon: Smile, label: "Good" },
    { Icon: Laugh, label: "Great" },
  ];
  const prompts = ["What went well?", "What's stressing me?", "One small win?"];
  return (
    <Tile scheme={scheme} label="Sixty seconds, every day">
      <Stack spacing="10px">
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: s.ink, lineHeight: 1.3 }}>
          How are you feeling, really?
        </Typography>
        <Stack direction="row" spacing="5px">
          {moods.map((m, i) => {
            const active = i === 3;
            return (
              <Box
                key={m.label}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  py: "7px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: `1.5px solid ${active ? t.palette.primary.main : s.hair}`,
                  bgcolor: active ? alpha(t.palette.primary.main, 0.14) : "transparent",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    color: active ? t.palette.primary.main : s.muted,
                    mb: "3px",
                  }}
                >
                  <m.Icon size={18} />
                </Box>
                {/* Wraps rather than truncates. "Really tou..." on a mood
                    button is the one place an ellipsis reads as a bug. */}
                <Typography
                  sx={{ fontSize: 9.5, color: active ? s.ink : s.muted, lineHeight: 1.15, fontWeight: active ? 700 : 500 }}
                >
                  {m.label}
                </Typography>
              </Box>
            );
          })}
        </Stack>
        <Box
          sx={{
            px: "10px",
            py: "12px",
            borderRadius: "8px",
            border: `1.5px solid ${s.hair}`,
          }}
        >
          <Typography sx={{ fontSize: 13, color: s.muted, lineHeight: 1.4 }}>
            What&rsquo;s on your mind today? It&rsquo;s just for you.
          </Typography>
        </Box>
        <Stack direction="row" spacing="5px" flexWrap="wrap" useFlexGap>
          {prompts.map((p) => (
            <Chip key={p} scheme={scheme}>
              {p}
            </Chip>
          ))}
        </Stack>
      </Stack>
    </Tile>
  );
}

// ---------------------------------------------------------------------
// The nine, in one order, so a surface sits in the same place on every cut.
// Reading order is left to right, top to bottom: what you are taking, how it
// is going, where it is heading, then the three practice tiles, then the two
// that are not about marks at all.
// ---------------------------------------------------------------------

type TileKey =
  | "courses"
  | "mastery"
  | "projection"
  | "runner"
  | "rules"
  | "assessments"
  | "goals"
  | "tutor"
  | "diary";

const TILES: Record<TileKey, (scheme: AdScheme) => React.ReactNode> = {
  courses: (s) => <CoursesTile scheme={s} />,
  mastery: (s) => <MasteryTile scheme={s} />,
  projection: (s) => <ProjectionTile scheme={s} />,
  runner: (s) => <RunnerTile scheme={s} />,
  rules: (s) => <RulesTile scheme={s} />,
  assessments: (s) => <AssessmentsTile scheme={s} />,
  goals: (s) => <GoalsTile scheme={s} />,
  tutor: (s) => <TutorTile scheme={s} />,
  diary: (s) => <DiaryTile scheme={s} />,
};

const ALL_NINE: TileKey[] = [
  "courses",
  "mastery",
  "projection",
  "runner",
  "rules",
  "assessments",
  "goals",
  "tutor",
  "diary",
];

/** The six that survive a square crop, in the same relative order. */
const SIX: TileKey[] = ["courses", "mastery", "projection", "runner", "assessments", "goals"];

function Tiles({ keys, scheme }: { keys: TileKey[]; scheme: AdScheme }) {
  return (
    <>
      {keys.map((k) => (
        <Box key={k}>{TILES[k](scheme)}</Box>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------
// UNIT 1. The sheet. Portrait feed, 1080x1350, dark. Nine surfaces, 3x3.
// ---------------------------------------------------------------------

function ShowcasePortrait() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1350} scheme={scheme} pad={48}>
      <AdEyebrow scheme={scheme} size={20}>
        One student, six courses, one semester
      </AdEyebrow>
      <Box sx={{ height: 16 }} />
      {/* Small for a display line, on purpose. On this unit the headline is a
          caption for the grid rather than the thing being read; the grid is. */}
      <AdHeadline scheme={scheme} size={58} maxWidth={sheetWidth(3)}>
        Nine screens of one engineering student&rsquo;s semester.
      </AdHeadline>
      <Box sx={{ height: 12 }} />
      <AdBody scheme={scheme} size={21} maxWidth={sheetWidth(3)}>
        Every panel below is a screen that ships today, drawn with real marks from one account.
      </AdBody>
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <Sheet cols={3}>
          <Tiles keys={ALL_NINE} scheme={scheme} />
        </Sheet>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing="20px">
        <Stack direction="row" spacing="14px" alignItems="baseline">
          <Wordmark scheme={scheme} size={28} />
          <Typography sx={{ fontSize: 21, color: s.muted }}>{SITE}</Typography>
        </Stack>
      </Stack>
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// UNIT 2. Square cut, 1080x1080, dark. Six surfaces, 3x2.
//
// Not the portrait squashed. A square is 270px shorter, which is one whole
// row, so the row that goes is the one that repeats: the runner keeps the
// practice story and the rules tile, the tutor tile and the diary tile are
// dropped rather than shrunk into unreadability.
// ---------------------------------------------------------------------

function ShowcaseSquare() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1080} scheme={scheme} pad={48}>
      <AdEyebrow scheme={scheme} size={20}>
        For students
      </AdEyebrow>
      <Box sx={{ height: 16 }} />
      <AdHeadline scheme={scheme} size={66} maxWidth={sheetWidth(3)}>
        Six courses, and one place that keeps up with all of them.
      </AdHeadline>
      <Box sx={{ height: 12 }} />
      <AdBody scheme={scheme} size={22} maxWidth={sheetWidth(3)}>
        Real screens, real marks, one account.
      </AdBody>
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <Sheet cols={3}>
          <Tiles keys={SIX} scheme={scheme} />
        </Sheet>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing="20px">
        <Stack direction="row" spacing="14px" alignItems="baseline">
          <Wordmark scheme={scheme} size={28} />
          <Typography sx={{ fontSize: 21, color: s.muted }}>{SITE}</Typography>
        </Stack>
      </Stack>
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// UNIT 3. Story and reel, 1080x1920, dark. Nine surfaces, 3x3.
//
// The platform covers roughly the top 250 and the bottom 350 with its own
// furniture, so the grid sits in the middle band with the headline above it
// and nothing but the wordmark below.
// ---------------------------------------------------------------------

function ShowcaseStory() {
  const scheme: AdScheme = "dark";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1920} scheme={scheme} pad={48}>
      <Box sx={{ height: 150 }} />
      <AdEyebrow scheme={scheme} size={24}>
        Week 9, six courses
      </AdEyebrow>
      <Box sx={{ height: 20 }} />
      <AdHeadline scheme={scheme} size={76} maxWidth={sheetWidth(3)}>
        This is the whole semester, on nine screens.
      </AdHeadline>
      <Box sx={{ height: 16 }} />
      <AdBody scheme={scheme} size={26} maxWidth={sheetWidth(3)}>
        Every panel ships today, drawn with real marks from one account.
      </AdBody>
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <Sheet cols={3}>
          <Tiles keys={ALL_NINE} scheme={scheme} />
        </Sheet>
      </Box>
      <Stack direction="row" spacing="16px" alignItems="baseline">
        <Wordmark scheme={scheme} size={32} />
        <Typography sx={{ fontSize: 24, color: s.muted }}>{SITE}</Typography>
      </Stack>
      <Box sx={{ height: 170 }} />
    </Artboard>
  );
}

// ---------------------------------------------------------------------
// UNIT 4. The same sheet on paper. Portrait 1080x1350, light.
//
// Same nine tiles, same grid, light scheme. It exists because these get
// posted into two very different places: a dark sheet wins in a feed, and a
// light one wins in a deck, a pitch page, a printed one-pager, and anywhere
// it lands on a white background. Rebuilding it as a separate composition
// would be four more things to keep true; it is the same composition with
// the scheme flipped, which is the whole reason the tiles derive their ink
// from the scheme rather than hard coding it.
// ---------------------------------------------------------------------

function ShowcaseLight() {
  const scheme: AdScheme = "light";
  const s = adSurfaces(scheme);
  return (
    <Artboard width={1080} height={1350} scheme={scheme} pad={48}>
      <AdEyebrow scheme={scheme} size={20}>
        What Aptiverse actually looks like
      </AdEyebrow>
      <Box sx={{ height: 16 }} />
      <AdHeadline scheme={scheme} size={58} maxWidth={sheetWidth(3)}>
        Nine screens. No mockups, no roadmap.
      </AdHeadline>
      <Box sx={{ height: 12 }} />
      <AdBody scheme={scheme} size={21} maxWidth={sheetWidth(3)}>
        Every panel below is a screen that ships today, drawn with real marks from one first-year
        engineering account.
      </AdBody>
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        <Sheet cols={3}>
          <Tiles keys={ALL_NINE} scheme={scheme} />
        </Sheet>
      </Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing="20px">
        <Stack direction="row" spacing="14px" alignItems="baseline">
          <Wordmark scheme={scheme} size={28} />
          <Typography sx={{ fontSize: 21, color: s.muted }}>{SITE}</Typography>
        </Stack>
      </Stack>
    </Artboard>
  );
}

export const SHOWCASE_UNITS = {
  ShowcasePortrait,
  ShowcaseSquare,
  ShowcaseStory,
  ShowcaseLight,
};
