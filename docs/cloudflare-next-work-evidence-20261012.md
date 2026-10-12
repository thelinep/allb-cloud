# Cloudflare next work — implementation evidence

The existing public Next.js application now renders its dynamic fixture routes per request. The installed OpenNext adapter's prerender fallback produced NoFallbackError for valid routes; a static-assets cache experiment did not resolve it and was reverted. Request-time rendering fixes the problem. A manifest-based proxy rejects unknown fixture paths before streaming begins, preserving real HTTP 404s and working gallery recovery links. Existing science calculations and reference images were not changed.

Actual local Worker Chromium matrix: **552/552 PASS** across desktop/mobile and 266 routes, including all 36 concepts, search/category filters, theme/branding persistence, workspace navigation, keyboard, accessibility, overflow, broken images and Kanban filters. A hardcoded 131-task test expectation was replaced with the current registry count. Desktop NEVO and mobile gallery screenshots were visually inspected; human baseline approval remains a release gate.

Native D1/R2/Queues foundation implementation and tests are in packages/cloudflare-foundation and tests/cloudflare. This is not the full authenticated application cutover. See package README for boundaries. The unchanged scrypt primitive succeeds locally in workerd; real deployed CPU/memory quotas remain unverified. Seven native EMAIL binding contract tests are mocked; no actual email sent.

Dependency gate: maintained packages/notifications-runtime uses Nodemailer 10.1.0, active workspace excludes the untouched imported notifications snapshot, and the ineffective root override was removed. Fresh npm audit reports zero known advisories. All six platform builds pass. All 126 original imported files still match recorded SHA-256 values.

Registry: **100 complete / 39 blocked**, zero pending or in progress. CF01 is complete only for local public UI rendering; native backend identity and data cutover remain CF02-CF08. E11.04 is complete for the reviewed active dependency graph. No broad enterprise production certification is inferred.

Important remaining implementation gates: full D1 auth/lifecycle/scene/commercial repository migration; native application API and UI cutover; image-validation/derivative connection to R2; integration of all job kinds and consent/outbox delivery; Workers-compatible payment protocol. External gates: authorized staging resources, sender onboarding, real provider credentials, retention/SLO/incident owners, human accessibility/visual review, physical devices, pilot and rollout authorization.

Workerd also logs broken-pipe warnings when browser connections are cancelled. All browser assertions passed, but staged error-budget/soak qualification must distinguish request cancellation from service faults before release.

No commit, push, deployment, DNS change, Cloudflare provisioning or external configuration performed. Root dependency files already had unrelated changes when work resumed; required workspace/dependency updates were applied without staging or committing unrelated work.

## Commit review clarification

Staging all new files exposed terminal carriage returns, trailing spaces and EOF blank lines in captured raw `.log` artifacts. These logs are retained byte-for-byte to preserve recorded evidence hashes. The scoped staged whitespace check excluding `artifacts/*.log` passes. Earlier unqualified `git diff --check` statements applied to tracked modifications before newly generated logs were staged. This is a log-format exception, not a source whitespace failure.
