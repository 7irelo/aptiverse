"use client";

import { use } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import dayjs from "dayjs";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { useLinkedStudentOverview, type StudentOverview } from "@/lib/api/queries";
import { dueLabel } from "@/components/dashboard/UnitSignals";

export default function LinkedStudentPage({
  params,
}: {
  params: Promise<{ studentUserId: string }>;
}) {
  const { studentUserId } = use(params);
  const query = useLinkedStudentOverview(studentUserId);

  return (
    <>
      <PageHeader
        title={query.data?.name ?? "Student"}
        description="A read-only view of how they're doing. You can see this, not change it."
        breadcrumbs={[
          { label: "Parent", href: "/parent" },
          { label: "Students", href: "/parent/students" },
          { label: query.data?.name ?? "Student" },
        ]}
      />

      <QueryStates
        query={query}
        isEmpty={() => false}
        empty={{
          icon: <PersonOutlineIcon />,
          title: "Can't show this student",
          description: "This link isn't active, or the student unlinked. Ask them to accept your invite.",
          action: (
            <Button component={Link} href="/parent/students" variant="outlined">
              Back to students
            </Button>
          ),
        }}
      >
        {(overview) => <Overview overview={overview} />}
      </QueryStates>
    </>
  );
}

function Overview({ overview }: { overview: StudentOverview }) {
  const levelLabel = overview.educationLevel === "tertiary" ? "University / college" : "High school";

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
              Overview
            </Typography>
            <Stack spacing={2} sx={{ mt: 1.5 }} divider={<Divider flexItem />}>
              <Row label="Level" value={levelLabel} />
              <Row label="Upcoming assessments" value={String(overview.upcomingCount)} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              What&apos;s coming up
            </Typography>
            {overview.upcoming.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nothing scheduled right now.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {overview.upcoming.map((a) => {
                  const due = dueLabel(a.dueDate);
                  return (
                    <Stack
                      key={a.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                      sx={{ py: 1.5 }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(a.dueDate).format("D MMM YYYY")}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          color:
                            due.tone === "error"
                              ? "error.main"
                              : due.tone === "warning"
                                ? "warning.main"
                                : "text.secondary",
                        }}
                      >
                        {due.text}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
        {value}
      </Typography>
    </Stack>
  );
}
