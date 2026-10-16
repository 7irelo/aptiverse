import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { brand } from "./palette";

export const componentOverrides = (theme: Theme): Components<Theme> => {
  const isDark = theme.palette.mode === "dark";

  // Boundary of an interactive control (input tray, outlined button). This is
  // deliberately stronger than `divider`, which is a decorative hairline: a
  // control that cannot be located is a usability failure, and the divider
  // alpha was invisible on the near-black canvas.
  const controlBorder = isDark
    ? alpha(theme.palette.common.white, 0.28)
    : alpha(theme.palette.text.primary, 0.28);
  const controlBorderHover = isDark
    ? alpha(theme.palette.common.white, 0.44)
    : alpha(theme.palette.text.primary, 0.46);

  // Warm, low-slung elevation. Cards sit on a soft shadow plus a hairline
  // border instead of the old flat divider-only look, so surfaces read as
  // layered rather than printed.
  const cardShadow = isDark
    ? "0 1px 2px rgba(0,0,0,0.40), 0 16px 32px -22px rgba(0,0,0,0.70)"
    : "0 1px 2px rgba(20,40,34,0.05), 0 14px 30px -20px rgba(8,68,56,0.28)";
  const cardShadowHover = isDark
    ? "0 1px 2px rgba(0,0,0,0.45), 0 22px 42px -22px rgba(0,0,0,0.80)"
    : "0 2px 4px rgba(20,40,34,0.06), 0 20px 40px -22px rgba(8,68,56,0.34)";

  // Focus halo: a soft 3px ring in the accent colour instead of a hard
  // rectangle. Recolours to the error hue on invalid fields.
  const focusRing = `0 0 0 3px ${alpha(theme.palette.primary.main, isDark ? 0.35 : 0.2)}`;
  const errorRing = `0 0 0 3px ${alpha(theme.palette.error.main, isDark ? 0.4 : 0.22)}`;

  return {
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
        // Keyboard focus only (:focus-visible). Buttons and inputs get the
        // softer halo ring defined per-component; this is the calm fallback
        // for everything else.
        "*:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
          borderRadius: 4,
        },
        // Accessibility floor: reduced-motion preference collapses every
        // transition and animation. Catches framer-motion, CSS transitions,
        // and MUI animations in one rule.
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
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 16px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          boxShadow: "none",
          transition:
            "background-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
          "&:focus-visible": { outline: "none", boxShadow: focusRing },
        },
        sizeLarge: { padding: "11px 22px", fontSize: "0.9375rem" },
        sizeSmall: { padding: "6px 12px", fontSize: "0.8125rem" },
        contained: {
          boxShadow: cardShadow,
          // No translateY lift on hover. A button that jumps under the cursor
          // is a fidget, not feedback: it moves the target you are already
          // aiming at, and on a touch device it never fires at all, so it is
          // decoration for mouse users only. The shadow lift alone says
          // "raised" without shifting the hit area. Text buttons never moved,
          // and matching them keeps every button in the app behaving the same.
          "&:hover": { boxShadow: cardShadowHover },
        },
        containedPrimary: {
          // Use the stable graphite brand surface, NOT primary.main. In dark
          // mode primary.main is near-white (so links/accents read on black),
          // which would turn every default CTA into a near-white button with
          // colliding text. brandSurface stays dark graphite with light text in
          // both modes, so the primary button is always a solid graphite CTA.
          backgroundColor: theme.palette.brandSurface.main,
          color: theme.palette.brandSurface.contrastText,
          "&:hover": {
            backgroundColor: isDark
              ? theme.palette.brandSurface.light
              : theme.palette.brandSurface.dark,
            color: theme.palette.brandSurface.contrastText,
          },
          // Disabled has to be stated here. The backgroundColor and color above
          // are flat declarations on the variant class, so they beat MUI's own
          // .Mui-disabled rule on source order and a disabled button kept the
          // full graphite surface. It looked exactly like a live one, which is
          // why "Signing in" appeared to leave the button clickable: it was
          // already disabled, it just had no way to say so.
          "&.Mui-disabled": {
            backgroundColor: theme.palette.brandSurface.main,
            color: theme.palette.brandSurface.contrastText,
            opacity: 0.45,
            boxShadow: "none",
          },
        },
        containedSecondary: {
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          "&:hover": {
            // citron[500], not secondary.dark. In light mode secondary.dark is
            // the deep citron kept legal for text, and graphite ink on it would
            // be dark-on-dark. The hover fill has to stay a citron SURFACE.
            backgroundColor: brand.citron[500],
            color: theme.palette.secondary.contrastText,
          },
          // Same reason as containedPrimary: the flat fill above would
          // otherwise survive into the disabled state.
          "&.Mui-disabled": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
            opacity: 0.45,
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: controlBorder,
          color: theme.palette.text.primary,
          "&:hover": {
            borderColor: controlBorderHover,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
          },
        },
        // MUI's default outlined+secondary paints BOTH the label and the border
        // in secondary.main. With citron that is 1.4:1 on light paper, so the
        // whole button disappeared. Citron stays surface-only: the label keeps
        // full-contrast ink, the citron identity is carried by the border
        // (secondary.dark, legal in both modes) and a citron wash on hover.
        outlinedSecondary: {
          color: theme.palette.text.primary,
          borderColor: theme.palette.secondary.dark,
          "&:hover": {
            color: theme.palette.text.primary,
            borderColor: theme.palette.secondary.dark,
            backgroundColor: alpha(theme.palette.secondary.main, isDark ? 0.16 : 0.22),
          },
        },
        textSecondary: {
          color: theme.palette.text.primary,
          "&:hover": {
            backgroundColor: alpha(theme.palette.secondary.main, isDark ? 0.16 : 0.22),
          },
        },
        text: { color: theme.palette.text.primary },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&:focus-visible": { outline: "none", boxShadow: focusRing },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: "none",
          boxShadow: cardShadow,
          transition:
            "border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease",
        },
      },
    },
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          "&:focus-visible": { outline: "none", boxShadow: focusRing },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 14 },
        outlined: { border: `1px solid ${theme.palette.divider}` },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "transparent" },
      styleOverrides: {
        root: {
          // Solid surface, no backdrop blur. The hairline divider plus the
          // sidebar's vertical border carry the affordance.
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
        slotProps: { inputLabel: { shrink: true } },
      },
    },
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        // The label leaves the outline notch entirely and sits ABOVE the
        // field, in normal flow, as a small weighted caption. This is the
        // single biggest move away from the stock Material "floating label in
        // a notch" look, and it lets the field's top border stay solid.
        root: {
          position: "static",
          transform: "none",
          transformOrigin: "top left",
          maxWidth: "100%",
          fontSize: "0.78rem",
          fontWeight: 600,
          lineHeight: 1.4,
          letterSpacing: "0.005em",
          color: theme.palette.text.secondary,
          marginBottom: 7,
          "&.Mui-focused": { color: theme.palette.text.primary },
          "&.Mui-error": { color: theme.palette.error.main },
          "&.Mui-disabled": { color: theme.palette.text.disabled },
        },
        outlined: {
          position: "static",
          transform: "none",
          "&.MuiInputLabel-shrink": {
            backgroundColor: "transparent",
            paddingLeft: 0,
            paddingRight: 0,
            transform: "none",
          },
        },
      },
    },
    MuiOutlinedInput: {
      // Label lives above the field now, so the outline never notches.
      defaultProps: { notched: false },
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 48,
          // A solid, clearly-elevated tray — the same read as the dropdown
          // menus — so a field is an object on the surface, not a hollow
          // outline that vanishes in dark mode. Keeps its fill on focus; the
          // accent ring and a brighter border add the state on top.
          backgroundColor: isDark
            ? alpha(theme.palette.common.white, 0.06)
            : alpha(theme.palette.brandSurface.main, 0.025),
          transition:
            "box-shadow 140ms ease, border-color 140ms ease, background-color 140ms ease",
          "&:hover": {
            backgroundColor: isDark
              ? alpha(theme.palette.common.white, 0.09)
              : alpha(theme.palette.brandSurface.main, 0.05),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: controlBorderHover,
          },
          "&.Mui-focused": {
            boxShadow: focusRing,
            backgroundColor: isDark
              ? alpha(theme.palette.common.white, 0.06)
              : alpha(theme.palette.brandSurface.main, 0.025),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 1.5,
          },
          "&.Mui-error.Mui-focused": { boxShadow: errorRing },
          "&.Mui-disabled": { backgroundColor: "transparent" },
        },
        notchedOutline: {
          // A visible hairline so the tray has a crisp edge in both modes. This
          // is a control boundary, so it uses the stronger alpha rather than
          // `divider`, which was too faint to locate a field on either canvas.
          borderColor: controlBorder,
          transition: "border-color 140ms ease",
          // No label riding the border → collapse any residual notch legend.
          "& legend": { width: 0 },
        },
        input: {
          paddingTop: 13,
          paddingBottom: 13,
          // Placeholders are content, not disabled text, so they take the
          // secondary text token. text.disabled sat at 1.5:1 on light paper,
          // which made every placeholder unreadable.
          "&::placeholder": { color: theme.palette.text.secondary, opacity: 1 },
        },
      },
    },
    MuiFilledInput: {
      // Bring the filled variant in line with the outlined tray: rounded, no
      // underline, same soft fill + focus ring, so every text input reads as
      // the same family regardless of which variant a page reached for.
      defaultProps: { disableUnderline: true },
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: isDark
            ? alpha(theme.palette.common.white, 0.06)
            : alpha(theme.palette.brandSurface.main, 0.03),
          transition: "box-shadow 140ms ease, background-color 140ms ease",
          "&:hover": {
            backgroundColor: isDark
              ? alpha(theme.palette.common.white, 0.09)
              : alpha(theme.palette.brandSurface.main, 0.05),
          },
          "&.Mui-focused": {
            backgroundColor: isDark
              ? alpha(theme.palette.common.white, 0.06)
              : alpha(theme.palette.brandSurface.main, 0.03),
            boxShadow: focusRing,
          },
          "&::before, &::after": { display: "none" },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          marginTop: 6,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: cardShadowHover,
          backgroundImage: "none",
        },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: "0.9rem",
          paddingTop: 8,
          paddingBottom: 8,
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.secondary.main, isDark ? 0.2 : 0.14),
            "&:hover": {
              backgroundColor: alpha(theme.palette.secondary.main, isDark ? 0.26 : 0.2),
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
          height: 26,
        },
        filled: {
          backgroundColor: isDark
            ? alpha(theme.palette.text.primary, 0.08)
            : theme.palette.grey[100],
          color: theme.palette.text.primary,
        },
        outlined: { borderColor: controlBorder },
        // Same surface-only rule as the outlined button: a citron label on a
        // citron hairline was unreadable in light mode.
        outlinedSecondary: {
          color: theme.palette.text.primary,
          borderColor: theme.palette.secondary.dark,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "0.75rem",
          borderRadius: 8,
          padding: "6px 10px",
          backgroundColor: isDark ? theme.palette.grey[100] : theme.palette.grey[800],
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          minHeight: 40,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2, borderRadius: 999 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: isDark
              ? alpha(theme.palette.primary.main, 0.16)
              : alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
            "&:hover": {
              backgroundColor: isDark
                ? alpha(theme.palette.primary.main, 0.22)
                : alpha(theme.palette.primary.main, 0.14),
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, height: 8 },
        bar: { borderRadius: 999 },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: theme.palette.divider },
      },
    },
  };
};
