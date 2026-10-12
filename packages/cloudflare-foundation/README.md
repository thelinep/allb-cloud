# Native Cloudflare qualification foundation

Worker-native ESM for D1 guarded draft revisions, immutable version/audit records, transactional outbox, private R2 objects, session-bound HMAC access envelopes, Queues verification jobs and native Cloudflare Email binding contracts. No PostgreSQL transaction emulation, Node filesystem storage or SMTP fallback.

This is **an isolated qualification foundation, not the existing application's full backend port**. The `cf_` schema does not migrate existing PostgreSQL records or implement login, invitations, account recovery, MFA enrollment, scene/quote/client decisions or production handoff. No public data API is exposed: the qualification worker returns 503. Do not map its fixture session table to an unverified production identity issuer.

## Local checks

From repository root:

```sh
NODE_OPTIONS="--require $PWD/scripts/local-qualification/loopback.cjs" node tests/cloudflare/foundation.mjs
NODE_OPTIONS="--require $PWD/scripts/local-qualification/loopback.cjs" node tests/cloudflare/auth-cost.mjs
node tests/cloudflare/notifications.mjs
```

The preload is test-only: this managed container cannot enumerate network interfaces, so only the observed `uv_interface_addresses` failure is replaced with loopback. It never enters the Worker bundle or changes host networking. Never use it as production configuration.

The foundation test uses installed Miniflare/workerd with actual D1, private R2 and Queues bindings, plus explicit injected failure mocks. It seeds synthetic identities and documents, tests atomic authorization/revision races, failure rollback, deduplication and restart persistence, and deletes its temporary local storage. It does not call Cloudflare accounts or certify deployed quotas.

R2 objects here are generic bounded private bytes, **not validated image uploads or generated derivatives**. Existing image validation/quarantine/derivative logic must be connected separately. Access envelopes require current session authority at download; a valid signature alone grants no access. No public bucket, direct bearer URL, retention deletion or automatic orphan sweep is enabled.

The native EMAIL adapter is internal only. Its caller must load durable consent and authorized recipient records; no public send endpoint exists. Current checks mock the binding and send no actual emails. An acknowledgement is `accepted`, never `delivered`; uncertain timeouts cannot be safely auto-retried.

`wrangler.local.jsonc` is local qualification only: synthetic D1 identifier, local bucket/queues, no account or domain routes. Do not deploy it. Production identifiers, sender onboarding, dead-letter/alert ownership, retention, backup/restore and rollout require separate acceptance.
