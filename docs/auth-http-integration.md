# ALLB HTTP identity integration

The local Next application now exposes real server-backed identity endpoints:

- POST `/api/integration/auth/login` with `{email,password}` validates the existing ALLB scrypt credential, consumes a durable account throttle, and sets the existing Secure/HttpOnly `__Host-maataa-session` cookie. No registration or verified account auto-provisioning is exposed.
- POST `/api/integration/auth/logout` revokes that session in the database and clears its cookie.
- GET `/api/integration/auth/session` returns only the authenticated user's workspace memberships and MFA timestamp. Roles are read from SQL, never accepted from a client.
- POST `/api/integration/auth/mfa` with `{code}` verifies a six-digit RFC6238 TOTP against an existing confirmed encrypted factor. Counter consumption and session MFA update are transactional. Replayed counters are rejected. This is not a demo success action.

POST requests require exact configured `ALLB_AUTH_ORIGIN` matching both request Origin and request URL origin, JSON bodies, and a 4096-character payload cap. Login and MFA each permit five attempts per 15-minute durable account window; anonymous distributed/IP-level protection remains a deployment gate. Error bodies contain `{error:code}` and never SQL diagnostics. Responses use no-store.

Apply foundation, auth, and `005_auth_http.sql` migrations before using these endpoints. Configure PostgreSQL via `ALLB_NEVO_DATABASE_URL`. Configure MFA through `ALLB_TOTP_KEY_HEX` (32-byte AES256 key in 64 hex characters) and `ALLB_TOTP_KEY_VERSION`; neither is supplied by the browser. Existing `auth_mfa_factors.encrypted_secret` must contain a JSON envelope with base64 iv, ciphertext and tag; AES256-GCM associated data is `allb-totp:<factor UUID>:<user UUID>`. Factor provisioning, authenticator enrollment/recovery UX, encryption key rotation and WebAuthn browser ceremonies remain separate gates. Archived NEVO hashes are not automatically converted into ALLB credentials.

Validated using `node tests/auth-http.test.mjs`: ten real disposable PostgreSQL-compatible checks cover incorrect credentials, session creation, RFC TOTP vector, invalid code, successful verification, replay denial, MFA state, durable throttling/window reset, and revocation. These are service/database tests, not an assertion of deployed HTTP or live provider behavior. Earlier identity/browser tests remain distinct fixture checks until a configured HTTP environment runs the new routes.
