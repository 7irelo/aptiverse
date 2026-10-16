"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { Sparkles, Target, TrendingUp, ShieldCheck, User, BookOpen, Lock, CalendarClock } from "lucide-react";
import { AdPanel, AdChip, AdMeter, adSurfaces, CITRON, GRAPHITE, type AdScheme } from "./adkit";

// =====================================================================
// Product depictions, at export scale.
//
// Every one of these is a redraw of a screen that renders today, and each
// carries a note saying which. Nothing here is aspirational: an ad mockup
// is evidence to the person looking at it, so a screen we have not built
// cannot appear in one. In particular these deliberately do NOT show:
// citations on an AI answer, worked solutions, a confidence band, an SBA
// draft coach, counsellor or tutor booking, teacher or school views, or any
// parent-visible read of a child's academic or wellbeing data. Each of
// those was checked against the API and does not exist.
// =====================================================================

// ---------------------------------------------------------------------
// 1. Practice generation. /dashboard/practice: the generator dialog fields
//    are "Practising for", "Paper length", "Difficulty" and the "Target my
//    weakest topics" switch; generation is POST /api/practice/tests/generate
//    and the produced test carries an "AI" chip.
// ---------------------------------------------------------------------
export function PracticeDepiction({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);

  return (
    <AdPanel scheme={scheme} url="aptiverse.co.za/dashboard/practice" badge="Written for you">
      <Stack spacing="20px">
        <Stack direction="row" spacing="16px">
          <Field scheme={scheme} label="Practising for" value="Calculus I" grow />
          <Field scheme={scheme} label="Length" value="12 questions" />
        </Stack>

        <Stack
          direction="row"
          spacing="16px"
          alignItems="center"
          sx={{
            px: "20px",
            py: "16px",
            borderRadius: "14px",
            bgcolor: alpha(CITRON, scheme === "dark" ? 0.16 : 0.35),
            border: `2px solid ${alpha(CITRON, 0.5)}`,
          }}
        >
          <Box sx={{ display: "flex", color: s.ink }}>
            <Target size={24} />
          </Box>
          <Typography sx={{ fontSize: 25, fontWeight: 700, flex: 1, color: s.ink }}>
            Target my weakest topics
          </Typography>
          <Box
            sx={{
              width: 58,
              height: 32,
              borderRadius: 999,
              bgcolor: GRAPHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: "5px",
              flexShrink: 0,
            }}
          >
            <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: CITRON }} />
          </Box>
        </Stack>

        <Box sx={{ p: "22px", borderRadius: "14px", border: `2px solid ${s.hair}` }}>
          <Stack direction="row" spacing="10px" sx={{ mb: "14px" }}>
            <AdChip scheme={scheme} icon={<Sparkles size={16} />}>
              AI
            </AdChip>
            <AdChip scheme={scheme}>12 questions</AdChip>
          </Stack>
          <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: s.ink }}>
            Calculus I: chain rule and related rates
          </Typography>
          <Typography sx={{ fontSize: 22, color: s.muted, mt: "8px" }}>
            Weighted to Integration by parts, your weakest topic at 41%.
          </Typography>
          <Stack direction="row" spacing="16px" alignItems="center" sx={{ mt: "18px" }}>
            <Box
              sx={{
                px: "24px",
                py: "12px",
                borderRadius: "10px",
                bgcolor: t.palette.primary.main,
                color: t.palette.primary.contrastText,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              Start
            </Box>
            <Typography sx={{ fontSize: 21, color: s.muted }}>
              Every answer feeds your mastery.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </AdPanel>
  );
}

function Field({
  scheme,
  label,
  value,
  grow,
}: {
  scheme: AdScheme;
  label: string;
  value: string;
  grow?: boolean;
}) {
  const s = adSurfaces(scheme);
  return (
    <Box
      sx={{
        flex: grow ? 1 : "none",
        minWidth: 0,
        px: "20px",
        py: "14px",
        borderRadius: "14px",
        border: `2px solid ${s.hair}`,
      }}
    >
      <Typography sx={{ fontSize: 18, color: s.muted, lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 600, color: s.ink, whiteSpace: "nowrap" }}>
        {value}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------
// 2. Mastery. /dashboard/mastery: overall ring with the band label from
//    band() (:146), topics practised / units / improving, the Strongest and
//    Focus on rows, and the two-point current-to-predicted projection.
//    Confidence is a scalar the page never plots, so no band is drawn.
// ---------------------------------------------------------------------
export function MasteryDepiction({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);

  return (
    <AdPanel scheme={scheme} url="aptiverse.co.za/dashboard/mastery" badge="From your own answers">
      <Stack spacing="26px">
        <Stack direction="row" spacing="34px" alignItems="center">
          <Ring value={68} scheme={scheme} />
          <Stack spacing="20px" sx={{ flex: 1, minWidth: 0 }}>
            <InsightRow
              scheme={scheme}
              tone={t.palette.success.main}
              icon={<TrendingUp size={22} />}
              label="Strongest"
              topic="Limits"
              percent={86}
            />
            <InsightRow
              scheme={scheme}
              tone={t.palette.warning.main}
              icon={<Target size={22} />}
              label="Focus on"
              topic="Integration by parts"
              percent={41}
            />
          </Stack>
        </Stack>

        <Box sx={{ pt: "24px", borderTop: `2px solid ${s.hair}` }}>
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: s.muted,
            }}
          >
            Projection
          </Typography>
          <Typography sx={{ fontSize: 27, fontWeight: 700, color: s.ink, mb: "16px" }}>
            Where each course is heading
          </Typography>
          <Stack spacing="16px">
            {[
              { name: "Calculus I", current: 58, predicted: 66 },
              { name: "Linear Algebra", current: 71, predicted: 74 },
              { name: "Physics I", current: 64, predicted: 61 },
            ].map((row) => {
              const up = row.predicted >= row.current;
              const tone = up ? t.palette.success.main : t.palette.warning.main;
              return (
                <Stack key={row.name} direction="row" spacing="18px" alignItems="center">
                  <Typography
                    sx={{ fontSize: 23, fontWeight: 600, color: s.ink, width: 230, flexShrink: 0 }}
                    noWrap
                  >
                    {row.name}
                  </Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <AdMeter value={row.predicted} tone={tone} scheme={scheme} height={12} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: 23,
                      fontWeight: 700,
                      color: tone,
                      width: 150,
                      textAlign: "right",
                      flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {row.current}% to {row.predicted}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
          <Typography sx={{ fontSize: 20, color: s.muted, mt: "16px" }}>
            Current semester mark to predicted next-semester mark.
          </Typography>
        </Box>
      </Stack>
    </AdPanel>
  );
}

function Ring({ value, scheme }: { value: number; scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const size = 190;
  const thickness = 17;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  // band(): >=80 Strong, >=50 Building, else Keep going.
  const tone = value >= 80 ? t.palette.success.main : value >= 50 ? t.palette.primary.main : t.palette.warning.main;
  const label = value >= 80 ? "Strong" : value >= 50 ? "Building" : "Keep going";

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
        <Typography sx={{ fontSize: 52, fontWeight: 700, color: s.ink, lineHeight: 1 }}>
          {value}%
        </Typography>
        <Typography sx={{ fontSize: 20, color: s.muted }}>{label}</Typography>
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
    <Stack direction="row" spacing="16px" alignItems="center">
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: "12px",
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
        <Typography sx={{ fontSize: 19, color: s.muted, lineHeight: 1.2 }}>{label}</Typography>
        <Typography sx={{ fontSize: 27, fontWeight: 700, color: s.ink }} noWrap>
          {topic}
        </Typography>
      </Box>
      <Typography
        sx={{ fontSize: 30, fontWeight: 700, color: tone, fontVariantNumeric: "tabular-nums" }}
      >
        {percent}%
      </Typography>
    </Stack>
  );
}

// ---------------------------------------------------------------------
// 3. Tutor chat. /dashboard/chatbot. The chips under the reply are what the
//    tutor is actually handed by BuildTutorPrompt (the student's level and
//    study units). They are not citations, because nothing in api/Modules/AI
//    can cite anything.
// ---------------------------------------------------------------------
export function TutorChatDepiction({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const bubble = scheme === "dark" ? "#1B1D22" : "#F1F2EF";

  return (
    <AdPanel scheme={scheme} url="aptiverse.co.za/dashboard/chatbot" badge="Calculus I">
      <Stack spacing="18px">
        <Stack direction="row" spacing="14px" justifyContent="flex-end" alignItems="flex-start">
          <Box
            sx={{
              maxWidth: "78%",
              px: "22px",
              py: "16px",
              borderRadius: "16px",
              bgcolor: t.palette.primary.main,
              color: t.palette.primary.contrastText,
              fontSize: 23,
              lineHeight: 1.35,
            }}
          >
            Explain the chain rule. I keep losing it in the tut questions.
          </Box>
          <Avatarish bg={CITRON} fg={GRAPHITE}>
            <User size={22} />
          </Avatarish>
        </Stack>

        <Stack direction="row" spacing="14px" alignItems="flex-start">
          <Avatarish bg={t.palette.primary.main} fg={t.palette.primary.contrastText}>
            <Sparkles size={22} />
          </Avatarish>
          <Box
            sx={{
              maxWidth: "84%",
              px: "22px",
              py: "16px",
              borderRadius: "16px",
              bgcolor: bubble,
              color: s.ink,
              fontSize: 23,
              lineHeight: 1.4,
            }}
          >
            The chain rule lets you differentiate a function inside another function. It is the key
            to related rates and optimisation, which is most of what your tuts test.
            <Stack direction="row" spacing="10px" sx={{ mt: "16px" }} flexWrap="wrap" useFlexGap>
              <AdChip scheme={scheme} icon={<BookOpen size={16} />}>
                Knows you take Calculus I
              </AdChip>
              <AdChip scheme={scheme}>Pitched at first year</AdChip>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </AdPanel>
  );
}

function Avatarish({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: "50%",
        bgcolor: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------
// 4. The courses a tertiary student created, with the current mark on each.
//    /dashboard/courses plus the per-unit signals. Nothing implies we hold a
//    prospectus or a module catalogue: the student adds these themselves.
// ---------------------------------------------------------------------
export function CourseListDepiction({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  // Six rows, because the unit that uses this says "six courses" and a
  // picture that contradicts its own headline is the kind of thing a reader
  // notices without being able to say why they stopped trusting it.
  const rows = [
    { name: "Linear Algebra", mark: 71, tone: t.palette.success.main },
    { name: "Chemistry I", mark: 69, tone: t.palette.primary.main },
    { name: "Physics I", mark: 64, tone: t.palette.primary.main },
    { name: "Academic Literacy", mark: 77, tone: t.palette.success.main },
    { name: "Calculus I", mark: 58, tone: t.palette.primary.main },
    { name: "Statistics 101", mark: 44, tone: t.palette.warning.main, flag: true },
  ];

  return (
    <AdPanel scheme={scheme} url="aptiverse.co.za/dashboard/courses" badge="Semester 2">
      <Stack spacing="20px">
        {rows.map((r) => (
          <Box key={r.name}>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing="16px">
              <Typography sx={{ fontSize: 30, fontWeight: 600, color: s.ink }} noWrap>
                {r.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: r.tone,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {r.mark}%
              </Typography>
            </Stack>
            <Box sx={{ mt: "10px" }}>
              <AdMeter value={r.mark} tone={r.tone} scheme={scheme} height={10} />
            </Box>
            {r.flag && (
              <Typography sx={{ fontSize: 20, color: t.palette.warning.main, mt: "8px", fontWeight: 600 }}>
                Weakest. Start here.
              </Typography>
            )}
          </Box>
        ))}
      </Stack>
    </AdPanel>
  );
}

// ---------------------------------------------------------------------
// 5. The parent dashboard. This is the whole of it: linked children, what is
//    due for each, and a privacy line that is enforced rather than described.
//    ParentLink is read in exactly one file (ParentLinksController.cs), so no
//    endpoint can hand a parent a mark, a mood, a diary entry or a goal, and
//    none of those appear here.
// ---------------------------------------------------------------------
export function ParentDepiction({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const children = [
    { name: "Thandi", meta: "Grade 11", due: "Life Sciences test", when: "Thu" },
    { name: "Kabelo", meta: "Grade 8", due: "History assignment", when: "Mon" },
  ];

  return (
    <AdPanel scheme={scheme} url="aptiverse.co.za/parent" badge="One bill">
      <Stack spacing="20px">
        {children.map((c) => (
          <Stack
            key={c.name}
            direction="row"
            spacing="18px"
            alignItems="center"
            sx={{ p: "20px", borderRadius: "14px", border: `2px solid ${s.hair}` }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: alpha(t.palette.primary.main, scheme === "dark" ? 0.3 : 0.12),
                color: s.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 25,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {c.name[0]}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: s.ink }}>{c.name}</Typography>
              <Typography sx={{ fontSize: 21, color: s.muted }}>{c.meta}</Typography>
            </Box>
            <Stack spacing="4px" alignItems="flex-end" sx={{ flexShrink: 0 }}>
              <Stack direction="row" spacing="8px" alignItems="center">
                <Box sx={{ display: "flex", color: s.muted }}>
                  <CalendarClock size={19} />
                </Box>
                <Typography sx={{ fontSize: 22, fontWeight: 600, color: s.ink }}>{c.due}</Typography>
              </Stack>
              <Typography sx={{ fontSize: 20, color: s.muted }}>Due {c.when}</Typography>
            </Stack>
          </Stack>
        ))}

        <Stack
          direction="row"
          spacing="16px"
          alignItems="center"
          sx={{
            p: "20px",
            borderRadius: "14px",
            bgcolor: alpha(t.palette.success.main, 0.12),
            border: `2px solid ${alpha(t.palette.success.main, 0.3)}`,
          }}
        >
          <Box sx={{ display: "flex", color: t.palette.success.main }}>
            <Lock size={24} />
          </Box>
          <Typography sx={{ fontSize: 22, color: s.ink, lineHeight: 1.35 }}>
            There is no screen and no endpoint that shows you the diary. It is not a setting you can
            turn on.
          </Typography>
        </Stack>
      </Stack>
    </AdPanel>
  );
}

// ---------------------------------------------------------------------
// 6. What a tutor keeps. Tutor Free lists a public profile at no cost and
//    CommissionPercent is null on every tutor plan in the catalogue seeder,
//    so the arithmetic below is the whole arrangement. Lessons are arranged
//    and paid off-platform, which is why nothing here shows a booking flow.
// ---------------------------------------------------------------------
export function TutorMathsDepiction({ scheme }: { scheme: AdScheme }) {
  const t = useTheme();
  const s = adSurfaces(scheme);
  const rows = [
    { label: "Your rate, per lesson", value: "R350", strong: false },
    { label: "Aptiverse's cut", value: "R0", strong: false },
  ];

  return (
    <AdPanel scheme={scheme} url="aptiverse.co.za/for-tutors" badge="Profile listing is free">
      <Stack spacing="18px">
        {rows.map((r) => (
          <Stack
            key={r.label}
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            spacing="16px"
          >
            <Typography sx={{ fontSize: 26, color: s.muted }}>{r.label}</Typography>
            <Typography
              sx={{ fontSize: 30, fontWeight: 700, color: s.ink, fontVariantNumeric: "tabular-nums" }}
            >
              {r.value}
            </Typography>
          </Stack>
        ))}
        <Box sx={{ height: 2, bgcolor: s.hair }} />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing="16px">
          <Typography sx={{ fontSize: 30, fontWeight: 700, color: s.ink }}>You keep</Typography>
          <Typography
            sx={{
              fontSize: 46,
              fontWeight: 700,
              color: t.palette.success.main,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            R350
          </Typography>
        </Stack>
        <Stack direction="row" spacing="12px" sx={{ pt: "6px" }} flexWrap="wrap" useFlexGap>
          <AdChip scheme={scheme} icon={<ShieldCheck size={16} />}>
            Qualifications up front
          </AdChip>
          <AdChip scheme={scheme}>You arrange the lesson</AdChip>
          <AdChip scheme={scheme}>Paid directly</AdChip>
        </Stack>
      </Stack>
    </AdPanel>
  );
}
