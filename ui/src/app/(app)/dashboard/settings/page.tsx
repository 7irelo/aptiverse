"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { PageHeader } from "@/components/common/PageHeader";
import { useColorMode } from "@/providers/ColorModeProvider";

export default function SettingsPage() {
  const { mode, setMode } = useColorMode();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [parentVisibility, setParentVisibility] = useState(true);
  const [diaryEncryption, setDiaryEncryption] = useState(true);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, privacy, notifications, and accessibility."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile
              </Typography>
              <Stack spacing={2}>
                <TextField label="First name" defaultValue="Thandi" fullWidth />
                <TextField label="Last name" defaultValue="Mokoena" fullWidth />
                <TextField label="Email" defaultValue="thandi@example.com" fullWidth />
                <TextField label="School" defaultValue="Crawford College Pretoria" fullWidth />
                <TextField label="Grade" defaultValue="12" fullWidth select>
                  <MenuItem value="11">11</MenuItem>
                  <MenuItem value="12">12</MenuItem>
                </TextField>
                <Button variant="contained" sx={{ alignSelf: "flex-start" }}>
                  Save profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Appearance
              </Typography>
              <TextField select fullWidth label="Theme" value={mode} onChange={(e) => setMode(e.target.value as "light" | "dark" | "system")}>
                <MenuItem value="system">Match system</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </TextField>
              <TextField select fullWidth label="Language" defaultValue="en" sx={{ mt: 2 }}>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="zu">isiZulu</MenuItem>
                <MenuItem value="af">Afrikaans</MenuItem>
                <MenuItem value="xh">isiXhosa</MenuItem>
              </TextField>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notifications
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel control={<Switch checked={emailNotifs} onChange={(e) => setEmailNotifs(e.target.checked)} />} label="Email notifications" />
                <FormControlLabel control={<Switch checked={pushNotifs} onChange={(e) => setPushNotifs(e.target.checked)} />} label="Push notifications" />
                <FormControlLabel control={<Switch defaultChecked />} label="Daily wellbeing check-in reminder" />
                <FormControlLabel control={<Switch defaultChecked />} label="Bursary deadline reminders" />
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Privacy
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel control={<Switch checked={parentVisibility} onChange={(e) => setParentVisibility(e.target.checked)} />} label="Allow parents to see realtime activity" />
                <FormControlLabel control={<Switch checked={diaryEncryption} onChange={(e) => setDiaryEncryption(e.target.checked)} />} label="End-to-end encrypt my diary" />
                <FormControlLabel control={<Switch defaultChecked />} label="Allow my school to verify my goals" />
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={1}>
                <Button variant="outlined">Download my data</Button>
                <Button color="error" variant="outlined">
                  Delete account
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
