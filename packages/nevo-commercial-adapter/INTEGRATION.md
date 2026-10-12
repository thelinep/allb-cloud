# Durable local commercial integration

The Next application exposes authenticated, tenant-scoped event records at
`/api/integration/nevo/events` and commercial mutations at
`/api/integration/nevo/events/:eventId/commercial`.

Every mutation enters `withNevoIdentity`, locks the scoped event, checks the
database row revision, and appends immutable event/scene versions and audit
records in the same transaction. Browser roles and actor IDs are ignored.

Command authority is derived from the active NEVO identity intersected with the
ALLB membership: PRODUCER/ADMIN can author layouts, quotes, local bookings and
handoffs; FINANCE/ADMIN can internally review and record payment evidence;
only CLIENT can make the client decision. Existing privileged MFA checks apply.

The selected policy is `settled_payment`, INR, version 1. In this local workflow,
an authenticated finance user records a positive payment amount and an evidence
reference. This is explicitly `local_recorded_evidence`, `providerVerified:false`.
No provider capture, webhook verification, refund, bank reconciliation, tax
calculation, contract execution, inventory reservation or external booking occurs.
Positive advance evidence can satisfy this policy; full payment is not required
or claimed. SKU/price-version values are locally entered proposal data, not a
connected pricing catalogue.

Internal and client approval bind the exact quote ID/version and layout digest.
Editing layout or quoting again clears booking/payment evidence and approvals.
Handoff requires those approvals, local confirmed booking and positive payment
evidence. The frozen snapshot is canonically SHA-256 hashed so PostgreSQL JSONB
key reordering does not break replay after reload. Subsequent edits fail closed.

## Requests

- GET events: `organizationId`, `workspaceId`, optional `eventId` query params.
- POST events: scope, optional UUID `id`, `title`, `requestedDate`, `guestCount`.
- POST commercial: scope, `expectedRevision` (database row revision),
  `command:{type,payload}`. A same-origin JSON request is required.
- `layout`: `venueId`, `venueVersion`, MAATAA `scene`, `expectedSceneRevision`.
- `quote`: `id`, `currency:'INR'`, lines with `id`, `sceneNodeId`, `sku`,
  `priceVersion`, integer positive `quantity`, integer `unitPriceMinor`.
- `review` / `decide`: `quoteId`, `quoteVersion`, `outcome`, `note`.
- `booking`: `id` (local confirmation).
- `payment`: `id`, positive decimal-string `amount`, `currency:'INR'`,
  `evidenceReference` (local evidence).
- `handoff`: empty payload; repeat with current row revision returns replay.

Database and domain revisions are separate. The returned event row's `revision`
is the optimistic concurrency token. `event.state.revision` is the workflow
revision. A stale request returns 409 and writes nothing.

Validation: `node tests/nevo-commercial-persistence.test.mjs` exercises durable
records, role/scope denial, stale writes, injected audit failure rollback,
immutable history, replay and disk reopen. Actual Next browser validation is
owned by `tests/nevo-workflow-browser.mjs`, separately from these database tests.
