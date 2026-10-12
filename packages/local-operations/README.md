# Durable local operations previews

`createLocalOperations` uses scoped authorization and DB-backed jobs. Enqueue is idempotent within organization/workspace; conflicting payload reuse fails. A transactional `FOR UPDATE SKIP LOCKED` selection serializes jobs, with bounded exponential retry and terminal dead-letter state. Local tick stores a notification/webhook preview result; no SMTP, WhatsApp, payment or HTTP delivery occurs. Failure injection exists only at package test level, not the HTTP endpoint.

Migration010 uses no remote bindings. `/api/integration/operations` lists jobs through design.read and enqueues/ticks through design.edit with same-origin POST. This is explicit local reversible validation, not a deployed scheduler. No autonomous worker, external webhook signature protocol, rate policy, replay/export queue or operational service-level guarantee is claimed.

## Completed local extensions

Notification previews require an explicit subject and current workspace consent. Consent grants/revocation, enqueue, retry, tick and local webhook receipts append audit/outbox rows in the same transaction; outbox does not mean externally delivered. The authenticated dashboard `/integration/operations` permits refresh, consent, enqueue, local processing and dead-job retry. SQL list pagination is bounded to100 records.

Local signed webhook fixtures use HMAC-SHA256 over `timestamp + '.' + exact raw bytes`, a five-minute clock window, constant-time signature comparison, scoped event IDs, duplicate no-op and changed-payload replay rejection. `ALLB_LOCAL_WEBHOOK_SECRET` must be explicitly configured. This does not assert compatibility with any provider protocol; it cannot approve payment or change financial records. No credential is returned to browser. True provider callback timeout/reconciliation and scheduler execution remain external gates.
