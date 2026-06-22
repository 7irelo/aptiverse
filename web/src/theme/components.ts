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
      // Consistent focus ring across every focusable element. Browsers'
      // defaults vary wildly — Chrome's is a thick blue rectangle, Safari's
      // is hairline, Firefox's is dotted. Replace with a calm 2px ring in
      // the primary colour with an offset so it doesn't crowd the element.
      // :focus-visible (not :focus) — only shows for keyboard navigation,
      // not on click.
      "*:focus-visible": {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
        borderRadius: 4,
      },
      // Accessibility floor: anyone with reduced-motion preference set
      // collapses every transition + animation to ~0. We don't enumerate
      // motion per-component; this catches framer-motion, CSS transitions,
      // and MUI's built-in animations in one rule.
      "@media (prefers-reduced-motion: reduce)": {
        "*, *::before, *::after": {
          animationDuration: "0.001ms !important",
          animationIterationCount: "1 !important",
          transitionDuration: "0.001ms !important",
          scrollBehavior: "auto !important",
        },
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
        // Critical: MUI's default contained styles bind color → contrastText
        // via the colour-specific class, but this override REPLACES that
        // selector wholesale, so we must restate the color binding or text
        // falls back to text.primary (near-black) and AA contrast tanks.
        // Was visible as black-on-dark-green for `<Button variant="contained">`.
        color: theme.palette.primary.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
          color: theme.palette.primary.contrastText,
        },
      },
      containedSecondary: {
        backgroundColor: theme.palette.secondary.main,
        color: theme.palette.secondary.contrastText,
        "&:hover": {
          backgroundColor: theme.palette.secondary.dark,
          color: theme.palette.secondary.contrastText,
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
        // Solid surface, no backdrop-filter blur. Glassmorphism reads as
        // dated and adds render cost on lower-end devices — the
        // emil-kowalski rubric bans it outright. The 1px divider plus the
        // sidebar's vertical border do the affordance work instead.
        backgroundColor: theme.palette.background.paper,
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
