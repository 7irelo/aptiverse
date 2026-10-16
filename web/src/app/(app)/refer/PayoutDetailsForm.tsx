"use client";

// Payout onboarding: the identity and banking detail a payment record needs.
//
// Deliberately not asked for at signup. A referral code costs nothing and
// should be handed out with no friction at all; an ID number and a bank
// account are a different conversation, and the right moment for it is when
// there is money to claim.

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import { ShieldCheck } from "lucide-react";
import {
  useSavePayoutDetails,
  type AffiliateSummary,
  type PayoutDetailsInput,
} from "@/lib/api/affiliates";

const EMPTY: PayoutDetailsInput = {
  legalFirstName: "",
  legalLastName: "",
  idType: "sa_id",
  idNumber: "",
  taxReferenceNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "South Africa",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  branchCode: "",
  accountType: "cheque",
  contactEmail: "",
  contactPhone: "",
};

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

export function PayoutDetailsForm({ summary }: { summary: AffiliateSummary }) {
  const save = useSavePayoutDetails();
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState<PayoutDetailsInput>(EMPTY);

  const set = <K extends keyof PayoutDetailsInput>(key: K, value: PayoutDetailsInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    save.mutate(form, {
      onSuccess: () =>
        enqueueSnackbar("Thanks. We will review your details shortly.", { variant: "success" }),
      onError: (e: unknown) =>
        enqueueSnackbar(e instanceof Error ? e.message : "Please check the form and try again.", {
          variant: "error",
        }),
    });
  };

  return (
    <Stack spacing={3}>
      {summary.payoutOnboardingStatus === "approved" ? (
        <Alert severity="success" icon={<ShieldCheck size={18} />}>
          Your payout details are confirmed. Anything that clears its hold goes out in the next
          payout run.
        </Alert>
      ) : (
        <Typography variant="body2" color="text.secondary">
          We pay by bank transfer. These details are what the payment record has to carry, so they
          need to be your real legal name and your own account.
        </Typography>
      )}

      <Typography variant="overline" color="text.secondary">
        Who you are
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Legal first name"
            value={form.legalFirstName}
            onChange={(e) => set("legalFirstName", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Legal surname"
            value={form.legalLastName}
            onChange={(e) => set("legalLastName", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            label="Identity document"
            value={form.idType}
            onChange={(e) => set("idType", e.target.value as "sa_id" | "passport")}
          >
            <MenuItem value="sa_id">South African ID</MenuItem>
            <MenuItem value="passport">Passport</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            required
            label={form.idType === "passport" ? "Passport number" : "ID number"}
            value={form.idNumber}
            onChange={(e) => set("idNumber", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Tax reference number"
            helperText="Optional. Leave it blank if you do not have one yet."
            value={form.taxReferenceNumber}
            onChange={(e) => set("taxReferenceNumber", e.target.value)}
          />
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">
        Where you live
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            required
            label="Street address"
            value={form.addressLine1}
            onChange={(e) => set("addressLine1", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Suburb or complex"
            value={form.addressLine2}
            onChange={(e) => set("addressLine2", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField
            fullWidth
            required
            label="City or town"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            label="Province"
            value={form.province}
            onChange={(e) => set("province", e.target.value)}
          >
            {PROVINCES.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            fullWidth
            required
            label="Postal code"
            value={form.postalCode}
            onChange={(e) => set("postalCode", e.target.value)}
          />
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">
        Where the money goes
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Bank"
            value={form.bankName}
            onChange={(e) => set("bankName", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            required
            label="Account holder name"
            value={form.accountHolderName}
            onChange={(e) => set("accountHolderName", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <TextField
            fullWidth
            required
            label="Account number"
            value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            required
            label="Branch code"
            value={form.branchCode}
            onChange={(e) => set("branchCode", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            select
            fullWidth
            label="Account type"
            value={form.accountType}
            onChange={(e) => set("accountType", e.target.value)}
          >
            <MenuItem value="cheque">Cheque</MenuItem>
            <MenuItem value="savings">Savings</MenuItem>
            <MenuItem value="transmission">Transmission</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Typography variant="overline" color="text.secondary">
        How to reach you about a payment
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email"
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Mobile"
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={submit} disabled={save.isPending}>
          {save.isPending ? "Saving" : "Save payout details"}
        </Button>
      </Stack>
    </Stack>
  );
}
