"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import LockIcon from "@mui/icons-material/LockOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { STUDY_GROUPS, SUBJECTS } from "@/lib/mockData";
import { formatRelative } from "@/lib/format";

export default function StudyGroupsPage() {
  return (
    <>
      <PageHeader
        title="Study groups"
        description="Small virtual rooms where you study with peers — share notes, schedule sessions, explain it to each other."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Study groups" }]}
        actions={<Button variant="contained">Create group</Button>}
      />

      <Grid container spacing={3}>
        {STUDY_GROUPS.map((g) => {
          const subject = SUBJECTS.find((s) => s.id === g.subjectId);
          return (
            <Grid key={g.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Chip label={subject?.name} size="small" />
                    {g.privacy === "invite" && (
                      <Chip icon={<LockIcon sx={{ fontSize: 14 }} />} label="Invite only" size="small" variant="outlined" />
                    )}
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {g.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {g.description}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <AvatarGroup max={4}>
                      {Array.from({ length: g.members }).map((_, i) => (
                        <Avatar key={i} sx={{ width: 28, height: 28, fontSize: "0.75rem", bgcolor: ["#1F8079", "#F25C2E", "#3D9762", "#FFB733", "#5BA3E5"][i % 5] }}>
                          {String.fromCharCode(65 + i)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="caption" color="text.secondary">
                      {g.members} members
                    </Typography>
                  </Stack>
                  {g.nextSession && (
                    <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "action.hover", mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Next session
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatRelative(g.nextSession)}
                      </Typography>
                    </Box>
                  )}
                  <Button variant="contained" fullWidth>
                    {g.privacy === "open" ? "Join group" : "Request invite"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
