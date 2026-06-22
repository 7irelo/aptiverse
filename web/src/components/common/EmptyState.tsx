"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: "compact" | "default";
};

export function EmptyState({ icon, title, description, action, size = "default" }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <Stack
      alignItems="center"
      spacing={1.5}
      sx={{
        textAlign: "center",
        py: size === "compact" ? 4 : 8,
        px: 2,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            mb: 1,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="div">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Stack>
  );
}
