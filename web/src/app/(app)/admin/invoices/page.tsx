"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { formatCurrency, formatDate } from "@/lib/format";
import dayjs from "dayjs";

const INVOICES = Array.from({ length: 25 }).map((_, i) => ({
  id: `INV-${5000 + i}`,
  customer: ["Greenside HS", "Mokoena Family", "Crawford Pretoria", "Hilton College"][i % 4],
  amount: [8500, 199, 12000, 18500][i % 4],
  status: i % 9 === 0 ? "overdue" : i % 12 === 0 ? "draft" : "paid",
  due: dayjs().add(7 - i, "day").toISOString(),
}));

export default function AdminInvoicesPage() {
  return (
    <PermissionGuard require="billing.read">
      <PageHeader
        title="Invoices"
        description="Generated invoices for school plans and one-off services."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Invoices" }]}
        actions={<Button variant="contained">New invoice</Button>}
      />
      <DataList
        rows={INVOICES}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Invoice", sortable: true },
          { key: "customer", header: "Customer", sortable: true },
          { key: "amount", header: "Amount", align: "right", sortable: true, render: (r) => formatCurrency(r.amount) },
          { key: "due", header: "Due", sortable: true, render: (r) => formatDate(r.due) },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Chip label={r.status} size="small" color={r.status === "paid" ? "success" : r.status === "overdue" ? "error" : "default"} sx={{ textTransform: "capitalize" }} />
            ),
          },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="outlined">
              Download
            </Button>
            <Button size="small">Send</Button>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
