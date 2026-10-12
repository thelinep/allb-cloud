# Enterprise next-work release evidence

Date: 2026-10-10. Scope: six parallel local integration workstreams following the ALLB/NEVO source recovery. This is a release checklist and evidence ledger, not a production certification or a live agent feed.

## Evidence conventions

- PASS means the named command or browser assertion actually ran successfully, within its stated environment.
- BLOCKED means a named dependency or environment prevented execution or completion.
- OPEN means implementation, validation or an explicit product decision remains necessary.
- Historical checks are labelled separately from the current source validation. A successful earlier bundle cannot certify later source changes.
- PGlite provides PostgreSQL-compatible isolated integration evidence; it does not certify deployed PostgreSQL pooling, durability, concurrent processes or production backups.

## Workstream ledger

| Workstream | Implemented boundary | Verification and remaining gate |
|---|---|---|
| Runtime | OpenNext tracing includes the actual `pg-cloudflare` conditional-export ESM files for the integration routes. Kanban defaults to a compiled snapshot; filesystem records require an explicit local configuration. | Root final combined source TypeScript, Next production build and OpenNext Worker bundle PASS (`/tmp/allb-nextworks-final-typecheck.log`, `/tmp/allb-final-clean-build.log`). Readiness exit 2 is separate from bundle success. Local workerd BLOCKED before HTTP by `uv_interface_addresses` error; zero HTTP checks ran. Three direct Kanban handler assertions PASS. Clean-build asset coherence: 2,831 generated HTML static references checked, zero missing assets. A stale generated route-cache defect found during QA was corrected by the guarded clean-build hook; browser workflow must still pass independently. |
| Identity | Real login/logout/session/TOTP endpoints use existing ALLB authority; encrypted RFC6238 TOTP, counter replay rejection and durable account throttles. Explicit NEVO mapping remains authoritative. | Independently rerun `node tests/auth-http.test.mjs`: 10/10 service/database checks PASS. Actual Next HTTP Chromium helper: 34 assertions PASS. Factor enrollment/recovery, WebAuthn ceremonies, key rotation and deployed cookies remain OPEN. |
| Durable records | Migration003, tenant-scoped event/scene versions, expected-revision conflicts, immutable history and atomic audit writes. Explicit local PGlite mode persists on disk and serializes requests in a single Node process; it is rejected on Workers and never silently replaces PostgreSQL. | Independently rerun `node tests/nevo-records.test.mjs`: 25/25 checks PASS, including disk reopen, parallel optimistic collision and injected audit rollback. Deployed PostgreSQL pooling/concurrency, migrations and backup/restore remain OPEN. |
| Commerce | Exact quote/version approvals, selected `settled_payment` policy, versioned commercial commands and frozen insert-or-replay handoff. Local settlement evidence has `providerVerified:false`. | Independently rerun `node --test tests/nevo-commercial-persistence.test.mjs`: 19 assertions PASS, including disk reopen and immutable state. Real payment-provider confirmation, tax-inclusive invoice authority and production payment threshold remain OPEN. |
| UI/QA | `/integration/workflow` connects login/TOTP, server-authorized scopes, inquiry, scene/quote, ordered role-restricted decisions, local evidence and frozen handoff through MAATAA UI. | Actual Next Chromium runner PASS: 34 auth assertions plus 18 recorded workflow checks, with three screenshot/accessibility states at 1440 and 390 widths. Zero automated axe violations, page errors or overflow; visual inspection completed. Exact frozen digest and session survived a server-process restart. Physical device and manual assistive-technology validation remain OPEN. |
| Release coordination | This report scopes evidence and gates. | Registry completion is not inferred from an agent finishing. Source backup rehearsal passed ZIP CRC, per-file SHA-256, actual Git clone/patch restore and restored source comparison. Final archive uses the same verifier; production database backup/restore remains open. No commit, push, deployment, DNS or external configuration is authorized by this report. |

## Current independently rerun domain checks

Command:

```bash
node --test tests/nevo-commercial-adapter.test.mjs tests/nevo-scene-adapter.test.mjs tests/nevo-workflow.test.mjs
```

Result: **18/18 PASS**, comprising six commercial adapter tests, five scene adapter tests and seven existing workflow tests. Additional current independent checks: 10 auth service assertions, 25 durable event/scene assertions and 19 durable commercial assertions PASS. These are local domain/database tests, not deployed browser or durable production evidence.

The checks cover exact decimal conversion, mandatory payment policy, tenant/version/approval rejection, immutable handoff replay, scene frame/units validation, preservation-envelope integrity, stale writes and ordered commercial/client approvals. They do not send payments or provision storage.

## Historical baseline retained without promotion

- Six original `platform-*` packages were imported from the user ZIP; 126 imported file hashes matched provenance. All six builds passed. Original payment tests: 16/16; audit-evidence: 6/6.
- Identity adapter: 23 PGlite checks plus 11 genuine Auth/MFA package compatibility assertions. Separate isolated HTTP browser fixture: 18 Chromium assertions. Those fixtures do not prove actual application endpoint adoption.
- Actual imported MAATAA UI package built and passed its three upstream tests. Previous three-route desktop/mobile UI smoke checks had no automated accessibility, overflow, broken-image or page-error failures.
- Existing 131-task registry is a saved backlog. Its 29 complete / 25 in progress / 75 pending / 2 blocked counts predate this current integration verification and do not represent current live agent activity.

## Mandatory release gates

- [x] Current source TypeScript and production build, with no overlapping framework build. Final OpenNext bundle also passed; runtime remains separately blocked.
- [x] Current source local authenticated HTTP workflow: two tenants, cross-tenant denial, server-controlled role/tenant, origin rejection and session revocation. This uses the actual Next endpoints and explicitly configured disposable disk-backed PGlite; it is not a deployed PostgreSQL/staging claim.
- [x] Local scene save/reload/revision conflict and transaction rollback on the application repository contract. Network PostgreSQL isolation remains open.
- [x] Local quote revision, distinct internal/client decision, scoped manually recorded settlement evidence and immutable insert-or-replay handoff on persisted records. Provider confirmation remains open.
- [x] Desktop/mobile Chromium, keyboard, actual workflow error/denial states and automated accessibility checks. Comprehensive retry/failure recovery and manual/device validation remain open.
- [ ] Runnable workerd HTTP checks; current environment is blocked before HTTP.
- [ ] Review two Turbopack broad filesystem-tracing warnings from the explicitly enabled local Kanban repository path before deployment. The production default is the compiled snapshot; bundle success alone does not close tracing or runtime review.
- [ ] Production-like PostgreSQL configuration and migration rollout/rollback validation.
- [ ] Physical WebAuthn/MFA enrollment, challenge, revocation and recovery evidence.
- [ ] External payment provenance, refunds/cancellations and payment threshold decision; no locally entered settlement is represented as provider verification.
- [ ] Tax, contract and final payable-total policy approved before financial use.
- [x] Source backup CRC, membership hashes and actual Git/source restore rehearsal; final delivery verified by the same script. Production database restore remains OPEN.
- [ ] Supported browser/device matrix, manual accessibility, performance/load, failure recovery and security review.
- [ ] Staging sign-off and real production pilot; no deployment is performed by these local checks.

## Registry update rule

Broad tasks remain open when only a subset is implemented. For example, session revocation does not prove device/session listing, transaction support does not prove outbox delivery, and a local E2E does not prove staging certification. Completion changes must cite task-specific evidence and retain open gates. Recorded assignments must not be presented as active sessions after agents have finished.

The coordinator updated `docs/enterprise-execution.json` with evidence-backed recorded integration statuses. The broad 131-task registry was intentionally left unchanged. There is no live agent-session feed.

## Final browser command and evidence

```bash
ALLB_CHROMIUM_PATH=/workspace/scratch/80aa72c897e9/ui-browser-runtime/chromium node tests/nevo-workflow-browser.mjs
```

Exit 0. Evidence: `artifacts/nevo-workflow-browser/results.json`, `signed-out-1440.png`, `frozen-handoff-1440.png` and `mobile-saved-record-390.png`. The JSON explicitly records `evidenceMode: disposable_disk_pglite_actual_next_api` and `providerVerified:false`.

The runner verifies production HTML assets are available, required form validation, genuine enrolled TOTP, saved inquiry/scene, exact quote-bound internal approval, denied ADMIN impersonation of client authority, distinct CLIENT approval, denied premature handoff, explicit local booking/payment evidence, frozen handoff, restart persistence, frozen-edit rejection and cross-tenant API denial. The 18 recorded workflow checks include the nested 34-check auth-run result; they should not be flattened into an inflated distinct-assertion count.

QA discovered a keyboard-focus/accessibility defect, host CSS collisions and stale generated Next route-cache references. The focused UI fixes and guarded clean-build hook were applied; final browser and clean-build asset checks above ran after the fixes. Successful fixes do not close the separate deployment/runtime gates.

## Implementation entry points

| Boundary | Source |
|---|---|
| Login/session/logout/TOTP | `packages/auth-core/http.mjs`; `apps/maataa-ui-route-source/app/api/integration/auth/[action]/route.ts`; `packages/enterprise-db/migrations/005_auth_http.sql` |
| Database runtime selection | `apps/maataa-ui-route-source/server/nevo-database.ts` |
| Event and scene history | `packages/nevo-records/repository.mjs`; `packages/enterprise-db/migrations/003_event_records.sql`; `apps/maataa-ui-route-source/app/api/integration/nevo/events/route.ts` |
| Commercial transactions | `packages/nevo-commercial-adapter/service.mjs`; `apps/maataa-ui-route-source/app/api/integration/nevo/events/[eventId]/commercial/route.ts` |
| Workflow UI | `apps/maataa-ui-route-source/components/nevo-workflow.tsx`; `apps/maataa-ui-route-source/components/nevo-workflow.css`; `/integration/workflow` |
| Reproducible local fixture | `tests/helpers/nevo-local-fixture.mjs` (test-only accounts, not production bootstrap) |
| Current browser runner | `tests/nevo-workflow-browser.mjs`; `tests/auth-http-browser.mjs` |

This table is a source map, not a declaration that each file is newly created or a replacement for a scoped Git diff. The coordinator's final changed-file inventory must be taken from the working tree without staging unrelated files.


## Coordinator regression checks

`npm run test:routes`: PASS (82 concrete page modules, 263 supported catalogue URLs). `npm run test:authorization`: 30 PASS. `npm run test:publishing`: 26 PASS. Existing integration UI browser regression: six route/width checks plus two filled-form axe reports, 12 interaction/API checks PASS; zero page errors or accessibility violations. Logs are retained under `artifacts/next-work-validation`.
