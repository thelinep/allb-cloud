# NEVO dependency resolution

Status: **Original sources imported from the user-provided `Archive(1).zip`; runtime integration validation pending.** The initial GitHub access blocker was resolved by this upload. No security, payment, notification, or evidence implementation was fabricated to satisfy imports.

Pinned consumer baseline: `thelinep/nevoeos`, commit `f50af9dd91b987080faa8fa00f2416b73cf8de78` (default branch `codex/nevo-playwright-demo-studio`). Root package manager: `pnpm@10.12.4`. The workspace covers `apps/*`, `adapters/*`, `packages/*`; external siblings are outside that workspace and repository. `apps/web` uses Next `^15.5.24`, React `^19.1.1`, Prisma `^6.19.3`; these differ from ALLB and are not a drop-in runtime guarantee.

| Package | Consumer declaration | Observed consumer exports | Source/version status |
|---|---|---|---|
| `@platform/auth-core` | `apps/web/package.json`: `file:../../../platform-auth-core` | `/nevo`: session token generation/hash, email normalization, scrypt hash/verify; rate limiter and headers | Imported original source, version `0.1.0` |
| `@platform/mfa` | `apps/web/package.json`: `file:../../../platform-mfa` | WebAuthn options/verification, configuration, single-use challenge store, device labeling, FIDO constants | Imported original source, version `0.1.0` |
| `@platform/payments` | Web and integrations manifests: `file:../../../platform-payments` | Provider interface/local provider/idempotency conflict; `/razorpay`; `/upi/direct-integration` | Imported original source, version `0.1.0` |
| `@platform/audit-evidence` | Web and evidence manifests: `file:../../../platform-audit-evidence` | `hashEvidence`, `prepareEvidenceAppend`, `verifyEvidenceChain`, `EvidenceRecord` | Imported original source, version `0.1.0` |
| `@platform/notifications` | `packages/integrations/package.json`: `file:../../../platform-notifications` | Delivery interfaces/local/composite providers | Imported original notifications source, version `0.1.0` |

The uploaded package manifests and source barrels now supply all listed NEVO consumer subpaths and symbols. Exact manifest export maps and package dependencies are recorded in `dependency-status.json`. This is source-level compatibility inspection; runtime module loading and full NEVO compatibility tests remain pending.

## Evidence and access boundaries

- Connector accessible repository inventory for `thelinep` returned `allb-cloud` and `nevoeos` only.
- Direct metadata reads of all five candidate `thelinep/platform-*` repositories returned GitHub 404. This can mean missing repository or missing connector access; it does not prove source does not exist.
- Local scan found none of their `package.json` files.
- NEVO `docs/PLATFORM_AUDIT_EVIDENCE_EXTRACTION.md` confirms evidence moved outside the repository. `docs/release/SELLABLE_RELEASE_STATUS.md` similarly identifies payments as an external file dependency. Historical successful tests in docs do not establish fresh-checkout reproducibility.
- NEVO `docs/NEVO_V1_SHIPPING_READINESS.md` records a native-build failure while evaluating auth-core. Recovering source alone will not prove Workers compatibility.

## Concrete next inputs and resolution gates

1. **DONE:** user supplied all five original package directories plus `@platform/ui-forms` in `Archive(1).zip`. Archive SHA-256: `6ab0369850b75cf045b9524ff4dfd7447dcdbb84c3fcbaf6209cd879b50906d8`. Imported files have SHA-256 provenance in `integration/vendor-platform/archive-provenance.json`; all 126 hashes match. No upstream commit has been established.
2. Capture each source commit, license, package name/version, export map, transitive dependencies and SHA-256 integrity before copying under `integration/vendor-platform/<directory>`.
3. Confirm ownership/license permission to vendor the source. Preserve license and upstream notices.
4. Replace sibling references only after reviewed package source exists; choose workspace packaging or published immutable versions deliberately.
5. Install from a clean directory, check lockfile reproducibility and run original package compatibility/tests and NEVO tests.
6. Audit native modules and Node APIs against the actual Cloudflare build/runtime. Verify MFA enforcement and tenant boundaries independently of dependency availability.

`integration/vendor-platform/dependency-status.json` records these gates. It contains no replacement code and is not part of the running application. Original-source availability is now resolved. Production Auth, payment settlement and evidence exports still require runtime tests and application wiring before NEVO adoption is complete. Independent ALLB work can continue without claiming NEVO backend integration complete.

## Uploaded-source review

All six package manifests declare version `0.1.0`, with compiled `dist` exports. Generated output was excluded on import, so builds must run before runtime imports. None declares a license field. Original package scripts offer build/typecheck everywhere; only payments and audit-evidence declare package test scripts. UI forms include test source files but no test runner script in the manifest. Auth root imports native `bcrypt ^6.0.0`; its `/nevo` barrel excludes bcrypt and exports scrypt/session primitives directly. MFA uses `@simplewebauthn/server ^14.0.1`; notification SMTP uses `nodemailer ^9.0.6`. These are runtime compatibility review items, not proof of Workers support.

## Local validation after archive import

All six original packages built successfully. Original payments tests passed 16/16 and audit-evidence tests passed 6/6. Imported Auth/MFA compatibility passed 11 assertions. UI forms has no configured test command; its included component tests were not run. External payment, notification and WebAuthn ceremonies remain untested. The OpenNext bundle built, but local Wrangler execution was blocked by `uv_interface_addresses` before HTTP checks. No deployed service has been verified.
