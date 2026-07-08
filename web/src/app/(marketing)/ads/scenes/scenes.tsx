"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonIcon from "@mui/icons-material/PersonOutline";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { motion, AnimatePresence } from "framer-motion";
import { MockAppFrame } from "@/components/marketing/FeatureShowcase";

// Shared timing helper — `useStaged([400, 800, 1200])` returns `[true, true, false]`
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
    // triggers is a stable literal at call site — fine to depend on length.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return flags;
}

// =====================================================================
// SCENE 1 — Curriculum-aware AI tutor (chat bubbles stage in)
// =====================================================================
export function TutorChatScene() {
  // 0.4s — user message slides in
  // 1.4s — AI typing dots appear
  // 2.8s — AI reply expands, code block lands
  // 4.0s — citation chip pops in (the moat reveal — hold)
  // 6.0s — "AI generating adaptive practice" trailing line
  const [userIn, dotsIn, replyIn, citationIn, adaptiveIn] = useStaged([400, 1400, 2800, 4000, 6000]);

  return (
    <Box sx={{ width: "100%", maxWidth: 520 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/chatbot" badge="Grade 11 Maths">
        <Stack spacing={2} sx={{ minHeight: 360 }}>
          <AnimatePresence>
            {userIn && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <UserBubble>Hey, can you explain the chain rule? I keep getting it wrong on my homework.</UserBubble>
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
                  Sure! The chain rule lets you differentiate a function inside another function. The NSC
                  syllabus introduces it in <strong>Grade 12 Differential Calculus</strong>.
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
                    {citationIn && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                      >
                        <Stack direction="row" spacing={0.75} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                          <Chip
                            icon={<MenuBookIcon sx={{ fontSize: 14 }} />}
                            label="Mind Action Series, p. 218"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.72rem" }}
                          />
                          <Chip
                            label="2020 NSC Paper 1 Q9"
                            size="small"
                            color="primary"
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
            {adaptiveIn && (
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
                  <Typography variant="caption" color="text.secondary">
                    AI is generating adaptive practice…
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
        <PersonIcon fontSize="small" />
      </Avatar>
    </Stack>
  );
}

function AiBubble({ children }: { children: React.ReactNode }) {
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
      <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
        <AutoAwesomeIcon sx={{ fontSize: 18, color: "primary.contrastText" }} />
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
// SCENE 2 — Mastery forecast (line draws, distinction chip lands)
// =====================================================================
export function MasteryForecastScene() {
  const [headerIn, lineIn, predictIn, chipIn, captionIn] = useStaged([300, 1000, 2200, 3600, 4800]);

  return (
    <Box sx={{ width: "100%", maxWidth: 600 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/mastery" badge="Maths · forecast 75%">
        <Stack spacing={2} sx={{ minHeight: 320 }}>
          <AnimatePresence>
            {headerIn && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Predicted matric mark
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <CountUp from={54} to={75} duration={2000} variant="h2" />
                      <Typography variant="h6" color="text.secondary">
                        %
                      </Typography>
                    </Stack>
                  </Box>
                  <AnimatePresence>
                    {chipIn && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45, ease: "backOut" }}
                      >
                        <Chip
                          label="Distinction track"
                          color="success"
                          sx={{ height: 26, fontWeight: 600 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SVG chart — line draws using strokeDashoffset, confidence band fades in */}
          <Box sx={{ height: 200, width: "100%" }}>
            <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
              {/* Gridlines */}
              <g stroke="rgba(0,0,0,0.08)" strokeWidth="1">
                {[50, 100, 150].map((y) => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} />
                ))}
              </g>
              {/* Confidence band */}
              {predictIn && (
                <motion.path
                  d="M 320,90 L 410,70 L 500,45 L 590,30 L 590,140 L 500,130 L 410,125 L 320,120 Z"
                  fill="rgba(63,157,149,0.18)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
              )}
              {/* Actual line (Feb-Jun, 54→68) */}
              {lineIn && (
                <motion.path
                  d="M 30,135 L 90,120 L 150,110 L 210,105 L 270,95 L 320,90"
                  fill="none"
                  stroke="#0F6963"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
              )}
              {/* Predicted line (Jun-Oct, 68→75) */}
              {predictIn && (
                <motion.path
                  d="M 320,90 L 410,75 L 500,65 L 590,55"
                  fill="none"
                  stroke="#3F9D95"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              )}
              {/* Dots */}
              {lineIn &&
                [
                  [30, 135],
                  [90, 120],
                  [150, 110],
                  [210, 105],
                  [270, 95],
                  [320, 90],
                ].map(([cx, cy], i) => (
                  <motion.circle
                    key={`a-${i}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#0F6963"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.12, duration: 0.2 }}
                  />
                ))}
              {predictIn &&
                [
                  [410, 75],
                  [500, 65],
                  [590, 55],
                ].map(([cx, cy], i) => (
                  <motion.circle
                    key={`p-${i}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#3F9D95"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + i * 0.15, duration: 0.2 }}
                  />
                ))}
            </svg>
          </Box>

          <AnimatePresence>
            {captionIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Stack direction="row" spacing={2}>
                  <LegendDot color="#0F6963" label="Actual" />
                  <LegendDot color="#3F9D95" label="Forecast" />
                  <LegendDot color="rgba(63,157,149,0.5)" label="Confidence" />
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </MockAppFrame>
    </Box>
  );
}

function CountUp({ from, to, duration, variant = "h3" }: { from: number; to: number; duration: number; variant?: "h2" | "h3" }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const elapsed = Math.min(1, (t - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, duration]);
  return (
    <Typography variant={variant} sx={{ fontWeight: 700, color: "primary.main", fontVariantNumeric: "tabular-nums" }}>
      {value}
    </Typography>
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

// =====================================================================
// SCENE 3 — SBA Coach (annotations bloom in sequentially)
// =====================================================================
export function SbaCoachScene() {
  // 0.3s text fades in
  // 1.3s — warning highlight fans across
  // 2.5s — info highlight
  // 3.7s — warn feedback row
  // 4.7s — info feedback row
  // 5.7s — good feedback row
  const [textIn, warnIn, infoIn, warnRow, infoRow, goodRow] = useStaged([300, 1300, 2500, 3700, 4700, 5700]);

  return (
    <Box sx={{ width: "100%", maxWidth: 560 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/sba/draft" badge="History · Source-based essay">
        <Stack spacing={2} sx={{ minHeight: 360 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            PARAGRAPH 2 / 5 — coverage: 64% · rubric match: 5/8 marks
          </Typography>

          <AnimatePresence>
            {textIn && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                  The Soweto Uprising of 1976 was a turning point in apartheid South Africa.{" "}
                  <HighlightSpan tone="warn" visible={warnIn}>
                    Many students protested in the streets.
                  </HighlightSpan>{" "}
                  Hector Pieterson, who was 13 years old, became the most famous victim of the day.{" "}
                  <HighlightSpan tone="info" visible={infoIn}>
                    The events showed the world how serious the situation was getting.
                  </HighlightSpan>{" "}
                  This led to international pressure on the apartheid government.
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          <Stack spacing={1.25} sx={{ pt: 1, borderTop: 1, borderColor: "divider" }}>
            <AnimatePresence>
              {warnRow && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <FeedbackRow
                    tone="warn"
                    tag="Specificity"
                    text='"Many students protested" — name the schools, the date, and the trigger (Afrikaans medium policy).'
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {infoRow && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <FeedbackRow
                    tone="info"
                    tag="Historical thinking"
                    text="Strong link to international response, but tie it to a specific event (e.g. UN arms embargo 1977)."
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {goodRow && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <FeedbackRow
                    tone="good"
                    tag="What's working"
                    text="Good chronology and use of a named individual — examiner will reward this."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Stack>
      </MockAppFrame>
    </Box>
  );
}

function HighlightSpan({
  children,
  tone,
  visible,
}: {
  children: React.ReactNode;
  tone: "warn" | "info" | "good";
  visible: boolean;
}) {
  const colour = tone === "warn" ? "warning.main" : tone === "info" ? "info.main" : "success.main";
  const bg =
    tone === "warn"
      ? "rgba(255,167,38,0.18)"
      : tone === "info"
        ? "rgba(41,182,246,0.18)"
        : "rgba(102,187,106,0.18)";
  return (
    <Box
      component="span"
      sx={{
        bgcolor: visible ? bg : "transparent",
        borderBottom: visible ? 2 : 0,
        borderBottomColor: colour,
        px: visible ? 0.5 : 0,
        borderRadius: 0.5,
        transition: "background-color 0.4s, border-bottom-width 0.4s, padding 0.4s",
      }}
    >
      {children}
    </Box>
  );
}

function FeedbackRow({ tone, tag, text }: { tone: "warn" | "info" | "good"; tag: string; text: string }) {
  const chipColor = tone === "warn" ? "warning" : tone === "info" ? "info" : "success";
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

// =====================================================================
// SCENE 4 — Past-paper walk-through (steps drop in with mark badges)
// =====================================================================
export function PastPaperScene() {
  // 0.3s question card
  // 1.3s, 2.3s, 3.3s, 4.3s steps drop in
  // 5.3s markscheme reference
  const [qIn, s1, s2, s3, s4, ref] = useStaged([300, 1300, 2300, 3300, 4300, 5500]);

  return (
    <Box sx={{ width: "100%", maxWidth: 640 }}>
      <MockAppFrame title="aptiverse.co.za/dashboard/past-papers" badge="NSC 2023 Paper 2 · Q4.2">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            minHeight: 360,
          }}
        >
          <AnimatePresence>
            {qIn && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <Stack
                  spacing={1.25}
                  sx={{ p: 2, borderRadius: 1.5, bgcolor: "action.hover", border: 1, borderColor: "divider" }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="overline" color="text.secondary">
                      Question
                    </Typography>
                    <Chip label="4 marks" size="small" sx={{ height: 20 }} />
                  </Stack>
                  <Typography variant="body2">
                    A car of mass <strong>1 200 kg</strong> travelling at <strong>20 m·s⁻¹</strong> brakes to a stop
                    over a distance of 25 m.
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    Calculate the magnitude of the average braking force, ignoring air resistance.
                  </Typography>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          <Stack spacing={1.5}>
            <Typography variant="overline" color="primary.main">
              Worked solution
            </Typography>
            {[
              { show: s1, n: 1, text: "Use Work–energy theorem: W_net = ΔK_E" },
              { show: s2, n: 2, text: "ΔK_E = ½ m v_f² − ½ m v_i² = 0 − ½ (1 200)(20)² = −240 000 J" },
              { show: s3, n: 3, text: "W_net = F·d·cos(180°) = −F·d → −F·(25) = −240 000" },
              { show: s4, n: 4, text: "∴ F = 9 600 N" },
            ].map(({ show, n, text }) => (
              <AnimatePresence key={n}>
                {show && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Step n={n} text={text} />
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
            <AnimatePresence>
              {ref && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: "backOut" }}>
                  <Chip
                    icon={<CheckIcon sx={{ fontSize: 14 }} />}
                    label="Markscheme reference: 2023 P2 Memo, pg. 14"
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ height: 22, fontSize: "0.7rem", alignSelf: "flex-start" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Stack>
        </Box>
      </MockAppFrame>
    </Box>
  );
}

function Step({ n, text }: { n: number; text: string }) {
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
      <Chip label="+1" size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: "0.65rem", flexShrink: 0 }} />
    </Stack>
  );
}

// =====================================================================
// SCENE 5 — End card (logo + URL + CTA)
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
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              A calmer matric. Genuinely.
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
            <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ px: 4, py: 1.25 }}>
              Book a demo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
}
