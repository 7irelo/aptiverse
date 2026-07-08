"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Autocomplete from "@mui/material/Autocomplete";
import Alert from "@mui/material/Alert";
import {
  useAcademicProfile,
  useUpdateAcademicProfile,
  useCurricula,
  useInstitutions,
} from "@/lib/api/queries";
import { CubeSpinner } from "@/components/common/CubeSpinner";

// A focused, post-signup step that collects the student's academic profile.
// Reached after email or Google signup (or any time the profile is
// incomplete). Keeping it separate from the account form keeps signup short.
export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const profileQuery = useAcademicProfile();
  const update = useUpdateAcademicProfile();
  const curriculaQuery = useCurricula();
  const institutionsQuery = useInstitutions();

  const [level, setLevel] = useState<"highschool" | "tertiary">("highschool");
  const [curriculumId, setCurriculumId] = useState("");
  const [grade, setGrade] = useState("");
  const [institutionId, setInstitutionId] = useState("");

  // Not signed in → back to login. Already-complete profile → straight in.
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const profile = profileQuery.data;
  useEffect(() => {
    if (!profile) return;
    const complete =
      (profile.educationLevel === "highschool" && !!profile.curriculumId) ||
      (profile.educationLevel === "tertiary" && !!profile.institutionId);
    if (complete) router.replace("/dashboard");
  }, [profile, router]);

  const institutionOptions = useMemo(
    () => [...(institutionsQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [institutionsQuery.data],
  );

  const canSubmit =
    level === "tertiary" ? !!institutionId : !!curriculumId && !!grade;

  function submit() {
    if (!canSubmit) return;
    const input =
      level === "tertiary"
        ? { educationLevel: "tertiary" as const, institutionId }
        : { educationLevel: "highschool" as const, curriculumId, grade: Number(grade) };
    update.mutate(input, { onSuccess: () => router.replace("/dashboard") });
  }

  if (status === "loading" || profileQuery.isLoading) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CubeSpinner color="primary" sx={{ fontSize: 44 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 520 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="overline" color="primary.main" sx={{ letterSpacing: "0.08em" }}>
            Almost there
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600, mt: 0.5, mb: 0.5 }}>
            A couple of details
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This tailors your subjects, practice and mastery. You can change it later in settings.
          </Typography>

          <Stack spacing={2.5}>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Where are you studying?
              </Typography>
              <ToggleButtonGroup
                value={level}
                exclusive
                fullWidth
                onChange={(_, v) => v && setLevel(v)}
              >
                <ToggleButton value="highschool">High school</ToggleButton>
                <ToggleButton value="tertiary">University / college</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {level === "tertiary" ? (
              <Autocomplete
                options={institutionOptions}
                loading={institutionsQuery.isLoading}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                value={institutionOptions.find((o) => o.id === institutionId) ?? null}
                onChange={(_, v) => setInstitutionId(v?.id ?? "")}
                renderInput={(params) => (
                  <TextField {...params} label="Institution" placeholder="Search…" />
                )}
              />
            ) : (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label="Curriculum"
                  value={curriculumId}
                  onChange={(e) => setCurriculumId(e.target.value)}
                >
                  {(curriculaQuery.data ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.shortName ?? c.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  {["10", "11", "12"].map((g) => (
                    <MenuItem key={g} value={g}>
                      Grade {g}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            )}

            {update.isError && (
              <Alert severity="error">Couldn&apos;t save that. Please try again.</Alert>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!canSubmit || update.isPending}
              onClick={submit}
            >
              {update.isPending ? "Saving…" : "Continue to dashboard"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
