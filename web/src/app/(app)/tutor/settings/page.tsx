"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TutorSettings() {
  const tabs: EditTab[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <PersonOutlineIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 640 }}>
          <TextField label="Display name" defaultValue="Sipho Mabaso" fullWidth />
          <TextField label="Headline" defaultValue="Wits Engineering grad. Calculus specialist." fullWidth />
          <TextField
            label="Bio"
            defaultValue="Helping students lift their maths from 50% to 75%+ since 2020."
            multiline
            rows={3}
            fullWidth
          />
          <TextField label="City" defaultValue="Johannesburg" fullWidth />
          <Box>
            <Button variant="contained">Save profile</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "availability",
      label: "Availability",
      icon: <ScheduleOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 640 }}>
          <FormControlLabel control={<Switch defaultChecked />} label="Available for new students" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Open hours
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {DAYS.map((d) => (
              <Chip key={d} label={d} clickable color={d === "Sat" || d === "Sun" ? "default" : "primary"} variant={d === "Sat" || d === "Sun" ? "outlined" : "filled"} />
            ))}
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField select fullWidth label="Earliest" defaultValue="15">
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <MenuItem key={h} value={h}>{h.toString().padStart(2, "0")}:00</MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth label="Latest" defaultValue="20">
              {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                <MenuItem key={h} value={h}>{h.toString().padStart(2, "0")}:00</MenuItem>
              ))}
            </TextField>
          </Stack>
          <Box>
            <Button variant="contained">Save availability</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "subjects",
      label: "Subjects",
      icon: <MenuBookOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            Pick what you teach — students filter by subject. Add specific topics for finer matching.
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {["Mathematics", "Physical Sciences", "English HL", "Life Sciences", "Accounting", "Geography"].map((s) => (
              <Chip
                key={s}
                label={s}
                clickable
                color={["Mathematics", "Physical Sciences"].includes(s) ? "primary" : "default"}
                variant={["Mathematics", "Physical Sciences"].includes(s) ? "filled" : "outlined"}
              />
            ))}
          </Stack>
          <TextField fullWidth label="Specialist topics (comma-separated)" defaultValue="Calculus, Trig, Equilibrium" />
          <Box>
            <Button variant="contained">Save subjects</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "payout",
      label: "Payout",
      icon: <AccountBalanceWalletOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <TextField fullWidth label="Hourly rate (ZAR)" type="number" defaultValue={250} />
          <TextField select fullWidth label="Payout cadence" defaultValue="weekly">
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="biweekly">Every 2 weeks</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>
          <TextField fullWidth label="Bank account holder" defaultValue="S. Mabaso" />
          <TextField fullWidth label="Bank" defaultValue="FNB" />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField fullWidth label="Account number" defaultValue="••••• 4421" />
            <TextField fullWidth label="Branch code" defaultValue="250655" />
          </Stack>
          <Box>
            <Button variant="contained">Save payout details</Button>
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
          <FormControlLabel control={<Switch defaultChecked />} label="Email me when a session is booked" />
          <FormControlLabel control={<Switch defaultChecked />} label="Email me when a session is cancelled" />
          <FormControlLabel control={<Switch defaultChecked />} label="Email me when a student leaves a review" />
          <FormControlLabel control={<Switch />} label="Daily summary email of bookings" />
          <Box>
            <Button variant="contained">Save</Button>
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
              Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Verified tutors get a badge on their profile and higher placement in search.
            </Typography>
            <Chip label="Verified" color="success" size="small" />
          </Box>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, availability, subjects, payout, notifications and security."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Settings" }]}
      />
      <EditWithTabs tabs={tabs} defaultTab="profile" />
    </>
  );
}
