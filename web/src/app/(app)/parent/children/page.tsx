"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroomOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { QueryStates } from "@/components/common/QueryStates";
import { useChildren } from "@/lib/api/queries";
import type { Child } from "@/lib/mockData";
import { initials, minutesToHours } from "@/lib/format";
import { Dot } from "@/components/common/Dot";
import Link from "next/link";

export default function ParentChildrenPage() {
  const query = useChildren();

  return (
    <>
      <PageHeader
        title="Children"
        description="Manage who's on your family plan."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Children" }]}
        actions={<Button variant="contained">Invite child</Button>}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <FamilyRestroomIcon />,
          title: "No children on this account",
          description: "Invite your child via email or ask your school admin to link an existing account.",
          action: <Button variant="contained">Invite a child</Button>,
        }}
      >
        {(children) => <ChildrenTable children={children} />}
      </QueryStates>
    </>
  );
}

function ChildrenTable({ children }: { children: Child[] }) {
  return (
    <DataList
      rows={children}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "name",
          header: "Child",
          sortable: true,
          render: (r) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>{initials(r.name)}</Avatar>
              <Stack>
                <Typography sx={{ fontWeight: 500 }}>{r.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Grade {r.grade} · {r.school}
                </Typography>
              </Stack>
            </Stack>
          ),
        },
        {
          key: "isStudyingNow",
          header: "Status",
          render: (r) => (
            <Stack direction="row" spacing={1} alignItems="center">
              <Dot color={r.isStudyingNow ? "success" : "warning"} pulsing={r.isStudyingNow} />
              <Typography variant="body2">{r.isStudyingNow ? "Studying" : "Idle"}</Typography>
            </Stack>
          ),
        },
        { key: "predictedAverage", header: "Predicted", sortable: true, render: (r) => `${r.predictedAverage}%` },
        { key: "weeklyMinutes", header: "This week", sortable: true, render: (r) => minutesToHours(r.weeklyMinutes) },
        { key: "moodAvg", header: "Mood", render: (r) => `${r.moodAvg.toFixed(1)} / 5` },
      ]}
      rowActions={(r) => (
        <Button component={Link} href={`/parent/children/${r.id}`} size="small" variant="outlined">
          Open
        </Button>
      )}
    />
  );
}
