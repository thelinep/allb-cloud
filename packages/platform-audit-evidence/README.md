# @platform/audit-evidence

NEVO v1 evidence-chain primitives extracted on 2026-09-13. The real consumer is
`nevo-event-os-3`: its event evidence API uses this package and its existing
`@nevo/evidence` package re-exports the public API. No runtime dependencies or ORM.

## API

- `hashEvidence(record)`: SHA-256 of the existing fixed-order JSON envelope
  `{ eventId, actor, action, payload, previousHash }`. Missing previous hashes
  serialize as `null`. Payloads retain ordinary `JSON.stringify` semantics;
  object keys are not sorted and JSON strings are not parsed. This is deliberate
  compatibility with existing hashes, not a new canonical JSON standard.
- `prepareEvidenceAppend(input, previousHash, maxSequence)`: computes the record
  hash and `(maxSequence ?? 0) + 1`, preserving the supplied payload and link.
  This is a pure preparation function, **not** a database append or lock.
- `verifyEvidenceChain(records)`: returns a boolean per row using the preceding
  row's hash, exactly as NEVO's v1 evidence export did. Supply the entire chain
  in ascending sequence order; it does not sort or mutate the input.

The consumer must authorize the event, acquire its per-event transaction lock,
read the tail and maximum sequence, prepare and insert the record inside that
same transaction. NEVO keeps its PostgreSQL advisory lock and unique
`(eventId, sequence)` constraint. Its Prisma writes, permissions, organization
scope, retention fields, and `writeAudit` call remain local.

## Compatibility and limits

This is an extraction, not a new tamper-proof storage system. The v1 hash covers
event, actor, action, payload and predecessor hash only. It does not cover sequence,
type, document hash, retention, timestamps, or the stored `previousHash` field
independently (verification reconstructs that link from the preceding row).
Per-row validity is not a cumulative verdict for the whole chain. Removing the
tail or rewriting and rehashing the entire chain requires an independent trusted
checkpoint to detect. Database immutability and live concurrency are not guaranteed
by these pure functions. No schema or persisted-hash migration is included.

## Source audit and intentional boundaries

- `nevo-event-os-3/packages/evidence/src/index.ts`: original hash helper.
- `nevo-event-os-3/apps/web/app/api/events/[eventId]/evidence/route.ts`: duplicate
  hash, export verification, and next-sequence preparation; now calls this package.
- NEVO's `AuditLog` is an ordinary organization-scoped audit table, not a hash
  chain. It stays local. The architecture proposal's combined Evidence/AuditLog
  characterization was inaccurate.
- `ne-2/apps/api/src/audit`: tenant-scoped SQL audit service with database
  immutability protections, not this hash format; no artificial consumer added.
- `tlpbtl/mom-location-os/packages/location-core/src/index.ts`: a different
  `appendAuditEvent` hashes its entire domain input and enforces its own predecessor
  check. That stored format and policy are not interchangeable with NEVO v1.
- NEVO's seed still has illustrative evidence hashes generated from arbitrary
  strings and lacks sequence values. That pre-existing seed issue is not migrated
  or relabelled as verified evidence here.
- Release certification manifests and UI evidence labels are separate concerns.

## Development

Run `npm ci --ignore-scripts`, `npm test`, and `npm run typecheck`. Tests run
against the built package using Node's test runner, including the frozen legacy
hash implementation, tampering cases, and explicit v1 limitations. NEVO's
`apps/web/tests/evidence-route.test.ts` exercises the real route with mocked
database/access boundaries. Those tests do not certify a live PostgreSQL lock.

Build before installing into consumers: `file:` installs package `dist/` according
to the explicit `files` list. Use a real consumer `pnpm install --ignore-scripts`;
manual symlinks do not test the packed dependency. No remote is configured.
