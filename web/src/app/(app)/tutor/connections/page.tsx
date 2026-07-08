"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HubIcon from "@mui/icons-material/HubOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { StatusChip } from "@/components/common/StatusChip";
import { QueryStates } from "@/components/common/QueryStates";
import { RelativeTime } from "@/components/common/RelativeTime";
import { useTutorConnections, type TutorConnection } from "@/lib/api/queries";

export default function TutorConnectionsPage() {
  const connectionsQuery = useTutorConnections();

  return (
    <>
      <PageHeader
        title="Connections"
        description="Students and parents you've connected with. The tutoring, scheduling and payment stay between you and them."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Connections" }]}
      />
      <QueryStates
        query={connectionsQuery}
        empty={{
          icon: <HubIcon />,
          title: "No connections yet",
          description:
            "When a student or parent reaches out through your profile, they show up here. You arrange the tutoring and payment directly with them, off-platform.",
        }}
      >
        {(connections) => <ConnectionsList connections={connections} />}
      </QueryStates>
    </>
  );
}

function ConnectionsList({ connections }: { connections: TutorConnection[] }) {
  return (
    <DataList
      rows={connections}
      rowKey={(r) => r.id}
      searchKeys={["student", "subject"]}
      searchPlaceholder="Search connections…"
      columns={[
        {
          key: "student",
          header: "Student",
          sortable: true,
          sortValue: (r) => r.student.toLowerCase(),
          render: (r) => <Typography sx={{ fontWeight: 500 }}>{r.student}</Typography>,
        },
        {
          key: "subject",
          header: "Subject",
          sortable: true,
          sortValue: (r) => r.subject.toLowerCase(),
          render: (r) => r.subject || "—",
        },
        {
          key: "status",
          header: "Status",
          sortable: true,
          sortValue: (r) => r.status,
          render: (r) => (
            <StatusChip
              kind={r.status === "active" ? "success" : "neutral"}
              label={
                <Box component="span" sx={{ textTransform: "capitalize" }}>
                  {r.status}
                </Box>
              }
            />
          ),
        },
        {
          key: "connectedAt",
          header: "Connected",
          sortable: true,
          sortValue: (r) => +new Date(r.connectedAt),
          render: (r) => <RelativeTime iso={r.connectedAt} />,
        },
      ]}
    />
  );
}
