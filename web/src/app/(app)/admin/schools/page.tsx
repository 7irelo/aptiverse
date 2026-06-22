"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { formatCurrency } from "@/lib/format";

const SCHOOLS = Array.from({ length: 32 }).map((_, i) => ({
  id: `sch-${i}`,
  name: ["Crawford College Pretoria", "Greenside High School", "Rhodes High", "Eunice High School", "Pretoria High School for Girls", "Westerford High", "Hilton College", "Maritzburg College"][i % 8] + (i > 7 ? ` ${i + 1}` : ""),
  province: ["Gauteng", "Western Cape", "KZN", "Free State"][i % 4],
  learners: 200 + Math.round(Math.random() * 800),
  plan: ["School", "School Plus", "Pilot"][i % 3],
  mrr: 4500 + Math.round(Math.random() * 18000),
  active: true,
}));

export default function AdminSchoolsPage() {
  return (
    <PermissionGuard require="schools.read">
      <PageHeader
        title="Schools"
        description="School accounts, plans, and revenue."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Schools" }]}
        actions={<Button variant="contained">Onboard school</Button>}
      />
      <DataList
        rows={SCHOOLS}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "School", sortable: true, render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.name}</Typography> },
          { key: "province", header: "Province", sortable: true },
          { key: "learners", header: "Learners", sortable: true, align: "right" },
          { key: "plan", header: "Plan", render: (r) => <Chip label={r.plan} size="small" color={r.plan === "School Plus" ? "primary" : "default"} /> },
          { key: "mrr", header: "MRR", align: "right", sortable: true, render: (r) => formatCurrency(r.mrr) },
        ]}
        rowActions={() => (
          <Stack direction="row" spacing={0.75}>
            <Button size="small" variant="outlined">
              Open
            </Button>
            <Button size="small">Manage</Button>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
