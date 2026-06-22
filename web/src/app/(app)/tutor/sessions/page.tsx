"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { formatDate, formatCurrency } from "@/lib/format";
import dayjs from "dayjs";

const SESSIONS = Array.from({ length: 12 }).map((_, i) => ({
  id: `ses${i}`,
  student: ["Thabo M.", "Naledi K.", "Sipho D.", "Aisha M.", "Lerato P."][i % 5],
  subject: ["Mathematics", "Physical Sciences", "English HL"][i % 3],
  start: dayjs().add(i, "day").hour(16).minute(0).toISOString(),
  duration: 60,
  fee: 250,
  status: i < 4 ? "scheduled" : i < 8 ? "completed" : "scheduled",
}));

export default function TutorSessionsPage() {
  return (
    <>
      <PageHeader
        title="Sessions"
        description="All upcoming and past 1:1 sessions."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Sessions" }]}
      />
      <DataList
        rows={SESSIONS}
        rowKey={(r) => r.id}
        columns={[
          {
            key: "student",
            header: "Student",
            render: (r) => (
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "primary.main" }}>
                  {r.student.split(" ").map((p) => p[0]).join("")}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {r.student}
                </Typography>
              </Stack>
            ),
          },
          { key: "subject", header: "Subject" },
          { key: "start", header: "Date", sortable: true, render: (r) => formatDate(r.start, "ddd, DD MMM · HH:mm") },
          { key: "duration", header: "Duration", render: (r) => `${r.duration} min` },
          { key: "fee", header: "Fee", align: "right", render: (r) => formatCurrency(r.fee) },
          {
            key: "status",
            header: "Status",
            render: (r) => <Chip label={r.status} size="small" color={r.status === "scheduled" ? "primary" : "success"} sx={{ textTransform: "capitalize" }} />,
          },
        ]}
        rowActions={(r) => (
          <Button size="small" variant={r.status === "scheduled" ? "contained" : "outlined"}>
            {r.status === "scheduled" ? "Open" : "Notes"}
          </Button>
        )}
      />
    </>
  );
}
