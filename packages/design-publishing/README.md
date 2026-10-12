# Design publishing server foundation

Internal SQL-backed service using existing migrations 001/002. This package is not an HTTP API and is not connected to browser Studio editors or public route rendering. No production certification is claimed.

`createPublishingService(db, {validateConfig})` requires a database with `transaction(fn)` and `query(sql, values)` methods. Inject the existing `parseConfig` export from `packages/design-config/config.ts` through the application's TypeScript server module. Do not inject a validator from request input. Database service credentials must remain server-only. Each operation accepts `{organizationId, workspaceId, sessionToken}`. Client-supplied user IDs and roles are never trusted.

Operations: saveDraft (revision CAS), submit (frozen version), preview (authenticated scoped version), review (append-only reviewer decision), publish (generation CAS), rollback (previously published approved version of the same route). All writes and reads in this initial service hold the workspace row lock and check the current membership and authenticated, unrevoked session. Session/account rows are held with shared locks until transaction commit, preventing concurrent revocation/disabling from racing publication. Owner/admin require an MFA timestamp at or after session authentication and no later than the current time. Editor can edit/submit; reviewer can approve/reject; owner/admin can publish. A submitter cannot review their own version. One current independent reviewer approval is required; any current authorized rejection blocks publishing. Decisions cannot be overwritten through this service; submit a new version after changes.

Publish/rollback write the publication pointer, immutable audit and invalidation outbox within one transaction. No outbox delivery worker is implemented. Rollback rechecks approval and requires prior publication audit evidence for the exact route. Versions are protected by existing immutable database triggers. This is a fixed initial approval policy, not a configurable approval engine. Service-level review immutability does not replace restricted database credentials or future database approval immutability enforcement.

Run from repository root:

```bash
node tests/design-publishing.test.mjs
```

Tests resolve PGlite from the application installation. An alternate installed application package.json may be supplied using `ALLB_PGLITE_PACKAGE`. Tests use disposable PostgreSQL/PGlite and the two actual migrations; no production database or network is used. The test fixture validates a deliberately small configuration contract so publishing behavior can be tested independently; production callers must use the full design-config parser.

Coverage includes tenant denial, viewer denial, revoked session, MFA enforcement (including stale/future timestamps), invalid scope, revision/generation conflicts, self-review denial, frozen preview, rejection before approval, immutable decisions, successive publications, rollback, and failure-induced atomic rollback of publication/outbox.

Task mapping: E07.01 persistence service only (HTTP pending); E07.03 immutable version foundation; E07.04 preview retrieval only (render pending); E07.05 revision-checked submission (review evidence contract pending); E07.06 decision foundation (change-request records pending); E07.07 fixed policy only; E07.08 route-scoped atomic publish foundation; E07.10 stale/authorization foundation; E07.11 rollback foundation; E07.12 audit foundation. E07.02 Studio connection, E07.09 public renderer/cache, and E07.13 multi-user browser E2E remain unimplemented. None of these IDs should be marked wholly complete based solely on this package.

## Authenticated editor integration
Both `/studio/themes` and `/studio/branding` retain explicitly local preview controls and now expose a separate authenticated server panel. `/api/integration/design` saves optimistic-revision drafts, freezes immutable versions, lists scoped records, previews versions, records independent approval/change-request notes, and publishes or rolls back atomically with audit/outbox records. All writes require same-origin JSON and the server session cookie. Browser scope IDs select a workspace but never supply authority.

`ALLB_DESIGN_MIN_APPROVALS` is a trusted server integer 1–10 (default 1). Approval is tied to exact immutable version; its author cannot approve it, rejected versions cannot publish, reviewer membership is checked at publication, and publisher admin/owner requires chronological MFA evidence.

Public rendering is **opt-in and exact-route scoped**: configure `ALLB_PUBLIC_DESIGN_HOST` (host including local port if applicable), `ALLB_PUBLIC_DESIGN_ORGANIZATION_ID`, and `ALLB_PUBLIC_DESIGN_WORKSPACE_ID`. `/api/design-public` takes only the requested route; tenant IDs never come from the visitor. With absent or mismatched host configuration it returns no published config. Browser-local preview settings remain a separate local feature. No hostname/DNS/deployment is created.
