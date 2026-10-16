"use client";

import { useParams } from "next/navigation";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { ArrowLeft, BookOpen, CalendarClock, Target } from "lucide-react";
import { QueryStates } from "@/components/common/QueryStates";
import { useTutorStudentContext, type TutorStudentContext } from "@/lib/api/queries";

export default function TutorStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const contextQuery = useTutorStudentContext(params.id);

  return (
    <>
      <Link
        component={NextLink}
        href="/tutor/connections"
        underline="none"
        color="text.secondary"
        sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 2, fontSize: "0.85rem" }}
      >
        <ArrowLeft size={16} />
        My students
      </Link>

      <QueryStates
        query={contextQuery}
        empty={{
          title: "Nothing to show yet",
          description: "This student has not set up their subjects or assessments.",
        }}
      >
        {(ctx) => <StudentContext ctx={ctx} />}
      </QueryStates>
    </>
  );
}

function StudentContext({ ctx }: { ctx: TutorStudentContext }) {
  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={(t) => {
          const dark = t.palette.mode === "dark";
          return {
            borderRadius: 3,
            p: { xs: 2.5, sm: 3.5 },
            color: "#F6F7F5",
            background: `radial-gradient(120% 140% at 100% 0%, ${alpha(t.palette.secondary.main, 0.22)} 0%, transparent 45%), linear-gradient(135deg, ${dark ? "#141519" : "#1B1D22"} 0%, ${dark ? "#1E2024" : "#26282E"} 100%)`,
          };
        }}
      >
        {ctx.subject && (
          <Typography
            variant="caption"
            sx={{ color: alpha("#F6F7F5", 0.7), fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            {ctx.subject}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
          {ctx.studentName}
        </Typography>
        <Typography variant="body2" sx={{ color: alpha("#F6F7F5", 0.8), mt: 0.5 }}>
          A read-only view they have shared with you, so you can walk in prepared.
        </Typography>
      </Paper>

      <Section icon={<BookOpen size={16} />} title="What they are studying">
        {ctx.units.length === 0 ? (
          <Empty>No subjects added yet.</Empty>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ rowGap: 1 }}>
            {ctx.units.map((u) => (
              <Chip
                key={u.name + u.detail}
                label={u.detail ? `${u.name} · ${u.detail}` : u.name}
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Section>

      <Section icon={<CalendarClock size={16} />} title="Coming up">
        {ctx.assessments.length === 0 ? (
          <Empty>Nothing scheduled right now.</Empty>
        ) : (
          <Stack divider={<Divider flexItem />}>
            {ctx.assessments.map((a, i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {a.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {a.subject} · <Box component="span" sx={{ textTransform: "capitalize" }}>{a.type}</Box>
                    {a.weight > 0 ? ` · ${a.weight}% weighting` : ""}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                    {dayjs(a.dueDate).format("D MMM")}
                  </Typography>
                  {a.predictedMark != null && (
                    <Typography variant="caption" color="text.secondary">
                      aiming {a.predictedMark}%
                    </Typography>
                  )}
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </Section>

      <Section icon={<Target size={16} />} title="Goals they are chasing">
        {ctx.goals.length === 0 ? (
          <Empty>No active goals.</Empty>
        ) : (
          <Stack spacing={2}>
            {ctx.goals.map((g, i) => (
              <Box key={i}>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {g.title}
                  </Typography>
                  {g.status === "at_risk" && <Chip label="At risk" size="small" color="warning" />}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {g.target} · due {dayjs(g.dueDate).format("D MMM")}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(0, Math.min(100, g.progress))}
                  color="secondary"
                  sx={{ mt: 0.75, height: 6, borderRadius: 999 }}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Section>
    </Stack>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, color: "text.secondary" }}>
        {icon}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
}
