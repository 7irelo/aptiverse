"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { Wallet, Landmark, Search, Undo2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { StatusChip } from "@/components/common/StatusChip";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CardError } from "@/components/common/CardError";
import { usePermission } from "@/lib/hooks/usePermission";
import { formatDate } from "@/lib/format";
import {
  usePaystackStatus,
  usePaystackBalance,
  usePaystackTransactions,
  usePaystackSettlements,
  usePaystackCustomer,
  usePaystackRefund,
  type PaystackTransaction,
} from "@/lib/api/queries";

// Rand with cents. The shared formatCurrency rounds to whole rand, which is
// wrong for a payments ledger where the cents are the point.
function money(n: number, currency = "ZAR") {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

function statusKind(status: string | null): "success" | "warning" | "error" | "neutral" {
  switch (status) {
    case "success":
      return "success";
    case "failed":
      return "error";
    case "abandoned":
    case "reversed":
      return "warning";
    default:
      return "neutral";
  }
}

export default function PaystackPage() {
  const status = usePaystackStatus();
  const configured = status.data?.configured === true;

  return (
    <PermissionGuard require="payments.read">
      <PageHeader
        title="Paystack"
        description="The money, live from Paystack. Balance, payments, settlements and refunds without leaving Aptiverse."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Paystack" }]}
      />

      {status.isLoading ? null : !configured ? (
        <Alert severity="info" sx={{ mt: 1 }}>
          Paystack is not connected on this environment. Set PAYSTACK_SECRET_KEY to see the account
          here.
        </Alert>
      ) : (
        <Stack spacing={3} sx={{ mt: 1 }}>
          <BalanceRow />
          <TransactionsPanel />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <SettlementsPanel />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <CustomerLookup />
            </Grid>
          </Grid>
        </Stack>
      )}
    </PermissionGuard>
  );
}

function BalanceRow() {
  const balance = usePaystackBalance(true);
  if (balance.isError) return <CardError what="the balance" onRetry={() => balance.refetch()} />;

  const rows = balance.data ?? [];
  return (
    <Grid container spacing={2}>
      {(rows.length ? rows : [{ currency: "ZAR", available: 0, pending: 0 }]).map((b) => (
        <Grid key={b.currency} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Box sx={{ color: "primary.main", display: "flex" }}>
                  <Wallet size={18} />
                </Box>
                <Typography variant="overline" color="text.secondary">
                  Available balance ({b.currency})
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {balance.isLoading ? "…" : money(b.available, b.currency)}
              </Typography>
              {b.pending > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {money(b.pending, b.currency)} pending
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function TransactionsPanel() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const txns = usePaystackTransactions({ page, status: statusFilter || undefined });
  const { can } = usePermission();
  const mayRefund = can("payments.refund");
  const [target, setTarget] = useState<PaystackTransaction | null>(null);
  const refund = usePaystackRefund();

  const page1 = txns.data;
  const rows = page1?.rows ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Transactions
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              SelectProps={{ native: true }}
              sx={{ minWidth: 140 }}
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="abandoned">Abandoned</option>
            </TextField>
            <Tooltip title="Refresh">
              <Button
                size="small"
                variant="outlined"
                onClick={() => txns.refetch()}
                sx={{ minWidth: 0, px: 1 }}
              >
                <RefreshCw size={16} />
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {txns.isError ? (
          <CardError what="transactions" onRetry={() => txns.refetch()} />
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>When</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {txns.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        Loading…
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No transactions for this filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((t) => (
                    <TableRow key={t.reference} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {t.paidAt ? formatDate(t.paidAt, "DD MMM, HH:mm") : "—"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t.customerEmail ?? "—"}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{t.card ?? t.channel ?? "—"}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                        {money(t.amount, t.currency)}
                      </TableCell>
                      <TableCell>
                        <StatusChip kind={statusKind(t.status)} label={t.status ?? "unknown"} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        {mayRefund && t.refundable ? (
                          <Button
                            size="small"
                            color="warning"
                            startIcon={<Undo2 size={14} />}
                            onClick={() => setTarget(t)}
                          >
                            Refund
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        {page1 && page1.pageCount > 1 && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Page {page1.page} of {page1.pageCount} · {page1.total} total
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                size="small"
                disabled={page >= page1.pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          </Stack>
        )}
      </CardContent>

      <RefundDialog
        transaction={target}
        onClose={() => {
          setTarget(null);
          refund.reset();
        }}
        refund={refund}
      />
    </Card>
  );
}

function RefundDialog({
  transaction,
  onClose,
  refund,
}: {
  transaction: PaystackTransaction | null;
  onClose: () => void;
  refund: ReturnType<typeof usePaystackRefund>;
}) {
  if (!transaction) return null;
  return (
    <ConfirmDialog
      open={!!transaction}
      title="Refund this payment?"
      tone="danger"
      confirmLabel={refund.isPending ? "Refunding…" : "Refund in full"}
      loading={refund.isPending}
      description={
        <Stack spacing={1}>
          <Typography variant="body2">
            This sends {money(transaction.amount, transaction.currency)} back to{" "}
            {transaction.customerEmail ?? "the customer"}. It cannot be undone.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Reference {transaction.reference}
          </Typography>
          {refund.isError && (
            <Alert severity="error" sx={{ mt: 0.5 }}>
              {refund.error?.message ?? "Paystack rejected the refund."}
            </Alert>
          )}
        </Stack>
      }
      onConfirm={() =>
        refund.mutate(
          { reference: transaction.reference },
          { onSuccess: () => onClose() },
        )
      }
      onCancel={onClose}
    />
  );
}

function SettlementsPanel() {
  const settlements = usePaystackSettlements(true);
  const rows = settlements.data?.rows ?? [];

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ color: "primary.main", display: "flex" }}>
            <Landmark size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Settlements
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The payouts Paystack has made to your bank. This is what actually landed.
        </Typography>

        {settlements.isError ? (
          <CardError what="settlements" onRetry={() => settlements.refetch()} />
        ) : settlements.isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        ) : rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No settlements yet. In test mode Paystack does not settle, so this stays empty until you
            are live.
          </Typography>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Settled</TableCell>
                  <TableCell>Bank</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {s.settledAt ? formatDate(s.settledAt) : "—"}
                    </TableCell>
                    <TableCell>
                      {s.bankName ?? "—"}
                      {s.accountLast4 ? ` ···· ${s.accountLast4}` : ""}
                    </TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                      {money(s.amount, s.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusChip kind={statusKind(s.status)} label={s.status ?? "—"} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function CustomerLookup() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const customer = usePaystackCustomer(query, query.length > 0);

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ color: "primary.main", display: "flex" }}>
            <Search size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Find a customer
          </Typography>
        </Stack>

        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(input.trim());
          }}
        >
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Email or customer code"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" disabled={!input.trim()}>
              Look up
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 2 }}>
          {query.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Search by the email someone paid with, or their CUS_ code, to see their payment
              history.
            </Typography>
          ) : customer.isLoading ? (
            <Typography variant="body2" color="text.secondary">
              Looking up…
            </Typography>
          ) : customer.isError ? (
            <Alert severity="warning">Paystack has no customer for that.</Alert>
          ) : customer.data ? (
            <Stack spacing={1.5}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  {[customer.data.firstName, customer.data.lastName].filter(Boolean).join(" ") ||
                    customer.data.email ||
                    customer.data.customerCode}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {customer.data.email} · {customer.data.customerCode}
                </Typography>
              </Box>
              {customer.data.transactions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No transactions on record.
                </Typography>
              ) : (
                <Stack spacing={0.75}>
                  {customer.data.transactions.slice(0, 8).map((t) => (
                    <Stack
                      key={t.reference}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {t.paidAt ? formatDate(t.paidAt) : t.reference}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {money(t.amount, t.currency)}
                        </Typography>
                        <StatusChip kind={statusKind(t.status)} label={t.status ?? "—"} size="small" />
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}
