import {idempotentMutation} from '../api-contracts/contracts.mjs';
import {mfaIsFresh} from '../auth-core/policy.mjs';
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
 WHERE m.organization_id=$1 AND m.user_id=$2 AND w.id=$3 AND (to_jsonb(m)->>'revoked_at') IS NULL FOR SHARE OF m,w`,[scope.organizationId,session.user_id,scope.workspaceId]);
 const role=result.rows[0]?.role;
 if(!permissionMatrix[role]?.includes(action))deny();
 // The existing schema has no publisher role. Publishing is admin/owner only.
 // Both privileged roles require MFA for every action, not only publishing.
 const mfaTime=session.mfa_verified_at&&new Date(session.mfa_verified_at).getTime();
 if(['owner','admin'].includes(role)&&(!Number.isFinite(mfaTime)||mfaTime<new Date(session.authenticated_at).getTime()||mfaTime>now.getTime()||!mfaIsFresh(session,{now})))deny('MFA_REQUIRED');
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

/** Revocation retains membership foreign keys/history; each request re-resolves authority. */
export async function changeMembership(db,token,scope,userId,role,options){
 if(!uuid.test(userId)||!(role===null||Object.hasOwn(permissionMatrix,role)))throw new TypeError('Invalid membership change');
 return withAuthorizedWorkspace(db,token,scope,'membership.manage',async(tx,context)=>{
  const mutate=async()=>{
  if(userId===context.userId)deny('SELF_AUTHORITY_CHANGE');
  const current=await tx.query('SELECT role FROM memberships WHERE organization_id=$1 AND user_id=$2 AND revoked_at IS NULL FOR UPDATE',[context.organizationId,userId]);
  if(!current.rows.length)deny();
  if(current.rows[0].role==='owner'||role==='owner')deny('OWNER_TRANSFER_REQUIRED');
  await tx.query('UPDATE memberships SET role=COALESCE($3,role),revoked_at=CASE WHEN $3 IS NULL THEN now() ELSE NULL END WHERE organization_id=$1 AND user_id=$2',[context.organizationId,userId,role]);
  await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,'membership.change',$5,$6::jsonb)`,[randomUUID(),context.organizationId,context.workspaceId,context.userId,userId,JSON.stringify({previousRole:current.rows[0].role,role,revoked:role===null})]);
  return{userId,role,revoked:role===null};
  };
  return options?.idempotencyKey?idempotentMutation(tx,context,options.idempotencyKey,{actorId:context.userId,action:'membership.change',userId,role},mutate):mutate();
 },options);
}
/** Service tokens cannot impersonate a user or acquire membership management. */
export async function withServiceWorkspace(db,token,scope,action,operation,{now=new Date()}={}){
 if(!validScope(scope)||!['asset.read','design.read'].includes(action))deny();
 const hash=sessionTokenHash(token);if(!hash)deny('UNAUTHENTICATED');
 return db.transaction(async tx=>{
  const result=await tx.query(`SELECT id,actions FROM service_identities WHERE token_hash=$1 AND organization_id=$2 AND workspace_id=$3 AND revoked_at IS NULL AND expires_at>$4 FOR SHARE`,[hash,scope.organizationId,scope.workspaceId,now]);
  const service=result.rows[0];if(!service||!service.actions.includes(action))deny();
  return operation(tx,Object.freeze({...scope,serviceId:service.id,action}));
 });
}
export async function createServiceIdentity(db,token,scope,{actions,expiresAt},options){
 if(!Array.isArray(actions)||!actions.length||actions.some(a=>!['asset.read','design.read'].includes(a))||!Number.isFinite(new Date(expiresAt).getTime())||new Date(expiresAt)<=new Date()||new Date(expiresAt)>new Date(Date.now()+86400000*30))throw new TypeError('Invalid service grant');
 const {randomBytes}=await import('node:crypto');const serviceToken=randomBytes(32).toString('base64url'),id=randomUUID();
 return withAuthorizedWorkspace(db,token,scope,'membership.manage',async(tx,c)=>{
  await tx.query('INSERT INTO service_identities(id,organization_id,workspace_id,token_hash,actions,expires_at) VALUES($1,$2,$3,$4,$5::jsonb,$6)',[id,c.organizationId,c.workspaceId,sessionTokenHash(serviceToken),JSON.stringify([...new Set(actions)]),expiresAt]);
  await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,'service.grant',$5,$6::jsonb)`,[randomUUID(),c.organizationId,c.workspaceId,c.userId,id,JSON.stringify({actions,expiresAt})]);
  return{id,token:serviceToken,expiresAt};
 },options);
}
export async function revokeServiceIdentity(db,token,scope,serviceId,options){
 if(!uuid.test(serviceId))throw new TypeError('Invalid service ID');
 return withAuthorizedWorkspace(db,token,scope,'membership.manage',async(tx,c)=>{
  const result=await tx.query('UPDATE service_identities SET revoked_at=now() WHERE organization_id=$1 AND workspace_id=$2 AND id=$3 AND revoked_at IS NULL RETURNING id',[c.organizationId,c.workspaceId,serviceId]);
  if(!result.rows.length)deny();
  await tx.query(`INSERT INTO audit_events(id,organization_id,workspace_id,actor_id,action,resource_id,details) VALUES($1,$2,$3,$4,'service.revoke',$5,'{}')`,[randomUUID(),c.organizationId,c.workspaceId,c.userId,serviceId]);return{revoked:true};
 },options);
}
