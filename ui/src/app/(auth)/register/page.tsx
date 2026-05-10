"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SchoolIcon from "@mui/icons-material/School";
import FavoriteIcon from "@mui/icons-material/FavoriteBorder";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { useRoleStore, type Role } from "@/providers/RoleProvider";
import { registerStep2Schema, type RegisterValues } from "@/lib/schemas";
import { api } from "@/lib/api/client";

const ROLE_OPTIONS: { value: Role; label: string; description: string; icon: React.ReactNode }[] = [
  { value: "student", label: "Student", description: "I'm in Grade 11 or 12", icon: <SchoolIcon /> },
  { value: "parent", label: "Parent", description: "Supporting my child", icon: <FavoriteIcon /> },
  { value: "teacher", label: "Teacher", description: "I teach in a school", icon: <GroupsIcon /> },
  { value: "school_admin", label: "School Admin", description: "School leadership", icon: <AdminPanelSettingsIcon /> },
  { value: "tutor", label: "Tutor", description: "Independent educator", icon: <StorefrontIcon /> },
];

const STEPS = ["Choose role", "Your details", "Confirm"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const setRole = useRoleStore((s) => s.setRole);
  const role = useRoleStore((s) => s.role);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
    trigger,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerStep2Schema),
    mode: "onTouched",
    defaultValues: { firstName: "", lastName: "", email: "", password: "", school: "", grade: "" },
  });

  const mutation = useMutation({
    mutationFn: api.register,
    onSuccess: () => setTimeout(() => router.push("/dashboard"), 800),
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="overline" color="primary.main">
          Create account · Step {step + 1} of {STEPS.length}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mt: 0.5 }}>
          {STEPS[step]}
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={((step + 1) / STEPS.length) * 100} />

      {step === 0 && (
        <>
          <Grid container spacing={2}>
            {ROLE_OPTIONS.map((r) => (
              <Grid key={r.value} size={{ xs: 12, sm: 6 }}>
                <Card sx={{ borderColor: role === r.value ? "primary.main" : "divider", borderWidth: role === r.value ? 2 : 1 }}>
                  <CardActionArea
                    onClick={() => {
                      setRole(r.value);
                      setStep(1);
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: "grid", placeItems: "center", bgcolor: "action.hover", color: "primary.main" }}>
                          {r.icon}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {r.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {r.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Already on Aptiverse?{" "}
            <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
              Sign in
            </Link>
          </Typography>
        </>
      )}

      {step === 1 && (
        <>
          <OAuthButtons />
          <Box
            component="form"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await trigger();
              if (ok) setStep(2);
            }}
          >
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField fullWidth required label="First name" {...register("firstName")} error={!!errors.firstName} helperText={errors.firstName?.message} />
                <TextField fullWidth required label="Last name" {...register("lastName")} error={!!errors.lastName} helperText={errors.lastName?.message} />
              </Stack>
              <TextField required fullWidth label="Email" type="email" autoComplete="email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
              <TextField
                required
                fullWidth
                label="Password"
                type="password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message ?? "At least 8 chars, one uppercase, one number"}
              />
              {role === "student" && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField fullWidth label="School" {...register("school")} />
                  <TextField fullWidth label="Grade" placeholder="11 or 12" {...register("grade")} />
                </Stack>
              )}
              <Stack direction="row" spacing={1.5} justifyContent="space-between">
                <Button onClick={() => setStep(0)} variant="text">
                  Back
                </Button>
                <Button type="submit" variant="contained" size="large" disabled={!isValid}>
                  Continue
                </Button>
              </Stack>
            </Stack>
          </Box>
        </>
      )}

      {step === 2 && (
        <>
          {mutation.isSuccess ? (
            <Alert severity="success">Account created. Redirecting…</Alert>
          ) : (
            <Stack spacing={2}>
              {mutation.isError && <Alert severity="error">{(mutation.error as Error).message}</Alert>}
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Typography variant="overline" color="text.secondary">
                      Review
                    </Typography>
                    <Typography>
                      <strong>Role:</strong> {ROLE_OPTIONS.find((r) => r.value === role)?.label}
                    </Typography>
                    <Typography>
                      <strong>Name:</strong> {getValues("firstName")} {getValues("lastName")}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {getValues("email")}
                    </Typography>
                    {role === "student" && (
                      <>
                        <Typography>
                          <strong>School:</strong> {getValues("school") || "—"}
                        </Typography>
                        <Typography>
                          <strong>Grade:</strong> {getValues("grade") || "—"}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
              <Typography variant="caption" color="text.secondary">
                By continuing you agree to our Terms and Privacy Policy. We'll send a verification email to your address.
              </Typography>
              <Stack direction="row" spacing={1.5} justifyContent="space-between">
                <Button onClick={() => setStep(1)} variant="text">
                  Back
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  disabled={mutation.isPending}
                  onClick={handleSubmit((v) => mutation.mutate({ ...v, role }))}
                >
                  {mutation.isPending ? "Creating…" : "Create account"}
                </Button>
              </Stack>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
