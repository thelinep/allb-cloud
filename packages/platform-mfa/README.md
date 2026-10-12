# @platform/mfa

WebAuthn/passkey registration and verification, extracted 2026-09-13 from
`nevo-event-os-3/apps/web` - the only real, working MFA implementation on
the drive (seeded from the previously-unmerged `codex/auth0-mfa` branch,
merged into nevo-event-os-3's main branch earlier the same day; see the
"organize" Claude project's architecture doc for that history).

## What moved here

- `config.ts` - `webAuthnConfig()`, an exact port (already
  request/env-parameterized, nothing to change).
- `device.ts` - `hashUserAgent`, `sanitizeDeviceField`, `deriveDeviceLabel`:
  small pure helpers factored out of the FIDO registration route, where
  this logic was inlined once per field.
- `challenge-store.ts` - `saveWebAuthnChallenge`/`consumeWebAuthnChallenge`,
  generalized over a `WebAuthnChallengeDelegate` interface instead of a
  concrete Prisma import, so this package has no Prisma dependency. Any
  Prisma `WebAuthnChallenge` model shaped like nevo-event-os-3's satisfies
  it structurally - including a transaction client's delegate, which is
  how atomicity (the original code's `db.$transaction([...])`) is
  preserved without this package depending on PrismaClient.
- `registration.ts` - thin wrappers around `@simplewebauthn/server`'s
  option builders and verifiers, with the `excludeCredentials`/
  `allowCredentials` mapping (from a comma-joined `transports` string)
  and the `requireUserVerification: true` security invariant centralized
  instead of repeated at each of the four original route handlers.

## What deliberately stayed in nevo-event-os-3, not this package

- Actual `WebAuthnCredential`/`RegisteredDevice`/`User`/`AuditLog`
  persistence, and session issuance after a successful verification -
  these are organization/audit-log-shaped and specific to
  nevo-event-os-3's schema today.
- Auth0 identity linking (`auth0Subject`) - legacy-only per the branch's
  own commit history (see the architecture doc's "Branch merge" note);
  not part of the active MFA flow and not extracted.

## Why this package is more narrowly scoped than @platform/auth-core

`ne-2` has zero MFA/passkey code today, so unlike auth-core (which had two
real implementations to compare and safely consolidate), this package has
exactly one real consumer. Scope was kept close to what that consumer
actually needs rather than speculatively generalizing an interface with no
second implementation to validate it against.
