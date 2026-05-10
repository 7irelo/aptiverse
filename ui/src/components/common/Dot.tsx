"use client";

import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";
import { useTheme } from "@mui/material/styles";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 currentColor; opacity: 0.7; }
  70% { box-shadow: 0 0 0 8px transparent; opacity: 0; }
  100% { box-shadow: 0 0 0 0 transparent; opacity: 0; }
`;

export type DotProps = {
  color?: "success" | "error" | "warning" | "info" | "primary" | "secondary";
  size?: number;
  pulsing?: boolean;
};

export function Dot({ color = "success", size = 8, pulsing }: DotProps) {
  const theme = useTheme();
  const c = theme.palette[color].main;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: c,
          color: c,
          ...(pulsing && {
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              animation: `${pulse} 1.6s ease-out infinite`,
            },
          }),
        }}
      />
    </Box>
  );
}
