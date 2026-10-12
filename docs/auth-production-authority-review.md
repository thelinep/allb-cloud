# E04.09 / E11.01 source authority review

Reviewed current application API entry points, auth modules, workspace authorization and NEVO bridge. Browser localStorage/sessionStorage state never supplies an authenticated server principal. Public scaffold/reference pages explicitly label their local demo state; they do not mint tokens or submit browser user IDs to session issuance.

## Production authority boundaries

- `http.login` is the only application path to `issueSession`; it verifies a server-stored account password, verified/active account, bounded password input and persisted failed-attempt throttle.
- Auth routes accept only the Secure/HttpOnly `__Host-maataa-session` cookie and derive account identity using `readSession`. Server-side environment configuration is explicit and fails closed on mixed/invalid origin/key settings.
- `readSession` joins current credential version and verified/active account, rejects revoked/expired sessions and future authentication timestamps. Rotation revokes old token atomically. No private NEVO cookie or role header imports ALLB session authority.
- Tenant domain adapters use `withAuthorizedWorkspace` and/or `withNevoIdentity`; current membership/NEVO activity and mapping are read in locked server transactions. Client organization/workspace IDs are requested scope, not authority. Other tenants' records remain denied.
- Invitations require current non-revoked owner/admin membership and fresh MFA, exact verified-account email at acceptance, and current issuer authority. A browser cannot choose `owner` or overwrite existing membership by accepting a token.
- Callback URL does not authorize a session, exchange unsupported provider codes, echo arbitrary error text, or follow user supplied redirect targets.
- `authEnvironment` permits plaintext origin only for explicit local database validation on loopback; real remote authentication requires HTTPS. AES key must be 32 bytes, with explicit bounded version ID.
- Key rotation utility is server maintenance only. No browser endpoint accepts an encryption key or changes its version.

## Evidence and limitations

`tests/auth-environment.test.mjs` **9 checks passed**. `tests/auth-lifecycle.test.mjs` **36 checks passed**; root consolidated browser runner supplies actual Next sign-in/out, forged role, callback errors, origin denial and lifecycle checks. Tests execute real local server logic, not a mocked identity provider.

No production owner approval, penetration-test certification, public timing side-channel certification, managed secrets custody or external mail/provider/DB deployment is claimed. Source review supports the implementation boundaries; staging and production certification remain separate gates.
