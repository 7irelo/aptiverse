"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import { PageHeader } from "@/components/common/PageHeader";
import { AssignableList } from "@/components/data/AssignableList";

type Teacher = { id: string; name: string; subjects: string };

const ALL_TEACHERS: Teacher[] = [
  { id: "t1", name: "Ms. Naidoo", subjects: "Mathematics" },
  { id: "t2", name: "Mr. Dlamini", subjects: "Physical Sciences" },
  { id: "t3", name: "Ms. van der Merwe", subjects: "English HL" },
  { id: "t4", name: "Dr. Khumalo", subjects: "Life Sciences" },
  { id: "t5", name: "Mnr. Botha", subjects: "Afrikaans FAL" },
  { id: "t6", name: "Mr. Ndlovu", subjects: "Geography" },
  { id: "t7", name: "Ms. Pillay", subjects: "Life Orientation" },
  { id: "t8", name: "Ms. Mokoena", subjects: "Mathematics" },
  { id: "t9", name: "Mr. Smith", subjects: "Accounting" },
];

export default function TeachersPage() {
  const [active, setActive] = useState(ALL_TEACHERS.slice(0, 5));
  const [pending, setPending] = useState(ALL_TEACHERS.slice(5));

  return (
    <>
      <PageHeader
        title="Teachers"
        description="Active teachers and pending invitations. Reuses the same Assign/Unassign workflow we use for classes."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Teachers" }]}
        actions={<Button variant="contained">Invite teacher</Button>}
      />

      <AssignableList
        available={pending}
        assigned={active}
        availableTitle="Pending"
        assignedTitle="Active"
        rowKey={(r) => r.id}
        columns={[
          {
            key: "name",
            header: "Teacher",
            render: (r) => (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: "primary.main" }}>
                  {r.name.split(" ").map((p) => p[0]).slice(-2).join("")}
                </Avatar>
                <Stack>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {r.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.subjects}
                  </Typography>
                </Stack>
              </Stack>
            ),
          },
          { key: "subjects", header: "Subject" },
        ]}
        onAssign={(ids) => {
          const moving = pending.filter((p) => ids.includes(p.id));
          setActive((a) => [...a, ...moving]);
          setPending((p) => p.filter((x) => !ids.includes(x.id)));
        }}
        onUnassign={(ids) => {
          const moving = active.filter((p) => ids.includes(p.id));
          setPending((p) => [...p, ...moving]);
          setActive((a) => a.filter((x) => !ids.includes(x.id)));
        }}
      />
    </>
  );
}
