# Enterprise architecture decision record

## Scope and current authority

The unified Next.js app is the UI entrypoint. Its current Auth, scene, spatial and business views remain local demonstrations. Browser localStorage is advisory/local design state, not server authority. The preserved scientific Observatory/Rust/WASM source is not a live service of this app.

## Initial architecture

Use a modular monolith around the existing Next.js app; split deployment/services only when measured requirements demand it. Keep UI components independent of server authentication, persistence and domain logic. Boundaries: identity/session, organization/workspace authorization, design configuration/version publishing, asset storage, audit/outbox and brand-specific domain modules.

The proposed primary transactional database is PostgreSQL. This is an implementation default pending confirmation of the user's actual environment. Database migrations must enforce tenant identity and scoped references. Object storage holds asset bytes; immutable records hold references/checksums. Use background workers only for asynchronous work, with scoped service identity and retry-safe jobs.

## First enterprise vertical slice

Authenticated editor -> workspace-scoped draft -> immutable preview version -> authorized review -> atomic approved publication -> public renderer -> rollback, with tenant isolation and audit evidence. Configuration v1 from the current UI remains an import format; persisted/published configuration becomes the server source of truth.

## Trust boundaries

Clients cannot supply trusted user/tenant/role authority. Server session validation establishes user identity; server membership checks establish tenant/workspace scope. Browser data is validated input only. Review and publication use server-side permissions and concurrency checks. Assets are authorized/validated before publication. Public renderers receive approved published versions only.

## Release gates

UI/browser/accessibility evidence; real sessions and MFA; cross-tenant negative tests; migration/transaction tests; design publish/rollback E2E; selected brand acceptance; operational monitoring; measured load/resilience; backup restoration; production rollout and rollback evidence. A passing build alone does not pass these gates.

## Unresolved choices

Identity service/provider and existing MAATAA Auth availability; PostgreSQL environment; hosting/object storage; first brand and primary business workflow; production domain/release targets. Until supplied, no production credentials, deployments or enterprise certification claims are made.

## Evidence

E01 scope/architecture/task-registry tasks are recorded here and in enterprise-checklist.md. This records the implementation direction, not confirmation of unknown external infrastructure.

## User decisions — 2026-10-10

Use a new managed identity service (provider selection still required). Start with a disposable development database before staging/production. NEVO is the first business brand; its primary workflow and roles remain to be defined by the user.

NEVO first workflow (user confirmed): inquiry -> venue/layout draft -> quotation -> approval -> team handoff. Business rules, payment scope, team roles and acceptance examples still need domain definition before E09 implementation.

### Superseding identity decision

The user compared managed login with own development and explicitly rejected external SaaS. Extend MAATAA Auth in this repository. The earlier managed-login choice is superseded; no Auth0 or Clerk dependency is installed. See maataa-auth-comparison.md for the inspected source and implementation gaps.

Account policy confirmed: invitation-only; admin/publisher require MFA. Credential/session database storage and primitives are prepared but not connected to UI or API routes.
