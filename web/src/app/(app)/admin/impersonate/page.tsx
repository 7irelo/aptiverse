"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";

export default function ImpersonatePage() {
  return (
    <PermissionGuard require="users.impersonate">
      <PageHeader
        title="Impersonate user"
        description="See the platform exactly as the user does. Sessions are time-boxed and audited."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Impersonate" }]}
      />
      <Card sx={{ maxWidth: 640 }}>
        <CardContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Impersonation is logged in the audit trail and visible to the user via email after the session ends.
          </Alert>
          <Stack spacing={2}>
            <TextField fullWidth label="User ID or email" placeholder="thandi@example.com" />
            <TextField fullWidth label="Reason (audit log)" placeholder="Customer support ticket #1842" multiline rows={2} />
            <TextField fullWidth select label="Session length" defaultValue="30">
              {[15, 30, 60].map((m) => (
                <option key={m} value={m}>{m} minutes</option>
              ))}
            </TextField>
            <Button variant="contained" color="warning">
              Start impersonation session
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PermissionGuard>
  );
}
