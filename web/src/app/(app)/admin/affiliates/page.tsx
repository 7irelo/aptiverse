"use client";

// Running the referral programme.
//
// The load-bearing action on this page is "generate the payout list": it turns
// everything that has cleared its 30-day hold into a list of names, amounts and
// bank accounts the founder works through in his banking app, and then records
// the reference he used against the ledger entries it settled. Nothing here
// moves money.

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import { AlertTriangle, Banknote, Download, Play, Users } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { StatCard } from "@/components/common/StatCard";
import {
  downloadCsv,
  useAdminAffiliateSummary,
  useAdminAffiliates,
  useAdminFlaggedReferrals,
  useAdminPayouts,
  useApproveAffiliate,
  useBlockReferral,
  useCancelPayout,
  useClearReferral,
  useGeneratePayoutRun,
  useMarkPayoutPaid,
  useRejectAffiliate,
  type AdminPayoutLine,
} from "@/lib/api/affiliates";

const rand = (n: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const dayMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

export default function AdminAffiliatesPage() {
  const [tab, setTab] = useState(0);

  return (
    <PermissionGuard require="payments.manage">
      <PageHeader
        title="Referral programme"
        description="What the programme owes, who is owed it, and the monthly payout list."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Referrals" }]}
      />

      <ProgrammeSummary />

      <Card sx={{ mt: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Payouts" />
          <Tab label="Payout details to review" />
          <Tab label="Flagged referrals" />
          <Tab label="All affiliates" />
        </Tabs>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {tab === 0 && <PayoutsTab />}
          {tab === 1 && <ReviewQueueTab />}
          {tab === 2 && <FlaggedTab />}
          {tab === 3 && <AllAffiliatesTab />}
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}

function ProgrammeSummary() {
  const query = useAdminAffiliateSummary();
  if (query.isLoading) return <Skeleton variant="rounded" height={120} />;
  if (!query.data) return null;
  const s = query.data;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="Ready to pay"
          value={rand(s.payableZar)}
          hint={`${rand(s.blockedOnDetailsZar)} waiting on bank details`}
          color="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="On hold" value={rand(s.onHoldZar)} hint="Inside the 30-day window" color="info" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard label="Paid to date" value={rand(s.paidZar)} color="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          label="Referrals"
          value={s.referralCount}
          hint={`${s.payingReferralCount} paying · ${s.flaggedReferrals} flagged`}
          color="secondary"
        />
      </Grid>
    </Grid>
  );
}

function PayoutsTab() {
  const [status, setStatus] = useState("draft");
  const query = useAdminPayouts(status);
  const generate = useGeneratePayoutRun();
  const { enqueueSnackbar } = useSnackbar();
  const [minimum, setMinimum] = useState("50");
  const [paying, setPaying] = useState<AdminPayoutLine | null>(null);

  const run = () => {
    generate.mutate(
      { minimumZar: Number(minimum) || 0 },
      {
        onSuccess: (r) => {
          setStatus("draft");
          enqueueSnackbar(
            r.payoutCount === 0
              ? "Nothing to pay this run."
              : `${r.payoutCount} payouts totalling ${rand(r.totalZar)}.` +
                  (r.skippedNoDetails > 0
                    ? ` ${r.skippedNoDetails} skipped for missing bank details.`
                    : ""),
            { variant: r.payoutCount === 0 ? "info" : "success" },
          );
        },
        onError: () => enqueueSnackbar("The payout run failed. Nothing was created.", { variant: "error" }),
      },
    );
  };

  const exportCsv = async () => {
    try {
      await downloadCsv(
        `/api/affiliates/admin/payouts/export?status=${status}`,
        `aptiverse-affiliate-payouts-${status}.csv`,
      );
    } catch {
      enqueueSnackbar("We could not build that file.", { variant: "error" });
    }
  };

  return (
    <Stack spacing={3}>
      <Alert severity="info">
        Generating a list creates payout records only. Aptiverse never moves money: you pay each
        line from your banking app, then come back and enter the reference you used.
      </Alert>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
        <TextField
          label="Minimum payout"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
          helperText="Balances below this roll to next month"
          sx={{ maxWidth: 200 }}
        />
        <Button
          variant="contained"
          startIcon={<Play size={16} />}
          onClick={run}
          disabled={generate.isPending}
        >
          {generate.isPending ? "Generating" : "Generate payout list"}
        </Button>
        <Box sx={{ flex: 1 }} />
        <TextField
          select
          label="Show"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          SelectProps={{ native: true }}
          sx={{ maxWidth: 160 }}
        >
          <option value="draft">To pay</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </TextField>
        <Button variant="outlined" startIcon={<Download size={16} />} onClick={() => void exportCsv()}>
          CSV
        </Button>
      </Stack>

      {query.isLoading && <Skeleton variant="rounded" height={140} />}
      {query.data?.length === 0 && (
        <EmptyState
          icon={<Banknote size={26} />}
          title={status === "draft" ? "Nothing waiting to be paid" : "Nothing here"}
          description={
            status === "draft"
              ? "Generate a list once commission has cleared its 30-day hold."
              : undefined
          }
          size="compact"
        />
      )}

      <Stack divider={<Divider />}>
        {(query.data ?? []).map((p) => (
          <Stack
            key={p.id}
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ py: 2 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }}>
                {p.payeeName || "Unnamed"} <Chip size="small" label={p.affiliateCode} sx={{ ml: 1 }} />
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {p.bankName} · {p.accountHolderName} · {p.accountNumber} · branch {p.branchCode}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.entryCount} entries to {dayMonth(p.periodEnd)}
                {p.paymentReference ? ` · Paid, reference ${p.paymentReference}` : ""}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography sx={{ fontWeight: 700, fontSize: "1.125rem" }}>{rand(p.amountZar)}</Typography>
              {p.status === "draft" && (
                <Button variant="contained" size="small" onClick={() => setPaying(p)}>
                  Mark paid
                </Button>
              )}
              {p.status === "paid" && <Chip size="small" color="success" label="Paid" />}
            </Stack>
          </Stack>
        ))}
      </Stack>

      <MarkPaidDialog payout={paying} onClose={() => setPaying(null)} />
    </Stack>
  );
}

function MarkPaidDialog({ payout, onClose }: { payout: AdminPayoutLine | null; onClose: () => void }) {
  const mark = useMarkPayoutPaid();
  const cancel = useCancelPayout();
  const { enqueueSnackbar } = useSnackbar();
  const [reference, setReference] = useState("");

  const confirm = () => {
    if (!payout) return;
    mark.mutate(
      { id: payout.id, paymentReference: reference.trim() },
      {
        onSuccess: () => {
          enqueueSnackbar("Payout recorded against that reference.", { variant: "success" });
          setReference("");
          onClose();
        },
        onError: () => enqueueSnackbar("Could not record that payout.", { variant: "error" }),
      },
    );
  };

  return (
    <Dialog open={!!payout} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record this payment</DialogTitle>
      <DialogContent>
        {payout && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Pay {rand(payout.amountZar)} to {payout.accountHolderName} at {payout.bankName},
              account {payout.accountNumber}, branch {payout.branchCode}. Then enter the reference
              you used, exactly as it will appear on your bank statement.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              required
              label="Your payment reference"
              placeholder={payout.suggestedReference}
              helperText={`Suggested: ${payout.suggestedReference}`}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          color="inherit"
          onClick={() => {
            if (!payout) return;
            cancel.mutate(
              { id: payout.id, notes: "Cancelled from the admin payout list." },
              { onSuccess: onClose },
            );
          }}
        >
          Cancel this payout
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button variant="contained" onClick={confirm} disabled={!reference.trim() || mark.isPending}>
          Mark paid
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ReviewQueueTab() {
  const query = useAdminAffiliates("submitted");
  const approve = useApproveAffiliate();
  const reject = useRejectAffiliate();
  const { enqueueSnackbar } = useSnackbar();

  if (query.isLoading) return <Skeleton variant="rounded" height={140} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        icon={<Users size={26} />}
        title="Nothing to review"
        description="Payout details land here when somebody submits them."
        size="compact"
      />
    );
  }

  return (
    <Stack divider={<Divider />}>
      {query.data.map((a) => (
        <Stack
          key={a.id}
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ py: 2 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600 }}>
              {a.displayName} <Chip size="small" label={a.referralCode} sx={{ ml: 1 }} />
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {a.email} · {a.referralCount} referrals · {rand(a.payableZar + a.onHoldZar)} earned so far
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Submitted {a.detailsSubmittedAt ? dayMonth(a.detailsSubmittedAt) : "recently"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              color="inherit"
              onClick={() =>
                reject.mutate(
                  { id: a.id, notes: "Details could not be verified." },
                  { onSuccess: () => enqueueSnackbar("Rejected.", { variant: "info" }) },
                )
              }
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() =>
                approve.mutate(
                  { id: a.id },
                  { onSuccess: () => enqueueSnackbar("Approved for payout.", { variant: "success" }) },
                )
              }
            >
              Approve
            </Button>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function FlaggedTab() {
  const query = useAdminFlaggedReferrals();
  const clear = useClearReferral();
  const block = useBlockReferral();
  const { enqueueSnackbar } = useSnackbar();

  if (query.isLoading) return <Skeleton variant="rounded" height={140} />;
  if (!query.data?.length) {
    return (
      <EmptyState
        icon={<AlertTriangle size={26} />}
        title="Nothing flagged"
        description="Referrals that look like self-referral land here rather than being paid or discarded silently."
        size="compact"
      />
    );
  }

  return (
    <Stack divider={<Divider />}>
      {query.data.map((r) => (
        <Stack key={r.id} spacing={1} sx={{ py: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                {r.affiliateName || r.affiliateCode} referred {r.referredName || r.referredEmail}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {r.flagReason} · signed up {dayMonth(r.signedUpAt)} · {rand(r.parkedZar)} parked
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                {r.signals.map((s, i) => (
                  <Chip key={i} size="small" variant="outlined" label={s.signalType.replace(/_/g, " ")} />
                ))}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="inherit"
                disabled={r.status === "blocked"}
                onClick={() =>
                  block.mutate(
                    { id: r.id, notes: "Blocked on review." },
                    { onSuccess: () => enqueueSnackbar("Blocked and reversed.", { variant: "info" }) },
                  )
                }
              >
                {r.status === "blocked" ? "Blocked" : "Block"}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() =>
                  clear.mutate(
                    { id: r.id, notes: "Cleared on review." },
                    { onSuccess: () => enqueueSnackbar("Cleared. Hold resumes.", { variant: "success" }) },
                  )
                }
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}

function AllAffiliatesTab() {
  const [search, setSearch] = useState("");
  const query = useAdminAffiliates("all", search);

  return (
    <Stack spacing={2}>
      <TextField
        label="Search by code"
        value={search}
        onChange={(e) => setSearch(e.target.value.toUpperCase())}
        sx={{ maxWidth: 280 }}
      />
      {query.isLoading && <Skeleton variant="rounded" height={140} />}
      <Stack divider={<Divider />}>
        {(query.data ?? []).map((a) => (
          <Stack
            key={a.id}
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 1.5 }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }} noWrap>
                {a.displayName || a.email} <Chip size="small" label={a.referralCode} sx={{ ml: 1 }} />
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {a.audience} · {a.referralCount} referrals · payout {a.payoutOnboardingStatus.replace(/_/g, " ")}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{rand(a.payableZar)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {rand(a.paidZar)} paid
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
