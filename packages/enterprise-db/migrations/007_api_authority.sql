BEGIN;
ALTER TABLE memberships ADD COLUMN revoked_at timestamptz;
CREATE TABLE service_identities (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 token_hash text NOT NULL UNIQUE, actions jsonb NOT NULL CHECK(jsonb_typeof(actions)='array'),
 expires_at timestamptz NOT NULL, revoked_at timestamptz,
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id)
);
CREATE TABLE api_idempotency (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, key text NOT NULL,
 request_hash text NOT NULL, result jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,key),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id)
);
CREATE TABLE api_rate_limits (
 scope text PRIMARY KEY, window_start timestamptz NOT NULL, count integer NOT NULL CHECK(count>0)
);
COMMIT;
