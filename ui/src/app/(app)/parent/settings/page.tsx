"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { PageHeader } from "@/components/common/PageHeader";

export default function ParentSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, notifications, and preferences."
        breadcrumbs={[{ label: "Parent", href: "/parent" }, { label: "Settings" }]}
      />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField label="Full name" defaultValue="Nomvula Mokoena" />
            <TextField label="Email" defaultValue="nomvula@example.com" />
            <TextField label="Phone" defaultValue="+27 82 555 0101" />
            <FormControlLabel control={<Switch defaultChecked />} label="Email celebration alerts" />
            <FormControlLabel control={<Switch defaultChecked />} label="Weekly wellbeing digest" />
            <FormControlLabel control={<Switch />} label="Receive WhatsApp notifications" />
            <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
