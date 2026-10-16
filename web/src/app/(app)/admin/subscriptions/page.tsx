"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { CreditCard } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { useAdminSubscriptions, usePlans, type AdminSubscription } from "@/lib/api/queries";
import { formatCurrency, formatDate } from "@/lib/format";

const LIVE = ["active", "trialing", "past_due"];

// Who is paying, on what plan, in what state.
//
// The previous version of this page generated thirty customers, an MRR chart
// with six invented months and a plan-mix pie, none of which touched the API.
// Everything here comes from entitlements.subscriptions joined to the plan
// catalogue.
//
// What is deliberately absent is a receipt-by-receipt ledger. Charges live at
// Paystack and there is no local transactions table, so this shows the billing
// state we genuinely hold: interval, last charge, next charge, saved card and
// consecutive renewal failures. The old /admin/payments and /admin/invoices
// pages, which fabricated charges and invoices, are gone rather than restated.
export default function SubscriptionsPage() {
  const [status, setStatus] = useState("");
  const query = useAdminSubscriptions({ status: status || undefined });
  const plans = usePlans();

  return (
    <PermissionGuard require="subscriptions.read">
      <PageHeader
        title="Subscriptions"
        description="Every subscription on the platform, with the plan behind it and the billing state we hold locally."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Subscriptions" }]}
      />

      <QueryStates
        query={query}
        isEmpty={(rows) => rows.length === 0 && !status}
        empty={{
          icon: <CreditCard />,
          title: "No subscriptions yet",
          description: "Every plan bought through checkout, or provisioned by an admin, appears here.",
        }}
      >
        {(rows) => (
          <SubscriptionsView
            rows={rows}
            status={status}
            onStatus={setStatus}
            priceByPlan={Object.fromEntries(
              (plans.data ?? []).map((p) => [
                p.code,
                { monthly: p.monthlyPriceZar, annual: p.annualPriceZar },
              ]),
            )}
          />
        )}
      </QueryStates>
    </PermissionGuard>
  );
}

type PriceMap = Record<string, { monthly: number | null; annual: number | null }>;

function SubscriptionsView({
  rows,
  status,
  onStatus,
  priceByPlan,
}: {
  rows: AdminSubscription[];
  status: string;
  onStatus: (v: string) => void;
  priceByPlan: PriceMap;
}) {
  // Monthly recurring revenue, at list price. Annual plans are divided by
  // twelve. No discounts, no proration, no churn modelling: this is the sum of
  // what the live subscriptions are meant to bill per month, and nothing more
  // is claimed for it.
  const stats = useMemo(() => {
    const live = rows.filter((r) => LIVE.includes(r.status));
    let mrr = 0;
    for (const r of live) {
      const p = priceByPlan[r.planCode];
      if (!p) continue;
      if (r.billing === "annual" && p.annual != null) mrr += p.annual / 12;
      else if (p.monthly != null) mrr += p.monthly;
    }
    return {
      live: live.length,
      pastDue: rows.filter((r) => r.status === "past_due").length,
      cancelled: rows.filter((r) => r.status === "cancelled").length,
      mrr,
    };
  }, [rows, priceByPlan]);

  const amountFor = (r: AdminSubscription): number | null => {
    const p = priceByPlan[r.planCode];
    if (!p) return null;
    return r.billing === "annual" ? p.annual ?? p.monthly : p.monthly;
  };

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Live" value={stats.live} hint="active, trialing or past due" />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="MRR at list price"
            value={formatCurrency(Math.round(stats.mrr))}
            hint="annual plans over 12"
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            label="Past due"
            value={stats.pastDue}
            hint={stats.pastDue > 0 ? "renewal failing" : "none"}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Cancelled" value={stats.cancelled} color="info" />
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 2 }}>
        Per-charge receipts are held by Paystack, not by Aptiverse. The billing state below is what
        this platform stores: interval, last charge, next charge, saved card and consecutive failed
        renewals.
      </Alert>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => onStatus(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {["active", "trialing", "past_due", "cancelled"].map((s) => (
            <MenuItem key={s} value={s}>
              {s.replace("_", " ")}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {rows.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            No subscriptions with that status
          </Typography>
        </Box>
      ) : (
        <DataList
          rows={rows}
          rowKey={(r) => r.id}
          searchPlaceholder="Search by customer or plan…"
          searchKeys={["ownerName", "ownerEmail", "planName", "planCode", "name"]}
          columns={[
            {
              key: "ownerName",
              header: "Customer",
              sortable: true,
              render: (r) => (
                <Stack sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {r.name || r.ownerName || "(unknown owner)"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {r.ownerEmail}
                  </Typography>
                </Stack>
              ),
            },
            {
              key: "planName",
              header: "Plan",
              sortable: true,
              render: (r) => (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Chip label={r.planName} size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {r.billing}
                  </Typography>
                </Stack>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (r) => {
                const amount = amountFor(r);
                return amount == null ? "Custom pricing" : formatCurrency(amount);
              },
            },
            {
              key: "lastChargeAt",
              header: "Last charge",
              hideOn: "sm",
              render: (r) => (r.lastChargeAt ? formatDate(r.lastChargeAt) : "Never charged"),
            },
            {
              key: "validUntil",
              header: "Next charge",
              hideOn: "sm",
              render: (r) =>
                r.status === "cancelled"
                  ? r.validUntil
                    ? `Access to ${formatDate(r.validUntil)}`
                    : "Not scheduled"
                  : r.validUntil
                    ? formatDate(r.validUntil)
                    : "Not scheduled",
            },
            {
              key: "card",
              header: "Card",
              hideOn: "md",
              render: (r) =>
                r.cardLast4 ? `${r.cardBrand ?? "card"} ····${r.cardLast4}` : "None on file",
            },
            {
              key: "status",
              header: "Status",
              render: (r) => (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    label={r.status.replace("_", " ")}
                    size="small"
                    color={
                      r.status === "active" || r.status === "trialing"
                        ? "success"
                        : r.status === "past_due"
                          ? "warning"
                          : "default"
                    }
                    sx={{ textTransform: "capitalize" }}
                  />
                  {r.renewalFailureCount > 0 && (
                    <Chip
                      size="small"
                      color="error"
                      label={`${r.renewalFailureCount} failed`}
                      sx={{ height: 20 }}
                    />
                  )}
                  {r.pendingPlanCode && (
                    <Chip size="small" label={`→ ${r.pendingPlanCode}`} sx={{ height: 20 }} />
                  )}
                </Stack>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
