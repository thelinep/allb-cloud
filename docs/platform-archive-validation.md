# Platform archive validation — 2026-10-10

Source: user-provided Archive(1).zip, unchanged. ZIP CRC passed. All 126 imported source/config/test files match their recorded SHA-256 hashes. Generated output, Git metadata, Apple metadata and environment files were excluded.

| Package | Version | Validation |
|---|---|---|
| @platform/auth-core | 0.1.0 | Build passed; imported Auth/MFA compatibility 11 assertions jointly passed |
| @platform/mfa | 0.1.0 | Build passed; real WebAuthn ceremonies untested |
| @platform/payments | 0.1.0 | Build passed; original tests 16/16 passed |
| @platform/audit-evidence | 0.1.0 | Build passed; original tests 6/6 passed |
| @platform/notifications | 0.1.0 | Build passed; SMTP/WhatsApp external delivery untested |
| @platform/ui-forms | 0.1.0 | Build passed; included component tests unrun (no configured test command) |

Original source availability resolves all five missing NEVO sibling dependency blockers. Source commits and explicit package licenses remain unestablished. Sources were imported unchanged under packages/platform-*; npm workspace configuration belongs to ALLB.

Additional integration checks: TypeScript and Next production build passed. Final Chromium checks passed for three routes at desktop/mobile widths, 12 interaction/API assertions, zero accessibility violations, overflow, broken images or page errors. Identity browser checks use an isolated authenticated fixture, not a deployed production service. PostgreSQL-backed context API fails closed when unauthenticated or unconfigured. Actual database provisioning, complete HTTP workflow adoption and external services remain open.

No commit, push, deployment, DNS or external service configuration was performed in this run. Cloudflare runtime failed before HTTP with uv_interface_addresses; staging remains untested. See nevo-cloudflare-integration.md for runtime and credential-memory gates.

The final Cloudflare rebuild exposed a pg-cloudflare tracing dependency after the context endpoint was added. Explicit package dependency and route tracing were added; final bundle outcome is recorded separately. Ordinary Next build and browser validation do not prove Workers compatibility.

Earlier OpenNext rebuild: BLOCKED. Bundling the new PostgreSQL endpoint cannot resolve pg-cloudflare in the traced server output even with the explicit dependency installed. The earlier successful bundle predates this endpoint and is not a pass for final source. Route tracing experiment did not solve the failure and was removed. Runtime remains independently blocked by uv_interface_addresses.

Current clean combined source: Next and OpenNext bundle PASS after conditional-export tracing was fixed. A stale Next route-cache issue was found by actual browser checks; guarded prebuild cleanup now prevents old HTML from referencing removed chunks. Final clean build verified 2,831 prerendered asset references with zero missing files. Worker execution remains independently environment-blocked.

## Latest combined backlog build — 2026-10-10

Ordinary Next production build PASS. OpenNext build now BLOCKED by native Sharp external alias after local asset validation integration. Earlier bundle success predates this change and does not certify the current combined source. Worker execution and credential-memory gates remain open.

## Commit whitespace exception

Original packages/platform-payments/src/razorpay.ts has a new blank line at EOF (line 315). It is deliberately preserved to retain byte-identical archive provenance. Range whitespace checks exclude only this imported file; all other files use git diff --check.
