# Account lifecycle implementation

Migration `006_auth_lifecycle.sql` adds opaque public session IDs, an encrypted durable delivery outbox and auth security audit events. Existing `__Host-maataa-session` cookies remain Secure, HttpOnly and SameSite=Lax. Every mutation checks the configured same origin and reads a bounded 4096-byte JSON stream; browser role/user headers do not establish authority.

## Delivered contracts

- GET `/api/integration/auth/sessions`: own unrevoked/unexpired sessions, opaque IDs, current flag, timestamps; never token hashes.
- POST `rotate`: previous cookie becomes unusable; MFA timestamp survives; replacement is issued in a secure cookie.
- POST `revoke`: own public session ID or all own sessions. Other users' session IDs yield NOT_FOUND. Revoking current/all clears the cookie.
- POST `enroll` and `confirm`: five-minute enrollment window, recent password authentication and fresh MFA when replacing an existing factor. AES-256-GCM secret bound to factor and user. Confirmation requires a real RFC6238 code, consumes its counter and displays ten high-entropy recovery codes once.
- POST `recover-mfa`: verified password session plus one-time recovery code; hashes are stored, consumed transactionally, replay denied.
- POST `revoke-factor`: fresh MFA, owns factor, invalidates all sessions and all recovery codes.
- POST `request-recovery`: known/unknown eligible email responses have identical body and status. Challenge encrypted in durable outbox; never returned publicly. This establishes response anti-enumeration, not a certified timing-channel guarantee.
- POST `complete-recovery`: one-time expiring challenge; password policy, credential-version increment and complete session invalidation occur transactionally. Existing MFA remains required.
- POST `invite`: current owner/admin membership and fresh MFA required; admins cannot invite admins, owners may. Owner grants are excluded. Token only encrypted in outbox.
- POST `accept-invite`: authenticated verified account email must match, issuer's current membership authority is rechecked, expiry/single-use enforced. Existing membership is never overwritten/upgraded by acceptance.
- GET `factors`: own confirmed active factor metadata; no secret material.

`/integration/security` operates these actual HTTP contracts using the original MAATAA UI components. Password sign-in remains in `/integration/workflow`. `/auth/callback` safely explains unsupported provider callbacks and renders only whitelisted messages; it does not exchange credentials or trust redirects.

## Authority and operational details

Account row locks serialize concurrent lifecycle operations across separate sessions. Failed confirmation/recovery attempt counters persist outside rollback transactions. Successful sensitive changes append secret-free auth security events. A maintenance-only `rotateEncryptionKey` re-encrypts active factors and unexpired queued payloads transactionally, and rejects identical key version labels. It is not a browser endpoint. Old archived expired payloads require retention/deletion policy or preservation of their old decrypt key.

## Validation

`node tests/auth-lifecycle.test.mjs`: **36 passing checks** covering encrypted enrollment/outbox, recovery replay, rotation, other-user session denial, invitation email and replay, unknown account response, password replacement, credential/session invalidation, expired sessions, disabled accounts, factor revocation, audit records and key rotation. Uses PGlite to execute real SQL migrations and service code; it is not evidence of production PostgreSQL durability/load.

`tests/auth-lifecycle-browser.mjs` exports the actual Next/Chromium helper used by the consolidated root runner. It exercises security UI on mobile and server routes for rotation, authenticator confirmation, one-time recovery, invitation acceptance, password reset and session invalidation. Fixture-only server-side outbox decryption explicitly simulates private delivery; no browser delivery-token endpoint exists. Consolidated release report records its executed result, TypeScript and build checks.

## Remaining gates

- No mail provider/worker delivery is connected; queued messages are not claimed sent.
- Invitation acceptance supports existing verified accounts. Account provisioning remains an administrative integration, not public signup.
- WebAuthn enrollment/ceremony, physical authenticator interoperability, other browsers/devices and provider callbacks are unimplemented/unverified.
- Key custody/rotation scheduling, outbox retention, timing-side-channel analysis, production PostgreSQL concurrency and staging security certification remain release gates.
- No commit, push, deployment or external service write was performed.

## Combined verification, 2026-10-10

Actual combined Next browser run: 14 lifecycle checks PASS, encrypted outbox consumed by a simulated local worker; no external mail delivery.
