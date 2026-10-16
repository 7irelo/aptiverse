"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { CONSENT_SUMMARY, setConsent, type ConsentState } from "@/lib/analytics/consent";

// The revocation path. A consent that cannot be withdrawn as easily as it was
// given is not a consent, so this is reachable from the footer on every
// marketing page and from the privacy policy itself.
//
// It shows the CURRENT choice in plain words, then offers the same two
// equally weighted buttons as the banner. There is no toggle to hunt for and
// no Save button to forget to press.

export function ConsentPreferencesDialog({
  open,
  onClose,
  state,
}: {
  open: boolean;
  onClose: () => void;
  state: ConsentState;
}) {
  function decide(marketing: boolean) {
    setConsent(marketing, "preferences");
    onClose();
  }

  const current = state.gpc
    ? "Your browser sends a Global Privacy Control signal, so advertising measurement is off and stays off. Nothing here can override it."
    : state.record
      ? state.record.marketing
        ? `You allowed advertising measurement on ${new Date(state.record.decidedAt).toLocaleDateString("en-ZA")}.`
        : `You turned advertising measurement down on ${new Date(state.record.decidedAt).toLocaleDateString("en-ZA")}.`
      : "You have not made a choice yet, so nothing is loaded.";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="consent-preferences-title"
    >
      <DialogTitle id="consent-preferences-title" sx={{ fontWeight: 700 }}>
        Privacy choices
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {CONSENT_SUMMARY}
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              bgcolor: (t) => alpha(t.palette.secondary.main, 0.12),
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {current}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Cookies that keep you signed in are not affected by this choice. They are needed for
            the service to work at all, so there is nothing to opt in or out of there.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.25 }}>
        <Button
          onClick={() => decide(true)}
          variant="contained"
          color="primary"
          disabled={state.gpc}
          sx={{ flex: 1 }}
        >
          Allow
        </Button>
        <Button
          onClick={() => decide(false)}
          variant="contained"
          color="primary"
          disabled={state.gpc}
          sx={{ flex: 1, ml: "0 !important" }}
        >
          Do not allow
        </Button>
      </DialogActions>
    </Dialog>
  );
}
