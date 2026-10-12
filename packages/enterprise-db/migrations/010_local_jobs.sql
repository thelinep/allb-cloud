BEGIN;
CREATE TABLE local_jobs (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('notification-preview','webhook-preview')), payload jsonb NOT NULL,
 idempotency_key text NOT NULL, state text NOT NULL CHECK(state IN ('pending','running','delivered','dead')),
 attempts integer NOT NULL DEFAULT 0, max_attempts integer NOT NULL CHECK(max_attempts BETWEEN 1 AND 10),
 available_at timestamptz NOT NULL, lease_until timestamptz, lease_token uuid, last_error text, result jsonb,
 UNIQUE(organization_id,workspace_id,idempotency_key), FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id)
);
COMMIT;
BEGIN;
CREATE TABLE notification_consents (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, subject text NOT NULL,
 allowed boolean NOT NULL, updated_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,subject),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id)
);
CREATE TABLE local_webhook_receipts (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, event_id text NOT NULL,
 body_sha256 text NOT NULL, received_at timestamptz NOT NULL,
 PRIMARY KEY(organization_id,workspace_id,event_id),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id)
);
COMMIT;
