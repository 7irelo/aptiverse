import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

export const componentOverrides = (theme: Theme): Components<Theme> => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: `${theme.palette.divider} transparent`,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        "&::-webkit-scrollbar": { width: 10, height: 10 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.divider,
          borderRadius: 8,
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme.palette.text.disabled,
        },
      },
      "*::selection": {
        backgroundColor: alpha(theme.palette.primary.main, 0.18),
        color: theme.palette.text.primary,
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: "7px 14px",
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.875rem",
        boxShadow: "none",
      },
      sizeLarge: { padding: "10px 20px", fontSize: "0.9375rem" },
      sizeSmall: { padding: "5px 12px", fontSize: "0.8125rem" },
      contained: {
        boxShadow: "none",
        "&:hover": { boxShadow: "none" },
      },
      containedPrimary: {
        backgroundColor: theme.palette.primary.main,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      },
      outlined: {
        borderColor: theme.palette.divider,
        color: theme.palette.text.primary,
        "&:hover": {
          borderColor: theme.palette.text.secondary,
          backgroundColor: alpha(theme.palette.text.primary, 0.03),
        },
      },
      text: {
        color: theme.palette.text.primary,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: "none",
        boxShadow: "none",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      },
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundImage: "none",
        boxShadow: "none",
      },
      rounded: { borderRadius: 12 },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: "transparent" },
    styleOverrides: {
      root: {
        backdropFilter: "blur(10px)",
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(11, 15, 20, 0.78)"
            : "rgba(255, 255, 255, 0.78)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: "none",
        borderRight: `1px solid ${theme.palette.divider}`,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
      // Always float the label so empty fields look the same as populated
      // ones (matches "Reason / General enquiry" rest state).
      slotProps: { inputLabel: { shrink: true } },
    },
  },
  MuiInputLabel: {
    defaultProps: { shrink: true },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        // Floor on field height — guarantees inputs read at the same
        // weight as the OAuth buttons and primary CTAs sitting next to
        // them, regardless of the always-shrunk label collapsing the
        // intrinsic input height.
        minHeight: 52,
      },
      notchedOutline: {
        borderColor: theme.palette.divider,
      },
      // Bump vertical breathing room past MUI's default 16.5px so the
      // input value renders centered in the taller field.
      input: {
        paddingTop: 16,
        paddingBottom: 16,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
        fontSize: "0.75rem",
        height: 24,
      },
      filled: {
        backgroundColor:
          theme.palette.mode === "dark"
            ? alpha(theme.palette.text.primary, 0.08)
            : theme.palette.grey[100],
        color: theme.palette.text.primary,
      },
      outlined: {
        borderColor: theme.palette.divider,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: "0.75rem",
        borderRadius: 6,
        padding: "5px 8px",
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[100]
            : theme.palette.grey[800],
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 500,
        fontSize: "0.875rem",
        minHeight: 40,
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: { height: 2, borderRadius: 0 },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        "&.Mui-selected": {
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.14)
              : alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
          "&:hover": {
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.primary.main, 0.20)
                : alpha(theme.palette.primary.main, 0.12),
          },
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: { borderRadius: 999, height: 6 },
      bar: { borderRadius: 999 },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: { fontWeight: 500 },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: { borderColor: theme.palette.divider },
    },
  },
});
