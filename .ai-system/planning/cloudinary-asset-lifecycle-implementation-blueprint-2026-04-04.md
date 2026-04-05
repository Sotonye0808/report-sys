# Cloudinary Asset Lifecycle Implementation Blueprint

Date: 2026-04-04
Mode: Planning only (no code)
Scope: Bug report screenshots first, reusable foundation for future assets

---

## 1) Feature Summary

Implement a managed media asset lifecycle backed by Cloudinary with explicit ownership, state transitions, and cleanup guarantees.

Why needed:

- Current bug report screenshot handling stores data URLs as text payloads and lacks robust lifecycle cleanup.
- This creates DB bloat risk, weak cancellation/replacement handling, and limited observability.
- A centralized asset lifecycle enables safe media workflows for bug reports now and future modules later.

Target outcomes:

- Store references to managed assets (not large inline payloads).
- Enforce safe cleanup for canceled, cleared, replaced, and stale temporary assets.
- Keep draft retention behavior: if form persists, asset remains retrievable and previewable.
- Support current preferred strategy (deferred upload on submit) while preparing for future pre-upload mode.

---

## 2) Architecture Impact

Affected modules:

- app/api/bug-reports/\*
- modules/bug-reports/components/BugReportPage.tsx
- modules/bug-reports/components/BugReportManagePage.tsx
- lib/data/\* (Prisma integration and cache interactions where needed)
- lib/utils/serverLogger.ts and request-context logging flow
- prisma/schema.prisma and migrations
- config/content.ts (user-facing messages)

New architecture boundaries:

- Asset Adapter: Cloudinary-specific upload/delete/path resolution
- Asset Lifecycle Domain: app-level consistency, state transitions, compensation
- Asset Session and Cleanup: explicit temporary ownership and TTL sweeper

---

## 3) New Modules and Services Required

1. lib/services/assets/cloudinaryService.ts

- Build normalized upload and delete operations.
- Resolve deterministic folder paths: root/project/subfolder.
- Return canonical asset metadata (publicId, secureUrl, bytes, mime, width, height).
- Enforce idempotent delete semantics (safe if already deleted/not found).

2. lib/services/assets/assetLifecycleService.ts

- Own lifecycle state machine and transitions.
- Coordinate DB transaction boundaries and compensating Cloudinary actions.
- Validate ownership and actor permissions.

3. app/api/assets/\* endpoints

- Session init, upload/replace, finalize attach, discard, and stale cleanup trigger (manual/admin).

4. Cleanup worker orchestration

- Scheduled stale TEMP reaper based on TTL.
- Retries with backoff for transient Cloudinary failures.

5. Compatibility bridge in bug-report domain

- Preserve read compatibility for legacy screenshotUrl records during migration window.

---

## 4) Environment and Configuration Contract

Required Cloudinary keys:

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Required path controls:

- CLOUDINARY_ROOT_FOLDER
- CLOUDINARY_PROJECT_ASSET_FOLDER

Optional controls:

- ASSET_TEMP_TTL_MINUTES (default policy for stale TEMP assets)
- ASSET_UPLOAD_STRATEGY (deferred_submit | preupload_draft)

Folder composition rule:

- finalFolder = CLOUDINARY_ROOT_FOLDER/CLOUDINARY_PROJECT_ASSET_FOLDER/<assetDomain>/<yyyy>/<mm>
- initial assetDomain = bug-reports
- reserve future assetDomain values for other modules

---

## 5) ACID and Consistency Model

Important constraint:

- True distributed ACID across PostgreSQL and Cloudinary is not possible.

Planned guarantee model:

- ACID inside PostgreSQL via Prisma transactions for lifecycle records and attachment mapping.
- External side effects (Cloudinary upload/delete) handled with deterministic compensation and idempotent retries.
- No user-facing operation should remain in ambiguous state without a recoverable path.

Consistency principles:

- Every external upload maps to a DB lifecycle row.
- Every state transition is auditable and request-id traceable.
- Every orphanable path schedules cleanup.

---

## 6) Domain Model Blueprint (Prisma planning)

Model: MediaAsset

- id
- ownerUserId
- domain (BUG_REPORT)
- cloudProvider (CLOUDINARY)
- publicId
- secureUrl
- folderPath
- originalFileName
- mimeType
- bytes
- width
- height
- status (TEMP | ATTACHED | ORPHANED | DELETED)
- attachedEntityType (BUG_REPORT | null)
- attachedEntityId (string | null)
- createdAt
- updatedAt
- attachedAt (nullable)
- deletedAt (nullable)

Model: AssetUploadSession

- id
- ownerUserId
- purpose (BUG_REPORT_SCREENSHOT)
- strategy (deferred_submit | preupload_draft)
- draftKey (nullable)
- currentAssetId (nullable)
- status (OPEN | FINALIZED | CANCELED | EXPIRED)
- expiresAt
- createdAt
- updatedAt

Model: AssetLifecycleEvent (optional but recommended)

- id
- assetId
- eventType (CREATED | REPLACED | ATTACHED | DISCARDED | CLEANUP_DELETED | COMPENSATED)
- actorUserId (nullable for worker)
- requestId
- metadata JSON
- createdAt

Migration strategy note:

- Keep BugReport.screenshotUrl during transitional compatibility phase.
- Introduce screenshotAssetId nullable relation.
- Populate screenshotUrl from secureUrl only as compatibility fallback until full cutover.

---

## 7) State Machine Blueprint

MediaAsset state transitions:

- TEMP -> ATTACHED
  - on successful bug report submit/finalize
- TEMP -> ORPHANED
  - on replace, explicit clear, cancel, or expired session
- ORPHANED -> DELETED
  - on cleanup job successful delete
- TEMP -> DELETED
  - immediate compensation after failed submit sequence when safe
- ATTACHED -> ORPHANED
  - if replaced from an editable entity and de-associated

Session transitions:

- OPEN -> FINALIZED
  - on successful submit and attach
- OPEN -> CANCELED
  - on user cancel/clear workflow
- OPEN -> EXPIRED
  - on TTL expiry

Idempotency requirements:

- Repeat finalize for same session should not duplicate attachments.
- Repeat delete cleanup should succeed as no-op when already deleted.

---

## 8) API Contract Blueprint (Planning)

Base: /api/assets

1. POST /api/assets/sessions

- Input: purpose, strategy, draftKey(optional)
- Output: sessionId, expiresAt

2. POST /api/assets/sessions/:sessionId/upload

- Input: file payload (or staged transfer payload), replacementOfAssetId(optional)
- Output: asset metadata + current preview URL
- Behavior: if replacement provided, prior TEMP asset becomes ORPHANED and cleanup scheduled

3. POST /api/assets/sessions/:sessionId/finalize

- Input: attachEntityType, attachEntityId
- Output: attached asset metadata

4. POST /api/assets/sessions/:sessionId/discard

- Input: reason (clear | cancel | refresh-abandon)
- Output: success
- Behavior: mark current TEMP asset ORPHANED and schedule cleanup

5. POST /api/assets/cleanup/run (admin/system)

- Input: dryRun(optional), limit(optional)
- Output: scanned/deleted/failed counts

Bug report API adjustments:

- POST /api/bug-reports accepts screenshotAssetId (preferred) and supports screenshotUrl only for migration compatibility path.
- Read endpoints return normalized screenshot object:
  - screenshot: { assetId, secureUrl, status } or legacy fallback from screenshotUrl

---

## 9) Data Flow Blueprint

Default flow: deferred_submit

1. User selects screenshot.
2. Client stores local preview only.
3. Submit starts: create session, upload, create bug report, finalize attach.
4. If create/finalize fails after upload, compensate via delete or mark ORPHANED for worker cleanup.
5. Return bug report with attached screenshot metadata.

Future flow: preupload_draft

1. User selects screenshot -> upload to TEMP session.
2. Draft persistence stores session and asset reference.
3. Refresh restores preview via session.
4. Submit finalizes attach.
5. Clear/cancel/replace marks old TEMP ORPHANED and schedules cleanup.

---

## 10) UI/UX Considerations

- Reuse existing component patterns and config-driven copy.
- Explicit states: uploading, attached, replacing, cleanup queued, failed.
- Replacement action should be deterministic and reversible until submit.
- Clear/cancel should communicate cleanup intent clearly.
- Draft-retained forms should restore preview without forcing re-upload.
- Validation and feedback should be actionable, not generic.

Accessibility:

- Keyboard support for upload/remove/replace controls.
- Text alternatives for status and preview context.
- Error messaging tied to form controls.

---

## 11) Risks and Edge Cases

- Upload succeeds but DB transaction fails.
- DB commit succeeds but Cloudinary delete compensation fails.
- Multi-tab race on same draft/session.
- Duplicate submits and repeated finalize calls.
- Ownership mismatch attempts (attach or delete foreign asset).
- Cleanup worker deleting asset still needed by retained draft.
- Legacy screenshotUrl record rendering during migration.

Mitigations:

- Request-id logging + lifecycle event records.
- Idempotent transition guards.
- Session ownership checks and server-side authorization.
- Conservative cleanup TTL and last-touch refresh.

---

## 12) Rollout Plan

Phase 1: Foundation

- Env contract + Cloudinary adapter + schema migration scaffolding

Phase 2: Lifecycle Core

- Session endpoints, upload/finalize/discard, lifecycle transitions, compensation

Phase 3: Bug Report Integration

- Switch bug report flows to screenshotAssetId; preserve compatibility reads

Phase 4: Cleanup and Observability

- Worker cleanup + lifecycle metrics + runbook updates

Phase 5: Hardening

- Concurrency, failure-injection, migration, and UX regression tests

Phase 6: Optional Future Mode

- Enable preupload_draft strategy behind feature flag

---

## 13) Validation Matrix (Test Planning)

Functional:

- Submit with screenshot attaches correctly.
- Submit without screenshot unchanged behavior.
- Replace before submit de-associates old TEMP asset.
- Clear/cancel marks temporary asset for cleanup.

Resilience:

- Simulate Cloudinary upload failure.
- Simulate DB failure after upload.
- Simulate cleanup failure and retry.

Concurrency:

- Double-click submit.
- Two tabs editing same draft.

Migration:

- Legacy screenshotUrl records still render.
- New records use screenshotAssetId path.

Security:

- Reject cross-user session attach/delete attempts.
- Validate file constraints and content type policy.

---

## 14) Concrete Task Queue Link

Detailed execution tasks have been appended in:

- .ai-system/planning/task-queue.md (section: Pending tasks added for Cloudinary managed asset lifecycle)

---

## 15) Required system-architecture.md Updates

Update these sections after implementation:

1. Module Breakdown

- Add asset services and lifecycle worker boundaries.

2. Data Flow

- Add asset session + attach + cleanup sequences.

3. Configuration Points

- Add Cloudinary keys and folder contract variables.

4. Known Constraints

- Clarify DB ACID plus external compensation model.

5. Architecture History

- Record migration from inline screenshot payloads to managed asset references.

---

## 16) Cloud Session Handoff Prompt (Ready to Paste)

Use this prompt in the cloud implementation session:

Read first:

- .ai-context.md
- .ai-system/agents/general-instructions.md
- .ai-system/agents/system-architecture.md
- .ai-system/agents/design-system.md
- .ai-system/planning/task-queue.md
- .ai-system/planning/cloudinary-asset-lifecycle-implementation-blueprint-2026-04-04.md

Task:
Implement the Cloudinary managed asset lifecycle feature exactly per the blueprint and task queue, starting with bug report screenshots.

Hard requirements:

1. Keep planning intent intact: no shortcut architecture.
2. Use env contract with CLOUDINARY_ROOT_FOLDER and CLOUDINARY_PROJECT_ASSET_FOLDER.
3. Folder structure must be root/project/domain/year/month.
4. Implement application-level ACID behavior: Prisma transaction for DB state plus compensating actions for Cloudinary side effects.
5. Handle cancel, clear, replace, refresh, and stale-temp cleanup safely.
6. Preserve draft-retention behavior (if draft persists, preview can be restored).
7. Do not force immediate upload on file select in default mode; support deferred_submit by default.
8. Add feature flag for preupload_draft future mode.
9. Add structured logs with request IDs for lifecycle transitions.
10. Maintain compatibility for legacy screenshotUrl records during migration.

Execution order:

1. Schema + migration groundwork (MediaAsset, AssetUploadSession, optional AssetLifecycleEvent).
2. Cloudinary adapter service.
3. Lifecycle domain service with state machine guards.
4. Asset APIs (session/create-upload-finalize-discard-cleanup).
5. Bug report API and UI integration to screenshotAssetId.
6. Cleanup worker/cron path for stale TEMP assets.
7. Test coverage (failure injection, race conditions, migration compatibility, ownership checks).
8. Docs update: system-architecture.md sections listed in blueprint.
9. Update task queue checkboxes as tasks complete.
10. Run validation: typecheck, targeted tests, build.

Quality gates:

- No stuck loading states on client.
- Idempotent finalize/delete behavior.
- Clear audit trail for lifecycle events.
- No regressions in existing bug report create/view flows.

Deliverables in cloud session final report:

- Files changed grouped by phase.
- Migration details.
- API contract summary.
- Test evidence and any residual risks.
- Follow-up recommendations.
