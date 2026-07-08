"use client";

import { useMemo, useState } from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { alpha, useTheme } from "@mui/material/styles";
import Link from "next/link";
import { motion } from "framer-motion";
import { AptiverseLineChart as LineChart } from "@/components/common/AptiverseLineChart";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { CardError } from "@/components/common/CardError";
import { PageHeader } from "@/components/common/PageHeader";
import { useWellbeingSummary, useMoodTrend, useLogMood } from "@/lib/api/queries";
import { enter, enterStagger } from "@/lib/motion";
import type { MoodPoint, WellbeingSummary } from "@/lib/mockData";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovementOutlined";
import PsychologyIcon from "@mui/icons-material/PsychologyOutlined";
import EditNoteIcon from "@mui/icons-material/EditNoteOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";

const STRESS_COPY: Record<WellbeingSummary["stressSignal"], { label: string; hint: string }> = {
  none: { label: "No signal yet", hint: "Check in to start tracking" },
  low: { label: "Low", hint: "No alerts this week" },
  moderate: { label: "Moderate", hint: "Worth slowing down" },
  high: { label: "High", hint: "Take a break today" },
};

const MOOD_LABELS = ["Rough", "Low", "Okay", "Good", "Great"];

const hasCheckedIn = (s: WellbeingSummary | undefined): boolean =>
  !!s && (s.moodAvg7d > 0 || s.checkinStreakDays > 0);

export default function WellbeingPage() {
  const summaryQ = useWellbeingSummary();
  const trendQ = useMoodTrend(14);

  const summary = summaryQ.data;
  const populated = hasCheckedIn(summary);
  const loading = summaryQ.isLoading || trendQ.isLoading;
  const hardError = summaryQ.isError;

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [toast, setToast] = useState(false);

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Wellbeing"
        description="Daily check-ins, breathing tools, and people to talk to. Small habits, real signal."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Wellbeing" }]}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FavoriteBorderIcon />}
            onClick={() => setCheckInOpen(true)}
          >
            Check in
          </Button>
        }
      />

      {loading ? (
        <SummarySkeleton />
      ) : hardError ? (
        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <CardError
              what="your wellbeing history"
              onRetry={() => {
                void summaryQ.refetch();
                void trendQ.refetch();
              }}
            />
          </CardContent>
        </Card>
      ) : populated ? (
        <PopulatedSummary summary={summary!} trend={trendQ.data ?? []} />
      ) : (
        <FirstCheckIn onCheckIn={() => setCheckInOpen(true)} />
      )}

      <Box sx={{ mt: 4 }}>
        <QuickTools onCheckIn={() => setCheckInOpen(true)} />
      </Box>

      <MoodCheckInDialog
        open={checkInOpen}
        onClose={() => setCheckInOpen(false)}
        onLogged={() => {
          setCheckInOpen(false);
          setToast(true);
        }}
      />

      <Snackbar
        open={toast}
        autoHideDuration={4000}
        onClose={() => setToast(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast(false)}>
          Checked in. Thanks for showing up for yourself.
        </Alert>
      </Snackbar>
    </AtmosphericBackdrop>
  );
}

// ─── Check-in dialog (the real write path) ────────────────────────────

function MoodCheckInDialog({
  open,
  onClose,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  onLogged: () => void;
}) {
  const logMood = useLogMood();
  const [mood, setMood] = useState<number | null>(null);
  const [stress, setStress] = useState<string | null>(null);
  const [sleep, setSleep] = useState("");
  const [notes, setNotes] = useState("");

  function reset() {
    setMood(null);
    setStress(null);
    setSleep("");
    setNotes("");
    logMood.reset();
  }

  function handleClose() {
    if (logMood.isPending) return;
    reset();
    onClose();
  }

  function submit() {
    if (mood == null) return;
    const sleepHours = sleep.trim() === "" ? undefined : Number(sleep);
    logMood.mutate(
      {
        mood,
        stressLevel: stress ?? undefined,
        sleepHours: Number.isFinite(sleepHours) ? sleepHours : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onLogged();
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 600 }}>How are you today?</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ pt: 0.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Your mood right now
            </Typography>
            <Stack direction="row" spacing={1}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = mood === n;
                return (
                  <Box
                    key={n}
                    onClick={() => setMood(n)}
                    role="button"
                    aria-label={`Mood ${n}: ${MOOD_LABELS[n - 1]}`}
                    aria-pressed={active}
                    sx={{
                      flex: 1,
                      aspectRatio: "1",
                      borderRadius: 1.5,
                      border: 2,
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: 18,
                      fontVariantNumeric: "tabular-nums",
                      borderColor: active ? "wellbeing.main" : "divider",
                      color: active ? "wellbeing.main" : "text.secondary",
                      bgcolor: (t) => (active ? alpha(t.palette.wellbeing.main, 0.12) : "transparent"),
                      transition: "border-color 140ms ease, background-color 140ms ease",
                    }}
                  >
                    {n}
                  </Box>
                );
              })}
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Rough
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Great
              </Typography>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Stress level (optional)
            </Typography>
            <ToggleButtonGroup
              value={stress}
              exclusive
              size="small"
              onChange={(_, v) => setStress(v)}
              fullWidth
            >
              <ToggleButton value="low">Low</ToggleButton>
              <ToggleButton value="moderate">Moderate</ToggleButton>
              <ToggleButton value="high">High</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField
            label="Hours slept last night (optional)"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            type="number"
            size="small"
            inputProps={{ min: 0, max: 24, step: 0.5 }}
            fullWidth
          />

          <TextField
            label="Anything on your mind? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            maxRows={5}
            size="small"
            fullWidth
          />

          {logMood.isError && (
            <Alert severity="error">Couldn&apos;t save your check-in. Please try again.</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit" disabled={logMood.isPending}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={mood == null || logMood.isPending}
        >
          {logMood.isPending ? "Saving…" : "Log check-in"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Populated state ──────────────────────────────────────────────────

function PopulatedSummary({ summary, trend }: { summary: WellbeingSummary; trend: MoodPoint[] }) {
  const stress = STRESS_COPY[summary.stressSignal];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stat label="Mood (7-day avg)" value={summary.moodAvg7d.toFixed(1)} unit="/ 5" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stat label="Stress" value={stress.label} hint={stress.hint} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stat
            label="Sleep"
            value={summary.sleepHours > 0 ? formatHours(summary.sleepHours) : "—"}
            hint={summary.sleepHours > 0 ? "Average over 7 days" : "Log sleep on your check-in"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stat
            label="Check-in streak"
            value={`${summary.checkinStreakDays}`}
            unit={summary.checkinStreakDays === 1 ? "day" : "days"}
            hint={summary.checkinStreakDays >= 7 ? "Beautiful." : "Keep it going"}
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "baseline" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mood over the past 14 days
            </Typography>
            <Typography variant="caption" color="text.secondary">
              1 = rough · 5 = great
            </Typography>
          </Stack>

          {trend.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
              <Typography variant="body2">
                Your trend will appear here once you&apos;ve logged a few check-ins.
              </Typography>
            </Box>
          ) : (
            <MoodChart trend={trend} />
          )}
        </CardContent>
      </Card>
    </>
  );
}

function MoodChart({ trend }: { trend: MoodPoint[] }) {
  const theme = useTheme();
  const data = useMemo(
    () =>
      trend.map((p) => ({
        label: new Date(p.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        mood: p.mood,
      })),
    [trend],
  );

  return (
    <LineChart
      height={240}
      xAxis={[{ data: data.map((d) => d.label), scaleType: "point" }]}
      yAxis={[{ min: 1, max: 5 }]}
      series={[
        {
          data: data.map((d) => d.mood),
          label: "Mood",
          curve: "monotoneX",
          color: theme.palette.wellbeing.main,
          showMark: true,
        },
      ]}
      grid={{ horizontal: true }}
    />
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────

function Stat({ label, value, unit, hint }: { label: string; value: string; unit?: string; hint?: string }) {
  return (
    <motion.div {...enter} style={{ height: "100%" }}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            {label}
          </Typography>
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 0.5 }}>
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 600, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}
            >
              {value}
            </Typography>
            {unit && (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {unit}
              </Typography>
            )}
          </Stack>
          {hint && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {hint}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── First-check-in hero (no data yet) ────────────────────────────────

function FirstCheckIn({ onCheckIn }: { onCheckIn: () => void }) {
  return (
    <motion.div {...enter}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="overline" color="primary.main" sx={{ letterSpacing: "0.08em" }}>
                Start small
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 600, mt: 1, mb: 1.5, lineHeight: 1.2 }}
              >
                Thirty seconds to check in.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 460 }}>
                A daily mood log helps you (and the people who care about you) spot rough patches
                before they pile up. No streaks to chase yet — just one honest answer.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  onClick={onCheckIn}
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<FavoriteBorderIcon />}
                >
                  Start your first check-in
                </Button>
                <Button component={Link} href="/dashboard/psychologist" variant="text" size="large">
                  Or talk to someone
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <CheckInPreview />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CheckInPreview() {
  return (
    <Box
      role="img"
      aria-label="Mood check-in preview: a one to five scale from Rough to Great."
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: 3,
        bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
        How are you feeling today?
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="space-between">
        {[1, 2, 3, 4, 5].map((n) => (
          <Box
            key={n}
            aria-hidden
            sx={{
              flex: 1,
              aspectRatio: "1",
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
              display: "grid",
              placeItems: "center",
              fontWeight: 600,
              color: "text.secondary",
              fontSize: 18,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {n}
          </Box>
        ))}
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Rough
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Great
        </Typography>
      </Stack>
    </Box>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────

function SummarySkeleton() {
  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[0, 1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={42} sx={{ mt: 0.5 }} />
                <Skeleton variant="text" width="70%" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={240} />
        </CardContent>
      </Card>
    </>
  );
}

// ─── Quick tools ──────────────────────────────────────────────────────

const TOOLS = [
  {
    icon: <SelfImprovementIcon fontSize="small" />,
    title: "Box breathing",
    description: "Five minutes, slower heart, calmer head.",
    href: "/dashboard/diary?tool=breathing",
  },
  {
    icon: <EditNoteIcon fontSize="small" />,
    title: "Diary",
    description: "Write it out. A longer-form space than a check-in.",
    href: "/dashboard/diary",
  },
  {
    icon: <PsychologyIcon fontSize="small" />,
    title: "Talk to a psychologist",
    description: "Verified counsellors. Book a 30-minute session.",
    href: "/dashboard/psychologist",
  },
] as const;

function QuickTools({ onCheckIn }: { onCheckIn: () => void }) {
  return (
    <Stack spacing={2}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
        Quick tools
      </Typography>
      <Card>
        <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
          <motion.div {...enterStagger(0)}>
            <CardActionArea
              onClick={onCheckIn}
              sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderRadius: 0, display: "block" }}
            >
              <ToolRow
                icon={<FavoriteBorderIcon fontSize="small" />}
                title="Daily check-in"
                description="A 30-second mood log. The whole foundation."
              />
            </CardActionArea>
          </motion.div>
          {TOOLS.map((t, i) => (
            <motion.div key={t.title} {...enterStagger(i + 1)}>
              <CardActionArea
                component={Link}
                href={t.href}
                sx={{ px: { xs: 2, sm: 2.5 }, py: 2, borderRadius: 0, display: "block" }}
              >
                <ToolRow icon={t.icon} title={t.title} description={t.description} />
              </CardActionArea>
            </motion.div>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}

function ToolRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {description}
        </Typography>
      </Box>
      <ArrowForwardIcon sx={{ color: "text.secondary", fontSize: 18, flexShrink: 0 }} />
    </Stack>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatHours(h: number): string {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  return mins === 0 ? `${whole}h` : `${whole}h ${mins}m`;
}
