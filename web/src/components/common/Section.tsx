"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export type SectionProps = {
  eyebrow?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  actions?: React.ReactNode;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
  containerSx?: SxProps<Theme>;
  py?: number;
  bg?: "default" | "paper" | "muted";
};

export function Section({
  eyebrow,
  title,
  subtitle,
  align = "left",
  actions,
  children,
  sx,
  containerSx,
  py = 10,
  bg = "default",
}: SectionProps) {
  const bgcolor =
    bg === "paper" ? "background.paper" : bg === "muted" ? "action.hover" : "transparent";

  return (
    <Box component="section" sx={{ py: { xs: py * 0.5, md: py }, bgcolor, ...sx }}>
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2.5, sm: 4, lg: 6 },
          ...containerSx,
        }}
      >
        {(eyebrow || title || subtitle) && (
          <Stack
            spacing={1.5}
            alignItems={align === "center" ? "center" : "flex-start"}
            sx={{
              textAlign: align,
              mb: { xs: 4, md: 6 },
              maxWidth: align === "center" ? 760 : "none",
              mx: align === "center" ? "auto" : 0,
            }}
          >
            {eyebrow && (
              <Typography
                variant="overline"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                {eyebrow}
              </Typography>
            )}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", md: "flex-end" }}
              justifyContent="space-between"
              sx={{ width: "100%" }}
            >
              {title && (
                <Typography
                  variant="h3"
                  component="h2"
                  sx={{ flex: 1, letterSpacing: "-0.02em" }}
                >
                  {title}
                </Typography>
              )}
              {actions && <Box>{actions}</Box>}
            </Stack>
            {subtitle && (
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
        )}
        {children}
      </Box>
    </Box>
  );
}
