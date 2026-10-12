-- Native D1 qualification schema. Does not upgrade existing PostgreSQL data.
PRAGMA foreign_keys=ON;
CREATE TABLE cf_accounts(id TEXT PRIMARY KEY, credential_version INTEGER NOT NULL CHECK(credential_version>0), disabled INTEGER NOT NULL DEFAULT 0 CHECK(disabled IN(0,1)), verified_at INTEGER);
CREATE TABLE cf_workspaces(organization_id TEXT NOT NULL,id TEXT NOT NULL,PRIMARY KEY(organization_id,id));
CREATE TABLE cf_memberships(organization_id TEXT NOT NULL,workspace_id TEXT NOT NULL,user_id TEXT NOT NULL REFERENCES cf_accounts(id),role TEXT NOT NULL CHECK(role IN('owner','admin','editor','reviewer','viewer')),revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN(0,1)),PRIMARY KEY(organization_id,workspace_id,user_id),FOREIGN KEY(organization_id,workspace_id) REFERENCES cf_workspaces(organization_id,id));
CREATE TABLE cf_sessions(token_hash TEXT PRIMARY KEY CHECK(length(token_hash)=64),user_id TEXT NOT NULL REFERENCES cf_accounts(id),credential_version INTEGER NOT NULL,expires_at INTEGER NOT NULL,revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN(0,1)),mfa_at INTEGER);
CREATE TABLE cf_drafts(organization_id TEXT NOT NULL,workspace_id TEXT NOT NULL,id TEXT NOT NULL,revision INTEGER NOT NULL CHECK(revision>0),document TEXT NOT NULL CHECK(json_valid(document) AND json_type(document)='object'),PRIMARY KEY(organization_id,workspace_id,id),FOREIGN KEY(organization_id,workspace_id) REFERENCES cf_workspaces(organization_id,id));
-- Assertion rows live only within a mutation batch; CHECK aborts unauthorized/stale writes.
CREATE TABLE cf_mutation_guards(id TEXT PRIMARY KEY,valid INTEGER NOT NULL CHECK(valid=1));
CREATE TABLE cf_versions(organization_id TEXT NOT NULL,workspace_id TEXT NOT NULL,id TEXT NOT NULL,revision INTEGER NOT NULL,document TEXT NOT NULL CHECK(json_valid(document)),digest TEXT NOT NULL CHECK(length(digest)=64),actor_id TEXT NOT NULL REFERENCES cf_accounts(id),created_at INTEGER NOT NULL,PRIMARY KEY(organization_id,workspace_id,id,revision),FOREIGN KEY(organization_id,workspace_id,id) REFERENCES cf_drafts(organization_id,workspace_id,id));
CREATE TABLE cf_audit(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL,workspace_id TEXT NOT NULL,actor_id TEXT NOT NULL,action TEXT NOT NULL,resource_id TEXT NOT NULL,created_at INTEGER NOT NULL,FOREIGN KEY(organization_id,workspace_id,actor_id) REFERENCES cf_memberships(organization_id,workspace_id,user_id));
CREATE TABLE cf_outbox(id TEXT PRIMARY KEY,organization_id TEXT NOT NULL,workspace_id TEXT NOT NULL,kind TEXT NOT NULL,payload TEXT NOT NULL CHECK(json_valid(payload)),created_at INTEGER NOT NULL,dispatched_at INTEGER,completed_at INTEGER,FOREIGN KEY(organization_id,workspace_id) REFERENCES cf_workspaces(organization_id,id));
CREATE TABLE cf_job_receipts(event_id TEXT PRIMARY KEY REFERENCES cf_outbox(id),completed_at INTEGER NOT NULL);
CREATE TABLE cf_asset_revisions(organization_id TEXT NOT NULL,workspace_id TEXT NOT NULL,asset_id TEXT NOT NULL,revision INTEGER NOT NULL CHECK(revision>0),object_key TEXT NOT NULL UNIQUE,digest TEXT NOT NULL CHECK(length(digest)=64),byte_size INTEGER NOT NULL CHECK(byte_size BETWEEN 1 AND 8388608),PRIMARY KEY(organization_id,workspace_id,asset_id,revision),FOREIGN KEY(organization_id,workspace_id) REFERENCES cf_workspaces(organization_id,id));
CREATE TRIGGER cf_version_no_update BEFORE UPDATE ON cf_versions BEGIN SELECT RAISE(ABORT,'IMMUTABLE_VERSION'); END;
CREATE TRIGGER cf_version_no_delete BEFORE DELETE ON cf_versions BEGIN SELECT RAISE(ABORT,'IMMUTABLE_VERSION'); END;
CREATE TRIGGER cf_audit_no_update BEFORE UPDATE ON cf_audit BEGIN SELECT RAISE(ABORT,'IMMUTABLE_AUDIT'); END;
CREATE TRIGGER cf_audit_no_delete BEFORE DELETE ON cf_audit BEGIN SELECT RAISE(ABORT,'IMMUTABLE_AUDIT'); END;
CREATE TRIGGER cf_asset_no_update BEFORE UPDATE ON cf_asset_revisions BEGIN SELECT RAISE(ABORT,'IMMUTABLE_ASSET'); END;
CREATE TRIGGER cf_asset_no_delete BEFORE DELETE ON cf_asset_revisions BEGIN SELECT RAISE(ABORT,'IMMUTABLE_ASSET'); END;
