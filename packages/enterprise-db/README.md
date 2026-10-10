# Database foundation

The numbered migrations target PostgreSQL. Tenant-scoped references use composite organization/workspace keys. Identity is issuer + subject, never an inferred email-to-tenant match. `002_own_auth.sql` adds own-development credential/session/invitation/challenge/MFA storage. Configuration versions and audit records reject mutation; publication is a mutable pointer with a generation for optimistic concurrency. Approvals, publication permissions, author/reviewer separation and JSON schema validation must be enforced by the future authenticated service, not inferred from these tables.

Run `npm run test:db` after root `npm run setup`. Tests execute the migration on a disposable in-process PGlite PostgreSQL runtime. This verifies SQL constraints and transaction rollback, not production network connections, concurrent sessions, row-level authorization or backup recovery. No app endpoint reads these tables yet. PGlite is a development test dependency only.

Do not run the migration against production without a reviewed migration runner, schema tracking, least-privilege database roles and a verified backup. Schema ownership bypasses authorization; runtime roles and RLS belong to E05. Public route/domain ownership remains a separate requirement before multi-tenant publishing.
