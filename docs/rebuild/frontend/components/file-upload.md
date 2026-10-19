# FileUpload

| | |
|---|---|
| ID | `UI-31` (split: `UI-122` to `UI-127`) |
| Phase | 3 (used from Phase 4 assessments) |
| Depends on | UI-01, UI-24, UI-10, FE-25, presigned upload and confirm endpoints in the Academics module (see `docs/rebuild/backend/`), uploads bucket CORS (`docs/rebuild/infra/storage.md`, INF-15) |
| File path | planned `web/src/components/common/file-upload.tsx`, `web/src/features/academics/hooks/use-upload.ts` |
| Status | 0 of 7 done, 0 partial, 7 not started |

## Purpose

Upload coursework (SBA tasks, assessment scripts, evidence) straight from the browser to S3 with a presigned PUT, with progress, cancel and retry. Uploads must survive deploys (the old app lost them on every deploy), so the file never touches the web or api disk.

## Flow

1. Client validates type and size (UI-122).
2. Client asks the API (through the BFF) for an upload slot: `{ fileName, contentType, sizeBytes }` returns `{ uploadId, url, headers, expiresAt }`. The URL is signed for that exact content type, size range and an object key the server chose.
3. Browser PUTs the file to S3 directly with progress events (UI-123). The BFF never proxies file bytes.
4. Client calls confirm (`POST .../uploads/{uploadId}/complete`); the server reads the object head, verifies magic bytes and size, then attaches it to the assessment (UI-124).
5. Downloads use short lived presigned GET from the API.

## API (planned)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Visible label. |
| `accept` | `string[]` | `["application/pdf", "image/jpeg", "image/png"]` | MIME allowlist shared with the server config. |
| `maxSizeBytes` | `number` | 10 MB | Server enforces the same limit in the signature. |
| `multiple` | `boolean` | `false` | |
| `requestSlot` | `(file) => Promise<UploadSlot>` | required | Generated client mutation via BFF. |
| `confirm` | `(uploadId) => Promise<UploadedFile>` | required | |
| `onUploaded` | `(file: UploadedFile) => void` | none | |
| `capture` | `"environment" \| undefined` | none | Mobile camera for photographing scripts. |
| `disabled` | `boolean` | `false` | |

## Variants

Single file field; multiple files list; dropzone (from `sm`); camera capture on phones.

## States

Idle, file chosen and invalid (inline error), requesting slot, uploading with percentage, verifying, done (file name, size, remove), failed with retry, cancelled, slot expired (re-request automatically once).

## Accessibility

- A real `input type="file"` with a visible label; the dropzone is an enhancement, never the only way.
- Choose button 44px; progress uses ProgressBar (UI-87) with `aria-valuetext` "45%, report.pdf".
- Status changes announced through a polite live region; errors with `role="alert"`.
- Remove and retry buttons have accessible names including the file name.

## Security

- Client allowlist and size check are UX only; the server signs `Content-Type` and a `content-length-range` and rejects anything else.
- Magic byte verification after upload on the server before the file is linked; mismatches are deleted.
- Presigned PUT expires in at most 5 minutes; GET links at most 5 minutes.
- Object keys are server generated (no user file names in keys); original name stored as metadata and shown escaped.
- Virus scanning decision recorded (UI-126): options are S3 malware protection for GuardDuty, a scan worker, or accept the risk for PDFs and images only.
- CSP: `connect-src` must include the uploads bucket origin (FE-13 change, coordinated in `docs/rebuild/frontend/skeleton.md`).

## Tasks

- [ ] **UI-31** FileUpload (presigned PUT, progress, type and size checks)
- [ ] **UI-122** Client validation: MIME allowlist and size limit from shared config, clear error copy ("This file is 14 MB. The limit is 10 MB.")
- [ ] **UI-123** Upload hook: request slot via BFF, XHR PUT with progress, cancel with `AbortController`, one automatic retry, re-request on expired slot
- [ ] **UI-124** Confirm step and states: verifying, done, server rejected (magic byte mismatch copy), remove uploaded file
- [ ] **UI-125** Dropzone from `sm` up and camera capture on phones, both optional enhancements over the native input
- [ ] **UI-126** Security decisions recorded with the backend owner: expiry values, content length range, key scheme, virus scan choice, CSP `connect-src` entry for each environment's bucket
- [ ] **UI-127** Tests: Vitest for validation and the hook (mocked XHR), Playwright against local MinIO (infra `local/compose.yml`) uploading a PDF and rejecting a renamed `.exe`, keyboard only flow, gallery snapshots light and dark at 360 and 1440, axe zero violations

## Tests

As in UI-127, plus the Phase 4 exit gate E2E: an uploaded file is still downloadable after a redeploy.

## Verification

1. Upload a 9 MB PDF on Pixel 7 emulation: progress moves, completes, file appears.
2. Upload an 11 MB file: rejected before any network call.
3. Rename an executable to `.pdf`: S3 accepts the PUT, confirm fails and the object is deleted.
4. Network tab shows the file bytes going to the bucket origin, not `/api/bff`.

## Open questions

- Exact allowlist per use (SBA may need Word documents; do we accept `.docx`?).
- Per user storage quota by plan (entitlement) or a flat limit?
- Virus scanning in v1 or after launch?
