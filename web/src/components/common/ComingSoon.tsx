"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { GradientBackdrop } from "./GradientBackdrop";

export type ComingSoonProps = {
  title: string;
  description: string;
  bullets?: string[];
  badge?: string;
};

export function ComingSoon({ title, description, bullets, badge = "Preview" }: ComingSoonProps) {
  return (
    <GradientBackdrop variant="soft" sx={{ borderRadius: 3, border: 1, borderColor: "divider" }}>
      <Card sx={{ bgcolor: "transparent", border: 0 }}>
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          <Chip label={badge} color="primary" size="small" sx={{ mb: 2, fontWeight: 600 }} />
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mb: bullets ? 3 : 0 }}>
            {description}
          </Typography>
          {bullets && (
            <Stack spacing={1.5} sx={{ maxWidth: 640 }}>
              {bullets.map((b) => (
                <Stack key={b} direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "brandSurface.main", color: "brandSurface.contrastText", display: "grid", placeItems: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700 }}>
                    ✓
                  </Box>
                  <Typography variant="body1">{b}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </GradientBackdrop>
  );
}
