"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import { PageHeader } from "@/components/common/PageHeader";

export default function SchoolSettings() {
  return (
    <>
      <PageHeader title="School settings" breadcrumbs={[{ label: "School", href: "/school-admin" }, { label: "Settings" }]} />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField label="School name" defaultValue="Crawford College Pretoria" />
            <TextField label="Admin email" defaultValue="admin@school.example" />
            <TextField label="EMIS number" defaultValue="EMIS-12345" />
            <FormControlLabel control={<Switch defaultChecked />} label="Allow data sharing with bursary partners (with student consent)" />
            <FormControlLabel control={<Switch defaultChecked />} label="POPIA-compliant data residency in SA" />
            <FormControlLabel control={<Switch />} label="Enable SSO via Microsoft" />
            <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
