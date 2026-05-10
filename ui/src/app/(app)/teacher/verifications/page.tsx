"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import dayjs from "dayjs";

const VERIFICATIONS = [
  { id: "v1", student: "Thandi Mokoena", goal: "Achieve 70% in T1 Maths SBA", value: "Score 72% on Calculus test", date: dayjs().subtract(2, "day").toISOString(), reward: "Free Calculus masterclass" },
  { id: "v2", student: "Lerato Pillay", goal: "5-day study streak", value: "Logged 5 consecutive sessions", date: dayjs().subtract(1, "day").toISOString(), reward: "Resilient Learner badge" },
  { id: "v3", student: "Sipho Dlamini", goal: "Submit 3 essays this term", value: "Submitted essay #3 today", date: dayjs().toISOString(), reward: "1 free hour with tutor" },
  { id: "v4", student: "Aisha Mahlangu", goal: "Lift Chemistry mastery to 60%", value: "Mastery now 62%", date: dayjs().subtract(3, "day").toISOString(), reward: "Past papers vault unlock" },
];

export default function VerificationsPage() {
  return (
    <>
      <PageHeader
        title="Goal verifications"
        description="One click — Yes / No. We've already done the data work."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Goal verifications" }]}
      />

      <DataList
        rows={VERIFICATIONS}
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
    </>
  );
}
