"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  href?: string;
  // Kept for API compatibility — visual treatment is now uniform.
  accent?: "primary" | "secondary" | "success" | "warning" | "info";
  badge?: string;
};

export function FeatureCard({
  icon,
  title,
  description,
  href,
  badge,
}: FeatureCardProps) {
  const theme = useTheme();
  const accent = theme.palette.primary.main;

  const inner = (
    <CardContent sx={{ p: 3, height: "100%" }}>
      <Stack spacing={2.25} sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box
            className="feature-icon"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.text.primary, 0.04),
              color: "text.secondary",
              border: 1,
              borderColor: "divider",
              transition: "color 150ms, background-color 150ms, border-color 150ms",
              "& > svg": { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
          {badge && (
            <Typography
              variant="caption"
              sx={{
                px: 0.875,
                py: 0.25,
                borderRadius: 0.75,
                border: 1,
                borderColor: "divider",
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              {badge}
            </Typography>
          )}
        </Stack>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, letterSpacing: "-0.01em" }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {description}
        </Typography>
        {href && (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            className="feature-cta"
            sx={{
              color: "text.secondary",
              fontSize: "0.8125rem",
              fontWeight: 500,
              transition: "color 150ms, transform 150ms",
              "& > svg": { fontSize: 14 },
            }}
          >
            <span>Learn more</span>
            <ArrowRight size={14} />
          </Stack>
        )}
      </Stack>
    </CardContent>
  );

  if (href) {
    return (
      <Card
        component={Link}
        href={href}
        sx={{
          height: "100%",
          display: "block",
          textDecoration: "none",
          color: "inherit",
          transition: "border-color 150ms, background-color 150ms",
          "&:hover": {
            borderColor: alpha(accent, 0.5),
            backgroundColor: alpha(accent, 0.02),
          },
          "&:hover .feature-icon": {
            color: accent,
            borderColor: alpha(accent, 0.3),
            backgroundColor: alpha(accent, 0.08),
          },
          "&:hover .feature-cta": {
            color: accent,
            transform: "translateX(2px)",
          },
        }}
      >
        {inner}
      </Card>
    );
  }

  return <Card sx={{ height: "100%" }}>{inner}</Card>;
}
