import {randomUUID} from 'node:crypto';
import {readSession} from '../auth-core/sessions.mjs';
import {sessionTokenHash} from '../auth-core/credentials.mjs';

// This package is server-only. Roles and identities always come from the DB.
export const permissionMatrix=Object.freeze({
 viewer:Object.freeze(['design.read','asset.read']),
 editor:Object.freeze(['design.read','asset.read','design.edit']),
 reviewer:Object.freeze(['design.read','asset.read','design.review']),
 admin:Object.freeze(['design.read','asset.read','design.edit','design.review','design.publish','membership.manage']),
 owner:Object.freeze(['design.read','asset.read','design.edit','design.review','design.publish','membership.manage'])
});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class AuthorizationError extends Error{
 constructor(code){super(code);this.name='AuthorizationError';this.code=code;this.status=code==='UNAUTHENTICATED'?401:403;}
}
function deny(code='FORBIDDEN'){throw new AuthorizationError(code);}
function validScope(scope){return scope&&uuid.test(scope.organizationId)&&uuid.test(scope.workspaceId);}

async function resolve(tx,token,scope,action,now){
 if(!validScope(scope))deny();
 if(!Object.values(permissionMatrix).some(actions=>actions.includes(action)))deny();
 // Lock the session/account while a trusted transaction is running: concurrent
 // revocation/credential changes wait for this operation to finish.
 const hash=sessionTokenHash(token);if(!hash)deny('UNAUTHENTICATED');
 await tx.query(`SELECT s.token_hash FROM auth_sessions s JOIN auth_accounts a ON a.user_id=s.user_id
 WHERE s.token_hash=$1 FOR SHARE OF s,a`,[hash]);
 const session=await readSession(tx,token,{now});if(!session)deny('UNAUTHENTICATED');
 const result=await tx.query(`SELECT m.role FROM memberships m JOIN workspaces w ON w.organization_id=m.organization_id
 WHERE m.organization_id=$1 AND m.user_id=$2 AND w.id=$3 FOR SHARE OF m,w`,[scope.organizationId,session.user_id,scope.workspaceId]);
 const role=result.rows[0]?.role;
 if(!permissionMatrix[role]?.includes(action))deny();
 // The existing schema has no publisher role. Publishing is admin/owner only.
 // Both privileged roles require MFA for every action, not only publishing.
 const mfaTime=session.mfa_verified_at&&new Date(session.mfa_verified_at).getTime();
 if(['owner','admin'].includes(role)&&(!Number.isFinite(mfaTime)||mfaTime<new Date(session.authenticated_at).getTime()||mfaTime>now.getTime()))deny('MFA_REQUIRED');
 return Object.freeze({userId:session.user_id,organizationId:scope.organizationId,workspaceId:scope.workspaceId,role,action});
}

/** Callback is trusted server code, never supplied by a request/browser. */
export async function withAuthorizedWorkspace(db,token,scope,action,operation,{now=new Date()}={}){
 if(typeof operation!=='function'||!Number.isFinite(now.getTime()))throw new TypeError('Valid server operation and time required');
 return db.transaction(async tx=>{
  const context=await resolve(tx,token,scope,action,now);
  return operation(tx,context);
 });
}
export async function authorizeWorkspace(db,token,scope,action,options){
 return withAuthorizedWorkspace(db,token,scope,action,(_tx,context)=>context,options);
}
const resources=Object.freeze({draft:{table:'design_drafts',action:'design.read'},version:{table:'design_versions',action:'design.read'},asset:{table:'assets',action:'asset.read'}});
export async function readWorkspaceResource(db,token,scope,kind,resourceId,options){
 const resource=resources[kind];if(!resource||!uuid.test(resourceId))deny();
 return withAuthorizedWorkspace(db,token,scope,resource.action,async(tx,context)=>{
  const result=await tx.query(`SELECT * FROM ${resource.table} WHERE organization_id=$1 AND workspace_id=$2 AND id=$3`,[context.organizationId,context.workspaceId,resourceId]);
  return result.rows[0]??null;
 },options);
}
/** Scoped, version-checked update and audit append commit or roll back together. */
export async function updateDesignDraft(db,token,scope,draftId,config,expectedRevision,options){
 if(!uuid.test(draftId)||!config||typeof config!=='object'||Array.isArray(config)||!Number.isInteger(expectedRevision)||expectedRevision<1)throw new TypeError('Invalid draft update');
 const serialized=JSON.stringify(config);
 return withAuthorizedWorkspace(db,token,scope,'design.edit',async(tx,context)=>{
  const result=await tx.query(`UPDATE design_drafts SET config=$4::jsonb,revision=revision+1,updated_by=$5,updated_at=now()
 WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 AND revision=$6 RETURNING *`,[context.organizationId,context.workspaceId,draftId,serialized,context.userId,expectedRevision]);
  if(!result.rows.length)return null; // absent or stale; no cross-tenant existence disclosure
  await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details)
 VALUES($1,$2,$3,$4,'design.edit',$5,$6::jsonb)`,[randomUUID(),context.organizationId,context.workspaceId,context.userId,draftId,JSON.stringify({previousRevision:expectedRevision,revision:result.rows[0].revision})]);
  return result.rows[0];
 },options);
}
