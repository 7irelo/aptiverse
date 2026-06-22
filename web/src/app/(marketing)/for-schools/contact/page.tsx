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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import HandshakeIcon from "@mui/icons-material/HandshakeOutlined";
import { GradientBackdrop } from "@/components/common/GradientBackdrop";
import { Section } from "@/components/common/Section";
import { schoolEnquirySchema, type SchoolEnquiryValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";

const ROLES = [
  "Principal",
  "Deputy / Head of School",
  "Head of Academics",
  "Head of Department",
  "IT Lead",
  "Bursar",
  "Other",
];

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const CURRICULA = [
  { value: "nsc", label: "NSC (CAPS)" },
  { value: "ieb", label: "IEB" },
  { value: "cambridge", label: "Cambridge International (CIE)" },
];

const LEARNER_BANDS = [
  { value: "10-49", label: "10 – 49 FET learners" },
  { value: "50-149", label: "50 – 149 FET learners" },
  { value: "150-499", label: "150 – 499 FET learners" },
  { value: "500-999", label: "500 – 999 FET learners" },
  { value: "1000+", label: "1 000+ FET learners" },
];

const STAGES = [
  { value: "exploring", label: "Just exploring" },
  { value: "demo", label: "Would like a demo" },
  { value: "pilot", label: "Ready to run a pilot" },
  { value: "ready", label: "Ready to commit" },
];

export default function Page() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<SchoolEnquiryValues>({
    resolver: zodResolver(schoolEnquirySchema),
    mode: "onTouched",
    defaultValues: {
      schoolName: "",
      contactName: "",
      contactRole: "",
      email: "",
      phone: "",
      province: "",
      city: "",
      curricula: [],
      learnerCount: "",
      stage: "exploring",
      notes: "",
    },
  });

  const curricula = watch("curricula") ?? [];

  const toggleCurriculum = (value: string) => {
    const current = new Set(curricula);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    setValue("curricula", Array.from(current), { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: api.schoolEnquiry,
    onSuccess: () => reset(),
  });

  return (
    <>
      <GradientBackdrop variant="soft">
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2.5, sm: 4, lg: 6 }, py: { xs: 8, md: 10 } }}>
          <Stack spacing={2} sx={{ maxWidth: 760 }}>
            <Typography variant="overline" color="primary.main">
              For schools
            </Typography>
            <Typography variant="h1" component="h1">
              Talk to us about bringing Aptiverse to your school.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Schools onboard with a dedicated success manager — fill this in and we'll be back
              within one working day with pricing, a demo slot, and the few documents we'll need
              from your side.
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
                  <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3 }}>
                    Thanks — we'll be in touch within one working day from schools@aptiverse.co.za.
                  </Alert>
                )}
                {mutation.isError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {(mutation.error as Error).message ?? "Something went wrong. Try again in a minute."}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
                  <Stack spacing={3}>
                    <Stack spacing={2}>
                      <Typography variant="overline" color="text.secondary">
                        Your school
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        label="School name"
                        {...register("schoolName")}
                        error={!!errors.schoolName}
                        helperText={errors.schoolName?.message}
                      />
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          select
                          fullWidth
                          label="Province"
                          defaultValue=""
                          {...register("province")}
                        >
                          <MenuItem value="">—</MenuItem>
                          {PROVINCES.map((p) => (
                            <MenuItem key={p} value={p}>
                              {p}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField fullWidth label="Town / city" {...register("city")} />
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                      <Typography variant="overline" color="text.secondary">
                        About the school
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        label="FET learner count (Grades 10–12)"
                        defaultValue=""
                        {...register("learnerCount")}
                      >
                        <MenuItem value="">—</MenuItem>
                        {LEARNER_BANDS.map((b) => (
                          <MenuItem key={b.value} value={b.value}>
                            {b.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Curriculum (pick all that apply)
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                          {CURRICULA.map((c) => (
                            <FormControlLabel
                              key={c.value}
                              control={
                                <Checkbox
                                  checked={curricula.includes(c.value)}
                                  onChange={() => toggleCurriculum(c.value)}
                                />
                              }
                              label={c.label}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                      <Typography variant="overline" color="text.secondary">
                        Who's filling this in
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          fullWidth
                          required
                          label="Your full name"
                          {...register("contactName")}
                          error={!!errors.contactName}
                          helperText={errors.contactName?.message}
                        />
                        <TextField
                          select
                          fullWidth
                          label="Role at school"
                          defaultValue=""
                          {...register("contactRole")}
                        >
                          <MenuItem value="">—</MenuItem>
                          {ROLES.map((r) => (
                            <MenuItem key={r} value={r}>
                              {r}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                          fullWidth
                          required
                          type="email"
                          label="Email"
                          {...register("email")}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                        />
                        <TextField fullWidth label="Phone (optional)" {...register("phone")} />
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack spacing={2}>
                      <Typography variant="overline" color="text.secondary">
                        Where you are in the process
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        label="Stage"
                        defaultValue="exploring"
                        {...register("stage")}
                      >
                        {STAGES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        fullWidth
                        label="Anything we should know (optional)"
                        multiline
                        rows={4}
                        placeholder="Anything specific you're hoping Aptiverse will help with — wellbeing, SBA tracking, university readiness, bursary navigation, etc."
                        {...register("notes")}
                      />
                    </Stack>

                    <Stack direction="row" justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={!isValid || mutation.isPending}
                      >
                        {mutation.isPending ? "Sending…" : "Send enquiry"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3} sx={{ position: { md: "sticky" }, top: { md: 96 } }}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <ScheduleIcon sx={{ color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      What happens next
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    <NextStep n={1} title="Within 24 hours" body="Email reply from our schools team with availability for a 30-min discovery call." />
                    <NextStep n={2} title="Within the week" body="Live demo for you (and anyone else who needs to be in the room)." />
                    <NextStep n={3} title="Within 2 weeks" body="Pilot scoped, data-handling agreement signed, SchoolAdmin seat created. Teachers invited from inside the dashboard." />
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <HandshakeIcon sx={{ color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Or just email us
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    If you'd rather skip the form, write to
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }}>schools@aptiverse.co.za</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                    POPIA compliant. Data residency in SA. We never share your enquiry with funders or
                    third parties without explicit consent.
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

function NextStep({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {n}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
      </Box>
    </Stack>
  );
}
