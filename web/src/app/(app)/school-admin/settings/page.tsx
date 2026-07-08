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
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";

export default function SchoolSettings() {
  const tabs: EditTab[] = [
    {
      key: "school-profile",
      label: "School",
      icon: <ApartmentOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 600 }}>
          <TextField label="School name" defaultValue="Crawford College Pretoria" fullWidth />
          <TextField label="Admin email" defaultValue="admin@school.example" fullWidth />
          <TextField label="EMIS number" defaultValue="EMIS-12345" fullWidth />
          <TextField label="Phone" defaultValue="+27 12 555 0100" fullWidth />
          <TextField label="Address" defaultValue="Lynnwood Rd, Pretoria, 0081" fullWidth />
          <Box>
            <Button variant="contained">Save school profile</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "branding",
      label: "Branding",
      icon: <PaletteOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            Branding shows on report exports, parent emails, and the in-app school header.
          </Typography>
          <TextField label="Display name" defaultValue="Crawford" fullWidth />
          <TextField label="Primary colour (hex)" defaultValue="#0F6963" fullWidth />
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined">Upload logo</Button>
            <Button variant="outlined">Upload favicon</Button>
          </Stack>
          <Box>
            <Button variant="contained">Save branding</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "sso",
      label: "SSO & domain",
      icon: <VpnKeyOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            Force staff to sign in with your school's identity provider. Students can still use email/password.
          </Typography>
          <FormControlLabel control={<Switch />} label="Enable Microsoft SSO" />
          <FormControlLabel control={<Switch />} label="Enable Google Workspace SSO" />
          <TextField label="Allowed email domain" defaultValue="@school.example" fullWidth />
          <FormControlLabel control={<Switch defaultChecked />} label="POPIA-compliant data residency in SA" />
          <Box>
            <Button variant="contained">Save</Button>
          </Box>
        </Stack>
      ),
    },
    {
      key: "billing",
      label: "Billing",
      icon: <PaymentOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <TextField select fullWidth label="Plan" defaultValue="school-pro">
            <MenuItem value="school-starter">School Starter</MenuItem>
            <MenuItem value="school-pro">School Pro</MenuItem>
            <MenuItem value="school-enterprise">School Enterprise</MenuItem>
          </TextField>
          <TextField label="Billing email" defaultValue="finance@school.example" fullWidth />
          <TextField label="VAT number" defaultValue="ZA 4500011223" fullWidth />
          <Divider />
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined">View invoices</Button>
            <Button variant="outlined">Update payment method</Button>
          </Stack>
        </Stack>
      ),
    },
    {
      key: "audit",
      label: "Audit & retention",
      icon: <HistoryOutlinedIcon />,
      content: (
        <Stack spacing={2} sx={{ maxWidth: 560 }}>
          <Typography variant="body2" color="text.secondary">
            How long we keep student records after they leave the school. Required minimums apply for accreditation.
          </Typography>
          <TextField select fullWidth label="Student record retention" defaultValue="7">
            <MenuItem value="3">3 years</MenuItem>
            <MenuItem value="5">5 years</MenuItem>
            <MenuItem value="7">7 years (recommended)</MenuItem>
            <MenuItem value="forever">Forever</MenuItem>
          </TextField>
          <FormControlLabel control={<Switch defaultChecked />} label="Auto-export records to school archive monthly" />
          <Button variant="outlined" href="/admin/audit">
            Open audit log
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="School settings"
        description="School profile, branding, SSO, billing, and data retention."
        breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Settings" }]}
      />
      <EditWithTabs tabs={tabs} defaultTab="school-profile" />
    </>
  );
}
