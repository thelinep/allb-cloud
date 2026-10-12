# Local hardening and recovery runbooks

## Evidence and environment boundary

Commands are local and reversible. No external monitor, pager, storage retention rule, account or deployment is configured by these runbooks. PGlite cold restore exercises PostgreSQL-compatible schema and public asset bytes; it is not a network PostgreSQL PITR or remote object-store recovery certification.

Run `node scripts/dependency-review.mjs`, `node --test tests/release-integrity.test.mjs tests/brand-compatibility.test.mjs`, and `node tests/local-restore-drill.mjs`. Reports are under `artifacts/hardening/`. The dependency command exits nonzero for advisories/errors; never label that failure as a clean scan.

Current local run: 4 test cases PASS. The cold restore ran 15 assertions against all eight current migrations, 1,118 cold-copy files, a public WebP and a genuinely service-uploaded PNG with preview/thumbnail WebP derivatives. Restore reopened the copied database and downloaded both original and derivatives through the authenticated storage service. Backup copy measured 324 ms and restoration checks 178 ms on this disposable local fixture; these timings are not production RTO.

Current npm audit: exit 1, one high dependency (`nodemailer` 9.1.1), five advisories including SMTP credential disclosure and parser denial of service. Registry metadata reports 10.1.0 with Node >=20. A root override attempt did not change the linked workspace's installed 9.1.1; that ineffective override was removed by the coordinator. No patched dependency or clean scan is claimed. A reviewed version overlay plus a deterministic clean lockfile installation and notification compatibility tests are required before external SMTP integration.

Lockfile inventory: 436 packages. Review redistribution obligations for sharp/libvips LGPL-3.0-or-later, axe-core MPL-2.0 and caniuse-lite CC-BY-4.0; metadata alone cannot establish legal compliance. Original platform packages have no declared license fields and require owner confirmation before redistribution. Actual notification package TypeScript build passed before this review; SMTP runtime remains untested.

## Secrets and controlled environment access (E11.01)

Production secrets must be supplied through the approved deployment secret store: PostgreSQL connection, TOTP encryption keys, provider webhook verification keys and SMTP credentials. Never place values in source, task evidence, browser responses or logs. Separate staging/production principals, least privilege and separate provider credentials. Grant read/deploy permissions only to named operators; approval and an actual environment owner are prerequisites to provisioning.

Rotate TOTP by a versioned key ring: add the new active encryption version, retain read access to old versions, re-encrypt each factor in an authenticated transaction, verify MFA under both versions, then retire the old key only after all records and encrypted backups are accounted for. Reject unknown versions. Revoke sessions upon compromise or credential reset. Neither a text runbook nor a local fixture proves the operator's real key rotation was performed.

## Incident ownership and escalation (E11.03/E11.09)

Before staging, record named primary/secondary incident commander, database operator, identity operator and provider owner. No current person is implicitly assigned. Trigger conditions: cross-tenant exposure (immediate incident), invalid webhook signature (reject request and investigate recurrence), increased 5xx/latency, backup/restore failure or audit integrity mismatch (stop release). Thresholds and monitor destinations need deployment measurements; do not invent a live alert.

On suspected exposure: stop the affected mutation boundary, revoke affected sessions and credentials, preserve immutable evidence, record timeline with request correlation IDs, identify scope, restore service after a verified fix and tenant regression. Emergency access requires named time-limited server-side authority and an independently logged grant; do not use a UI flag or blanket database superuser. No emergency bypass is implemented by this document.

## Backup schedule and retention proposal (E11.06)

Staging target proposal: daily encrypted full database backup, continuous PostgreSQL WAL/PITR when supported, asset object versioning and daily asset-index snapshots; proposed RPO 15 minutes and RTO 60 minutes require measurement and owner approval. Keep daily restore points 30 days and month-end points 12 months subject to contractual/legal requirements. Store keys independently of backups; test restoration monthly and before destructive migrations. These are proposed operating objectives, not achieved promises or configured schedules.

Never hot-copy a running PGlite directory. Stop writers and close the engine before copying; use PostgreSQL-supported consistent backup procedures for network PostgreSQL. Reconcile each restored `asset_revisions` object key, byte size and SHA-256 with the actual restored object. An asset index alone cannot prove the objects exist. `tests/local-restore-drill.mjs` exercises a closed disposable database plus one real public WebP asset, byte-level cold-copy validation and intentional asset corruption detection. It also checks audit UPDATE/DELETE rejection after fixture creation, independently retained in-memory export anchors across database restoration, and truncated export rejection. The current extended drill includes a service-uploaded PNG and its actual preview/thumbnail derivatives in addition to public artwork.

## Audit integrity and deletion policy (E11.08)

Foundation audit rows reject UPDATE and DELETE through database triggers. Privileged database administrators can alter triggers, so this is not tamper-proof against a compromised database owner. Immutable version tables and approved handoffs must never be swept by cache cleanup. Legal holds override expiry. Default unknown records to retain.

`packages/release-evidence/integrity.mjs` creates a versioned, ordered SHA-256 export chain and verifies it against a separately supplied count/tail anchor. Tests detect mutation, order, linkage, sequence and truncation, and require an anchor. It is an export helper, not a signed external audit service or automatic integration with operational DB exports. Anchors must be independently retained or signed before adversarial authenticity/completeness can be claimed. Retention helper only returns review eligibility for expired caches/temporary exports; it never performs deletion. Contract/financial retention duration remains an explicit policy decision.

## Rollback and release recovery (E11.09/E12.09)

Capture a verified database backup and asset-index snapshot before any migration. Prefer expand/contract migrations; restore the previous application only if it can read the current schema. Never drop columns or revert financial/approval evidence as an application rollback shortcut. Test forward/backward compatibility on isolated staging. For data repair, preserve an incident record and append corrective evidence; do not rewrite approved history.

Run source checkpoint creation and actual clone/patch restore using `scripts/create-source-backup.py` and `scripts/verify-source-backup.py`. Restore dependencies from the lockfile, then serially run TypeScript, domain tests, production build and browser workflow. Root coordinator owns build ordering. A source archive does not include production credentials, databases, remote assets or provider configuration.

## Security boundary review (E11.05)

Review response headers in real browser/HTTP output after configuration: nosniff, clickjacking protection, referrer and permissions policy. CSP must be tested against Next hydration, R3F/WebGL, fonts and images; adding an untested broad CSP is not a completed review. TLS-only HSTS is a deployment decision. Upload streams need server-side size/type verification, quarantined bytes, explicit object ownership and authorized derivative generation; filename/MIME claims are not proof. Root/asset agents own actual service adoption. Durable auth throttles, hostile Origin rejection and role/tenant denial already have isolated and actual HTTP evidence; final regression must run on current combined source.

## Release gates (E12/E14)

Local fixtures contain synthetic accounts and public artwork, not sensitive production copies. Comprehensive load/soak SLOs require an agreed target and network database/Worker environment. Chromium width emulation is not Safari/Firefox/physical-device evidence. Manual assistive technology, production backup/WAL replay, controlled provider sandbox tests and staging sign-off remain separate gates. Additional brand rollout follows the certified shared authority/data contracts rather than copied brand-local authentication.

`docs/brand-expansion-manifest.json` maps all 36 artwork concepts to explicit shared contract requirements, proposed business/dependency priority and domain acceptance scope. `scripts/sync-brand-expansion.mjs` regenerates this mapping from the existing artwork manifest. It is a roadmap for concepts, not evidence that 36 products have functioning enterprise workflows. `packages/release-evidence/brand-compatibility.mjs` fails closed for unknown/incorrect major contracts, missing gates and separate brand authentication authority. Implementation, isolation, domain acceptance, operations, staging sign-off and publication authorization are all mandatory gates.

Task-specific recommendations: E11.04 in progress (audit actually found a high vulnerability); E11.06 in progress (schedule/retention proposal written, owner approval and real scheduling absent); E11.07/E12.09 in progress (cold local DB+asset restore passed, network PostgreSQL/PITR and migration rollback absent); E11.08 in progress (immutability and anchored export/retention helpers tested, independent signed anchors/live export adoption absent); E11.09 in progress (concrete runbooks written, named operators and rehearsal absent); E14.01/.02/.06 in progress (36-entry priority/contract/deprecation policy and fail-closed tests implemented, business approval and actual consumer rollout absent). E14.03/.04/.05 remain pending; no brand workflow, operational certification or publication is inferred from a landing page or policy test.
