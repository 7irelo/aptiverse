"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import {
  Flag,
  Flame,
  Trophy,
  Award,
  Check,
  ClipboardCheck,
  CalendarCheck,
  Brain,
  Zap,
  FileText,
  Hourglass,
  Gift,
} from "lucide-react";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { AtmosphericBackdrop } from "@/components/common/AtmosphericBackdrop";
import { RelativeTime } from "@/components/common/RelativeTime";
import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  useStudentPoints,
  usePointsLedger,
  useAchievements,
  useRewards,
  useActiveGrants,
  useRedeemReward,
} from "@/lib/api/queries";
import type { StudentPoints, Achievement, Reward, Grant, QuotaKey } from "@/lib/mockData";

// What each metered quota is called in a sentence a student would use, and the
// icon that stands for it. Keyed by the server's PlanQuota keys, which is the
// same key the usage meter enforces: if a key ever appears here that the meter
// does not know, the reward would be points for nothing, so the fallback stays
// deliberately plain rather than inventing a friendly name.
const QUOTA: Record<QuotaKey, { label: string; icon: React.ReactElement }> = {
  "ai.deep": { label: "Deep tutor sessions", icon: <Brain size={16} /> },
  "ai.quick": { label: "Quick questions", icon: <Zap size={16} /> },
  "practice.generate": { label: "Practice tests", icon: <FileText size={16} /> },
};

const quotaLabel = (key: QuotaKey) => QUOTA[key]?.label ?? key;
const quotaIcon = (key: QuotaKey) => QUOTA[key]?.icon ?? <Gift size={16} />;

export default function RewardsPage() {
  const pointsQuery = useStudentPoints();

  return (
    <AtmosphericBackdrop>
      <PageHeader
        title="Rewards"
        description="Points come from goals the system checked against your own practice. Spend them on more of what the platform can actually hand over: deeper tutor sessions, more questions, more practice."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Rewards" }]}
        actions={
          <Button
            component={Link}
            href="/dashboard/goals"
            variant="contained"
            color="secondary"
            startIcon={<Flag size={18} />}
          >
            Set a goal
          </Button>
        }
      />

      {/* Never empty: a student who has done nothing still gets a points object
          of zeros, and "Level 1, no points yet" is a truthful starting state
          worth rendering. An empty state here would just hide the ladder from
          the person who most needs to see it. */}
      <QueryStates
        query={pointsQuery}
        isEmpty={() => false}
        empty={{ title: "No points yet", description: "" }}
      >
        {(points) => (
          <Stack spacing={3}>
            <LevelCard points={points} />

            {/* Time-boxed and already paid for, so it outranks everything else
                on the page: a window the student cannot see is a window they
                will not use. */}
            <ActiveGrantsCard />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <RewardsCard balance={points.balance} />
              </Grid>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Stack spacing={3}>
                  <AchievementsCard />
                  <LedgerCard />
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}
      </QueryStates>
    </AtmosphericBackdrop>
  );
}

/**
 * Level, rank and the two streaks. The streaks sit here rather than on their
 * own card because they are the thing a student can move today, and a number
 * they can move belongs next to the number it moves.
 */
function LevelCard({ points }: { points: StudentPoints }) {
  const toNext = Math.max(0, points.pointsPerLevel - points.pointsIntoLevel);
  const pct = points.pointsPerLevel
    ? Math.round((points.pointsIntoLevel / points.pointsPerLevel) * 100)
    : 0;

  return (
    <Card
      sx={{
        bgcolor: (t) => alpha(t.palette.achievement.main, 0.1),
        borderColor: (t) => alpha(t.palette.achievement.main, 0.3),
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 3, md: 4 }}
          alignItems={{ md: "center" }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Level {points.level}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              {points.rank}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {points.balance.toLocaleString()} points to spend
              {points.totalEarned !== points.balance
                ? ` · ${points.totalEarned.toLocaleString()} earned all time`
                : ""}
            </Typography>

            <Box sx={{ mt: 2.5, maxWidth: 420 }}>
              <LinearProgress
                variant="determinate"
                value={pct}
                color="secondary"
                sx={{ height: 8, borderRadius: 999 }}
                aria-label={`${pct}% of the way to level ${points.level + 1}`}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
                {toNext === 0
                  ? `Level ${points.level + 1} unlocked on your next verified goal.`
                  : `${toNext.toLocaleString()} points to level ${points.level + 1}.`}
              </Typography>
            </Box>
          </Box>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", md: "block" }, borderColor: (t) => alpha(t.palette.achievement.main, 0.25) }}
          />

          <Stack
            direction="row"
            spacing={{ xs: 2, sm: 4 }}
            sx={{ flexShrink: 0 }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Counter
              icon={<Flame size={18} />}
              value={points.practiceStreakDays}
              label="Practice streak"
            />
            <Counter
              icon={<CalendarCheck size={18} />}
              value={points.checkinStreakDays}
              label="Check-in streak"
            />
            <Counter
              icon={<ClipboardCheck size={18} />}
              value={points.testsSubmitted}
              label="Tests done"
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Counter({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Box sx={{ textAlign: "center", minWidth: 76 }}>
      <Box sx={{ color: "text.secondary", mb: 0.25, display: "flex", justifyContent: "center" }}>
        {icon}
      </Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
    </Box>
  );
}

/**
 * Top-ups the student is holding right now.
 *
 * Rendered only when there is something live. An empty "no top-ups" card would
 * repeat what the catalogue directly below it already says, and the point of
 * this card is urgency: these expire.
 */
function ActiveGrantsCard() {
  const query = useActiveGrants();
  const grants = query.data;

  if (!grants || grants.length === 0) return null;

  return (
    <Card
      sx={{
        borderColor: (t) => alpha(t.palette.success.main, 0.35),
        bgcolor: (t) => alpha(t.palette.success.main, 0.06),
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Hourglass size={20} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Active right now
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {grants.map((g) => (
            <Grid key={g.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ActiveGrantRow grant={g} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

function ActiveGrantRow({ grant: g }: { grant: Grant }) {
  return (
    <Stack
      spacing={0.75}
      sx={{
        height: "100%",
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
        {quotaIcon(g.quotaKey)}
        <Typography variant="caption" noWrap>
          {quotaLabel(g.quotaKey)}
        </Typography>
      </Stack>

      <Typography sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        +{g.bonus} extra
      </Typography>

      <Typography variant="caption" color="text.secondary">
        Expires <RelativeTime iso={g.expiresAt} />
      </Typography>
    </Stack>
  );
}

/**
 * What points can buy.
 *
 * Everything here is a number the usage meter already enforces, raised for a
 * fixed window, so a redeemed reward is live the moment it is bought. That is
 * the whole reason the catalogue is shaped this way: the page it replaced sold
 * tutor hours and masterclasses that nobody could hand over.
 */
function RewardsCard({ balance }: { balance: number }) {
  const query = useRewards();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Gift size={20} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Spend your points
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
          >
            {balance.toLocaleString()} available
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Each one raises a limit on your plan for a set number of days. It goes live straight away.
        </Typography>

        <QueryStates
          query={query}
          empty={{
            icon: <Gift />,
            title: "Nothing to spend on yet",
            description: "The catalogue is unavailable right now. Try again shortly.",
          }}
        >
          {(rewards) => (
            <Stack spacing={1.5}>
              {rewards.map((r) => (
                <RewardRow key={r.code} reward={r} balance={balance} />
              ))}
            </Stack>
          )}
        </QueryStates>
      </CardContent>
    </Card>
  );
}

function RewardRow({ reward: r, balance }: { reward: Reward; balance: number }) {
  const redeem = useRedeemReward();
  const { enqueueSnackbar } = useSnackbar();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const short = Math.max(0, r.costPoints - balance);

  const handleRedeem = async () => {
    // Points are spent for good, so this asks first. The cost and the window
    // are both in the question because they are what the student is trading.
    const ok = await confirm({
      title: `Spend ${r.costPoints.toLocaleString()} points?`,
      description: `You get ${r.title.toLowerCase()} for ${r.days} days. Points are spent for good, and this window starts now.`,
      confirmLabel: "Redeem",
    });
    if (!ok) return;
    try {
      const grant = await redeem.mutateAsync(r.code);
      enqueueSnackbar(
        `Done. ${r.title} is live until ${new Date(grant.expiresAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        })}.`,
        { variant: "success" },
      );
    } catch (err) {
      enqueueSnackbar(
        `Couldn't redeem${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        alignItems={{ sm: "center" }}
        sx={{
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          opacity: r.affordable ? 1 : 0.72,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontWeight: 600 }}>{r.title}</Typography>
            <Chip
              size="small"
              variant="outlined"
              icon={quotaIcon(r.quotaKey)}
              label={quotaLabel(r.quotaKey)}
              sx={{ "& .MuiChip-icon": { ml: 0.75 } }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {r.description}
          </Typography>
        </Box>

        <Stack
          spacing={0.75}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          sx={{ flexShrink: 0 }}
        >
          <Typography
            sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}
          >
            {r.costPoints.toLocaleString()} pts
          </Typography>
          <Button
            size="small"
            variant={r.affordable ? "contained" : "outlined"}
            disabled={!r.affordable || redeem.isPending}
            onClick={handleRedeem}
          >
            {redeem.isPending ? "Redeeming…" : "Redeem"}
          </Button>
          {/* The gap, not just a locked button: "180 points short" is a number
              they can close, and it names the next verified goal as the way. */}
          {!r.affordable && (
            <Typography variant="caption" color="text.secondary">
              {short.toLocaleString()} points short
            </Typography>
          )}
        </Stack>
      </Stack>
      {confirmDialog}
    </>
  );
}

function AchievementsCard() {
  const query = useAchievements();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Trophy size={20} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Achievements
          </Typography>
        </Stack>

        <QueryStates
          query={query}
          empty={{
            icon: <Trophy />,
            title: "Nothing to show yet",
            description: "Achievements appear as you practise.",
          }}
        >
          {(achievements) => {
            const earned = achievements.filter((a) => a.earned);
            const inProgress = achievements.filter((a) => !a.earned);
            return (
              <Stack spacing={2.5}>
                {earned.length > 0 && (
                  <Stack spacing={1.5}>
                    {earned.map((a) => (
                      <AchievementRow key={a.code} achievement={a} />
                    ))}
                  </Stack>
                )}
                {earned.length > 0 && inProgress.length > 0 && <Divider />}
                {inProgress.length > 0 && (
                  <Stack spacing={1.5}>
                    {inProgress.map((a) => (
                      <AchievementRow key={a.code} achievement={a} />
                    ))}
                  </Stack>
                )}
              </Stack>
            );
          }}
        </QueryStates>
      </CardContent>
    </Card>
  );
}

function AchievementRow({ achievement: a }: { achievement: Achievement }) {
  const pct = a.target > 0 ? Math.round((a.progress / a.target) * 100) : 0;

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: (t) =>
            a.earned ? alpha(t.palette.achievement.main, 0.18) : alpha(t.palette.text.primary, 0.06),
          color: (t) => (a.earned ? t.palette.achievement.dark : t.palette.text.disabled),
        }}
      >
        {a.earned ? <Check size={18} /> : <Award size={18} />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {a.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
          {a.description}
        </Typography>
        {!a.earned && (
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ height: 4, borderRadius: 999, mt: 0.75, maxWidth: 220 }}
          />
        )}
      </Box>

      <Typography
        variant="caption"
        color={a.earned ? "text.secondary" : "text.disabled"}
        sx={{ flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
      >
        {a.earned ? "Earned" : `${a.progress} / ${a.target}`}
      </Typography>
    </Stack>
  );
}

function LedgerCard() {
  const query = usePointsLedger();

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Recent points
        </Typography>

        <QueryStates
          query={query}
          empty={{
            icon: <Trophy />,
            title: "No points yet",
            description: "Verify your first goal and it shows up here.",
          }}
        >
          {(entries) => (
            <Stack spacing={1.5}>
              {entries.slice(0, 8).map((e) => (
                <Stack
                  key={e.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {e.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      <RelativeTime iso={e.date} />
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                      color: e.points >= 0 ? "success.dark" : "text.secondary",
                    }}
                  >
                    {e.points >= 0 ? "+" : ""}
                    {e.points}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </QueryStates>
      </CardContent>
    </Card>
  );
}
