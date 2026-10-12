# NEVO Cloudflare integration

Inspected `thelinep/nevoeos` at `f50af9d`: `apps/web/open-next.config.ts` uses `defineCloudflareConfig({})`; Wrangler targets a custom worker entry and binds Hyperdrive, R2 and Queues for staging/production. ALLB adopts the OpenNext adapter interface, not NEVO account IDs, bucket names, payment variables or domain routes. Those resources belong to a separately verified deployment.

## Added implementation

The unified app now has an OpenNext configuration and `wrangler.integration.jsonc`, using `.open-next/worker.js`, `ASSETS`, Node compatibility and Worker self-reference. The configuration has no external domain routes and disables public preview URLs. It is a local build/preview candidate, not production readiness evidence.

From repository root:

```bash
node scripts/nevo-cloudflare-check.mjs
node scripts/nevo-cloudflare-check.mjs --build
node scripts/nevo-cloudflare-runtime.mjs
```

Exit 2 is a blocked readiness gate. The build option executes only the installed adapter; it never deploys or provisions resources. After a successful adapter build, local preview should explicitly select `wrangler.integration.jsonc` with `wrangler dev --local --config wrangler.integration.jsonc` from the app directory. Do not select the archived Hemant deployment configuration under `sources/`.

`--build --skip-next-build` is valid only when the existing Next.js output includes the standalone tree expected by OpenNext (for example, after an earlier adapter build). A regular build without standalone output cannot be repackaged that way. Avoid overlapping framework builds.

## Gates that remain open

- Registry metadata inspected for `@opennextjs/cloudflare@1.20.9`: Next.js peer range is `>=15.5.27 <16 || >=16.3.8`, Wrangler `^4.125.0`, and `rclone.js ^0.6.6`. ALLB's initial Next.js `16.3.4` does not meet that peer range. Upgrade and regression-test centrally before installing this adapter. `wrangler@4.149.0` requires Node.js `>=22.0.0`.
- Pin/install compatible OpenNext and Wrangler packages and generate the unified app lockfile; check adapter peer constraints against the exact installed Next.js version.
- The Kanban endpoint currently uses Node filesystem reads of repository documentation. A Worker deployment must serve a compiled snapshot or a validated durable registry binding instead. Do not treat a successful Node server as Worker verification.
- Own Auth uses scrypt `N=131072,r=8,p=1` with about 128 MiB algorithm working memory before application/runtime overhead. Keep hashing strength; measure CPU/memory and isolate credential verification in an own service if necessary. Session verification can have a separate runtime contract.
- NEVO request-scoped Hyperdrive connectivity must be adapted to ALLB tenant/auth contracts. Durable PostgreSQL transactions, revocation, pooled connection cleanup and tenant-bound queries need real integration tests. PGlite is not production persistence.
- R2/Queue/email operations need independently provisioned staging resources and credential-safe configuration. Copying a Wrangler binding does not implement upload authorization, retry/deduplication or email delivery.
- Verify SSR, asset serving, unknown routes, cookies, validated mutations, failures and server-bound Studio configuration on actual workerd; then run authenticated staging E2E, recovery/load and release gates.

Integration follow-up: centralized dependencies now install Next.js `16.3.8`, OpenNext `1.20.9` and Wrangler `4.149.0`; the Kanban endpoint serves a compiled JSON snapshot. The installed-dependency and filesystem readiness gates consequently pass. Runtime/persistence certification remains separate.

## Actual adapter build result

Executed `node scripts/nevo-cloudflare-check.mjs --build` after dependencies were installed. The adapter's Next.js production build passed. OpenNext packaging then failed with `ENOENT` for `.next/standalone/.next/server/pages-manifest.json`.

Root cause inspected in installed adapter source: OpenNext selects the nearest lockfile (`apps/maataa-ui-route-source/package-lock.json`) as its project root. Next.js uses the repository-level `outputFileTracingRoot`, and generated the actual manifest under `.next/standalone/apps/maataa-ui-route-source/.next/server/pages-manifest.json`. Resolve the lockfile/workspace and tracing-root disagreement together; do not create a fake manifest or silently copy generated files to claim runtime compatibility. `--skip-next-build` packaging reproduced the same failure. No runnable Worker bundle was generated, so application workerd verification is blocked, not passed.

Follow-up correction: repository npm workspaces and a root lockfile now agree with Next.js tracing; the app-level lockfile was removed. A fresh full adapter build succeeded and generated `.open-next/worker.js`. This closes the packaging gate above.

Actual local runtime attempt: `wrangler dev --local --config wrangler.integration.jsonc --ip 127.0.0.1 --port 8891` stopped before serving HTTP with `uv_interface_addresses returned Unknown system error 1`. The sandbox environment prevents runtime initialization; no route smoke checks executed. `nevo-cloudflare-runtime.mjs` reproduces local startup plus representative HTTP checks when the environment supports it. This environment result is blocked, not a runtime pass. Auth memory, durable database/bindings, authenticated operations and staging remain independent open gates.

No deployment, DNS mutation, Cloudflare API request or NEVO resource configuration is performed by this work.

## Final PostgreSQL packaging repair (2026-10-10)

The adapter initially failed to resolve `pg-cloudflare`: Next's Node trace included only the package's `default` export (`dist/empty.js`), while OpenNext's workerd conditions selected `dist/index.js`. `next.config.ts` now explicitly includes the package's JavaScript socket exports for `/api/integration/nevo/*`, supporting both workspace-hoisted and app-local installations. No generated bundle files or upstream packages were edited. Check/runtime scripts now find executables in either supported installation layout.

A fresh `node scripts/nevo-cloudflare-check.mjs --build` completed both the Next production build and OpenNext packaging; `.open-next/worker.js` was generated. The readiness script still exits 2 because it intentionally reports independent runtime, durable-binding and authentication resource gates. The current Kanban route also reads local repository files and is not Worker-safe; local live-registry access needs a compiled snapshot or a real durable registry service for Workers.

`node scripts/nevo-cloudflare-runtime.mjs` was executed against the repaired bundle. Wrangler stopped before HTTP initialization with `uv_interface_addresses returned Unknown system error 1`. `runtimeStarted` was false and zero HTTP checks executed. This is an environment-blocked result, not a runtime pass. No deployment or external provisioning was attempted.

Kanban follow-up: the endpoint now defaults to its bundled compiled snapshot (`source: compiled-snapshot`). An explicitly configured `ENTERPRISE_REGISTRY_DIR` enables local Node file reads (`source: local-repository`); it must not be set on Workers. Both paths return `agentActivity: unverified`, since registry polling does not verify agent sessions. Configured unreadable/malformed local records return 503 rather than silently pretending to be live. Three direct handler checks passed: default snapshot, opt-in local reads, and malformed-record failure. These are handler checks, not workerd HTTP verification.

The explicit disk-backed PGlite validation mode requires `@electric-sql/pglite` at runtime, so it is now an application dependency rather than a development dependency. The root lockfile was updated offline with `npm install --package-lock-only --offline --ignore-scripts`. Disk-backed PGlite is a local Node validation facility; it is not a Cloudflare durable database or a production persistence certification. Workers must use a separately configured/verified PostgreSQL connection and must not enable local disk mode. The `/api/integration/nevo/*` trace pattern covers the integration API prefix.

## Clean final build verification

Next 16 persistent `.next/server/route-cache` could preserve earlier prerendered HTML referencing removed chunks across incremental builds. The app's `prebuild` now runs `scripts/clean-next-build.mjs`, which resolves and validates the exact application `.next` path before removing only that generated directory. The final full OpenNext build executed that hook and passed Next compilation, TypeScript, 265 static generation entries, and Worker packaging. A static preflight examined 2,831 asset references in prerendered HTML and found zero missing files. Browser QA must run against this stable build; do not rebuild while its server is running.

Two Turbopack warnings remain: the explicit local Kanban filesystem branch causes broad project tracing. This is a deployment size/source-disclosure review gate. The default snapshot branch is filesystem-independent, but bundling still requires a scoped trace exclusion or documented tracing-ignore for the external local registry access before deployment. No deployment readiness claim is made.

## Latest combined backlog build — 2026-10-10

Ordinary Next production build PASS. OpenNext build now BLOCKED by native Sharp external alias after local asset validation integration. Earlier bundle success predates this change and does not certify the current combined source. Worker execution and credential-memory gates remain open.
