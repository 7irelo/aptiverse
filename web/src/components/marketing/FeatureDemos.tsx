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
import TimerIcon from "@mui/icons-material/TimerOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import StarIcon from "@mui/icons-material/Star";
import { Frown, Annoyed, Meh, Smile, Laugh, Heart, TrendingDown } from "lucide-react";
import { MockAppFrame } from "./FeatureShowcase";
import { AptiverseLineChart } from "@/components/common/AptiverseLineChart";

// ============================================================
// 1. Curriculum-aware AI Tutor — chat-UI mock
// ============================================================
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
          <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }}>
            <Chip
              icon={<MenuBookIcon sx={{ fontSize: 14 }} />}
              label="Stewart, Calculus, §3.4"
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.72rem" }}
            />
            <Chip label="Tutorial 4, Q9" size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} />
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
            AI is generating adaptive practice…
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
// 2. SBA Coach — essay with inline annotations
// ============================================================
export function SbaCoachDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/sba/draft" badge="History · Source-based essay">
      <Stack spacing={2}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          PARAGRAPH 2 / 5 — coverage: 64% · rubric match: 5/8 marks
        </Typography>

        <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
          The Soweto Uprising of 1976 was a turning point in apartheid South Africa.{" "}
          <Annotated tone="warn">
            Many students protested in the streets.
          </Annotated>{" "}
          Hector Pieterson, who was 13 years old, became the most famous victim of the day.{" "}
          <Annotated tone="info">
            The events showed the world how serious the situation was getting.
          </Annotated>{" "}
          This led to international pressure on the apartheid government.
        </Typography>

        <Stack spacing={1.25} sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
          <FeedbackRow
            tone="warn"
            tag="Specificity"
            text='"Many students protested" — name the schools, the date, and the trigger (Afrikaans medium policy).'
          />
          <FeedbackRow
            tone="info"
            tag="Historical thinking"
            text="Strong link to international response, but tie it to a specific event (e.g. UN arms embargo 1977)."
          />
          <FeedbackRow
            tone="good"
            tag="What's working"
            text="Good chronology and use of a named individual (Hector Pieterson) — examiner will reward this."
          />
        </Stack>
      </Stack>
    </MockAppFrame>
  );
}

function Annotated({ children, tone }: { children: React.ReactNode; tone: "warn" | "info" | "good" }) {
  const color = tone === "warn" ? "warning.main" : tone === "info" ? "info.main" : "success.main";
  return (
    <Box
      component="span"
      sx={{
        bgcolor: (t) =>
          tone === "warn"
            ? t.palette.mode === "dark"
              ? "rgba(255,167,38,0.18)"
              : "rgba(255,167,38,0.18)"
            : tone === "info"
              ? t.palette.mode === "dark"
                ? "rgba(41,182,246,0.18)"
                : "rgba(41,182,246,0.18)"
              : t.palette.mode === "dark"
                ? "rgba(102,187,106,0.18)"
                : "rgba(102,187,106,0.18)",
        borderBottom: 2,
        borderBottomColor: color,
        px: 0.5,
        borderRadius: 0.5,
      }}
    >
      {children}
    </Box>
  );
}

function FeedbackRow({ tone, tag, text }: { tone: "warn" | "info" | "good"; tag: string; text: string }) {
  const chipColor =
    tone === "warn" ? "warning" : tone === "info" ? "info" : "success";
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Chip
        label={tag}
        size="small"
        color={chipColor}
        variant="outlined"
        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600, flexShrink: 0, mt: 0.25 }}
      />
      <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
        {text}
      </Typography>
    </Stack>
  );
}

// ============================================================
// 3. Mastery Predictions — line chart with confidence band
// ============================================================
export function MasteryChartDemo() {
  // Predicted matric mark over the year with a confidence band.
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const actual = [54, 58, 61, 62, 65, 68, null, null, null];
  const predicted = [null, null, null, null, null, 68, 71, 73, 75];
  const upperBand = [null, null, null, null, null, 68, 75, 79, 83];
  const lowerBand = [null, null, null, null, null, 68, 67, 67, 67];

  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/mastery" badge="Maths · forecast 75%">
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="overline" color="text.secondary">
              Predicted final mark
            </Typography>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main" }}>
                75%
              </Typography>
              <Chip label="Distinction track" size="small" color="success" sx={{ height: 22 }} />
            </Stack>
          </Box>
          <Stack alignItems="flex-end" spacing={0.25}>
            <Typography variant="caption" color="text.secondary">
              Confidence interval
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              67% – 83%
            </Typography>
          </Stack>
        </Stack>

        <Box sx={{ height: 200, mx: -1 }}>
          <AptiverseLineChart
            xAxis={[{ data: months, scaleType: "point" }]}
            yAxis={[{ min: 40, max: 100 }]}
            series={[
              {
                data: upperBand,
                label: "Upper band",
                color: "rgba(63,157,149,0.18)",
                area: true,
                showMark: false,
                connectNulls: false,
              },
              {
                data: lowerBand,
                label: "Lower band",
                color: "rgba(255,255,255,0)",
                area: true,
                showMark: false,
                connectNulls: false,
              },
              {
                data: actual,
                label: "Actual",
                color: "#0F6963",
                showMark: true,
                connectNulls: false,
              },
              {
                data: predicted,
                label: "Predicted",
                color: "#3F9D95",
                showMark: true,
                connectNulls: false,
              },
            ]}
            margin={{ top: 10, right: 10, bottom: 24, left: 32 }}
          />
        </Box>

        <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
          <LegendDot color="#0F6963" label="Actual marks" />
          <LegendDot color="#3F9D95" label="Forecast" />
          <LegendDot color="rgba(63,157,149,0.4)" label="Confidence band" />
        </Stack>
      </Stack>
    </MockAppFrame>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

// ============================================================
// 4. Past-paper walk-through — question + worked solution
// ============================================================
export function PastPaperDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/past-papers" badge="NSC 2023 Paper 2 · Q4.2">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Stack
          spacing={1.25}
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: "action.hover",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="overline" color="text.secondary">
              Question
            </Typography>
            <Chip label="4 marks" size="small" sx={{ height: 20 }} />
          </Stack>
          <Typography variant="body2">
            A car of mass <strong>1 200 kg</strong> travelling at{" "}
            <strong>20 m·s⁻¹</strong> brakes to a stop over a distance of 25 m.
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
            Calculate the magnitude of the average braking force, ignoring air resistance.
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="overline" color="primary.main">
            Worked solution
          </Typography>
          <Step n={1} marks={1} text="Use Work–energy theorem: W_net = ΔK_E" />
          <Step n={2} marks={1} text="ΔK_E = ½ m v_f² − ½ m v_i² = 0 − ½ (1 200)(20)² = −240 000 J" />
          <Step n={3} marks={1} text="W_net = F·d·cos(180°) = −F·d → −F·(25) = −240 000" />
          <Step n={4} marks={1} text="∴ F = 9 600 N" />
          <Chip
            icon={<CheckIcon sx={{ fontSize: 14 }} />}
            label="Markscheme reference: 2023 P2 Memo, pg. 14"
            size="small"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem", alignSelf: "flex-start" }}
          />
        </Stack>
      </Box>
    </MockAppFrame>
  );
}

function Step({ n, marks, text }: { n: number; marks: number; text: string }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.72rem",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {n}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
          {text}
        </Typography>
      </Box>
      <Chip
        label={`+${marks}`}
        size="small"
        color="success"
        variant="outlined"
        sx={{ height: 18, fontSize: "0.65rem", flexShrink: 0 }}
      />
    </Stack>
  );
}

// ============================================================
// 5. Adaptive practice — difficulty escalation
// ============================================================
export function AdaptivePracticeDemo() {
  const rows = [
    { topic: "Factorise: x² + 5x + 6", diff: 0.2, status: "correct" as const },
    { topic: "Factorise: 2x² − 5x − 3", diff: 0.4, status: "correct" as const },
    { topic: "Factorise by grouping: x³ − x² + x − 1", diff: 0.6, status: "correct" as const },
    { topic: "Solve x² − 4x + 5 = 0 (over ℂ)", diff: 0.85, status: "current" as const },
    { topic: "Coming next, difficulty 0.9", diff: 0.9, status: "next" as const },
  ];
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/practice" badge="Adaptive · Grade 11">
      <Stack spacing={1.25}>
        <Typography variant="caption" color="text.secondary">
          Difficulty is auto-scaling as you get questions right.
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
                      t.palette.mode === "dark"
                        ? "rgba(63,157,149,0.12)"
                        : "rgba(15,105,99,0.08)"
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
              <Box sx={{ width: 90 }}>
                <LinearProgress
                  variant="determinate"
                  value={r.diff * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": { borderRadius: 3 },
                  }}
                />
              </Box>
            </Stack>
          </Box>
        ))}
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
                      t.palette.mode === "dark"
                        ? "rgba(63,157,149,0.18)"
                        : "rgba(15,105,99,0.10)"
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

        <Box
          sx={{
            p: 1.75,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark" ? "rgba(255,167,38,0.10)" : "rgba(255,167,38,0.08)",
            border: 1,
            borderColor: "warning.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ color: "warning.main", display: "flex", pt: 0.25 }}>
              <Heart size={20} fill="currentColor" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                Stress trending up this week.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try a 3-minute Take A Break, or talk to a counsellor. Both are one tap away.
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
    <MockAppFrame title="aptiverse.co.za/dashboard/diary" badge="End-to-end encrypted">
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
              t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,105,99,0.04)",
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

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(63,157,149,0.08)"
                : "rgba(15,105,99,0.05)",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <LockIcon sx={{ color: "primary.main", fontSize: 18, mt: 0.25, flexShrink: 0 }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", letterSpacing: 0.5 }}>
                ENCRYPTED ON YOUR DEVICE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Even Aptiverse staff cannot read this entry. The key never leaves your phone.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            TONIGHT&apos;S PROMPT
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
// Wellbeing 3 — Take A Break (breathing animation)
// ============================================================
export function TakeABreakDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/break" badge="92 min studied">
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(255,167,38,0.10)"
                : "rgba(255,167,38,0.10)",
            border: 1,
            borderColor: "warning.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Typography sx={{ fontSize: "1.25rem" }}>⏰</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              You&apos;ve been on Maths for 92 minutes straight. The next 10 minutes will be more
              productive if you actually take a break.
            </Typography>
          </Stack>
        </Box>

        {/* Breathing-circle animation */}
        <Box
          sx={{
            height: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              bgcolor: "primary.main",
              opacity: 0.18,
              position: "absolute",
              animation: "breathe 5s ease-in-out infinite",
              "@keyframes breathe": {
                "0%, 100%": { transform: "scale(0.6)" },
                "50%": { transform: "scale(1)" },
              },
            }}
          />
          <Box
            sx={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              bgcolor: "primary.main",
              opacity: 0.35,
              position: "absolute",
              animation: "breathe 5s ease-in-out infinite",
              animationDelay: "0.3s",
            }}
          />
          <Typography variant="h6" sx={{ position: "relative", color: "primary.main", fontWeight: 600 }}>
            Breathe in
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
          {[
            { emoji: "🌬️", label: "1-min breath" },
            { emoji: "🧘", label: "3-min mindfulness" },
            { emoji: "🎵", label: "Lofi beats" },
            { emoji: "😂", label: "Funny clip" },
          ].map((b) => (
            <Chip
              key={b.label}
              label={`${b.emoji}  ${b.label}`}
              variant="outlined"
              sx={{ fontWeight: 500 }}
            />
          ))}
        </Stack>
      </Stack>
    </MockAppFrame>
  );
}

// ============================================================
// Wellbeing 4 — In-app counselling (book a session)
// ============================================================
export function CounsellingDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/psychologist" badge="Talk to a real human">
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Verified counsellors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All HPCSA-registered. First session free on the Family Pro tier and above.
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <CounsellorRow
            name="Dr Nomvula Mthethwa"
            credentials="MA Clinical Psychology · HPCSA #PS0142378"
            specialty="Exam anxiety · matric pressure"
            rating={4.9}
            nextSlot="Tomorrow, 4:00pm"
            booked={false}
          />
          <CounsellorRow
            name="Sipho Naidoo"
            credentials="MA Counselling Psychology · HPCSA #PS0188421"
            specialty="LGBTQ+ youth · family conflict"
            rating={4.8}
            nextSlot="Friday, 11:00am"
            booked={false}
          />
          <CounsellorRow
            name="Annelize van der Merwe"
            credentials="DPsych · HPCSA #PS0091243"
            specialty="Grief · loss · trauma"
            rating={5.0}
            nextSlot="Booked — Thurs 16:00"
            booked={true}
          />
        </Stack>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(63,157,149,0.10)"
                : "rgba(15,105,99,0.06)",
            border: 1,
            borderColor: "primary.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              <strong>Need to talk now?</strong> A counsellor on duty replies within 15 min on the
              Crisis line.
            </Typography>
            <Chip label="Crisis line" size="small" color="error" sx={{ height: 22 }} />
          </Stack>
        </Box>
      </Stack>
    </MockAppFrame>
  );
}

function CounsellorRow({
  name,
  credentials,
  specialty,
  rating,
  nextSlot,
  booked,
}: {
  name: string;
  credentials: string;
  specialty: string;
  rating: number;
  nextSlot: string;
  booked: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        border: 1,
        borderColor: booked ? "primary.light" : "divider",
        bgcolor: booked
          ? (t) =>
              t.palette.mode === "dark"
                ? "rgba(63,157,149,0.06)"
                : "rgba(15,105,99,0.04)"
          : "transparent",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: "primary.light", width: 40, height: 40, flexShrink: 0 }}>
          {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.25 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {name}
            </Typography>
            <VerifiedIcon sx={{ fontSize: 14, color: "primary.main", flexShrink: 0 }} />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3 }}>
            {credentials}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.3 }}>
            {specialty}
          </Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Stack direction="row" spacing={0.25} alignItems="center">
            <StarIcon sx={{ fontSize: 14, color: "#FFB400" }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {rating.toFixed(1)}
            </Typography>
          </Stack>
          {booked ? (
            <Chip label="Booked" size="small" color="primary" sx={{ height: 22, fontSize: "0.7rem" }} />
          ) : (
            <Button variant="outlined" size="small" sx={{ minWidth: 0, px: 1.25, py: 0.25, fontSize: "0.72rem" }}>
              {nextSlot}
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

// ============================================================
// 6. Exam simulator — timer + paper
// ============================================================
export function ExamSimulatorDemo() {
  return (
    <MockAppFrame title="aptiverse.co.za/dashboard/exam-simulator" badge="LIVE · Paper 1">
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (t) =>
              t.palette.mode === "dark" ? "rgba(244,67,54,0.15)" : "rgba(244,67,54,0.08)",
            border: 1,
            borderColor: "error.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TimerIcon sx={{ color: "error.main" }} />
            <Box>
              <Typography variant="overline" color="error.main">
                Time remaining
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "monospace", lineHeight: 1 }}>
                01:23:45
              </Typography>
            </Box>
          </Stack>
          <Stack alignItems="flex-end" spacing={0.25}>
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
          Auto-marked at submission. Detailed feedback in the debrief.
        </Typography>
      </Stack>
    </MockAppFrame>
  );
}
