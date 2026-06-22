"use client";

import { forwardRef, useState } from "react";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";

// A TextField that masks its value with a reveal toggle in the trailing
// adornment. Drop-in for the password inputs on /login and /register — it
// forwards react-hook-form's `register()` props (including the ref) through
// to the underlying TextField exactly as a plain TextField would, so form
// wiring is unchanged; only `type` is owned internally.
export const PasswordField = forwardRef<HTMLInputElement, Omit<TextFieldProps, "type">>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);
    const label = visible ? "Hide password" : "Show password";

    return (
      <TextField
        {...props}
        ref={ref}
        type={visible ? "text" : "password"}
        slotProps={{
          ...props.slotProps,
          input: {
            ...props.slotProps?.input,
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={label} disableInteractive>
                  <IconButton
                    aria-label={label}
                    onClick={() => setVisible((v) => !v)}
                    // Keep focus on the input when the icon is clicked, so the
                    // caret position and field focus aren't lost on reveal.
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                    size="small"
                    sx={{ color: "text.secondary" }}
                  >
                    {visible ? (
                      <VisibilityOffOutlined fontSize="small" />
                    ) : (
                      <VisibilityOutlined fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          },
        }}
      />
    );
  },
);
