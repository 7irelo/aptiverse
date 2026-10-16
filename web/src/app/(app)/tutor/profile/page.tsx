"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { useTutorProfile, type TutorProfile } from "@/lib/api/queries";
import { tutorKindLabel } from "@/lib/tutoring-labels";

export default function TutorProfilePage() {
  const profileQuery = useTutorProfile();

  return (
    <>
      <PageHeader
        title="Profile"
        description="How students and parents see you. Keep it current so the right learners find you."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Profile" }]}
        actions={
          <Button component={Link} href="/tutor/settings" variant="contained">
            Edit profile
          </Button>
        }
      />

      {profileQuery.isLoading ? (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Skeleton variant="text" width="40%" height={32} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1, mt: 1 }} />
            </Stack>
          </CardContent>
        </Card>
      ) : profileQuery.isError ? (
        <EmptyState
          title="Couldn't load your profile"
          description="Something went wrong fetching your profile. Try again in a moment."
        />
      ) : !profileQuery.data ? (
        <EmptyState
          icon={<PersonOutlineIcon />}
          title="Your profile isn't set up yet"
          description="Add your qualifications, subjects and teaching style so students can find you and know what you offer. This is the page they'll see."
          action={
            <Button component={Link} href="/tutor/settings" variant="contained">
              Set up your profile
            </Button>
          }
        />
      ) : (
        <ProfileShowcase profile={profileQuery.data} />
      )}
    </>
  );
}

function ProfileShowcase({ profile }: { profile: TutorProfile }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {profile.qualification || "Tutor"}
            </Typography>
            {profile.specialization && (
              <Typography variant="body2" color="text.secondary">
                {profile.specialization}
              </Typography>
            )}
            {identityLine(profile) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {identityLine(profile)}
              </Typography>
            )}
          </Box>
          {profile.isVerified && (
            <Chip
              icon={<VerifiedIcon />}
              label="Verified"
              color="success"
              size="small"
              variant="outlined"
              sx={{ flexShrink: 0 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.5 }}>
          <Rating value={profile.rating} readOnly precision={0.1} size="small" />
          <Typography variant="caption" color="text.secondary">
            {profile.totalReviews > 0
              ? `${profile.rating.toFixed(1)} from ${profile.totalReviews} review${profile.totalReviews === 1 ? "" : "s"}`
              : "No reviews yet"}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={2.5}>
          <Detail label="Experience">
            {profile.yearsOfExperience > 0
              ? `${profile.yearsOfExperience} year${profile.yearsOfExperience === 1 ? "" : "s"}`
              : "Not specified"}
          </Detail>
          {profile.teachingStyle && <Detail label="Teaching style">{profile.teachingStyle}</Detail>}
          {profile.bio && <Detail label="About">{profile.bio}</Detail>}
        </Stack>
      </CardContent>
    </Card>
  );
}

// A one-line "who they are" summary from the tutor's identity fields, shown
// under their headline so a learner can place them at a glance.
function identityLine(profile: TutorProfile): string {
  return [
    profile.tutorKind ? tutorKindLabel(profile.tutorKind) : null,
    profile.institution ? `at ${profile.institution}` : null,
    profile.studyingToward ? `studying ${profile.studyingToward}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {children}
      </Typography>
    </Box>
  );
}
