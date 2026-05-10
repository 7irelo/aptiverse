"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { PageHeader } from "@/components/common/PageHeader";
import { PermissionGuard } from "@/components/common/PermissionGuard";

const FLAGS = [
  { id: "f1", reason: "Inappropriate language", target: "Study group: Calculus Crew", reporter: "Mandla T.", excerpt: "Some swearing in chat at 8:42pm.", severity: "low" },
  { id: "f2", reason: "Plagiarised essay", target: "Essay submission #821", reporter: "AI auto-flag", excerpt: "Three paragraphs match a 2022 NSC paper >85%.", severity: "high" },
  { id: "f3", reason: "Tutor advert outside platform", target: "Tutor: Brent O'R.", reporter: "Aisha M.", excerpt: "Mentioned WhatsApp number in profile.", severity: "medium" },
];

export default function ModerationPage() {
  return (
    <PermissionGuard require="content.moderate">
      <PageHeader
        title="Moderation queue"
        description="Reports flagged by users and AI auto-detection."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Moderation" }]}
      />
      <Stack spacing={2}>
        {FLAGS.map((f) => (
          <Card key={f.id}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {f.reason}
                    </Typography>
                    <Chip
                      label={f.severity}
                      size="small"
                      color={f.severity === "high" ? "error" : f.severity === "medium" ? "warning" : "default"}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Target: {f.target} · Reported by {f.reporter}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic", mt: 1, p: 1.5, bgcolor: "action.hover", borderRadius: 1.5 }}>
                    "{f.excerpt}"
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Button variant="contained" color="error">
                    Action
                  </Button>
                  <Button variant="outlined">
                    Open target
                  </Button>
                  <Button variant="text">
                    Dismiss
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PermissionGuard>
  );
}
