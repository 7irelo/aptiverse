"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { formatCurrency, formatDate } from "@/lib/format";
import dayjs from "dayjs";

const INVOICES = Array.from({ length: 6 }).map((_, i) => ({
  id: `inv-${1000 + i}`,
  date: dayjs().subtract(i, "month").toISOString(),
  amount: 199,
  status: "paid",
}));

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Subscription, payment method, and invoice history."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Billing" }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Chip label="Family" color="primary" size="small" sx={{ mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(199)}/mo
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                2 children · Next charge {formatDate(dayjs().add(14, "day").toISOString())}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined">Update card</Button>
                <Button variant="outlined">Change plan</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
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
              <Button size="small" variant="outlined">
                Download
              </Button>
            )}
            pageSize={5}
            searchable={false}
          />
        </Grid>
      </Grid>
    </>
  );
}
