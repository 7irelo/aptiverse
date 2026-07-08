"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import CreditCardIcon from "@mui/icons-material/CreditCardOutlined";
import { Check, Minus } from "lucide-react";
import { DataList } from "@/components/data/DataList";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  useBillingSummary,
  useBillingTransactions,
  useCancelSubscription,
  useChangePlan,
  useCancelChange,
  usePlans,
  type PlanDto,
} from "@/lib/api/queries";
import { useUsage } from "@/lib/hooks/useUsage";
import { api } from "@/lib/api/client";

// Which paid tiers a track can move onto, cheapest first. Used to offer
// upgrade / resubscribe options to free or cancelled owners.
const TRACK_PLANS: Record<Track, string[]> = {
  student: ["student.pro", "student.max"],
  parent: ["parent", "parent.2", "parent.3", "parent.4"],
  tutor: ["tutor.pro", "tutor.premium"],
};

type Track = "student" | "parent" | "tutor";

export function BillingManager({
  track,
  showUsage = false,
}: {
  track: Track;
  showUsage?: boolean;
}) {
  const { data: session } = useSession();
  const summary = useBillingSummary();
  const transactions = useBillingTransactions();
  const plans = usePlans();
  const usage = useUsage(showUsage);
  const cancel = useCancelSubscription();
  const change = useChangePlan();
  const cancelChange = useCancelChange();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [changingTo, setChangingTo] = useState<string | null>(null);
  const [planChangeTarget, setPlanChangeTarget] = useState<PlanDto | null>(null);

  const email = (session?.user as { email?: string } | undefined)?.email ?? "";

  // Upgrade (target priced above current) redirects to Paystack; downgrade
  // is scheduled for period end and just refreshes the summary.
  const changePlan = async (planCode: string) => {
    setCheckoutErr(null);
    setChangingTo(planCode);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await change.mutateAsync({
        targetPlanCode: planCode,
        email,
        callbackUrl: `${origin}/welcome`,
      });
      if (res.mode === "checkout" && res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
        return;
      }
      setChangingTo(null);
    } catch (e) {
      setCheckoutErr((e as Error).message);
      setChangingTo(null);
    }
  };

  const startCheckout = async (planCode: string) => {
    setCheckoutErr(null);
    setCheckingOut(planCode);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { authorizationUrl } = await api.checkout({
        planCode,
        email,
        callbackUrl: `${origin}/welcome`,
      });
      window.location.href = authorizationUrl;
    } catch (e) {
      setCheckoutErr((e as Error).message);
      setCheckingOut(null);
    }
  };

  if (summary.isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: 220 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="text" width={90} height={28} />
              <Skeleton variant="text" width={140} height={52} />
              <Skeleton variant="text" width="100%" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: 220 }}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton variant="rectangular" height={140} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  const s = summary.data;

  // A child (or anyone) on someone else's plan: read-only.
  if (s?.managedByOther) {
    return (
      <>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary">
              {s.planName || "Plan"}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Your plan is managed by whoever pays for it.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Changes to the plan, payment method, and invoices live on the owner&apos;s account.
              {showUsage ? " You can still see your own monthly usage below." : ""}
            </Typography>
          </CardContent>
        </Card>
        {showUsage && <UsageCard usage={usage} />}
      </>
    );
  }

  const isFree = !s?.hasSubscription;
  const status = s?.status ?? "";
  const isActive = status === "active";
  const isCancelled = status === "cancelled";
  const isPastDue = status === "past_due";

  return (
    <>
      {checkoutErr && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setCheckoutErr(null)}>
          {checkoutErr}
        </Alert>
      )}
      {isPastDue && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your last payment did not go through. Update your card to keep your plan active.
        </Alert>
      )}
      {cancel.isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your subscription is cancelled. You keep access until the end of the paid period.
        </Alert>
      )}
      {s?.pendingPlanCode && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => cancelChange.mutate()}
              disabled={cancelChange.isPending}
            >
              {cancelChange.isPending ? "Undoing…" : "Undo"}
            </Button>
          }
        >
          Your plan switches to {s.pendingPlanName ?? s.pendingPlanCode}
          {s.changeEffectiveDate ? ` on ${formatDate(s.changeEffectiveDate)}` : " at the end of your billing period"}.
          You keep your current plan until then.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current plan — a graphite anchor that grounds the page instead of
            another flat white card. Stays dark with light text in both modes. */}
        <Grid size={{ xs: 12, md: showUsage ? 5 : 7 }}>
          <Card
            sx={{
              height: "100%",
              bgcolor: "brandSurface.main",
              color: "brandSurface.contrastText",
              border: "none",
            }}
          >
            <CardContent
              sx={{ p: { xs: 3, md: 3.5 }, height: "100%", display: "flex", flexDirection: "column" }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="overline" sx={{ opacity: 0.55, letterSpacing: "0.12em" }}>
                  Your plan
                </Typography>
                {!isFree && status && (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: isPastDue ? "#D07A62" : isCancelled ? "#9A9C98" : "#5BAD7E",
                      }}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      {isPastDue ? "Past due" : isCancelled ? "Ending" : "Active"}
                    </Typography>
                  </Stack>
                )}
              </Stack>

              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isFree ? "Free" : s?.planName}
              </Typography>

              <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 1.25 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, lineHeight: 1 }}>
                  {isFree ? "R0" : formatCurrency(s?.chargeAmountZar ?? s?.monthlyPriceZar ?? 0)}
                </Typography>
                {!isFree && (
                  <Typography variant="body2" sx={{ opacity: 0.55 }}>
                    / month
                  </Typography>
                )}
              </Stack>

              <Typography variant="body2" sx={{ mt: 2, opacity: 0.72, maxWidth: 320 }}>
                {isFree
                  ? "You are on the free plan. See what the paid plans add below."
                  : isCancelled
                    ? s?.nextChargeDate
                      ? `Access continues until ${formatDate(s.nextChargeDate)}.`
                      : "Your plan is ending."
                    : s?.nextChargeDate
                      ? `Renews on ${formatDate(s.nextChargeDate)}.`
                      : "Renews automatically."}
              </Typography>

              <Box sx={{ flexGrow: 1, minHeight: 12 }} />

              {(isActive || isPastDue) && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setConfirmOpen(true)}
                  disabled={!s?.canManage || cancel.isPending}
                  sx={{
                    mt: 3,
                    alignSelf: "flex-start",
                    color: "inherit",
                    opacity: 0.75,
                    px: 1,
                    ml: -1,
                    "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.07)" },
                  }}
                >
                  {cancel.isPending ? "Cancelling…" : "Cancel subscription"}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Usage (student) */}
        {showUsage && (
          <Grid size={{ xs: 12, md: 7 }}>
            <UsageCard usage={usage} />
          </Grid>
        )}

        {/* Plans — the reason to upgrade, built from real allowances. This is
            what turned the page from two bare buttons into a real comparison. */}
        <PlanComparison
          track={track}
          plans={plans.data ?? []}
          current={s?.planCode ?? "free"}
          currentPrice={s?.monthlyPriceZar ?? 0}
          busyCode={checkingOut ?? changingTo}
          pendingChange={Boolean(s?.pendingPlanCode)}
          onSelect={(p) => {
            if (isFree || isCancelled) startCheckout(p.code);
            else setPlanChangeTarget(p);
          }}
        />

        {/* Payment method */}
        {!isFree && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Payment method
                </Typography>
                {s?.cardLast4 ? (
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <CreditCardIcon sx={{ color: "text.secondary" }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
                        {s.cardBrand ?? "Card"} ending {s.cardLast4}
                      </Typography>
                      {s.cardExpMonth && s.cardExpYear && (
                        <Typography variant="caption" color="text.secondary">
                          Expires {String(s.cardExpMonth).padStart(2, "0")}/{String(s.cardExpYear).slice(-2)}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                    Your card is held securely by Paystack. It updates automatically at your next payment.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Invoices / payment history */}
        {!isFree && (
          <Grid size={{ xs: 12, md: showUsage ? 7 : 7 }}>
            <DataList
              title="Payment history"
              rows={transactions.data ?? []}
              rowKey={(r) => r.reference}
              loading={transactions.isLoading}
              emptyTitle="No payments yet"
              emptyDescription="Your first charge will appear here."
              columns={[
                { key: "reference", header: "Reference" },
                {
                  key: "paidAt",
                  header: "Date",
                  render: (r) => (r.paidAt ? formatDate(r.paidAt) : "—"),
                },
                {
                  key: "amountZar",
                  header: "Amount",
                  align: "right",
                  render: (r) => formatCurrency(r.amountZar),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (r) => (
                    <Chip
                      label={r.status === "success" ? "Paid" : r.status}
                      size="small"
                      color={r.status === "success" ? "success" : "default"}
                    />
                  ),
                },
              ]}
              pageSize={6}
              searchable={false}
            />
          </Grid>
        )}
      </Grid>

      {/* Plan-change confirmation — a guard rail before money moves or
          allowances drop. Upgrades go to checkout; downgrades are scheduled. */}
      {planChangeTarget &&
        (() => {
          const t = planChangeTarget;
          const isUpgrade = (t.monthlyPriceZar ?? 0) > (s?.monthlyPriceZar ?? 0);
          const limitOf = (key: string) =>
            t.quotas.find((x) => x.quotaKey === key)?.perMonth ?? 0;
          const fmtLimit = (n: number) => (n < 0 ? "unlimited" : n.toLocaleString());

          // On a downgrade, flag allowances the user has already blown past
          // this month — they'll be capped at the new, lower limit.
          const overs: string[] = [];
          if (!isUpgrade && usage.data) {
            const rows: [string, number, number][] = [
              ["practice tests", limitOf("practice.generate"), usage.data.practiceGenerate?.used ?? 0],
              ["quick AI replies", limitOf("ai.quick"), usage.data.aiQuick?.used ?? 0],
              ["deep AI sessions", limitOf("ai.deep"), usage.data.aiDeep?.used ?? 0],
            ];
            for (const [label, limit, used] of rows) {
              if (limit >= 0 && used > limit) overs.push(label);
            }
          }

          return (
            <Dialog open onClose={() => setPlanChangeTarget(null)} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ fontWeight: 700 }}>
                {isUpgrade ? `Upgrade to ${t.name}?` : `Switch to ${t.name}?`}
              </DialogTitle>
              <DialogContent>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    {isUpgrade
                      ? `You'll go to secure checkout and be charged ${formatCurrency(
                          t.monthlyPriceZar ?? 0,
                        )} per month. Your higher allowances apply as soon as payment succeeds.`
                      : `Your plan changes to ${t.name} (${formatCurrency(
                          t.monthlyPriceZar ?? 0,
                        )}/mo) at the end of your current billing period${
                          s?.nextChargeDate ? ` on ${formatDate(s.nextChargeDate)}` : ""
                        }. You keep your current plan and allowances until then.`}
                  </Typography>

                  {!isUpgrade && (
                    <Box
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                        p: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.75, fontWeight: 600 }}
                      >
                        New monthly allowances
                      </Typography>
                      <Stack spacing={0.5}>
                        {[
                          ["Practice tests", "practice.generate"],
                          ["Quick AI replies", "ai.quick"],
                          ["Deep AI sessions", "ai.deep"],
                        ].map(([label, key]) => (
                          <Stack key={key} direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              {label}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {fmtLimit(limitOf(key))}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {overs.length > 0 && (
                    <Alert severity="warning">
                      You&apos;ve already used more than {t.name} allows this month for{" "}
                      {overs.join(", ")}. You&apos;ll be capped there until next month&apos;s reset.
                    </Alert>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setPlanChangeTarget(null)} color="inherit">
                  Keep current plan
                </Button>
                <Button
                  variant="contained"
                  color={isUpgrade ? "primary" : "warning"}
                  onClick={() => {
                    const code = t.code;
                    setPlanChangeTarget(null);
                    void changePlan(code);
                  }}
                >
                  {isUpgrade ? "Continue to payment" : "Confirm downgrade"}
                </Button>
              </DialogActions>
            </Dialog>
          );
        })()}

      {/* Cancel confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel your subscription?</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="body2" color="text.secondary">
              Your plan stops renewing, but you keep full access until
              {s?.nextChargeDate ? ` ${formatDate(s.nextChargeDate)}` : " the end of the period you paid for"}.
              You can resubscribe any time.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Keep plan
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={cancel.isPending}
            onClick={() => {
              cancel.mutate(undefined, { onSettled: () => setConfirmOpen(false) });
            }}
          >
            {cancel.isPending ? "Cancelling…" : "Cancel subscription"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Allowances that differ across plans, in the order they matter to a student.
// These come straight from each plan's quota rows, so the comparison never
// invents a number.
const QUOTA_ROWS: { key: string; label: string }[] = [
  { key: "practice.generate", label: "Practice tests" },
  { key: "ai.quick", label: "Quick AI replies" },
  { key: "ai.deep", label: "Deep AI sessions" },
  { key: "whatsapp", label: "WhatsApp tutor" },
];

// Human one-liners per plan. The catalog descriptions carry slugs and em
// dashes; these stay on-brand. Falls back to a cleaned description for any
// plan not listed.
const PLAN_TAGLINE: Record<string, string> = {
  free: "Start here with the core tools, at no cost.",
  "student.pro": "The full toolkit: curriculum-aware tutor, adaptive practice, career navigator.",
  "student.max": "Built for matric: exam simulator, weekly AI debrief, WhatsApp tutor.",
  parent: "One child on Student Pro, plus the parent toolkit.",
  "parent.2": "Two children on Student Pro, shared AI pool, combo price.",
  "parent.3": "Three children on Student Pro, shared AI pool, combo price.",
  "parent.4": "Four children on Student Pro, shared AI pool, combo price.",
  "tutor.pro": "Lower marketplace commission and pro scheduling tools.",
  "tutor.premium": "The lowest commission, with premium visibility.",
};

const RECOMMENDED: Record<Track, string> = {
  student: "student.pro",
  parent: "parent.2",
  tutor: "tutor.pro",
};

const cleanCopy = (s: string | null) =>
  (s ?? "").replace(/\s*[—–]\s*/g, ": ").replace(/\s+-\s+/g, ", ").trim();

// The plan comparison. Free plus the track's paid tiers, side by side, with
// real allowances and a single recommended tier carrying the citron accent.
function PlanComparison({
  track,
  plans,
  current,
  currentPrice,
  busyCode,
  pendingChange,
  onSelect,
}: {
  track: Track;
  plans: PlanDto[];
  current: string;
  currentPrice: number;
  busyCode: string | null;
  pendingChange: boolean;
  onSelect: (p: PlanDto) => void;
}) {
  const codes = ["free", ...(TRACK_PLANS[track] ?? [])];
  const columns = codes
    .map((c) => plans.find((p) => p.code === c))
    .filter((p): p is PlanDto => Boolean(p));
  if (columns.length === 0) return null;

  const recommended = RECOMMENDED[track];

  return (
    <Grid size={12}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Plans
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {current === "free" ? "Choose your plan" : "Compare plans"}
        </Typography>
      </Box>
      <Grid container spacing={2} alignItems="stretch">
        {columns.map((p) => (
          <Grid key={p.code} size={{ xs: 12, sm: 6, md: 4 }}>
            <PlanCard
              plan={p}
              isCurrent={p.code === current}
              isRecommended={p.code === recommended && p.code !== current}
              isDowngrade={(p.monthlyPriceZar ?? 0) < currentPrice}
              busy={busyCode === p.code}
              disabled={pendingChange}
              onSelect={() => onSelect(p)}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

function PlanCard({
  plan,
  isCurrent,
  isRecommended,
  isDowngrade,
  busy,
  disabled,
  onSelect,
}: {
  plan: PlanDto;
  isCurrent: boolean;
  isRecommended: boolean;
  isDowngrade: boolean;
  busy: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const price = plan.monthlyPriceZar ?? 0;
  const isFreePlan = price === 0;
  const tagline = PLAN_TAGLINE[plan.code] ?? cleanCopy(plan.description);
  const limitOf = (key: string) => plan.quotas.find((q) => q.quotaKey === key)?.perMonth ?? 0;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "visible", // let the "Most popular" chip sit on the border
        position: "relative",
        borderColor: isRecommended ? "secondary.main" : "divider",
        borderWidth: isRecommended ? 2 : 1,
      }}
    >
      {isRecommended && (
        <Chip
          label="Most popular"
          size="small"
          sx={{
            position: "absolute",
            top: -11,
            left: 16,
            bgcolor: "secondary.main",
            color: "secondary.contrastText",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        />
      )}
      <CardContent
        sx={{ p: 2.5, display: "flex", flexDirection: "column", flexGrow: 1, "&:last-child": { pb: 2.5 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {plan.name}
          </Typography>
          {isCurrent && (
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
              Current
            </Typography>
          )}
        </Stack>

        <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mt: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isFreePlan ? "R0" : formatCurrency(price)}
          </Typography>
          {!isFreePlan && (
            <Typography variant="caption" color="text.secondary">
              / month
            </Typography>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, minHeight: { sm: 60 } }}>
          {tagline}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
          {QUOTA_ROWS.map((row) => {
            const lim = limitOf(row.key);
            const included = lim !== 0;
            const value = lim < 0 ? "Unlimited" : `${lim.toLocaleString()} / mo`;
            return (
              <Stack key={row.key} direction="row" spacing={1} alignItems="center">
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    color: included ? "success.main" : "text.disabled",
                    flexShrink: 0,
                  }}
                >
                  {included ? <Check size={16} strokeWidth={2.5} /> : <Minus size={16} strokeWidth={2.5} />}
                </Box>
                <Typography
                  variant="body2"
                  sx={{ flexGrow: 1, color: included ? "text.primary" : "text.disabled" }}
                >
                  {row.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: included ? "text.secondary" : "text.disabled" }}
                >
                  {included ? value : "—"}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        <Box sx={{ mt: 2.5 }}>
          {isCurrent ? (
            <Button fullWidth variant="outlined" disabled>
              Your plan
            </Button>
          ) : isFreePlan ? (
            <Button fullWidth variant="text" disabled sx={{ color: "text.disabled" }}>
              Included baseline
            </Button>
          ) : (
            <Button
              fullWidth
              variant={isRecommended ? "contained" : "outlined"}
              onClick={onSelect}
              disabled={busy || disabled}
            >
              {busy ? "Working…" : isDowngrade ? "Switch to this" : "Upgrade"}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// Monthly AI allowance card, reused for owners and members-with-usage.
function UsageCard({ usage }: { usage: ReturnType<typeof useUsage> }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="overline" color="text.secondary">
          This month
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
          Monthly AI allowance
        </Typography>
        <Stack spacing={2}>
          <QuotaBar
            label="Practice tests generated"
            used={usage.data?.practiceGenerate?.used ?? 0}
            total={usage.data?.practiceGenerate?.limit ?? 0}
            loading={usage.isLoading}
            hint="AI-written practice tests aimed at your weak topics."
          />
          <QuotaBar
            label="Quick AI replies"
            used={usage.data?.aiQuick.used ?? 0}
            total={usage.data?.aiQuick.limit ?? 0}
            loading={usage.isLoading}
            hint="Short answers, recall, formulas, help-bot queries."
          />
          <QuotaBar
            label="Deep AI sessions"
            used={usage.data?.aiDeep.used ?? 0}
            total={usage.data?.aiDeep.limit ?? 0}
            loading={usage.isLoading}
            hint="Long walk-throughs, essay marking, weekly debrief."
          />
          <QuotaBar
            label="WhatsApp messages"
            used={usage.data?.whatsapp.used ?? 0}
            total={usage.data?.whatsapp.limit ?? 0}
            loading={usage.isLoading}
            hint="Outbound messages from the WhatsApp tutor."
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuotaBar({
  label,
  used,
  total,
  hint,
  loading,
}: {
  label: string;
  used: number;
  total: number;
  hint: string;
  loading?: boolean;
}) {
  const isUnlimited = total < 0;
  const isZero = total === 0 && !loading;
  const pct = isUnlimited || isZero ? 0 : Math.min(100, Math.round((used / total) * 100));
  const color = pct >= 95 ? "error" : pct >= 75 ? "warning" : "primary";

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {loading
            ? "Loading…"
            : isUnlimited
              ? `${used.toLocaleString()} used · unlimited`
              : isZero
                ? "Not included on this plan"
                : `${used.toLocaleString()} / ${total.toLocaleString()}`}
        </Typography>
      </Stack>
      <LinearProgress
        variant={loading ? "indeterminate" : "determinate"}
        value={isUnlimited ? 35 : pct}
        color={isUnlimited ? "primary" : color}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "action.hover",
          opacity: isZero ? 0.4 : 1,
          "& .MuiLinearProgress-bar": { borderRadius: 4 },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
        {hint}
      </Typography>
    </Box>
  );
}
