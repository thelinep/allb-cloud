# Server workspace authorization primitives

`workspace.mjs` consumes the existing own-auth sessions and enterprise PostgreSQL schema. It is trusted server code, not a browser permission system. Client-supplied roles/identities are ignored; a requested organization/workspace pair is checked against current database records. Authorization is recalculated on every call.

| Database role | Permitted actions |
| --- | --- |
| viewer | design.read, asset.read |
| editor | viewer actions, design.edit |
| reviewer | viewer actions, design.review |
| admin / owner | all listed actions, design.publish, membership.manage; MFA required |

Unknown roles/actions deny. The current migration has no publisher role: admin/owner perform publishing. A dedicated publisher role requires a reviewed migration and invitation policy update; this package does not pretend that role exists. Organization memberships currently grant access to that organization's workspaces. Workspace-level grants are not present in the schema.

`withAuthorizedWorkspace(db, token, scope, action, operation)` revalidates the session and membership inside a database transaction, taking shared session/account/membership/workspace row locks for its duration. `operation` must be trusted server code and must scope every SQL operation by the returned organization and workspace. Never accept a callback or authority context from the client. Returned contexts are descriptive and must not be cached or reused as authorization.

`readWorkspaceResource` provides fixed-table scoped reads for drafts, versions and assets. `updateDesignDraft` offers one protected write: expected-revision update plus immutable audit append in the same transaction. Missing, stale and outside-scope resource IDs produce null without disclosing existence. Neither helper implements the complete publishing/review workflow. Errors expose stable authorization codes; the HTTP layer must map them to safe responses.

Validation, from `apps/maataa-ui-route-source`:

```bash
node tests/authorization.test.mjs
```

30 checks pass against actual disposable PostgreSQL semantics (PGlite): role matrix, tenant/workspace mismatch, identifier guessing, browser role spoofing, MFA requirement, stale revisions, cross-scope writes, audit rollback, membership downgrade/deletion, session revocation, credential-version invalidation and expired sessions. Concurrent transactions were not stress-tested on an external PostgreSQL server. This is not RLS, production HTTP integration, service identity support or a Cloudflare compatibility certification.

Task evidence: primitives support E05.01/E05.02/E05.03/E05.05/E05.06/E05.09. Those full program tasks remain incomplete until login/MFA and every applicable API consume these guards, publisher/workspace policies are resolved, and full dependency gates pass. E05.04, E05.07 and E05.08 are not implemented here.
