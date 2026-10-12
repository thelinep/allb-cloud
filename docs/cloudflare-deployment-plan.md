# Cloudflare deployment readiness

User decisions: Cloudflare hosting; `nevoevents.in` already configured there; own MAATAA Auth, invitation-only accounts, MFA for administrators and publishers. Domain configuration is user-confirmed, not independently inspected. No deployment, account mutation, email send or DNS change has been performed.

## Current application

The root commands target `apps/maataa-ui-route-source`. That application pins Next.js 16.3.4 and currently has no OpenNext adapter, Wrangler dependency, deployment configuration or Worker bundle. The archived Hemant `wrangler.jsonc` under `sources/` targets `samwat.allb.xyz`, not the unified application or NEVO domain. Reusing that file would misroute deployment.

Cloudflare currently documents both its Next.js route and the OpenNext adapter. For this existing Next.js application, evaluate a pinned OpenNext adapter first to preserve the current framework contracts. This is a candidate, not verified compatibility. Official references reviewed: [OpenNext adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/), [automatic configuration](https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/). Automatic configuration can choose a different runtime, so do not run it blindly against this repository.

## Local reproducible inventory

```bash
node scripts/cloudflare-preflight.mjs
```

The inventory is read-only and emits no secrets. Exit 2 means missing prerequisites; it is deliberately not a passing compatibility test. Initial run: application found; adapter, Wrangler, configuration and Worker output blocked; runtime/database/email unverified. The script does not start workerd or prove that it failed in this environment.

## Runtime gates

1. Choose and pin an adapter version compatible with the exact Next.js version. Install in an isolated copy first; inspect peer dependency constraints and lockfile.
2. Add staging-only configuration with no production routes. Build Worker output and run workerd locally with `nodejs_compat`, not just the Node development server.
3. Verify SSR, assets, unknown-route 404s, cookies, server mutations, errors and Studio state on that runtime.
4. Benchmark credential verification separately. Current scrypt uses N=2^17/r=8: its approximately 128 MiB working memory excludes application and runtime overhead. Do not weaken password hashing to make it fit. A dedicated own Auth service may be necessary; approve that architecture only after memory/CPU measurements.
5. Select durable PostgreSQL connectivity and verify transactions, tenant isolation, session revocation, backups and restore against it. Disposable PGlite tests do not meet this gate.
6. Verify invitation/recovery outbound email capability, sender authentication and token lifecycle. Cloudflare DNS configuration alone does not establish email delivery.
7. Obtain authorized account/zone access through secure environment configuration. Never put credentials in chat, documents or client bundles. Create a separate staging target only after the local runtime gates pass.
8. Run staging E2E/security/load/recovery checks. Record artifact hashes, migration version, binding identifiers, rollback and monitoring evidence before production release.

No claim is made that Cloudflare Workers, the database or email service is production-ready for this app. The current plan is executable readiness work, not a deployment manifest.
