# MAATAA Auth: own development versus external managed identity

Decision from the user: no external SaaS. Extend the current repository into a server-backed MAATAA Auth service. Do not add Auth0/Clerk dependencies or route credentials through them.

## What exists in this repository

The inspected `components/auth-reference.tsx` contains illustrative users, sessions, permission matrices and audit events. Sign-in inputs are local UI state; its FAQ explicitly says no server receives the inputs. Searches for credential hashing and session-revocation implementation did not find a production identity backend in the inspected source. This assessment covers this checkout, not any undisclosed private service.

| Capability | Current MAATAA Auth | External managed service | Required own implementation |
| --- | --- | --- | --- |
| Branded login UI | Present as a local demo | Hosted or custom UI | Keep MAATAA UI and connect validated server endpoints |
| Credential verification | Not connected | Provider verifies identities | Established password-hashing library/runtime, account state and brute-force controls |
| Sessions | Illustrative in-memory rows | Provider/SDK lifecycle | Server-owned sessions, secure cookies, rotation, expiry and revocation |
| Organizations/roles | Editable local matrix | Organization/role features, provider dependent | Database memberships and authorization on every data operation |
| MFA/recovery | Demonstration screens | Provider configuration | Verified enrollment, encrypted secrets or passkey records, recovery and replay prevention |
| Identity data/operations | No production identity store | Vendor-hosted | Self-hosted storage, backups, monitoring, key rotation and incident response |
| Tenant isolation | No production enforcement | Still requires application data isolation | Scoped keys, runtime access controls and negative tests |
| Operational ownership | UI only | Shared with vendor | ALLB team owns availability, patching and recovery |

This is a capability comparison, not proof that a particular paid service is enabled or suitable. Current Auth0 and Clerk documentation describes Next.js and organization integrations; neither is selected for ALLB.

## Own-development execution order

1. Define account lifecycle and bootstrap/invitation policy; map server identities to organization membership.
2. Add credential, session, MFA enrollment, one-time challenge and recovery records with expiry and revocation.
3. Implement and test credential verification using established cryptographic primitives. Do not design new password hashing or token cryptography.
4. Add login throttling, session rotation and secure cookie handling; reject browser-supplied user or tenant authority.
5. Wire MAATAA login/logout/session UI to the server. Protect mutations against cross-site requests.
6. Add verification/recovery delivery through the selected self-hosted mail infrastructure; tokens are single-use, expiring and stored as hashes.
7. Add MFA enrollment/challenge/recovery and step-up checks for publishing/admin changes.
8. Add SSO protocols only if the target organizations require them, using maintained protocol libraries and interoperability tests.
9. Prove account enumeration resistance, revocation, expiry, MFA bypass prevention and cross-tenant isolation before enabling privileged operations.

Confirmed policy: invitation-only accounts; admin and publisher actions require MFA. Verification/recovery delivery, MFA methods, SSO requirements and production hosting remain domain/environment inputs. No authentication backend has been enabled by this comparison document. Credential/session primitives and their disposable-database tests are now implemented in `packages/auth-core`; login routes and UI are still disconnected.

## Primary references

- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- https://developer.auth0.com/resources/guides/web-app/nextjs/basic-authentication
- https://clerk.com/docs/nextjs/guides/organizations/getting-started
