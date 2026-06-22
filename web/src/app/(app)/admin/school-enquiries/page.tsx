"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CloseIcon from "@mui/icons-material/Close";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryStates } from "@/components/common/QueryStates";
import { StatusChip } from "@/components/common/StatusChip";
import { RelativeTime } from "@/components/common/RelativeTime";
import {
  useSchoolEnquiries,
  useMarkEnquiryContacted,
  type SchoolEnquiry,
} from "@/lib/api/queries";

const TABS = ["Fresh", "Contacted", "All"] as const;
type TabKey = (typeof TABS)[number];

const STAGE_LABELS: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" }> = {
  exploring: { label: "Exploring", color: "default" },
  demo: { label: "Wants demo", color: "primary" },
  pilot: { label: "Ready for pilot", color: "warning" },
  ready: { label: "Ready to commit", color: "success" },
};

const CURRICULUM_LABELS: Record<string, string> = {
  nsc: "NSC",
  ieb: "IEB",
  cambridge: "CIE",
};

export default function AdminSchoolEnquiriesPage() {
  const [tab, setTab] = useState<TabKey>("Fresh");
  const [selected, setSelected] = useState<SchoolEnquiry | null>(null);

  // Always fetch the full list; tab is a client-side filter so switching
  // tabs is instant and shows live counts.
  const query = useSchoolEnquiries();

  return (
    <>
      <PageHeader
        title="School enquiries"
        description="Sales pipeline — leads from the public Contact-sales form."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "School enquiries" }]}
      />

      <QueryStates
        query={query}
        empty={{
          icon: <HandshakeOutlinedIcon />,
          title: "No school enquiries yet",
          description:
            "When a school fills in the Contact-sales form on /for-schools, the lead lands here.",
        }}
      >
        {(rows) => (
          <EnquiriesView
            rows={rows}
            tab={tab}
            onTab={setTab}
            onSelect={setSelected}
          />
        )}
      </QueryStates>

      <EnquiryDrawer
        enquiry={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function EnquiriesView({
  rows,
  tab,
  onTab,
  onSelect,
}: {
  rows: SchoolEnquiry[];
  tab: TabKey;
  onTab: (t: TabKey) => void;
  onSelect: (e: SchoolEnquiry) => void;
}) {
  const filtered = useMemo(() => {
    if (tab === "Fresh") return rows.filter((r) => !r.contacted);
    if (tab === "Contacted") return rows.filter((r) => r.contacted);
    return rows;
  }, [rows, tab]);

  const counts = useMemo(
    () => ({
      Fresh: rows.filter((r) => !r.contacted).length,
      Contacted: rows.filter((r) => r.contacted).length,
      All: rows.length,
    }),
    [rows],
  );

  return (
    <>
      <Tabs
        value={tab}
        onChange={(_, v) => onTab(v as TabKey)}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((t) => (
          <Tab
            key={t}
            value={t}
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Box>{t}</Box>
                <Chip label={counts[t]} size="small" />
              </Stack>
            }
          />
        ))}
      </Tabs>

      {filtered.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Nothing in {tab.toLowerCase()}.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map((r) => (
            <EnquiryCard key={r.id} enquiry={r} onClick={() => onSelect(r)} />
          ))}
        </Stack>
      )}
    </>
  );
}

function EnquiryCard({ enquiry, onClick }: { enquiry: SchoolEnquiry; onClick: () => void }) {
  const stage = enquiry.stage ? STAGE_LABELS[enquiry.stage] : null;
  const curricula = enquiry.curricula?.split(",").filter(Boolean) ?? [];

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        transition: "border-color 150ms, transform 150ms",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {enquiry.schoolName}
              </Typography>
              {enquiry.contacted ? (
                <StatusChip kind="success" label="Contacted" dot={false} />
              ) : (
                <StatusChip kind="warning" label="Fresh" dot />
              )}
              {stage && <Chip label={stage.label} size="small" color={stage.color} />}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {enquiry.contactName}
              {enquiry.contactRole ? ` · ${enquiry.contactRole}` : ""}
              {(enquiry.province || enquiry.city) && (
                <> · {[enquiry.city, enquiry.province].filter(Boolean).join(", ")}</>
              )}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <EmailOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption">{enquiry.email}</Typography>
              </Stack>
              {enquiry.phone && (
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <PhoneOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption">{enquiry.phone}</Typography>
                </Stack>
              )}
              {enquiry.learnerCount && (
                <Typography variant="caption" color="text.secondary">
                  {enquiry.learnerCount} learners
                </Typography>
              )}
              {curricula.length > 0 && (
                <Stack direction="row" spacing={0.5}>
                  {curricula.map((c) => (
                    <Chip
                      key={c}
                      label={CURRICULUM_LABELS[c] ?? c}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Submitted <RelativeTime iso={enquiry.submittedAt} />
            </Typography>
            {enquiry.contacted && enquiry.contactedAt && (
              <Typography variant="caption" color="success.main">
                Contacted {dayjs(enquiry.contactedAt).format("DD MMM YYYY")}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function EnquiryDrawer({
  enquiry,
  onClose,
}: {
  enquiry: SchoolEnquiry | null;
  onClose: () => void;
}) {
  const { enqueueSnackbar } = useSnackbar();
  const markContacted = useMarkEnquiryContacted();

  const handleMark = async () => {
    if (!enquiry) return;
    try {
      await markContacted.mutateAsync(enquiry.id);
      enqueueSnackbar(`Marked ${enquiry.schoolName} as contacted.`, { variant: "success" });
      onClose();
    } catch (err) {
      enqueueSnackbar(
        `Couldn't update${err instanceof Error ? `: ${err.message}` : ""}`,
        { variant: "error" },
      );
    }
  };

  const curricula = enquiry?.curricula?.split(",").filter(Boolean) ?? [];
  const stage = enquiry?.stage ? STAGE_LABELS[enquiry.stage] : null;

  return (
    <Drawer
      anchor="right"
      open={!!enquiry}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 480 } } } }}
    >
      {enquiry && (
        <Box sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                School enquiry
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {enquiry.schoolName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted {dayjs(enquiry.submittedAt).format("DD MMM YYYY, HH:mm")}
              </Typography>
            </Box>
            <IconButton onClick={onClose} aria-label="Close">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {enquiry.contacted ? (
              <StatusChip kind="success" label="Contacted" />
            ) : (
              <StatusChip kind="warning" label="Fresh" dot />
            )}
            {stage && <Chip label={stage.label} size="small" color={stage.color} />}
            {curricula.map((c) => (
              <Chip key={c} label={CURRICULUM_LABELS[c] ?? c} size="small" variant="outlined" />
            ))}
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2} sx={{ flex: 1, overflowY: "auto" }}>
            <Field label="Contact">
              <Typography>{enquiry.contactName}</Typography>
              {enquiry.contactRole && (
                <Typography variant="caption" color="text.secondary">
                  {enquiry.contactRole}
                </Typography>
              )}
            </Field>

            <Field label="Email">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <EmailOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography sx={{ fontWeight: 500 }}>
                  <a href={`mailto:${enquiry.email}`} style={{ color: "inherit", textDecoration: "underline" }}>
                    {enquiry.email}
                  </a>
                </Typography>
              </Stack>
            </Field>

            {enquiry.phone && (
              <Field label="Phone">
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <PhoneOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Typography sx={{ fontWeight: 500 }}>
                    <a href={`tel:${enquiry.phone}`} style={{ color: "inherit", textDecoration: "underline" }}>
                      {enquiry.phone}
                    </a>
                  </Typography>
                </Stack>
              </Field>
            )}

            {(enquiry.city || enquiry.province) && (
              <Field label="Location">
                <Typography>{[enquiry.city, enquiry.province].filter(Boolean).join(", ")}</Typography>
              </Field>
            )}

            {enquiry.learnerCount && (
              <Field label="FET learner count">
                <Typography>{enquiry.learnerCount}</Typography>
              </Field>
            )}

            {enquiry.notes && (
              <Field label="Notes">
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {enquiry.notes}
                </Typography>
              </Field>
            )}

            {enquiry.contacted && enquiry.contactedAt && (
              <Field label="Marked contacted">
                <Typography variant="body2" color="success.main">
                  {dayjs(enquiry.contactedAt).format("DD MMM YYYY, HH:mm")}
                </Typography>
              </Field>
            )}
          </Stack>

          {!enquiry.contacted && (
            <Box sx={{ pt: 2, mt: 2, borderTop: 1, borderColor: "divider" }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<CheckCircleOutlineIcon />}
                onClick={handleMark}
                disabled={markContacted.isPending}
              >
                {markContacted.isPending ? "Saving…" : "Mark as contacted"}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1, textAlign: "center" }}>
                Logs the timestamp and moves this enquiry to the Contacted tab.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}
