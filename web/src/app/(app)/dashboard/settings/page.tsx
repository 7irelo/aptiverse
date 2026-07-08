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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useSession } from "next-auth/react";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/api/queries";

export default function SettingsPage() {
  const { data: session } = useSession();
  const u = (session?.user ?? {}) as {
    name?: string | null;
    email?: string | null;
    firstName?: string;
    lastName?: string;
    school?: string;
    grade?: string | number;
  };
  const fallbackFirst = u.firstName ?? (u.name ? u.name.split(" ")[0] : "");
  const fallbackLast =
    u.lastName ?? (u.name && u.name.includes(" ") ? u.name.split(" ").slice(1).join(" ") : "");

  const [parentVisibility, setParentVisibility] = useState(true);
  const [diaryEncryption, setDiaryEncryption] = useState(true);

  // Real, persisted notification preferences. Each toggle saves on change via a
  // partial patch, so one never clobbers the others.
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

  const tabs: EditTab[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <PersonOutlineIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First name"
              defaultValue={fallbackFirst}
              key={`first-${fallbackFirst}`}
              fullWidth
              placeholder="Not set"
            />
            <TextField
              label="Last name"
              defaultValue={fallbackLast}
              key={`last-${fallbackLast}`}
              fullWidth
              placeholder="Not set"
            />
          </Stack>
          <TextField
            label="Email"
            defaultValue={u.email ?? ""}
            key={`email-${u.email ?? ""}`}
            fullWidth
            placeholder="Not set"
          />
          <TextField
            label="School"
            defaultValue={u.school ?? ""}
            key={`school-${u.school ?? ""}`}
            fullWidth
            placeholder="Add your school"
          />
          <TextField
            label="Grade"
            defaultValue={u.grade?.toString() ?? ""}
            key={`grade-${u.grade ?? ""}`}
            fullWidth
            select
          >
            <MenuItem value="">Not set</MenuItem>
            <MenuItem value="11">11</MenuItem>
            <MenuItem value="12">12</MenuItem>
          </TextField>
          <Box>
            <Button variant="contained">Save profile</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "appearance",
      label: "Appearance",
      icon: <PaletteOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 460 }}>
          <Typography variant="body2" color="text.secondary">
            Aptiverse follows your device's light or dark setting automatically.
          </Typography>
          <TextField select fullWidth label="Language" defaultValue="en">
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="zu">isiZulu</MenuItem>
            <MenuItem value="af">Afrikaans</MenuItem>
            <MenuItem value="xh">isiXhosa</MenuItem>
          </TextField>
          <TextField select fullWidth label="Reduce motion" defaultValue="system">
            <MenuItem value="system">Follow system setting</MenuItem>
            <MenuItem value="off">Off</MenuItem>
            <MenuItem value="on">On</MenuItem>
          </TextField>
        </Stack>
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <NotificationsNoneOutlinedIcon />,
      content: (
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
      ),
    },
    {
      key: "privacy",
      label: "Privacy",
      icon: <ShieldOutlinedIcon />,
      content: (
        <Stack spacing={3} sx={{ maxWidth: 620 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Sharing
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch checked={parentVisibility} onChange={(e) => setParentVisibility(e.target.checked)} />}
                label="Allow parents to see realtime activity"
              />
              <FormControlLabel
                control={<Switch checked={diaryEncryption} onChange={(e) => setDiaryEncryption(e.target.checked)} />}
                label="End-to-end encrypt my diary"
              />
              <FormControlLabel control={<Switch defaultChecked />} label="Allow my school to verify my goals" />
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Your data
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined">Download my data</Button>
              <Button color="error" variant="outlined">
                Delete account
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Account deletion is permanent. We keep anonymised mastery aggregates for 30 days for audit reasons, then purge them.
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "security",
      label: "Security",
      icon: <LockOutlinedIcon />,
      content: (
        <Stack spacing={3} sx={{ maxWidth: 460 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Change password
            </Typography>
            <Stack spacing={2}>
              <TextField type="password" label="Current password" fullWidth />
              <TextField type="password" label="New password" fullWidth />
              <TextField type="password" label="Confirm new password" fullWidth />
              <Box>
                <Button variant="contained">Update password</Button>
              </Box>
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Active sessions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You're signed in on this device. Sign out of every other session if your account feels off.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button variant="outlined">Sign out other devices</Button>
            </Stack>
          </Box>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, privacy, notifications, security and accessibility."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <EditWithTabs tabs={tabs} defaultTab="profile" />
    </>
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
      control={
        <Switch checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      }
      label={label}
    />
  );
}
