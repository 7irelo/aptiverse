"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import { PageHeader } from "@/components/common/PageHeader";

export default function TutorSettings() {
  return (
    <>
      <PageHeader title="Settings" breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Settings" }]} />
      <Card sx={{ maxWidth: 720 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField label="Display name" defaultValue="Sipho Mabaso" />
            <TextField label="Headline" defaultValue="Wits Engineering grad. Calculus specialist." />
            <TextField label="Bio" defaultValue="Helping students lift their maths from 50% to 75%+ since 2020." multiline rows={3} />
            <TextField label="Hourly rate (ZAR)" defaultValue="250" />
            <FormControlLabel control={<Switch defaultChecked />} label="Available for new students" />
            <FormControlLabel control={<Switch defaultChecked />} label="Email me when a session is booked" />
            <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
              Save
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}
