"use client";

import { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

// Reusable confirmation prompt for destructive actions. Renders as a
// controlled MUI Dialog. Pair with the useConfirm() hook below for
// inline call-sites that don't want to manage state themselves.

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  // "danger" colours the confirm button red — for irreversible deletes.
  // "primary" is neutral — for "are you sure you want to continue?" flows.
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { p: 1 } } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {tone === "danger" && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(244,67,54,0.15)" : "rgba(244,67,54,0.10)"),
                color: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          )}
          {title}
        </Box>
      </DialogTitle>
      {description && (
        <DialogContent sx={{ pt: 1 }}>
          {typeof description === "string" ? (
            <DialogContentText>{description}</DialogContentText>
          ) : (
            description
          )}
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={tone === "danger" ? "error" : "primary"}
          disabled={loading}
          autoFocus
        >
          {loading ? "Working…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Hook form: useConfirm() returns a {confirm, dialog} pair. Call
// `await confirm({...})` to prompt; render `{dialog}` somewhere stable
// in your component tree.
//
//   const { confirm, dialog } = useConfirm();
//   const handleDelete = async () => {
//     if (!(await confirm({ title: "Remove Mathematics?", description: "Marks logged against it stay." }))) return;
//     await deleteSubject(id);
//   };
//   return <>{button} {dialog}</>;

type ConfirmOptions = Omit<ConfirmDialogProps, "open" | "onConfirm" | "onCancel" | "loading">;

export function useConfirm() {
  const [state, setState] = useState<
    | null
    | (ConfirmOptions & { resolve: (ok: boolean) => void })
  >(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ ...opts, resolve });
      }),
    [],
  );

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };
  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  const dialog = state ? (
    <ConfirmDialog
      {...state}
      open
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  ) : null;

  return { confirm, dialog };
}
