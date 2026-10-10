BEGIN;
CREATE TABLE organizations (
 id uuid PRIMARY KEY, slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z][a-z0-9-]{1,62}$'),
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 200), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE identities (
 id uuid PRIMARY KEY, issuer text NOT NULL, subject text NOT NULL,
 UNIQUE (issuer,subject), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE memberships (
 organization_id uuid NOT NULL REFERENCES organizations(id), user_id uuid NOT NULL REFERENCES identities(id),
 role text NOT NULL CHECK (role IN ('owner','admin','editor','reviewer','viewer')),
 PRIMARY KEY(organization_id,user_id)
);
CREATE TABLE workspaces (
 organization_id uuid NOT NULL REFERENCES organizations(id), id uuid NOT NULL,
 slug text NOT NULL, name text NOT NULL, PRIMARY KEY(organization_id,id), UNIQUE(organization_id,slug)
);
CREATE TABLE design_drafts (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, id uuid NOT NULL,
 revision integer NOT NULL DEFAULT 1 CHECK (revision > 0), config jsonb NOT NULL CHECK (jsonb_typeof(config)='object'),
 updated_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id),
 FOREIGN KEY(organization_id,updated_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE design_versions (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, id uuid NOT NULL,
 number integer NOT NULL CHECK(number>0), config jsonb NOT NULL CHECK(jsonb_typeof(config)='object'),
 created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,id), UNIQUE(organization_id,workspace_id,number),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id),
 FOREIGN KEY(organization_id,created_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE design_approvals (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, version_id uuid NOT NULL,
 reviewer_id uuid NOT NULL, decision text NOT NULL CHECK(decision IN ('approved','rejected')),
 decided_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,version_id,reviewer_id),
 FOREIGN KEY(organization_id,workspace_id,version_id) REFERENCES design_versions(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,reviewer_id) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE design_publications (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, route text NOT NULL CHECK(route LIKE '/%'),
 version_id uuid NOT NULL, generation integer NOT NULL DEFAULT 1 CHECK(generation>0),
 published_by uuid NOT NULL, published_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,route),
 FOREIGN KEY(organization_id,workspace_id,version_id) REFERENCES design_versions(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,published_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE assets (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, id uuid NOT NULL, created_by uuid NOT NULL,
 PRIMARY KEY(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id),
 FOREIGN KEY(organization_id,created_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE asset_revisions (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, asset_id uuid NOT NULL, revision integer NOT NULL CHECK(revision>0),
 object_key text NOT NULL UNIQUE, sha256 text NOT NULL CHECK(sha256 ~ '^[a-f0-9]{64}$'),
 mime_type text NOT NULL, byte_size bigint NOT NULL CHECK(byte_size>0),
 state text NOT NULL CHECK(state IN ('quarantined','validated','rejected')),
 PRIMARY KEY(organization_id,workspace_id,asset_id,revision),
 FOREIGN KEY(organization_id,workspace_id,asset_id) REFERENCES assets(organization_id,workspace_id,id)
);
CREATE TABLE audit_events (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 actor_id uuid NOT NULL, action text NOT NULL, resource_id text NOT NULL, details jsonb NOT NULL DEFAULT '{}',
 occurred_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id),
 FOREIGN KEY(organization_id,actor_id) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE outbox_events (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, workspace_id uuid NOT NULL,
 kind text NOT NULL, payload jsonb NOT NULL, idempotency_key text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), delivered_at timestamptz,
 UNIQUE(organization_id,workspace_id,idempotency_key),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id)
);
CREATE INDEX audit_events_workspace_time ON audit_events(organization_id,workspace_id,occurred_at);
CREATE INDEX outbox_pending ON outbox_events(created_at) WHERE delivered_at IS NULL;
CREATE FUNCTION reject_immutable_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION '% records are immutable', TG_TABLE_NAME; END;
$$;
CREATE TRIGGER immutable_design_versions BEFORE UPDATE OR DELETE ON design_versions FOR EACH ROW EXECUTE FUNCTION reject_immutable_change();
CREATE TRIGGER immutable_audit_events BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION reject_immutable_change();
COMMIT;
