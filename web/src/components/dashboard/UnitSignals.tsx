"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import { useAcademicSignals } from "@/lib/api/queries";

// Short, honest due label with an urgency tone. Past-due (still ungraded) reads
// as overdue; anything inside a week is warm; further out shows the date.
export function dueLabel(iso: string): { text: string; tone: "error" | "warning" | "muted" } {
  const days = dayjs(iso).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "error" };
  if (days === 0) return { text: "Due today", tone: "warning" };
  if (days === 1) return { text: "Due tomorrow", tone: "warning" };
  if (days <= 7) return { text: `Due in ${days} days`, tone: "warning" };
  return { text: dayjs(iso).format("D MMM"), tone: "muted" };
}

const TONE_COLOR: Record<string, string> = {
  error: "error.main",
  warning: "warning.main",
  muted: "text.secondary",
};

// Real academic signal for one unit (subject or course): term mark, projection,
// topic mastery, and the next assessment. Sourced entirely from
// useAcademicSignals, so nothing here is fabricated. Designed to be the body of
// a subject/course card.
export function UnitSignals({ unitId }: { unitId: string }) {
  const { signalsFor } = useAcademicSignals();
  const sig = signalsFor(unitId);

  const masteryColor =
    sig.mastery == null
      ? "primary"
      : sig.mastery.avg >= 70
        ? "success"
        : sig.mastery.avg >= 50
          ? "primary"
          : "warning";

  const due = sig.nextAssessment ? dueLabel(sig.nextAssessment.dueDate) : null;

  return (
    <Stack spacing={1.75} sx={{ flex: 1 }}>
      <Stack direction="row" spacing={4}>
        <Metric label="Term mark" value={sig.currentMark != null ? `${sig.currentMark}%` : "–"} />
        <Metric
          label="Projected"
          value={sig.predictedMark != null ? `${sig.predictedMark}%` : "–"}
          accent
        />
      </Stack>

      {sig.mastery ? (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Mastery · {sig.mastery.topics} {sig.mastery.topics === 1 ? "topic" : "topics"}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {sig.mastery.avg}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={sig.mastery.avg}
            color={masteryColor as "success" | "primary" | "warning"}
            sx={{ height: 6, borderRadius: 999 }}
          />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          Practise to start tracking topic mastery.
        </Typography>
      )}

      <Divider sx={{ mt: "auto" }} />

      {sig.nextAssessment && due ? (
        <Stack direction="row" spacing={1.5} justifyContent="space-between" alignItems="center">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              Next assessment
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {sig.nextAssessment.title}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, whiteSpace: "nowrap", color: TONE_COLOR[due.tone] }}
          >
            {due.text}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No assessment scheduled.
        </Typography>
      )}
    </Stack>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontWeight: 800, lineHeight: 1.1, color: accent ? "primary.main" : "text.primary" }}
      >
        {value}
      </Typography>
    </Box>
  );
}
