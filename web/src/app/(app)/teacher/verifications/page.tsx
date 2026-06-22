"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { QueryStates } from "@/components/common/QueryStates";
import { useVerifications, type Verification } from "@/lib/api/queries";

export default function VerificationsPage() {
  const query = useVerifications();

  return (
    <>
      <PageHeader
        title="Goal verifications"
        description="One click — Yes / No. We've already done the data work."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Goal verifications" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <VerifiedIcon />,
          title: "No verifications to review",
          description: "When students complete goals, they'll land here for one-click approval.",
        }}
      >
        {(items) => <VerificationsTable items={items} />}
      </QueryStates>
    </>
  );
}

function VerificationsTable({ items }: { items: Verification[] }) {
  return (
    <DataList
      rows={items}
      rowKey={(r) => r.id}
      columns={[
        {
          key: "student",
          header: "Student",
          render: (r) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                {r.student.split(" ").map((p) => p[0]).join("")}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {r.student}
              </Typography>
            </Stack>
          ),
        },
        { key: "goal", header: "Goal" },
        { key: "value", header: "Evidence" },
        { key: "reward", header: "Reward", render: (r) => <Chip label={r.reward} size="small" /> },
      ]}
      rowActions={() => (
        <Stack direction="row" spacing={0.75}>
          <Button size="small" variant="outlined" color="error">
            Decline
          </Button>
          <Button size="small" variant="contained" color="primary">
            Approve
          </Button>
        </Stack>
      )}
    />
  );
}
