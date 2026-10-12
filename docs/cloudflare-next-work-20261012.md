# Cloudflare next work — implementation evidence

The existing public Next.js application now renders its dynamic fixture routes per request. The installed OpenNext adapter's prerender fallback produced NoFallbackError for valid routes; a static-assets cache experiment did not resolve it and was reverted. Request-time rendering fixes the problem. A manifest-based proxy rejects unknown fixture paths before streaming begins, preserving real HTTP 404s and working gallery recovery links. Existing science calculations and reference images were not changed.

Actual local Worker Chromium matrix: **552/552 PASS** across desktop/mobile and 266 routes, including all 36 concepts, search/category filters, theme/branding persistence, workspace navigation, keyboard, accessibility, overflow, broken images and Kanban filters. A hardcoded 131-task test expectation was replaced with the current registry count. Desktop NEVO and mobile gallery screenshots were visually inspected; human baseline approval remains a release gate.

Native D1/R2/Queues foundation implementation and tests are in packages/cloudflare-foundation and tests/cloudflare. This is not the full authenticated application cutover. See package README for boundaries. The unchanged scrypt primitive succeeds locally in workerd; real deployed CPU/memory quotas remain unverified. Seven native EMAIL binding contract tests are mocked; no actual email sent.

Dependency gate: maintained packages/notifications-runtime uses Nodemailer 10.1.0, active workspace excludes the untouched imported notifications snapshot, and the ineffective root override was removed. Fresh npm audit reports zero known advisories. All six platform builds pass. All 126 original imported files still match recorded SHA-256 values.

Registry: **100 complete / 39 blocked**, zero pending or in progress. CF01 is complete only for local public UI rendering; native backend identity and data cutover remain CF02-CF08. E11.04 is complete for the reviewed active dependency graph. No broad enterprise production certification is inferred.

Important remaining implementation gates: full D1 auth/lifecycle/scene/commercial repository migration; native application API and UI cutover; image-validation/derivative connection to R2; integration of all job kinds and consent/outbox delivery; Workers-compatible payment protocol. External gates: authorized staging resources, sender onboarding, real provider credentials, retention/SLO/incident owners, human accessibility/visual review, physical devices, pilot and rollout authorization.

Workerd also logs broken-pipe warnings when browser connections are cancelled. All browser assertions passed, but staged error-budget/soak qualification must distinguish request cancellation from service faults before release.

No commit, push, deployment, DNS change, Cloudflare provisioning or external configuration performed. Root dependency files already had unrelated changes when work resumed; required workspace/dependency updates were applied without staging or committing unrelated work.

## Fresh verification results

- Worker production build: PASS; readiness wrapper intentionally exits 2 for remaining gates.
- Worker Chromium desktop/mobile: 552/552 PASS, zero skipped/flaky/failures.
- HTTP/compiled registry: 45/45 PASS, including all 36 landings, valid workspace, unknown 404s and 100/39 snapshot.
- Native D1/R2/Queues: 22/22 PASS, including authorization TOCTOU, late outbox rollback, account disable/verification/credential rotation, actual Queue transport, session revocation and disk restart.
- Native EMAIL contract mocks: 7/7 PASS; no email sent.
- Scrypt workerd primitive probe: PASS at unchanged N=131072/r=8/p=1; local elapsed 281ms, deployed quota unverified.
- All six platform builds and TypeScript: PASS.
- Fresh npm audit: zero known advisory vulnerabilities; not universal security or license certification.
- Original vendor provenance: 126/126 SHA-256 matches.
- git diff --check and scoped review: PASS.
- Cloudflare preflight: BLOCKED, exit 2; no production-ready claim.

## Working-tree files

The list below includes earlier Cloudflare target updates plus this implementation batch. Artifacts/blocker-dependency-update.log and artifacts/blocker-worker-runtime.json predated this work; retained untouched. Generated build output is ignored. No staging/commit.

- apps/maataa-ui-route-source/app/allb/[slug]/page.tsx
- apps/maataa-ui-route-source/app/components/[slug]/page.tsx
- apps/maataa-ui-route-source/app/examples/[slug]/page.tsx
- apps/maataa-ui-route-source/app/invitations/[token]/page.tsx
- apps/maataa-ui-route-source/app/patterns/identity/[slug]/page.tsx
- apps/maataa-ui-route-source/app/patterns/production/[slug]/page.tsx
- apps/maataa-ui-route-source/app/playground/[slug]/page.tsx
- apps/maataa-ui-route-source/app/studio/components/[slug]/page.tsx
- apps/maataa-ui-route-source/app/studio/scenes/[sceneId]/page.tsx
- apps/maataa-ui-route-source/app/studio/scenes/[sceneId]/review/page.tsx
- apps/maataa-ui-route-source/app/studio/themes/[themeId]/page.tsx
- apps/maataa-ui-route-source/app/studio/workspaces/[workspaceId]/page.tsx
- apps/maataa-ui-route-source/app/workspace/[brand]/page.tsx
- apps/maataa-ui-route-source/lib/enterprise-execution-snapshot.json
- apps/maataa-ui-route-source/server/nevo-database.ts
- apps/maataa-ui-route-source/tests/browser/enterprise-ui.spec.ts
- artifacts/hardening/dependency-review.json
- docs/cloudflare-deployment-plan.md
- docs/enterprise-execution.json
- docs/enterprise-task-registry.json
- docs/release-controls.json
- docs/release-evidence-manifest.json
- package-lock.json
- package.json
- scripts/cloudflare-preflight.mjs
- scripts/nevo-cloudflare-check.mjs
- scripts/nevo-cloudflare-runtime.mjs
- apps/maataa-ui-route-source/playwright.cloudflare.config.ts
- apps/maataa-ui-route-source/proxy.ts
- artifacts/blocker-dependency-update.log
- artifacts/blocker-worker-runtime.json
- artifacts/cloudflare-all-routes-build-20261012.log
- artifacts/cloudflare-auth-cost-20261012.log
- artifacts/cloudflare-cache-build-20261012.log
- artifacts/cloudflare-dependency-install-20261012.log
- artifacts/cloudflare-dependency-review-20261012.log
- artifacts/cloudflare-final-build-20261012.log
- artifacts/cloudflare-fresh-build-20261012.log
- artifacts/cloudflare-fresh-build-retry-20261012.log
- artifacts/cloudflare-native-tests-20261012.log
- artifacts/cloudflare-native-tests-durable-20261012.log
- artifacts/cloudflare-native-tests-final-20261012.log
- artifacts/cloudflare-native-tests-final-qualified-20261012.log
- artifacts/cloudflare-native-tests-release-20261012.log
- artifacts/cloudflare-native/auth-cost.json
- artifacts/cloudflare-native/foundation.json
- artifacts/cloudflare-native/notifications.json
- artifacts/cloudflare-native/worker-browser.json
- artifacts/cloudflare-only-preflight-20261012.json
- artifacts/cloudflare-only-preflight-release-20261012.json
- artifacts/cloudflare-platform-build-20261012.log
- artifacts/cloudflare-release-build-20261012.log
- artifacts/cloudflare-ssr-build-20261012.log
- artifacts/cloudflare-typecheck-20261012.log
- artifacts/cloudflare-typecheck-final-20261012.log
- artifacts/cloudflare-typecheck-release-20261012.log
- artifacts/cloudflare-worker-all-routes-smoke-20261012.json
- artifacts/cloudflare-worker-browser-20261012.log
- artifacts/cloudflare-worker-browser-final-20261012.log
- artifacts/cloudflare-worker-browser-matrix-20261012.log
- artifacts/cloudflare-worker-browser-verified-20261012.log
- artifacts/cloudflare-worker-cache-smoke-20261012.json
- artifacts/cloudflare-worker-final-smoke-20261012.json
- artifacts/cloudflare-worker-release-smoke-20261012.json
- artifacts/cloudflare-worker-smoke-20261012.json
- artifacts/cloudflare-worker-ssr-smoke-20261012.json
- docs/cloudflare-next-work-evidence-20261012.json
- docs/cloudflare-next-work-evidence-20261012.md
- docs/cloudflare-release-progress-20261012.md
- packages/cloudflare-foundation/001_native.sql
- packages/cloudflare-foundation/README.md
- packages/cloudflare-foundation/assets.mjs
- packages/cloudflare-foundation/jobs.mjs
- packages/cloudflare-foundation/notifications.mjs
- packages/cloudflare-foundation/repository.mjs
- packages/cloudflare-foundation/worker.mjs
- packages/cloudflare-foundation/wrangler.local.jsonc
- packages/notifications-runtime/README.md
- packages/notifications-runtime/package.json
- packages/notifications-runtime/src/index.ts
- packages/notifications-runtime/src/local.ts
- packages/notifications-runtime/src/nodemailer.ts
- packages/notifications-runtime/src/types.ts
- packages/notifications-runtime/src/whatsapp/business-api.ts
- packages/notifications-runtime/tsconfig.json
- scripts/local-qualification/loopback.cjs
- tests/cloudflare/auth-cost.mjs
- tests/cloudflare/foundation.mjs
- tests/cloudflare/notifications.mjs

## Remaining gate IDs

E08.01, E08.07, E08.08, E09.07, E09.10, E10.04, E10.05, E10.06, E11.03, E11.06, E11.08, E12.01, E12.02, E12.03, E12.04, E12.05, E12.06, E12.07, E12.08, E12.09, E12.11, E13.01, E13.02, E13.03, E13.04, E13.05, E13.06, E13.07, E13.08, E14.03, E14.04, E14.05, CF02, CF03, CF04, CF05, CF06, CF07, CF08

## Commit review clarification

Staging all new files exposed terminal carriage returns, trailing spaces and EOF blank lines in captured raw `.log` artifacts. These logs are retained byte-for-byte to preserve recorded evidence hashes. The scoped staged whitespace check excluding `artifacts/*.log` passes. Earlier unqualified `git diff --check` statements applied to tracked modifications before newly generated logs were staged. This is a log-format exception, not a source whitespace failure.
