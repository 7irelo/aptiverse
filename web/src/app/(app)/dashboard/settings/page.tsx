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
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";
import { useColorMode } from "@/providers/ColorModeProvider";

export default function SettingsPage() {
  const { mode, setMode } = useColorMode();
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

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [parentVisibility, setParentVisibility] = useState(true);
  const [diaryEncryption, setDiaryEncryption] = useState(true);

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
              placeholder="—"
            />
            <TextField
              label="Last name"
              defaultValue={fallbackLast}
              key={`last-${fallbackLast}`}
              fullWidth
              placeholder="—"
            />
          </Stack>
          <TextField
            label="Email"
            defaultValue={u.email ?? ""}
            key={`email-${u.email ?? ""}`}
            fullWidth
            placeholder="—"
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
          <TextField
            select
            fullWidth
            label="Theme"
            value={mode}
            onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}
          >
            <MenuItem value="system">Match system</MenuItem>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
          </TextField>
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
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Channels
            </Typography>
            <Stack>
              <FormControlLabel
                control={<Switch checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />}
                label="Email notifications"
              />
              <FormControlLabel
                control={<Switch checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />}
                label="Push notifications"
              />
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              What to notify me about
            </Typography>
            <Stack>
              <FormControlLabel control={<Switch defaultChecked />} label="Daily wellbeing check-in reminder" />
              <FormControlLabel control={<Switch defaultChecked />} label="Bursary deadline reminders" />
              <FormControlLabel control={<Switch defaultChecked />} label="SBA due in 3 days" />
              <FormControlLabel control={<Switch />} label="Weekly study summary" />
            </Stack>
          </Box>
          <Box>
            <Button variant="contained">Save notification preferences</Button>
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
