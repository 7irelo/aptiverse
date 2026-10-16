"use client";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroomOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";

export default function ParentSettingsPage() {
  const tabs: EditTab[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <PersonOutlineIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <TextField label="Full name" defaultValue="Nomvula Mokoena" fullWidth />
          <TextField label="Email" defaultValue="nomvula@example.com" fullWidth />
          <TextField label="Phone" defaultValue="+27 82 555 0101" fullWidth />
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
        <Stack spacing={3} sx={{ maxWidth: 560 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Channels
            </Typography>
            {/*
              The WhatsApp channel is gone: there is no WhatsApp integration and
              no plan to build one, so it offered a delivery method that could
              never deliver.
              These two switches are still cosmetic, like the student settings
              page was before it was rewired: defaultChecked, no state, no
              onChange, nothing persisted. The User entity does carry
              EmailNotifications and PushNotifications, so they can be wired to
              the same endpoint the student page uses. Flagged rather than fixed
              here to keep this change to dropping WhatsApp.
            */}
            <Stack>
              <FormControlLabel control={<Switch defaultChecked />} label="Email" />
              <FormControlLabel control={<Switch defaultChecked />} label="Push notifications" />
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              What to notify me about
            </Typography>
            <Stack>
              <FormControlLabel control={<Switch defaultChecked />} label="Celebration alerts (streaks, completed goals)" />
              <FormControlLabel control={<Switch defaultChecked />} label="Weekly wellbeing digest" />
              <FormControlLabel control={<Switch />} label="Every login by my child (verbose — leave off unless you need it)" />
            </Stack>
          </Box>
          <Box>
            <Button variant="contained">Save notification preferences</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "children-access",
      label: "Children access",
      icon: <FamilyRestroomIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            Decide what you can see — your child controls whether they encrypt their diary, you can never read it. Wellbeing trends are always anonymised.
          </Typography>
          <Stack>
            <FormControlLabel control={<Switch defaultChecked />} label="See realtime study activity" />
            <FormControlLabel control={<Switch defaultChecked />} label="See predicted marks and trajectory" />
            <FormControlLabel control={<Switch defaultChecked />} label="Receive a flag when stress is rising" />
            <FormControlLabel control={<Switch />} label="Read diary entries (requires my child's explicit consent)" />
          </Stack>
        </Stack>
      ),
    },
    {
      key: "billing",
      label: "Billing",
      icon: <PaymentOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            Manage your Family plan and payment method. For invoices and history, head to the Billing page.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" href="/parent/billing">
              Go to Billing
            </Button>
            <Button variant="outlined">Update payment method</Button>
          </Stack>
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
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, notifications, what you can see about your kids, billing, and security."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Settings" }]}
      />
      <EditWithTabs tabs={tabs} defaultTab="profile" />
    </>
  );
}
