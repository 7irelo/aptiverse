"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import CreditCardIcon from "@mui/icons-material/CreditCardOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { formatCurrency, formatDate } from "@/lib/format";
import { usePlanCode } from "@/lib/hooks/useFeature";
import { useUsage } from "@/lib/hooks/useUsage";
import { usePlans, type PlanDto } from "@/lib/api/queries";
import { PLAN_LABELS, type PlanCode } from "@/lib/features";
import dayjs from "dayjs";

// Upgrade chain for student-track self-paying users. Family / tutor /
// school billing flows are handled on their own surfaces, so this map
// only needs to cover the path a student would actually take from the
// billing page.
const STUDENT_UPGRADE_PATH: Partial<Record<PlanCode, PlanCode>> = {
  free: "student",
  student: "student.pro",
  "student.pro": "student.max",
};

const INVOICES = Array.from({ length: 6 }).map((_, i) => ({
  id: `inv-${1000 + i}`,
  date: dayjs().subtract(i, "month").toISOString(),
  amount: 149,
  status: "paid" as const,
}));

export default function BillingPage() {
  const planCode = usePlanCode();
  const planName = PLAN_LABELS[planCode];
  const plans = usePlans();
  const usage = useUsage();
  const nextCharge = dayjs().add(14, "day").toISOString();

  // Look the user's current plan up in the live catalog. Falls back to a
  // loading shell until plans.data lands (rarely visible — staleTime is
  // 5 min, so post-first-load this is always populated).
  const currentPlan: PlanDto | undefined = plans.data?.find((p) => p.code === planCode);
  const upgradeTargetCode = STUDENT_UPGRADE_PATH[planCode];
  const upgradeTarget: PlanDto | undefined = upgradeTargetCode
    ? plans.data?.find((p) => p.code === upgradeTargetCode)
    : undefined;

  const isSchoolSponsored = planCode === "school";
  const isParentManaged = planCode.startsWith("family");
  const isTutor = planCode.startsWith("tutor");
  // "Free" here = no monthly subscription charge from the billing perspective
  // (Free tier + Tutor Free both fall under this). School is handled separately.
  const isFreeOrUnpaid = currentPlan?.kind === "free";

  const upgradeDelta =
    upgradeTarget && currentPlan
      ? (upgradeTarget.monthlyPriceZar ?? 0) - (currentPlan.monthlyPriceZar ?? 0)
      : 0;

  return (
    <>
      <PageHeader
        title="Billing"
        description="Your plan, monthly allowance, payment method and invoices."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Billing" }]}
      />

      {/* Banners for the three managed-elsewhere cases. */}
      {isSchoolSponsored && (
        <Card sx={{ mb: 3, bgcolor: "primary.main", color: "primary.contrastText" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>
              Sponsored by your school
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No payment needed — your school covers everything.
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              If you leave the school, your plan reverts to Free. Talk to your school admin to enable a personal plan instead.
            </Typography>
          </CardContent>
        </Card>
      )}

      {isParentManaged && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Family plan
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Your plan is managed by your parent or guardian.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Changes to payment method, plan tier and invoices live on your parent&apos;s account. You can still see your own monthly AI usage below.
            </Typography>
          </CardContent>
        </Card>
      )}

      {isTutor && (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary">
              Tutor account
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Your billing lives on the Earnings page.
            </Typography>
            <Button component={Link} href="/tutor/earnings" variant="contained" endIcon={<OpenInNewIcon />}>
              Go to Earnings
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* ============================================
            Current plan card
        ============================================ */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Chip
                label={planName}
                color={isFreeOrUnpaid ? "default" : "primary"}
                size="small"
                sx={{ mb: 1, fontWeight: 600 }}
              />
              <Stack direction="row" alignItems="baseline" spacing={1}>
                {plans.isLoading ? (
                  <Skeleton variant="text" width={110} height={56} />
                ) : (
                  <>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {isSchoolSponsored
                        ? "Sponsored"
                        : isFreeOrUnpaid
                          ? "R0"
                          : formatCurrency(currentPlan?.monthlyPriceZar ?? 0)}
                    </Typography>
                    {!isFreeOrUnpaid && !isSchoolSponsored && (
                      <Typography variant="body2" color="text.secondary">
                        / month
                      </Typography>
                    )}
                  </>
                )}
              </Stack>
              {plans.isLoading ? (
                <Skeleton variant="text" width="100%" sx={{ mt: 1.5, mb: 2.5 }} />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mb: 2.5 }}>
                  {currentPlan?.description ?? "—"}
                </Typography>
              )}

              {!isFreeOrUnpaid && !isSchoolSponsored && !isParentManaged && !isTutor && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                  Next charge {formatDate(nextCharge)}
                </Typography>
              )}

              {!isParentManaged && !isTutor && !isSchoolSponsored && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {upgradeTarget && (
                    <Button variant="contained" disabled>
                      Upgrade to {upgradeTarget.name}
                      {upgradeDelta > 0 ? ` (+${formatCurrency(upgradeDelta)})` : ""}
                    </Button>
                  )}
                  <Button component={Link} href="/pricing" variant="outlined">
                    Compare plans
                  </Button>
                </Stack>
              )}
              {!isFreeOrUnpaid && !isParentManaged && !isTutor && !isSchoolSponsored && (
                <>
                  <Divider sx={{ my: 2.5 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Cancel any time. Annual plans are pro-rated.
                  </Typography>
                  <Button variant="text" color="error" size="small" disabled>
                    Cancel subscription
                  </Button>
                </>
              )}
              {isFreeOrUnpaid && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Paid plans become available once paid billing is live. We&apos;ll email you when it is.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================
            This month's allowance / usage
        ============================================ */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    This month
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Monthly AI allowance
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Resets {formatDate(dayjs().endOf("month").toISOString())}
                </Typography>
              </Stack>

              <Stack spacing={2.25}>
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

              {upgradeTarget && (
                <Box
                  sx={{
                    mt: 3,
                    p: 1.75,
                    borderRadius: 1.5,
                    bgcolor: "action.hover",
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
                    <Typography variant="body2" color="text.secondary">
                      Hit a limit?{" "}
                      <strong>{upgradeTarget.name}</strong> bumps your allowance significantly.
                    </Typography>
                    <Button component={Link} href="/pricing" size="small" variant="outlined">
                      See what changes
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ============================================
            Payment method
        ============================================ */}
        {!isFreeOrUnpaid && !isParentManaged && !isTutor && !isSchoolSponsored && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  Payment method
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5, mb: 2 }}>
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
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Visa ending 4242
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires 09/28
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" disabled>
                    Update card
                  </Button>
                  <Button variant="text" size="small" disabled>
                    Add bank (EFT)
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* ============================================
            Invoices
        ============================================ */}
        {!isFreeOrUnpaid && !isParentManaged && !isTutor && !isSchoolSponsored && (
          <Grid size={{ xs: 12, md: 7 }}>
            <DataList
              title="Invoices"
              rows={INVOICES}
              rowKey={(r) => r.id}
              columns={[
                { key: "id", header: "Invoice" },
                { key: "date", header: "Date", render: (r) => formatDate(r.date) },
                { key: "amount", header: "Amount", align: "right", render: (r) => formatCurrency(r.amount) },
                { key: "status", header: "Status", render: () => <Chip label="Paid" size="small" color="success" /> },
              ]}
              rowActions={() => (
                <Button size="small" variant="outlined" disabled>
                  Download
                </Button>
              )}
              pageSize={5}
              searchable={false}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
}

// ============================================================
// QuotaBar — usage progress bar with smart colour cues.
// ============================================================
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
