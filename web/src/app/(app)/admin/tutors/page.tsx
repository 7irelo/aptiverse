"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { BadgeCheck, Users as UsersIcon } from "lucide-react";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { DataList } from "@/components/data/DataList";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { QueryStates } from "@/components/common/QueryStates";
import { useAdminTutors, useSetTutorVerification, type AdminTutor } from "@/lib/api/queries";
import { initials } from "@/lib/format";

// Every marketplace tutor profile, including the ones a student cannot see.
//
// The public /api/marketplace/tutors filters to tutors accepting students,
// which is right for discovery and wrong here: the back office needs the
// paused and unverified ones most. The Verify button used to do nothing at all
// (IsVerified was documented as "system-managed" and had no management path);
// it now posts to the admin verification endpoint and writes an audit entry.
export default function AdminTutorsPage() {
  const query = useAdminTutors();

  return (
    <PermissionGuard require="tutors.read">
      <PageHeader
        title="Tutors"
        description="Marketplace tutor profiles. Verification decides who carries the verified badge in discovery."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Tutors" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <UsersIcon />,
          title: "No tutor profiles yet",
          description:
            "A tutor appears here once they set up a public profile from their own Profile page.",
        }}
      >
        {(tutors) => <TutorsTable tutors={tutors} onRefresh={() => void query.refetch()} />}
      </QueryStates>
    </PermissionGuard>
  );
}

function TutorsTable({ tutors, onRefresh }: { tutors: AdminTutor[]; onRefresh: () => void }) {
  const setVerified = useSetTutorVerification();
  const { enqueueSnackbar } = useSnackbar();

  const toggle = (t: AdminTutor) =>
    setVerified.mutate(
      { userId: t.userId, verified: !t.verified },
      {
        onSuccess: () =>
          enqueueSnackbar(
            t.verified ? `Verification removed from ${t.name}` : `${t.name} verified`,
            { variant: "success" },
          ),
        onError: (err) =>
          enqueueSnackbar(err.message || "Could not change verification", { variant: "error" }),
      },
    );

  return (
    <DataList
      rows={tutors}
      rowKey={(r) => r.userId}
      onRefresh={onRefresh}
      searchPlaceholder="Search by name, email or subject…"
      searchKeys={["name", "email", "qualification", "institution"]}
      columns={[
        {
          key: "name",
          header: "Tutor",
          sortable: true,
          render: (r) => (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                {initials(r.name || r.email)}
              </Avatar>
              <Stack sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                    {r.name || "(no name)"}
                  </Typography>
                  {r.verified && <BadgeCheck size={14} />}
                </Stack>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {r.qualification || r.email}
                </Typography>
              </Stack>
            </Stack>
          ),
        },
        {
          key: "subjects",
          header: "Subjects",
          hideOn: "sm",
          render: (r) => (r.subjects.length ? r.subjects.join(", ") : "None listed"),
        },
        {
          key: "rating",
          header: "Rating",
          sortable: true,
          render: (r) =>
            r.reviewCount === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reviews
              </Typography>
            ) : (
              `${r.rating.toFixed(1)} (${r.reviewCount})`
            ),
        },
        {
          key: "acceptingStudents",
          header: "Discovery",
          hideOn: "md",
          render: (r) => (
            <Chip
              size="small"
              label={r.acceptingStudents ? "Listed" : "Paused"}
              color={r.acceptingStudents ? "default" : "warning"}
            />
          ),
        },
        {
          key: "verified",
          header: "Verified",
          render: (r) => (
            <Chip
              label={r.verified ? "Verified" : "Not verified"}
              size="small"
              color={r.verified ? "success" : "default"}
            />
          ),
        },
      ]}
      rowActions={(r) => (
        <PermissionGuard require="tutors.verify" fallback={null}>
          <Button
            size="small"
            variant={r.verified ? "text" : "contained"}
            color={r.verified ? "inherit" : "primary"}
            disabled={setVerified.isPending}
            onClick={() => toggle(r)}
          >
            {r.verified ? "Unverify" : "Verify"}
          </Button>
        </PermissionGuard>
      )}
    />
  );
}
