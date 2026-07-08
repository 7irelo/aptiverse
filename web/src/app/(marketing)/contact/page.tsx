"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { contactSchema, type ContactValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";

const REASONS = [
  { value: "general", label: "General enquiry" },
  { value: "parent", label: "Parent enquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "press", label: "Press" },
];

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", organisation: "", reason: "general", message: "" },
  });

  const mutation = useMutation({
    mutationFn: api.contact,
    onSuccess: () => reset(),
  });

  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 6, md: 12 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              Contact
            </Typography>
            <Typography variant="h1" component="h1">
              Let's talk.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Students, parents, partners and press. Drop us a note and we will be back within one working day.
            </Typography>
          </Stack>
        </Box>
      </GradientBackdrop>

      <Section py={6}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {mutation.isSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thanks! We'll be in touch within 24 hours.
                  </Alert>
                )}
                {mutation.isError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {(mutation.error as Error).message}
                  </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
                  <Stack spacing={2.5}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField fullWidth required label="First name" {...register("firstName")} error={!!errors.firstName} helperText={errors.firstName?.message} />
                      <TextField fullWidth required label="Last name" {...register("lastName")} error={!!errors.lastName} helperText={errors.lastName?.message} />
                    </Stack>
                    <TextField fullWidth required type="email" label="Email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
                    <TextField fullWidth label="Organisation (optional)" {...register("organisation")} />
                    <TextField select fullWidth label="Reason" defaultValue="general" {...register("reason")}>
                      {REASONS.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      fullWidth
                      required
                      label="Message"
                      multiline
                      rows={5}
                      {...register("message")}
                      error={!!errors.message}
                      helperText={errors.message?.message}
                    />
                    <Stack direction="row" justifyContent="flex-end">
                      <Button type="submit" variant="contained" size="large" disabled={!isValid || mutation.isPending}>
                        {mutation.isPending ? "Sending…" : "Send message"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" color="text.secondary">Email us</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>support@aptiverse.co.za</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Questions about your account, a plan, a partnership, or anything else. We reply within one working day.
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Section>
    </>
  );
}
