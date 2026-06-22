"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RuleOutlinedIcon from "@mui/icons-material/RuleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";

export default function TeacherSettings() {
  const tabs: EditTab[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <PersonOutlineIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <TextField label="Full name" defaultValue="Ms. Naidoo" fullWidth />
          <TextField label="Email" defaultValue="naidoo@school.example" fullWidth />
          <TextField label="School" defaultValue="Crawford College Pretoria" fullWidth />
          <TextField label="Subjects taught" defaultValue="Mathematics, Mathematical Literacy" fullWidth />
          <Box>
            <Button variant="contained">Save profile</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <NotificationsNoneOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <FormControlLabel control={<Switch defaultChecked />} label="Email me when students request help" />
          <FormControlLabel control={<Switch defaultChecked />} label="Daily class summary email" />
          <FormControlLabel control={<Switch defaultChecked />} label="Goal-verifications batch (one email per day)" />
          <FormControlLabel control={<Switch />} label="Live alert when a learner flags low mood" />
          <Box>
            <Button variant="contained">Save</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "marking",
      label: "Marking defaults",
      icon: <RuleOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            Defaults applied when you create a new SBA. You can still override per-assignment.
          </Typography>
          <TextField select fullWidth label="Default board" defaultValue="IEB">
            <MenuItem value="IEB">IEB</MenuItem>
            <MenuItem value="NSC">NSC (DBE)</MenuItem>
          </TextField>
          <TextField fullWidth type="number" label="Default weight (%)" defaultValue={15} />
          <FormControlLabel control={<Switch defaultChecked />} label="Auto-generate rubric on new SBA" />
          <FormControlLabel control={<Switch defaultChecked />} label="Predict marks for unmarked submissions" />
          <Box>
            <Button variant="contained">Save defaults</Button>
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
              Two-factor authentication
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Recommended — protects student data on this account.
            </Typography>
            <Button variant="outlined">Enable 2FA</Button>
          </Box>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, notifications, marking defaults, security."
        breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Settings" }]}
      />
      <EditWithTabs tabs={tabs} defaultTab="profile" />
    </>
  );
}
