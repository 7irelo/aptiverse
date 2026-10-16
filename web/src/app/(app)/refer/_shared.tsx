"use client";

// Shared pieces of the affiliate area. The page used to be one file with five
// tabs; it is now one layout plus five routes, and these are the components
// they share. Behaviour is unchanged — this is a move, not a rewrite.

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { Copy, Download, Share2, ShieldCheck, Users, Wallet } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import {
  downloadCsv,
  useAffiliateCommissions,
  useAffiliatePayouts,
  useAffiliateReferrals,
  useAffiliateTaxYears,
  type AffiliateSummary,
} from "@/lib/api/affiliates";

// Rand to the cent. The shared formatCurrency drops the decimals, which is fine
// for an MRR headline and wrong here: R25.80 a month is the number.
export const rand = (n: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

export const dayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

// The founder asked for "how much have I made" to be unmissable, so it is the
// first thing on the page at display size, and the four states the money can be
// in sit directly under it. Shown by the layout on every affiliate page.
export function EarningsHero({ data }: { data: AffiliateSummary }) {
  const { enqueueSnackbar } = useSnackbar();

  const copy = async (value: string, what: string) => {
    try {
      await navigator.clipboard.writeText(value);
      enqueueSnackbar(`${what} copied.`, { variant: "success" });
    } catch {
      enqueueSnackbar("Your browser would not let us copy that.", { variant: "warning" });
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Aptiverse",
          text: "I use Aptiverse to study. Have a look.",
          url: data.shareUrl,
        });
        return;
      } catch {
        // Cancelled, or unsupported in practice. Fall through to copying.
      }
    }
    void copy(data.shareUrl, "Your link");
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="overline" color="text.secondary">
              You have earned
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                fontSize: { xs: "2.75rem", sm: "3.25rem" },
              }}
            >
              {rand(data.lifetimeEarnedZar)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {data.referralsTotal === 0
                ? "Nobody has used your link yet."
                : `${data.referralsTotal} ${data.referralsTotal === 1 ? "person has" : "people have"} signed up on your link.`}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={(t) => ({
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(t.palette.secondary.main, t.palette.mode === "dark" ? 0.14 : 0.3),
              })}
            >
              <Typography variant="overline" color="text.secondary">
                Your link
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ mt: 0.5 }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "0.875rem",
                    wordBreak: "break-all",
                    color: "text.primary",
                  }}
                >
                  {data.shareUrl}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Copy link">
                    <IconButton
                      onClick={() => void copy(data.shareUrl, "Your link")}
                      aria-label="Copy your referral link"
                      size="small"
                    >
                      <Copy size={18} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    onClick={() => void share()}
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<Share2 size={16} />}
                  >
                    Share
                  </Button>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Code
                </Typography>
                <Chip
                  label={data.referralCode}
                  size="small"
                  onClick={() => void copy(data.referralCode, "Your code")}
                  sx={{ fontFamily: "ui-monospace, monospace", fontWeight: 700 }}
                />
              </Stack>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <MoneyTile
            label="On hold"
            value={data.onHoldZar}
            hint={
              data.nextHoldReleaseAt
                ? `First releases ${dayMonth(data.nextHoldReleaseAt)}`
                : `Clears after ${data.holdDays} days`
            }
          />
          <MoneyTile label="Ready to pay" value={data.payableZar} hint="In the next payout run" />
          <MoneyTile label="Paid to you" value={data.paidZar} hint="Already in your bank" />
          <MoneyTile
            label="Under review"
            value={data.pendingZar}
            hint={data.pendingZar > 0 ? "We are checking these" : "Nothing held back"}
          />
        </Grid>
      </CardContent>
    </Card>
  );
}

export function MoneyTile({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Grid size={{ xs: 6, md: 3 }}>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: "1.375rem", letterSpacing: "-0.02em" }}>
        {rand(value)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {hint}
      </Typography>
    </Grid>
  );
}

// The payout-onboarding banners. They used to point at the "Get paid" tab; that
// is a page now, so they link to it.
export function OnboardingAlerts({ data }: { data: AffiliateSummary }) {
  const getPaid = (
    <MuiLink component={Link} href="/refer/get-paid" sx={{ fontWeight: 700 }}>
      Get paid
    </MuiLink>
  );
  if (data.needsPayoutDetails && data.payoutOnboardingStatus === "not_started") {
    return (
      <Alert severity="info" icon={<Wallet size={18} />}>
        You have money waiting. Add your ID and bank details on {getPaid} so it can be paid out.
      </Alert>
    );
  }
  if (data.payoutOnboardingStatus === "submitted") {
    return (
      <Alert severity="info" icon={<ShieldCheck size={18} />}>
        Your payout details are with us for review. Earnings keep accruing in the meantime.
      </Alert>
    );
  }
  if (data.payoutOnboardingStatus === "rejected") {
    return (
      <Alert severity="warning">
        We could not verify your payout details.
        {data.reviewNotes ? ` ${data.reviewNotes}` : ""} Please correct them on {getPaid}. Nothing
        you have earned is lost.
      </Alert>
    );
  }
  return null;
}

const REFERRAL_LABEL: Record<string, string> = {
  signed: "Signed up",
  earning: "Earning",
  completed: "Complete",
  flagged: "Under review",
  blocked: "Not eligible",
};

export function ReferralsTab() {
  const query = useAffiliateReferrals();

  if (query.isLoading) return <Skeleton variant="rounded" height={180} />;
  if (query.isError) return <Alert severity="error">We could not load your referrals.</Alert>;
  if (!query.data?.length) {
    return (
      <EmptyState
        icon={<Users size={26} />}
        title="Nobody has used your link yet"
        description="Send it to a class group, a study group, or anyone who is looking for help with their work."
        size="compact"
      />
    );
  }

  return (
    <Stack divider={<Divider />} spacing={0}>
      {query.data.map((r) => (
        <Stack
          key={r.id}
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ py: 2 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontWeight: 600 }}>Signed up {dayMonth(r.signedUpAt)}</Typography>
              <Chip
                size="small"
                label={REFERRAL_LABEL[r.status] ?? r.status}
                color={r.status === "earning" || r.status === "completed" ? "success" : "default"}
                variant={r.status === "flagged" || r.status === "blocked" ? "outlined" : "filled"}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {r.firstPaymentAt
                ? `First payment ${dayMonth(r.firstPaymentAt)} · ${r.paymentsCommissioned} of 3 payments earned`
                : "Free account. You start earning the month they subscribe."}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.125rem" }}>{rand(r.earnedZar)}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

const COMMISSION_LABEL: Record<string, string> = {
  pending: "Under review",
  held: "On hold",
  payable: "Ready to pay",
  paid: "Paid",
  reversed: "Reversed",
};

export function CommissionsTab() {
  const query = useAffiliateCommissions();

  if (query.isLoading) return <Skeleton variant="rounded" height={180} />;
  if (query.isError) return <Alert severity="error">We could not load your earnings.</Alert>;
  if (!query.data?.length) {
    return (
      <EmptyState
        icon={<Wallet size={26} />}
        title="No earnings yet"
        description="You earn the month someone you referred pays for a subscription."
        size="compact"
      />
    );
  }

  return (
    <Stack divider={<Divider />}>
      {query.data.map((e) => (
        <Stack
          key={e.id}
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ py: 1.75 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }}>
              {e.entryType === "reversal" ? "Refund adjustment" : `Payment ${e.paymentNumber} of 3`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {dayMonth(e.occurredAt)}
              {e.entryType === "accrual" &&
                ` · ${e.commissionRatePercent}% of ${rand(e.sourcePaymentAmountZar)}`}
              {e.paymentReference ? ` · Bank ref ${e.paymentReference}` : ""}
            </Typography>
            {e.reason && (
              <Typography variant="caption" color="text.secondary">
                {e.reason}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: "right", flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 700, color: e.amountZar < 0 ? "error.main" : "text.primary" }}>
              {rand(e.amountZar)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {COMMISSION_LABEL[e.status] ?? e.status}
              {e.status === "held" && e.holdUntil ? ` until ${dayMonth(e.holdUntil)}` : ""}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export function PayoutsTab() {
  const query = useAffiliatePayouts();

  if (query.isLoading) return <Skeleton variant="rounded" height={140} />;
  if (query.isError) return <Alert severity="error">We could not load your payments.</Alert>;
  if (!query.data?.length) {
    return (
      <EmptyState
        icon={<Wallet size={26} />}
        title="No payments yet"
        description="Once your earnings clear their hold, they go out in the next payout run."
        size="compact"
      />
    );
  }

  return (
    <Stack divider={<Divider />}>
      {query.data.map((p) => (
        <Stack
          key={p.id}
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ py: 1.75 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600 }}>
              {p.paidAt ? dayMonth(p.paidAt) : "Being prepared"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {p.entryCount} {p.entryCount === 1 ? "entry" : "entries"}
              {p.paymentReference ? ` · Reference ${p.paymentReference}` : ""}
            </Typography>
          </Box>
          <Stack alignItems="flex-end">
            <Typography sx={{ fontWeight: 700 }}>{rand(p.totalZar)}</Typography>
            <Chip
              size="small"
              label={p.status === "paid" ? "Paid" : "Pending"}
              color={p.status === "paid" ? "success" : "default"}
            />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

export function TaxStatementTab() {
  const query = useAffiliateTaxYears();
  const { enqueueSnackbar } = useSnackbar();
  const [year, setYear] = useState<number | "">("");

  const years = query.data ?? [];
  const selected = useMemo(() => years.find((y) => y.taxYear === year) ?? years[0], [years, year]);

  const download = async () => {
    if (!selected) return;
    try {
      await downloadCsv(
        `/api/affiliates/me/statement?taxYear=${selected.taxYear}`,
        `aptiverse-affiliate-statement-${selected.label.replace("/", "-")}.csv`,
      );
    } catch {
      enqueueSnackbar("We could not build that statement. Please try again.", { variant: "error" });
    }
  };

  if (query.isLoading) return <Skeleton variant="rounded" height={140} />;

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        The South African tax year runs from 1 March to the end of February. Download a statement of
        what you earned and what was paid to you, so you can declare it.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "flex-end" }}>
        <TextField
          select
          label="Tax year"
          value={selected?.taxYear ?? ""}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 220 }}
        >
          {years.map((y) => (
            <MenuItem key={y.taxYear} value={y.taxYear}>
              {y.label} (1 Mar {y.taxYear} to end Feb {y.taxYear + 1})
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="contained"
          startIcon={<Download size={16} />}
          onClick={() => void download()}
          disabled={!selected}
        >
          Download statement
        </Button>
      </Stack>

      {selected && (
        <Grid container spacing={2}>
          <MoneyTile label="Paid to you" value={selected.paidZar} hint={`${selected.payoutCount} payments`} />
          <MoneyTile label="Earned" value={selected.accruedZar} hint="Commission recorded in the year" />
        </Grid>
      )}

      <Typography variant="caption" color="text.secondary">
        This is a record of your commission, not tax advice.
      </Typography>
    </Stack>
  );
}

export function HowItWorks({ data }: { data: AffiliateSummary }) {
  const items = [
    {
      title: `${data.commissionRatePercent}% of every payment`,
      body: `You earn ${data.commissionRatePercent}% of what someone you referred actually pays, for their first ${data.commissionablePayments} payments. On a R129 plan that is ${rand((129 * data.commissionRatePercent) / 100)} a month for ${data.commissionablePayments} months.`,
    },
    {
      title: data.attributionIsLifetime ? "Your link never expires" : "Your link has a window",
      body: data.attributionIsLifetime
        ? "Somebody can sign up free today and subscribe next year. You still earn, starting from their first payment."
        : "A referral counts for a limited period after they sign up.",
    },
    {
      title: `Paid out after ${data.holdDays} days`,
      body: `Earnings sit on hold for ${data.holdDays} days so refunds are settled before money moves. After that they go out in the next payout run.`,
    },
  ];

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          How it works
        </Typography>
        <Grid container spacing={3}>
          {items.map((i) => (
            <Grid key={i.title} size={{ xs: 12, md: 4 }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{i.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {i.body}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
