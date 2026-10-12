# ALLB Cloudflare-only release progress — 12 October 2026

## Result

Cloudflare-only release direction is recorded and synchronized into the application status snapshot. Target: Workers with the existing OpenNext adapter, D1, private R2, Queues, Cron Triggers, Cloudflare secrets and observability. This update is planning/readiness implementation, not a deployed or certified Cloudflare backend.

Current registry: **139 tasks: 98 complete, 41 blocked, 0 pending, 0 in progress**. The 98 completions are historical task-specific local evidence, not Cloudflare production certification. The blocked count increased from 33 because eight mandatory Cloudflare qualification gates were added. No previously blocked task was declared complete in this update. Previous 102/29 claims are unsupported by this checkout.

## Evidence and limitations

| Area | Actual progress | Remaining release condition |
|---|---|---|
| UI | 36 landing concepts and existing application surfaces; historical Chromium desktop/mobile matrix reports 552 expected, 0 failures, 0 skipped | Fresh Worker route matrix, human visual acceptance and physical devices |
| Packaging | OpenNext/Wrangler declarations, local config and generated bundle exist | Fresh compatible bundle; historical Worker smoke 6/7, /allb/nevo fails 404/NoFallbackError |
| Records | Existing PostgreSQL/PGlite local implementations | Native D1 migrations/repositories and race-safe atomic writes |
| Identity | Existing server-authoritative local identity and MFA implementation | Worker CPU/memory, D1 tenant checks and immediate revocation |
| Assets | Existing local asset evidence | Private native R2 adapter, scoped expiry and retention approval |
| Operations | Local outbox/queue evidence | Cloudflare Queues producer/consumer and retry/dead-letter qualification |
| Providers | Local commercial/notification evidence | Actual Workers-compatible delivery and payment verification |
| Recovery | Historical local restore evidence | D1 Time Travel/export, R2 recovery and migration drills |
| Release | Read-only preflight and explicit rollout controls | Authorized staging, SLO/soak, security, manual AT, pilot, owners and release approval |

## New mandatory gates

- CF01: OpenNext/workerd compatibility and routes.
- CF02: PostgreSQL-to-D1 schema and repository port.
- CF03: Workers/D1 identity, MFA and tenant authority.
- CF04: Private R2 assets and expiring authorization.
- CF05: Queues consumers and D1 outbox consistency.
- CF06: Workers-compatible notifications and commercial adapters.
- CF07: D1/R2 recovery and approved retention.
- CF08: Cloudflare staging certification and controlled release.

All original 33 blocked gates remain listed in docs/enterprise-task-registry.json. D1 recovery supersedes the PostgreSQL production recovery gate. R2 is selected; its retention and operational acceptance are not approved. Cloudflare-only hosting does not automatically replace external payment processing or establish verified outbound email.

## Validation performed in this update

- `npm run typecheck`: PASS, exit 0.
- `node scripts/sync-enterprise-snapshot.mjs`: PASS; generated snapshot equals source registry.
- Registry JSON/unique IDs/status totals: PASS; 98 complete and 41 blocked.
- `node scripts/cloudflare-preflight.mjs`: BLOCKED by design, exit 2; D1/R2/Queues/Cron bindings and runtime qualification absent. Output: artifacts/cloudflare-only-preflight-20261012.json.
- `git diff --check`: PASS.
- Scoped diff reviewed for target, gate and recovery changes. Existing package.json/package-lock.json edits were present before this update and left untouched.
- Production build, fresh Worker build, browser tests and external staging tests were not rerun in this documentation/readiness update. Historical browser results are explicitly historical.

## Files changed by this update

- docs/cloudflare-deployment-plan.md
- docs/cloudflare-release-progress-20261012.md
- docs/enterprise-task-registry.json
- docs/enterprise-execution.json
- docs/release-controls.json
- apps/maataa-ui-route-source/lib/enterprise-execution-snapshot.json
- scripts/cloudflare-preflight.mjs
- artifacts/cloudflare-only-preflight-20261012.json

No commit, push, deployment, DNS change, resource provisioning or external-service configuration performed. Existing unrelated modifications preserved.

## Official references reviewed

https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
https://developers.cloudflare.com/d1/worker-api/d1-database/
https://developers.cloudflare.com/d1/reference/time-travel/

D1 atomic batches require native application design; they do not automatically reproduce read-dependent PostgreSQL callback transactions. The existing OpenNext adapter is retained pending qualification; new-app framework recommendations do not establish compatibility for this repository.
