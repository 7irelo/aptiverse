"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import { PageHeader } from "@/components/common/PageHeader";

export default function TeacherSettings() {
  return (
    <>
      <PageHeader title="Settings" breadcrumbs={[{ label: "Teacher", href: "/teacher" }, { label: "Settings" }]} />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField label="Full name" defaultValue="Ms. Naidoo" />
            <TextField label="Email" defaultValue="naidoo@school.example" />
            <TextField label="School" defaultValue="Crawford College Pretoria" />
            <FormControlLabel control={<Switch defaultChecked />} label="Email me when students request help" />
            <FormControlLabel control={<Switch defaultChecked />} label="Daily class summary email" />
            <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
