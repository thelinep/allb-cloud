# E07 local design publishing implementation

Both existing Theme Studio and Branding Studio now include explicitly separate authenticated server controls. Their local save/apply/export/import behavior remains labelled local. The server panel lists workspace drafts/versions/publications/approval policy, saves optimistic-revision drafts, freezes immutable review versions, loads previews, records independent approve/change-request decisions and notes, publishes approved versions and rolls back to a previous route publication.

The real Next API uses server-owned configuration validation, session/account locks, current workspace membership, independent reviewer checks, configurable minimum approval count, chronological publisher MFA, workspace serialization, generation compare-and-swap, atomic publication/audit/outbox, and revision-bound validated asset references. Browser-supplied org/workspace IDs never grant authority.

Public design rendering is opt-in through exact canonical `ALLB_PUBLIC_DESIGN_HOST`, organization and workspace environment bindings. Visitors select a route only, cannot select a tenant, and unpublished routes return no config. No remote hostname, deployment or backend is provisioned. This client hydration design layer is not a claim of SSR metadata publishing.

## Evidence
- `node tests/design-publishing.test.mjs`: **29 assertions PASS**, disposable PostgreSQL/PGlite: stale revision/generation, tenant/role denial, independent approval, configurable two-approval rejection, SQL immutable versions, publisher MFA chronology, rollback, injected outbox failure rollback, session revocation.
- TypeScript passed after publishing API/control additions; final combined root check remains authoritative as parallel changes continue.
- `tests/design-publishing-browser.mjs` is the dedicated actual Next multi-user runner on port 3197. It requires a current production build and creates/cleans a disposable disk database. Browser execution result is recorded separately, not claimed from test source.

No commit, push, deployment, external service write or DNS change.

## Combined verification, 2026-10-10

Actual combined Next browser run: 16 multi-user workflow plus 4 public-scope/tenant/layout checks PASS. Evidence: artifacts/design-publishing-browser/results.json.
