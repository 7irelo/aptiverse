# Family module

| | |
|---|---|
| ID range | `BE-FAM-01` to `BE-FAM-14` (original), `BE-FAM-15` to `BE-FAM-40` (splits and additions), `BE-FAM-50` to `BE-FAM-70` (production readiness) |
| Schema | `family` |
| Projects | `src/Modules/Family/Aptiverse.Family`, `src/Modules/Family/Aptiverse.Family.Contracts`, `tests/Aptiverse.Family.UnitTests` |
| Phase | 8 |
| Consumes | `Aptiverse.Identity.Contracts` (`IUserProfileLookup` with date of birth and verified email, `UserRegistered`, `AccountDeletionRequested`), `Aptiverse.Academics.Contracts` (`IStudyUnitLookup`, `IAssessmentSummary`, `AssessmentGraded`), `Aptiverse.Practice.Contracts` (`IPracticeSummary`, `PracticeAttemptGraded`), `Aptiverse.Progress.Contracts` (`IProgressSummary` including `GetActiveGoalsAsync` for the Goals block, BE-PRG-71; `IGoalLookup` only for the deferred pledge work; `GoalAchieved`, `GoalMilestoneReached`, `GoalAbandoned`, `GoalExpired`, `AchievementAwarded`, `MasteryUpdated`), `Aptiverse.Wellbeing.Contracts` (`ISharedWellbeingTrend`), `Aptiverse.Billing.Contracts` (`IEntitlements`; `IOneOffCheckout` and `PaymentSucceeded` only for the deferred pledge work), `Aptiverse.Notifications.Contracts` (`NotifyUser`, email commands) |
| Publishes | `FamilyInviteSent`, `FamilyLinkCreated`, `FamilyLinkRemoved`, `FamilySharingChanged`, `ParentalConsentGranted`, `ParentalConsentWithdrawn` (`PledgeCreated` and `PledgeStatusChanged` deferred, decision 6); implements `IFamilyLinkLookup`, `IFamilySharingSettings` |
| Depends on | BE-IDN-02 (needs `date_of_birth`, see open question 1), BE-IDN-04 (consent records), BE-PRG-29 to 31, BE-WEL-09, BE-BIL-05 |
| Status | Not started (0 of 61 tasks; 8 deferred by decision 6: BE-FAM-12, 17, 29, 30, 31, 32, 34, 66) |

## Responsibilities and out of scope

Responsible for:

- Parent and student links, created only through invites that the student accepts (student-side consent). Parent onboarding uses invites only: parents never create child profiles, because the student must consent.
- Invites in both directions (parent invites a student; a student invites a parent, which is also the route for parental consent), with expiry, resend and cancel.
- Per-link sharing flags, owned here and controlled by the student, including the wellbeing trend flag that Wellbeing reads (`IFamilySharingSettings`).
- Consent-scoped parent reads: overview per child, a batch overview for the dashboard, shared wellbeing trend, celebrations (per child and family-wide) and an activity feed with times rounded to the hour.
- Parental consent for under-18 accounts (POPIA section 35), recorded through Identity.
- Allowance pledges on verifiable goals: **deferred, not in v1.** Decision 6 chose neither pledges nor points for v1 (de-gamified; revisit after launch). The pledge design below (tables, slices, handlers) is kept so it can be picked up later; every pledge task is marked deferred and none is built in v1.

Out of scope:

- Wellbeing content of any kind (only `ISharedWellbeingTrend` aggregates).
- Billing seats (Billing owns them and asks `IFamilyLinkLookup`).
- Teacher, school or tutor links (later phases).

## Data model

Schema `family`. Every table: `id uuid` PK (Guid v7), `created_at`, `updated_at`, `deleted_at`, `xmin`, except append-only tables.

### links

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| parent_user_id | uuid | no | index `(parent_user_id, status)` |
| student_user_id | uuid | no | index `(student_user_id, status)`; partial unique `(parent_user_id, student_user_id) where status = 'active'` |
| status | varchar(16) | no | check `in ('active','removed')` |
| relationship | varchar(16) | no | check `in ('mother','father','guardian','other')` |
| created_from_invite_id | uuid | no | FK `invites.id`, index |
| share_academics | boolean | no | default true: units, upcoming assessments, unit standing |
| share_marks | boolean | no | default true: individual assessment marks |
| share_practice | boolean | no | default true: practice activity and scores |
| share_goals | boolean | no | default true: goals and milestones |
| share_wellbeing_trend | boolean | no | default false: weekly mood and stress aggregates only |
| sharing_changed_at | timestamptz | no | |
| removed_at | timestamptz | yes | |
| removed_by | varchar(8) | yes | check `in ('parent','student','system')` |

Limits (enforced in handlers): at most 6 active children per parent, 4 active parents per student.

### invites

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| direction | varchar(20) | no | check `in ('parent_to_student','student_to_parent')` |
| inviter_user_id | uuid | no | index `(inviter_user_id, status)` |
| invitee_email | varchar(256) | no | normalised lower case; index `(invitee_email, status)` |
| invitee_user_id | uuid | yes | set when the email belongs to an existing account at send time or on accept |
| inviter_display_name | varchar(80) | no | snapshot shown to the invitee |
| relationship | varchar(16) | no | as on links |
| token_hash | char(64) | no | unique; SHA-256 of a 32-byte random token; the token itself is only in the email |
| status | varchar(16) | no | check `in ('pending','accepted','declined','cancelled','expired')` |
| expires_at | timestamptz | no | created plus 7 days; reset on resend |
| resend_count | int | no | check `between 0 and 3` |
| last_sent_at | timestamptz | no | |
| is_consent_request | boolean | no | true when a student under 18 asks a parent for parental consent |
| responded_at | timestamptz | yes | |

Partial unique `(inviter_user_id, invitee_email) where status = 'pending'`.

### parental_consents (append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| student_user_id | uuid | no | index `(student_user_id, occurred_at desc)` |
| parent_user_id | uuid | no | the consenting parent (must have an account with a verified email) |
| invite_id | uuid | yes | FK `invites.id`, index |
| action | varchar(12) | no | check `in ('granted','withdrawn')` |
| document_version | varchar(20) | no | the parental consent text version |
| ip_address | inet | yes | |
| user_agent | varchar(300) | yes | |
| occurred_at | timestamptz | no | |

Current consent = the latest row per student. Identity also stores a `user_consents` row (BE-IDN-04) via `ParentalConsentGranted`.

### pledges (deferred: decision 6, not in v1)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| link_id | uuid | no | FK `links.id`, index |
| parent_user_id | uuid | no | index |
| student_user_id | uuid | no | index |
| goal_id | uuid | no | no FK (Progress); partial unique `(goal_id, parent_user_id) where status in ('pledged','earned','payment_pending')` |
| amount_cents | bigint | no | check `between 1000 and 500000` (R10 to R5 000) |
| currency | char(3) | no | `ZAR` |
| note | varchar(200) | yes | message to the student |
| status | varchar(16) | no | check `in ('pledged','earned','payment_pending','paid','cancelled')` |
| earned_at | timestamptz | yes | |
| paid_at | timestamptz | yes | |
| paid_via | varchar(16) | yes | check `in ('outside_app','billing')` |
| checkout_session_id | uuid | yes | Billing session for the `billing` path |
| payment_id | uuid | yes | Billing payment id |
| cancelled_reason | varchar(32) | yes | `parent_cancelled`, `goal_abandoned`, `goal_expired`, `link_removed` |

### pledge_events (append-only; deferred: decision 6, not in v1)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| pledge_id | uuid | no | FK, index |
| from_status | varchar(16) | yes | |
| to_status | varchar(16) | no | |
| actor | varchar(16) | no | `parent`, `student`, `system` |
| source_ref | varchar(100) | yes | event or payment id; unique `(pledge_id, to_status, source_ref)` |
| occurred_at | timestamptz | no | |

### child_events (projection, append-only)

| Column | Type | Null | Constraint or index |
|---|---|---|---|
| student_user_id | uuid | no | index `(student_user_id, occurred_at desc)` |
| scope | varchar(16) | no | check `in ('academics','marks','practice','goals')`; filtered at read time by the link's flags |
| kind | varchar(32) | no | check `in ('practice_completed','assessment_graded','goal_created','goal_achieved','milestone_reached','achievement_awarded','topic_secure','topic_mastered')` |
| is_celebration | boolean | no | true for goal achieved, milestone, achievement, topic secure or mastered |
| title | varchar(160) | no | parent-facing wording, no scores unless the scope allows them |
| detail | jsonb | no | small typed payload (score percent for practice, mark for assessments) used only when the scope is shared |
| source_type | varchar(24) | no | |
| source_id | uuid | no | unique `(student_user_id, kind, source_type, source_id)` |
| occurred_at | timestamptz | no | exact time stored; the API rounds down to the hour |

## Contracts

```
public interface IFamilyLinkLookup
{
    Task<bool> IsLinkedAsync(Guid parentUserId, Guid studentUserId, CancellationToken ct);
    Task<IReadOnlyList<Guid>> GetChildrenAsync(Guid parentUserId, CancellationToken ct);
}

public interface IFamilySharingSettings
{
    // null when there is no active link
    Task<SharingFlags?> GetAsync(Guid parentUserId, Guid studentUserId, CancellationToken ct);
    Task<IReadOnlyList<ParentShare>> GetParentsOfAsync(Guid studentUserId, CancellationToken ct); // for the student's own views
}
public sealed record SharingFlags(bool Academics, bool Marks, bool Practice, bool Goals, bool WellbeingTrend);
public sealed record ParentShare(Guid ParentUserId, string DisplayName, SharingFlags Flags);

public sealed record FamilyInviteSent(Guid InviteId, string Direction, string InviteeEmail, string InviterDisplayName, Uri AcceptUrl, DateTimeOffset ExpiresAt, bool IsConsentRequest);
public sealed record FamilyLinkCreated(Guid LinkId, Guid ParentUserId, Guid StudentUserId, DateTimeOffset OccurredAt);
public sealed record FamilyLinkRemoved(Guid LinkId, Guid ParentUserId, Guid StudentUserId, string RemovedBy, DateTimeOffset OccurredAt);
public sealed record FamilySharingChanged(Guid LinkId, Guid ParentUserId, Guid StudentUserId, SharingFlags Flags, DateTimeOffset OccurredAt);
// Deferred (decision 6, not in v1): PledgeCreated and PledgeStatusChanged
public sealed record PledgeCreated(Guid PledgeId, Guid GoalId, Guid ParentUserId, Guid StudentUserId, string SponsorDisplayName, long AmountCents, string Currency, DateTimeOffset OccurredAt);
public sealed record PledgeStatusChanged(Guid PledgeId, Guid GoalId, string Status, DateTimeOffset OccurredAt);
public sealed record ParentalConsentGranted(Guid StudentUserId, Guid ParentUserId, string DocumentVersion, string? IpAddress, string? UserAgent, DateTimeOffset OccurredAt);
public sealed record ParentalConsentWithdrawn(Guid StudentUserId, Guid ParentUserId, DateTimeOffset OccurredAt);
```

## Error codes

Stable strings in the ProblemDetails `code` extension (contract test BE-FAM-39).

| Code | HTTP | Meaning |
|---|---|---|
| `family.invite_not_found` | 404 | Unknown, expired, used, or not addressed to the caller |
| `family.invite_expired` | 410 | Token valid but past `expires_at` |
| `family.invite_email_mismatch` | 403 | Signed-in account's verified email is not the invited email |
| `family.invite_duplicate` | 409 | A pending invite to this email exists (`inviteId`) |
| `family.already_linked` | 409 | Active link exists |
| `family.self_invite` | 400 | Inviting your own email |
| `family.wrong_role` | 403 | Accepting as the wrong role (a parent accepting a parent invite) |
| `family.limit_reached` | 409 | 6 children per parent or 4 parents per student |
| `family.resend_limit` | 429 | Resend allowed 3 times, at most once per hour |
| `family.child_not_found` | 404 | Not an active link of the caller (never 403, so ids are not probed) |
| `family.not_shared` | 403 | The student has not shared this area (`scope` extension) |
| `family.consent_required` | 403 | Under-18 student without parental consent for this action |
| `family.consent_not_parent` | 403 | Only a linked parent can grant consent |
| `family.pledge_goal_invalid` | 409 | Deferred (decision 6). Goal not active, not the child's, or already has a pledge from this parent |
| `family.pledge_locked` | 409 | Deferred (decision 6). Pledge not in a state that allows the action |
| `family.feature_required` | 403 | Reserved; unused in v1 because parent insights are free (decision 13) |
| `family.concurrency_conflict` | 409 | `xmin` mismatch |

## Foundation tasks

- [ ] **BE-FAM-01** Module projects, `family` schema, `FamilyDbContext`, design-time factory, architecture test registration
- [ ] **BE-FAM-15** Permission constants `family.parent` (parent role), `family.student` (student role)
- [ ] **BE-FAM-02** `links` entity with sharing flags and defaults, limits, migration
- Data for **BE-FAM-03** (built as part of that slice task): `invites` entity, token generator (32 random bytes, base64url, SHA-256 hash stored), expiry 7 days (the endpoint is below)
- [ ] **BE-FAM-16** `parental_consents` entity and the `ConsentPolicy` (pure): a student is a minor when `date_of_birth` is less than 18 years before today in `Africa/Johannesburg`; minors without a current `granted` row are restricted (open question 2 lists what is restricted)
- [ ] **BE-FAM-17** `pledges` and `pledge_events` entities and the pledge state machine (pure) with a test per transition *(deferred: decision 6, not in v1)*
- [ ] **BE-FAM-18** `child_events` projection handlers for `PracticeAttemptGraded`, `AssessmentGraded`, `GoalCreated`, `GoalAchieved`, `GoalMilestoneReached`, `AchievementAwarded`, `MasteryUpdated` (band up to secure or mastered only); replay-safe
- [ ] **BE-FAM-19** `IFamilyLinkLookup` and `IFamilySharingSettings` implementations (used by Billing seats and Wellbeing BE-WEL-06)
- [ ] **BE-FAM-20** `ScopedChildReader`: the single place that resolves the caller's link to a child and the current flags; every parent read goes through it, and a test enumerates parent endpoints to prove it

## Slices

Group `/family`, tag `Family`. Parent reads use `{studentId}` route values; a student that is not an active link of the caller returns `404 family.child_not_found`.

### BE-FAM-03  POST /family/invites

| | |
|---|---|
| Operation id | `sendFamilyInvite` |
| Permission | `family.parent` or `family.student`; verified email required |
| Entitlement | free |
| Rate limit | `family-invite` (10 per day per user) |
| Idempotency | partial unique pending invite per inviter and email; a repeat returns `409 family.invite_duplicate` with the existing id (use resend) |
| Metric | `aptiverse.family.invites.sent` (counter, tags `direction`, `consent_request`) |
| Log fields | `UserId`, `InviteId`, `Direction`, `IsConsentRequest` (never the email) |

Request: `email` (valid, max 256, not the caller's own), `relationship` enum, `isConsentRequest` bool (student only, only when the student is a minor).

Behaviour: direction from the caller's role; stores the invite; publishes `FamilyInviteSent` (Notifications sends the email with the link `/family/invite/{token}`; also an in-app notification when the email belongs to an existing account of the right role). The response never reveals whether the email has an account (no enumeration).

Response `201 InviteView`: `id`, `direction`, `inviteeEmailMasked` (`j***@g***.com`), `relationship`, `status`, `expiresAt`, `resendsLeft`.

Failures: `400`; `400 family.self_invite`; `409 family.invite_duplicate`; `409 family.limit_reached`; `429`.

- [ ] **BE-FAM-03** `invites` table and `POST /family/invites`
  - [ ] Entity, token generator, migration
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: direction from role, masking
  - [ ] Integration tests: parent to student, student to parent with consent flag, duplicate 409, response identical for existing and unknown emails

### BE-FAM-21  GET /family/invites

| | |
|---|---|
| Operation id | `listFamilyInvites` |
| Permission | `family.parent` or `family.student` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.family.invites.list.duration` |
| Log fields | `UserId`, `SentCount`, `IncomingCount` |

Response `200 InvitesView`: `sent[]` (invites the caller created: `id`, `inviteeEmailMasked`, `status`, `expiresAt`, `resendsLeft`, `relationship`) and `incoming[]` (pending invites addressed to the caller's verified email or user id: `id`, `inviterDisplayName`, `direction`, `relationship`, `expiresAt`, `isConsentRequest`). Expired invites show as `expired` (computed at read time and by the expiry job).

- [ ] **BE-FAM-21** List sent and incoming invites
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: expiry computed at read time
  - [ ] Integration tests: parent view, student incoming by email match

### BE-FAM-22  POST /family/invites/{id}/resend

Permission: the inviter only; rate limit `family-invite`; idempotency: at most once per hour, 3 times total (`429 family.resend_limit`); metric `aptiverse.family.invites.resent`; log fields `UserId`, `InviteId`, `ResendCount`. Behaviour: rotates the token (old link stops working), resets `expires_at` to now plus 7 days, publishes `FamilyInviteSent`. Failures `404`, `409 family.invite_not_found` when not pending.

- [ ] **BE-FAM-22** Resend invite
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: token rotation, limits
  - [ ] Integration tests: happy, old token rejected, limit 429

### BE-FAM-23  DELETE /family/invites/{id}

Permission: the inviter only; rate limit `default`; idempotent `204`; metric `aptiverse.family.invites.cancelled`; log fields `UserId`, `InviteId`. Sets `cancelled`; the link in the email stops working.

- [ ] **BE-FAM-23** Cancel invite
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: only pending can be cancelled
  - [ ] Integration tests: happy, idempotent, invitee cannot cancel (404)

### BE-FAM-24  GET /family/invites/{token}

Permission: anonymous (public preview, so the invite page renders before sign-in or sign-up); rate limit `family-token-public` (20 per hour per IP, to stop token guessing); metric `aptiverse.family.invites.previewed` (tag `outcome`); log fields `InviteId`, `Outcome` (never the token). Response `200 InvitePreview`: `inviterDisplayName` (first name only when anonymous), `direction`, `relationship`, `expiresAt`, `isConsentRequest`, and, only when the caller is signed in, `emailMatches` and `roleMatches`. Never returns the invitee email. Failures `404 family.invite_not_found`, `410 family.invite_expired`.

- [ ] **BE-FAM-24** Invite preview by token
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator (token format)
  - [ ] Handler (hash lookup, constant-time compare not needed for a hash index lookup but no timing branch on existence)
  - [ ] Unit tests: match flags
  - [ ] Integration tests: anonymous valid, signed-in match flags, expired 410, unknown 404, rate limit

### BE-FAM-04  POST /family/invites/by-token/{token}/accept

| | |
|---|---|
| Operation id | `acceptFamilyInvite` |
| Permission | authenticated; must hold the role the invite targets (student for `parent_to_student`, parent for `student_to_parent`) |
| Entitlement | free |
| Rate limit | `family-token` |
| Idempotency | accepting an accepted invite as the same user returns `200` with the existing link |
| Metric | `aptiverse.family.invites.accepted` (counter, tag `direction`) |
| Log fields | `UserId`, `InviteId`, `LinkId`, `Direction` |

Request: `sharing` optional initial flags (student accepting only; defaults from the data model), `relationship` confirmation.

Rules (student-side consent): for `parent_to_student` the accepting student is the consenting party and chooses the flags; for `student_to_parent` the student already consented by inviting, and the parent accepts; the accepting account's verified email must equal `invitee_email` (`403 family.invite_email_mismatch`); limits apply. When `is_consent_request`, accepting continues to the consent step (BE-FAM-33) in the same UI flow but is a separate call.

Response `200 LinkView`: `linkId`, `parent` or `student` display info, `sharing`.

Events: `FamilyLinkCreated`, `FamilySharingChanged`.

Failures: `403 family.invite_email_mismatch`; `403 family.wrong_role`; `404`; `410 family.invite_expired`; `409 family.already_linked`; `409 family.limit_reached`.

- [ ] **BE-FAM-04** Accept invite (student-side consent)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: rules matrix
  - [ ] Integration tests: both directions, email mismatch 403, wrong role 403, expired 410, idempotent

### BE-FAM-25  POST /family/invites/by-token/{token}/decline

Permission authenticated invitee (email match); rate limit `family-token`; idempotent; metric `aptiverse.family.invites.declined`; log fields `UserId`, `InviteId`. Sets `declined`; the inviter gets a neutral notification ("Your invite was not accepted").

- [ ] **BE-FAM-25** Decline invite
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: state guard
  - [ ] Integration tests: happy, idempotent, wrong email 403

### BE-FAM-05  DELETE /family/links/{id}

| | |
|---|---|
| Operation id | `removeFamilyLink` |
| Permission | `family.parent` or `family.student` (either side of the link) |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | removing a removed link returns `204` |
| Metric | `aptiverse.family.links.removed` (counter, tag `removed_by`) |
| Log fields | `UserId`, `LinkId`, `RemovedBy` |

Behaviour: status `removed`; publishes `FamilyLinkRemoved` (Billing removes the child's seat). If the removed parent was the consenting parent of a minor, the consent stays valid until withdrawn (consent is about processing, not the link) but the student is told (open question 3).

- [ ] **BE-FAM-05** Remove a link (either side)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: removal by either side, consent kept
  - [ ] Integration tests: parent removes, student removes, third party 404, idempotent

### BE-FAM-06  GET /family/children

| | |
|---|---|
| Operation id | `listMyChildren` |
| Permission | `family.parent` |
| Entitlement | free |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.family.children.list.duration` |
| Log fields | `UserId`, `ChildCount` |

Response `200 children[]`: `studentId`, `linkId`, `displayName`, `stage` (high school or university), `levelLabel`, `linkedAt`, `sharing` (flags, read-only for the parent), `seat` (covered plan or null, from `IEntitlements`).

- [ ] **BE-FAM-06** `GET /family/children`
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: none beyond mapping
  - [ ] Integration tests: no children, two children, removed link excluded

### BE-FAM-26  GET /family/parents

Permission `family.student`; rate limit `default`; metric `aptiverse.family.parents.list.duration`; log fields `UserId`, `ParentCount`. Response `200 parents[]`: `parentId`, `linkId`, `displayName`, `relationship`, `linkedAt`, `sharing` (editable flags), `isConsentingParent`. The student-side list of linked parents.

- [ ] **BE-FAM-26** Student-side list of linked parents
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: consenting parent flag
  - [ ] Integration tests: list, parent role 403

### BE-FAM-11  PUT /family/links/{id}/sharing

| | |
|---|---|
| Operation id | `updateFamilySharing` |
| Permission | `family.student` (the student on the link only) |
| Entitlement | none |
| Rate limit | `default` |
| Idempotency | PUT of the full flag set; same flags return `200` with no event; required `If-Match` |
| Metric | `aptiverse.family.sharing.changed` (counter, tags per flag turned on or off) |
| Log fields | `UserId`, `LinkId`, `Flags` |

Request: all five flags (booleans). Changes apply to history too: activity and celebrations are filtered at read time by the current flags.

Response `200 LinkSharingView` with new `ETag`. Events: `FamilySharingChanged` (the parent sees a neutral notice "Sharing settings changed", without which areas).

Failures: `403` parent attempting; `404`; `412`, `428`.

- [ ] **BE-FAM-11** Sharing controls (student), the original "privacy" task
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: no-op detection
  - [ ] Integration tests: student updates, parent 403, history hidden after turning off

### BE-FAM-07  GET /family/children/{studentId}/overview

| | |
|---|---|
| Operation id | `getChildOverview` |
| Permission | `family.parent` |
| Entitlement | free, including unit standing and trends (decision 13: parent insights are free) |
| Rate limit | `default` |
| Idempotency | safe read; `HybridCache` 60 s per parent and child, invalidated by `FamilySharingChanged` |
| Metric | `aptiverse.family.overview.get.duration`, `aptiverse.family.overview.block_hidden` (counter, tag `scope`) |
| Log fields | `UserId`, `StudentId`, `SharedScopes` |

Response `200 ChildOverview`, every block either data or `{ shared: false }` (no `locked` state in v1, decision 13):

- `academics` (scope academics): units with `levelLabel`, upcoming assessments (next 14 days, titles and dates)
- `marks` (scope marks): latest 5 graded assessments with marks
- `practice` (scope practice): `IPracticeSummary` last 30 days (null average when none)
- `goals` (scope goals): active goals with verified progress from `IProgressSummary.GetActiveGoalsAsync` (BE-PRG-71), up to 10 (no pledges in v1, decision 6)
- `mastery` (scope academics): strongest and weakest topics from `IProgressSummary`
- `wellbeing` (scope wellbeing trend): a link to BE-FAM-08, not the data

Every number is nullable; null means "no marks yet".

- [ ] **BE-FAM-07** Child overview, consent-scoped
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (blocks fetched in parallel through contracts, 300 ms budget each, a timed-out block returns `unavailable: true`)
  - [ ] Unit tests: block visibility matrix (5 flags)
  - [ ] Integration tests: all shared, nothing shared, unlinked child 404, a parent with no subscription sees every shared block (no locked state, decision 13)

### BE-FAM-27  GET /family/children/overview

Batch overview for the parent dashboard. Permission `family.parent`; rate limit `default`; cached as BE-FAM-07; metric `aptiverse.family.overview_batch.duration`; log fields `UserId`, `ChildCount`. Response `200 children[]` of compact cards: `studentId`, `displayName`, `nextAssessment` (scope academics), `practiceLast7Days` (scope practice: tests completed, null average when none), `activeGoals` count and nearest goal (scope goals), `latestCelebration` (respecting scopes), `wellbeingShared` (bool only). One call, no N+1: contract calls are batched per child list where the contract supports it, otherwise parallel with the same budgets.

- [ ] **BE-FAM-27** Batch overview for the parent dashboard
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: per-child scope filtering
  - [ ] Integration tests: two children with different sharing, no children

### BE-FAM-08  GET /family/children/{studentId}/wellbeing

| | |
|---|---|
| Operation id | `getChildWellbeingTrend` |
| Permission | `family.parent` |
| Entitlement | free (the old app removed the gate at 43f9faa; a child's sharing choice is never behind a parent's payment) |
| Rate limit | `default` |
| Idempotency | safe read; `Cache-Control: private, no-store` |
| Metric | `aptiverse.family.wellbeing_trend.reads` (counter, tag `shared`) |
| Log fields | `UserId`, `StudentId`, `Shared` |

Request: `weeks` 4 to 12 (default 8).

Response `200 ChildWellbeingTrend`: `weeks[]` from `ISharedWellbeingTrend` (weekly points; a week with fewer than 3 check-ins has null values and `insufficient: true`) and `moodAvg8w` (mean mood over the last 8 weeks using only sufficient weeks, null when none), or `403 family.not_shared` (`scope = wellbeing_trend`). Never daily values, notes or diary data.

- [ ] **BE-FAM-08** Shared wellbeing trend only
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: not shared path never calls Wellbeing for data
  - [ ] Integration tests: shared, not shared 403, unlinked 404

### BE-FAM-09  GET /family/children/{studentId}/celebrations

Permission `family.parent`; rate limit `default`; metric `aptiverse.family.celebrations.get.duration`; log fields `UserId`, `StudentId`, `ResultCount`. Request `before` cursor, `take` 1 to 30. Response `200 CelebrationsPage`: `items[]` of `{ kind, title, occurredAt (rounded down to the hour), studentDisplayName }` from `child_events where is_celebration`, filtered by the current flags (goal items need `share_goals`; topic items need `share_academics`). Real events only; an empty list returns `[]` with no filler.

- [ ] **BE-FAM-09** Celebrations per child (real events)
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: hour rounding, scope filter
  - [ ] Integration tests: empty, scoped out, populated

### BE-FAM-28  GET /family/celebrations

Optional family-wide feed for the parent dashboard: the same items across all linked children, newest first, each tagged with the child; permission `family.parent`; same filtering per child; metric `aptiverse.family.celebrations_all.get.duration`.

- [ ] **BE-FAM-28** Family-wide celebrations feed
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler (one query over `student_user_id in (...)` with per-child flag predicates)
  - [ ] Unit tests: mixed sharing across children
  - [ ] Integration tests: two children

### BE-FAM-10  GET /family/children/{studentId}/activity

| | |
|---|---|
| Operation id | `getChildActivity` |
| Permission | `family.parent` |
| Entitlement | free, up to 90 days (decision 13) |
| Rate limit | `default` |
| Idempotency | safe read |
| Metric | `aptiverse.family.activity.get.duration` |
| Log fields | `UserId`, `StudentId`, `ResultCount`, `RangeDays` |

Request: `before` cursor, `take` 1 to 50, `rangeDays` 7, 30 or 90.

Response `200 ActivityPage`: `items[]` of `{ kind, title, detail (score or mark only when that scope is shared), occurredAt }` where `occurredAt` is rounded down to the hour by the API (privacy: a parent should not see the exact minute a student was active). No tutor chat, diary, check-in, login or page-view activity ever appears.

- [ ] **BE-FAM-10** Activity feed, privacy-respecting
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: rounding, detail stripping when a scope is off
  - [ ] Integration tests: scopes on and off, 90-day range limit

### BE-FAM-12  POST /family/pledges (deferred: decision 6, not in v1)

| | |
|---|---|
| Operation id | `createPledge` |
| Permission | `family.parent` |
| Entitlement | free (open question 7) |
| Rate limit | `default` |
| Idempotency | required `Idempotency-Key`; partial unique open pledge per goal and parent |
| Metric | `aptiverse.family.pledges.created` (counter), `aptiverse.family.pledges.amount_cents` (histogram) |
| Log fields | `UserId`, `PledgeId`, `GoalId`, `StudentId`, `AmountCents` |

Request: `studentId`, `goalId`, `amountCents` 1000 to 500000, `note` optional max 200.

Rules: active link with `share_goals`; the goal is checked through `IGoalLookup` (belongs to the child, status `active`, due in the future). Progress's baseline rule already applied to every goal at creation, so a pledge cannot reward a target already met.

Response `201 PledgeView`. Events: `PledgeCreated` (Progress locks the goal and shows the pledge; the student is notified).

Failures: `403 family.not_shared` (goals); `404 family.child_not_found`; `409 family.pledge_goal_invalid`.

- [ ] **BE-FAM-12** Create a pledge on a verifiable goal (original allowance task, create part) *(deferred: decision 6, not in v1)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: goal validation branches
  - [ ] Integration tests: happy, goal not shared 403, achieved goal 409, idempotent replay

### BE-FAM-29  GET /family/pledges (deferred: decision 6, not in v1)

Permission `family.parent` (pledges they made) or `family.student` (pledges on their goals); rate limit `default`; metric `aptiverse.family.pledges.list.duration`. Request `status` optional. Response `PagedResult<PledgeView>`: `id`, `goalId`, `goalTitle`, `studentDisplayName` or `sponsorDisplayName`, `amountCents`, `status`, `earnedAt`, `paidAt`, `paidVia`.

- [ ] **BE-FAM-29** List pledges (both sides) *(deferred: decision 6, not in v1)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: side-specific fields
  - [ ] Integration tests: parent view, student view

### BE-FAM-30  POST /family/pledges/{id}/cancel (deferred: decision 6, not in v1)

Permission: the pledging parent; allowed only while `pledged` (not after the goal is achieved; `409 family.pledge_locked`); idempotent; metric `aptiverse.family.pledges.cancelled` (tag `reason`); publishes `PledgeStatusChanged`; the student is told neutrally.

- [ ] **BE-FAM-30** Cancel a pledge *(deferred: decision 6, not in v1)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: state guard
  - [ ] Integration tests: happy, earned 409

### BE-FAM-31  POST /family/pledges/{id}/mark-paid (deferred: decision 6, not in v1)

Record-only path (the recommended first step if pledges return; open question 5): the parent pays the child outside the app and records it. Permission: the pledging parent; allowed when `earned`; idempotent; sets `paid`, `paid_via = 'outside_app'`; the student can see it; metric `aptiverse.family.pledges.paid` (tag `via`).

- [ ] **BE-FAM-31** Mark an earned pledge as paid outside the app *(deferred: decision 6, not in v1)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: state guard
  - [ ] Integration tests: happy, pledged (not earned) 409

### BE-FAM-32  POST /family/pledges/{id}/checkout (deferred: decision 6, not in v1)

Billing path, only if pledges return after launch and the legal review in open question 5 allows it: permission the pledging parent; state `earned`; calls `IOneOffCheckout.StartAsync` (purpose `one_off`, correlation `allowance_pledge`); sets `payment_pending`; returns `201 { authorizationUrl, reference }`. The `PaymentSucceeded` handler (BE-FAM-34) moves it to `paid` with `paid_via = 'billing'`. How the money reaches the student is unresolved (open question 5).

- [ ] **BE-FAM-32** Pay a pledge through Billing (also needs legal review) *(deferred: decision 6, not in v1)*
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: state guard
  - [ ] Integration tests: happy against the Billing fake, wrong state 409

### BE-FAM-14  POST /family/consent/requests

Parental consent for under-18 accounts (POPIA section 35). A minor student asks a parent for consent: this is `POST /family/invites` with `isConsentRequest = true` when no link exists, or, when the parent is already linked, a consent request on the existing link (sends the consent email without a new link).

| | |
|---|---|
| Operation id | `requestParentalConsent` |
| Permission | `family.student` |
| Entitlement | free |
| Rate limit | `family-invite` |
| Idempotency | one pending consent request per student; repeat returns the existing one |
| Metric | `aptiverse.family.consent.requested` (counter) |
| Log fields | `UserId`, `InviteId`, `LinkedParent` |

Request: `parentEmail` (when not linked) or `linkId` (when linked).

Response `201 ConsentRequestView`: `status: "pending"`, `expiresAt`, `parentEmailMasked`.

Failures: `409` when the student is not a minor (`family.consent_not_needed`) or consent is already granted.

- [ ] **BE-FAM-14** Parent consent for under-18 accounts: request step
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: minor detection boundary
  - [ ] Integration tests: linked parent, new parent via invite, adult student 409

### BE-FAM-33  POST /family/consent/{token}/grant

Permission `family.parent` with a verified email equal to the request email; rate limit `family-token`; idempotent (already granted returns `200`); metric `aptiverse.family.consent.granted`; log fields `UserId`, `StudentId`, `DocumentVersion`. Request: `documentVersion` (must equal the current parental consent text version), `confirmIsParentOrGuardian` must be true. Writes an append-only `granted` row with IP and user agent, publishes `ParentalConsentGranted` (Identity records it in `user_consents` and lifts restrictions). Also creates the link when it came from an invite (accepting and consenting are separate calls in one UI flow).

- [ ] **BE-FAM-33** Parent grants consent
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: version check
  - [ ] Integration tests: happy, wrong parent 403, outdated version 409, idempotent

### BE-FAM-35  GET /family/consent

Permission `family.student` (own status) or `family.parent` (`?studentId=`, linked children only); response `200 ConsentStatus`: `required` (minor), `status` (`not_required`, `pending`, `granted`, `withdrawn`), `grantedBy` display name, `grantedAt`, `documentVersion`. Metric `aptiverse.family.consent.status_reads`.

- [ ] **BE-FAM-35** Consent status read
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: status derivation from the latest row
  - [ ] Integration tests: each status

### BE-FAM-36  POST /family/consent/withdraw

Permission: the consenting parent (`studentId` in the body); writes a `withdrawn` row, publishes `ParentalConsentWithdrawn`; Identity restricts the account again and the student is told; required confirmation flag; metric `aptiverse.family.consent.withdrawn`. POPIA section 11(2)(b) right to withdraw.

- [ ] **BE-FAM-36** Withdraw parental consent
  - [ ] Endpoint
  - [ ] Records
  - [ ] Validator
  - [ ] Handler
  - [ ] Unit tests: only the consenting parent
  - [ ] Integration tests: happy, other parent 403

## Background work

- [ ] **BE-FAM-34** Pledge event handlers: `GoalAchieved` moves `pledged` to `earned` (notifies parent and student); `GoalAbandoned` and `GoalExpired` cancel `pledged` pledges; `PaymentSucceeded` with correlation `allowance_pledge` moves `payment_pending` to `paid`; all replay-safe via `pledge_events` unique key; each publishes `PledgeStatusChanged` *(deferred: decision 6, not in v1)*
- [ ] **BE-FAM-37** `ExpireInvite` scheduled message at `expires_at` (stale-guarded by `expires_at`), sets `expired`; inviter notified once
- [ ] **BE-FAM-38** `AccountDeletionRequested` handler: removes the user's links (either side, `removed_by = 'system'`), cancels invites, keeps `parental_consents` rows for 5 years as evidence of lawful processing (POPIA accountability) with the student id only, deletes `child_events` for a deleted student
- [ ] **BE-FAM-40** Data export contributor (BE-IDN-37): links, sharing flags, invites sent, consent rows

## Production readiness

### Threat model (STRIDE summary)

| Threat | Where | Mitigation | Task |
|---|---|---|---|
| Spoofing: posing as a parent to link a child | Invites | Student-side acceptance with verified email match; no parent-created child profiles | BE-FAM-04 |
| Spoofing: fake parental consent | Consent | Verified parent email equal to the request email, confirmation, IP and user agent recorded, consenting parent shown to the student | BE-FAM-33 |
| Tampering: invite token guessing or reuse | Invite routes | 256-bit tokens, hashed at rest, single use, rotation on resend, rate limits | BE-FAM-24, BE-FAM-55 |
| Information disclosure: parent reads unconsented data | Every parent read | `ScopedChildReader`, flags read on every request (never cached past `FamilySharingChanged`), 404 for unlinked | BE-FAM-13, BE-FAM-20 |
| Information disclosure: wellbeing | Wellbeing route | Only aggregates via `ISharedWellbeingTrend`, 3 check-in rule, default off | BE-FAM-08 |
| Information disclosure: exact activity times | Activity, celebrations | Rounded to the hour by the API | BE-FAM-10 |
| Information disclosure: email enumeration | Invites | Identical responses for existing and unknown emails | BE-FAM-03 |
| Repudiation | Consent | Append-only `parental_consents` | BE-FAM-16 |
| Denial of service | Invite spam | Daily invite limits, resend limits | BE-FAM-55 |
| Elevation | Student editing a parent's view or parent editing sharing | Sharing PUT only for the student on the link | BE-FAM-11 |

- [ ] **BE-FAM-50** Threat model in the README
- [ ] **BE-FAM-13** Authorisation tests: a parent reads only linked students and only consented data. A matrix over every parent endpoint and every flag combination (32) for linked, removed and never-linked children; removed links lose access immediately (cache invalidation)
- [ ] **BE-FAM-51** Student-side authorisation tests: a student cannot read another student's family data, cannot change flags on another student's link, cannot accept an invite addressed to another email

### Input limits, rate limits, idempotency, concurrency

- [ ] **BE-FAM-52** Body caps 2 KB; email normalisation (trim, lower case, IDN to punycode); field limits; tests
- [ ] **BE-FAM-55** Rate-limit policies `family-invite` 10/day/user, `family-token` 20/hour/user; tests trip both
- [ ] **BE-FAM-53** Idempotency: `Idempotency-Key` on invite create and consent requests; `If-Match` on sharing updates; unique indexes for pending invites and active links; `xmin` conflicts map to `409 family.concurrency_conflict`; test: a student accepting the same invite twice in parallel creates one link

### Data retention and POPIA

| Column | Classification | Retention |
|---|---|---|
| `invites.invitee_email` | Personal information (possibly a minor's email) | 90 days after the invite is no longer pending, then the row is deleted |
| `links.*` | Personal information (family relationship) | Removed links deleted 12 months after removal |
| `parental_consents.*` (IP, user agent) | Personal information; evidence of lawful processing of a child's data | 5 years after the student turns 18 or deletes the account (open question 4) |
| `pledges` (deferred, decision 6) | Personal information, small financial commitments | 2 years after closure, when built |
| `child_events` | Personal information (performance) | Mirrors the source data; deleted with the student |

- [ ] **BE-FAM-54** Classification in the README and POPIA inventory; retention jobs per row class; the parental consent text is versioned in the legal docs and its version is a config value checked at boot
- [ ] **BE-FAM-56** Minors: restriction behaviour for unconsented minors implemented through an Identity-held flag set by `ParentalConsentGranted` and `ParentalConsentWithdrawn` (Identity backlog), with an end-to-end test (HRD-32)

### Audit

- [ ] **BE-FAM-57** Audit events: link created and removed (by whom), sharing changed (which flags), consent granted and withdrawn

### Observability

- [ ] **BE-FAM-58** Trace spans: `family.scope.resolve`, `family.overview.block` (attribute `block`), `family.contract.call` (attribute `contract`)
- [ ] **BE-FAM-59** Metrics on meter `Aptiverse.Family`: `aptiverse.family.links.active` (observable gauge), `aptiverse.family.invites.conversion` (counter, tag `outcome` accepted, declined, expired), `aptiverse.family.not_shared_responses` (counter, tag `scope`), `aptiverse.family.overview.block_timeouts` (counter), `aptiverse.family.consent.pending_minors` (observable gauge)
- [ ] **BE-FAM-60** Alerts: overview block timeouts above 5% over 15 minutes; projection handler dead letters; pending consent requests older than 14 days above a threshold (product follow-up, not paging)

### Performance budgets

- [ ] **BE-FAM-61** Budgets: batch overview p95 under 400 ms for 4 children (cache under 60 ms); child overview p95 under 300 ms; activity p95 under 150 ms; `EXPLAIN` on `child_events` reads with flag predicates; index `(student_user_id, occurred_at desc)` verified

### Migration safety and SLO

- [ ] **BE-FAM-62** Expand and contract; flags added later default to `false` (never silently share a new area); rollback notes per migration
- [ ] **BE-FAM-63** SLOs: parent reads inside the platform p95 SLO; event to `child_events` within 2 minutes for 99%

### Further tests and operations

- [ ] **BE-FAM-64** Test: turning a flag off hides past items in activity, celebrations, overview and goals immediately (cache invalidated)
- [ ] **BE-FAM-65** Test: activity and celebration times are always on the hour in responses (property-based over random event times)
- [ ] **BE-FAM-66** Test: pledge state machine, one test per transition, plus replayed `GoalAchieved` and `PaymentSucceeded` events change nothing extra *(deferred: decision 6, not in v1)*
- [ ] **BE-FAM-67** Test: no parent endpoint response contains any field from a Wellbeing check-in or diary (schema scan of response records)
- [ ] **BE-FAM-68** Seed for local dev: a parent with two children (one minor with consent, one adult university student), different sharing flags, and shared and unshared goals
- [ ] **BE-FAM-69** Copy review of every parent-facing event title and notification for neutral wording (no surveillance tone)
- [ ] **BE-FAM-70** k6 parent dashboard scenario (batch overview plus celebrations) at 10x peak
- [ ] **BE-FAM-39** Error code contract test (every `Error` constant in the error code table)

## Old data mapping

| Old (43f9faa) | New | Notes (feeds MIG-05) |
|---|---|---|
| `auth.parent_links` (`long Id`, `ParentUserId`, `ParentName`, `StudentUserId` nullable, `StudentEmail`, `Token` plain text, `Status` pending, accepted, declined, `RespondedAt`) | accepted rows to `family.links` (with a synthetic accepted `invites` row for `created_from_invite_id`); pending rows to `family.invites` | Plain-text tokens are not migrated: pending invites get new hashed tokens and are re-sent after cutover (or expired, decide in MIG-05); sharing flags get the defaults, with wellbeing off (old app had no consent-scoped sharing, so nothing new becomes visible) |
| `auth.student_parents`, `auth.parents` | none | Role and profile tables replaced by Identity roles and links |
| Old endpoints (`POST invites`, `GET mine`, `DELETE {id}`, `GET students/{id}/overview`, `GET invites/incoming`, `GET invites/token/{token}`, `POST invites/{token}/accept`, `POST invites/{token}/decline`, `GET parents`, `DELETE parents/{id}`) | BE-FAM-03, 06, 05, 07, 21, 24, 04, 25, 26, 05 | One-to-one route mapping for the web rebuild |
| `goals.goal_allowances` | none | Created at `dc457d3` and dropped by the `GoalBaselineAndQuotaGrants` migration before `43f9faa`; there is no live pledge data to migrate |
| `identity.user_consents` (`DocumentType`, `DocumentVersion`, `AcceptedAtUtc`, `Source`, `IpAddress`, `UserAgent`) | stays in Identity (MIG-04) | No parental consent rows existed; minors at cutover need consent requested after launch (open question 8) |

## Tests

- Unit: invite rules, token handling, consent policy and minor boundary, scope resolution, overview block visibility, time rounding. (Pledge state machine tests are deferred with decision 6.)
- Integration: every slice happy, validation, forbidden, not found; BE-FAM-13 matrix; consent flow end to end.
- Property-based: BE-FAM-65.

## Open questions

1. Decided (30): Identity captures `date_of_birth` at onboarding (students); parents confirm they are 18 or older. It drives minor detection here, Affiliates 18+ and Billing payer age.
2. What is restricted for an unconsented minor? Recommended: account works for 14 days after sign-up, then AI tutor, practice generation and parent features pause until consent; academics stay usable. Needs sign-off from the Information Officer (decision 32).
3. If the consenting parent's link is removed, does consent stay valid? Assumed yes until withdrawn; the student is prompted to ask another parent.
4. Decided (39): retention of parental consent evidence is set with the Information Officer and an accountant (the periods are a fact owed, DECISIONS.md section F); until then rows are kept and never purged.
5. Pledge payments: deferred with decision 6. If pledges return, money flowing from a parent through Aptiverse to a minor makes Aptiverse a payment intermediary; start record-only (BE-FAM-31) and keep BE-FAM-32 behind a legal review.
6. Resolved: the shared wellbeing trend is free when the student shares it (the old app removed the gate). Kept here for traceability.
7. Obsolete: pledges are not in v1 (decision 6).
8. Existing minors at cutover have no parental consent rows: request consent by email after launch with a grace period, or treat as consented under the old terms?
9. Can a minor turn off sharing for the parent who gave consent? Assumed yes (sharing is about visibility, consent is about processing); confirm.
10. Decided (13): parent insights are free, so no parent read is gated by an entitlement in v1.
