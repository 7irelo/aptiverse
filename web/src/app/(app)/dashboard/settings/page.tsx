"use client";

import { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import { UserRound, Palette, Bell, Lock } from "lucide-react";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";
import { QueryStates } from "@/components/common/QueryStates";
import {
  useAcademicProfile,
  useUpdateAcademicProfile,
  useInstitutions,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useChangePassword,
  type NotificationPreferences,
  type UpdateAcademicProfileInput,
} from "@/lib/api/queries";
import { useStudyVocabulary } from "@/lib/hooks/useStudyVocabulary";
import type { AcademicProfile } from "@/lib/mockData";

export default function SettingsPage() {
  const tabs: EditTab[] = [
    { key: "profile", label: "Profile", icon: <UserRound size={18} />, content: <ProfileTab /> },
    { key: "appearance", label: "Appearance", icon: <Palette size={18} />, content: <AppearanceTab /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} />, content: <NotificationsTab /> },
    { key: "security", label: "Security", icon: <Lock size={18} />, content: <SecurityTab /> },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, notifications and account security."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />
      <EditWithTabs tabs={tabs} defaultTab="profile" />
    </>
  );
}

// --- Profile ---------------------------------------------------------------

// The profile is fetched, never read off the session: the session's copy is a
// JWT snapshot from sign-in time and goes stale the moment anything changes.
// QueryStates gates on the query, so the form only ever mounts with real data
// and educationLevel is never undefined when we branch on it.
function ProfileTab() {
  const profileQuery = useAcademicProfile();
  return (
    <QueryStates
      query={profileQuery}
      empty={{
        title: "We couldn't load your profile",
        description: "Refresh the page, and if it keeps happening, contact support.",
      }}
    >
      {(profile) => <ProfileForm profile={profile} />}
    </QueryStates>
  );
}

function ProfileForm({ profile }: { profile: AcademicProfile }) {
  const update = useUpdateAcademicProfile();
  const { enqueueSnackbar } = useSnackbar();
  const vocab = useStudyVocabulary();
  const isTertiary = vocab.isTertiary;

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [school, setSchool] = useState(profile.school ?? "");
  const [grade, setGrade] = useState(profile.grade?.toString() ?? "");
  const [institutionId, setInstitutionId] = useState(profile.institutionId ?? "");

  // Only send what actually changed, so a save never rewrites a field the
  // student didn't touch.
  const patch: UpdateAcademicProfileInput = {};
  if (firstName.trim() !== profile.firstName) patch.firstName = firstName.trim();
  if (lastName.trim() !== profile.lastName) patch.lastName = lastName.trim();
  if (isTertiary) {
    if (institutionId !== (profile.institutionId ?? "")) patch.institutionId = institutionId;
  } else {
    if (school.trim() !== (profile.school ?? "")) patch.school = school.trim();
    if (grade !== (profile.grade?.toString() ?? "")) patch.grade = Number(grade);
  }

  const namesFilled = firstName.trim().length > 0 && lastName.trim().length > 0;
  const dirty = Object.keys(patch).length > 0;

  const save = () => {
    if (!namesFilled) {
      enqueueSnackbar("First and last name can't be empty.", { variant: "warning" });
      return;
    }
    update.mutate(patch, {
      onSuccess: () => enqueueSnackbar("Profile saved.", { variant: "success" }),
      onError: (err) =>
        enqueueSnackbar(
          `Couldn't save your profile${err instanceof Error ? `: ${err.message}` : ""}`,
          { variant: "error" },
        ),
    });
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          fullWidth
        />
      </Stack>

      <TextField
        label="Email"
        value={profile.email ?? ""}
        fullWidth
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Lock size={16} />
              </InputAdornment>
            ),
          },
        }}
        helperText="This is how you sign in and how we reach you about your account, so it can't be changed here. Contact support if you need it moved."
      />

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Where you study
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Chip
            size="small"
            variant="outlined"
            label={vocab.levelLabel}
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="caption" color="text.secondary">
            Set when you signed up. It decides whether you track {vocab.unitPlural}.
          </Typography>
        </Stack>

        {isTertiary ? (
          <InstitutionField value={institutionId} onChange={setInstitutionId} />
        ) : (
          <Stack spacing={2}>
            <TextField
              label="School"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              fullWidth
              placeholder="Add your school"
            />
            <TextField label="Grade" value={grade} onChange={(e) => setGrade(e.target.value)} fullWidth select>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="11">11</MenuItem>
              <MenuItem value="12">12</MenuItem>
            </TextField>
          </Stack>
        )}
      </Box>

      <Box>
        <Button variant="contained" onClick={save} disabled={!dirty || update.isPending}>
          {update.isPending ? "Saving…" : "Save profile"}
        </Button>
      </Box>
    </Stack>
  );
}

// Only mounted for tertiary students, so a high-school student never fetches
// the institution catalog.
function InstitutionField({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const institutionsQuery = useInstitutions();
  const options = [...(institutionsQuery.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Autocomplete
      options={options}
      loading={institutionsQuery.isLoading}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      value={options.find((o) => o.id === value) ?? null}
      onChange={(_, v) => onChange(v?.id ?? "")}
      renderInput={(params) => (
        <TextField {...params} label="Institution" placeholder="Search…" />
      )}
    />
  );
}

// --- Appearance ------------------------------------------------------------

function AppearanceTab() {
  return (
    <Stack spacing={1} sx={{ maxWidth: 460 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Light and dark
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Aptiverse follows your device's light or dark setting automatically, so it matches
        everything else on your phone. There's nothing to set here.
      </Typography>
    </Stack>
  );
}

// --- Notifications ---------------------------------------------------------

// Real, persisted preferences. Each toggle saves on change via a partial patch,
// so one never clobbers the others.
function NotificationsTab() {
  const { enqueueSnackbar } = useSnackbar();
  const prefsQuery = useNotificationPreferences();
  const updatePrefs = useUpdateNotificationPreferences();
  const prefs = prefsQuery.data;
  const prefsDisabled = prefsQuery.isLoading || updatePrefs.isPending;
  const setPref = (key: keyof NotificationPreferences, value: boolean) =>
    updatePrefs.mutate(
      { [key]: value },
      { onError: () => enqueueSnackbar("Couldn't save that preference.", { variant: "error" }) },
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
          Channels
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          In-app notifications are always on. These control the extra channels.
        </Typography>
        <Stack>
          <PrefSwitch
            label="Email notifications"
            checked={prefs?.emailNotifications ?? true}
            disabled={prefsDisabled}
            onChange={(v) => setPref("emailNotifications", v)}
          />
          <PrefSwitch
            label="Push notifications"
            checked={prefs?.pushNotifications ?? true}
            disabled={prefsDisabled}
            onChange={(v) => setPref("pushNotifications", v)}
          />
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          What to notify me about
        </Typography>
        <Stack>
          <PrefSwitch
            label="Study group session reminders (email)"
            checked={prefs?.studyGroupEmailReminders ?? false}
            disabled={prefsDisabled}
            onChange={(v) => setPref("studyGroupEmailReminders", v)}
          />
          <PrefSwitch
            label="Assessment due soon"
            checked={prefs?.assessmentDueReminders ?? true}
            disabled={prefsDisabled}
            onChange={(v) => setPref("assessmentDueReminders", v)}
          />
          <Box sx={{ pl: 4 }}>
            <PrefSwitch
              label="Also email me"
              checked={prefs?.assessmentDueEmailReminders ?? false}
              disabled={prefsDisabled || !(prefs?.assessmentDueReminders ?? true)}
              onChange={(v) => setPref("assessmentDueEmailReminders", v)}
            />
          </Box>
          <PrefSwitch
            label="Daily wellbeing check-in reminder"
            checked={prefs?.wellbeingCheckinReminders ?? true}
            disabled={prefsDisabled}
            onChange={(v) => setPref("wellbeingCheckinReminders", v)}
          />
          <PrefSwitch
            label="Weekly study summary"
            checked={prefs?.weeklyStudySummary ?? false}
            disabled={prefsDisabled}
            onChange={(v) => setPref("weeklyStudySummary", v)}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          Saved as you toggle.
        </Typography>
      </Box>
    </Stack>
  );
}

// --- Security --------------------------------------------------------------

function SecurityTab() {
  const changePassword = useChangePassword();
  const { enqueueSnackbar } = useSnackbar();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const save = async () => {
    if (next.length < 8) {
      enqueueSnackbar("New password must be at least 8 characters.", { variant: "warning" });
      return;
    }
    if (next !== confirm) {
      enqueueSnackbar("New password and confirmation don't match.", { variant: "warning" });
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next });
      enqueueSnackbar("Password updated.", { variant: "success" });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      enqueueSnackbar(`Couldn't update password${err instanceof Error ? `: ${err.message}` : ""}`, {
        variant: "error",
      });
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 460 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Change password
      </Typography>
      <TextField
        type="password"
        label="Current password"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        fullWidth
        autoComplete="current-password"
      />
      <TextField
        type="password"
        label="New password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <TextField
        type="password"
        label="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        fullWidth
        autoComplete="new-password"
      />
      <Box>
        <Button
          variant="contained"
          onClick={save}
          disabled={changePassword.isPending || !current || !next || !confirm}
        >
          {changePassword.isPending ? "Updating…" : "Update password"}
        </Button>
      </Box>
    </Stack>
  );
}

// A labelled switch that reports its new boolean on change. Keeps the
// notification preference rows terse and consistent.
function PrefSwitch({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <FormControlLabel
      control={<Switch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />}
      label={label}
    />
  );
}
