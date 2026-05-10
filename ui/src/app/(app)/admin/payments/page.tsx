"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { formatCurrency, formatDate } from "@/lib/format";
import dayjs from "dayjs";

const PAYMENTS = Array.from({ length: 40 }).map((_, i) => ({
  id: `ch_${1000 + i}`,
  customer: ["Thandi M.", "Mokoena Family", "Greenside HS", "Sipho M. (tutor)"][i % 4],
  amount: [99, 199, 8500, 250][i % 4],
  status: i % 11 === 0 ? "failed" : i % 14 === 0 ? "refunded" : "paid",
  type: ["Subscription", "Subscription", "Subscription", "Course"][i % 4],
  date: dayjs().subtract(i, "hour").toISOString(),
}));

export default function AdminPaymentsPage() {
  return (
    <PermissionGuard require="payments.read">
      <PageHeader
        title="Payments & refunds"
        description="Stripe charges, webhooks, refunds. Issue refunds with two-person approval."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Payments" }]}
      />
      <DataList
        rows={PAYMENTS}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Charge ID", render: (r) => <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{r.id}</Typography> },
          { key: "customer", header: "Customer", sortable: true },
          { key: "type", header: "Type" },
          { key: "amount", header: "Amount", align: "right", sortable: true, render: (r) => formatCurrency(r.amount) },
          { key: "date", header: "Date", sortable: true, render: (r) => formatDate(r.date, "DD MMM HH:mm") },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Chip
                label={r.status}
                size="small"
                color={r.status === "paid" ? "success" : r.status === "failed" ? "error" : "warning"}
                sx={{ textTransform: "capitalize" }}
              />
            ),
          },
        ]}
        rowActions={(r) => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="outlined">
              Open
            </Button>
            {r.status === "paid" && (
              <PermissionGuard require="payments.refund" fallback={null}>
                <Button size="small" color="error">
                  Refund
                </Button>
              </PermissionGuard>
            )}
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
