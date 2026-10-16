"use client";

import { useEffect, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedIcon from "@mui/icons-material/VerifiedOutlined";
import { useSnackbar } from "notistack";
import { PageHeader } from "@/components/common/PageHeader";
import { EditWithTabs, type EditTab } from "@/components/common/EditWithTabs";
import {
  useTutorProfile,
  useUpdateTutorProfile,
  useChangePassword,
} from "@/lib/api/queries";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 - 23:00
const SUBJECT_OPTIONS = [
  "Mathematics",
  "Mathematical Literacy",
  "Physical Sciences",
  "Life Sciences",
  "English HL",
  "Accounting",
  "Geography",
  "History",
  "Economics",
  "Business Studies",
];

export default function TutorSettings() {
  const tabs: EditTab[] = [
    { key: "profile", label: "Profile", icon: <PersonOutlineIcon />, content: <ProfileTab /> },
    {
      key: "availability",
      label: "Availability",
      icon: <ScheduleOutlinedIcon />,
      content: <AvailabilityTab />,
    },
    { key: "subjects", label: "Subjects", icon: <MenuBookOutlinedIcon />, content: <SubjectsTab /> },
    {
      key: "notifications",
      label: "Notifications",
      icon: <NotificationsNoneOutlinedIcon />,
      content: <NotificationsTab />,
    },
    { key: "security", label: "Security", icon: <LockOutlinedIcon />, content: <SecurityTab /> },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Profile, availability, subjects, notifications and security."
        breadcrumbs={[{ label: "Tutor", href: "/tutor" }, { label: "Settings" }]}
      />
      <EditWithTabs tabs={tabs} defaultTab="profile" />
    </>
  );
}

function TabLoading() {
  return (
    <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={24} />
    </Box>
  );
}

const TUTOR_KINDS: { value: "university_student" | "graduate" | "completed_matric"; label: string }[] = [
  { value: "university_student", label: "University student" },
  { value: "graduate", label: "Graduate" },
  { value: "completed_matric", label: "Completed matric" },
];

function ProfileTab() {
  const profileQuery = useTutorProfile();
  const update = useUpdateTutorProfile();
  const { enqueueSnackbar } = useSnackbar();

  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [tutorKind, setTutorKind] =
    useState<"university_student" | "graduate" | "completed_matric">("university_student");
  const [institution, setInstitution] = useState("");
  const [studyingToward, setStudyingToward] = useState("");
  const [matricYear, setMatricYear] = useState("");

  // Depend on the primitive server values, not the query-object reference, so a
  // background refetch or a setQueryData from any save does not re-run this and
  // clobber the tutor's unsaved edits.
  const p = profileQuery.data;
  const hasProfile = p != null;
  useEffect(() => {
    if (!p) return;
    setQualification(p.qualification);
    setSpecialization(p.specialization);
    setBio(p.bio);
    setTeachingStyle(p.teachingStyle);
    setYearsOfExperience(p.yearsOfExperience ? String(p.yearsOfExperience) : "");
    setTutorKind(p.tutorKind ?? "university_student");
    setInstitution(p.institution ?? "");
    setStudyingToward(p.studyingToward ?? "");
    setMatricYear(p.matricYear ? String(p.matricYear) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasProfile,
    p?.qualification,
    p?.specialization,
    p?.bio,
    p?.teachingStyle,
    p?.yearsOfExperience,
    p?.tutorKind,
    p?.institution,
    p?.studyingToward,
    p?.matricYear,
  ]);

  const save = async () => {
    try {
      const parsedYear = matricYear.trim() ? parseInt(matricYear, 10) : NaN;
      await update.mutateAsync({
        qualification: qualification.trim(),
        specialization: specialization.trim(),
        bio: bio.trim(),
        teachingStyle: teachingStyle.trim(),
        yearsOfExperience: yearsOfExperience.trim()
          ? Math.max(0, parseInt(yearsOfExperience, 10) || 0)
          : 0,
        tutorKind,
        institution: institution.trim(),
        studyingToward: studyingToward.trim(),
        matricYear: Number.isFinite(parsedYear) ? parsedYear : null,
      });
      enqueueSnackbar("Profile saved.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save your profile${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  if (profileQuery.isLoading) return <TabLoading />;

  const connects = profileQuery.data?.connects;

  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      {connects !== undefined && (
        <Box
          sx={(t) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${t.palette.divider}`,
            bgcolor: "action.hover",
          })}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Connects balance
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Connects are spent when you propose on a listing. They top up monthly.
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {connects}
          </Typography>
        </Box>
      )}
      <TextField
        select
        label="I am a"
        value={tutorKind}
        onChange={(e) =>
          setTutorKind(e.target.value as "university_student" | "graduate" | "completed_matric")
        }
        fullWidth
        helperText="How you present yourself to students and parents."
      >
        {TUTOR_KINDS.map((k) => (
          <MenuItem key={k.value} value={k.value}>
            {k.label}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Institution"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          fullWidth
          placeholder="e.g. University of Cape Town"
        />
        <TextField
          label="Matric year"
          type="number"
          value={matricYear}
          onChange={(e) => setMatricYear(e.target.value)}
          sx={{ maxWidth: { sm: 180 } }}
          placeholder="e.g. 2021"
          slotProps={{ htmlInput: { min: 1980, max: 2100 } }}
        />
      </Stack>
      <TextField
        label="Studying toward"
        value={studyingToward}
        onChange={(e) => setStudyingToward(e.target.value)}
        fullWidth
        placeholder="e.g. BSc Computer Science"
        helperText="Your degree or programme, if you are studying."
      />
      <TextField
        label="Qualification"
        value={qualification}
        onChange={(e) => setQualification(e.target.value)}
        fullWidth
        placeholder="e.g. BSc Engineering, Wits"
      />
      <TextField
        label="Specialization"
        value={specialization}
        onChange={(e) => setSpecialization(e.target.value)}
        fullWidth
        placeholder="e.g. Calculus, Physical Sciences"
        helperText="What you focus on. Students filter by this."
      />
      <TextField
        label="Years of experience"
        type="number"
        value={yearsOfExperience}
        onChange={(e) => setYearsOfExperience(e.target.value)}
        sx={{ maxWidth: 220 }}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      <TextField
        label="Teaching style"
        value={teachingStyle}
        onChange={(e) => setTeachingStyle(e.target.value)}
        fullWidth
        placeholder="e.g. Patient, past-paper focused"
      />
      <TextField
        label="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        multiline
        rows={3}
        fullWidth
        placeholder="A short introduction students will read."
      />
      <Box>
        <Button variant="contained" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save profile"}
        </Button>
      </Box>
    </Stack>
  );
}

function AvailabilityTab() {
  const profileQuery = useTutorProfile();
  const update = useUpdateTutorProfile();
  const { enqueueSnackbar } = useSnackbar();

  const [accepting, setAccepting] = useState(true);
  const [days, setDays] = useState<Set<string>>(new Set(["Mon", "Tue", "Wed", "Thu", "Fri"]));
  const [earliest, setEarliest] = useState(15);
  const [latest, setLatest] = useState(20);

  // Depend on the primitive server values, not the query-object reference, so a
  // background refetch or a setQueryData from any save does not re-run this and
  // clobber the tutor's in-progress day toggles.
  const hasProfile = profileQuery.data != null;
  const serverAccepting = profileQuery.data?.acceptingStudents ?? true;
  const serverAvailableDays = profileQuery.data?.availableDays ?? "";
  const serverEarliest = profileQuery.data?.earliestHour ?? 15;
  const serverLatest = profileQuery.data?.latestHour ?? 20;
  useEffect(() => {
    if (!hasProfile) return;
    setAccepting(serverAccepting);
    setDays(new Set(serverAvailableDays.split(",").map((d) => d.trim()).filter(Boolean)));
    setEarliest(serverEarliest);
    setLatest(serverLatest);
  }, [hasProfile, serverAccepting, serverAvailableDays, serverEarliest, serverLatest]);

  const toggleDay = (d: string) =>
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });

  const save = async () => {
    try {
      await update.mutateAsync({
        acceptingStudents: accepting,
        availableDays: DAYS.filter((d) => days.has(d)).join(","),
        earliestHour: earliest,
        latestHour: latest,
      });
      enqueueSnackbar("Availability saved.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save availability${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  if (profileQuery.isLoading) return <TabLoading />;

  return (
    <Stack spacing={2} sx={{ maxWidth: 640 }}>
      <FormControlLabel
        control={<Switch checked={accepting} onChange={(e) => setAccepting(e.target.checked)} />}
        label="Available for new students"
      />
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Open days
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {DAYS.map((d) => {
          const on = days.has(d);
          return (
            <Chip
              key={d}
              label={d}
              clickable
              onClick={() => toggleDay(d)}
              color={on ? "primary" : "default"}
              variant={on ? "filled" : "outlined"}
            />
          );
        })}
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          select
          fullWidth
          label="Earliest"
          value={earliest}
          onChange={(e) => setEarliest(Number(e.target.value))}
        >
          {HOURS.map((h) => (
            <MenuItem key={h} value={h}>
              {h.toString().padStart(2, "0")}:00
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Latest"
          value={latest}
          onChange={(e) => setLatest(Number(e.target.value))}
        >
          {HOURS.map((h) => (
            <MenuItem key={h} value={h}>
              {h.toString().padStart(2, "0")}:00
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Box>
        <Button variant="contained" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save availability"}
        </Button>
      </Box>
    </Stack>
  );
}

function SubjectsTab() {
  const profileQuery = useTutorProfile();
  const update = useUpdateTutorProfile();
  const { enqueueSnackbar } = useSnackbar();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [topics, setTopics] = useState("");

  // Initialise from server values, not the query-object reference. A background
  // refetch (refetchOnMount) or a setQueryData from any save returns a fresh
  // object even when the values are identical; depending on the object would
  // re-run this effect and wipe the tutor's in-progress selections.
  const hasProfile = profileQuery.data != null;
  const serverSubjects = profileQuery.data?.subjects ?? "";
  const serverSpecialization = profileQuery.data?.specialization ?? "";
  useEffect(() => {
    if (!hasProfile) return;
    setSelected(new Set(serverSubjects.split(",").map((s) => s.trim()).filter(Boolean)));
    setTopics(serverSpecialization);
  }, [hasProfile, serverSubjects, serverSpecialization]);

  const toggle = (s: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const save = async () => {
    try {
      await update.mutateAsync({
        subjects: SUBJECT_OPTIONS.filter((s) => selected.has(s)).join(","),
        specialization: topics.trim(),
      });
      enqueueSnackbar("Subjects saved.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save subjects${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  if (profileQuery.isLoading) return <TabLoading />;

  return (
    <Stack spacing={2} sx={{ maxWidth: 560 }}>
      <Typography variant="body2" color="text.secondary">
        Pick what you teach. Students filter by subject. Add specific topics for finer matching.
      </Typography>
      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
        {SUBJECT_OPTIONS.map((s) => {
          const on = selected.has(s);
          return (
            <Chip
              key={s}
              label={s}
              clickable
              onClick={() => toggle(s)}
              color={on ? "primary" : "default"}
              variant={on ? "filled" : "outlined"}
            />
          );
        })}
      </Stack>
      <TextField
        fullWidth
        label="Specialist topics"
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
        placeholder="e.g. Calculus, Trigonometry, Equilibrium"
        helperText="Comma-separated. Shown on your profile."
      />
      <Box>
        <Button variant="contained" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save subjects"}
        </Button>
      </Box>
    </Stack>
  );
}

function NotificationsTab() {
  const profileQuery = useTutorProfile();
  const update = useUpdateTutorProfile();
  const { enqueueSnackbar } = useSnackbar();

  const [onConnection, setOnConnection] = useState(true);
  const [onReview, setOnReview] = useState(true);
  const [weekly, setWeekly] = useState(false);

  // Depend on the primitive server values, not the query-object reference, so a
  // background refetch or a setQueryData from any save does not re-run this and
  // clobber the tutor's unsaved toggles.
  const hasProfile = profileQuery.data != null;
  const serverOnConnection = profileQuery.data?.notifyOnConnection ?? true;
  const serverOnReview = profileQuery.data?.notifyOnReview ?? true;
  const serverWeekly = profileQuery.data?.weeklySummary ?? false;
  useEffect(() => {
    if (!hasProfile) return;
    setOnConnection(serverOnConnection);
    setOnReview(serverOnReview);
    setWeekly(serverWeekly);
  }, [hasProfile, serverOnConnection, serverOnReview, serverWeekly]);

  const save = async () => {
    try {
      await update.mutateAsync({
        notifyOnConnection: onConnection,
        notifyOnReview: onReview,
        weeklySummary: weekly,
      });
      enqueueSnackbar("Notification preferences saved.", { variant: "success" });
    } catch (err) {
      enqueueSnackbar(
        `Couldn't save preferences${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  if (profileQuery.isLoading) return <TabLoading />;

  return (
    <Stack spacing={2} sx={{ maxWidth: 560 }}>
      <FormControlLabel
        control={
          <Switch checked={onConnection} onChange={(e) => setOnConnection(e.target.checked)} />
        }
        label="Email me when a student connects with me"
      />
      <FormControlLabel
        control={<Switch checked={onReview} onChange={(e) => setOnReview(e.target.checked)} />}
        label="Email me when a student leaves a review"
      />
      <FormControlLabel
        control={<Switch checked={weekly} onChange={(e) => setWeekly(e.target.checked)} />}
        label="Weekly summary of new connections"
      />
      <Box>
        <Button variant="contained" onClick={save} disabled={update.isPending}>
          {update.isPending ? "Saving…" : "Save"}
        </Button>
      </Box>
    </Stack>
  );
}

function SecurityTab() {
  const profileQuery = useTutorProfile();
  const changePassword = useChangePassword();
  const { enqueueSnackbar } = useSnackbar();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const save = async () => {
    if (next.length < 8) {
      enqueueSnackbar("New password must be at least 8 characters.", { variant: "warning" });
      return;
    }
    if (next !== confirm) {
      enqueueSnackbar("New password and confirmation don't match.", { variant: "warning" });
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next });
      enqueueSnackbar("Password updated.", { variant: "success" });
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      enqueueSnackbar(
        `Couldn't update password${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 460 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Change password
        </Typography>
        <Stack spacing={2}>
          <TextField
            type="password"
            label="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            fullWidth
            autoComplete="current-password"
          />
          <TextField
            type="password"
            label="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            fullWidth
            autoComplete="new-password"
          />
          <TextField
            type="password"
            label="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            fullWidth
            autoComplete="new-password"
          />
          <Box>
            <Button variant="contained" onClick={save} disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating…" : "Update password"}
            </Button>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Verification
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Verified tutors get a badge on their profile and higher placement in search.
        </Typography>
        {profileQuery.data?.isVerified ? (
          <Chip icon={<VerifiedIcon />} label="Verified" color="success" size="small" />
        ) : (
          <Chip label="Not verified yet" size="small" variant="outlined" />
        )}
      </Box>
    </Stack>
  );
}
