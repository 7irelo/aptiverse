"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdfOutlined";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreOutlined";
import { motion, AnimatePresence } from "framer-motion";
import {
  useAssessmentUploads,
  useUploadAssessmentFile,
  useDeleteAssessmentUpload,
  type AssessmentUpload,
} from "@/lib/api/queries";

// Compact strip of attached files for the active assessment. Sits
// inside the Working tab so students can photograph their handwritten
// working and attach it alongside the typed reasoning / equations.
//
// Image uploads render as 96px-square thumbnails; PDFs render as
// labelled tiles. Hover reveals a delete button. Click an item to
// open the file full-size in a new tab.

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";

export function UploadsStrip({ assessmentId }: { assessmentId: string }) {
  const list = useAssessmentUploads(assessmentId);
  const upload = useUploadAssessmentFile(assessmentId);
  const remove = useDeleteAssessmentUpload(assessmentId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Collapsed by default once there are uploads — the strip can sit
  // hidden until the student wants to revisit it. The first-run state
  // (no uploads) stays expanded so the dropzone is visible and inviting.
  const [open, setOpen] = useState(true);

  const uploads = list.data ?? [];

  const onPick = () => fileInputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(`${file.name} is over 10 MB.`);
        continue;
      }
      try {
        await upload.mutateAsync(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{ mb: open ? 1 : 0 }}
      >
        <IconButton
          size="small"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Hide attachments" : "Show attachments"}
          aria-expanded={open}
          sx={{
            color: "text.secondary",
            transition: "transform 180ms ease",
            transform: open ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
        <Typography
          onClick={() => setOpen((v) => !v)}
          variant="caption"
          color="text.secondary"
          sx={{
            letterSpacing: "0.06em",
            fontWeight: 600,
            textTransform: "uppercase",
            cursor: "pointer",
            userSelect: "none",
            flex: 1,
          }}
        >
          Attachments
          {uploads.length > 0 && (
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 0.75, color: "text.disabled", fontWeight: 500 }}
            >
              {uploads.length}
            </Typography>
          )}
        </Typography>
        <Button
          onClick={onPick}
          size="small"
          variant="text"
          startIcon={<AddPhotoIcon fontSize="small" />}
          disabled={upload.isPending}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          {upload.isPending ? "Uploading…" : "Add"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file
          }}
        />
      </Stack>

      {error && (
        <Typography variant="caption" color="error.main" sx={{ display: "block", mb: 1 }}>
          {error}
        </Typography>
      )}

      <Collapse in={open} timeout="auto" unmountOnExit>

      {list.isLoading ? (
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={96} height={96} />
          <Skeleton variant="rounded" width={96} height={96} />
        </Stack>
      ) : uploads.length === 0 ? (
        <Box
          onClick={onPick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onPick(); }}
          sx={{
            p: 2,
            border: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 1.5,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 150ms ease, background-color 150ms ease",
            "&:hover, &:focus-visible": {
              borderColor: "primary.main",
              outline: "none",
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(116,181,174,0.04)"
                  : "rgba(15,105,99,0.03)",
            },
          }}
        >
          <AddPhotoIcon sx={{ color: "text.secondary", fontSize: 28, mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            Photograph your working on paper and attach it here
          </Typography>
          <Typography variant="caption" color="text.disabled">
            JPG, PNG, WebP, HEIC, PDF · up to 10 MB
          </Typography>
        </Box>
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: "auto",
            pb: 1,
            mx: { xs: -2, sm: -3 },
            px: { xs: 2, sm: 3 },
            scrollbarWidth: "thin",
          }}
        >
          <AnimatePresence initial={false}>
            {uploads.map((u) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              >
                <UploadTile
                  upload={u}
                  onRemove={() => remove.mutate(u.id)}
                  busy={remove.isPending}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Trailing "add another" tile so the affordance stays in
              view once the strip has items. */}
          <Box
            onClick={onPick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onPick(); }}
            sx={{
              width: 96,
              height: 96,
              border: 1,
              borderStyle: "dashed",
              borderColor: "divider",
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              flexShrink: 0,
              color: "text.secondary",
              transition: "border-color 150ms ease",
              "&:hover, &:focus-visible": {
                borderColor: "primary.main",
                color: "primary.main",
                outline: "none",
              },
            }}
            aria-label="Add another attachment"
          >
            <AddPhotoIcon />
          </Box>
        </Stack>
      )}
      </Collapse>
    </Box>
  );
}

function UploadTile({
  upload,
  onRemove,
  busy,
}: {
  upload: AssessmentUpload;
  onRemove: () => void;
  busy: boolean;
}) {
  const isImage = upload.contentType.startsWith("image/");
  const isPdf = upload.contentType === "application/pdf";

  return (
    <Box
      sx={{
        position: "relative",
        width: 96,
        height: 96,
        borderRadius: 1.5,
        border: 1,
        borderColor: "divider",
        overflow: "hidden",
        flexShrink: 0,
        backgroundColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
        transition: "border-color 150ms ease",
        "&:hover": { borderColor: "text.secondary" },
        "&:hover .upload-remove": { opacity: 1 },
      }}
    >
      <Box
        component="a"
        href={upload.url}
        target="_blank"
        rel="noreferrer"
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={upload.url}
            alt={upload.filename}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            sx={{ height: "100%", p: 1 }}
          >
            <PictureAsPdfIcon
              sx={{ color: isPdf ? "error.main" : "text.secondary", fontSize: 28 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                textAlign: "center",
                lineHeight: 1.2,
                fontSize: "0.65rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {upload.filename}
            </Typography>
          </Stack>
        )}
      </Box>
      <IconButton
        className="upload-remove"
        size="small"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        disabled={busy}
        aria-label={`Remove ${upload.filename}`}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          opacity: 0,
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(0,0,0,0.6)"
              : "rgba(255,255,255,0.85)",
          color: "text.primary",
          transition: "opacity 150ms ease",
          width: 22,
          height: 22,
          "&:hover": {
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? "rgba(0,0,0,0.8)"
                : "rgba(255,255,255,0.95)",
          },
          "&:focus-visible": { opacity: 1 },
          // Touch has no hover, so this would otherwise be an invisible and
          // permanently unreachable way to remove an upload. The explicit
          // min sizes override the global 44px touch floor: this control
          // floats over a small thumbnail, and 44px would cover the image it
          // belongs to. 28px plus the icon still clears WCAG 2.2 target size.
          "@media (hover: none)": {
            opacity: 1,
            width: 28,
            height: 28,
            minWidth: 28,
            minHeight: 28,
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}
