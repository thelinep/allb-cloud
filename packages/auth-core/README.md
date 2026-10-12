# Own MAATAA Auth primitives

Server-only identity service, connected to actual Next integration login and lifecycle routes. No SaaS dependencies. The user selected invitation-only accounts and mandatory MFA for admins/publishers. These modules remain server-only; browser routes call validated server adapters.

Passwords use Node's established scrypt primitive with N=2^17, r=8, p=1, random salts and constant-time comparison. Stored hash parameters are fixed by version, never supplied by a browser or arbitrary database record. Input length is bounded. Session tokens contain 32 random bytes; only SHA-256 hashes are persisted. Sessions reject expired/revoked tokens, disabled/unverified accounts and changed credential versions. Password hashing does not use SHA-256.

`issueSession` is an internal primitive, not an authentication decision. Credential verification, account enumeration resistance, distributed throttling, CSRF/origin checks, cookie policies, MFA/step-up verification, invitations, recovery delivery and audited routes must be integrated/tested before exposing login. Never pass a browser-supplied user ID directly to it. The `/integration/workflow` UI uses verified credential login; `/integration/security` uses lifecycle HTTP routes.

References: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html and https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html .

## Additional primitives (not endpoint certification)

`challenges.mjs` issues bounded, hashed purpose-specific challenges. Atomic consumption rejects replay, expiry and disabled accounts. `recoverPassword` changes the credential version together with consumption, invalidating previous sessions. These functions do not send email or provide a public anti-enumeration endpoint; the `lifecycle.mjs` adapter supplies authorization, persisted throttling, encrypted outbox queueing and auditing. Real mail delivery is still not connected. Generic `consumeChallenge` is not by itself proof of MFA.

Sessions can be rotated atomically, listed without token/hash disclosure, and revoked in bulk. Callers must derive the user ID from trusted server authentication. `policy.mjs` supplies an HTTPS-only `__Host-` HttpOnly/SameSite cookie and privileged-role/freshness checks; cookies are attached to real login, rotation and revocation routes. Owners/admins/publishers require MFA. TOTP enrollment/challenge/recovery and AES-256-GCM secret handling are implemented and locally tested. WebAuthn ceremonies and provider callbacks are not implemented. See `docs/auth-lifecycle-evidence.md` for explicit evidence and release gates.
