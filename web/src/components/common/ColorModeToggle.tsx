"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import { useColorMode } from "@/providers/ColorModeProvider";

export function ColorModeToggle({ size = "medium" }: { size?: "small" | "medium" | "large" }) {
  const { resolvedMode, toggle } = useColorMode();
  const isDark = resolvedMode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggle}
        size={size}
        aria-label="Toggle colour mode"
        color="inherit"
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
