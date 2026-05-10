"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { BURSARIES } from "@/lib/mockData";
import { formatDate } from "@/lib/format";

export default function AdminBursariesPage() {
  return (
    <PermissionGuard require="bursaries.read">
      <PageHeader
        title="Bursaries"
        description="Curate the bursary list — fields, deadlines, requirements."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Bursaries" }]}
        actions={<Button variant="contained">New bursary</Button>}
      />
      <DataList
        rows={BURSARIES}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Name", sortable: true },
          { key: "field", header: "Field" },
          { key: "amount", header: "Award" },
          { key: "deadline", header: "Deadline", sortable: true, render: (r) => formatDate(r.deadline) },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Chip
                label={r.status === "open" ? "Open" : r.status === "closing_soon" ? "Closing soon" : "Closed"}
                size="small"
                color={r.status === "open" ? "success" : r.status === "closing_soon" ? "warning" : "default"}
              />
            ),
          },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="outlined">
              Edit
            </Button>
            <Button size="small" color="error" variant="outlined">
              Archive
            </Button>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
