BEGIN;
CREATE TABLE asset_derivatives (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, asset_id uuid NOT NULL, revision integer NOT NULL,
 name text NOT NULL, object_key text NOT NULL UNIQUE, sha256 text NOT NULL, byte_size bigint NOT NULL,
 width integer NOT NULL, height integer NOT NULL,
 PRIMARY KEY(organization_id,workspace_id,asset_id,revision,name),
 FOREIGN KEY(organization_id,workspace_id,asset_id,revision) REFERENCES asset_revisions(organization_id,workspace_id,asset_id,revision)
);
CREATE TABLE asset_reference_bindings (
 organization_id uuid NOT NULL, workspace_id uuid NOT NULL, asset_id uuid NOT NULL, revision integer NOT NULL,
 resource_kind text NOT NULL, resource_id text NOT NULL,
 PRIMARY KEY(organization_id,workspace_id,asset_id,revision,resource_kind,resource_id),
 FOREIGN KEY(organization_id,workspace_id,asset_id,revision) REFERENCES asset_revisions(organization_id,workspace_id,asset_id,revision)
);
CREATE TRIGGER immutable_asset_revisions BEFORE UPDATE OR DELETE ON asset_revisions FOR EACH ROW EXECUTE FUNCTION reject_immutable_change();
CREATE TRIGGER immutable_asset_derivatives BEFORE UPDATE ON asset_derivatives FOR EACH ROW EXECUTE FUNCTION reject_immutable_change();
COMMIT;
