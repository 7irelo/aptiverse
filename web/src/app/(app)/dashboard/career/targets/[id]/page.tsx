"use client";

import { useMemo, useState } from "react";
import { use } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme, type Theme } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  Target as TargetIcon,
  Dumbbell,
  TriangleAlert,
  CalendarClock,
  BookMarked,
  Archive,
  ArchiveRestore,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CardError } from "@/components/common/CardError";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TargetDialog } from "@/components/career/TargetDialog";
import { ReachChip, requirementTone, targetTone, toneHex, type Tone } from "@/components/career/ReachChip";
import { heroGradient, riseSx } from "@/app/(app)/dashboard/study-groups/shared";
import {
  useAcademicUnits,
  useAcademicSignals,
  useAcademicProfile,
  useCurriculumSubjects,
  useTopicMastery,
  useGoals,
} from "@/lib/api/queries";
import {
  useAdmissionTarget,
  useDeleteAdmissionTarget,
  useUpdateAdmissionTarget,
  useGenerateTargetGoals,
  type GenerateGoalsResult,
} from "@/lib/api/targets";
import {
  reachFor,
  reachLabel,
  stageLabel,
  goalCandidates,
  type ReachInputs,
  type RequirementView,
  type TargetReach,
} from "@/lib/targets/reach";
import { formatDate } from "@/lib/format";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import type { Goal } from "@/lib/mockData";

// One plan, in full.
//
// The spine of the app runs through this page: aim, gap, drill, proof. A
// requirement the student researched (aim) is measured against marks we hold
// (gap), which points at the topics their own practice says are weakest
// (drill), which becomes a goal that verifies from work they cannot fake
// (proof). Every one of those four is a real artefact somewhere else in the
// product; this page is where they finally join up.

export default function TargetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const theme = useTheme();

  const targetQuery = useAdmissionTarget(id);
  const profile = useAcademicProfile();
  const academic = useAcademicUnits();
  const signals = useAcademicSignals();
  const goalsQuery = useGoals();
  const masteryQuery = useTopicMastery();

  const vocab = useStudyVocabulary();
  const isTertiary = profile.isSuccess && profile.data?.educationLevel === "tertiary";
  const catalog = useCurriculumSubjects(
    profile.isSuccess && !isTertiary ? profile.data?.curriculumId : null,
  );

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [result, setResult] = useState<GenerateGoalsResult | null>(null);

  const update = useUpdateAdmissionTarget();
  const remove = useDeleteAdmissionTarget();
  const generate = useGenerateTargetGoals();

  const inputs: ReachInputs = useMemo(
    () => ({ units: academic.units, signalsFor: signals.signalsFor, catalog: catalog.data ?? [] }),
    [academic.units, signals.signalsFor, catalog.data],
  );

  const target = targetQuery.data;
  const goals = goalsQuery.data ?? [];
  const reach = useMemo(
    () => (target ? reachFor(target, inputs) : null),
    [target, inputs],
  );

  const loading = targetQuery.isLoading || profile.isLoading || academic.isLoading;

  if (loading) {
    return (
      <AtmosphericBackdrop>
        <Skeleton variant="rounded" height={110} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={460} />
      </AtmosphericBackdrop>
    );
  }

  if (targetQuery.isError || !target || !reach) {
    return (
      <AtmosphericBackdrop>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <CardError onRetry={() => void targetQuery.refetch()} what="this plan" />
          </CardContent>
        </Card>
      </AtmosphericBackdrop>
    );
  }

  const candidates = goalCandidates(reach, goals);
  const archived = target.status === "archived";

  const runGenerate = () => {
    setResult(null);
    generate.mutate(
      {
        targetId: target.id,
        programme: target.programme,
        institution: target.institution,
        deadline: target.deadline,
        candidates: candidates.map((c) => ({
          requirementId: c.id,
          unitId: c.unitId,
          unitName: c.unitName,
          minimumPercent: c.minimumPercent,
        })),
      },
      { onSuccess: setResult },
    );
  };

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title={target.programme}
        description={`${target.institution}${target.kind === "progression" && target.stage ? ` · ${stageLabel(target.stage)}` : ""}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Career", href: "/dashboard/career" },
          { label: target.programme },
        ]}
        actions={
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              size="small"
              startIcon={archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              onClick={() =>
                update.mutate({ id: target.id, status: archived ? "active" : "archived" })
              }
            >
              {archived ? "Reopen" : "Archive"}
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<Trash2 size={15} />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <Stack spacing={3}>
        {archived && (
          <Alert severity="info" icon={<Archive size={18} />}>
            This plan is archived, so it stays off your sorted list. Any goals you generated from it
            are still running.
          </Alert>
        )}

        <SummaryCard reach={reach} unitNoun={academic.unitNoun} />

        {reach.blocked.length > 0 && (
          <BlockedCard blocked={reach.blocked} isTertiary={isTertiary} unitNoun={academic.unitNoun} />
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  alignItems={{ xs: "stretch", sm: "flex-start" }}
                  justifyContent="space-between"
                  sx={{ mb: 2.5 }}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Granular
                    </Typography>
                    <Typography variant="h6">
                      {vocab.UnitSingular} minimums
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: "60ch" }}>
                      What you entered, against what your marks say. The gap is the whole point:
                      it&apos;s a number you can actually do something about this week.
                    </Typography>
                  </Box>
                  {candidates.length > 0 && (
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                      startIcon={<TargetIcon size={15} />}
                      disabled={generate.isPending}
                      onClick={runGenerate}
                    >
                      {generate.isPending
                        ? "Setting up..."
                        : `Make ${candidates.length} goal${candidates.length === 1 ? "" : "s"}`}
                    </Button>
                  )}
                </Stack>

                {result && <GenerateResult result={result} onDismiss={() => setResult(null)} />}

                {target.requirements.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto", mb: 2 }}>
                      No {vocab.unitSingular}{" "}
                      minimums yet. An overall score tells you
                      nothing about what to do on a Tuesday. Add the mark each {vocab.unitSingular}{" "}
                      needs and this becomes a list of gaps you can close.
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Pencil size={15} />} onClick={() => setEditOpen(true)}>
                      Add minimums
                    </Button>
                  </Box>
                ) : (
                  <Stack divider={<Divider />} spacing={0}>
                    {reach.requirements.map((r, i) => (
                      <RequirementRow
                        key={r.id}
                        r={r}
                        index={i}
                        goal={goals.find((g) => g.id === r.goalId) ?? null}
                        mastery={masteryQuery.data ?? []}
                      />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              <OverallCard reach={reach} />
              <SourceCard target={target} />
            </Stack>
          </Grid>
        </Grid>
      </Stack>

      <TargetDialog open={editOpen} onClose={() => setEditOpen(false)} target={target} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this plan?"
        description="The plan and its requirements go. Any goals you generated from it stay, because the work you set out to do is still worth doing. You can remove those from the goals page."
        confirmLabel="Delete plan"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          remove.mutate(target.id, { onSuccess: () => router.push("/dashboard/career") });
        }}
      />
    </AtmosphericBackdrop>
  );
}

// ── summary ───────────────────────────────────────────────────────────

const INK = "#F6F7F5";

// Light-on-graphite tone colours for the gradient hero. The card toneHex leans
// on text.disabled for neutral and success.main for clear, both of which sink
// into the dark slab; here citron carries "on track", amber "short", a lighter
// red "blocked", so the same four states stay legible on the band.
function heroToneHex(t: Theme, tone: Tone): string {
  switch (tone) {
    case "success":
      return t.palette.secondary.main;
    case "warning":
      return t.palette.warning.main;
    case "error":
      return t.palette.error.light;
    default:
      return alpha(INK, 0.75);
  }
}

// The verdict band. PageHeader already carries the programme and institution, so
// this hero is free to lead with the one thing the student opened the page for:
// the reach status, in a word, next to the deadline pressure and a compact
// count of what is met versus what is not.
function SummaryCard({ reach, unitNoun }: { reach: TargetReach; unitNoun: string }) {
  const theme = useTheme();
  const tone = targetTone(reach.status);
  const hex = heroToneHex(theme, tone);
  const { target } = reach;

  const daysLeft = target.deadline
    ? Math.ceil((Number(new Date(target.deadline)) - Date.now()) / 86_400_000)
    : null;
  const nearNow = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

  const measured = reach.clearCount + reach.short.length;

  return (
    <Paper
      elevation={0}
      sx={(t) => ({
        ...heroGradient(t),
        borderRadius: 3,
        p: { xs: 2.5, sm: 3.5 },
        overflow: "hidden",
      })}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2.5, md: 4 }}
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{ color: alpha(INK, 0.6), letterSpacing: "0.1em", display: "block" }}
          >
            Reach
          </Typography>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
            <Box
              aria-hidden
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: hex,
                boxShadow: `0 0 0 4px ${alpha(hex, 0.2)}`,
                flexShrink: 0,
              }}
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: hex, lineHeight: 1.1 }}>
              {reachLabel(reach)}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: alpha(INK, 0.82), maxWidth: "60ch" }}>
            {summaryLine(reach, unitNoun)}
          </Typography>

          {daysLeft !== null && (
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                mt: 2,
                px: 1.25,
                py: 0.75,
                borderRadius: 1.5,
                width: "fit-content",
                bgcolor: nearNow ? alpha("#F5B851", 0.18) : alpha(INK, 0.1),
              }}
            >
              <Box sx={{ display: "flex", color: nearNow ? "#F5CE85" : alpha(INK, 0.8) }}>
                <CalendarClock size={14} />
              </Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: nearNow ? "#F5CE85" : alpha(INK, 0.85) }}
              >
                {daysLeft < 0
                  ? `Closed ${formatDate(target.deadline!)}`
                  : daysLeft === 0
                    ? "Closes today"
                    : `${daysLeft} day${daysLeft === 1 ? "" : "s"} to apply · ${formatDate(target.deadline!)}`}
              </Typography>
            </Stack>
          )}
        </Box>

        {measured > 0 && (
          <Stack
            direction="row"
            spacing={{ xs: 2.5, sm: 3.5 }}
            sx={{ flexShrink: 0, width: { xs: "100%", md: "auto" } }}
            justifyContent={{ xs: "space-between", md: "flex-end" }}
          >
            <HeroStat
              value={reach.clearCount}
              label={reach.clearCount === 1 ? "met" : "met"}
              tint={reach.clearCount > 0 ? (t) => t.palette.secondary.main : undefined}
            />
            <HeroStat
              value={reach.short.length}
              label="short"
              tint={reach.short.length > 0 ? (t) => t.palette.warning.main : undefined}
            />
            {reach.blocked.length > 0 && (
              <HeroStat
                value={reach.blocked.length}
                label={reach.blocked.length === 1 ? "blocked" : "blocked"}
                tint={(t) => t.palette.error.light}
              />
            )}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

function HeroStat({
  value,
  label,
  tint,
}: {
  value: number;
  label: string;
  tint?: (t: Theme) => string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.9rem",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          color: tint ?? INK,
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: alpha(INK, 0.7), whiteSpace: "nowrap" }}>
        {label}
      </Typography>
    </Box>
  );
}

function summaryLine(reach: TargetReach, unitNoun: string): string {
  switch (reach.status) {
    case "clear":
      return reach.unknownCount > 0
        ? `Everything measured is clear, but ${reach.unknownCount} still ${reach.unknownCount === 1 ? "has" : "have"} no marks. Log those and you'll know for certain.`
        : "Keep it there. Your marks currently meet every minimum you researched for this one.";
    case "short":
      return `Your biggest gap is ${reach.worstGap}. That's the number that decides this application, so it's the one to close first.`;
    case "blocked":
      return `This plan needs a ${unitNoun} you aren't taking. Marks can't fix that, so read the warning below before you plan around this one.`;
    case "unknown":
      return reach.requirements.length === 0
        ? `Nothing to measure yet. Add the mark each ${unitNoun} needs and this plan starts tracking itself.`
        : "No marks or practice on these yet. Log a graded mark or take a practice test and the gaps appear.";
    case "empty":
      return "Nothing entered yet. Add what this programme requires and we'll track it.";
  }
}

// ── blocked ───────────────────────────────────────────────────────────

function BlockedCard({
  blocked,
  isTertiary,
  unitNoun,
}: {
  blocked: RequirementView[];
  isTertiary: boolean;
  unitNoun: string;
}) {
  return (
    <Card variant="outlined" sx={{ borderColor: (t) => alpha(t.palette.error.main, 0.35), bgcolor: (t) => alpha(t.palette.error.main, 0.04) }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ color: "error.main", flexShrink: 0, pt: 0.25 }}>
            <TriangleAlert size={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
              {blocked.length === 1
                ? `A ${unitNoun} is missing`
                : `${blocked.length} ${unitNoun}s are missing`}
            </Typography>
            <Stack spacing={1} sx={{ mb: 1.5 }}>
              {blocked.map((b) => (
                <Typography key={b.id} variant="body2" color="text.secondary">
                  <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {b.unitName} at {b.minimumPercent}%
                  </Box>
                  {b.status === "substituted"
                    ? ` is required, and you're taking ${b.substituteName} instead. Those are different subjects, and most institutions won't accept one for the other.`
                    : ` is required, and it isn't on your ${unitNoun} list.`}
                </Typography>
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", maxWidth: "68ch" }}>
              We&apos;re not guessing at this: your plan asks for it and your enrolment doesn&apos;t
              list it.{" "}
              {isTertiary
                ? "If your enrolment has changed, update whichever half is out of date."
                : "If one of those is out of date, fix it. If both are right, this is worth a conversation at school now rather than in your final year."}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ── requirement rows: the gap to practice to goal chain ───────────────

function RequirementRow({
  r,
  index,
  goal,
  mastery,
}: {
  r: RequirementView;
  index: number;
  goal: Goal | null;
  mastery: { subjectId: string; topic: string; mastery: number }[];
}) {
  const theme = useTheme();
  const tone = requirementTone(r.status);
  const hex = toneHex(theme, tone);

  // Their own practice already knows which topics are costing them. Naming the
  // three weakest turns "find 12 marks in Maths" into something a student can
  // start on tonight, which is the difference between a plan and a wish.
  const weakest = mastery
    .filter((m) => m.subjectId === r.unitId)
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 3);

  return (
    <Box sx={{ py: 2, ...riseSx(index) }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {r.unitName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Needs {r.minimumPercent}%
            {r.standing !== null && (
              <>
                {" · you're at "}
                <Box component="span" sx={{ fontWeight: 700, color: hex }}>
                  {r.standing}%
                </Box>
                {r.standingSource === "practice" && " (practice)"}
                {r.standingSource === "what_if" && " (what-if)"}
              </>
            )}
            {r.status === "unknown" && " · no marks yet"}
          </Typography>
        </Box>
        <ReachChip
          tone={tone}
          label={
            r.status === "clear"
              ? "Clear"
              : r.status === "short"
                ? `${r.gap} to find`
                : r.status === "unknown"
                  ? "No marks"
                  : "Not taking it"
          }
        />
      </Stack>

      {r.standing !== null && (
        <Box sx={{ mt: 1.25, position: "relative" }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, r.standing)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
              "& .MuiLinearProgress-bar": { bgcolor: hex, borderRadius: 3 },
            }}
          />
          {/* The bar the student is aiming at, drawn where it actually sits. */}
          <Tooltip title={`Requirement: ${r.minimumPercent}%`}>
            <Box
              sx={{
                position: "absolute",
                top: -2,
                left: `${Math.min(100, r.minimumPercent)}%`,
                width: 2,
                height: 10,
                borderRadius: 1,
                bgcolor: "text.primary",
                opacity: 0.55,
              }}
            />
          </Tooltip>
        </Box>
      )}

      {r.status === "short" && (
        <Box sx={{ mt: 1.5 }}>
          {weakest.length > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Your practice says the weakest here {weakest.length === 1 ? "is" : "are"}:{" "}
              {weakest.map((w, i) => (
                <Box component="span" key={w.topic}>
                  <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                    {w.topic}
                  </Box>{" "}
                  ({w.mastery}%){i < weakest.length - 1 ? ", " : ""}
                </Box>
              ))}
            </Typography>
          )}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              component={Link}
              href={`/dashboard/practice?subject=${encodeURIComponent(r.unitId)}`}
              size="small"
              variant="outlined"
              startIcon={<Dumbbell size={14} />}
            >
              Practise this
            </Button>
            {goal && <GoalPill goal={goal} />}
          </Stack>
        </Box>
      )}

      {r.status === "clear" && goal && (
        <Box sx={{ mt: 1.5 }}>
          <GoalPill goal={goal} />
        </Box>
      )}
    </Box>
  );
}

function GoalPill({ goal }: { goal: Goal }) {
  const done = goal.status === "verified" || goal.status === "completed";
  return (
    <Button
      component={Link}
      href="/dashboard/goals"
      size="small"
      variant="text"
      startIcon={done ? <Check size={14} /> : <TargetIcon size={14} />}
      color={done ? "success" : "primary"}
    >
      {done ? "Goal verified" : `Goal ${Math.round(goal.progress)}%`}
    </Button>
  );
}

// The result of a generate run. The skipped list is the important half: a
// requirement the student has already outrun is good news and has to read like
// good news, not like a failure. The goals endpoint refuses a target at or
// below the student's baseline (rightly: there'd be nothing to prove), and that
// refusal must never surface as a red error about something that went well.
function GenerateResult({ result, onDismiss }: { result: GenerateGoalsResult; onDismiss: () => void }) {
  const { created, skipped, failed } = result;
  const severity = failed.length > 0 ? "warning" : "success";

  return (
    <Alert severity={severity} onClose={onDismiss} sx={{ mb: 2.5 }}>
      {created > 0 && (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {created} goal{created === 1 ? "" : "s"} set up. {created === 1 ? "It" : "They"} verify
          from your practice scores, so no self-reporting.
        </Typography>
      )}
      {created === 0 && skipped.length > 0 && failed.length === 0 && (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Nothing to set up, and that&apos;s the good outcome.
        </Typography>
      )}
      {skipped.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: created > 0 ? 0.75 : 0.25 }}>
          Skipped {skipped.map((s) => `${s.unitName} (${s.reason})`).join(", ")}. You&apos;re
          already past the bar there, so there&apos;s nothing to aim at.
        </Typography>
      )}
      {failed.length > 0 && (
        <Typography variant="body2" sx={{ mt: 0.75 }}>
          Couldn&apos;t set up {failed.map((f) => f.unitName).join(", ")}. Try again, or set those
          goals by hand.
        </Typography>
      )}
    </Alert>
  );
}

// ── overall + source ──────────────────────────────────────────────────

function OverallCard({ reach }: { reach: TargetReach }) {
  const theme = useTheme();
  const { unitNoun, unitNounPlural } = useAcademicUnits();
  const vocab = useStudyVocabulary();
  const UnitNounPlural = unitNounPlural.charAt(0).toUpperCase() + unitNounPlural.slice(1);
  const o = reach.overall;

  if (!o) {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Overall
          </Typography>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            No overall requirement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You didn&apos;t record an APS or an average for this one, which is fine: plenty of
            programmes gate on subject minimums alone.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (o.unit === "aps") {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary">
            Overall
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, fontVariantNumeric: "tabular-nums" }}>
            {o.required} APS
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {/* The most important thing this feature refuses to do. */}
            That&apos;s your researched target. We don&apos;t work out your APS: institutions score
            it on their own scales (different subject counts, different treatment of Life
            Orientation, some run a bespoke score entirely). A number we invented would be precise
            enough to plan around and wrong enough to cost you a place, so the tally stays with
            their table. Your subject minimums below are the part we can measure.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const hex =
    o.standing === null
      ? theme.palette.text.disabled
      : o.gap === null
        ? theme.palette.success.main
        : theme.palette.warning.main;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          Overall
        </Typography>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Needs a {o.required}% average
        </Typography>

        {o.standing === null ? (
          <Typography variant="body2" color="text.secondary">
            Nothing graded yet, so there&apos;s no average to compare. Log a mark and this fills in.
          </Typography>
        ) : (
          <>
            <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: hex, fontVariantNumeric: "tabular-nums" }}>
                {o.standing}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {o.gap === null ? "you're over the bar" : `${o.gap} short`}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, o.standing)}
              sx={{
                height: 6,
                borderRadius: 3,
                mb: 1.5,
                bgcolor: (t) => alpha(t.palette.text.primary, 0.08),
                "& .MuiLinearProgress-bar": { bgcolor: hex, borderRadius: 3 },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Your average across the {o.countedUnits} {unitNoun}{o.countedUnits === 1 ? "" : "s"} with
              graded marks. {UnitNounPlural} you&apos;ve only practised aren&apos;t counted: practice and a
              {" "}{vocab.periodSingular}{" "}
              mark aren&apos;t the same thing, and averaging them
              would give you a number that is neither.
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SourceCard({ target }: { target: { sourceNote?: string | null; createdAt: string } }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
          <Box sx={{ color: "text.secondary", display: "flex" }}>
            <BookMarked size={16} />
          </Box>
          <Typography variant="overline" color="text.secondary">
            Your source
          </Typography>
        </Stack>
        {target.sourceNote ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>
              {target.sourceNote}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recorded {formatDate(target.createdAt)}. Requirements change between intakes, so it is
              worth re-checking this against the current prospectus each year.
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            You didn&apos;t note where these requirements came from. Adding it (&quot;UCT prospectus
            2027, p.14&quot;) means you can re-check them next year without starting the research
            over.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
