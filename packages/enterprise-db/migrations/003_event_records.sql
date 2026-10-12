BEGIN;
CREATE TABLE production_events (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, id uuid NOT NULL,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 200),
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 state jsonb NOT NULL CHECK(jsonb_typeof(state)='object'),
 created_by uuid NOT NULL, updated_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,workspace_id) REFERENCES workspaces(organization_id,id),
 FOREIGN KEY(organization_id,created_by) REFERENCES memberships(organization_id,user_id),
 FOREIGN KEY(organization_id,updated_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE production_event_versions (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, event_id uuid NOT NULL,
 revision integer NOT NULL CHECK(revision>0), state jsonb NOT NULL CHECK(jsonb_typeof(state)='object'),
 digest text NOT NULL CHECK(digest ~ '^[a-f0-9]{64}$'),
 created_by uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,event_id,revision),
 FOREIGN KEY(organization_id,workspace_id,event_id) REFERENCES production_events(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,created_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TABLE production_scene_versions (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, event_id uuid NOT NULL,
 scene_id text NOT NULL CHECK(length(scene_id) BETWEEN 1 AND 200),
 revision integer NOT NULL CHECK(revision>0), document jsonb NOT NULL CHECK(jsonb_typeof(document)='object'),
 digest text NOT NULL CHECK(digest ~ '^[a-f0-9]{64}$'), created_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,workspace_id,event_id,scene_id,revision),
 FOREIGN KEY(organization_id,workspace_id,event_id) REFERENCES production_events(organization_id,workspace_id,id),
 FOREIGN KEY(organization_id,created_by) REFERENCES memberships(organization_id,user_id)
);
CREATE TRIGGER immutable_production_event_versions BEFORE UPDATE OR DELETE ON production_event_versions
 FOR EACH ROW EXECUTE FUNCTION reject_immutable_change();
CREATE TRIGGER immutable_production_scene_versions BEFORE UPDATE OR DELETE ON production_scene_versions
 FOR EACH ROW EXECUTE FUNCTION reject_immutable_change();
COMMIT;
