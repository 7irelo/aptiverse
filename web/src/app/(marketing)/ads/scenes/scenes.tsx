"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Sparkles,
  User,
  BookOpen,
  ArrowRight,
  Target,
  TrendingUp,
  ShieldCheck,
  Gauge,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MockAppFrame } from "@/components/marketing/FeatureShowcase";

// =====================================================================
// TRUTH PASS (2026-07). These scenes are advertising, and a mockup makes a
// claim as loudly as a headline does. Four things drawn here did not exist
// in the product and have been removed or replaced:
//
//   1. Textbook / past-paper citation chips on the tutor reply. There is no
//      retrieval, no document index and no citation path in api/Modules/AI:
//      AiController exposes exactly two actions, POST /api/ai/help and POST
//      /api/ai/tutor. What the tutor really has is the student profile that
//      BuildTutorPrompt injects, so the chips now show that instead.
//   2. A mastery "confidence band" fanning across a forecast chart.
//      MasteryController returns CurrentTerm, PredictedNextTerm and a scalar
//      Confidence per subject. The app draws a two-point Current to Predicted
//      slope and never draws a band. Removed with it: "Predicted matric mark"
//      and an invented "Distinction track" chip.
//   3. A worked-solution step-through with per-step mark badges and a
//      "Markscheme reference: 2023 P2 Memo, pg. 14" chip.
//      /dashboard/past-papers hosts no papers, no memos and no solutions. It
//      is a signpost to the DBE archive, and it redirects tertiary students
//      away entirely.
//   4. "SBA Coach", a rubric-aware draft annotator. No endpoint, no page, no
//      model call anywhere in the codebase.
//
// Scenes 3 and 4 are now PracticeScene and GoalsVerifiedScene, both grounded
// in pages that render today. The tutor and mastery scenes moved to tertiary
// wording (courses, semesters) to match the campaign audience; the app
// switches the same words off the student's education level.
// =====================================================================

// Shared timing helper. `useStaged([400, 800, 1200])` returns `[true, true, false]`
// while each timer fires. Cleans up on unmount so a re-keyed parent
// starts fresh without orphan timers stacking.
function useStaged(triggers: number[]): boolean[] {
  const [flags, setFlags] = useState(() => triggers.map(() => false));
  useEffect(() => {
    const ids = triggers.map((delay, i) =>
      setTimeout(() => {
        setFlags((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay),
    );
    return () => ids.forEach(clearTimeout);
    // triggers is a stable literal at call site, fine to depend on length.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return flags;
}

// =====================================================================
// SCENE 1: An AI tutor that knows what you are studying
// =====================================================================
export function TutorChatScene() {
  // 0.4s: user message slides in
  // 1.4s: AI typing dots appear
  // 2.8s: AI reply expands, formula block lands
  // 4.0s: context chips pop in (what the tutor genuinely knows about you)
  // 6.0s: trailing line, the follow-up it is writing
  const [userIn, dotsIn, replyIn, contextIn, followUpIn] = useStaged([400, 1400, 2800, 4000, 6000]);

  return (
    <Box sx={{ width: "100%", maxWidth: 520 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/chatbot" badge="Calculus I">
        <Stack spacing={2} sx={{ minHeight: 360 }}>
          <AnimatePresence>
            {userIn && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <UserBubble>Explain the chain rule. I keep losing it in the tut questions.</UserBubble>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {dotsIn && !replyIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ThinkingDots />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {replyIn && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <AiBubble>
                  Sure. The chain rule lets you differentiate a function inside another function. It is
                  the key to <strong>related rates and optimisation</strong>, which is most of what your
                  tuts are testing.
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      fontFamily: "monospace",
                      fontSize: "0.9em",
                    }}
                  >
                    d/dx [f(g(x))] = f&apos;(g(x)) · g&apos;(x)
                  </Box>
                  <AnimatePresence>
                    {contextIn && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                      >
                        {/* These read "Mind Action Series, p. 218" and "2020 NSC
                            Paper 1 Q9" before. Nothing in the product can cite a
                            source. What it can do is read the profile it was
                            handed, so that is what they say now. */}
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                          <Chip
                            icon={<BookOpen size={13} />}
                            label="Knows you take Calculus I"
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.72rem", "& .MuiChip-icon": { ml: 0.75 } }}
                          />
                          <Chip
                            label="Pitched at first year"
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.72rem" }}
                          />
                        </Stack>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AiBubble>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {followUpIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.6 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      animation: "pulse 1.4s ease-in-out infinite",
                      "@keyframes pulse": { "0%, 100%": { opacity: 0.3 }, "50%": { opacity: 1 } },
                    }}
                  />
                  {/* Was "AI is generating adaptive practice". The practice it
                      writes is real; the adaptivity is not. */}
                  <Typography variant="caption" color="text.secondary">
                    Writing original questions with worked solutions…
                  </Typography>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </MockAppFrame>
    </Box>
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
        <User size={18} />
      </Avatar>
    </Stack>
  );
}

function AiBubble({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 32, height: 32 }}>
        <Sparkles size={17} />
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
        <Typography variant="body2" component="div">
          {children}
        </Typography>
      </Box>
    </Stack>
  );
}

function ThinkingDots() {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 32, height: 32 }}>
        <Sparkles size={17} />
      </Avatar>
      <Box sx={{ display: "flex", gap: 0.5, px: 1.5, py: 1, borderRadius: 2, bgcolor: "action.hover" }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: "blink 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
              "@keyframes blink": { "0%, 80%, 100%": { opacity: 0.25 }, "40%": { opacity: 1 } },
            }}
          />
        ))}
      </Box>
    </Stack>
  );
}

// =====================================================================
// SCENE 2: Mastery, and where each course is heading
// =====================================================================
// Redrawn against /dashboard/mastery as it renders: the overall ring with
// its band label from band() (mastery/page.tsx:146), the three mini stats,
// the Strongest / Focus on rows, and ProjectionSlope, whose lines run from
// the current-period mark to the predicted next-period mark and nothing
// else. The old version drew a shaded confidence band across a nine-month
// forecast curve, headed it "Predicted matric mark", and landed a
// "Distinction track" chip. None of the three exists: Confidence is a
// scalar the UI never plots, there is no time series, and no code anywhere
// computes a distinction.
export function MasteryForecastScene() {
  const [ringIn, statsIn, insightIn, slopeIn] = useStaged([300, 1000, 2000, 3200]);

  return (
    <Box sx={{ width: "100%", maxWidth: 600 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/mastery" badge="From your own answers">
        <Stack spacing={2.5} sx={{ minHeight: 320 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <MasteryRing value={68} visible={ringIn} />

            <AnimatePresence>
              {statsIn && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Stack spacing={1}>
                    <SceneMiniStat value="14" label="topics practised" />
                    <SceneMiniStat value="4" label="courses" />
                    <SceneMiniStat value="9" label="improving" tint="success.main" />
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {insightIn && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Stack spacing={1.5}>
                    <SceneInsightRow tone="success" label="Strongest" topic="Limits" percent={86} />
                    <SceneInsightRow
                      tone="warning"
                      label="Focus on"
                      topic="Integration by parts"
                      percent={41}
                    />
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>

          <Box sx={{ pt: 1.5, borderTop: 1, borderColor: "divider" }}>
            <Typography variant="overline" color="text.secondary">
              Projection
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Where each course is heading
            </Typography>
            <ProjectionSlopeScene visible={slopeIn} />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2.5 }}>
              Each line runs from your current semester mark to the predicted next-semester mark.
            </Typography>
          </Box>
        </Stack>
      </MockAppFrame>
    </Box>
  );
}

// The overall mastery ring on the hero. Stroke draws once on reveal.
function MasteryRing({ value, visible }: { value: number; visible: boolean }) {
  const theme = useTheme();
  const size = 132;
  const thickness = 11;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  // band() at mastery/page.tsx:146 - >=80 Strong, >=50 Building, else Keep going.
  const tone = value >= 80 ? "success" : value >= 50 ? "primary" : "warning";
  const label = value >= 80 ? "Strong" : value >= 50 ? "Building" : "Keep going";

  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <Box component="svg" width={size} height={size} sx={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={thickness}
          stroke={theme.palette.divider}
        />
        {visible && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            stroke={theme.palette[tone].main}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
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
        <Typography variant="h4" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {value}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

function SceneMiniStat({ value, label, tint }: { value: string; label: string; tint?: string }) {
  return (
    <Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          lineHeight: 1.1,
          color: tint ?? "text.primary",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

function SceneInsightRow({
  tone,
  label,
  topic,
  percent,
}: {
  tone: "success" | "warning";
  label: string;
  topic: string;
  percent: number;
}) {
  const Icon = tone === "success" ? TrendingUp : Target;
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: `${tone}.main`,
          bgcolor: (t) => alpha(t.palette[tone].main, 0.14),
        }}
      >
        <Icon size={16} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
          {topic}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: `${tone}.main`, fontVariantNumeric: "tabular-nums" }}
      >
        {percent}%
      </Typography>
    </Stack>
  );
}

// Two points per course, current to predicted. Exactly what the app plots,
// and deliberately nothing more: no band, no interpolated months.
function ProjectionSlopeScene({ visible }: { visible: boolean }) {
  const theme = useTheme();
  const rows = [
    { name: "Calculus I", current: 58, predicted: 66 },
    { name: "Linear Algebra", current: 71, predicted: 74 },
    { name: "Physics I", current: 64, predicted: 61 },
  ];
  const h = 140;
  const y = (v: number) => h - 12 - (v / 100) * (h - 28);

  return (
    <Box sx={{ height: h, width: "100%", position: "relative" }}>
      <svg width="100%" height={h} viewBox={`0 0 400 ${h}`} preserveAspectRatio="none">
        <g stroke={theme.palette.divider} strokeWidth="1">
          {[25, 50, 75].map((v) => (
            <line key={v} x1="0" y1={y(v)} x2="400" y2={y(v)} />
          ))}
        </g>
        {visible &&
          rows.map((row, i) => {
            const stroke =
              row.predicted >= row.current ? theme.palette.success.main : theme.palette.warning.main;
            return (
              <g key={row.name}>
                <motion.line
                  x1="60"
                  y1={y(row.current)}
                  x2="340"
                  y2={y(row.predicted)}
                  stroke={stroke}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: i * 0.18 }}
                />
                <circle cx="60" cy={y(row.current)} r="4" fill={stroke} />
                <circle cx="340" cy={y(row.predicted)} r="4" fill={stroke} />
              </g>
            );
          })}
      </svg>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ position: "absolute", left: 0, right: 0, bottom: -18 }}
      >
        <Typography variant="caption" color="text.secondary">
          Current
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Predicted
        </Typography>
      </Stack>
    </Box>
  );
}

// =====================================================================
// SCENE 3: Practice written for the topics you are worst at
// =====================================================================
// Replaces "SBA Coach", which was a rubric-aware draft annotator that does
// not exist: no page, no route, and only two AI actions in the whole API
// (POST /api/ai/help and POST /api/ai/tutor), neither of which reads a
// rubric. This scene is /dashboard/practice instead, which does ship:
// the generator dialog fields are the real ones ("Practising for", "Type",
// "Paper length", "Difficulty", "Target my weakest topics"), and generation
// is POST /api/practice/tests/generate.
export function PracticeScene() {
  const [formIn, weakIn, generatingIn, testIn] = useStaged([300, 1400, 2600, 4200]);

  return (
    <Box sx={{ width: "100%", maxWidth: 560 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/practice" badge="Written for you">
        <Stack spacing={2} sx={{ minHeight: 360 }}>
          <AnimatePresence>
            {formIn && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Stack spacing={1.25}>
                  <SceneField label="Practising for" value="Calculus I" />
                  <Stack direction="row" spacing={1.25}>
                    <SceneField label="Paper length" value="12 questions" />
                    <SceneField label="Difficulty" value="Stretch" />
                  </Stack>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {weakIn && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    p: 1.25,
                    borderRadius: 1.5,
                    bgcolor: (t) => alpha(t.palette.secondary.main, 0.22),
                    border: 1,
                    borderColor: (t) => alpha(t.palette.secondary.dark, 0.35),
                  }}
                >
                  <Box sx={{ display: "flex", color: "text.primary" }}>
                    <Target size={16} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
                    Target my weakest topics
                  </Typography>
                  <SceneToggle on />
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {generatingIn && !testIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ display: "flex", color: "text.secondary" }}>
                    <Sparkles size={15} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Writing 12 original questions…
                  </Typography>
                </Stack>
                <LinearProgress sx={{ mt: 1, borderRadius: 999 }} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {testIn && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <Box sx={{ p: 2, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
                  <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
                    <Chip
                      icon={<Sparkles size={12} />}
                      label="AI"
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.68rem", "& .MuiChip-icon": { ml: 0.75 } }}
                    />
                    <Chip label="12 questions" size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
                  </Stack>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Calculus I: chain rule and related rates
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Weighted to Integration by parts, your weakest topic at 41%.
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center">
                    <Button variant="contained" size="small" endIcon={<ArrowRight size={15} />}>
                      Start
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Every answer feeds your mastery.
                    </Typography>
                  </Stack>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </MockAppFrame>
    </Box>
  );
}

function SceneField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, px: 1.5, py: 1, borderRadius: 1.5, border: 1, borderColor: "divider" }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
        {value}
      </Typography>
    </Box>
  );
}

function SceneToggle({ on }: { on: boolean }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 20,
        borderRadius: 999,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: on ? "flex-end" : "flex-start",
        px: 0.375,
        bgcolor: "primary.main",
      }}
    >
      <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: "primary.contrastText" }} />
    </Box>
  );
}

// =====================================================================
// SCENE 4: Goals that get checked, not self-reported
// =====================================================================
// Replaces the past-paper walk-through. Aptiverse hosts no past papers, no
// memos and no worked solutions: /dashboard/past-papers is a signpost to the
// DBE archive and it redirects tertiary students to practice. The old scene
// drew four solution steps with per-step mark badges and a "Markscheme
// reference: 2023 P2 Memo, pg. 14" chip, none of which the product has.
//
// This is /dashboard/goals instead, which does ship: the tab row, the
// auto-checked status, the points award and the baseline sentence are all on
// the real card. Milestones are deliberately not drawn; a student cannot
// create one.
export function GoalsVerifiedScene() {
  const [tabsIn, cardIn, barIn, verifiedIn] = useStaged([300, 900, 1800, 3200]);

  return (
    <Box sx={{ width: "100%", maxWidth: 520 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/goals" badge="Checked, not self-reported">
        <Stack spacing={2} sx={{ minHeight: 320 }}>
          <AnimatePresence>
            {tabsIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
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
                      }}
                    >
                      {t}
                    </Typography>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {cardIn && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.25,
                  }}
                >
                  <Box>
                    <Chip label="Academic" size="small" sx={{ height: 20, fontSize: "0.68rem" }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                      Lift Integration mastery to 75%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Calculus I
                    </Typography>
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        78% of 75%
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                        100%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={barIn ? 100 : 0}
                      color="success"
                      sx={{ transition: "none" }}
                    />
                  </Box>

                  <AnimatePresence>
                    {verifiedIn && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                      >
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <Chip
                            size="small"
                            icon={<Sparkles size={12} />}
                            label="320 pts earned"
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
                            label="Auto-checked"
                            sx={{ height: 22, fontSize: "0.68rem", "& .MuiChip-icon": { ml: 0.75 } }}
                          />
                        </Stack>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Typography variant="caption" color="text.secondary">
                    Up from 61% when you set this.
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {verifiedIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ display: "flex", color: "success.main" }}>
                    <Gauge size={15} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Points spend on real limits, not badges.
                  </Typography>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </MockAppFrame>
    </Box>
  );
}

// =====================================================================
// SCENE 5: End card (logo + URL + CTA)
// =====================================================================
export function EndCardScene() {
  const [logoIn, urlIn, ctaIn] = useStaged([200, 800, 1400]);

  return (
    <Stack alignItems="center" spacing={3} sx={{ textAlign: "center", py: 6 }}>
      <AnimatePresence>
        {logoIn && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, color: "primary.main", letterSpacing: "-0.02em" }}
            >
              aptiverse
            </Typography>
            {/* "A calmer matric. Genuinely." puts every rand behind a
                high-school framing, and the campaign leads with university
                students who never say the word. */}
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Study with a plan, not panic.
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {urlIn && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "monospace",
                color: "text.primary",
                bgcolor: "action.hover",
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              aptiverse.co.za
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ctaIn && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* "Book a demo" is an institutional B2B ask. There is no demo to
                book, and the plan a student buys starts free. */}
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowRight size={18} />}
              sx={{ px: 4, py: 1.25 }}
            >
              Start free
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}
