-- Optional bridge: run only after NEVO User and ALLB tables coexist in one DB.
-- Mapping mutations require a privileged, audited server provisioning workflow.
CREATE TABLE nevo_identity_links (
 allb_user_id uuid NOT NULL REFERENCES identities(id),
 allb_organization_id uuid NOT NULL REFERENCES organizations(id),
 allb_workspace_id uuid NOT NULL,
 nevo_user_id text NOT NULL REFERENCES "User"(id),
 nevo_organization_id text NOT NULL REFERENCES "Organization"(id),
 disabled_at timestamptz,
 PRIMARY KEY (allb_user_id,allb_organization_id,allb_workspace_id),
 FOREIGN KEY(allb_organization_id,allb_workspace_id) REFERENCES workspaces(organization_id,id),
 FOREIGN KEY(allb_organization_id,allb_user_id) REFERENCES memberships(organization_id,user_id)
);
