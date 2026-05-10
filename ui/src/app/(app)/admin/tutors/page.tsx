"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { TUTORS } from "@/lib/mockData";
import { initials, formatCurrency } from "@/lib/format";
import VerifiedIcon from "@mui/icons-material/Verified";

export default function AdminTutorsPage() {
  return (
    <PermissionGuard require="tutors.read">
      <PageHeader
        title="Tutors"
        description="Verify, edit, suspend and review tutors on the marketplace."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Tutors" }]}
      />
      <DataList
        rows={TUTORS}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "name",
            header: "Tutor",
            sortable: true,
            render: (r) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: r.avatarColor }}>{initials(r.name)}</Avatar>
                <Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {r.name}
                    </Typography>
                    {r.verified && <VerifiedIcon sx={{ color: "primary.main", fontSize: 14 }} />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {r.city}
                  </Typography>
                </Stack>
              </Stack>
            ),
          },
          { key: "subjects", header: "Subjects", render: (r) => r.subjects.join(", ") },
          { key: "rating", header: "Rating", sortable: true, render: (r) => `★ ${r.rating}` },
          { key: "reviewCount", header: "Reviews", sortable: true, align: "right" },
          { key: "hourlyRate", header: "Rate", sortable: true, align: "right", render: (r) => formatCurrency(r.hourlyRate) },
          { key: "verified", header: "Verified", render: (r) => <Chip label={r.verified ? "Yes" : "Pending"} size="small" color={r.verified ? "success" : "warning"} /> },
        ]}
        rowActions={(r) => (
          <Stack direction="row" spacing={0.75}>
            <PermissionGuard require="tutors.verify" fallback={null}>
              {!r.verified && (
                <Button size="small" variant="contained" color="primary">
                  Verify
                </Button>
              )}
            </PermissionGuard>
            <Button size="small" variant="outlined">
              Open
            </Button>
          </Stack>
        )}
      />
    </PermissionGuard>
  );
}
