# ALLB / MAATAA — atomic enterprise execution checklist

Baseline: unified UI commit `674dcc8`. This is the implementation program, not an enterprise-ready claim.

Every task has a stable ID. Work follows dependencies; a blocked task blocks its dependent gate, but independent preparatory work may continue. The machine-readable registry is `enterprise-task-registry.json`.

## E01 — Scope & architecture

- [x] **E01.01** Inventory current routes, renderers, assets, local state and disconnected services
- [x] **E01.02** Define MAATAA UI, identity, configuration, assets and business-service boundaries
- [x] **E01.03** Record trust boundaries and browser/server sources of truth
- [x] **E01.04** Define first enterprise vertical slice: tenant-scoped design publishing
- [x] **E01.05** Record runtime/database/auth assumptions and unresolved user decisions
- [x] **E01.06** Create atomic task registry, status rules and evidence requirements
- [x] **E01.07** Define release criteria and rollout scope

## E02 — UI verification

- [x] **E02.01** Install and verify a real headless browser runtime
- [x] **E02.02** Create reproducible desktop and mobile browser test configuration
- [x] **E02.03** Verify gallery search and category filters
- [x] **E02.04** Verify all landing-to-workspace and shared-tool handoffs
- [x] **E02.05** Verify draft editing, explicit apply and persistence after reload
- [x] **E02.06** Verify global/brand/family/exact-route appearance and identity
- [x] **E02.07** Verify Studio JSON validation, import/export and reset behavior
- [ ] **E02.08** Verify keyboard focus, navigation, forms and menus — IN PROGRESS
- [x] **E02.09** Run automated accessibility checks on all rendered routes
- [ ] **E02.10** Inspect desktop/mobile layouts for overflow and visual regressions — IN PROGRESS
- [ ] **E02.11** Add loading, error and not-found boundaries and recovery actions — IN PROGRESS
- [x] **E02.12** Fix findings and rerun affected checks
- [x] **E02.13** Record browser, viewport, version, evidence and unverified manual checks

## E03 — Database & environments

- [x] **E03.01** Confirm PostgreSQL target and secure connection configuration
- [x] **E03.02** Define organization/user/workspace/membership keys and tenant constraints
- [x] **E03.03** Define configuration draft/version/publication/approval records
- [x] **E03.04** Define asset/revision references and audit/outbox records
- [x] **E03.05** Create baseline migrations and development fixtures without production credentials
- [x] **E03.06** Apply migrations to a disposable database
- [x] **E03.07** Test tenant uniqueness, foreign keys and transaction constraints
- [x] **E03.08** Establish separate development/staging/production environment templates
- [x] **E03.09** Document expand-contract migrations and database recovery procedure

## E04 — Authentication

- [x] **E04.01** Confirm own identity/account policy, invitation-only signup and privileged MFA
- [x] **E04.02** Implement and test server credential verification and account identity mapping
- [ ] **E04.03** Enforce secure session cookies, expiry and rotation — IN PROGRESS
- [ ] **E04.04** Validate sign-in/out and callback error handling
- [ ] **E04.05** Implement session revocation and device/session listing — IN PROGRESS
- [ ] **E04.06** Implement and test MFA enrollment/challenge/recovery
- [ ] **E04.07** Implement invitation acceptance with expiry and single use
- [ ] **E04.08** Implement account recovery and anti-enumeration responses
- [ ] **E04.09** Remove demo authentication from production authority paths
- [ ] **E04.10** Test replay, expired session and disabled-account rejection — IN PROGRESS

## E05 — Tenant isolation & authorization

- [ ] **E05.01** Build authenticated server identity and tenant-context resolver
- [ ] **E05.02** Validate organization/workspace membership for every operation
- [ ] **E05.03** Define viewer/editor/reviewer/publisher/admin permission matrix
- [ ] **E05.04** Apply deny-by-default checks on read and mutation APIs
- [ ] **E05.05** Prevent client-controlled tenant/role escalation
- [ ] **E05.06** Test cross-tenant reads, writes and identifier guessing
- [ ] **E05.07** Define service identities and scoped background-job authority
- [ ] **E05.08** Audit role changes and membership revocation
- [ ] **E05.09** Verify revocation affects active sessions and cached authority

## E06 — Backend contracts

- [ ] **E06.01** Define versioned API schemas and server-side input validation
- [ ] **E06.02** Implement consistent error envelopes and request correlation IDs
- [ ] **E06.03** Implement bounded pagination and filtering
- [ ] **E06.04** Implement revision/ETag-based conflict detection
- [ ] **E06.05** Implement idempotency for retryable mutations
- [ ] **E06.06** Implement transaction boundaries and outbox event emission
- [ ] **E06.07** Apply CSRF/origin controls to cookie-authenticated mutations
- [ ] **E06.08** Apply appropriate rate limits and request-size limits
- [ ] **E06.09** Create authenticated contract/integration tests

## E07 — Enterprise design publishing

- [ ] **E07.01** Create workspace-scoped design draft API and persistence
- [ ] **E07.02** Connect both Studio editors to server-backed drafts
- [ ] **E07.03** Generate immutable configuration versions
- [ ] **E07.04** Render preview from a specific version without public mutation
- [ ] **E07.05** Submit a draft for review with evidence and revision checks
- [ ] **E07.06** Record reviewer decisions and change requests
- [ ] **E07.07** Require configured approval policy before publication
- [ ] **E07.08** Atomically publish an approved version per route/brand scope
- [ ] **E07.09** Load published configuration in public renderers with scoped caching
- [ ] **E07.10** Reject stale or unauthorized approval/publication attempts
- [ ] **E07.11** Implement rollback to a prior immutable approved version
- [ ] **E07.12** Record complete audit trail for edit/review/publish/rollback
- [ ] **E07.13** Run one multi-user tenant-scoped end-to-end publishing workflow

## E08 — Asset management

- [ ] **E08.01** Confirm object-storage target and retention policy
- [ ] **E08.02** Authorize workspace-scoped uploads and enforce size/type limits
- [ ] **E08.03** Verify actual file signatures and quarantine unsupported content
- [ ] **E08.04** Generate optimized image derivatives and validate outputs
- [ ] **E08.05** Track immutable asset revisions and storage checksums
- [ ] **E08.06** Attach exact asset revisions to configuration versions
- [ ] **E08.07** Scope download/view access and signed URL lifetime
- [ ] **E08.08** Implement orphan cleanup, retention and deletion rules
- [ ] **E08.09** Test invalid uploads and cross-tenant access rejection

## E09 — First brand application

- [ ] **E09.01** Select first brand and its primary commercial/business goal
- [ ] **E09.02** Define roles, entity lifecycle and measurable acceptance criteria
- [ ] **E09.03** Model its core records in the shared tenant-aware database
- [ ] **E09.04** Implement core read/create/edit APIs
- [ ] **E09.05** Connect forms, validation and save/conflict/error states
- [ ] **E09.06** Implement decisions, approvals and required outputs
- [ ] **E09.07** Integrate only required commercial/external services
- [ ] **E09.08** Test the complete business workflow with real persisted records
- [ ] **E09.09** Validate tenant isolation and audit evidence for the brand
- [ ] **E09.10** Conduct user acceptance against agreed criteria

## E10 — Operations & integrations

- [ ] **E10.01** Define required job types and delivery guarantees
- [ ] **E10.02** Create durable queue and retry/backoff policy
- [ ] **E10.03** Implement idempotent workers and dead-letter handling
- [ ] **E10.04** Implement notifications with consent and delivery status
- [ ] **E10.05** Authenticate inbound webhooks and prevent replay
- [ ] **E10.06** Handle external-service timeouts and reconciliation
- [ ] **E10.07** Implement operational job/retry dashboards
- [ ] **E10.08** Test duplicate, delayed and failed deliveries

## E11 — Hardening & recovery

- [ ] **E11.01** Define secrets, key rotation and environment access controls
- [ ] **E11.02** Add structured logs, metrics and traces
- [ ] **E11.03** Set actionable alerts and incident ownership
- [ ] **E11.04** Review dependency supply chain and vulnerabilities
- [ ] **E11.05** Review security headers, upload handling and abuse controls
- [ ] **E11.06** Define backup schedule and retention
- [ ] **E11.07** Run database/asset restore drills and measure recovery
- [ ] **E11.08** Verify audit integrity and retention policies
- [ ] **E11.09** Write incident, rollback and emergency-access runbooks

## E12 — Staging certification

- [ ] **E12.01** Prepare production-like staging data without sensitive production copies
- [ ] **E12.02** Run complete authenticated multi-tenant regression/E2E suite
- [ ] **E12.03** Run supported browser/device compatibility matrix
- [ ] **E12.04** Run accessibility automation and manual assistive-technology checks
- [ ] **E12.05** Review and approve visual regression baselines
- [ ] **E12.06** Run security and authorization abuse tests
- [ ] **E12.07** Run agreed performance/load/soak tests
- [ ] **E12.08** Inject failures and test recovery/reconciliation
- [ ] **E12.09** Verify backup restore and migration rollout/rollback
- [ ] **E12.10** Compile evidence manifest and unresolved release blockers
- [ ] **E12.11** Approve release candidate only after all mandatory gates pass

## E13 — Controlled production release

- [ ] **E13.01** Confirm domain, hosting, production accounts and rollout authorization
- [ ] **E13.02** Provision production secrets and restricted service identities
- [ ] **E13.03** Apply verified migrations with backups and monitoring
- [ ] **E13.04** Deploy immutable version and perform smoke checks
- [ ] **E13.05** Enable gradual rollout and watch operational indicators
- [ ] **E13.06** Execute rollback if defined thresholds are breached
- [ ] **E13.07** Record released versions and support ownership
- [ ] **E13.08** Close release gate with verified evidence

## E14 — Brand expansion

- [ ] **E14.01** Prioritize remaining brands by business value and dependencies
- [ ] **E14.02** Reuse verified components/contracts without duplicating authority
- [ ] **E14.03** Implement each brand's actual workflow and data model
- [ ] **E14.04** Run brand-specific acceptance, isolation and operational tests
- [ ] **E14.05** Publish only after that brand's own release gates pass
- [ ] **E14.06** Maintain shared component/version compatibility and deprecation policy

## Input and evidence rules

No task is completed merely by creating a placeholder, a test file, or a local demo. Runtime-dependent tasks require execution evidence. Browser automation does not replace manual accessibility or release acceptance.

User input is needed for existing identity service/provider, actual database/hosting accounts, first brand/business workflow, production domain and rollout. Do not place passwords, API keys or database URLs into chat or this repository; configure them through the chosen secure environment.


## Current checkpoint — 2026-10-10

28 of 131 tasks complete; 6 in progress. This is task-specific completion, not phase/release certification. E02 remains open for manual keyboard, full visual regression and runtime recovery checks. E03 covers a disposable development foundation, not a connected production database.

User decisions: own MAATAA Auth with no external SaaS; invitation-only accounts; admin/publisher MFA; disposable development PostgreSQL first; NEVO inquiry -> venue/layout draft -> quote -> approval -> handoff.

Evidence: enterprise-verification.json. Authentication core exists as server-only primitives; no login/API/UI backend is enabled. Operations, tenant authorization, publishing, business workflows and deployment remain pending.
