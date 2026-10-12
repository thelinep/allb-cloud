# API authority and contract implementation

## Implemented locally

- Existing server-authoritative ALLB sessions and organization/workspace joins remain the only user authority. The resolver now checks membership revocation on every transaction without browser role or tenant cache.
- `POST /api/integration/nevo/membership` requires same-origin JSON, streaming byte bounds, exact schema, a current administrator/owner MFA session and `membership.manage`. Self changes and owner transfers fail closed. Role changes and revocation append immutable audit evidence in the same transaction; foreign-key history is preserved.
- Service grants are hashed tokens, explicitly scoped to one organization/workspace, expire within 30 days, permit only `design.read`/`asset.read`, and never impersonate a user. Creation and revocation require privileged user authority and append audits. Worker/job executors must opt into `withServiceWorkspace`; no background job is automatically provisioned.
- Commercial HTTP JSON now reads bounded streams before parsing (1 MB), enforces origin and JSON content type, and returns backwards-compatible fields with additive API version and request ID.
- Event-list HTTP uses bounded pagination (default 25, max 100, offset max 10,000) in the database query rather than slicing unbounded results.
- Shared server contracts provide strict object schema validation, request correlation, revision ETags / required If-Match parsing, transaction-local idempotency with advisory locks, mismatch conflict, atomic outbox insertion and durable database rate windows.

## Evidence

`node tests/api-authority.test.mjs` exercises real PostgreSQL-compatible PGlite transactions and an authenticated loopback HTTP fixture: membership downgrade/revocation on active sessions, guessed workspace denial, service scope and revocation, privilege grant rejection, body bounds, CSRF/origin, schemas, pagination, ETags, correlation, persisted limits, idempotent replay/mismatch and rollback/outbox integrity.

`node tests/nevo-records.test.mjs` passes 25 existing durable event/scene checks. `node tests/api-commercial-contract.test.mjs` passes 8 concrete repository idempotency/outbox checks, including a failed outbox write rolling back scene/event versions and idempotency records.

`tests/api-authority-browser.mjs` exports a real-Next browser suite for inquiry retry/conflict, pagination, ETags, commercial retry, stale conflict, privileged membership revocation against an already active producer session, and committed rate exhaustion after rejected business commands. Root runs this after the combined production build; this document does not predeclare that browser suite passed.

## Required adoption / remaining gates

- Apply migration `007_api_authority.sql` before invoking membership/service/rate/idempotency helpers. Existing pre-007 fixture authorization remains supported only for unaffected read/edit paths; revocation service requires 007.
- Commercial inquiry and transition HTTP routes now adopt persisted idempotency when an `Idempotency-Key` is supplied, scoped to trusted actor/method/path/body. Retries return the original result; changed content conflicts. Event responses emit revision ETags. Commercial transitions check `If-Match` against the expected revision when supplied; legacy clients retain body-based optimistic revision checks. All authorized commercial requests commit trusted-user rate counts independently (120 reads / 60 mutations per minute), then re-resolve authority for execution. Every event/scene audit emits a transactionally committed outbox record. This covers the concrete commercial flow; other APIs still require their own adoption review.
- Commercial rate counters commit independently of rejected business transactions. Rate-counter pruning and operational retention are separate operations work.
- Event inquiry and commercial transition responses propagate a safe original request ID. Other handlers using the shared response without an original Request generate a fresh ID.
- PGlite serializes execution; loopback fixture HTTP is not the deployed Next app or production PostgreSQL concurrency certification.
- No external authority, payment provider, queue, job grant, deployment or production connection was provisioned.

## Combined verification, 2026-10-10

Actual combined Next browser run: 16 authority/contract checks PASS. Evidence: artifacts/backlog-browser/results.json.

## E06 API coverage audit (current source)

| Surface | Contract adoption | Mutation semantics |
|---|---|---|
| NEVO context | Strict scope query; version; correlation/error envelope; committed user quota; freshly resolved identity | Read-only |
| NEVO event list/read | Strict allowlist and duplicate query rejection; bounded SQL pagination; version/error envelope; quota; event ETag | Read-only |
| NEVO inquiry | Strict inquiry schema, origin/stream bounds; version/error envelope; quota; persisted optional retry key; atomic audit/outbox | New inquiry; unknown client role fields rejected |
| NEVO commercial transition | Exact command/payload/quote-line schema; version/error envelope; quota; optimistic revision and optional If-Match; persisted optional retry key; atomic scene/event/outbox | Client and internal roles remain distinct; handoff provider status stays local evidence |
| Membership mutation | Exact schema, origin/stream bounds; version/error envelope; committed privileged quota; fresh MFA/authority; immutable audit | Revocation takes effect on already active user sessions; administrative operation intentionally cannot transfer owner or change self |
| Assets / operations | Separate owner adopting shared contracts, bounded paging and committed quotas | Their domain services own revision/retry/outbox semantics; confirm owner evidence |
| Auth / design | Root owns adoption and acceptance; audit found original independent envelopes and schema gaps | Confirm root evidence rather than infer completion |
| Public design / Kanban | Read-only public configuration/compiled registry | No authenticated mutation, payment or secret provisioning; root owns header/query coverage |

Additional source verification: `tests/api-schema.test.mjs` passes 29 strict-schema/version/error checks, including duplicate query fields, unknown privilege fields, unsupported versions, unsafe native SQL error suppression and canonical input hashes.

`node tests/api-authority-next.mjs` is the standalone real production Next runner. It starts the already built app with an isolated disk-backed fixture, runs the browser contract helper, stops the server, then verifies durable rate counts, idempotency rows, event/scene revisions and outbox rows. It does not build or deploy. Browser outcomes must come from this runner's actual report, not its source.

Final ownership update: membership changes support scoped optional retry keys inside the authorized transaction, so revocation replay returns the original result and preserves a single audit append. All owner/admin ALLB operations now also enforce the shared 15-minute MFA freshness policy. `tests/api-authority.test.mjs` passes 32 checks including stale privileged MFA and membership retry.

## Final owner verification, 2026-10-11

Auth enforces bounded streaming JSON/versioned correlated responses and server session/MFA authority. Auth token rotation/enrollment actions deliberately use single-use lifecycle semantics rather than replaying raw session/credential material. Design uses strict per-action schemas, bounded lists, committed quotas, optional actor-scoped retry keys, revision/generation conflict checks and atomic audit/outbox. Asset/job services implement bounded scope queries, optional upload replay, immutable revisions, validated references and durable queue retry semantics. Public design and Kanban validate read query/version and produce correlated envelopes. These are integration-surface guarantees; they do not certify every imported disconnected platform service or production provider.

Latest persisted actual Next artifacts: API authority 20 browser + 6 database assertions, backlog auth 17 lifecycle + 20 authority + 8 asset/job/header assertions, publishing 24 + 11 extra checks, assets/operations browser 20.
