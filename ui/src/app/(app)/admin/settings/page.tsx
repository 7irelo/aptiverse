"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";

export default function AdminSettings() {
  return (
    <PermissionGuard require="system.manage">
      <PageHeader
        title="Platform settings"
        description="Global toggles. Take care — changes apply across all schools."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
      />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Platform
          </Typography>
          <Stack spacing={2}>
            <TextField label="Platform name" defaultValue="Aptiverse" />
            <TextField label="Support email" defaultValue="support@aptiverse.co.za" />
            <TextField label="Default currency" defaultValue="ZAR" />
            <FormControlLabel control={<Switch defaultChecked />} label="Enable new signups" />
            <FormControlLabel control={<Switch defaultChecked />} label="Enable Stripe webhooks" />
            <FormControlLabel control={<Switch />} label="Maintenance mode" />
            <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}
