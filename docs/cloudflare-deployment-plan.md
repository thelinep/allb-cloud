# Cloudflare-only deployment plan

Updated 2026-10-12 from the user's explicit Cloudflare-only decision. Production target: Workers, D1, private R2, Queues, Cron Triggers, Cloudflare secrets and observability. Node and PostgreSQL remain local/historical test tools, not approved production fallbacks. No deployment, DNS change, provisioning, email send or external configuration is authorized or performed.

## Actual checkout

The unified app is `apps/maataa-ui-route-source`. Installed OpenNext and Wrangler declarations, `wrangler.integration.jsonc`, and a generated Worker bundle exist. The integration config has assets and a self-reference only: no D1, R2, Queue or Cron bindings. Archived Hemant config must not be reused for the unified application.

Historical Worker smoke failed valid dynamic routes with NoFallbackError. Request-time fixture rendering and manifest-based early 404 validation now pass a fresh 552-case Worker Chromium matrix and 45 HTTP/registry checks. This qualifies public UI locally; authenticated D1 application cutover and remote staging remain open.

## Migration and acceptance sequence

1. CF01: public UI rendering is locally qualified under workerd. Keep Next.js App Router conventions. Current official docs recommend vinext for new applications; that is not authorization to replace this existing adapter without compatibility evidence.
2. CF02: port PostgreSQL migrations and repositories to D1. Current SQL uses PostgreSQL JSON functions and row locks; transaction callbacks cannot be mechanically mapped to separate auto-committed writes. Use native conditional statements and atomic batches; prove race/conflict, rollback, audit/outbox and tenant invariants.
3. CF03: qualify identity on Workers and D1 without weakening password hashing. Measure CPU/memory; verify fresh MFA, disabled accounts, revocation and server-derived tenancy.
4. CF04: native private R2 storage, immutable revision references and expiring authorized access. No public bucket or unauthenticated reference lookup.
5. CF05: Queues consumers with deduplication, bounded retries and dead-letter handling; demonstrate consistency with D1 outbox records.
6. CF06: qualify invitation/recovery delivery and commercial adapters on Workers. Cloudflare-only hosting does not create payment settlement or verified email delivery; Razorpay remains an external business integration.
7. CF07: replace PostgreSQL WAL recovery assumptions with D1 Time Travel plus reviewed exports to R2. Verify actual account limits, approve retention and perform restore/migration recovery drills.
8. CF08: authorized Cloudflare staging followed by regression, security, load/soak, recovery, manual accessibility, visual review and pilot. Production remains gated by E13.01-E13.08.

`node scripts/cloudflare-preflight.mjs` is read-only and deliberately exits 2 until qualification. Resource presence does not count as an acceptance pass.

## Official references checked 2026-10-12

- https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/
- https://developers.cloudflare.com/d1/worker-api/d1-database/
- https://developers.cloudflare.com/d1/reference/time-travel/

D1 batch statements are transactional, rolling back the sequence on a statement error. This does not establish equivalence with the application's existing read-dependent PostgreSQL transaction callbacks.
